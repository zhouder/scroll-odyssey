import React, { useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import type { StorageData } from '../shared/types'
import { ROUTES, getRoute } from '../shared/routes'
import { formatDistance } from '../shared/storage'
import { t } from '../shared/i18n'
import type { Lang } from '../shared/i18n'

function useData() {
  const [data, setData] = useState<StorageData | null>(null)
  const reload = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'GET_DATA' }, (d: StorageData) => {
      if (chrome.runtime.lastError) { setData(null); return }
      setData(d)
    })
  }, [])
  useEffect(() => {
    reload()
    const id = setInterval(reload, 3000)
    chrome.storage.onChanged.addListener(reload)
    return () => { clearInterval(id); chrome.storage.onChanged.removeListener(reload) }
  }, [reload])
  return { data, reload }
}

const C = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  muted: '#64748b', text: '#f1f5f9', textSub: '#94a3b8',
}
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
  padding: '10px 14px', marginBottom: 8, ...extra,
})
const btnSm: React.CSSProperties = {
  background: 'none', border: `1px solid ${C.border}`, borderRadius: 6,
  color: C.textSub, cursor: 'pointer', padding: '3px 9px', fontSize: 11,
  fontFamily: 'system-ui',
}

function RouteMap({ routeId, progress }: { routeId: string; progress: number }) {
  const route = getRoute(routeId)
  const pct = Math.min(1, progress / route.totalMeters)
  return (
    <svg viewBox="0 0 185 80" style={{ width: '100%', height: 70, display: 'block' }}>
      <path d={route.svgPath} stroke={C.border} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={route.svgPath} stroke={route.color} strokeWidth="3" fill="none" strokeLinecap="round"
        strokeDasharray="1000" strokeDashoffset={1000 * (1 - pct)}
        style={{ transition: 'stroke-dashoffset 0.4s' }} />
      {route.milestones.map(ms => {
        const mx = 10 + (ms.meters / route.totalMeters) * 165
        const reached = pct >= ms.meters / route.totalMeters
        return <circle key={ms.id} cx={mx} cy={45} r={4}
          fill={reached ? route.color : C.border} stroke={C.surface} strokeWidth="1.5" />
      })}
    </svg>
  )
}

function Popup() {
  const { data } = useData()
  const [view, setView] = useState<'home' | 'routes'>('home')

  if (!data) return (
    <div style={{ width: 320, padding: 24, background: C.bg, color: C.muted, fontFamily: 'system-ui', textAlign: 'center' }}>
      Loading…
    </div>
  )

  const lang: Lang = data.settings.lang ?? 'en'
  const i = t(lang)
  const unit = data.settings.unit ?? 'auto'
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayRec = data.days.find(d => d.date === todayKey)
  const route = getRoute(data.settings.currentRouteId)
  const rp = data.routeProgress[data.settings.currentRouteId]
  const pct = rp ? Math.min(100, (rp.completedMeters / route.totalMeters) * 100) : 0
  const fmt = (m: number) => formatDistance(m, unit)

  function narrative(): string {
    if (!todayRec || todayRec.meters < 0.001) return i.noScroll
    const lastMs = rp ? route.milestones.filter(ms => rp.milestones.includes(ms.id)).pop() : undefined
    const loc = lastMs
      ? i.narrativeMs(lang === 'zh' ? lastMs.nameZh : lastMs.name)
      : i.narrativeLoc(lang === 'zh' ? route.nameZh : route.name)
    return i.narrative(fmt(todayRec.meters), loc)
  }

  function save(patch: Partial<StorageData['settings']>) {
    chrome.runtime.sendMessage({ type: 'SAVE_DATA', data: { ...data!, settings: { ...data!.settings, ...patch } } })
  }

  return (
    <div style={{ width: 320, background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif', fontSize: 13, padding: 14, display: 'inline-block' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 18 }}>🧳</span>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>Scroll Odyssey</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => save({ lang: lang === 'en' ? 'zh' : 'en' })} style={btnSm}>
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <button onClick={() => save({ paused: !data.settings.paused })} style={btnSm}
            title={data.settings.paused ? i.resume : i.pause}>
            {data.settings.paused ? '▶' : '⏸'}
          </button>
          <button onClick={() => chrome.runtime.openOptionsPage()} style={btnSm}>⚙</button>
        </div>
      </div>

      {view === 'home' && (
        <>
          <div style={{ ...card(), color: C.textSub, fontStyle: 'italic', lineHeight: 1.55, fontSize: 12 }}>
            {narrative()}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 8 }}>
            <div style={card()}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{i.today}</div>
              <div style={{ fontWeight: 700, color: route.color }}>{todayRec ? fmt(todayRec.meters) : '—'}</div>
            </div>
            <div style={card()}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{i.streak}</div>
              <div style={{ fontWeight: 700, color: '#f59e0b' }}>{i.streak_fmt(data.streak)}</div>
            </div>
          </div>

          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ color: route.color, fontWeight: 600 }}>
                {route.emoji} {lang === 'zh' ? route.nameZh : route.name}
              </span>
              <button onClick={() => setView('routes')} style={{ ...btnSm, border: 'none' }}>
                {i.switchRoute}
              </button>
            </div>
            <RouteMap routeId={data.settings.currentRouteId} progress={rp?.completedMeters ?? 0} />
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginBottom: 3 }}>
                <span>{fmt(rp?.completedMeters ?? 0)}</span>
                <span>{pct.toFixed(1)}%</span>
                <span>{fmt(route.totalMeters)}</span>
              </div>
              <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: route.color, borderRadius: 2, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>

          {rp && rp.milestones.length > 0 && (() => {
            const lastMs = route.milestones.find(ms => ms.id === rp.milestones[rp.milestones.length - 1])
            if (!lastMs) return null
            return (
              <div style={{ ...card(), display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{lastMs.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, color: C.muted }}>{i.latestMilestone}</div>
                  <div style={{ fontWeight: 600 }}>{lang === 'zh' ? lastMs.nameZh : lastMs.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{lang === 'zh' ? lastMs.descriptionZh : lastMs.description}</div>
                </div>
              </div>
            )
          })()}
        </>
      )}

      {view === 'routes' && (
        <>
          <button onClick={() => setView('home')} style={{ ...btnSm, border: 'none', marginBottom: 8 }}>{i.back}</button>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{i.selectRoute}</div>
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {ROUTES.map(r => (
              <div key={r.id} onClick={() => { save({ currentRouteId: r.id }); setView('home') }}
                style={card({ marginBottom: 0, cursor: 'pointer', borderColor: r.id === data.settings.currentRouteId ? r.color : C.border })}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: r.color, fontWeight: 600 }}>{r.emoji} {lang === 'zh' ? r.nameZh : r.name}</span>
                  {r.id === data.settings.currentRouteId && <span style={{ fontSize: 10, color: r.color }}>✓</span>}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                  {lang === 'zh' ? r.descriptionZh : r.description} · {fmt(r.totalMeters)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Popup />)
