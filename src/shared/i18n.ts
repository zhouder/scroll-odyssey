export type Lang = 'en' | 'zh'

export interface T {
  appName: string; appSub: string; loading: string; today: string; total: string
  streak: string; days: string; noScroll: string; switchRoute: string
  latestMilestone: string; pause: string; resume: string; overview: string
  routes: string; postcard: string; settings: string; last7: string
  progress: string; activeRoute: string; downloadPng: string
  pauseTracking: string; pauseDesc: string; trackDomains: string
  trackDomainsDesc: string; excludeDomains: string; excludeDomainsDesc: string
  addDomain: string; add: string; exportData: string; importData: string
  clearData: string; confirmClear: string; confirmDelete: string; cancel: string
  privacyNotice: string; unitLabel: string; unitAuto: string
  unitCm: string; unitM: string; unitKm: string; currentRoute: string
  back: string; selectRoute: string
  narrative: (dist: string, loc: string) => string
  narrativeLoc: (routeName: string) => string
  narrativeMs: (msName: string) => string
  streak_fmt: (n: number) => string
}

const en: T = {
  appName: 'Scroll Odyssey', appSub: 'Travel Journal', loading: 'Loading…',
  today: 'Today', total: 'Total', streak: 'Streak', days: 'days',
  noScroll: "No scrolling yet today — let's go!",
  switchRoute: 'Switch →', latestMilestone: 'Latest Milestone',
  pause: 'Pause', resume: 'Resume', overview: 'Overview', routes: 'Routes',
  postcard: 'Postcard', settings: 'Settings', last7: 'Last 7 days',
  progress: 'Progress', activeRoute: 'Active',
  downloadPng: '📥 Download Postcard PNG',
  pauseTracking: 'Pause tracking', pauseDesc: 'No scrolling recorded while paused',
  trackDomains: 'Track by domain (optional)',
  trackDomainsDesc: 'Off by default — records distance per site',
  excludeDomains: 'Excluded domains',
  excludeDomainsDesc: 'Scrolling on these sites is not counted',
  addDomain: 'example.com', add: 'Add',
  exportData: '📤 Export', importData: '📥 Import',
  clearData: '🗑️ Clear all data',
  confirmClear: 'Delete all local data? This cannot be undone.',
  confirmDelete: 'Delete', cancel: 'Cancel',
  privacyNotice: '🔒 Only distance numbers and dates are saved locally. No page content, forms, or URLs collected. Zero network requests.',
  unitLabel: 'Distance unit', unitAuto: 'Auto', unitCm: 'cm', unitM: 'm', unitKm: 'km',
  currentRoute: 'Active', back: '← Back', selectRoute: 'Select a route',
  narrative: (dist, loc) => `You scrolled ${dist} today — ${loc}.`,
  narrativeLoc: (r) => `travelling through ${r}`,
  narrativeMs: (ms) => `just passed ${ms}`,
  streak_fmt: (n) => `${n} day${n !== 1 ? 's' : ''} 🔥`,
}

const zh: T = {
  appName: 'Scroll Odyssey', appSub: '旅行日志', loading: '加载中…',
  today: '今日', total: '累计', streak: '连续', days: '天',
  noScroll: '今天还没有开始滚动，出发吧！',
  switchRoute: '换路线 →', latestMilestone: '最近里程碑',
  pause: '暂停', resume: '继续', overview: '总览', routes: '路线',
  postcard: '明信片', settings: '设置', last7: '最近 7 天',
  progress: '进度', activeRoute: '当前',
  downloadPng: '📥 下载明信片 PNG',
  pauseTracking: '暂停统计', pauseDesc: '暂停后不记录滚动距离',
  trackDomains: '按域名统计（可选）',
  trackDomainsDesc: '默认关闭，开启后记录每个网站的距离',
  excludeDomains: '排除域名',
  excludeDomainsDesc: '这些网站的滚动不会被统计',
  addDomain: 'example.com', add: '添加',
  exportData: '📤 导出', importData: '📥 导入',
  clearData: '🗑️ 清空所有数据',
  confirmClear: '确认删除全部本地数据？此操作不可撤销。',
  confirmDelete: '确认删除', cancel: '取消',
  privacyNotice: '🔒 本扩展仅在本地保存距离数字和日期，不收集网页内容、表单或 URL，不进行任何网络请求。',
  unitLabel: '距离单位', unitAuto: '自动', unitCm: 'cm', unitM: 'm', unitKm: 'km',
  currentRoute: '当前', back: '← 返回', selectRoute: '选择路线',
  narrative: (dist, loc) => `你今天滚动了 ${dist}，${loc}。`,
  narrativeLoc: (r) => `正在${r}路途中`,
  narrativeMs: (ms) => `刚刚穿过了${ms}`,
  streak_fmt: (n) => `${n} 天 🔥`,
}

export const TRANSLATIONS: Record<Lang, T> = { en, zh }
export function t(lang: Lang): T { return TRANSLATIONS[lang] }
