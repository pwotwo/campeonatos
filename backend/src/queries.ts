import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  // 1. Buscar todos os utilizadores
  const users = await prisma.user.findMany()
  console.log('👤 Utilizadores:', users.length)

  // 2. Buscar campeonato com equipas inscritas
  const championship = await prisma.championship.findFirst({
    include: {
      enrollments: {
        include: {
          team: true
        }
      }
    }
  })
  console.log('🏆 Campeonato:', championship?.name)
  console.log('⚽ Equipas inscritas:', championship?.enrollments.length)

  // 3. Buscar jogadores de uma equipa
  const teams = await prisma.team.findMany({
    include: {
      players: true
    }
  })
  teams.forEach(team => {
    console.log(`👥 ${team.name}: ${team.players.length} jogadores`)
  })

  // 4. Buscar utilizadores por role
  const managers = await prisma.user.findMany({
    where: {
      role: 'TEAM_MANAGER'
    },
    select: {
      full_name: true,
      email: true
    }
  })
  console.log('\n👔 Managers:')
  managers.forEach(m => console.log(' -', m.full_name, m.email))

  // 5. Contar equipas por campeonato
  const count = await prisma.championshipTeam.count({
    where: {
      championship_id: championship!.id
    }
  })
  console.log('\n📊 Total equipas no campeonato:', count)

  // 6. Equipa com mais jogadores
  const teamsWithCount = await prisma.team.findMany({
    include: {
      _count: {
        select: { players: true }
      }
    },
    orderBy: {
      players: {
        _count: 'desc'
      }
    },
    take: 1
  })
  console.log('\n🥇 Equipa com mais jogadores:', teamsWithCount[0]?.name)

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())