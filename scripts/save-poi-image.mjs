// Decodes a POI image data URL (passed via env, not argv/stdin text
// interpolation, to keep it out of shell-injection territory) and writes
// an optimized JPEG to public/poi-images/<image_id>.jpg.
//
// Expects IMAGE_ID and IMAGE_DATA_URL in the environment.

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const OUT_DIR = path.join(root, 'public', 'poi-images')

const MAX_DIMENSION = 800
const QUALITY = 80

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATA_URL_RE = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i

async function main() {
  const imageId = process.env.IMAGE_ID
  const dataUrl = process.env.IMAGE_DATA_URL

  if (!imageId || !UUID_RE.test(imageId)) {
    throw new Error(`IMAGE_ID must be a UUID, got: ${imageId}`)
  }

  const match = dataUrl?.match(DATA_URL_RE)
  if (!match) {
    throw new Error('IMAGE_DATA_URL must be a data:image/...;base64,... URL')
  }

  const buffer = Buffer.from(match[2], 'base64')

  await mkdir(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, `${imageId}.jpg`)

  const resized = await sharp(buffer)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY })
    .toBuffer()

  await writeFile(outPath, resized)
  console.log(`Wrote ${outPath} (${resized.length} bytes)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
