import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import type { StorageData } from '../shared/types'
import { ROUTES, getRoute } from '../shared/routes'
import { formatDistance } from '../shared/storage'
import { t } from '../shared/i18n'
import type { Lang } from '../shared/i18n'
import { generatePostcard } from './postcard'

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  muted: '#64748b', text: '#f1f5f9', textSub: '#94a3b8',
  accent: '#6366f1', accentLight: '#818cf8',
}
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
  padding: '16px 20px', marginBottom: 14, ...extra,
})
const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
  color: C.text, cursor: 'pointer', padding: '8px 16px', fontSize: 13,
  fontFamily: 'system-ui', ...extra,
})

function useData() {
  const [data, setData] = useState<StorageData | null>(null)
  const reload = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'GET_DATA' }, (d: StorageData) => {
      if (chrome.runtime.lastError) { setData(null); return }
      setData(d)
    })
  }, [])
  const save = useCallback((d: StorageData) => {
    chrome.runtime.sendMessage({ type: 'SAVE_DATA', data: d }, () => setData(d))
  }, [])
  useEffect(() => {
    reload()
    chrome.storage.onChanged.addListener(reload)
    return () => chrome.storage.onChanged.removeListener(reload)
  }, [reload])
  return { data, reload, save }
}

/* ── Calendar heatmap (last 10 weeks) ── */
function CalendarView({ days, color }: { days: StorageData['days']; color: string }) {
  const today = new Date()
  const cells: { date: string; meters: number }[] = []
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const rec = days.find(r => r.date === key)
    cells.push({ date: key, meters: rec?.meters ?? 0 })
  }
  const max = Math.max(...cells.map(c => c.meters), 1)
  const weeks: typeof cells[] = []
  for (let w = 0; w < 10; w++) weeks.push(cells.slice(w * 7, w * 7 + 7))

  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {week.map(cell => {
            const intensity = cell.meters > 0 ? Math.max(0.15, cell.meters / max) : 0
            return (
              <div key={cell.date} title={`${cell.date}: ${formatDistance(cell.meters)}`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: intensity > 0 ? color : C.border,
                  opacity: intensity > 0 ? 0.3 + intensity * 0.7 : 1,
                }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ── Bar chart ── */
function BarChart({ days, color }: { days: StorageData['days']; color: string }) {
  const today = new Date()
  const last7: { date: string; meters: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const rec = days.find(r => r.date === key)
    last7.push({ date: key, meters: rec?.meters ?? 0 })
  }
  const max = Math.max(...last7.map(d => d.meters), 0.01)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {last7.map(d => {
        const dayIdx = new Date(d.date).getDay()
        return (
          <div key={d.date} title={`${d.date}: ${formatDistance(d.meters)}`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', background: color, borderRadius: 3, opacity: 0.85, height: Math.max(4, (d.meters / max) * 56), transition: 'height 0.3s' }} />
            <div style={{ fontSize: 9, color: C.muted }}>{weekdays[dayIdx]}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Overview tab ── */
function OverviewTab({ data }: { data: StorageData }) {
  const lang: Lang = data.settings.lang ?? 'en'
  const i = t(lang)
  const unit = data.settings.unit ?? 'auto'
  const fmt = (m: number) => formatDistance(m, unit)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayRec = data.days.find(d => d.date === todayKey)
  const route = getRoute(data.settings.currentRouteId)
  const rp = data.routeProgress[data.settings.currentRouteId]
  const goalM = (data.settings as StorageData['settings'] & { dailyGoalM?: number }).dailyGoalM ?? 0
  const todayM = todayRec?.meters ?? 0
  const goalPct = goalM > 0 ? Math.min(100, (todayM / goalM) * 100) : 0

  return (
    <div>
      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: i.today, value: fmt(todayM), color: route.color },
          { label: i.total, value: fmt(data.totalMeters), color: route.color },
          { label: i.streak, value: i.streak_fmt(data.streak), color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={card({ padding: '14px 16px', marginBottom: 0 })}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* daily goal */}
      {goalM > 0 && (
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 6 }}>
            <span>{lang === 'zh' ? '今日目标' : 'Daily goal'}</span>
            <span style={{ color: goalPct >= 100 ? '#22c55e' : C.text }}>{fmt(todayM)} / {fmt(goalM)}</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${goalPct}%`, background: goalPct >= 100 ? '#22c55e' : route.color, borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
          {goalPct >= 100 && <div style={{ marginTop: 6, fontSize: 12, color: '#22c55e' }}>🎉 {lang === 'zh' ? '今日目标完成！' : 'Goal reached!'}</div>}
        </div>
      )}

      {/* calendar heatmap */}
      <div style={card()}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{lang === 'zh' ? '最近 70 天' : 'Last 70 days'}</div>
        <CalendarView days={data.days} color={route.color} />
      </div>

      {/* bar chart */}
      <div style={card()}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{i.last7}</div>
        <BarChart days={data.days} color={route.color} />
      </div>

      {/* route progress */}
      <div style={card()}>
        <div style={{ fontSize: 14, color: route.color, fontWeight: 600, marginBottom: 8 }}>
          {route.emoji} {lang === 'zh' ? route.nameZh : route.name}
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
          {fmt(rp?.completedMeters ?? 0)} / {fmt(route.totalMeters)}
        </div>
        <div style={{ height: 5, background: C.border, borderRadius: 3, marginBottom: 14 }}>
          <div style={{ height: '100%', width: `${Math.min(100, ((rp?.completedMeters ?? 0) / route.totalMeters) * 100)}%`, background: route.color, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        {route.milestones.map(ms => {
          const reached = rp?.milestones.includes(ms.id)
          return (
            <div key={ms.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: reached ? 1 : 0.3 }}>
              <span style={{ fontSize: 20 }}>{ms.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: reached ? C.text : C.muted }}>{lang === 'zh' ? ms.nameZh : ms.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{fmt(ms.meters)} · {lang === 'zh' ? ms.descriptionZh : ms.description}</div>
              </div>
              {reached && <span style={{ color: route.color, fontSize: 12 }}>✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Routes tab ── */
function RoutesTab({ data, save }: { data: StorageData; save: (d: StorageData) => void }) {
  const lang: Lang = data.settings.lang ?? 'en'
  const fmt = (m: number) => formatDistance(m, data.settings.unit ?? 'auto')
  const i = t(lang)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {ROUTES.map(r => {
        const rp = data.routeProgress[r.id]
        const pct = rp ? Math.min(100, (rp.completedMeters / r.totalMeters) * 100) : 0
        const active = data.settings.currentRouteId === r.id
        return (
          <div key={r.id} onClick={() => save({ ...data, settings: { ...data.settings, currentRouteId: r.id } })}
            style={card({ marginBottom: 0, cursor: 'pointer', borderColor: active ? r.color : C.border })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: r.color, fontWeight: 600 }}>{r.emoji} {lang === 'zh' ? r.nameZh : r.name}</span>
              {active && <span style={{ fontSize: 11, color: r.color }}>{i.activeRoute}</span>}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>
              {lang === 'zh' ? r.descriptionZh : r.description} · {fmt(r.totalMeters)}
            </div>
            <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: r.color, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{pct.toFixed(1)}%</div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Postcard tab ── */
function PostcardTab({ data }: { data: StorageData }) {
  const lang: Lang = data.settings.lang ?? 'en'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedRoute, setSelectedRoute] = useState(data.settings.currentRouteId)
  const i = t(lang)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const route = getRoute(selectedRoute)
    const rp = data.routeProgress[selectedRoute]
    generatePostcard(canvas, route, rp?.completedMeters ?? 0, data.streak, lang)
  }, [selectedRoute, data, lang])

  function download() {
    const a = document.createElement('a')
    a.download = `scroll-odyssey-${selectedRoute}-${new Date().toISOString().slice(0, 10)}.png`
    a.href = canvasRef.current!.toDataURL('image/png')
    a.click()
  }

  return (
    <div>
      <select value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)}
        style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>
        {ROUTES.map(r => (
          <option key={r.id} value={r.id}>{r.emoji} {lang === 'zh' ? r.nameZh : r.name}</option>
        ))}
      </select>
      <canvas ref={canvasRef} width={600} height={400}
        style={{ width: '100%', borderRadius: 10, border: `1px solid ${C.border}`, display: 'block', marginBottom: 10 }} />
      <button onClick={download} style={btn({ width: '100%', background: getRoute(selectedRoute).color, border: 'none', color: '#fff', fontWeight: 600 })}>
        {i.downloadPng}
      </button>
    </div>
  )
}

/* ── Settings tab ── */
function SettingsTab({ data, save, reload }: { data: StorageData; save: (d: StorageData) => void; reload: () => void }) {
  const lang: Lang = data.settings.lang ?? 'en'
  const [domain, setDomain] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const i = t(lang)

  function patch(s: Partial<StorageData['settings']>) {
    save({ ...data, settings: { ...data.settings, ...s } })
  }

  return (
    <div>
      {/* language */}
      <div style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: C.text, fontSize: 13 }}>Language / 语言</div>
          <select value={lang} onChange={e => patch({ lang: e.target.value as Lang })}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>

      {/* unit */}
      <div style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: C.text, fontSize: 13 }}>{i.unitLabel}</div>
          <select value={data.settings.unit ?? 'auto'} onChange={e => patch({ unit: e.target.value as 'auto' | 'cm' | 'm' | 'km' })}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
            <option value="auto">{i.unitAuto}</option>
            <option value="cm">{i.unitCm}</option>
            <option value="m">{i.unitM}</option>
            <option value="km">{i.unitKm}</option>
          </select>
        </div>
      </div>

      {/* pause */}
      <div style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: C.text, fontSize: 13 }}>{i.pauseTracking}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{i.pauseDesc}</div>
          </div>
          <input type="checkbox" checked={data.settings.paused} onChange={e => patch({ paused: e.target.checked })} />
        </div>
      </div>

      {/* track domains */}
      <div style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: C.text, fontSize: 13 }}>{i.trackDomains}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{i.trackDomainsDesc}</div>
          </div>
          <input type="checkbox" checked={data.settings.trackDomains} onChange={e => patch({ trackDomains: e.target.checked })} />
        </div>
      </div>

      {/* excluded domains */}
      <div style={card()}>
        <div style={{ color: C.text, fontSize: 13, marginBottom: 4 }}>{i.excludeDomains}</div>
        <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>{i.excludeDomainsDesc}</div>
        <div style={{ display: 'flex', gap: 7 }}>
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder={i.addDomain}
            onKeyDown={e => { if (e.key === 'Enter' && domain.trim()) { patch({ excludedDomains: [...data.settings.excludedDomains, domain.trim()] }); setDomain('') } }}
            style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: '5px 9px', fontSize: 12 }} />
          <button onClick={() => { if (domain.trim()) { patch({ excludedDomains: [...data.settings.excludedDomains, domain.trim()] }); setDomain('') } }}
            style={btn({ padding: '5px 12px', fontSize: 12 })}>{i.add}</button>
        </div>
        {data.settings.excludedDomains.map((d, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textSub }}>{d}</span>
            <button onClick={() => patch({ excludedDomains: data.settings.excludedDomains.filter((_, i) => i !== idx) })}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>

      {/* export / import */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => {
          const a = document.createElement('a')
          a.download = `scroll-odyssey-${new Date().toISOString().slice(0, 10)}.json`
          a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
          a.click()
        }} style={btn({ flex: 1, fontSize: 12 })}>{i.exportData}</button>
        <button onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'; input.accept = '.json'
          input.onchange = async () => {
            const file = input.files?.[0]
            if (file) save(JSON.parse(await file.text()))
          }
          input.click()
        }} style={btn({ flex: 1, fontSize: 12 })}>{i.importData}</button>
      </div>

      {/* clear data */}
      {confirmClear ? (
        <div style={card()}>
          <div style={{ color: '#f87171', marginBottom: 10, fontSize: 13 }}>{i.confirmClear}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={async () => { await chrome.storage.local.clear(); reload(); setConfirmClear(false) }}
              style={btn({ flex: 1, background: '#7f1d1d', border: 'none', color: '#fff' })}>{i.confirmDelete}</button>
            <button onClick={() => setConfirmClear(false)} style={btn({ flex: 1 })}>{i.cancel}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirmClear(true)}
          style={btn({ width: '100%', background: '#1c0a0a', borderColor: '#7f1d1d', color: '#f87171' })}>{i.clearData}</button>
      )}

      {/* privacy */}
      <div style={{ marginTop: 14, padding: '10px 14px', background: '#0c1a0c', border: '1px solid #1a4a1a', borderRadius: 8, fontSize: 11, color: '#6ea86e', lineHeight: 1.6 }}>
        {i.privacyNotice}
      </div>
    </div>
  )
}

/* ── Main dashboard ── */
const TAB_EN = ['Overview', 'Routes', 'Postcard', 'Settings']
const TAB_ZH = ['总览', '路线', '明信片', '设置']

function Dashboard() {
  const { data, reload, save } = useData()
  const [tab, setTab] = useState(0)

  if (!data) return (
    <div style={{ padding: 60, textAlign: 'center', color: C.muted, fontFamily: 'system-ui', background: C.bg, minHeight: '100vh' }}>
      Loading…
    </div>
  )

  const lang: Lang = data.settings.lang ?? 'en'
  const tabs = lang === 'zh' ? TAB_ZH : TAB_EN

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🧳</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>Scroll Odyssey</div>
            <div style={{ fontSize: 12, color: C.muted }}>{t(lang).appSub}</div>
          </div>
        </div>

        {/* tab bar */}
        <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
          {tabs.map((name, idx) => (
            <button key={name} onClick={() => setTab(idx)}
              style={{
                background: 'none', border: 'none',
                borderBottom: tab === idx ? '2px solid #6366f1' : '2px solid transparent',
                color: tab === idx ? '#818cf8' : C.muted,
                cursor: 'pointer', padding: '8px 18px', fontSize: 14, fontFamily: 'system-ui',
              }}>
              {name}
            </button>
          ))}
        </div>

        {tab === 0 && <OverviewTab data={data} />}
        {tab === 1 && <RoutesTab data={data} save={save} />}
        {tab === 2 && <PostcardTab data={data} />}
        {tab === 3 && <SettingsTab data={data} save={save} reload={reload} />}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Dashboard />)
