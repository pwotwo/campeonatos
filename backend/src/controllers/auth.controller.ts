import { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from '../services/auth.service'

// Schema de validação do registo
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password deve ter mínimo 6 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter mínimo 2 caracteres')
})

// Schema de validação do login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password obrigatória')
})

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body)
    const user = await authService.register(data.email, data.password, data.full_name)
    res.status(201).json({ success: true, user })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data.email, data.password)
    res.json({ success: true, ...result })
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message })
  }
}