import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Hero from './components/Hero'
import Opening from './components/Opening'
import Manifesto from './components/Manifesto'
import Services from './components/Services'
import Work from './components/Work'
import { shouldPlayOpening } from './animations/heroAnimations'
import { initSmoothScroll, trackPage, revealOnScroll, ScrollTrigger } from './animations/scrollAnimations'

// three.js is the heaviest thing we ship — it arrives after the words do
const Scene3D = lazy(() => import('./components/Scene3D'))

function useIdleMount() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const go = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(go, { timeout: 900 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(go, 250)
    return () => clearTimeout(id)
  }, [])
  return ready
}

export default function App() {
  const sceneReady = useIdleMount()
  const [opening, setOpening] = useState(shouldPlayOpening)
  const [revealed, setRevealed] = useState(() => !opening)
  const handleReveal = useCallback(() => setRevealed(true), [])
  const handleOpened = useCallback(() => setOpening(false), [])

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
    <>
      {sceneReady && (
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      )}
      {opening && <Opening onReveal={handleReveal} onDone={handleOpened} />}
      <main id="main">
        <Hero play={revealed} />
        <Manifesto />
        <Services />
        <Work />
        <section className="section wrap" style={{ minHeight: '150vh' }} aria-hidden="true" />
      </main>
    </>
  )
}
