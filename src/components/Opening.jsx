import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../animations/scrollAnimations'
import { OPENING_KEY } from '../animations/heroAnimations'

const WORDS = ['ORCADES', 'DIGITAL', 'WORLDS']

/*
  A title card, not a loading screen. The page underneath is already live;
  this just sets the tone for ~1.8s. Any input skips straight to the end.
*/
export default function Opening({ onReveal, onDone }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const root = ref.current
    try {
      sessionStorage.setItem(OPENING_KEY, '1')
    } catch {
      /* private mode — fine, it just plays again */
    }

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.opening__word')
      // start offset lives in GSAP, never in CSS, so yPercent doesn't stack on a parsed y
      gsap.set('.opening__word .split-char', { yPercent: 105 })
      const tl = gsap.timeline({ onComplete: onDone })

      tl.to('.opening__bar', { scaleX: 1, duration: 1.75, ease: 'power2.inOut' }, 0)

      words.forEach((w, i) => {
        const chars = w.querySelectorAll('.split-char')
        const at = i * 0.5
        tl.fromTo(
          chars,
          { yPercent: 105 },
          { yPercent: 0, duration: 0.5, ease: 'expo.out', stagger: 0.025 },
          at,
        )
        if (i < words.length - 1) {
          tl.to(chars, { yPercent: -105, duration: 0.4, ease: 'expo.in', stagger: 0.018 }, at + 0.34)
        }
      })

      tl.addLabel('reveal', '+=0.15')
      tl.call(() => onReveal?.(), null, 'reveal')
      tl.to('.opening__word:last-child .split-char', {
        yPercent: -105,
        duration: 0.5,
        ease: 'expo.in',
        stagger: 0.015,
      }, 'reveal-=0.2')
      tl.to('.opening__meta', { autoAlpha: 0, duration: 0.3 }, 'reveal-=0.2')
      tl.to('.opening__half--top', { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, 'reveal')
      tl.to('.opening__half--bottom', { yPercent: 100, duration: 1.05, ease: 'expo.inOut' }, 'reveal')

      const skip = () => {
        if (tl.progress() < tl.labels.reveal / tl.duration()) tl.seek('reveal')
        tl.timeScale(2.2)
        remove()
      }
      const events = ['pointerdown', 'keydown', 'wheel', 'touchstart']
      const remove = () => events.forEach((e) => window.removeEventListener(e, skip))
      events.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }))
      return remove
    }, root)

    return () => ctx.revert()
  }, [onReveal, onDone])

  return (
    <div ref={ref} className="opening" aria-hidden="true">
      <div className="opening__half opening__half--top" />
      <div className="opening__half opening__half--bottom" />

      <div className="opening__words">
        {WORDS.map((word) => (
          <span className="opening__word" key={word}>
            {word.split('').map((c, i) => (
              <span className="split-char" key={i}>
                {c}
              </span>
            ))}
          </span>
        ))}
      </div>

      <div className="opening__meta">
        <span className="t-label">N°00 — Enter</span>
        <span className="opening__bar" />
        <span className="t-label t-muted">Press anything to skip</span>
      </div>
    </div>
  )
}
