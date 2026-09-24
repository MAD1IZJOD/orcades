import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, scrollToTarget } from '../animations/scrollAnimations'
import { rollText } from '../animations/interactionAnimations'
import ServiceChapter from './ServiceChapter'
import { BrowserWorld, SoftwareFlow } from './ServiceVisuals'

const CHAPTERS = [
  {
    id: 'experiences',
    theme: 'ink',
    kicker: 'Digital experiences',
    short: 'Experiences',
    title: 'Websites you step into.',
    line: ["Websites shouldn't just be visited.", 'They should be experienced.'],
    tags: ['GSAP', 'Three.js / WebGL', 'Motion design', 'Interactive storytelling', 'High-performance frontend'],
    note: "You're scrolling through one right now.",
  },
  {
    id: 'software',
    theme: 'paper',
    kicker: 'Software',
    short: 'Software',
    title: 'Idea in. Product out.',
    line: ['From an idea to something', 'people can actually use.'],
    tags: ['Frontend', 'Backend', 'APIs', 'Product development', 'Automation', 'Integrations'],
  },
  {
    id: 'management',
    theme: 'grid',
    kicker: 'Software management',
    short: 'Care',
    title: 'Shipping is day one.',
    line: ['Good software is not', 'finished when it ships.'],
    tags: ['Maintenance', 'Monitoring', 'Optimisation', 'Updates', 'Infrastructure coordination', 'Long-term support'],
  },
  {
    id: 'decks',
    theme: 'volt',
    kicker: 'Pitch decks',
    short: 'Decks',
    title: 'Make the idea click.',
    line: ['Before someone invests in the idea,', 'they need to understand it.'],
    tags: ['Startup pitch decks', 'Investor presentations', 'Product presentations', 'Storytelling', 'Visual communication'],
  },
]

// each chapter's visual owns its own motion; `active` tells it when it's on stage
const VISUALS = [BrowserWorld, SoftwareFlow]

const pad = (n) => String(n).padStart(2, '0')

export default function Services() {
  const ref = useRef(null)
  const counterRef = useRef(null)
  const jumpRef = useRef(() => {})
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const root = ref.current
    const mm = gsap.matchMedia()

    mm.add(
      {
        wide: '(min-width: 1024px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { wide, reduce } = context.conditions
        const panels = gsap.utils.toArray(root.querySelectorAll('.chapter'))
        const bar = root.querySelector('.services__bar')

        if (wide && !reduce) {
          // desktop: one pinned horizontal journey through four worlds
          const track = root.querySelector('.services__track')
          const distance = () => track.scrollWidth - window.innerWidth

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: root.querySelector('.services__pin'),
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
            },
          })

          panels.forEach((panel, i) => {
            ScrollTrigger.create({
              trigger: panel,
              containerAnimation: tween,
              start: 'left 60%',
              end: 'right 60%',
              onToggle: (self) => self.isActive && setActive(i),
            })
            // the giant numeral drifts slower than its world — cheap depth
            gsap.fromTo(
              panel.querySelector('.chapter__num'),
              { xPercent: 35 },
              {
                xPercent: -35,
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: tween,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              },
            )
          })

          jumpRef.current = (i) => {
            const st = tween.scrollTrigger
            const ratio = Math.min(1, panels[i].offsetLeft / distance())
            scrollToTarget(st.start + ratio * (st.end - st.start) + 2)
          }
        } else {
          // mobile + reduced motion: the same worlds, stacked
          panels.forEach((panel, i) => {
            ScrollTrigger.create({
              trigger: panel,
              start: 'top 60%',
              end: 'bottom 60%',
              onToggle: (self) => self.isActive && setActive(i),
            })
          })
          ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
          })
          jumpRef.current = (i) => scrollToTarget(panels[i])
        }

        return () => setActive(-1)
      },
    )

    return () => mm.revert()
  }, [])

  useEffect(() => {
    if (active >= 0) rollText(counterRef.current, pad(active + 1))
  }, [active])

  return (
    <section ref={ref} id="services" className="services" data-world="explore" aria-labelledby="services-title">
      <div className="services__pin">
        <div className="services__track">
          <header className="services__intro">
            <p className="t-label t-muted">N°02 — Explore</p>
            <h2 id="services-title" className="services__title">
              Four ways
              <br />
              <span className="t-outline-volt">into the world.</span>
            </h2>
            <p className="t-body services__lede">
              We design and build immersive websites, software that works, care for it after launch, and make pitch
              decks that make the idea click.
            </p>
            <ol className="services__index">
              {CHAPTERS.map((c, i) => (
                <li key={c.id}>
                  <button type="button" onClick={() => jumpRef.current(i)} data-cursor="hover">
                    <span className="t-label">{pad(i + 1)}</span>
                    <span>{c.kicker}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
            </ol>
          </header>

          {CHAPTERS.map((c, i) => {
            const Visual = VISUALS[i]
            return (
              <ServiceChapter key={c.id} index={i} chapter={c} active={active === i}>
                {Visual ? <Visual active={active === i} /> : <div className="visual-placeholder" />}
              </ServiceChapter>
            )
          })}
        </div>

        <nav className="services__hud" aria-label="Service chapters">
          <p className="services__count t-label" aria-hidden="true">
            <span className="services__count-roll">
              <span ref={counterRef}>01</span>
            </span>
            <span className="t-muted">/ {pad(CHAPTERS.length)}</span>
          </p>
          <ul className="services__jump">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={active === i ? 'is-active' : ''}
                  aria-current={active === i ? 'step' : undefined}
                  aria-label={`Go to chapter ${pad(i + 1)}: ${c.kicker}`}
                  onClick={() => jumpRef.current(i)}
                  data-cursor="hover"
                >
                  {c.short}
                </button>
              </li>
            ))}
          </ul>
          <span className="services__progress" aria-hidden="true">
            <span className="services__bar" />
          </span>
        </nav>
      </div>
    </section>
  )
}
