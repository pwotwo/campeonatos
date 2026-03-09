import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Listar todas as equipas
export async function getAll() {
  return prisma.team.findMany({
    include: {
      manager: {
        select: { full_name: true, email: true }
      },
      _count: {
        select: { players: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

// Buscar equipa por ID
export async function getById(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      manager: {
        select: { full_name: true, email: true }
      },
      players: true
    }
  })
  if (!team) throw new Error('Equipa não encontrada')
  return team
}

// Criar equipa
export async function create(data: any, manager_id: string) {
  return prisma.team.create({
    data: { ...data, manager_id }
  })
}

// Atualizar equipa
export async function update(id: string, data: any) {
  return prisma.team.update({
    where: { id },
    data
  })
}

// Adicionar jogador à equipa
export async function addPlayer(team_id: string, data: any) {
  return prisma.player.create({
    data: {
      ...data,
      birth_date: new Date(data.birth_date),
      team_id
    }
  })
}

// Listar jogadores de uma equipa
export async function getPlayers(team_id: string) {
  return prisma.player.findMany({
    where: { team_id },
    orderBy: { jersey_number: 'asc' }
  })
}

// Inscrever equipa num campeonato
export async function enroll(championship_id: string, team_id: string) {
  const existing = await prisma.championshipTeam.findUnique({
    where: { championship_id_team_id: { championship_id, team_id } }
  })
  if (existing) throw new Error('Equipa já inscrita neste campeonato')

  const championship = await prisma.championship.findUnique({
    where: { id: championship_id },
    include: { _count: { select: { enrollments: true } } }
  })
  if (!championship) throw new Error('Campeonato não encontrado')
  if (championship.status !== 'OPEN') throw new Error('Campeonato não está aberto a inscrições')
  if (championship._count.enrollments >= championship.max_teams) throw new Error('Campeonato já atingiu o número máximo de equipas')

  return prisma.championshipTeam.create({
    data: { championship_id, team_id }
  })
}