import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Erro:', err.message)

  // Erro de validação do Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.errors
    })
  }

  // Erro do Prisma — registo não encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registo não encontrado'
    })
  }

  // Erro do Prisma — violação de unique
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Registo já existe'
    })
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  })
}