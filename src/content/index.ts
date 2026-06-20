// Content script — capture all scroll events, send to SW with retry on wake failure
const THROTTLE_MS = 250
const BLOCKED = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'devtools:', 'moz-extension:']

if (!BLOCKED.some(p => location.protocol.startsWith(p))) {
  let acc = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function send(px: number, attempt = 0) {
    chrome.runtime.sendMessage({ type: 'SCROLL', pixels: px, host: location.hostname })
      .catch(() => {
        if (attempt === 0) setTimeout(() => send(px, 1), 400)
      })
  }

  function flush() {
    if (acc === 0) return
    const px = acc; acc = 0
    send(px)
  }

  // Track scroll on every scrollable element, not just window
  function handleScroll(e: Event) {
    const el = e.target as Element | Document | null
    if (!el) return
    let currentY: number
    if (el === document || el === document.documentElement) {
      currentY = window.scrollY
    } else if (el === document.body) {
      currentY = window.scrollY
    } else {
      currentY = (el as Element).scrollTop
    }
    const key = '__so_lastY'
    const lastY = (el as any)[key] ?? currentY
    const delta = Math.abs(currentY - lastY)
    ;(el as any)[key] = currentY
    if (delta > 0) acc += delta
    if (!timer) {
      timer = setTimeout(() => { timer = null; flush() }, THROTTLE_MS)
    }
  }

  // Capture phase to catch scroll on all elements before they stop propagation
  window.addEventListener('scroll', handleScroll, { capture: true, passive: true })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
