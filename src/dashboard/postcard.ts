import type { Route } from '../shared/types'
import { formatDistance } from '../shared/storage'
import type { Lang } from '../shared/i18n'

export async function generatePostcard(
  canvas: HTMLCanvasElement,
  route: Route,
  completedMeters: number,
  streak: number,
  lang: Lang = 'en',
): Promise<void> {
  const ctx = canvas.getContext('2d')!
  const W = canvas.width, H = canvas.height

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1e293b')
  bg.addColorStop(1, '#0f172a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // dashed border
  ctx.strokeStyle = route.color + '66'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 5])
  ctx.strokeRect(14, 14, W - 28, H - 28)
  ctx.setLineDash([])

  // right-side lines
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  for (let y = 90; y < H - 38; y += 26) {
    ctx.beginPath(); ctx.moveTo(W / 2 + 16, y); ctx.lineTo(W - 36, y); ctx.stroke()
  }
  ctx.beginPath(); ctx.moveTo(W / 2 + 8, 56); ctx.lineTo(W / 2 + 8, H - 36); ctx.stroke()

  // stamp box
  ctx.strokeStyle = route.color; ctx.lineWidth = 2
  ctx.strokeRect(W - 104, 26, 74, 72)
  ctx.font = '32px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(route.emoji, W - 67, 62)
  ctx.font = '9px system-ui'; ctx.fillStyle = route.color
  ctx.fillText('SCROLL ODYSSEY', W - 67, 88)

  // route path (left side)
  ctx.save()
  ctx.translate(28, 130)
  ctx.scale(1.25, 1.2)
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
  _drawSVGPath(ctx, route.svgPath)
  ctx.stroke()
  const pct = Math.min(1, completedMeters / route.totalMeters)
  ctx.strokeStyle = route.color; ctx.lineWidth = 3
  _drawSVGPath(ctx, route.svgPath, pct)
  ctx.stroke()
  ctx.restore()

  // text
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  const routeLabel = lang === 'zh' ? route.nameZh : route.name
  ctx.fillStyle = route.color; ctx.font = 'bold 20px system-ui'
  ctx.fillText(routeLabel, 32, 50)
  ctx.fillStyle = '#94a3b8'; ctx.font = '12px system-ui'
  ctx.fillText(lang === 'zh' ? route.descriptionZh : route.description, 32, 68)

  ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 26px system-ui'
  ctx.fillText(formatDistance(completedMeters), 32, 122)
  ctx.fillStyle = '#64748b'; ctx.font = '11px system-ui'
  ctx.fillText(`/ ${formatDistance(route.totalMeters)}`, 32, 138)

  const pctLabel = `${(pct * 100).toFixed(1)}%`
  ctx.fillStyle = route.color; ctx.font = '12px system-ui'
  ctx.fillText(pctLabel, 32, 156)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`🔥 ${streak}d`, 32, 174)

  const dateStr = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  ctx.fillStyle = '#475569'; ctx.font = '10px system-ui'
  ctx.fillText(dateStr, 32, H - 24)
  ctx.textAlign = 'right'
  ctx.fillText('Scroll Odyssey', W - 32, H - 24)
}

// ── minimal SVG path renderer ──────────────────────────────────────────────

type Seg =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x0: number; y0: number; x: number; y: number }
  | { type: 'C'; x0: number; y0: number; cx1: number; cy1: number; cx2: number; cy2: number; x: number; y: number }

