# Demo Recording Guide

This guide helps you create a compelling demo GIF for Scroll Odyssey.

## Recommended Tools

- **macOS**: Built-in Screen Recording (`Cmd+Shift+5`)
- **Windows**: [ShareX](https://github.com/ShareX/ShareX) (free, open source) or OBS Studio
- **Browser**: Chrome with clean profile for best visuals

## Recording Steps

1. **Prepare browser**
   - Open a fresh Chrome window with a long-scrollable page (e.g. a long article, documentation, or infinite scroll feed)
   - Resize window to a standard size (e.g. 1200×800) for consistent framing
   - Pin the Scroll Odyssey icon to the toolbar if not already visible

2. **Start recording**

3. **Open extension popup**
   - Click the Scroll Odyssey toolbar icon to show the popup
   - Let it load (shows today's distance and route narrative)

4. **Open dashboard**
   - Click the ⚙ (settings) button in the popup to open the dashboard

5. **Show Overview tab**
   - Point to the stat cards (Today / Total / Streak)
   - Point to the daily goal bar if configured
   - Point to the calendar heatmap (last 70 days)

6. **Show Routes tab**
   - Click Routes tab
   - Scroll through the 10 routes, showing progress bars

7. **Show Postcard tab**
   - Click Postcard tab
   - Click Download PNG to trigger the postcard generation
   - Show the generated canvas

8. **Show Settings tab**
   - Click Settings tab
   - Show language toggle (English / 中文)
   - Show distance unit selector
   - Show excluded domains input
   - Show Export / Import
   - End with Clear all data

9. **Stop recording**

## Post-Recording

- Crop to remove unused space (16:9 or similar ratio works well for GitHub)
- Export as GIF (or record as MP4 and convert with `ffmpeg -i video.mp4 demo.gif`)
- Recommended output: `docs/demo.gif` at roughly 800×500 px, max ~5 MB

## GIF Optimization

```bash
# Convert and compress with ffmpeg (if available)
ffmpeg -i demo.mp4 -vf "fps=15,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" demo.gif
```
