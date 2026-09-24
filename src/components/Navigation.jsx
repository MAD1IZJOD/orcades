import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { lockScroll, profile, ScrollTrigger, scrollToTarget, smoothLink } from '../animations/scrollAnimations'
import { animate, scramble, stagger } from '../animations/interactionAnimations'
import { EMAIL } from './Contact'

const LINKS = [
  ['Services', '#services'],
  ['Work', '#work'],
  ['About', '#about'],
  ['Contact', '#contact'],
]

const WORLD_LABEL = {
  enter: 'N°00 — Enter',
  realize: 'N°01 — Realize',
  explore: 'N°02 — Explore',
  trust: 'N°03 — Concepts',
  about: 'N°04 — About',
  contact: 'N°05 — Contact',
}

export default function Navigation() {
  const barRef = useRef(null)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)
  const chapterRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  // the chapter readout follows the story
  useEffect(() => {
    const onWorld = (e) => {
      const el = chapterRef.current
      const next = WORLD_LABEL[e.detail]
      if (!el || !next || el.dataset.text === next) return
      el.dataset.text = next
      el.textContent = next
      scramble(el, { duration: 600 })
    }
    window.addEventListener('orcades:world', onWorld)
    return () => window.removeEventListener('orcades:world', onWorld)
  }, [])

  // get out of the way while reading down, come back when scrolling up
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setHidden(self.direction === 1 && self.scroll() > window.innerHeight * 0.8),
    })
    return () => st.kill()
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // menu open / close choreography + focus handling
  useLayoutEffect(() => {
    const menu = menuRef.current
    const page = [document.getElementById('main'), document.querySelector('.footer')]
    if (open) {
      lockScroll(true)
      page.forEach((el) => el?.setAttribute('inert', ''))
      menu.querySelector('a')?.focus({ preventScroll: true })
      if (!profile.reduced) {
        animate(menu, {
          clipPath: { from: 'circle(0% at 100% 0%)', to: 'circle(150% at 100% 0%)' },
          duration: 900,
          ease: 'inOutExpo',
        })
        animate(menu.querySelectorAll('.menu__link'), {
          translateY: { from: '110%', to: '0%' },
          duration: 900,
          delay: stagger(70, { start: 250 }),
          ease: 'outExpo',
        })
        animate(menu.querySelectorAll('[data-menu-fade]'), {
          opacity: { from: 0, to: 1 },
          duration: 600,
          delay: stagger(80, { start: 550 }),
        })
      }
    }
    return () => {
      if (!open) return
      lockScroll(false)
      page.forEach((el) => el?.removeAttribute('inert'))
    }
  }, [open])

  // returning focus only after an actual close
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) toggleRef.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      // keep Tab inside the menu while it's open
      if (e.key === 'Tab') {
        const items = [toggleRef.current, ...menuRef.current.querySelectorAll('a, button')]
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const go = (e) => {
    const href = e.currentTarget.getAttribute('href')
    e.preventDefault()
    setOpen(false)
    // let the page come back to life before gliding
    requestAnimationFrame(() => {
      scrollToTarget(href)
      history.replaceState(null, '', href)
    })
  }

  return (
    <>
      <header
        ref={barRef}
        className={`nav${hidden && !open ? ' is-hidden' : ''}${open ? ' is-open' : ''}`}
      >
        <a href="#top" className="nav__logo" onClick={smoothLink} aria-label="ORCADES — back to top" data-cursor="hover">
          <span className="nav__mark" aria-hidden="true" />
          ORCADES
        </a>

        <p className="nav__chapter t-label" aria-hidden="true">
          <span ref={chapterRef}>{WORLD_LABEL.enter}</span>
        </p>

        <div className="nav__right">
          <a href="#contact" className="nav__cta t-label" onClick={smoothLink} data-cursor="hover">
            Start a project
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            data-cursor="hover"
          >
            <span className="nav__toggle-text t-label">{open ? 'Close' : 'Menu'}</span>
            <span className="nav__burger" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        className={`menu${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
      >
        <nav className="menu__inner wrap" aria-label="Main">
          <ol className="menu__list">
            {LINKS.map(([label, href], i) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={go}
                  onPointerEnter={(e) => scramble(e.currentTarget.querySelector('.menu__text'), { duration: 420 })}
                  data-cursor="hover"
                >
                  <span className="menu__link">
                    <span className="menu__num t-label">{String(i + 1).padStart(2, '0')}</span>
                    <span className="menu__text">{label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <div className="menu__foot">
            <p className="t-label t-muted" data-menu-fade>
              Digital experiences, software and stories.
            </p>
            <a href={`mailto:${EMAIL}`} className="menu__email" data-menu-fade data-cursor="cta">
              {EMAIL}
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
