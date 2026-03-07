import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function register(email: string, password: string, full_name: string) {
  // Verificar se o email já existe
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('Email já está em uso')
  }

  // Encriptar a senha
  const hashed = await bcrypt.hash(password, 10)

  // Criar o utilizador
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      full_name,
    }
  })

  // Retornar sem a senha
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function login(email: string, password: string) {
  // Buscar o utilizador
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Credenciais inválidas')
  }

  // Verificar a senha
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new Error('Credenciais inválidas')
  }

  // Gerar o token JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )

  // Retornar token e utilizador sem senha
  const { password: _, ...userWithoutPassword } = user
  return { token, user: userWithoutPassword }
}