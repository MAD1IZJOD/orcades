import { useEffect, useRef } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'

const PRINCIPLES = [
  { t: 'Design and code, same room.', d: 'The people designing it are the people building it. Nothing gets lost in a handoff.' },
  { t: 'Motion with a reason.', d: "Every animation has a job. If it doesn't help the story, it goes." },
  { t: 'Fast before fancy.', d: 'Performance is part of the design, not a cleanup task at the end.' },
  { t: 'Built to be looked after.', d: 'Code someone can still work on in two years, even if that someone is us.' },
]

export default function About() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (profile.reduced) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.about__sum',
          start: 'top 85%',
          end: 'bottom 45%',
          scrub: 0.7,
        },
      })
      tl.from('.about__term--a', { xPercent: -60, autoAlpha: 0.1 }, 0)
      tl.from('.about__term--b', { xPercent: 60, autoAlpha: 0.1 }, 0)
      tl.from('.about__term--c', { xPercent: -40, autoAlpha: 0.1 }, 0)
      tl.to('.about__op', { rotation: 180, duration: 0.6 }, 0.1)
      tl.fromTo('.about__result', { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.4 }, 0.55)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="about" className="about section" data-world="about" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <p className="t-label t-muted">N°04 — About</p>

        <h2 id="about-title" className="about__statement" data-reveal="fade">
          ORCADES sits somewhere between a <em>software studio</em> and a <em>creative technology lab.</em>
        </h2>

        <div className="about__sum" role="img" aria-label="Design plus engineering plus storytelling equals ORCADES">
          <span className="about__term about__term--a" aria-hidden="true">
            Design
          </span>
          <span className="about__op" aria-hidden="true">
            +
          </span>
          <span className="about__term about__term--b" aria-hidden="true">
            Engineering
          </span>
          <span className="about__op" aria-hidden="true">
            +
          </span>
          <span className="about__term about__term--c" aria-hidden="true">
            Storytelling
          </span>
          <span className="about__result" aria-hidden="true">
            <span className="about__eq">=</span> ORCADES
          </span>
        </div>

        <ul className="about__principles">
          {PRINCIPLES.map((p, i) => (
            <li key={p.t} data-reveal="fade">
              <span className="t-label t-volt">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.t}</h3>
              <p className="t-body">{p.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
