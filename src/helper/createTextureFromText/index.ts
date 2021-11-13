import * as THREE from 'three'
import Config from './interfaces'

export default async function createTexture({
  color = '#7f7f7f',
  backgroundColor = 'black',
  backgroundImage = undefined,
  text = 'undefined',
  font = '20px Arial',
}: Config) {
  let c = document.createElement('canvas')
  let step = 64
  c.width = step * 16
  c.height = step
  const ctx = c.getContext('2d')

  if (!ctx) return

  if (backgroundImage) {
    const img = new Image(128, 128)

    await new Promise<void>(resolve => {
      img.onload = () => {
        const pattern = ctx.createPattern(img, 'repeat')

        if (pattern) {
          ctx.fillStyle = pattern
        }

        resolve()
      }

      img.src = backgroundImage
    })
  } else {
    ctx.fillStyle = backgroundColor
  }

  // ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 100, 30)

  return new THREE.CanvasTexture(c)
}
