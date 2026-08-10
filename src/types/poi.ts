export interface Poi {
  id: string
  title: string
  description: string
  // Coordinates in the original big_map.png pixel space, not viewport
  // coordinates, so markers stay put regardless of window size or zoom.
  location: {
    x: number
    y: number
  }
  // Same convention as the zoom readout: 100 = fitted to screen, up to
  // 1850 = max zoom-in. The marker is hidden below this zoom level.
  min_zoom_visible: number
}
