type ID = string

export interface User {
  id: string
  email: string
  full_name: string
  password: string
  is_active: boolean
  avatar_url?: string
  role: UserRole
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CHAMPIONSHIP_ADMIN = 'CHAMPIONSHIP_ADMIN',
  TEAM_MANAGER = 'TEAM_MANAGER',
  REFEREE = 'REFEREE',
  PLAYER = 'PLAYER'
}

export enum ChampionshipStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export enum ChampionshipFormat {
  LEAGUE = 'LEAGUE',
  CUP = 'CUP',
  MIXED = 'MIXED'
}

export interface Championship {
  id: string
  name: string
  description?: string
  sport_type: string
  format: ChampionshipFormat
  season: string
  status: ChampionshipStatus
  start_date: Date
  end_date: Date
  max_teams: number
  organizer_id: string
}

export interface Team {
  id: string
  name: string
  short_name: string
  badge_url?: string
  city: string
  founded_year: number
  manager_id: string
}
export interface Player {
  id: string
  full_name: string
  birth_date: Date
  position?: string
  jersey_number: number
  nationality?: string
  photo_url?: string
  team_id: string
  user_id?: string
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED'
}

export interface Match {
  id: string
  championship_id: string
  round: number
  home_team_id: string
  away_team_id: string
  scheduled_at: Date
  venue?: string
  referee_id?: string
  home_score?: number
  away_score?: number
  status: MatchStatus
}

export enum EventType {
  GOAL = 'GOAL',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SUBSTITUTION = 'SUBSTITUTION'
}

export interface MatchEvent {
  id: string
  match_id: string
  player_id: string
  team_id: string
  type: EventType
  minute: number
  description?: string
}


