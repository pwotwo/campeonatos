import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(helmet())
app.use(express.json())

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

