import { useEffect, useRef } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'

/*
  The four chapter visuals. Each one is a small working demo of the
  service it sits next to, and only runs while its chapter is on stage.
*/

/* ------------------------------------------------------------------
   01 — a browser you can look into
   ------------------------------------------------------------------ */

export function BrowserWorld({ active }) {
  const tiltRef = useRef(null)

  useEffect(() => {
    const tilt = tiltRef.current
    if (!active || profile.touch || profile.reduced) return

    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 1.1, ease: 'power3.out' })
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 1.1, ease: 'power3.out' })
    const onMove = (e) => {
      ry((e.clientX / window.innerWidth - 0.5) * 26)
      rx(-(e.clientY / window.innerHeight - 0.5) * 18)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      ry(0)
      rx(0)
    }
  }, [active])

  return (
    <div
      className="bw"
      role="img"
      aria-label="A browser window whose layers float apart in 3D, following your cursor"
    >
      <div className="bw__tilt" ref={tiltRef}>
        <div className="bw__window">
          <div className="bw__bar" aria-hidden="true">
            <span className="bw__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="bw__url">your-world.com</span>
          </div>
          <div className="bw__screen" aria-hidden="true">
            <div className="bw__layer bw__layer--grid" style={{ '--z': 0 }} />
            <div className="bw__layer bw__layer--orb" style={{ '--z': 70 }}>
              <span className="bw__orb" />
            </div>
            <div className="bw__layer bw__layer--word" style={{ '--z': 120 }}>
              <span>ENTER</span>
            </div>
            <div className="bw__layer bw__layer--chips" style={{ '--z': 180 }}>
              <span className="bw__chip bw__chip--a">scroll-linked</span>
              <span className="bw__chip bw__chip--b">webgl</span>
              <span className="bw__chip bw__chip--c">motion</span>
            </div>
            <div className="bw__layer bw__layer--cursor" style={{ '--z': 240 }}>
              <svg className="bw__cursor" viewBox="0 0 24 24" width="26" height="26">
                <path d="M4 3l15 7.5-6.2 1.8L10.9 19z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
