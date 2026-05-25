import './Project.css'
import { useRef, useCallback, useState } from 'react'
import { Move } from 'lucide-react'
import DraggableMat, { MAT_WIDTH, MAT_HEIGHT } from './components/DraggableMat'
import DesktopWindow from './components/DesktopWindow'
import FolderIcon from './components/FolderIcon'
import { PROJECTS, INITIAL_FOLDERS, type FolderItem } from './projects/projects'

const CLICK_THRESHOLD = 5

type OpenWindow = {
  id: string
  x: number
  y: number
  zIndex: number
}

export default function Projects() {
  const matOffset = useRef({
    x: (window.innerWidth  - MAT_WIDTH)  / 2,
    y: (window.innerHeight - MAT_HEIGHT) / 2,
  })

  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS)
  const folderDrag = useRef<{
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

  const openWindow = (id: string, folderMatX: number, folderMatY: number) => {
    const screenX = folderMatX + matOffset.current.x
    const screenY = folderMatY + matOffset.current.y
    setWindows(prev => {
      const existing = prev.find(w => w.id === id)
      if (existing) {
        maxZ.current += 1
        return prev.map(w => w.id === id ? { ...w, zIndex: maxZ.current } : w)
      }
      maxZ.current += 1
      return [...prev, {
        id,
        x: Math.min(Math.max(screenX + 30, 10), window.innerWidth  - 420),
        y: Math.min(Math.max(screenY - 30, 10), window.innerHeight - 200),
        zIndex: maxZ.current,
      }]
    })
  }

  const closeWindow = (id: string) => setWindows(prev => prev.filter(w => w.id !== id))
  const focusWindow = (id: string) => {
    maxZ.current += 1
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ.current } : w))
  }
  const moveWindow  = (id: string, x: number, y: number) =>
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w))

  // --- Folder drag handlers ---
  const onFolderPointerDown = (e: React.PointerEvent<HTMLDivElement>, folder: FolderItem) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    folderDrag.current = {
      id: folder.id, startX: e.clientX, startY: e.clientY,
      originX: folder.x, originY: folder.y, moved: false,
    }
  }

  const onFolderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const fd = folderDrag.current
    if (!fd.id) return
    const dx = e.clientX - fd.startX
    const dy = e.clientY - fd.startY
    if (!fd.moved && Math.hypot(dx, dy) > CLICK_THRESHOLD) fd.moved = true
    if (!fd.moved) return
    e.stopPropagation()
    const nx = clamp(fd.originX + dx, 0, MAT_WIDTH)
    const ny = clamp(fd.originY + dy, 0, MAT_HEIGHT)
    setFolders(prev => prev.map(f => f.id === fd.id ? { ...f, x: nx, y: ny } : f))
  }, [])

  const onFolderPointerUp = (e: React.PointerEvent<HTMLDivElement>, folder: FolderItem) => {
    const fd = folderDrag.current
    const wasClick = fd.id === folder.id && !fd.moved
    folderDrag.current = { id: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false }
    if (wasClick) {
      e.stopPropagation()
      openWindow(folder.id, folder.x, folder.y)
    }
  }

  return (
    <>
      <DraggableMat offsetRef={matOffset}>
        {/* Welcome banner */}
        <div className="projects-welcome">
          <div className="projects-welcome-heading">/projects</div>
          <div className="projects-welcome-title">Things I've Built</div>
          <div className="projects-welcome-hint">
            <Move size={16} />
            drag to explore — click a folder to open
          </div>
        </div>

        {/* Folder icons */}
        {folders.map(folder => (
          <FolderIcon
            key={folder.id}
            label={folder.label}
            x={folder.x}
            y={folder.y}
            onPointerDown={(e) => onFolderPointerDown(e, folder)}
            onPointerMove={onFolderPointerMove}
            onPointerUp={(e) => onFolderPointerUp(e, folder)}
          />
        ))}
      </DraggableMat>

      {/* In-place windows */}
      {windows.map(win => {
        const project = PROJECTS[win.id]
        if (!project) return null
        return (
          <DesktopWindow
            key={win.id}
            id={win.id}
            path={`projects\\${win.id}`}
            x={win.x}
            y={win.y}
            zIndex={win.zIndex}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMove={moveWindow}
          >
            <h2 className="desktop-window-title">{project.title}</h2>
            <p className="desktop-window-date">{project.description}</p>
            <hr className="desktop-window-divider" />
            {project.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {project.tech && project.tech.length > 0 && (
              <div className="desktop-window-tags">
                {project.tech.map(t => (
                  <span key={t} className="desktop-window-tag">{t}</span>
                ))}
              </div>
            )}
            {project.link && (
              <>
                <hr className="desktop-window-divider" />
                <a
                  className="desktop-window-link"
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit project →
                </a>
              </>
            )}
          </DesktopWindow>
        )
      })}
    </>
  )
}
