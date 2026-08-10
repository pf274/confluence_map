<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import OpenSeadragon from 'openseadragon'

const props = withDefaults(
  defineProps<{
    tileSource?: string
  }>(),
  {
    tileSource: '/tiles/big_map.dzi',
  },
)

const container = useTemplateRef<HTMLDivElement>('container')
let viewer: OpenSeadragon.Viewer | null = null

onMounted(() => {
  viewer = OpenSeadragon({
    element: container.value!,
    tileSources: props.tileSource,
    prefixUrl: '/openseadragon-images/',
    showNavigator: true,
    navigatorPosition: 'BOTTOM_RIGHT',
    animationTime: 0.5,
    springStiffness: 10,
    maxZoomPixelRatio: 2,
    visibilityRatio: 1,
    constrainDuringPan: true,
    gestureSettingsMouse: { clickToZoom: false },
  })
})

onUnmounted(() => {
  viewer?.destroy()
  viewer = null
})
</script>

<template>
  <div ref="container" class="map-viewer" />
</template>

<style scoped>
.map-viewer {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
}
</style>
