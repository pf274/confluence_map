<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button v-if="count > 0" type="button" class="save-btn" @click="emit('click')">
    <span class="save-btn-icon">✏</span>
    <span class="save-btn-badge">{{ count }}</span>
  </button>
</template>

<style scoped>
.save-btn {
  position: absolute;
  bottom: 150px;
  right: 16px;
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(20, 20, 24, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.save-btn:hover {
  background: rgba(40, 40, 46, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
}

.save-btn-icon {
  font-size: 18px;
}

.save-btn-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0473e;
  color: #fff;
  font: 700 11px/1 system-ui, sans-serif;
}
</style>
