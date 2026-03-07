import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import { authenticate } from './middleware/auth.middleware'

dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(helmet())
app.use(express.json())

// Rotas
app.use('/api/auth', authRoutes)

// Rota protegida de teste
app.get('/api/me', authenticate, (req, res) => {
  res.json({ success: true, user: (req as any).user })
})

// Rota de teste
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor a funcionar!',
    timestamp: new Date()
  })
})

// Arrancar o servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`)
})

