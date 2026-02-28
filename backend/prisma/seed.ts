import { PrismaClient, UserRole, ChampionshipFormat, ChampionshipStatus, EnrollmentStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A popular a base de dados...')

  // 1. Criar Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@campeonatos.com',
      password: await bcrypt.hash('admin123', 10),
      full_name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      is_active: true
    }
  })
  console.log('✅ Admin criado:', admin.email)

  // 2. Criar Campeonato
  const championship = await prisma.championship.create({
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

  // 3. Criar 4 Equipas com Jogadores
  for (let t = 0; t < 4; t++) {
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

  console.log('🎉 Base de dados populada com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())