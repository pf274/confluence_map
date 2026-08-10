<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import OpenSeadragon from 'openseadragon'

const props = withDefaults(
  defineProps<{
    tileSource?: string
  }>(),
  {
    tileSource: `${import.meta.env.BASE_URL}tiles/big_map.dzi`,
  },
)

const container = useTemplateRef<HTMLDivElement>('container')
const zoomInButton = useTemplateRef<HTMLButtonElement>('zoomInButton')
const zoomOutButton = useTemplateRef<HTMLButtonElement>('zoomOutButton')
const homeButton = useTemplateRef<HTMLButtonElement>('homeButton')
const fullPageButton = useTemplateRef<HTMLButtonElement>('fullPageButton')
let viewer: OpenSeadragon.Viewer | null = null

onMounted(() => {
  viewer = OpenSeadragon({
    element: container.value!,
    tileSources: props.tileSource,
    showNavigator: true,
    navigatorPosition: 'BOTTOM_RIGHT',
    animationTime: 0.5,
    springStiffness: 10,
    maxZoomPixelRatio: 2,
    visibilityRatio: 1,
    constrainDuringPan: true,
    gestureSettingsMouse: { clickToZoom: false },
    zoomInButton: zoomInButton.value!,
    zoomOutButton: zoomOutButton.value!,
    homeButton: homeButton.value!,
    fullPageButton: fullPageButton.value!,
  })
})

onUnmounted(() => {
  viewer?.destroy()
  viewer = null
})
</script>

<template>
  <div class="map-viewer">
    <div ref="container" class="osd-container" />
    <div class="controls">
      <button ref="zoomInButton" type="button" class="control-btn">+</button>
      <button ref="zoomOutButton" type="button" class="control-btn">−</button>
      <button ref="homeButton" type="button" class="control-btn">Home</button>
      <button ref="fullPageButton" type="button" class="control-btn">Full</button>
    </div>
  </div>
</template>

<style scoped>
.map-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
}

.osd-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(20, 20, 24, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #f0f0f0;
  font: 600 13px/1 system-ui, sans-serif;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.control-btn:hover {
  background: rgba(40, 40, 46, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
}

.control-btn:active {
  background: rgba(60, 60, 68, 0.8);
}
</style>
