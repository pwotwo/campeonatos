import { ChampionshipStatus, EnrollmentStatus, EventType, PrismaClient } from '@prisma/client'
import * as standingService from './standing.service'

const prisma = new PrismaClient()

// Listar todos os campeonatos
export async function getAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    prisma.championship.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        organizer: {
          select: { full_name: true, email: true }
        },
        _count: {
          select: { enrollments: true, matches: true }
        }
      }
    }),
    prisma.championship.count()
  ])
  const approvedCounts = await prisma.championshipTeam.groupBy({
    by: ['championship_id'],
    where: {
      championship_id: { in: data.map((championship) => championship.id) },
      status: 'APPROVED'
    },
    _count: { championship_id: true }
  })
  const approvedByChampionship = new Map(
    approvedCounts.map((count) => [count.championship_id, count._count.championship_id])
  )

  return {
    data: data.map((championship) => ({
      ...championship,
      approved_teams: approvedByChampionship.get(championship.id) ?? 0
    })),
    total,
    page,
    limit
  }
}

// Buscar campeonato por ID
export async function getById(id: string) {
  const championship = await prisma.championship.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { full_name: true, email: true }
      },
      enrollments: {
        include: {
          team: true
        }
      }
    }
  })
  if (!championship) throw new Error('Campeonato não encontrado')
  return championship
}

// Criar campeonato
export async function create(data: any, organizer_id: string) {
  return prisma.championship.create({
    data: {
      ...data,
      organizer_id,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date)
    }
  })
}

// Atualizar campeonato
export async function update(id: string, data: any) {
  return prisma.championship.update({
    where: { id },
    data
  })
}

// Publicar campeonato
export async function publish(id: string) {
  return prisma.championship.update({
    where: { id },
    data: { status: ChampionshipStatus.OPEN }
  })
}

// Gerar calendário round-robin para equipas aprovadas
export async function generateSchedule(id: string) {
  const championship = await prisma.championship.findUnique({
    where: { id },
    include: {
      enrollments: {
        where: { status: 'APPROVED' },
        include: { team: true },
        orderBy: { enrolled_at: 'asc' }
      },
      _count: { select: { matches: true } }
    }
  })

  if (!championship) throw new Error('Campeonato não encontrado')
  if (championship._count.matches > 0) throw new Error('Calendário já foi gerado')

  const teams = championship.enrollments.map((enrollment) => enrollment.team)
  if (teams.length < 2) throw new Error('São necessárias pelo menos 2 equipas aprovadas')

  const startDate = new Date(championship.start_date)
  const matches = []

  for (let homeIndex = 0; homeIndex < teams.length; homeIndex++) {
    for (let awayIndex = homeIndex + 1; awayIndex < teams.length; awayIndex++) {
      const scheduledAt = new Date(startDate)
      scheduledAt.setDate(startDate.getDate() + matches.length * 7)
      scheduledAt.setHours(18, 30, 0, 0)

      matches.push({
        championship_id: id,
        home_team_id: teams[homeIndex]!.id,
        away_team_id: teams[awayIndex]!.id,
        round: matches.length + 1,
        scheduled_at: scheduledAt,
        venue: 'Campo principal'
      })
    }
  }

  await prisma.$transaction([
    ...teams.map((team) =>
      prisma.standing.upsert({
        where: {
          championship_id_team_id: {
            championship_id: id,
            team_id: team.id
          }
        },
        create: {
          championship_id: id,
          team_id: team.id
        },
        update: {}
      })
    ),
    prisma.match.createMany({ data: matches }),
    prisma.championship.update({
      where: { id },
      data: { status: ChampionshipStatus.ONGOING }
    })
  ])

  return {
    matches_created: matches.length,
    teams: teams.length
  }
}

// Buscar classificações do campeonato
export async function getStandings(championship_id: string) {
  return prisma.standing.findMany({
    where: { championship_id },
    include: {
      team: {
        select: { name: true, short_name: true, badge_url: true }
      }
    },
    orderBy: [
      { points: 'desc' },
      { wins: 'desc' },
      { goals_for: 'desc' }
    ]
  })
}

export async function getEnrollments(championship_id: string) {
  return prisma.championshipTeam.findMany({
    where: { championship_id },
    include: {
      team: {
        include: {
          manager: {
            select: { full_name: true, email: true }
          },
          _count: {
            select: { players: true }
          }
        }
      }
    },
    orderBy: { enrolled_at: 'desc' }
  })
}

export async function updateEnrollmentStatus(enrollment_id: string, status: EnrollmentStatus) {
  const enrollment = await prisma.championshipTeam.findUnique({
    where: { id: enrollment_id },
    include: { championship: true }
  })

  if (!enrollment) throw new Error('Inscrição não encontrada')
  if (!Object.values(EnrollmentStatus).includes(status)) throw new Error('Estado inválido')
  if (enrollment.championship.status !== ChampionshipStatus.OPEN) {
    throw new Error('Só é possível alterar inscrições em campeonatos abertos')
  }

  return prisma.championshipTeam.update({
    where: { id: enrollment_id },
    data: { status },
    include: { team: true }
  })
}

export async function getRankings(championship_id: string) {
  const events = await prisma.matchEvent.findMany({
    where: {
      match: { championship_id },
      type: { in: [EventType.GOAL, EventType.YELLOW_CARD, EventType.RED_CARD] }
    },
    include: {
      player: {
        select: {
          id: true,
          full_name: true,
          jersey_number: true,
          team: { select: { name: true, short_name: true } }
        }
      }
    }
  })

  const byPlayer = new Map<string, {
    player_id: string
    full_name: string
    jersey_number: number
    team: { name: string; short_name: string }
    goals: number
    yellow_cards: number
    red_cards: number
  }>()

  for (const event of events) {
    const current = byPlayer.get(event.player.id) ?? {
      player_id: event.player.id,
      full_name: event.player.full_name,
      jersey_number: event.player.jersey_number,
      team: event.player.team,
      goals: 0,
      yellow_cards: 0,
      red_cards: 0
    }

    if (event.type === EventType.GOAL) current.goals += 1
    if (event.type === EventType.YELLOW_CARD) current.yellow_cards += 1
    if (event.type === EventType.RED_CARD) current.red_cards += 1

    byPlayer.set(event.player.id, current)
  }

  const players = Array.from(byPlayer.values())

  return {
    scorers: [...players]
      .filter((player) => player.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.full_name.localeCompare(b.full_name)),
    discipline: [...players]
      .filter((player) => player.yellow_cards > 0 || player.red_cards > 0)
      .sort((a, b) => b.red_cards - a.red_cards || b.yellow_cards - a.yellow_cards || a.full_name.localeCompare(b.full_name))
  }
}

// Recalcular classificações a partir dos jogos finalizados
export async function recalculateStandings(championship_id: string) {
  const championship = await prisma.championship.findUnique({
    where: { id: championship_id },
    select: { id: true }
  })

  if (!championship) throw new Error('Campeonato não encontrado')

  return standingService.recalculate(championship_id)
}
