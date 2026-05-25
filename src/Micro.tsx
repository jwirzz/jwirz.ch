import './Micro.css'
import { useRef, useCallback, useState } from 'react'
import { Move } from 'lucide-react'
import DraggableMat, { MAT_WIDTH, MAT_HEIGHT } from './components/DraggableMat'
import DesktopWindow from './components/DesktopWindow'
import { MICRO_POSTS } from './micro/posts'

const CLICK_THRESHOLD = 5

type Note = {
  id: string
  x: number
  y: number
  title: string
  preview: string
  slug: string
}

const INITIAL_NOTES: Note[] = [
  { id: 'hello', x: 2200, y: 1200, title: 'hello world',  preview: 'first post — what this place is about', slug: 'hello' },
  { id: 'tools', x: 1700, y: 1700, title: 'tools I use',  preview: 'a short list of what I keep on my desk',  slug: 'tools'  },
  { id: 'ideas', x: 2400, y: 1750, title: 'random ideas', preview: 'scribbles I might come back to',           slug: 'ideas'  },
]

type OpenWindow = {
  id: string
  x: number
  y: number
  zIndex: number
}

export default function Micro() {
  const matOffset = useRef({
    x: (window.innerWidth  - MAT_WIDTH)  / 2,
    y: (window.innerHeight - MAT_HEIGHT) / 2,
  })

  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
  const noteDrag = useRef<{
    id: string | null
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
  }>({ id: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false })

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  // --- Window state ---
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const maxZ = useRef(100)

  const openWindow = (id: string, noteMatX: number, noteMatY: number) => {
    const screenX = noteMatX + matOffset.current.x
    const screenY = noteMatY + matOffset.current.y
    setWindows(prev => {
      const existing = prev.find(w => w.id === id)
      if (existing) {
        maxZ.current += 1
        return prev.map(w => w.id === id ? { ...w, zIndex: maxZ.current } : w)
      }
      maxZ.current += 1
      return [...prev, {
        id,
        x: Math.min(Math.max(screenX + 30, 10), window.innerWidth  - 400),
        y: Math.min(Math.max(screenY - 30, 10), window.innerHeight - 200),
        zIndex: maxZ.current,
      }]
    })
  }

  const closeWindow  = (id: string) => setWindows(prev => prev.filter(w => w.id !== id))
  const focusWindow  = (id: string) => {
    maxZ.current += 1
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ.current } : w))
  }
  const moveWindow   = (id: string, x: number, y: number) =>
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w))

  // --- Note drag handlers ---
  const onNotePointerDown = (e: React.PointerEvent<HTMLDivElement>, note: Note) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    noteDrag.current = {
      id: note.id, startX: e.clientX, startY: e.clientY,
      originX: note.x, originY: note.y, moved: false,
    }
  }

  const onNotePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const nd = noteDrag.current
    if (!nd.id) return
    const dx = e.clientX - nd.startX
    const dy = e.clientY - nd.startY
    if (!nd.moved && Math.hypot(dx, dy) > CLICK_THRESHOLD) nd.moved = true
    if (!nd.moved) return
    e.stopPropagation()
    const nx = clamp(nd.originX + dx, 0, MAT_WIDTH)
    const ny = clamp(nd.originY + dy, 0, MAT_HEIGHT)
    setNotes(prev => prev.map(n => n.id === nd.id ? { ...n, x: nx, y: ny } : n))
  }, [])

  const onNotePointerUp = (e: React.PointerEvent<HTMLDivElement>, note: Note) => {
    const nd = noteDrag.current
    const wasClick = nd.id === note.id && !nd.moved
    noteDrag.current = { id: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false }
    if (wasClick) {
      e.stopPropagation()
      openWindow(note.id, note.x, note.y)
    }
  }

  return (
    <>
      <DraggableMat offsetRef={matOffset}>
        {/* Welcome banner */}
        <div className="micro-welcome">
          <div className="micro-welcome-heading">/micro</div>
          <div className="micro-welcome-title">Small Notes, Thoughts & Opinions</div>
          <div className="micro-welcome-hint">
            <Move size={16} />
            drag to explore — click a note to open
          </div>
        </div>

        {/* Sticky notes */}
        {notes.map(note => (
          <div
            key={note.id}
            className="micro-note"
            style={{ left: note.x, top: note.y }}
            onPointerDown={(e) => onNotePointerDown(e, note)}
            onPointerMove={onNotePointerMove}
            onPointerUp={(e) => onNotePointerUp(e, note)}
          >
            <div className="micro-note-title">{note.title}</div>
            <div className="micro-note-preview">{note.preview}</div>
          </div>
        ))}
      </DraggableMat>

      {/* In-place windows (screen-space, above the mat) */}
      {windows.map(win => {
        const post = MICRO_POSTS[win.id]
        if (!post) return null
        return (
          <DesktopWindow
            key={win.id}
            id={win.id}
            path={`micro\\${win.id}`}
            x={win.x}
            y={win.y}
            zIndex={win.zIndex}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMove={moveWindow}
          >
            <h2 className="desktop-window-title">{post.title}</h2>
            <p className="desktop-window-date">{post.date}</p>
            <hr className="desktop-window-divider" />
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <hr className="desktop-window-divider" />
            <a className="desktop-window-link" href={`/micro/${win.id}`}>
              Open full page →
            </a>
          </DesktopWindow>
        )
      })}
    </>
  )
}
