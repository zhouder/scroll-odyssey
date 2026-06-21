# Scroll Odyssey 🧳

**Your scrolling, reimagined as a journey.**

[![Star on GitHub](https://img.shields.io/github/stars/zhouder/scroll-odyssey?style=social)](https://github.com/zhouder/scroll-odyssey) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

> ⚡ **Install in 30 seconds** — [Chrome Web Store](#install) (coming soon) · [Download ZIP](#install) · [Build from source](#build-from-source)

---

Turn your daily web scrolling into a real-world journey. Walk the Great Wall. Cycle Taiwan. Cross the Sahara. One webpage at a time.

![popup screenshot](screenshots/popup.png)

<!-- TODO: add demo gif showing extension in action -->

## Why it matters

Most people scroll **thousands of pixels daily** without realizing it — that distance could be an Appalachian Trail thru-hike, a Silk Road expedition, or 10 laps around Tokyo. Scroll Odyssey transforms this invisible effort into visible progress along real routes, with milestones and downloadable postcards to share.

- 🌍 **10 real-world routes** — marathon, Great Wall, Tokyo, Paris, Silk Road, Taiwan, Camino, Appalachian Trail, Sahara, Beijing hutong
- 🏆 **Milestone unlocking** — named waypoints as you progress
- 🖼️ **Travel postcard PNG** — generate and share your journey
- 📊 **7-day trend chart** — visual history at a glance
- 🔥 **Streak counter** — daily continuity tracking
- 🌏 **Bilingual** — English / 中文 (toggle in settings)
- 🔒 **100% offline** — no server, no account, zero telemetry

## Install

### 🛒 Chrome Web Store
> **Coming soon** — once approved, you'll find it here.

### 📦 Download from GitHub Releases
> **Coming soon** — once a release is published, grab the `.zip` from the [Releases page](https://github.com/zhouder/scroll-odyssey/releases) and load it unpacked in Chrome.

### 🔧 Build from source

```bash
git clone https://github.com/zhouder/scroll-odyssey
cd scroll-odyssey
npm install
npm run build
```

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `dist/` folder

## Usage

- **Scroll any page** — the toolbar badge shows today's km
- **Click the icon** — see today's narrative and route progress
- **Click ⚙** — open the dashboard (Overview / Routes / Postcard / Settings)

## Privacy

Your data stays on your device. Period.

| | |
|---|---|
| ✅ | Only **distance numbers and dates** are saved — never page URLs or content |
| ✅ | Domain tracking is **off by default**; opt in from Settings |
| ✅ | **Zero network requests** — no data ever leaves your browser |
| ✅ | **One-click wipe** — Settings → Clear all data |
| ✅ | Automatically skips `chrome://`, `edge://`, and extension pages |

All data lives in `chrome.storage.local` on your machine only.

## Distance conversion

> 1 pixel ≈ 0.2646 mm at 96 DPI → 1 m ≈ 3 780 px

Actual values vary with screen DPI and OS scaling; this is a calibrated estimate.

## Development

```bash
npm test        # unit tests (vitest)
npm run lint    # ESLint
npm run build   # outputs to dist/
```

## Share & Promote

### GitHub Topics (add to repository settings)

```
chrome-extension  browser-extension  productivity  quantified-self
digital-wellbeing  gamification  scroll-tracker  react  vite
typescript  privacy-first  offline-first
```

### Social Preview Image (1280 × 640 px)

Recommended copy for your `social_preview.png`:

```
Scroll Odyssey
Turn scrolling into a journey
Walk the Great Wall. Cross the Sahara.
One webpage at a time.
```

## License

MIT
