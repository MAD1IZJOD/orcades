import { useEffect, useRef, useState } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'

const CONCEPTS = [
  {
    id: 'commerce',
    title: 'Immersive commerce',
    line: 'A store you explore instead of scroll.',
    idea: 'Products sit in a space, not a grid. You orbit them, pick them up, and the checkout never feels like leaving the world.',
    build: ['3D product stage with real-time lighting', 'Scroll-choreographed collection stories', 'A checkout that stays fast and boring in the right ways'],
    stack: ['Three.js', 'GSAP', 'Headless commerce'],
  },
  {
    id: 'system',
    title: 'Product system',
    line: 'One product, from the interface to the backend.',
    idea: 'A tool a small team opens every morning. One codebase, a clear API, and a design system that keeps it consistent as it grows.',
    build: ['Web app with a component design system', 'API, auth and data model', 'Background jobs, integrations and monitoring'],
    stack: ['React', 'Node / APIs', 'Postgres'],
  },
  {
    id: 'founder',
    title: 'Founder story',
    line: 'A deck that turns a startup idea into a clear narrative.',
    idea: 'Ten slides that make an investor lean in: the problem lands in one sentence, the product shows up early, and the ask is obvious.',
    build: ['Narrative structure and slide-by-slide script', 'Visual system, diagrams and product shots', 'A presenter version and a send-ahead version'],
    stack: ['Storytelling', 'Information design', 'Keynote / Figma'],
  },
]

function WorkArt({ id }) {
  if (id === 'commerce') {
    return (
      <div className="art art--commerce">
        <span className="art__ring" />
        <span className="art__ring art__ring--2" />
        <span className="art__product" />
        <span className="art__pedestal" />
        <span className="art__tag t-label">Add to bag</span>
      </div>
    )
  }
  if (id === 'system') {
    return (
      <div className="art art--system">
        {['Interface', 'API', 'Data'].map((l, i) => (
          <span key={l} className="art__plane" style={{ '--i': i }}>
            <em className="t-label">{l}</em>
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="art art--founder">
      {['Problem', 'Product', 'Ask'].map((l, i) => (
        <span key={l} className="art__slide" style={{ '--i': i }}>
          <em className="t-label">{l}</em>
        </span>
      ))}
    </div>
  )
}

export default function Work() {
  const ref = useRef(null)
  const previewRef = useRef(null)
  const [open, setOpen] = useState(-1)
  const [hovered, setHovered] = useState(-1)

  // desktop: a small window onto each concept follows the pointer
  useEffect(() => {
    const root = ref.current
    const preview = previewRef.current
    if (profile.touch || profile.reduced) return

    // offset lives in GSAP too, so it composes with the x/y it drives
    gsap.set(preview, { xPercent: 12, yPercent: -62 })
    const x = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3.out' })
    const y = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3.out' })
    const rot = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3.out' })
    const pointer = { x: 0, y: 0 }

    const place = () => {
      const r = root.getBoundingClientRect()
      x(pointer.x - r.left)
      y(pointer.y - r.top)
    }
    const onMove = (e) => {
      rot(gsap.utils.clamp(-8, 8, (e.clientX - pointer.x) * 0.4))
      pointer.x = e.clientX
      pointer.y = e.clientY
      place()
    }
    // the page moves under a still pointer too
    const onScroll = () => place()

    root.addEventListener('pointermove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={ref} id="work" className="work section" data-world="trust" aria-labelledby="work-title">
      <div className="wrap">
        <header className="work__head">
          <p className="t-label t-muted">N°03 — Concept studies</p>
          <h2 id="work-title" className="work__title" data-reveal="lines">
            <span className="split-line">
              <span>What we</span>{' '}
            </span>
            <span className="split-line">
              <span>
                can <em>build.</em>
              </span>
            </span>
          </h2>
          <p className="work__disclaimer t-body" data-reveal="fade">
            ORCADES is new, so there's no wall of logos here. These are concept studies, the kind of work we're
            built for. They're not client projects.
          </p>
        </header>

        <ol className="work__list" onPointerLeave={() => setHovered(-1)}>
          {CONCEPTS.map((c, i) => {
            const isOpen = open === i
            return (
              <li key={c.id} className={`work__item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="work__row"
                    aria-expanded={isOpen}
                    aria-controls={`concept-${c.id}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    onPointerEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    data-cursor="project"
                    data-cursor-label={isOpen ? 'Close' : 'Open'}
                  >
                    <span className="work__num t-label">{String(i + 1).padStart(2, '0')} / Concept</span>
                    <span className="work__name">{c.title}</span>
                    <span className="work__line">{c.line}</span>
                    <span className="work__toggle" aria-hidden="true" />
                  </button>
                </h3>
                <div className="work__detail" id={`concept-${c.id}`} role="region" aria-label={`${c.title} concept`}>
                  <div className="work__detail-inner">
                    <div className="work__art-inline" aria-hidden="true">
                      <WorkArt id={c.id} />
                    </div>
                    <div className="work__cols">
                      <div>
                        <p className="t-label t-muted">The idea</p>
                        <p className="work__idea">{c.idea}</p>
                      </div>
                      <div>
                        <p className="t-label t-muted">What we'd build</p>
                        <ul className="work__build">
                          {c.build.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        <p className="work__stack t-label">{c.stack.join(' · ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div
        ref={previewRef}
        className={`work__preview${hovered >= 0 && open !== hovered ? ' is-visible' : ''}`}
        aria-hidden="true"
      >
        {CONCEPTS.map((c, i) => (
          <div key={c.id} className={`work__preview-frame${hovered === i ? ' is-current' : ''}`}>
            <WorkArt id={c.id} />
          </div>
        ))}
      </div>
    </section>
  )
}
