import { Router } from 'express'
import * as championshipController from '../controllers/championship.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

// GET /api/championships — listar todos (público)
router.get('/', championshipController.getAll)

// GET /api/championships/:id — detalhes (público)
router.get('/:id', championshipController.getById)

// POST /api/championships — criar (autenticado)
router.post('/', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.create)

// PUT /api/championships/:id — atualizar (autenticado)
router.put('/:id', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.update)

// PATCH /api/championships/:id/publish — publicar (autenticado)
router.patch('/:id/publish', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.publish)

// POST /api/championships/:id/generate-schedule — gerar calendário (autenticado)
router.post('/:id/generate-schedule', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.generateSchedule)

// GET /api/championships/:id/standings — classificações (público)
router.get('/:id/standings', championshipController.getStandings)

// GET /api/championships/:id/rankings — rankings (público)
router.get('/:id/rankings', championshipController.getRankings)

// GET /api/championships/:id/enrollments — inscrições (autenticado)
router.get('/:id/enrollments', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.getEnrollments)

// PATCH /api/championships/:id/enrollments/:enrollmentId — aprovar/rejeitar inscrição (autenticado)
router.patch('/:id/enrollments/:enrollmentId', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.updateEnrollmentStatus)

// POST /api/championships/:id/standings/recalculate — recalcular classificações (autenticado)
router.post('/:id/standings/recalculate', authenticate, requireRole('SUPER_ADMIN', 'CHAMPIONSHIP_ADMIN'), championshipController.recalculateStandings)

export default router
