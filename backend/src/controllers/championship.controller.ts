import { Request, Response } from 'express'
import { z } from 'zod'
import * as championshipService from '../services/championship.service'

const championshipSchema = z.object({
  name: z.string().min(3, 'Nome deve ter mínimo 3 caracteres'),
  description: z.string().optional(),
  sport_type: z.string().min(1, 'Modalidade obrigatória'),
  format: z.enum(['LEAGUE', 'CUP', 'MIXED']),
  season: z.string().min(1, 'Época obrigatória'),
  start_date: z.string(),
  end_date: z.string(),
  max_teams: z.number().min(2, 'Mínimo 2 equipas')
})

export async function getAll(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const result = await championshipService.getAll(page, limit)
    res.json({ success: true, ...result })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const championship = await championshipService.getById(id)
    res.json({ success: true, championship })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const data = championshipSchema.parse(req.body)
    const organizer_id = (req as any).user.id
    const championship = await championshipService.create(data, organizer_id)
    res.status(201).json({ success: true, championship })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const championship = await championshipService.update(id, req.body)
    res.json({ success: true, championship })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function publish(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const championship = await championshipService.publish(id)
    res.json({ success: true, championship })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

