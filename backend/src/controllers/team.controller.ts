import { Request, Response } from 'express'
import { z } from 'zod'
import * as teamService from '../services/team.service'

const teamSchema = z.object({
  name: z.string().min(2, 'Nome deve ter mínimo 2 caracteres'),
  short_name: z.string().min(2).max(4, 'Abreviatura deve ter 2-4 caracteres'),
  city: z.string().min(2, 'Cidade obrigatória'),
  founded_year: z.number().min(1800).max(2026),
  badge_url: z.string().optional()
})

const playerSchema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  birth_date: z.string(),
  position: z.string().optional(),
  jersey_number: z.number().min(1).max(99),
  nationality: z.string().optional(),
  photo_url: z.string().optional()
})

export async function getAll(req: Request, res: Response) {
  try {
    const teams = await teamService.getAll()
    res.json({ success: true, teams })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const team = await teamService.getById(id)
    res.json({ success: true, team })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const data = teamSchema.parse(req.body)
    const manager_id = (req as any).user.id
    const team = await teamService.create(data, manager_id)
    res.status(201).json({ success: true, team })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const team = await teamService.update(id, req.body)
    res.json({ success: true, team })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function addPlayer(req: Request, res: Response) {
  try {
    const team_id = req.params['id'] as string
    const data = playerSchema.parse(req.body)
    const player = await teamService.addPlayer(team_id, data)
    res.status(201).json({ success: true, player })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function getPlayers(req: Request, res: Response) {
  try {
    const team_id = req.params['id'] as string
    const players = await teamService.getPlayers(team_id)
    res.json({ success: true, players })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export async function enroll(req: Request, res: Response) {
  try {
    const team_id = req.params['id'] as string
    const { championship_id } = req.body
    const enrollment = await teamService.enroll(championship_id, team_id)
    res.status(201).json({ success: true, enrollment })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}