import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { profile, sceneState } from '../animations/scrollAnimations'

/*
  The ORCADES universe.
  One fixed canvas behind the story: an orrery at the origin (the wordmark
  sits in front of it), a long corridor of dust the camera travels through
  as you scroll, and a few wireframe forms waiting at different depths.
  Everything reads from sceneState; nothing here touches React state.
*/

const INK = new THREE.Color('#0d0c0a')
const PAPER = new THREE.Color('#f1ebe0')
const VOLT = new THREE.Color('#c9ff3b')

const CAMERA_START = 14
const CAMERA_TRAVEL = 118

const dustVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute float aVolt;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uVelocity;
  varying float vAlpha;
  varying float vVolt;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.18 + aSeed * 6.2831) * 0.35;
    p.y += cos(uTime * 0.14 + aSeed * 6.2831) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aSeed * 40.0);
    float warp = 1.0 + abs(uVelocity) * 2.2;
    gl_PointSize = aSize * uPixelRatio * warp * (22.0 / max(depth, 0.5));
    vAlpha = twinkle * smoothstep(70.0, 12.0, depth) * smoothstep(0.4, 2.5, depth);
    vVolt = aVolt;
  }
`

const dustFragment = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uVolt;
  varying float vAlpha;
  varying float vVolt;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uPaper, uVolt, vVolt), a * vAlpha);
  }
`

function circle(radius, segments = 160) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

