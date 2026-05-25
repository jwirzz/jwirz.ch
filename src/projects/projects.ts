export type Project = {
  slug: string
  title: string
  description: string
  body: string[]
  tech?: string[]
  link?: string
}

export const PROJECTS: Record<string, Project> = {
  'jwirz-ch': {
    slug: 'jwirz-ch',
    title: 'jwirz.ch',
    description: 'This portfolio site — a playground for ideas.',
    body: [
      'Built with React, TypeScript and Vite. The 3D lanyard on the home page runs on Three.js with @react-three/fiber and Rapier physics.',
      'The /micro and /projects pages are a custom draggable canvas — a 4000×3000 mat you pan like a physical desk.',
    ],
    tech: ['React', 'TypeScript', 'Three.js', 'Vite'],
    link: 'https://jwirz.ch',
  },
  'lanyard': {
    slug: 'lanyard',
    title: 'Lanyard Scene',
    description: '3D conference badge on a physics rope.',
    body: [
      'Real-time 3D lanyard simulation with @react-three/fiber and Rapier joint constraints for realistic rope sway.',
      'Custom GLB model with a swappable card skin texture. Optimised as the homepage hero.',
    ],
    tech: ['Three.js', 'React Three Fiber', 'Rapier'],
  },
  'placeholder': {
    slug: 'placeholder',
    title: 'more soon',
    description: 'More projects in the works.',
    body: [
      'New things are being built. Check back soon.',
    ],
  },
}

export type FolderItem = {
  id: string
  x: number
  y: number
  slug: string
  label: string
}

export const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'jwirz-ch',    x: 1800, y: 1350, slug: 'jwirz-ch',    label: 'jwirz.ch' },
  { id: 'lanyard',     x: 2100, y: 1500, slug: 'lanyard',     label: 'lanyard' },
  { id: 'placeholder', x: 1950, y: 1650, slug: 'placeholder', label: 'more soon' },
]
