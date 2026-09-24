import { gsap, profile, sceneState, ScrollTrigger } from './scrollAnimations'

/*
  The hero has three layers of motion that never fight each other:
  - intro   → the letters surface (runs once)
  - scroll  → the wordmark breaks apart in 3D (outer .hero__char)
  - pointer → each glyph leans toward the cursor (.hero__glyph)
  the intro itself lives on the innermost .hero__in
*/

export const OPENING_KEY = 'orcades:opened'

// the title card plays once per session, and never for reduced motion
export function shouldPlayOpening() {
  if (profile.reduced) return false
  try {
    return !sessionStorage.getItem(OPENING_KEY)
  } catch {
    return true
  }
}

export function heroIntro(root) {
  const chars = root.querySelectorAll('.hero__in')
  const rest = root.querySelectorAll('[data-hero-fade]')

  if (profile.reduced) {
    gsap.set([chars, rest], { autoAlpha: 1 })
    return gsap.timeline()
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.fromTo(
    chars,
    { yPercent: 115, rotationX: -95, autoAlpha: 0, transformOrigin: '50% 100% -60px' },
    {
      yPercent: 0,
      rotationX: 0,
      autoAlpha: 1,
      duration: 1.5,
      stagger: { each: 0.07, from: 'center' },
    },
  )
  tl.fromTo(
    rest,
    { y: 20, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'power3.out' },
    '-=0.9',
  )
  return tl
}

export function heroScroll(root) {
  const ctx = gsap.context(() => {
    const stage = root.querySelector('.hero__stage')
    const chars = gsap.utils.toArray(root.querySelectorAll('.hero__char'))
    const mid = (chars.length - 1) / 2
    const short = profile.small

    // reduced motion: no pin, no flight — the page just scrolls
    if (profile.reduced) {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => (sceneState.heroOut = self.progress),
      })
      return
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: short ? '+=70%' : '+=135%',
        pin: stage,
        scrub: 0.9,
        onUpdate: (self) => (sceneState.heroOut = self.progress),
        onLeave: () => (sceneState.heroOut = 1),
        onLeaveBack: () => (sceneState.heroOut = 0),
      },
    })

    chars.forEach((el, i) => {
      const d = i - mid
      if (d === 0) {
        // the centre letter: the camera passes straight through it
        // it hollows into a volt outline first, so the fly-through reads as a frame, not a slab
        const glyph = el.querySelector('.hero__in')
        tl.to(el, { scale: short ? 7 : 11, z: 200, ease: 'power2.in' }, 0)
        tl.to(glyph, { color: 'rgba(201, 255, 59, 0)', duration: 0.22 }, 0.04)
        tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.62)
        return
      }
      const dir = Math.sign(d)
      tl.to(
        el,
        {
          xPercent: d * (short ? 110 : 160),
          yPercent: (i % 2 ? -1 : 1) * (40 + Math.abs(d) * 25),
          z: 260 + Math.abs(d) * 140,
          rotationY: dir * (55 + Math.abs(d) * 18),
          rotationX: (i % 2 ? 1 : -1) * (25 + Math.abs(d) * 10),
          rotationZ: dir * Math.abs(d) * 6,
          autoAlpha: 0,
          ease: 'power2.in',
        },
        0,
      )
    })

    tl.to(root.querySelector('.hero__ui'), { autoAlpha: 0, y: -30, duration: 0.35 }, 0)
    tl.fromTo(
      root.querySelector('.hero__echo'),
      { autoAlpha: 0, scale: 0.85 },
      { autoAlpha: 1, scale: 1, duration: 0.4 },
      0.55,
    )
  }, root)

  return () => ctx.revert()
}

export function heroPointer(root) {
  if (profile.touch || profile.reduced) return () => {}

  const glyphs = [...root.querySelectorAll('.hero__glyph')]
  const movers = glyphs.map((g) => ({
    el: g,
    ry: gsap.quickTo(g, 'rotationY', { duration: 0.9, ease: 'power3.out' }),
    rx: gsap.quickTo(g, 'rotationX', { duration: 0.9, ease: 'power3.out' }),
    z: gsap.quickTo(g, 'z', { duration: 0.9, ease: 'power3.out' }),
  }))

  let rects = []
  const measure = () => {
    rects = glyphs.map((g) => {
      const r = g.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
  }
  measure()

  const onMove = (e) => {
    movers.forEach((m, i) => {
      const c = rects[i]
      const dx = (e.clientX - c.x) / window.innerWidth
      const dy = (e.clientY - c.y) / window.innerHeight
      const near = Math.max(0, 1 - Math.hypot(dx * 1.6, dy * 1.2))
      m.ry(dx * 38)
      m.rx(-dy * 30)
      m.z(near * near * 120)
    })
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('resize', measure)
  window.addEventListener('scroll', measure, { passive: true })
  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('resize', measure)
    window.removeEventListener('scroll', measure)
  }
}
