export type MicroPost = {
  slug: string
  title: string
  description: string
  date: string
  body: string[]
}

export const MICRO_POSTS: Record<string, MicroPost> = {
  hello: {
    slug: 'hello',
    title: 'hello world',
    description: 'first post — what /micro is about and why it exists.',
    date: '2026-05-12',
    body: [
      'This is /micro — a place for short notes, half-thoughts and opinions that are too small to be a real blog post but too interesting to throw away.',
      'No comments, no newsletter, no algorithm. Drag the mat around, click a note, read it, leave.',
    ],
  },
  tools: {
    slug: 'tools',
    title: 'tools I use',
    description: 'a short list of the software I keep on my desk in 2026.',
    date: '2026-05-12',
    body: [
      'Editor: WebStorm for almost everything, VS Code when I need a quick file open.',
      'Terminal: Windows Terminal with PowerShell. Boring, works.',
      'AI: Claude Code as my pair, daily.',
    ],
  },
  ideas: {
    slug: 'ideas',
    title: 'random ideas',
    description: 'scribbles and side-project seeds I might come back to.',
    date: '2026-05-12',
    body: [
      'A tiny CLI that converts any Markdown file into a printable A6 zine.',
      'A browser extension that strips engagement bait from headlines.',
      'A status page for my own habits.',
    ],
  },
}
