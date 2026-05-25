import './DraggableMat.css'
import { Link } from 'react-router-dom'
import { useRef, useCallback, useEffect, type ReactNode } from 'react'

export const MAT_WIDTH = 4000
export const MAT_HEIGHT = 3000

interface DraggableMatProps {
  children?: ReactNode
  /** Ref shared with parent so parent can read current pan offset */
  offsetRef: React.MutableRefObject<{ x: number; y: number }>
}

export default function DraggableMat({ children, offsetRef }: DraggableMatProps) {
  const matRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const rafId = useRef<number | null>(null)

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

  const applyTransform = () => {
    if (matRef.current) {
      matRef.current.style.transform =
        `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`
    }
  }

  useEffect(() => { applyTransform() }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    // Children that don't want to start a mat-pan call stopPropagation on their own pointerDown
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
    }
  }, [offsetRef])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    const minX = window.innerWidth - MAT_WIDTH
    const minY = window.innerHeight - MAT_HEIGHT
    offsetRef.current = {
      x: clamp(drag.current.originX + dx, minX, 0),
      y: clamp(drag.current.originY + dy, minY, 0),
    }
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        applyTransform()
        rafId.current = null
      })
    }
  }, [offsetRef])

  const onPointerUp = useCallback(() => {
    drag.current.active = false
  }, [])

  return (
    <div
      className="mat-viewport"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="mat-surface" ref={matRef}>
        {children}
      </div>
      <Link to="/" className="mat-return">← Return</Link>
    </div>
  )
}
