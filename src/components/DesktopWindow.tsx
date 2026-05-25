import './DesktopWindow.css'
import { useRef, type ReactNode } from 'react'

interface DesktopWindowProps {
  id: string
  /** Shown in title bar: C:\JWIRZ\{path} */
  path: string
  x: number
  y: number
  zIndex: number
  onClose: (id: string) => void
  onFocus: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  children: ReactNode
}

export default function DesktopWindow({
  id, path, x, y, zIndex, onClose, onFocus, onMove, children,
}: DesktopWindowProps) {
  const drag = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    onFocus(id)
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, originX: x, originY: y }
  }

  const onTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    const nx = drag.current.originX + (e.clientX - drag.current.startX)
    const ny = drag.current.originY + (e.clientY - drag.current.startY)
    onMove(id, Math.max(0, nx), Math.max(0, ny))
  }

  const onTitlePointerUp = () => {
    drag.current.active = false
  }

  return (
    <div
      className="desktop-window"
      style={{ left: x, top: y, zIndex }}
      onPointerDown={(e) => { e.stopPropagation(); onFocus(id) }}
    >
      <div
        className="desktop-window-titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
      >
        <span className="desktop-window-path">C:\JWIRZ\{path}</span>
        <button
          className="desktop-window-close"
          onClick={(e) => { e.stopPropagation(); onClose(id) }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Close window"
        >
          ×
        </button>
      </div>
      <div className="desktop-window-body">
        {children}
      </div>
    </div>
  )
}
