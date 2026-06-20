# Scroll Odyssey 🧳

**[English](README.md)** | **[中文](README.zh-CN.md)**

Turn your daily web scrolling into an offline journey.

![popup screenshot](screenshots/popup.png)

## What it does

Every pixel you scroll moves you forward along a real-world route. Scroll enough and you'll "walk" the Appalachian Trail, cycle Taiwan, or cross the Sahara — one web page at a time.

- **10 built-in routes** — marathon, Great Wall, Tokyo walk, Paris promenade, Silk Road, Taiwan circle, Camino de Santiago, Appalachian Trail, Sahara crossing, Beijing hutong
- **Accurate distance** — pixel → meter conversion based on 96 DPI standard (1 m ≈ 3780 px); displayed in cm / m / km
- **Milestones** — unlock named waypoints as you progress
- **Travel postcard** — generate and download a PNG card for any route
- **7-day trend chart** — see your scrolling history at a glance
- **Streak counter** — daily streak with 🔥
- **Language toggle** — English / 中文
- **100% offline** — no server, no account, no telemetry

## Install

### Load from source

```bash
git clone https://github.com/zhouder/scroll-odyssey
cd scroll-odyssey
npm install
npm run build
```

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder

## Usage

- Scroll any page — the badge shows today's km
- Click the toolbar icon for today's narrative and route progress
- Click ⚙ to open the dashboard (Overview / Routes / Postcard / Settings)

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save your scrolling data and settings locally |
| `scripting` | Inject content script to listen for scroll events |
| `host_permissions: <all_urls>` | Let the content script run on any http/https page |

## Privacy

- ✅ Only **distance numbers and dates** are saved — never page content, URLs, or form data
- ✅ Domain tracking is **off by default**; opt in from Settings
- ✅ **Zero network requests** — no data ever leaves your browser
- ✅ **One-click wipe** — Settings → Clear all data
- ✅ Automatically skips `chrome://`, `edge://`, and extension pages

All data lives in `chrome.storage.local` on your machine only.

## Distance conversion note

> 1 pixel ≈ 0.2646 mm at 96 DPI → 1 m ≈ 3 780 px

Actual values vary with screen DPI and OS scaling; this is a calibrated estimate.

## Development

```bash
npm test        # 13 unit tests (vitest)
npm run lint    # ESLint
npm run build   # outputs to dist/
```

## License

MIT
