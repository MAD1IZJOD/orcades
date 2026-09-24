import { lazy, Suspense, useEffect, useState } from 'react'
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
      <main id="main">
        <h1>ORCADES</h1>
      </main>
    </>
  )
}
