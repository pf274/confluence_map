<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Poi } from '../types/poi'

const props = defineProps<{
  poi: Poi
  startInEditMode: boolean
  isNew: boolean
}>()

const emit = defineEmits<{
  save: [poi: Poi]
  close: []
}>()

const editing = ref(props.startInEditMode)
const title = ref(props.poi.title)
const description = ref(props.poi.description)
const minZoomVisible = ref(props.poi.min_zoom_visible)

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
  },
)

function startEditing() {
  editing.value = true
}

function save() {
  emit('save', {
    ...props.poi,
    title: title.value.trim() || 'Untitled',
    description: description.value.trim(),
    min_zoom_visible: minZoomVisible.value,
  })
}

function cancel() {
  if (props.isNew) {
    emit('close')
    return
  }
  title.value = props.poi.title
  description.value = props.poi.description
  minZoomVisible.value = props.poi.min_zoom_visible
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
        <div class="actions">
          <button type="button" class="btn" @click="cancel">Cancel</button>
          <button type="button" class="btn btn-primary" @click="save">Save</button>
        </div>
      </template>
      <template v-else>
        <h2 class="title">{{ poi.title }}</h2>
        <p class="description">{{ poi.description || 'No description yet.' }}</p>
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
  width: min(360px, calc(100vw - 32px));
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
</style>
