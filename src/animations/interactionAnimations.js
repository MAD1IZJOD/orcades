import { animate, createAnimatable, stagger } from 'animejs'
import { profile } from './scrollAnimations'

/*
  Anime.js owns the small, self-contained moments: counters, hovers,
  menus, the cursor. GSAP keeps the scroll choreography. The two never
  animate the same property on the same element.
*/

export { animate, stagger }

/* slot-machine swap — old text leaves upward, new text arrives from below */
export function rollText(el, next, { direction = 1 } = {}) {
  if (!el || el.textContent === String(next)) return
  if (profile.reduced) {
    el.textContent = next
    return
  }
  animate(el, {
    translateY: { to: `${-100 * direction}%` },
    opacity: { to: 0 },
    duration: 220,
    ease: 'in(3)',
    onComplete: () => {
      el.textContent = next
      animate(el, {
        translateY: { from: `${100 * direction}%`, to: '0%' },
        opacity: { from: 0, to: 1 },
        duration: 520,
        ease: 'outExpo',
      })
    },
  })
}

/* glyph scramble — letters resolve left to right */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+'

export function scramble(el, { duration = 520 } = {}) {
  if (!el || profile.reduced) return
  const final = el.dataset.text || el.textContent
  el.dataset.text = final
  const state = { p: 0 }
  animate(state, {
    p: 1,
    duration,
    ease: 'linear',
    onUpdate: () => {
      const reveal = Math.floor(state.p * final.length)
      let out = ''
      for (let i = 0; i < final.length; i++) {
        const ch = final[i]
        out += i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      el.textContent = out
    },
    onComplete: () => (el.textContent = final),
  })
}

/* magnetic pull toward the pointer while hovered */
export function magnetic(el, { strength = 0.35 } = {}) {
  if (!el || profile.touch || profile.reduced) return () => {}
  const a = createAnimatable(el, { x: 600, y: 600, ease: 'out(4)' })
  const move = (e) => {
    const r = el.getBoundingClientRect()
    a.x((e.clientX - (r.left + r.width / 2)) * strength)
    a.y((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => {
    a.x(0)
    a.y(0)
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerleave', leave)
  return () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerleave', leave)
    a.revert()
  }
}
