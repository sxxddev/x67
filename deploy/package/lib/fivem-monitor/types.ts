export type AcBadge = {
  type: string
  text: string
}

export type FiveMServer = {
  endpoint: string
  name: string
  sub: string
  players: number
  maxPlayers: number
  gametype?: string
  badge: AcBadge
  connect: string
  icon: string | null
  resourcesCount?: number
}

export type FiveMStats = {
  totalServers: number
  totalPlayers: number
  activeServers: number
  gta5Instances: number
}

export type FiveMSystemStatus = {
  undetected: number
  warning: number
  stop: number
  programs: {
    id: string
    name: string
    description?: string
    image?: string
    status?: string
  }[]
}

export type FiveMPayload = {
  fetchedAt: string
  stats: FiveMStats
  systemStatus: FiveMSystemStatus
  servers: FiveMServer[]
  stale?: boolean
  cacheWarning?: string
  error?: string
}
