import type { StorageData, Settings } from './types'
import { DEFAULT_SETTINGS, STORAGE_KEY } from './constants'
import { ROUTES } from './routes'

export const PIXELS_PER_METER = 3779.5275591

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function pixelsToMeters(px: number): number {
  return px / PIXELS_PER_METER
}

export type Unit = 'auto' | 'cm' | 'm' | 'km'

export function formatDistance(meters: number, unit: Unit = 'auto'): string {
  if (unit === 'cm') return `${(meters * 100).toFixed(1)} cm`
  if (unit === 'm') return `${meters.toFixed(2)} m`
  if (unit === 'km') return `${(meters / 1000).toFixed(3)} km`
  // auto
  if (meters < 0.01) return `${(meters * 100).toFixed(1)} cm`
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  if (meters < 1000) return `${meters.toFixed(2)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

export function getDefaultData(): StorageData {
  const routeProgress: StorageData['routeProgress'] = {}
  for (const r of ROUTES) {
    routeProgress[r.id] = { routeId: r.id, completedMeters: 0, milestones: [] }
  }
  return {
    days: [],
    routeProgress,
    settings: { ...DEFAULT_SETTINGS } as Settings,
    totalMeters: 0,
    streak: 0,
    lastActiveDate: '',
  }
}

export async function loadData(): Promise<StorageData> {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, result => {
      const raw = result[STORAGE_KEY]
      if (!raw) { resolve(getDefaultData()); return }
      const data = raw as StorageData
      for (const r of ROUTES) {
        if (!data.routeProgress[r.id]) {
          data.routeProgress[r.id] = { routeId: r.id, completedMeters: 0, milestones: [] }
        }
      }
      // migrate: ensure unit field exists
      if (!data.settings.unit) (data.settings as Settings).unit = 'auto'
      if (!data.settings.lang) (data.settings as Settings).lang = 'en'
      resolve(data)
    })
  })
}

export async function saveData(data: StorageData): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve)
  })
}

export function updateStreak(data: StorageData): void {
  const t = today()
  if (data.lastActiveDate === t) return
  const prev = new Date(data.lastActiveDate)
  const cur = new Date(t)
  const diff = (cur.getTime() - prev.getTime()) / 86400000
  data.streak = data.lastActiveDate && diff <= 1 ? data.streak + 1 : 1
  data.lastActiveDate = t
}

export function addPixels(data: StorageData, pixels: number): void {
  const meters = pixelsToMeters(Math.abs(pixels))
  const t = today()
  let day = data.days.find(d => d.date === t)
  if (!day) {
    day = { date: t, pixels: 0, meters: 0 }
    data.days.push(day)
  }
  day.pixels += Math.abs(pixels)
  day.meters += meters
  data.totalMeters += meters

  const rp = data.routeProgress[data.settings.currentRouteId]
  if (rp) {
    rp.completedMeters += meters
    const route = ROUTES.find(r => r.id === rp.routeId)
    if (route) {
      for (const ms of route.milestones) {
        if (!rp.milestones.includes(ms.id) && rp.completedMeters >= ms.meters) {
          rp.milestones.push(ms.id)
        }
      }
    }
  }

  updateStreak(data)
}
