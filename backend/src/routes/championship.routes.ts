import { Router } from 'express'
import * as championshipController from '../controllers/championship.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// GET /api/championships — listar todos (público)
router.get('/', championshipController.getAll)

// GET /api/championships/:id — detalhes (público)
router.get('/:id', championshipController.getById)

// POST /api/championships — criar (autenticado)
router.post('/', authenticate, championshipController.create)

// PUT /api/championships/:id — atualizar (autenticado)
router.put('/:id', authenticate, championshipController.update)

// PATCH /api/championships/:id/publish — publicar (autenticado)
router.patch('/:id/publish', authenticate, championshipController.publish)

export default router