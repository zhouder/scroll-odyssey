import { describe, it, expect, beforeEach, vi } from 'vitest'
import { addPixels, getDefaultData, pixelsToMeters, formatDistance, today, PIXELS_PER_METER } from '../shared/storage'

vi.stubGlobal('chrome', {
  storage: { local: { get: vi.fn(), set: vi.fn() } },
  runtime: { sendMessage: vi.fn() },
  action: { setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
})

describe('pixelsToMeters', () => {
  it('converts correctly', () => {
    expect(pixelsToMeters(PIXELS_PER_METER)).toBeCloseTo(1, 2)
  })
})

describe('formatDistance', () => {
  it('shows cm for tiny values', () => {
    expect(formatDistance(0.05)).toContain('cm')
  })
  it('shows m for sub-km values', () => {
    expect(formatDistance(500)).toContain('m')
  })
  it('shows km for large values', () => {
    expect(formatDistance(5000)).toContain('km')
  })
  it('cm unit override', () => {
    expect(formatDistance(1, 'cm')).toContain('cm')
  })
})

describe('addPixels', () => {
  let data: ReturnType<typeof getDefaultData>
  beforeEach(() => { data = getDefaultData() })

  it('accumulates daily distance', () => {
    addPixels(data, PIXELS_PER_METER * 1000)
    const day = data.days.find(d => d.date === today())
    expect(day).toBeDefined()
    expect(day!.meters).toBeCloseTo(1000, 0)
    expect(data.totalMeters).toBeCloseTo(1000, 0)
  })

  it('advances route progress', () => {
    const routeId = data.settings.currentRouteId
    addPixels(data, PIXELS_PER_METER * 5000)
    expect(data.routeProgress[routeId].completedMeters).toBeCloseTo(5000, 0)
  })

  it('marks milestones when reached', () => {
    addPixels(data, PIXELS_PER_METER * 5001)
    expect(data.routeProgress[data.settings.currentRouteId].milestones.length).toBeGreaterThan(0)
  })

  it('uses absolute value for negative scroll', () => {
    addPixels(data, -PIXELS_PER_METER * 100)
    expect(data.totalMeters).toBeCloseTo(100, 0)
  })

  it('sets streak on first use', () => {
    addPixels(data, 100)
    expect(data.streak).toBe(1)
  })

  it('does not double-count same day', () => {
    addPixels(data, PIXELS_PER_METER * 500)
    addPixels(data, PIXELS_PER_METER * 500)
    const days = data.days.filter(d => d.date === today())
    expect(days.length).toBe(1)
    expect(days[0].meters).toBeCloseTo(1000, 0)
  })
})

describe('getDefaultData', () => {
  it('has all routes initialized', () => {
    expect(Object.keys(getDefaultData().routeProgress).length).toBeGreaterThanOrEqual(10)
  })
  it('starts with zero totalMeters', () => {
    expect(getDefaultData().totalMeters).toBe(0)
  })
})
