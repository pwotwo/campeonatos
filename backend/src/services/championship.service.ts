import { PrismaClient, ChampionshipStatus } from '@prisma/client'

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
          select: { enrollments: true }
        }
      }
    }),
    prisma.championship.count()
  ])
  return { data, total, page, limit }
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