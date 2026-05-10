import { MatchStatus, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TeamStanding {
  championship_id: string
  team_id: string
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

function emptyStanding(championshipId: string, teamId: string): TeamStanding {
  return {
    championship_id: championshipId,
    team_id: teamId,
    points: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0
  }
}

function applyMatchResult(standing: TeamStanding, goalsFor: number, goalsAgainst: number) {
  standing.played += 1
  standing.goals_for += goalsFor
  standing.goals_against += goalsAgainst

  if (goalsFor > goalsAgainst) {
    standing.wins += 1
    standing.points += 3
  } else if (goalsFor === goalsAgainst) {
    standing.draws += 1
    standing.points += 1
  } else {
    standing.losses += 1
  }
}

export async function recalculate(championshipId: string) {
  const [enrollments, finishedMatches] = await Promise.all([
    prisma.championshipTeam.findMany({
      where: {
        championship_id: championshipId,
        status: 'APPROVED'
      },
      select: { team_id: true }
    }),
    prisma.match.findMany({
      where: {
        championship_id: championshipId,
        status: MatchStatus.FINISHED
      },
      select: {
        home_team_id: true,
        away_team_id: true,
        home_score: true,
        away_score: true
      }
    })
  ])

  const standings = new Map<string, TeamStanding>()

  for (const enrollment of enrollments) {
    standings.set(enrollment.team_id, emptyStanding(championshipId, enrollment.team_id))
  }

  for (const match of finishedMatches) {
    const homeScore = match.home_score ?? 0
    const awayScore = match.away_score ?? 0

    if (!standings.has(match.home_team_id)) {
      standings.set(match.home_team_id, emptyStanding(championshipId, match.home_team_id))
    }
    if (!standings.has(match.away_team_id)) {
      standings.set(match.away_team_id, emptyStanding(championshipId, match.away_team_id))
    }

    applyMatchResult(standings.get(match.home_team_id)!, homeScore, awayScore)
    applyMatchResult(standings.get(match.away_team_id)!, awayScore, homeScore)
  }

  const data = Array.from(standings.values())

  await prisma.$transaction([
    prisma.standing.deleteMany({ where: { championship_id: championshipId } }),
    ...(data.length > 0 ? [prisma.standing.createMany({ data })] : [])
  ])

  return {
    teams: data.length,
    matches: finishedMatches.length
  }
}