function _drawSVGPath(ctx: CanvasRenderingContext2D, d: string, pct = 1): void {
  const segs = _parsePath(d)
  const total = _pathLength(segs)
  const target = total * pct
  let drawn = 0, needsMove = true

  for (const seg of segs) {
    if (drawn >= target) break
    if (seg.type === 'M') { ctx.moveTo(seg.x, seg.y); needsMove = false }
    else if (seg.type === 'L') {
      if (needsMove) { ctx.moveTo(seg.x0, seg.y0); needsMove = false }
      const len = Math.hypot(seg.x - seg.x0, seg.y - seg.y0)
      if (drawn + len > target) {
        const t = (target - drawn) / len
        ctx.lineTo(seg.x0 + (seg.x - seg.x0) * t, seg.y0 + (seg.y - seg.y0) * t)
        break
      }
      ctx.lineTo(seg.x, seg.y); drawn += len
    } else if (seg.type === 'C') {
      if (needsMove) { ctx.moveTo(seg.x0, seg.y0); needsMove = false }
      const len = _cubicLen(seg)
      if (drawn + len > target) {
        const tRatio = (target - drawn) / len
        const [bx, by] = _cubicAt(seg, tRatio)
        const [c1x, c1y] = _cubicAt(seg, tRatio / 3)
        const [c2x, c2y] = _cubicAt(seg, tRatio * 2 / 3)
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, bx, by); break
      }
      ctx.bezierCurveTo(seg.cx1, seg.cy1, seg.cx2, seg.cy2, seg.x, seg.y); drawn += len
    }
  }
}

function _parsePath(d: string): Seg[] {
  const segs: Seg[] = []
  const tokens = d.trim().split(/(?=[MLCmlc])|[\s,]+/).filter(Boolean)
  let cx = 0, cy = 0, i = 0
  while (i < tokens.length) {
    const cmd = tokens[i++]
    if (cmd === 'M' || cmd === 'm') {
      const x = +tokens[i++], y = +tokens[i++]
      cx = cmd === 'm' ? cx + x : x; cy = cmd === 'm' ? cy + y : y
      segs.push({ type: 'M', x: cx, y: cy })
    } else if (cmd === 'L' || cmd === 'l') {
      const x = +tokens[i++], y = +tokens[i++]
      const nx = cmd === 'l' ? cx + x : x, ny = cmd === 'l' ? cy + y : y
      segs.push({ type: 'L', x0: cx, y0: cy, x: nx, y: ny }); cx = nx; cy = ny
    } else if (cmd === 'C' || cmd === 'c') {
      const c1x = +tokens[i++], c1y = +tokens[i++], c2x = +tokens[i++], c2y = +tokens[i++]
      const x = +tokens[i++], y = +tokens[i++]
      const [rc1x, rc1y, rc2x, rc2y, rx, ry] = cmd === 'c'
        ? [cx + c1x, cy + c1y, cx + c2x, cy + c2y, cx + x, cy + y]
        : [c1x, c1y, c2x, c2y, x, y]
      segs.push({ type: 'C', x0: cx, y0: cy, cx1: rc1x, cy1: rc1y, cx2: rc2x, cy2: rc2y, x: rx, y: ry })
      cx = rx; cy = ry
    } else { break }
  }
  return segs
}

function _pathLength(segs: Seg[]): number {
  return segs.reduce((s, seg) => s + (seg.type === 'L' ? Math.hypot(seg.x - seg.x0, seg.y - seg.y0) : seg.type === 'C' ? _cubicLen(seg) : 0), 0)
}

function _cubicAt(s: Extract<Seg, { type: 'C' }>, t: number): [number, number] {
  const m = 1 - t
  return [
    m ** 3 * s.x0 + 3 * m ** 2 * t * s.cx1 + 3 * m * t ** 2 * s.cx2 + t ** 3 * s.x,
    m ** 3 * s.y0 + 3 * m ** 2 * t * s.cy1 + 3 * m * t ** 2 * s.cy2 + t ** 3 * s.y,
  ]
}

function _cubicLen(s: Extract<Seg, { type: 'C' }>): number {
  let len = 0, [px, py] = [s.x0, s.y0]
  for (let k = 1; k <= 10; k++) {
    const [nx, ny] = _cubicAt(s, k / 10); len += Math.hypot(nx - px, ny - py); px = nx; py = ny
  }
  return len
}
