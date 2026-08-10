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
  position: relative;
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
