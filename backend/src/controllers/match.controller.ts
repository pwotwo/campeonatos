import { Request, Response } from 'express'
import { z } from 'zod'
import * as matchService from '../services/match.service'

const matchSchema = z.object({
  championship_id: z.string(),
  round: z.number().min(1),
  home_team_id: z.string(),
  away_team_id: z.string(),
  scheduled_at: z.string(),
  venue: z.string().optional(),
  referee_id: z.string().optional()
})

const eventSchema = z.object({
  player_id: z.string(),
  team_id: z.string(),
  type: z.enum(['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION']),
  minute: z.number().min(1).max(120),
  description: z.string().optional()
})

export async function getAll(req: Request, res: Response) {
  try {
    const championship_id = req.query['championship_id'] as string | undefined
    const matches = await matchService.getAll(championship_id)
    res.json({ success: true, matches })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const match = await matchService.getById(id)
    res.json({ success: true, match })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const data = matchSchema.parse(req.body)
    const match = await matchService.create(data)
    res.status(201).json({ success: true, match })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function start(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const match = await matchService.start(id)
    res.json({ success: true, match })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function addEvent(req: Request, res: Response) {
  try {
    const match_id = req.params['id'] as string
    const data = eventSchema.parse(req.body)
    const event = await matchService.addEvent(match_id, data)
    res.status(201).json({ success: true, event })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export async function finish(req: Request, res: Response) {
  try {
    const id = req.params['id'] as string
    const match = await matchService.finish(id)
    res.json({ success: true, match })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}