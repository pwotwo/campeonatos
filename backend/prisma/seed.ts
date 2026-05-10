import 'dotenv/config'
import { PrismaClient, UserRole, ChampionshipFormat, ChampionshipStatus, EnrollmentStatus, MatchStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A popular a base de dados...')

  // 1. Criar Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campeonatos.com' },
    update: {
      password: adminPassword,
      full_name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      is_active: true
    },
    create: {
      email: 'admin@campeonatos.com',
      password: adminPassword,
      full_name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      is_active: true
    }
  })
  console.log('✅ Admin criado:', admin.email)

  // 2. Criar Campeonato
  const existingChampionship = await prisma.championship.findFirst({
    where: {
      name: 'Liga Nacional 2026',
      season: '2026'
    }
  })

  const championship = existingChampionship ?? await prisma.championship.create({
    data: {
      name: 'Liga Nacional 2026',
      description: 'Campeonato nacional de futebol',
      sport_type: 'Futebol',
      format: ChampionshipFormat.LEAGUE,
      season: '2026',
      status: ChampionshipStatus.OPEN,
      start_date: new Date('2026-03-01'),
      end_date: new Date('2026-08-01'),
      max_teams: 8,
      organizer_id: admin.id
    }
  })
  console.log('✅ Campeonato criado:', championship.name)

  const enrolledTeams = await prisma.championshipTeam.count({
    where: { championship_id: championship.id }
  })

  // 3. Criar 4 Equipas com Jogadores
  for (let t = enrolledTeams; t < 4; t++) {
    const manager = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await bcrypt.hash('manager123', 10),
        full_name: faker.person.fullName(),
        role: UserRole.TEAM_MANAGER,
        is_active: true
      }
    })

    const team = await prisma.team.create({
      data: {
        name: faker.company.name() + ' FC',
        short_name: faker.string.alpha({ length: 3 }).toUpperCase(),
        city: faker.location.city(),
        founded_year: faker.number.int({ min: 1900, max: 2000 }),
        manager_id: manager.id
      }
    })

    // 5 Jogadores por equipa
    for (let p = 0; p < 5; p++) {
      await prisma.player.create({
        data: {
          full_name: faker.person.fullName(),
          birth_date: faker.date.birthdate({ min: 18, max: 35, mode: 'age' }),
          position: faker.helpers.arrayElement(['Guarda-redes', 'Defesa', 'Médio', 'Avançado']),
          jersey_number: p + 1,
          nationality: faker.location.country(),
          team_id: team.id
        }
      })
    }

    // Inscrever equipa no campeonato
    await prisma.championshipTeam.create({
      data: {
        championship_id: championship.id,
        team_id: team.id,
        status: EnrollmentStatus.APPROVED
      }
    })

    console.log('✅ Equipa criada:', team.name)
  }

  await createDemoSchedule(championship.id)

  console.log('🎉 Base de dados populada com sucesso!')
}

async function createDemoSchedule(championshipId: string) {
  const enrollments = await prisma.championshipTeam.findMany({
    where: {
      championship_id: championshipId,
      status: EnrollmentStatus.APPROVED
    },
    include: { team: true },
    orderBy: { enrolled_at: 'asc' }
  })

  const teams = enrollments.map((enrollment) => enrollment.team)
  if (teams.length < 4) {
    console.log('ℹ️ São necessárias pelo menos 4 equipas para criar calendário demo.')
    return
  }

  for (const team of teams) {
    await prisma.standing.upsert({
      where: {
        championship_id_team_id: {
          championship_id: championshipId,
          team_id: team.id
        }
      },
      create: {
        championship_id: championshipId,
        team_id: team.id
      },
      update: {}
    })
  }

  const existingMatches = await prisma.match.count({
    where: { championship_id: championshipId }
  })

  if (existingMatches > 0) {
    console.log('ℹ️ Calendário demo já existe.')
    return
  }

  const fixtures = [
    { home: 0, away: 1, round: 1, homeScore: 2, awayScore: 1 },
    { home: 2, away: 3, round: 1, homeScore: 0, awayScore: 0 },
    { home: 0, away: 2, round: 2, homeScore: 1, awayScore: 3 },
    { home: 1, away: 3, round: 2 },
    { home: 0, away: 3, round: 3 },
    { home: 1, away: 2, round: 3 }
  ]

  for (let index = 0; index < fixtures.length; index++) {
    const fixture = fixtures[index]
    const isFinished = fixture.homeScore !== undefined && fixture.awayScore !== undefined
    const homeTeam = teams[fixture.home]
    const awayTeam = teams[fixture.away]

    if (!homeTeam || !awayTeam) continue

    await prisma.match.create({
      data: {
        championship_id: championshipId,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        round: fixture.round,
        scheduled_at: new Date(Date.UTC(2026, 2, 8 + index, 18, 30)),
        venue: `Campo ${fixture.round}`,
        status: isFinished ? MatchStatus.FINISHED : MatchStatus.SCHEDULED,
        home_score: fixture.homeScore,
        away_score: fixture.awayScore
      }
    })

    if (isFinished) {
      await applyResult(championshipId, homeTeam.id, fixture.homeScore!, fixture.awayScore!)
      await applyResult(championshipId, awayTeam.id, fixture.awayScore!, fixture.homeScore!)
    }
  }

  console.log('✅ Calendário e classificações demo criados.')
}

async function applyResult(championshipId: string, teamId: string, goalsFor: number, goalsAgainst: number) {
  const won = goalsFor > goalsAgainst
  const drawn = goalsFor === goalsAgainst

  await prisma.standing.update({
    where: {
      championship_id_team_id: {
        championship_id: championshipId,
        team_id: teamId
      }
    },
    data: {
      played: { increment: 1 },
      wins: { increment: won ? 1 : 0 },
      draws: { increment: drawn ? 1 : 0 },
      losses: { increment: !won && !drawn ? 1 : 0 },
      goals_for: { increment: goalsFor },
      goals_against: { increment: goalsAgainst },
      points: { increment: won ? 3 : drawn ? 1 : 0 }
    }
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
