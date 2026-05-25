import './FolderIcon.css'
import type { PointerEventHandler } from 'react'

interface FolderIconProps {
  label: string
  x: number
  y: number
  onPointerDown: PointerEventHandler<HTMLDivElement>
  onPointerMove: PointerEventHandler<HTMLDivElement>
  onPointerUp: PointerEventHandler<HTMLDivElement>
}

export default function FolderIcon({
  label, x, y, onPointerDown, onPointerMove, onPointerUp,
}: FolderIconProps) {
  return (
    <div
      className="folder-icon"
      style={{ left: x, top: y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Classic folder shape: tab on top-left, body below */}
      <svg viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tab */}
        <path
          d="M2 14 C2 14 2 10 6 10 L22 10 C22 10 25 10 26 13 L28 16 L58 16 C58 16 58 14 58 16"
          fill="#f8c13a"
          stroke="#1a1a0a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Body */}
        <rect
          x="2" y="15" width="56" height="31"
          rx="3"
          fill="#fde68a"
          stroke="#1a1a0a"
          strokeWidth="1.5"
        />
        {/* Highlight stripe */}
        <rect x="2" y="15" width="56" height="5" rx="3" fill="#f8c13a" opacity="0.6" />
      </svg>
      <span className="folder-label">{label}</span>
    </div>
  )
}
