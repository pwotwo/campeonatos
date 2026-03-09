import { Router } from 'express'
import * as matchController from '../controllers/match.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// GET /api/matches — listar jogos (público)
router.get('/', matchController.getAll)

// GET /api/matches/:id — detalhes do jogo (público)
router.get('/:id', matchController.getById)

// POST /api/matches — criar jogo (autenticado)
router.post('/', authenticate, matchController.create)

// PATCH /api/matches/:id/start — iniciar jogo (autenticado)
router.patch('/:id/start', authenticate, matchController.start)

// POST /api/matches/:id/events — registar evento (autenticado)
router.post('/:id/events', authenticate, matchController.addEvent)

// PATCH /api/matches/:id/finish — finalizar jogo (autenticado)
router.patch('/:id/finish', authenticate, matchController.finish)

export default router