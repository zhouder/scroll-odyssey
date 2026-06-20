// generate simple placeholder icons as PNG via canvas
// run: node --input-type=module < scripts/gen-icons.mjs
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

for (const size of [16, 48, 128]) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a0a00'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#E85D04'
  ctx.font = `bold ${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🧳', size / 2, size / 2)
  writeFileSync(`public/icons/icon${size}.png`, canvas.toBuffer('image/png'))
  console.log(`icon${size}.png written`)
}
