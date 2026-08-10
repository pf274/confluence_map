const MAX_DIMENSION = 480

// GitHub Actions workflow_dispatch text inputs cap out around 65,535
// characters. Stay comfortably under that so the resulting data URL fits
// alongside the rest of the "Save POI Image" form.
const TARGET_MAX_CHARS = 58_000

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl)
      reject(err)
    }
    img.src = objectUrl
  })
}

function drawToDataUrl(img: HTMLImageElement, width: number, height: number, quality: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

// Resizes/compresses an image client-side until its data URL fits within
// the transport size budget. This is a hard requirement (not just a nicety)
// for images to survive the copy-paste-into-a-GitHub-Action publish flow.
export async function resizeImageToDataUrl(file: File): Promise<string> {
  const img = await loadImage(file)
  let scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  let quality = 0.75
  let dataUrl = ''

  for (let attempt = 0; attempt < 10; attempt++) {
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))
    dataUrl = drawToDataUrl(img, width, height, quality)
    if (dataUrl.length <= TARGET_MAX_CHARS) return dataUrl

    if (quality > 0.4) {
      quality -= 0.15
    } else {
      scale *= 0.75
    }
  }

  return dataUrl
}
