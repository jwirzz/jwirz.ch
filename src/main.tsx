import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Projects from './Projects.tsx'
import Micro from './Micro.tsx'
import MicroPost from './MicroPost.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/micro" element={<Micro />} />
        <Route path="/micro/:slug" element={<MicroPost />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
