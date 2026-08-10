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
  // Soft-delete marker. Only ever set to true client-side; the Save POIs
  // Action strips deleted entries out of the published pois.json entirely.
  deleted?: boolean
  // References an image at public/poi-images/<image_id>.jpg. Optional —
  // most POIs won't have one.
  image_id?: string
}
