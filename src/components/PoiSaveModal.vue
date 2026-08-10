<script setup lang="ts">
import { ref } from 'vue'
import type { PendingImage } from '../composables/usePois'

defineProps<{
  poisJson: string
  images: PendingImage[]
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const poisCopied = ref(false)
const copiedImageIds = ref(new Set<string>())
const copyError = ref(false)

async function copyPois(json: string) {
  try {
    await navigator.clipboard.writeText(json)
    poisCopied.value = true
  } catch {
    copyError.value = true
  }
}

async function copyImage(image: PendingImage) {
  try {
    await navigator.clipboard.writeText(image.dataUrl)
    copiedImageIds.value = new Set(copiedImageIds.value).add(image.id)
  } catch {
    copyError.value = true
  }
}
</script>

<template>
  <div class="backdrop" @click.self="emit('cancel')">
    <div class="panel">
      <h2 class="title">Publish changes</h2>

      <div v-if="images.length > 0" class="section">
        <p class="body">
          Run <strong>Save POI Image</strong> once per image below, pasting in its id and data.
        </p>
        <div v-for="image in images" :key="image.id" class="image-row">
          <img :src="image.dataUrl" class="image-thumb" alt="" />
          <div class="image-row-info">
            <code class="image-id">{{ image.id }}</code>
            <button type="button" class="btn" @click="copyImage(image)">
              {{ copiedImageIds.has(image.id) ? 'Copied!' : 'Copy image data' }}
            </button>
          </div>
        </div>
      </div>

      <div class="section">
        <p class="body">
          Copy the POI data, then paste it into the <strong>pois_json</strong> field of the
          <strong>Save POIs</strong> GitHub Action to publish it.
        </p>
        <button type="button" class="btn btn-primary" @click="copyPois(poisJson)">
          {{ poisCopied ? 'Copied!' : 'Copy POI data' }}
        </button>
      </div>

      <p v-if="copyError" class="error">
        Your browser blocked the clipboard write. Try clicking the copy button again.
      </p>

      <div class="actions">
        <button type="button" class="btn" @click="emit('cancel')">Cancel</button>
        <button type="button" class="btn btn-primary" @click="emit('done')">Done</button>
      </div>
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
  width: min(420px, calc(100vw - 32px));
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
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.section {
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section:first-of-type {
  border-top: none;
  padding-top: 0;
}

.body {
  margin: 0 0 10px;
  color: #d0d0d0;
}

.image-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.image-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex: 0 0 auto;
}

.image-row-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.image-id {
  font-size: 11px;
  color: #a0a0a0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error {
  margin: 12px 0 0;
  font-size: 12px;
  color: #ff8a80;
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
