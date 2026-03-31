import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import 'gifler'

declare global {
    interface Window {
        gifler: (url: string) => {
            frames: (canvas: HTMLCanvasElement, onDrawFrame: (ctx: CanvasRenderingContext2D, frame: any) => void, setDimensions?: boolean) => void
        }
    }
}

export function useGifTexture(url: string) {
    const canvas = useRef(document.createElement('canvas')).current
    const texture = useRef(new THREE.CanvasTexture(canvas)).current

    useEffect(() => {
        let first = true
        window.gifler(url).frames(canvas, (ctx, frame) => {
            if (first) {
                canvas.width = frame.width
                canvas.height = frame.height
                texture.image = canvas
                texture.flipY = false
                first = false
            }
            ctx.globalCompositeOperation = 'copy'
            ctx.drawImage(frame.buffer, frame.x, frame.y)
            ctx.globalCompositeOperation = 'source-over'
            texture.needsUpdate = true
        })
    }, [url])

    return texture
}
