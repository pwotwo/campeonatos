import { Router } from 'express'
import * as teamController from '../controllers/team.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// GET /api/teams — listar todas as equipas (público)
router.get('/', teamController.getAll)

// GET /api/teams/:id — detalhes da equipa (público)
router.get('/:id', teamController.getById)

// POST /api/teams — criar equipa (autenticado)
router.post('/', authenticate, teamController.create)

// PUT /api/teams/:id — atualizar equipa (autenticado)
router.put('/:id', authenticate, teamController.update)

// GET /api/teams/:id/players — listar jogadores (público)
router.get('/:id/players', teamController.getPlayers)

// POST /api/teams/:id/players — adicionar jogador (autenticado)
router.post('/:id/players', authenticate, teamController.addPlayer)

// POST /api/teams/:id/enroll — inscrever no campeonato (autenticado)
router.post('/:id/enroll', authenticate, teamController.enroll)

export default router