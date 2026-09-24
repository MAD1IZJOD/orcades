import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------
   device + motion profile — decided once, read everywhere
   ------------------------------------------------------------------ */

const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const profile = {
  reduced: mq('(prefers-reduced-motion: reduce)'),
  touch: mq('(hover: none), (pointer: coarse)'),
  small: mq('(max-width: 767px)'),
  get lowPower() {
    const cores = navigator.hardwareConcurrency || 4
    const mem = navigator.deviceMemory || 8
    return cores <= 4 || mem <= 4 || this.small
  },
}

/* ------------------------------------------------------------------
   shared scene state — the DOM story writes, the 3D world reads.
   Plain object on purpose: no re-renders, read inside rAF.
   ------------------------------------------------------------------ */

export const sceneState = {
  progress: 0, // 0 → 1 over the whole page
  velocity: 0, // scroll velocity, normalised-ish
  pointerX: 0, // -1 → 1
  pointerY: 0, // -1 → 1
  world: 'enter', // which chapter of the story we are in
  heroOut: 0, // 0 → 1 as the hero wordmark breaks apart
}

/* ------------------------------------------------------------------
   smooth scroll
   ------------------------------------------------------------------ */

let lenis = null

export function initSmoothScroll() {
  if (profile.reduced) return null

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // native touch scrolling feels better than anything we could fake
    syncTouch: false,
  })

  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
    lenis = null
  }
}

export function getLenis() {
  return lenis
}

export function scrollToTarget(target, { offset = 0, immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el && target !== 0) return
  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset, immediate, duration: 1.6 })
  } else {
    const top = el ? el.getBoundingClientRect().top + window.scrollY + offset : 0
    window.scrollTo({ top, behavior: immediate || profile.reduced ? 'auto' : 'smooth' })
  }
}

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/* ------------------------------------------------------------------
   page-level tracking → sceneState
   ------------------------------------------------------------------ */

export function trackPage() {
  const onPointer = (e) => {
    sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
    sceneState.pointerY = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  const page = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      sceneState.progress = self.progress
      sceneState.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 3000)
    },
  })

  // every [data-world] section announces itself when it owns the viewport centre
  const worlds = gsap.utils.toArray('[data-world]').map((el) =>
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) {
          sceneState.world = el.dataset.world
          window.dispatchEvent(new CustomEvent('orcades:world', { detail: el.dataset.world }))
        }
      },
    }),
  )

  return () => {
    window.removeEventListener('pointermove', onPointer)
    page.kill()
    worlds.forEach((t) => t.kill())
  }
}

/* ------------------------------------------------------------------
   generic reveals — one coordinated pattern instead of a hundred
   ------------------------------------------------------------------ */

export function revealOnScroll(scope) {
  const ctx = gsap.context(() => {
    if (profile.reduced) return

    gsap.utils.toArray('[data-reveal="lines"]').forEach((el) => {
      const lines = el.querySelectorAll('.split-line > span')
      gsap.from(lines, {
        yPercent: 110,
        rotate: 2,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      })
    })

    gsap.utils.toArray('[data-reveal="fade"]').forEach((el) => {
      gsap.from(el, {
        y: 28,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    })
  }, scope)
  return () => ctx.revert()
}

export { gsap, ScrollTrigger }
