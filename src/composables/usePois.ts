import { computed, ref } from 'vue'
import type { Poi } from '../types/poi'
import seedPois from '../data/pois.json'

const STORAGE_KEY = 'confluence-map-poi-drafts'

interface StoredDrafts {
  pois: Poi[]
}

function loadDrafts(): Poi[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredDrafts
    return parsed.pois ?? []
  } catch {
    return []
  }
}

function persistDrafts(drafts: Poi[]) {
  if (drafts.length === 0) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pois: drafts } satisfies StoredDrafts))
}

const seedIds = new Set((seedPois as Poi[]).map((poi) => poi.id))

// Dirty (created/edited-but-not-yet-published) POIs, keyed by id. Restored
// from localStorage on load so a page refresh doesn't wipe unsaved work.
const dirtyPois = ref<Map<string, Poi>>(new Map(loadDrafts().map((poi) => [poi.id, poi])))

// Working list: the published seed data with any dirty edits/additions
// layered on top.
const pois = computed<Poi[]>(() => {
  const merged = new Map<string, Poi>((seedPois as Poi[]).map((poi) => [poi.id, poi]))
  for (const [id, poi] of dirtyPois.value) {
    merged.set(id, poi)
  }
  return [...merged.values()]
})

const dirtyCount = computed(() => dirtyPois.value.size)

function savePoi(poi: Poi) {
  const next = new Map(dirtyPois.value)
  next.set(poi.id, poi)
  dirtyPois.value = next
  persistDrafts([...next.values()])
}

function createDraftPoi(x: number, y: number, minZoomVisible: number): Poi {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    location: { x, y },
    min_zoom_visible: minZoomVisible,
  }
}

function isDirty(id: string): boolean {
  return dirtyPois.value.has(id)
}

function isNew(id: string): boolean {
  return !seedIds.has(id)
}

// Serializes the full merged list (compact, so it pastes cleanly into a
// single-line GitHub Actions workflow_dispatch text input) and clears
// local drafts, since the Action run takes over from here.
function publishAndClear(): string {
  const json = JSON.stringify(pois.value)
  dirtyPois.value = new Map()
  persistDrafts([])
  return json
}

export function usePois() {
  return {
    pois,
    dirtyCount,
    savePoi,
    createDraftPoi,
    isDirty,
    isNew,
    publishAndClear,
  }
}
