import { useEffect, useLayoutEffect, useRef } from 'react'
import { heroIntro, heroPointer, heroScroll } from '../animations/heroAnimations'

const WORD = 'ORCADES'.split('')

/*
  Each letter is three nested layers so scroll, pointer and intro
  animations own separate transforms:
  .hero__char (scroll) > .hero__glyph (pointer) > .hero__in (intro)
*/
export default function Hero({ play }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    const stopScroll = heroScroll(root)
    const stopPointer = heroPointer(root)
    return () => {
      stopPointer()
      stopScroll()
    }
  }, [])

  // layout effect: hide the letters before the first paint, not after
  useLayoutEffect(() => {
    if (!play) return
    const tl = heroIntro(ref.current)
    return () => tl.kill()
  }, [play])

  return (
    <section ref={ref} id="top" className="hero" data-world="enter" aria-labelledby="hero-title">
      <div className="hero__stage">
        <h1 id="hero-title" className="hero__word" aria-label="ORCADES">
          {WORD.map((ch, i) => (
            <span className="hero__char" key={i} aria-hidden="true">
              <span className="hero__glyph">
                <span className="hero__in">{ch}</span>
              </span>
            </span>
          ))}
        </h1>

        <div className="hero__ui">
          <p className="hero__kicker t-label" data-hero-fade>
            <span className="t-volt" aria-hidden="true">●</span> Creative technology studio
          </p>

          <p className="hero__line" data-hero-fade>
            We build <em>digital worlds.</em>
          </p>

          <div className="hero__foot" data-hero-fade>
            <p className="t-label t-muted">Websites / Software / Stories</p>
            <p className="hero__scroll t-label" aria-hidden="true">
              Scroll to enter <span className="hero__scroll-line" />
            </p>
          </div>
        </div>

        <p className="hero__echo t-label" aria-hidden="true">
          you are inside one now
        </p>
      </div>
    </section>
  )
}
