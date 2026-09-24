import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { animate, magnetic, stagger } from '../animations/interactionAnimations'
import { gsap, profile } from '../animations/scrollAnimations'

export const EMAIL = 'madhavansahu@gmail.com'

const TYPES = [
  'Immersive website',
  '3D / WebGL experience',
  'Software product',
  'Software management',
  'Pitch deck',
  'Not sure yet',
]
const TIMELINES = ['As soon as possible', 'In 1–3 months', 'Just exploring']
const STEPS = ['Project', 'Idea', 'You', 'Send']

function buildMailto({ types, idea, name, timeline }) {
  const subject = `New project${types.length ? ` — ${types.join(', ')}` : ''}`
  const body = [
    'Hi ORCADES,',
    '',
    types.length ? `Project type: ${types.join(', ')}` : null,
    timeline ? `Timeline: ${timeline}` : null,
    '',
    "What we're building:",
    idea.trim() || '(tell us a little here)',
    '',
    name.trim() ? `— ${name.trim()}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function Contact() {
  const ref = useRef(null)
  const emailRef = useRef(null)
  const panelRef = useRef(null)
  const headingRef = useRef(null)
  const startRef = useRef(null)
  const started = useRef(false)
  const [step, setStep] = useState(-1) // -1: not started
  const [types, setTypes] = useState([])
  const [idea, setIdea] = useState('')
  const [name, setName] = useState('')
  const [timeline, setTimeline] = useState('')
  const [copied, setCopied] = useState(false)

  const mailto = useMemo(() => buildMailto({ types, idea, name, timeline }), [types, idea, name, timeline])

  // the headline assembles itself as the section arrives
  useEffect(() => {
    const root = ref.current
    if (profile.reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.contact__word', {
        yPercent: 110,
        rotate: 4,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => magnetic(emailRef.current, { strength: 0.18 }), [])

  // every step change: new content slides in, focus follows it
  useLayoutEffect(() => {
    if (step < 0) {
      // closing the brief hands focus back to where it began
      if (started.current) startRef.current?.focus({ preventScroll: true })
      return
    }
    started.current = true
    headingRef.current?.focus({ preventScroll: true })
    if (profile.reduced) return
    animate(panelRef.current.querySelectorAll('[data-step-item]'), {
      opacity: { from: 0, to: 1 },
      translateY: { from: 24, to: 0 },
      duration: 650,
      delay: stagger(55),
      ease: 'outExpo',
    })
  }, [step])

  const toggleType = (t) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the mailto link is right there anyway */
    }
  }

  return (
    <section ref={ref} id="contact" className="contact section" data-world="contact" aria-labelledby="contact-title">
      <div className="wrap contact__inner">
        <p className="t-label t-muted">N°05 — Contact</p>

        <h2 id="contact-title" className="contact__title">
          {['What', 'are we', 'building?'].map((w) => (
            <span className="split-line" key={w}>
              <span className="contact__word">{w}</span>{' '}
            </span>
          ))}
        </h2>

        <div className="contact__email-row">
          <a
            ref={emailRef}
            className="contact__email"
            href={`mailto:${EMAIL}`}
            data-cursor="cta"
            aria-label={`Email ORCADES at ${EMAIL}`}
          >
            {EMAIL}
          </a>
          <button type="button" className="contact__copy t-label" onClick={copyEmail} data-cursor="hover">
            <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
          </button>
        </div>

        <div className="brief" ref={panelRef}>
          {step < 0 ? (
            <div className="brief__start">
              <p className="t-lead">
                Your idea is the start.
                <br />
                <span className="t-muted">We build what comes next.</span>
              </p>
              <button
                ref={startRef}
                type="button"
                className="btn btn--volt"
                onClick={() => setStep(0)}
                data-cursor="cta"
              >
                Start a project <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <form
              className="brief__form"
              onSubmit={(e) => {
                e.preventDefault()
                setStep((s) => Math.min(s + 1, STEPS.length - 1))
              }}
            >
              <ol className="brief__steps" aria-label="Project brief progress">
                {STEPS.map((s, i) => (
                  <li key={s} className={i === step ? 'is-on' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
                    <span className="t-label">{String(i + 1).padStart(2, '0')}</span> {s}
                  </li>
                ))}
              </ol>

              {step === 0 && (
                <fieldset className="brief__fieldset">
                  <legend ref={headingRef} tabIndex={-1} className="brief__q" data-step-item>
                    What kind of project?
                  </legend>
                  <div className="brief__chips">
                    {TYPES.map((t) => (
                      <label key={t} className="chip" data-step-item>
                        <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <div className="brief__fieldset">
                  <label ref={headingRef} tabIndex={-1} htmlFor="brief-idea" className="brief__q" data-step-item>
                    What are you building?
                  </label>
                  <textarea
                    id="brief-idea"
                    className="brief__input"
                    rows={5}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="A few sentences is plenty. What it is, who it's for, what exists already."
                    data-step-item
                    data-lenis-prevent
                  />
                </div>
              )}

              {step === 2 && (
                <div className="brief__fieldset">
                  <p ref={headingRef} tabIndex={-1} className="brief__q" data-step-item>
                    Who are we talking to?
                  </p>
                  <label className="brief__field" data-step-item>
                    <span className="t-label t-muted">Your name (optional)</span>
                    <input
                      className="brief__input"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <fieldset className="brief__timeline" data-step-item>
                    <legend className="t-label t-muted">Timeline</legend>
                    <div className="brief__chips">
                      {TIMELINES.map((t) => (
                        <label key={t} className="chip">
                          <input
                            type="radio"
                            name="timeline"
                            checked={timeline === t}
                            onChange={() => setTimeline(t)}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {step === 3 && (
                <div className="brief__fieldset">
                  <p ref={headingRef} tabIndex={-1} className="brief__q" data-step-item>
                    Ready when you are.
                  </p>
                  <dl className="brief__summary" data-step-item>
                    <div>
                      <dt className="t-label t-muted">Project</dt>
                      <dd>{types.length ? types.join(', ') : 'Not chosen yet'}</dd>
                    </div>
                    <div>
                      <dt className="t-label t-muted">Idea</dt>
                      <dd>{idea.trim() || 'You can write it in the email.'}</dd>
                    </div>
                    <div>
                      <dt className="t-label t-muted">Timeline</dt>
                      <dd>{timeline || 'Open'}</dd>
                    </div>
                  </dl>
                  <a className="btn btn--volt brief__send" href={mailto} data-cursor="cta" data-step-item>
                    Open the email draft <span aria-hidden="true">↗</span>
                  </a>
                  <p className="brief__note t-label t-muted" data-step-item>
                    This opens your email app with everything filled in. Nothing is sent from this page.
                  </p>
                </div>
              )}

              <div className="brief__nav">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setStep((s) => s - 1)}
                  data-cursor="hover"
                >
                  <span aria-hidden="true">←</span> {step === 0 ? 'Close' : 'Back'}
                </button>
                {step < STEPS.length - 1 && (
                  <button type="submit" className="btn" data-cursor="cta">
                    Next <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