function wire(geometry, material) {
  const w = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material)
  geometry.dispose()
  return w
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Scene3D() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !hasWebGL()) return

    const low = profile.lowPower
    const reduced = profile.reduced
    const disposables = []
    const track = (o) => (disposables.push(o), o)

    /* renderer ---------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: false,
      powerPreference: 'high-performance',
    })
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(INK, 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(INK, 14, 58)

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      140,
    )
    camera.position.set(0, 0, CAMERA_START)

    /* materials --------------------------------------------------- */
    const lineSoft = track(
      new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.16 }),
    )
    // on phones the copy fills the screen, so the geometry steps back
    const quiet = profile.small ? 0.55 : 1
    const lineMid = track(
      new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.32 * quiet }),
    )
    const lineVolt = track(
      new THREE.LineBasicMaterial({ color: VOLT, transparent: true, opacity: 0.55 * quiet }),
    )
    const moonMat = track(new THREE.MeshBasicMaterial({ color: VOLT }))
    const moonPaper = track(new THREE.MeshBasicMaterial({ color: PAPER }))

    /* the orrery — one where you enter, one where the story ends ---- */
    const moonGeo = track(new THREE.SphereGeometry(0.09, 12, 12))
    const makeOrrery = () => {
      const group = new THREE.Group()
      const core = wire(new THREE.IcosahedronGeometry(2.3, 1), lineMid)
      const coreInner = wire(new THREE.OctahedronGeometry(1.1, 0), lineVolt)
      track(core.geometry)
      track(coreInner.geometry)
      group.add(core, coreInner)
      const rings = [
        { r: 4.1, tilt: [1.2, 0.2, 0], speed: 0.22, mat: moonMat },
        { r: 5.4, tilt: [1.45, -0.45, 0.3], speed: -0.14, mat: moonPaper },
        { r: 7.0, tilt: [1.05, 0.6, -0.2], speed: 0.09, mat: moonMat },
      ].map((cfg) => {
        const pivot = new THREE.Group()
        pivot.rotation.set(...cfg.tilt)
        const ring = new THREE.Line(track(circle(cfg.r)), lineSoft)
        const moon = new THREE.Mesh(moonGeo, cfg.mat)
        pivot.add(ring, moon)
        group.add(pivot)
        return { ...cfg, pivot, moon, angle: Math.random() * Math.PI * 2, baseTilt: cfg.tilt }
      })
      scene.add(group)
      return { group, core, coreInner, rings }
    }

    // open: 0 = closed around the wordmark, 1 = swung toward the viewer
    const spinOrrery = (o, t, dt, wake, open) => {
      o.core.rotation.x = t * 0.08 + sceneState.pointerY * 0.4
      o.core.rotation.y = t * 0.12 * wake + sceneState.pointerX * 0.6
      o.coreInner.rotation.y = -t * 0.4 * wake
      o.coreInner.rotation.z = t * 0.25
      o.rings.forEach((r) => {
        r.angle += dt * r.speed * wake
        r.moon.position.set(Math.cos(r.angle) * r.r, Math.sin(r.angle) * r.r, 0)
        r.pivot.rotation.x = r.baseTilt[0] * (1 - open * 0.55)
        r.pivot.rotation.y = r.baseTilt[1] + open * 0.4
      })
    }

    const entry = makeOrrery()
    const exit = makeOrrery()
    exit.group.position.set(0, 0.5, CAMERA_START - CAMERA_TRAVEL - 22)
    exit.group.rotation.z = -0.4

    /* the corridor of dust ---------------------------------------- */
    const count = reduced ? 700 : low ? (profile.small ? 650 : 1100) : 2400
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const volts = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const spread = 1 - Math.random() ** 2
      positions[i * 3] = (Math.random() - 0.5) * 44 * (0.35 + spread)
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26 * (0.35 + spread)
      positions[i * 3 + 2] = CAMERA_START - 6 - Math.random() * (CAMERA_TRAVEL + 50)
      sizes[i] = 0.6 + Math.random() ** 3 * 2.4
      seeds[i] = Math.random()
      volts[i] = Math.random() < 0.08 ? 1 : 0
    }
    const dustGeo = track(new THREE.BufferGeometry())
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    dustGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    dustGeo.setAttribute('aVolt', new THREE.BufferAttribute(volts, 1))
    const dustMat = track(
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: dpr },
          uVelocity: { value: 0 },
          uPaper: { value: PAPER },
          uVolt: { value: VOLT },
        },
      }),
    )
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    /* forms waiting further down the corridor --------------------- */
    const formDefs = [
      () => new THREE.TorusKnotGeometry(1.4, 0.34, 90, 10, 2, 3),
      () => new THREE.OctahedronGeometry(2.2, 0),
      () => new THREE.BoxGeometry(2.6, 2.6, 2.6, 3, 3, 3),
      () => new THREE.DodecahedronGeometry(2, 0),
      () => new THREE.TorusGeometry(2.2, 0.5, 8, 36),
      () => new THREE.TetrahedronGeometry(2.4, 0),
      () => new THREE.IcosahedronGeometry(2.6, 0),
      () => new THREE.ConeGeometry(1.8, 3.2, 6, 2),
    ]
    const forms = formDefs.slice(0, low ? 5 : formDefs.length).map((make, i) => {
      const mat = i % 3 === 1 ? lineVolt : lineMid
      const mesh = wire(make(), mat)
      track(mesh.geometry)
      const side = i % 2 === 0 ? 1 : -1
      mesh.position.set(
        side * (9 + Math.random() * 5),
        (Math.random() - 0.5) * 7,
        -14 - i * (CAMERA_TRAVEL / formDefs.length) - Math.random() * 6,
      )
      mesh.userData.spin = new THREE.Vector3(
        0.1 + Math.random() * 0.2,
        0.12 + Math.random() * 0.25,
        Math.random() * 0.1,
      )
      mesh.userData.baseY = mesh.position.y
      mesh.userData.seed = Math.random() * 10
      scene.add(mesh)
      return mesh
    })

    /* loop -------------------------------------------------------- */
    const timer = new THREE.Timer()
    const cam = { x: 0, y: 0, z: CAMERA_START }
    const look = new THREE.Vector3()
    let vel = 0

    const render = (now) => {
      timer.update(now)
      const dt = Math.min(timer.getDelta(), 0.05)
      const t = timer.getElapsed()
      const p = sceneState.progress
      const out = sceneState.heroOut

      // camera glides — pointer drift + scroll travel, both damped
      const k = reduced ? 1 : 1 - Math.pow(0.001, dt)
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      cam.x += (sceneState.pointerX * 1.6 - cam.x) * k * 0.6
      cam.y += (-sceneState.pointerY * 1.0 - cam.y) * k * 0.6
      cam.z += (CAMERA_START - eased * CAMERA_TRAVEL - cam.z) * k
      camera.position.set(cam.x, cam.y, cam.z)
      look.set(cam.x * 0.35, cam.y * 0.35, cam.z - 14)
      camera.lookAt(look)

      vel += (sceneState.velocity - vel) * 0.08
      dustMat.uniforms.uTime.value = t
      dustMat.uniforms.uVelocity.value = vel

      // the entry orrery wakes as the wordmark breaks apart
      const wake = 1 + out * 0.9
      spinOrrery(entry, t, dt, wake, out)
      entry.group.scale.setScalar(1 + out * 0.55)
      entry.group.rotation.z = out * 0.6
      // the exit orrery is already open, waiting at the end of the corridor
      spinOrrery(exit, t, dt, 1.2, 0.8)

      forms.forEach((m) => {
        const s = m.userData.spin
        m.rotation.x += s.x * dt
        m.rotation.y += s.y * dt
        m.rotation.z += s.z * dt
        m.position.y = m.userData.baseY + Math.sin(t * 0.5 + m.userData.seed) * 0.5
      })

      renderer.render(scene, camera)
    }

    /* lifecycle --------------------------------------------------- */
    let running = false
    const start = () => {
      if (running || reduced) return
      running = true
      timer.reset()
      renderer.setAnimationLoop(render)
    }
    const stop = () => {
      running = false
      renderer.setAnimationLoop(null)
    }

    const onVisibility = () => (document.hidden ? stop() : start())

    let lastW = window.innerWidth
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      // ignore mobile toolbar jitter unless the width actually changed
      if (profile.touch && w === lastW) return
      lastW = w
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (reduced) render()
    }

    // reduced motion: still render the world, just hold it still
    const onReducedScroll = () => requestAnimationFrame(render)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    if (reduced) {
      render()
      window.addEventListener('scroll', onReducedScroll, { passive: true })
    } else {
      start()
    }
    requestAnimationFrame(() => host.classList.add('is-ready'))

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onReducedScroll)
      disposables.forEach((d) => d.dispose())
      timer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={hostRef} className="scene3d" aria-hidden="true" />
}
