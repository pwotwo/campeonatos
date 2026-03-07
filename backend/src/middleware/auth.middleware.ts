import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  console.log('🔍 Headers recebidos:', req.headers)
  
  const authHeader = req.headers['authorization']
  console.log('🔑 Auth header:', authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]
  console.log('🎫 Token:', token)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    ;(req as any).user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Sem permissão' })
    }
    next()
  }
}