import { useEffect, useRef } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'
import { animate } from '../animations/interactionAnimations'

/*
  Desktop only. States come from the nearest [data-cursor] (or any link /
  button): default → dot, hover → ring, cta → volt disc with an arrow,
  project → big volt disc with a label.
*/
const SCALE = { default: 0, hover: 0.46, cta: 0.56, project: 1 }

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (profile.touch || profile.reduced) return
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    const root = document.documentElement
    root.classList.add('has-cursor')

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 })
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })

    let state = 'default'
    let visible = false
    const disc = ring.firstElementChild

    const setState = (next, text = '') => {
      if (next === state && label.textContent === text) return
      state = next
      ring.dataset.state = next
      label.textContent = text
      animate(disc, {
        scale: SCALE[next],
        duration: next === 'default' ? 450 : 700,
        ease: next === 'default' ? 'outExpo' : 'outElastic(1, .65)',
      })
      animate(dot, { opacity: next === 'default' || next === 'hover' ? 1 : 0, duration: 200 })
    }

    const onMove = (e) => {
      if (!visible) {
        visible = true
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY })
        animate([dot, ring], { opacity: 1, duration: 250 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }

    const onOver = (e) => {
      const el = e.target.closest?.('[data-cursor], a, button, label, [role="button"]')
      if (!el) return setState('default')
      const kind = el.dataset.cursor || 'hover'
      const text = kind === 'project' ? el.dataset.cursorLabel || 'Open' : ''
      setState(kind, text)
    }

    const onDown = () => animate(disc, { scale: SCALE[state] * 0.82, duration: 180, ease: 'outQuad' })
    const onUp = () => animate(disc, { scale: SCALE[state], duration: 600, ease: 'outElastic(1, .5)' })
    const onLeave = () => {
      visible = false
      animate([dot, ring], { opacity: 0, duration: 250 })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  if (profile.touch || profile.reduced) return null

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__ring" ref={ringRef} data-state="default">
        {/* inline so anime.js reads the starting scale */}
        <div className="cursor__disc" style={{ transform: 'scale(0)' }}>
          <span className="cursor__label" ref={labelRef} />
          <svg className="cursor__arrow" viewBox="0 0 24 24" width="22" height="22">
            <path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="cursor__dot" ref={dotRef} />
    </div>
  )
}
