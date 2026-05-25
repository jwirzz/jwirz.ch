import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import './MicroPost.css'
import { MICRO_POSTS } from './micro/posts'

const SITE_URL = 'https://jwirz.ch'

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function MicroPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? MICRO_POSTS[slug] : undefined

  useEffect(() => {
    if (!post) {
      document.title = 'Not found — /micro'
      return
    }
    const url = `${SITE_URL}/micro/${post.slug}`
    document.title = `${post.title} — /micro · Jonathan Wirz`
    setMeta('description', post.description)
    setMeta('og:title', post.title, 'property')
    setMeta('og:description', post.description, 'property')
    setMeta('og:type', 'article', 'property')
    setMeta('og:url', url, 'property')
    setMeta('twitter:title', post.title)
    setMeta('twitter:description', post.description)
    setCanonical(url)

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { '@type': 'Person', name: 'Jonathan Wirz', url: SITE_URL },
      mainEntityOfPage: url,
    })
    document.head.appendChild(ld)
    return () => { ld.remove() }
  }, [post])

  if (!post) {
    return (
      <main className="micro-post">
        <Link to="/micro" className="micro-post-back">← /micro</Link>
        <h1>Not found</h1>
        <p>This note doesn't exist (yet).</p>
      </main>
    )
  }

  const formatted = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <main className="micro-post">
      <Link to="/micro" className="micro-post-back">← /micro</Link>
      <article>
        <header>
          <h1>{post.title}</h1>
          <time dateTime={post.date}>{formatted}</time>
        </header>
        {post.body.map((p, i) => <p key={i}>{p}</p>)}
      </article>
      <footer className="micro-post-footer">
        <Link to="/">← back to home</Link>
      </footer>
    </main>
  )
}
