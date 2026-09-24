import { useEffect, useRef, useState } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'
import { animate, createTimer, rollText, stagger } from '../animations/interactionAnimations'

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

/* ------------------------------------------------------------------
   03 — a system that keeps going after launch
   ------------------------------------------------------------------ */

const LOOP = ['Build', 'Monitor', 'Improve', 'Scale']
const LOOP_R = 140
const SIGNAL_POINTS = 36

function signalPath(values) {
  const w = 168
  const step = w / (values.length - 1)
  return values.map((v, i) => `${(116 + i * step).toFixed(1)},${(212 - v * 26).toFixed(1)}`).join(' ')
}

export function LivingSystem({ active }) {
  const rootRef = useRef(null)
  const versionRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const nodes = root.querySelectorAll('.ls__node')
    const polyline = root.querySelector('.ls__signal')
    let current = -1
    const light = (i) => {
      if (i === current) return
      current = i
      nodes.forEach((n, k) => n.classList.toggle('is-on', k === i))
      root.classList.toggle('is-scaling', i === 3)
    }

    if (!active || profile.reduced) {
      light(profile.reduced ? 0 : -1)
      return
    }

    // the pulse orbits; whichever stage it's passing lights up
    let minor = 0
    let patch = 0
    const orbit = animate(root.querySelector('.ls__orbit'), {
      rotate: { from: 0, to: 360 },
      duration: 7200,
      ease: 'linear',
      loop: true,
      onUpdate: (self) => {
        const deg = (self.iterationProgress ?? 0) * 360
        light(Math.floor(((deg + 45) % 360) / 90))
      },
      onLoop: () => {
        patch += 1
        if (patch > 2) {
          patch = 0
          minor += 1
        }
        rollText(versionRef.current, `v1.${minor}.${patch}`)
      },
    })

    // a live-looking signal: a smoothed random walk, redrawn a few times a second
    const values = Array.from({ length: SIGNAL_POINTS }, () => 0)
    let v = 0
    const signal = createTimer({
      duration: 130,
      loop: true,
      onLoop: () => {
        v += (Math.random() - 0.5) * 0.7
        v *= 0.82
        values.shift()
        values.push(Math.max(-1, Math.min(1, v + (Math.random() < 0.06 ? 0.9 : 0))))
        polyline.setAttribute('points', signalPath(values))
      },
    })

    return () => {
      orbit.pause()
      signal.pause()
    }
  }, [active])

  const initialSignal = signalPath(Array.from({ length: SIGNAL_POINTS }, () => 0))

  return (
    <div className="ls" ref={rootRef}>
      <svg
        viewBox="0 0 400 400"
        className="ls__svg"
        role="img"
        aria-label="A loop of build, monitor, improve and scale, with a pulse travelling around it and a live signal in the middle"
      >
        <circle className="ls__echo" cx="200" cy="200" r={LOOP_R} />
        <circle className="ls__ring" cx="200" cy="200" r={LOOP_R} />

        <g className="ls__orbit">
          <circle
            className="ls__trail"
            cx="200"
            cy="200"
            r={LOOP_R}
            pathLength="100"
            transform="rotate(-90 200 200)"
          />
          <circle className="ls__pulse" cx="200" cy={200 - LOOP_R} r="6" />
        </g>

        {LOOP.map((label, i) => {
          const a = (i * Math.PI) / 2 - Math.PI / 2
          const x = 200 + Math.cos(a) * LOOP_R
          const y = 200 + Math.sin(a) * LOOP_R
          return (
            <g className="ls__node" key={label} transform={`translate(${x} ${y})`}>
              <g className="ls__node-body">
                <circle r="34" />
                <text dy="4" textAnchor="middle">
                  {label.toUpperCase()}
                </text>
              </g>
            </g>
          )
        })}

        <rect className="ls__panel" x="104" y="160" width="192" height="92" rx="10" />
        <text className="ls__panel-label" x="116" y="178">
          SIGNAL
        </text>
        <polyline className="ls__signal" points={initialSignal} />
      </svg>

      <p className="ls__version t-label" aria-live="off">
        <span className="t-muted">release</span>
        <span className="ls__version-roll">
          <span ref={versionRef}>v1.0.0</span>
        </span>
      </p>
    </div>
  )
}
