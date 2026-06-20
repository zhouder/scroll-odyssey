import { loadData, saveData, addPixels } from '../shared/storage'

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SCROLL') {
    loadData().then(data => {
      if (data.settings.paused) return data
      if (data.settings.excludedDomains.some(d => (msg.host as string).includes(d))) return data
      if (!data.routeProgress[data.settings.currentRouteId]) {
        data.routeProgress[data.settings.currentRouteId] = { routeId: data.settings.currentRouteId, completedMeters: 0, milestones: [] }
      }
      addPixels(data, msg.pixels)
      return saveData(data).then(() => data)
    }).then(data => {
      sendResponse({ ok: true, meters: data.days.find(d => d.date === data.lastActiveDate)?.meters ?? 0 })
    }).catch(err => {
      console.error('SCROLL handler error:', err)
      sendResponse({ ok: false })
    })
    return true
  }
  if (msg.type === 'GET_DATA') {
    loadData().then(data => sendResponse(data)).catch(err => {
      console.error('GET_DATA handler error:', err)
      sendResponse(null)
    })
    return true
  }
  if (msg.type === 'SAVE_DATA') {
    saveData(msg.data).then(() => sendResponse({ ok: true })).catch(err => {
      console.error('SAVE_DATA handler error:', err)
      sendResponse({ ok: false })
    })
    return true
  }
  return false
})

chrome.storage.onChanged.addListener(() => {
  loadData().then(data => {
    const rec = data.days.find(d => d.date === new Date().toISOString().slice(0, 10))
    chrome.action.setBadgeText({ text: rec && rec.meters >= 1 ? `${(rec.meters / 1000).toFixed(1)}k` : '' })
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' })
  })
})
