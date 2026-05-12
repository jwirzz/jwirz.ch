import './Project.css'
import { Link } from 'react-router-dom'
import { useRef, useCallback, useEffect } from 'react'

const MAT_WIDTH = 4000
const MAT_HEIGHT = 3000

export default function Projects() {
  const matRef = useRef<HTMLDivElement>(null)
  const offset = useRef({
    x: (window.innerWidth - MAT_WIDTH) / 2,
    y: (window.innerHeight - MAT_HEIGHT) / 2,
  })
  const drag = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

  const applyTransform = () => {
    if (matRef.current) {
      matRef.current.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`
    }
  }

  useEffect(() => { applyTransform() }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('a')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.current.x,
      originY: offset.current.y,
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    const minX = window.innerWidth - MAT_WIDTH
    const minY = window.innerHeight - MAT_HEIGHT
    offset.current = {
      x: clamp(drag.current.originX + dx, minX, 0),
      y: clamp(drag.current.originY + dy, minY, 0),
    }
    applyTransform()
  }, [])

  const onPointerUp = useCallback(() => {
    drag.current.active = false
  }, [])

  return (
    <div className="micro-viewport"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="micro-mat" ref={matRef} />
      <Link to="/" className="micro-return">← Return</Link>
    </div>
  )
}
