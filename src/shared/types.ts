export interface DayRecord {
  date: string
  pixels: number
  meters: number
}

export interface RouteProgress {
  routeId: string
  completedMeters: number
  milestones: string[]
}

export interface Settings {
  paused: boolean
  excludedDomains: string[]
  trackDomains: boolean
  currentRouteId: string
  unit: 'auto' | 'cm' | 'm' | 'km'
  lang: 'en' | 'zh'
}

export interface StorageData {
  days: DayRecord[]
  routeProgress: Record<string, RouteProgress>
  settings: Settings
  totalMeters: number
  streak: number
  lastActiveDate: string
}

export interface Milestone {
  id: string
  name: string
  nameZh: string
  meters: number
  description: string
  descriptionZh: string
  emoji: string
}

export interface Route {
  id: string
  name: string
  nameZh: string
  totalMeters: number
  color: string
  emoji: string
  description: string
  descriptionZh: string
  milestones: Milestone[]
  svgPath: string
}
