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

// POST /api/championships/:id/generate-schedule — gerar calendário (autenticado)
router.post('/:id/generate-schedule', authenticate, championshipController.generateSchedule)

// GET /api/championships/:id/standings — classificações (público)
router.get('/:id/standings', championshipController.getStandings)

// GET /api/championships/:id/rankings — rankings (público)
router.get('/:id/rankings', championshipController.getRankings)

// GET /api/championships/:id/enrollments — inscrições (autenticado)
router.get('/:id/enrollments', authenticate, championshipController.getEnrollments)

// PATCH /api/championships/:id/enrollments/:enrollmentId — aprovar/rejeitar inscrição (autenticado)
router.patch('/:id/enrollments/:enrollmentId', authenticate, championshipController.updateEnrollmentStatus)

// POST /api/championships/:id/standings/recalculate — recalcular classificações (autenticado)
router.post('/:id/standings/recalculate', authenticate, championshipController.recalculateStandings)

export default router
