import { useEffect, useRef, useState } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'
import { animate, stagger } from '../animations/interactionAnimations'

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

/* ------------------------------------------------------------------
   02 — the same six pieces: an idea, then a system, then a product
   ------------------------------------------------------------------ */

const FLOW_STEPS = ['Idea', 'System', 'Product']

// x, y, w, h in % of the stage; r in px
const FLOW_LAYOUT = {
  Idea: [
    { x: 45, y: 43.75, w: 10, h: 12.5, r: 999, o: 1 },
    { x: 47, y: 46, w: 6, h: 8, r: 999, o: 0 },
    { x: 47, y: 46, w: 6, h: 8, r: 999, o: 0 },
    { x: 47, y: 46, w: 6, h: 8, r: 999, o: 0 },
    { x: 47, y: 46, w: 6, h: 8, r: 999, o: 0 },
    { x: 47, y: 46, w: 6, h: 8, r: 999, o: 0 },
  ],
  System: [
    { x: 4, y: 8, w: 22, h: 13, r: 999, o: 1 },
    { x: 39, y: 43, w: 22, h: 14, r: 999, o: 1 },
    { x: 74, y: 8, w: 22, h: 13, r: 999, o: 1 },
    { x: 74, y: 79, w: 22, h: 13, r: 999, o: 1 },
    { x: 4, y: 79, w: 22, h: 13, r: 999, o: 1 },
    { x: 39, y: 79, w: 22, h: 13, r: 999, o: 1 },
  ],
  Product: [
    { x: 0, y: 0, w: 21, h: 100, r: 10, o: 1 },
    { x: 24, y: 0, w: 76, h: 12, r: 10, o: 1 },
    { x: 24, y: 16, w: 37, h: 32, r: 10, o: 1 },
    { x: 64, y: 16, w: 36, h: 32, r: 10, o: 1 },
    { x: 24, y: 52, w: 76, h: 32, r: 10, o: 1 },
    { x: 24, y: 88, w: 28, h: 12, r: 10, o: 1 },
  ],
}

const FLOW_LABELS = {
  Idea: ['what if…', '', '', '', '', ''],
  System: ['UI', 'API', 'Auth', 'Data', 'Jobs', 'Integrations'],
  Product: ['', 'Dashboard', 'Today', 'Queue', '', 'Ship it'],
}

// connections from the API node, in stage % (centres of the System layout)
const FLOW_LINES = [
  [15, 14.5, 50, 50],
  [85, 14.5, 50, 50],
  [85, 85.5, 50, 50],
  [15, 85.5, 50, 50],
  [50, 85.5, 50, 50],
]

export function SoftwareFlow({ active }) {
  const stageRef = useRef(null)
  const [step, setStep] = useState(0)
  const [manual, setManual] = useState(false)
  const name = FLOW_STEPS[step]

  // morph the six blocks to the current layout
  useEffect(() => {
    const blocks = stageRef.current.querySelectorAll('.sf__block')
    const layout = FLOW_LAYOUT[name]
    const d = profile.reduced ? 0 : 1000
    blocks.forEach((b, i) => {
      const g = layout[i]
      animate(b, {
        left: `${g.x}%`,
        top: `${g.y}%`,
        width: `${g.w}%`,
        height: `${g.h}%`,
        borderRadius: `${g.r}px`,
        opacity: g.o,
        duration: d,
        delay: profile.reduced ? 0 : i * 55,
        ease: 'inOutExpo',
      })
    })
    const lines = stageRef.current.querySelectorAll('.sf__lines line')
    animate(lines, {
      strokeDashoffset: name === 'System' ? 0 : 100,
      opacity: name === 'System' ? 1 : 0,
      duration: profile.reduced ? 0 : 700,
      delay: stagger(80, { start: name === 'System' ? 450 : 0 }),
      ease: 'outQuad',
    })
  }, [name])

  // walk through the steps on its own while on stage, until someone takes over
  useEffect(() => {
    if (!active || manual || profile.reduced) return
    const id = setInterval(() => setStep((s) => (s + 1) % FLOW_STEPS.length), 2600)
    return () => clearInterval(id)
  }, [active, manual])

  const first = FLOW_LAYOUT.Idea

  return (
    <div className="sf">
      <div className="sf__steps" role="group" aria-label="Show a stage of the build">
        {FLOW_STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            className={i === step ? 'is-on' : ''}
            aria-pressed={i === step}
            onClick={() => {
              setManual(true)
              setStep(i)
            }}
            data-cursor="hover"
          >
            <span className="t-label">{String(i + 1).padStart(2, '0')}</span> {s}
          </button>
        ))}
      </div>

      <div
        className={`sf__stage is-${name.toLowerCase()}`}
        ref={stageRef}
        role="img"
        aria-label={`Stage: ${name}. The same six pieces rearrange from a single idea into a connected system, then into a product interface.`}
      >
        <div className="sf__frame">
        <svg className="sf__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {FLOW_LINES.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength="100" />
          ))}
        </svg>
        {first.map((g, i) => (
          <div
            key={i}
            className={`sf__block sf__block--${i}`}
            aria-hidden="true"
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              width: `${g.w}%`,
              height: `${g.h}%`,
              borderRadius: `${g.r}px`,
              opacity: g.o,
            }}
          >
            <span className="sf__label">{FLOW_LABELS[name][i]}</span>
            {i === 4 && (
              <svg className="sf__chart" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline points="0,34 12,30 24,31 36,22 48,25 60,15 72,17 84,8 100,6" />
              </svg>
            )}
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
