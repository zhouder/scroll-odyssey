# Scroll Odyssey 🧳

**[🇨🇳 中文](README.zh-CN.md)**

---

> ⚡ **Install in 30 seconds** — [Chrome Web Store](#install) (coming soon) · [Download ZIP](#install) · [Build from source](#build-from-source)

---

Turn your daily web scrolling into a real-world journey. Walk the Great Wall. Cycle Taiwan. Cross the Sahara. One webpage at a time.

![popup screenshot](screenshots/popup.png)

<!-- TODO: add docs/demo.gif — suggested flow: scroll a long page → badge updates → open popup → show route progress + milestone + postcard + 7-day trend -->

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

### 📦 Package locally (optional)

After `npm run build`, run:

```bash
npm run package
```

This creates `scroll-odyssey-extension.zip` in the project root — upload it to Chrome Web Store or share directly.

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

### Why these permissions?

| Permission | What it enables | What it does NOT do |
|---|---|---|
| `storage` | Saves your route progress and daily distance locally | Never sends data anywhere |
| `scripting` | Injects content script to measure scroll distance | Does not read page content or text |
| `<all_urls>` | Lets the script run on any http/https page | Does not collect URLs or domain names |

No notifications permission is used — milestone alerts are shown inside the extension popup only.

## Distance conversion

> 1 pixel ≈ 0.2646 mm at 96 DPI → 1 m ≈ 3 780 px

Actual values vary with screen DPI and OS scaling; this is a calibrated estimate.

## Development

```bash
npm test        # unit tests (vitest)
npm run lint    # ESLint
npm run build   # outputs to dist/
npm run package # zip dist/ → scroll-odyssey-extension.zip
```

## License

MIT
