import { PrismaClient, MatchStatus, SanctionType } from '@prisma/client'

const prisma = new PrismaClient()

// Listar jogos
export async function getAll(championship_id?: string) {
  return prisma.match.findMany({
    where: championship_id ? { championship_id } : {},
    include: {
      home_team: { select: { name: true, short_name: true } },
      away_team: { select: { name: true, short_name: true } },
      referee: { select: { full_name: true } }
    },
    orderBy: { scheduled_at: 'asc' }
  })
}

// Buscar jogo por ID
export async function getById(id: string) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      home_team: true,
      away_team: true,
      referee: { select: { full_name: true } },
      events: {
        include: {
          player: { select: { full_name: true, jersey_number: true } },
          team: { select: { name: true } }
        },
        orderBy: { minute: 'asc' }
      }
    }
  })
  if (!match) throw new Error('Jogo não encontrado')
  return match
}

// Criar jogo
export async function create(data: any) {
  return prisma.match.create({
    data: {
      ...data,
      scheduled_at: new Date(data.scheduled_at)
    }
  })
}

// Iniciar jogo
export async function start(id: string) {
  return prisma.match.update({
    where: { id },
    data: { status: MatchStatus.ONGOING }
  })
}

// Registar evento
export async function addEvent(match_id: string, data: any) {
  const match = await prisma.match.findUnique({ where: { id: match_id } })
  if (!match) throw new Error('Jogo não encontrado')
  if (match.status !== MatchStatus.ONGOING) throw new Error('Jogo não está em curso')

  // Criar o evento
  const event = await prisma.matchEvent.create({
    data: { ...data, match_id }
  })

  // Se for golo, atualizar o score
  if (data.type === 'GOAL') {
    const isHome = data.team_id === match.home_team_id
    
    const currentMatch = await prisma.match.findUnique({ where: { id: match_id } })
    
    await prisma.match.update({
      where: { id: match_id },
      data: isHome
        ? { home_score: (currentMatch?.home_score ?? 0) + 1 }
        : { away_score: (currentMatch?.away_score ?? 0) + 1 }
    })
  }

  // Se for cartão vermelho, criar suspensão
  if (data.type === 'RED_CARD') {
    await prisma.sanction.create({
      data: {
        type: SanctionType.RED_CARD,
        games_suspended: 1,
        reason: 'Cartão vermelho direto',
        player_id: data.player_id,
        match_id
      }
    })
  }

  return event
}

// Finalizar jogo e atualizar standings
export async function finish(id: string) {
  const match = await prisma.match.findUnique({ where: { id } })
  if (!match) throw new Error('Jogo não encontrado')

  const homeScore = match.home_score ?? 0
  const awayScore = match.away_score ?? 0

  // Atualizar status e garantir scores não nulos
  const updated = await prisma.match.update({
    where: { id },
    data: {
      status: MatchStatus.FINISHED,
      home_score: homeScore,
      away_score: awayScore
    }
  })

  const homeWin = homeScore > awayScore
  const awayWin = awayScore > homeScore
  const draw = homeScore === awayScore

  // Atualizar standings
  await updateStanding(match.championship_id, match.home_team_id, homeScore, awayScore, homeWin, draw)
  await updateStanding(match.championship_id, match.away_team_id, awayScore, homeScore, awayWin, draw)

  return updated
}

async function updateStanding(
  championship_id: string,
  team_id: string,
  goalsFor: number,
  goalsAgainst: number,
  win: boolean,
  draw: boolean
) {
  const points = win ? 3 : draw ? 1 : 0

  await prisma.standing.upsert({
    where: { championship_id_team_id: { championship_id, team_id } },
    create: {
      championship_id,
      team_id,
      played: 1,
      wins: win ? 1 : 0,
      draws: draw ? 1 : 0,
      losses: !win && !draw ? 1 : 0,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      points
    },
    update: {
      played: { increment: 1 },
      wins: { increment: win ? 1 : 0 },
      draws: { increment: draw ? 1 : 0 },
      losses: { increment: !win && !draw ? 1 : 0 },
      goals_for: { increment: goalsFor },
      goals_against: { increment: goalsAgainst },
      points: { increment: points }
    }
  })
}