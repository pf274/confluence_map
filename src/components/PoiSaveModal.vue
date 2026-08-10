<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  publish: () => string
}>()

const emit = defineEmits<{
  close: []
}>()

const copied = ref(false)
const copyFailed = ref(false)

async function copyToClipboard() {
  const json = props.publish()
  try {
    await navigator.clipboard.writeText(json)
    copied.value = true
  } catch {
    copyFailed.value = true
  }
}
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <template v-if="!copied && !copyFailed">
        <h2 class="title">Publish points of interest</h2>
        <p class="body">
          Copy the updated list, then paste it into the <strong>pois_json</strong> field of the
          <strong>Save POIs</strong> GitHub Action to publish it.
        </p>
        <div class="actions">
          <button type="button" class="btn" @click="emit('close')">Cancel</button>
          <button type="button" class="btn btn-primary" @click="copyToClipboard">
            Copy to Clipboard
          </button>
        </div>
      </template>
      <template v-else-if="copied">
        <h2 class="title">Copied!</h2>
        <p class="body">
          Now go to <strong>Actions → Save POIs → Run workflow</strong> on GitHub and paste it in.
        </p>
        <div class="actions">
          <button type="button" class="btn btn-primary" @click="emit('close')">Done</button>
        </div>
      </template>
      <template v-else>
        <h2 class="title">Couldn't access the clipboard</h2>
        <p class="body">Your browser blocked the clipboard write. Try again or copy manually.</p>
        <div class="actions">
          <button type="button" class="btn" @click="emit('close')">Close</button>
          <button type="button" class="btn btn-primary" @click="copyToClipboard">
            Try Again
          </button>
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

.body {
  margin: 0;
  color: #d0d0d0;
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
