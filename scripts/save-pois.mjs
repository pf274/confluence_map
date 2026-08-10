// Applies an incoming POI list (from POIS_JSON in the environment) to
// src/data/pois.json: strips entries marked deleted:true, and deletes any
// poi-images/<id>.jpg that's no longer referenced by a surviving POI
// (because its POI was deleted, or it swapped to a different image).

import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const POIS_PATH = path.join(root, 'src', 'data', 'pois.json')
const IMAGES_DIR = path.join(root, 'public', 'poi-images')

function main() {
  const raw = process.env.POIS_JSON
  if (!raw) throw new Error('POIS_JSON is required')

  const incoming = JSON.parse(raw)
  if (!Array.isArray(incoming)) throw new Error('Expected a JSON array of POIs')

  const oldPois = existsSync(POIS_PATH) ? JSON.parse(readFileSync(POIS_PATH, 'utf8')) : []
  const oldImageIds = new Set(oldPois.filter((poi) => poi.image_id).map((poi) => poi.image_id))

  const finalPois = incoming.filter((poi) => !poi.deleted)
  const keepImageIds = new Set(finalPois.filter((poi) => poi.image_id).map((poi) => poi.image_id))

  for (const id of oldImageIds) {
    if (keepImageIds.has(id)) continue
    const file = path.join(IMAGES_DIR, `${id}.jpg`)
    if (existsSync(file)) {
      unlinkSync(file)
      console.log(`Removed orphaned image ${file}`)
    }
  }

  writeFileSync(POIS_PATH, JSON.stringify(finalPois, null, 2) + '\n')
  console.log(`Wrote ${POIS_PATH} (${finalPois.length} POIs)`)
}

main()
