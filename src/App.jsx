import { useEffect } from 'react'
import { initSmoothScroll, trackPage, revealOnScroll, ScrollTrigger } from './animations/scrollAnimations'

export default function App() {
  useEffect(() => {
    const stopScroll = initSmoothScroll()
    const stopTracking = trackPage()
    const stopReveals = revealOnScroll(document.body)

    // fonts change line lengths — measure again once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      stopReveals()
      stopTracking()
      stopScroll?.()
    }
  }, [])

  return (
    <main id="main">
      <h1>ORCADES</h1>
    </main>
  )
}
