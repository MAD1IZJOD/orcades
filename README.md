# ORCADES

The website for ORCADES, a creative technology studio: immersive websites, 3D web
experiences, software, software management and pitch decks.

The site is meant to show the work by being an example of it. It's one scrolling story:

**Enter → Realize → Explore → Trust → Contact**

## Stack

- [Vite](https://vite.dev) + React (JavaScript)
- [GSAP](https://gsap.com) + ScrollTrigger for the scroll choreography
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling, driven by GSAP's ticker
- [Three.js](https://threejs.org) for the background universe (lazy-loaded)
- [Anime.js](https://animejs.com) for small interactions: counters, menu, cursor, morphs

## Scripts

```bash
npm install
npm run dev       # local dev server
npm run build     # production build into dist/
npm run preview   # serve the production build
npm run lint
```

## Structure

```
src/
  animations/
    scrollAnimations.js       Lenis + ScrollTrigger, device profile, shared scene state
    heroAnimations.js         hero intro, wordmark break-apart, pointer tilt
    interactionAnimations.js  anime.js helpers: rollText, scramble, magnetic
  components/
    Scene3D.jsx               fixed WebGL canvas: orreries, dust corridor, wireframes
    Opening.jsx               ~2s title card, skippable, once per session
    Hero.jsx  Manifesto.jsx  Services.jsx  ServiceChapter.jsx  ServiceVisuals.jsx
    Work.jsx  About.jsx  Contact.jsx  Footer.jsx  Navigation.jsx  CustomCursor.jsx
  styles/
    globals.css  typography.css  components.css
```

## Notes

- **No backend.** The project brief builds a `mailto:` draft to madhavansahu@gmail.com.
  Nothing is sent from the page.
- **Work is conceptual.** The "What we can build" section shows concept studies,
  labelled as such. There are no invented clients, metrics or awards.
- **Reduced motion.** With `prefers-reduced-motion`, the page has no title card, no
  pinning, no smooth scroll, no custom cursor and no autoplay, and the 3D scene is
  static. Everything is still readable and usable.
- **Performance.** Pixel ratio is capped, particle counts drop on low-power and small
  devices, rendering pauses when the tab is hidden, and chapter visuals only animate
  while they're on screen.
