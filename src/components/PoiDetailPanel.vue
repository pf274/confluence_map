<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Poi } from '../types/poi'
import { usePois } from '../composables/usePois'
import { resizeImageToDataUrl } from '../utils/resizeImage'

const props = defineProps<{
  poi: Poi
  startInEditMode: boolean
  isNew: boolean
}>()

const emit = defineEmits<{
  save: [poi: Poi]
  close: []
}>()

const { addPendingImage, removePendingImage, getImageUrl, deletePoi } = usePois()

const editing = ref(props.startInEditMode)
const title = ref(props.poi.title)
const description = ref(props.poi.description)
const minZoomVisible = ref(props.poi.min_zoom_visible)
const imageId = ref(props.poi.image_id)
const imageProcessing = ref(false)

const previewUrl = computed(() => getImageUrl(imageId.value))

// The panel instance is reused across different POIs (parent toggles
// `poi` while keeping the component mounted), so fields need to reset
// whenever the underlying POI changes.
watch(
  () => props.poi,
  (poi) => {
    editing.value = props.startInEditMode
    title.value = poi.title
    description.value = poi.description
    minZoomVisible.value = poi.min_zoom_visible
    imageId.value = poi.image_id
  },
)

function startEditing() {
  editing.value = true
}

async function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  imageProcessing.value = true
  try {
    const dataUrl = await resizeImageToDataUrl(file)
    // Replacing an image only just added this session (never published)?
    // Drop the orphaned pending upload rather than leaving it dangling.
    if (imageId.value) removePendingImage(imageId.value)
    imageId.value = addPendingImage(dataUrl)
  } finally {
    imageProcessing.value = false
  }
}

function removeImage() {
  if (imageId.value) removePendingImage(imageId.value)
  imageId.value = undefined
}

function save() {
  emit('save', {
    ...props.poi,
    title: title.value.trim() || 'Untitled',
    description: description.value.trim(),
    min_zoom_visible: minZoomVisible.value,
    image_id: imageId.value,
  })
}

function remove() {
  if (!window.confirm('Delete this point of interest?')) return
  deletePoi(props.poi.id)
  emit('close')
}

function cancel() {
  if (props.isNew) {
    if (imageId.value) removePendingImage(imageId.value)
    emit('close')
    return
  }
  title.value = props.poi.title
  description.value = props.poi.description
  minZoomVisible.value = props.poi.min_zoom_visible
  if (imageId.value && imageId.value !== props.poi.image_id) removePendingImage(imageId.value)
  imageId.value = props.poi.image_id
  editing.value = false
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="backdrop" @click.self="cancel">
    <div class="panel">
      <template v-if="editing">
        <label class="field">
          <span class="field-label">Title</span>
          <input v-model="title" type="text" placeholder="Title" autofocus />
        </label>
        <label class="field">
          <span class="field-label">Description</span>
          <textarea v-model="description" rows="4" placeholder="Description" />
        </label>
        <label class="field">
          <span class="field-label">Minimum zoom to appear ({{ minZoomVisible }}%)</span>
          <input v-model.number="minZoomVisible" type="range" min="100" max="1850" step="10" />
        </label>
        <div class="field">
          <span class="field-label">Image</span>
          <img v-if="previewUrl" :src="previewUrl" class="image-preview" alt="" />
          <p v-if="imageProcessing" class="hint">Processing image…</p>
          <div class="image-controls">
            <input type="file" accept="image/*" @change="onImageSelected" />
            <button v-if="previewUrl" type="button" class="btn" @click="removeImage">
              Remove image
            </button>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-danger" @click="remove">Delete</button>
          <button type="button" class="btn" @click="cancel">Cancel</button>
          <button type="button" class="btn btn-primary" @click="save">Save</button>
        </div>
      </template>
      <template v-else>
        <div class="view-layout">
          <div class="view-text">
            <h2 class="title">{{ poi.title }}</h2>
            <p class="description">{{ poi.description || 'No description yet.' }}</p>
          </div>
          <img v-if="previewUrl" :src="previewUrl" class="image-preview" alt="" />
        </div>
        <div class="actions">
          <button type="button" class="btn" @click="close">Close</button>
          <button type="button" class="btn btn-primary" @click="startEditing">Edit</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.panel {
  width: min(480px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(24, 24, 28, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #f0f0f0;
  font: 14px/1.5 system-ui, sans-serif;
}

.view-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.view-text {
  flex: 1 1 auto;
  min-width: 0;
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.description {
  margin: 0;
  white-space: pre-wrap;
  color: #d0d0d0;
}

.image-preview {
  flex: 0 0 auto;
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 8px;
  display: block;
}

.image-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.image-controls input[type='file'] {
  color: #d0d0d0;
  font-size: 12px;
  max-width: 100%;
}

.hint {
  margin: 0 0 8px;
  font-size: 12px;
  color: #a0a0a0;
}

.field {
  display: block;
  margin-bottom: 12px;
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #a0a0a0;
}

.field input[type='text'],
.field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #f0f0f0;
  font: inherit;
  resize: vertical;
}

.field input[type='range'] {
  width: 100%;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.actions .btn-danger {
  margin-right: auto;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #f0f0f0;
  font: 600 13px/1 system-ui, sans-serif;
  cursor: pointer;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-primary {
  border-color: rgba(120, 170, 255, 0.5);
  background: rgba(80, 130, 220, 0.6);
}

.btn-primary:hover {
  background: rgba(90, 145, 240, 0.75);
}

.btn-danger {
  border-color: rgba(224, 71, 62, 0.5);
  background: rgba(180, 55, 48, 0.35);
}

.btn-danger:hover {
  background: rgba(200, 60, 52, 0.5);
}
</style>
