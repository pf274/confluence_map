// Generates a Deep Zoom Image (DZI) tile pyramid from big_map.png so the
// viewer can pan/zoom without ever loading the full-resolution image at once.
//
// Usage: node scripts/generate-tiles.mjs
//
// Output: public/tiles/big_map.dzi + public/tiles/big_map_files/<level>/<col>_<row>.jpeg

import { mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const SOURCE = path.join(root, 'big_map.png')
const OUT_DIR = path.join(root, 'public', 'tiles')
const OUT_BASENAME = path.join(OUT_DIR, 'big_map')

const TILE_SIZE = 256
const OVERLAP = 1
const QUALITY = 85

async function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(`Source image not found: ${SOURCE}`)
  }

  await rm(path.join(OUT_DIR, 'big_map.dzi'), { force: true })
  await rm(path.join(OUT_DIR, 'big_map_files'), { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  console.log('Reading source image metadata...')
  const meta = await sharp(SOURCE).metadata()
  console.log(`Source: ${meta.width}x${meta.height}`)

  console.log('Generating Deep Zoom tile pyramid (this can take a while)...')
  await sharp(SOURCE, { limitInputPixels: false })
    .tile({
      size: TILE_SIZE,
      overlap: OVERLAP,
      layout: 'dz',
      quality: QUALITY,
    })
    .toFile(OUT_BASENAME)

  console.log(`Done. Wrote ${OUT_BASENAME}.dzi and ${OUT_BASENAME}_files/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
