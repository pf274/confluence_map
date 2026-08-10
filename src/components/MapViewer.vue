<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
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

const zoomPercent = ref(100)

// 100% = fitted to screen (home zoom). Max zoom-in is a multiple of that,
// so it stays a consistent 1850% regardless of window/screen size.
const MAX_ZOOM_MULTIPLIER = 18.5

// Slider convention: anything at or below home zoom (100%) reads as 0%,
// and the configured max zoom-in reads as 100%.
const zoomProgress = computed(() => {
  const maxPercent = MAX_ZOOM_MULTIPLIER * 100
  const fraction = (zoomPercent.value - 100) / (maxPercent - 100)
  return Math.min(100, Math.max(0, fraction * 100))
})

function updateZoomPercent() {
  if (!viewer) return
  const viewport = viewer.viewport
  const homeZoom = viewport.getHomeZoom()
  if (!homeZoom) return
  zoomPercent.value = Math.round((viewport.getZoom(true) / homeZoom) * 100)
}

function updateMaxZoomLevel() {
  if (!viewer) return
  const viewport = viewer.viewport
  const homeZoom = viewport.getHomeZoom()
  if (!homeZoom) return
  // maxZoomLevel is a real, settable Viewport property at runtime, but
  // missing from OpenSeadragon's .d.ts (only documented in its JSDoc).
  ;(viewport as unknown as { maxZoomLevel: number }).maxZoomLevel =
    homeZoom * MAX_ZOOM_MULTIPLIER
}

onMounted(() => {
  viewer = OpenSeadragon({
    element: container.value!,
    tileSources: props.tileSource,
    showNavigator: true,
    navigatorPosition: 'BOTTOM_RIGHT',
    animationTime: 0.5,
    springStiffness: 10,
    visibilityRatio: 1,
    constrainDuringPan: true,
    gestureSettingsMouse: { clickToZoom: false },
    zoomInButton: zoomInButton.value!,
    zoomOutButton: zoomOutButton.value!,
    homeButton: homeButton.value!,
    fullPageButton: fullPageButton.value!,
  })

  viewer.addHandler('open', () => {
    updateMaxZoomLevel()
    updateZoomPercent()
  })
  viewer.addHandler('animation', updateZoomPercent)
  viewer.addHandler('resize', () => {
    updateMaxZoomLevel()
    updateZoomPercent()
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
    <div class="zoom-readout">
      <span class="zoom-readout-label">{{ zoomPercent }}%</span>
      <div class="zoom-readout-bar">
        <div class="zoom-readout-bar-fill" :style="{ width: zoomProgress + '%' }" />
      </div>
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

.zoom-readout {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  min-width: 64px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(20, 20, 24, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #f0f0f0;
  font: 600 13px/1 system-ui, sans-serif;
  letter-spacing: 0.02em;
  pointer-events: none;
}

.zoom-readout-bar {
  width: 100%;
  height: 2px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.zoom-readout-bar-fill {
  height: 100%;
  background: #fff;
  transition: width 0.1s linear;
}
</style>
