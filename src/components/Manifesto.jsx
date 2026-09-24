import { useEffect, useRef } from 'react'
import { gsap, profile } from '../animations/scrollAnimations'

const FIRST = "ORCADES doesn't just build software.".split(' ')
const SECOND = 'We build the digital things people remember.'.split(' ')

export default function Manifesto() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (profile.reduced) return

    const ctx = gsap.context(() => {
      const first = root.querySelectorAll('.manifesto__first .manifesto__w')
      const second = root.querySelectorAll('.manifesto__second .manifesto__w')

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: profile.small ? '+=90%' : '+=160%',
          pin: root.querySelector('.manifesto__pin'),
          scrub: 0.6,
        },
      })

      tl.fromTo(first, { opacity: 0.1 }, { opacity: 1, stagger: 0.1, duration: 0.3 })
      tl.to(first, { opacity: 0.28, duration: 0.3 }, '+=0.15')
      tl.fromTo(second, { opacity: 0.1 }, { opacity: 1, stagger: 0.1, duration: 0.3 }, '<')
      tl.fromTo(
        root.querySelector('.manifesto__mark'),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.2',
      )
      tl.fromTo(
        root.querySelector('.manifesto__coda'),
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.4 },
        '-=0.1',
      )
      tl.to({}, { duration: 0.3 })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="manifesto" data-world="realize" aria-labelledby="manifesto-title">
      <div className="manifesto__pin wrap">
        <p className="t-label t-muted manifesto__label">N°01 — Realize</p>

        <h2 id="manifesto-title" className="manifesto__text">
          <span className="manifesto__first">
            {FIRST.map((w, i) => (
              <span className="manifesto__w" key={i}>
                {w}{' '}
              </span>
            ))}
          </span>
          <span className="manifesto__second">
            {SECOND.map((w, i) => {
              const last = i === SECOND.length - 1
              return (
                <span className={`manifesto__w${last ? ' manifesto__key' : ''}`} key={i}>
                  {last ? (
                    <>
                      <span className="manifesto__keyword">
                        remember
                        <span className="manifesto__mark" aria-hidden="true" />
                      </span>
                      .
                    </>
                  ) : (
                    <>{w} </>
                  )}
                </span>
              )
            })}
          </span>
        </h2>

        <p className="manifesto__coda">
          <span>Good software works.</span>
          <span className="t-muted">Great software pulls you in.</span>
        </p>
      </div>
    </section>
  )
}
