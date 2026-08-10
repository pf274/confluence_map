import { computed, ref } from 'vue'
import type { Poi } from '../types/poi'
import seedPois from '../data/pois.json'

const STORAGE_KEY = 'confluence-map-poi-drafts'

export interface PendingImage {
  id: string
  dataUrl: string
}

interface StoredDrafts {
  pois: Poi[]
  images: PendingImage[]
}

function loadStoredDrafts(): StoredDrafts {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { pois: [], images: [] }
    const parsed = JSON.parse(raw) as Partial<StoredDrafts>
    return { pois: parsed.pois ?? [], images: parsed.images ?? [] }
  } catch {
    return { pois: [], images: [] }
  }
}

function persist(pois: Poi[], images: PendingImage[]) {
  if (pois.length === 0 && images.length === 0) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pois, images } satisfies StoredDrafts))
}

const seedIds = new Set((seedPois as Poi[]).map((poi) => poi.id))
const initialStored = loadStoredDrafts()

// Dirty (created/edited/deleted-but-not-yet-published) POIs, keyed by id.
// Restored from localStorage on load so a page refresh doesn't wipe unsaved
// work. Deletion is represented as an upsert with `deleted: true` rather
// than removal, so the Save POIs Action can see it and clean up.
const dirtyPois = ref<Map<string, Poi>>(new Map(initialStored.pois.map((poi) => [poi.id, poi])))

// Images attached to dirty POIs that haven't been published (and thus
// committed to public/poi-images/) yet, keyed by image_id.
const pendingImages = ref<Map<string, string>>(
  new Map(initialStored.images.map((img) => [img.id, img.dataUrl])),
)

function persistCurrent() {
  persist([...dirtyPois.value.values()], [...pendingImages.value.entries()].map(([id, dataUrl]) => ({ id, dataUrl })))
}

// Published seed data with dirty edits/additions/deletions layered on top,
// including deleted entries (needed so the Save POIs Action can see and
// act on them).
const mergedAll = computed<Poi[]>(() => {
  const merged = new Map<string, Poi>((seedPois as Poi[]).map((poi) => [poi.id, poi]))
  for (const [id, poi] of dirtyPois.value) {
    merged.set(id, poi)
  }
  return [...merged.values()]
})

// What should actually be rendered on the map.
const pois = computed<Poi[]>(() => mergedAll.value.filter((poi) => !poi.deleted))

const dirtyCount = computed(() => dirtyPois.value.size)

function savePoi(poi: Poi) {
  const next = new Map(dirtyPois.value)
  next.set(poi.id, poi)
  dirtyPois.value = next
  persistCurrent()
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

function deletePoi(id: string) {
  const current = mergedAll.value.find((poi) => poi.id === id)

  const nextPois = new Map(dirtyPois.value)
  if (seedIds.has(id)) {
    // Published upstream — mark for the Save POIs Action to remove.
    nextPois.set(id, { ...(current as Poi), deleted: true })
  } else {
    // Never published — just forget it, no tombstone needed.
    nextPois.delete(id)
  }
  dirtyPois.value = nextPois

  // An image attached in this same session that never got published has
  // nothing to clean up upstream — just drop it locally. An already-
  // published image is left for the Action's diff-based cleanup.
  if (current?.image_id && pendingImages.value.has(current.image_id)) {
    const nextImages = new Map(pendingImages.value)
    nextImages.delete(current.image_id)
    pendingImages.value = nextImages
  }

  persistCurrent()
}

function addPendingImage(dataUrl: string): string {
  const id = crypto.randomUUID()
  const next = new Map(pendingImages.value)
  next.set(id, dataUrl)
  pendingImages.value = next
  persistCurrent()
  return id
}

function removePendingImage(id: string) {
  if (!pendingImages.value.has(id)) return
  const next = new Map(pendingImages.value)
  next.delete(id)
  pendingImages.value = next
  persistCurrent()
}

// Local preview for an unpublished image; falls back to the committed
// repo path once it's been published (or if it always was published).
function getImageUrl(imageId: string | undefined): string | undefined {
  if (!imageId) return undefined
  const pending = pendingImages.value.get(imageId)
  if (pending) return pending
  return `${import.meta.env.BASE_URL}poi-images/${imageId}.jpg`
}

function isNew(id: string): boolean {
  return !seedIds.has(id)
}

// The full merged list, including deleted:true entries — the Save POIs
// Action needs to see those to know what to strip and which images it can
// clean up. Compact, so it pastes cleanly into a single-line GitHub
// Actions text input.
const poisJson = computed(() => JSON.stringify(mergedAll.value))

const pendingImagesList = computed<PendingImage[]>(() =>
  [...pendingImages.value.entries()].map(([id, dataUrl]) => ({ id, dataUrl })),
)

// Called once the user has copied everything they need out of the save
// modal — the Action run(s) take over from here.
function clearPublished() {
  dirtyPois.value = new Map()
  pendingImages.value = new Map()
  persistCurrent()
}

export function usePois() {
  return {
    pois,
    dirtyCount,
    savePoi,
    createDraftPoi,
    deletePoi,
    addPendingImage,
    removePendingImage,
    getImageUrl,
    isNew,
    poisJson,
    pendingImagesList,
    clearPublished,
  }
}
