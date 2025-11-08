# DESIGN005 - Pixi Renderer for Horn Beams and Effects
**Status:** Draft  
**Author:** GitHub Copilot  
**Date:** 2025-11-08

## Overview
Replace the DOM/SVG/CSS-based beam and impact visuals with a dedicated, high-performance Pixi.js renderer. Keep the existing React-based game logic and state as the source of truth; delegate rendering of beams, sparks, explosions, damage numbers and unicorn sprites to a Pixi stage managed by a small React wrapper.

Goals:
- Increase rendering performance and frame stability for many simultaneous beams/particles.
- Enable GPU-accelerated glow/blur and particle effects not feasible with pure DOM/SVG.
- Keep game logic unchanged where possible to minimize behavioural regressions.

## Architecture (high level)

flowchart LR
  ReactApp[React App / Game State]
  ReactApp -->|derived snapshot & events| PixiMount[PixiStage wrapper]
  PixiMount --> Stage(PIXI.Application / Stage)
  Stage --> Background(Starfield Layer)
  Stage --> Unicorns(Unicorn Sprites Layer)
  Stage --> Beams(Beam System / pooled beams)
  Stage --> Effects(Particles & Explosions)
  Stage --> UIOverlay(UI text / damage numbers if needed)
  PixiMount -->|callbacks| ReactApp

Notes:
- React remains the authoritative source of truth for game state (stardust, ship hp, crits, upgrades). Pixi receives snapshots and an explicit event queue (spawn beam, spawn impact) to visualize.
- Interactions: clicks (pointer events) can be detected by either React (preferred, reusing existing logic) or Pixi. The recommended approach: let React handle click logic (game rules) and call PixiMount.spawnBeam(...) to animate visuals.

## Interfaces & Contracts

- `PixiStage` (React component)
  - Props:
    - `width:number, height:number` — mount area in CSS pixels
    - `derived: DerivedSnapshot` — minimal derived state consumed for visuals (ship, unicorn positions, unicornCount, dps)
    - `eventQueue: VisualEvent[]` — optional queue of visual events the Pixi stage should animate (beam, impact, spawn)
    - `onPointer?: (pos: {x:number,y:number}) => void` — optional pointer callback if Pixi should forward pointer events
  - Methods (via `ref`):
    - `spawnBeam({startX,startY,endX,endY,crit,unicornIndex,lifeMs})` — create an animated beam
    - `spawnImpact({x,y,type,size})` — create explosion/sparks

- `DerivedSnapshot` (shape)
  - `ship: { level, hp, maxHp, isBoss, variant }`
  - `unicornPositions: Array<{xPct:number,yPct:number}>` — percent-of-area horn positions (or pass mapping function)
  - `unicornCount:number`
  - `clickDamage:number, dps:number, crit:boolean`

- `VisualEvent` examples:
  - `{type:'beam', startPct:{x,y}, endPct:{x,y}, crit:boolean, unicornIndex:number}`
  - `{type:'impact', xPct:number, yPct:number, strength:number}`

## Resources & Loader
- Use `PIXI.Loader` (or Assets) to load textures: `beam.png`, `beam_glow.png`, `particle.png`, `unicorn_sprite.png`.
- Use pooling for Beam and Particle objects to avoid per-click allocations.
- Set `renderer.resolution = devicePixelRatio` and scale coordinates accordingly.

## Acceptance Criteria (testable)
- Clicking the click-area triggers a beam animation which starts at unicorn horn position and reaches the ship within ~600ms.
- Beams display glow and gradient and are removed/recycled after completion with no memory leaks.
- Impact particles spawn and fade within ~800ms and are pooled for reuse.
- Visuals operate at stable framerate (observational: target 60fps) with up to 10 concurrent beams on a mid-range device.
- If textures fail to load, a fallback Graphics-based beam is drawn without throwing errors.

## Risks & Trade-offs
- Using `@inlet/react-pixi` simplifies JSX integration but can reduce fine-grained control for pooling and ticker-based motion — the recommended approach is using raw `pixi.js` inside a small React wrapper for maximum performance.
- Introducing large sprite atlases increases bundle size; consider dynamic loading or CDN-hosted assets.
- Coordinate mapping between DOM and Pixi must be carefully tested across responsive layouts and DPR.

## Migration Plan (summary)
1. Add a `PixiStage` React wrapper and a `usePixiApp` hook that initializes `PIXI.Application` and loader.
2. Implement Beam, ImpactParticles and DamageNumber effect modules with pooling and a clear runtime API.
3. Wire `App.tsx` to mount `PixiStage` in the click-area, forward pointer events or send visual events after game-state updates.
4. Replace `BeamVisual`, `ImpactSparks`, `DamageNumbers`, `Explosions` blocks in `App.tsx` with `PixiStage` mount and remove unused CSS/SVG keyframes.
5. Add tests for the loader, beam lifecycle (spawn -> expire -> reuse), and a lightweight integration test to ensure game-state integration still produces same stardust deltas.

## Files to Create
- `src/pixi/PixiStage.tsx` — wrapper + mount
- `src/pixi/usePixiApp.ts` — app & loader hook
- `src/pixi/effects/Beam.ts` — beam class with pooling
- `src/pixi/effects/ImpactParticles.ts` — particles emitter & pooling
- `src/pixi/effects/DamageNumbers.ts` — floating numbers
- `src/pixi/textureLoader.ts` — resource loader helpers
- `public/assets/*` — beam/particle/unicorn textures

## Notes
- Keep a DOM/SVG fallback for accessibility or until Pixi assets are loaded.
- Document new files and add an entry to `memory/tasks/_index.md` and `memory/designs/_index.md` (done by the planning agent).

---

## Phase 6: Visual polish & assets (summary)

**Completed (Phase 6 partial):** Added real `PIXI.Application` usage when a global `PIXI` is present, improved DPR/resolution handling and responsive resizing in the Pixi app helper, and introduced `BeamGraphic` and `ImpactGraphic` wrappers that encapsulate `PIXI.Graphics` creation, animation and cleanup. Tests were added to mock a minimal `PIXI` runtime and verify that `spawnBeam` adds a Graphics object to the stage and removes it after the configured duration.

Files touched in Phase 6 (summary):
- `src/pixi/PixiStage.tsx` — use PIXI Graphics when available; keep 2D canvas fallback
- `src/pixi/usePixiApp.ts` — PIXI-aware app creation, DPR and resize handling, jsdom fallback
- `src/pixi/display/BeamGraphic.ts` — beam display wrapper using `PIXI.Graphics`
- `src/pixi/display/ImpactGraphic.ts` — impact display wrapper using `PIXI.Graphics`
- `src/pixi/pixi-stage-pixi.test.ts` — unit test that mocks `globalThis.PIXI` and verifies stage child lifecycle

Notes:
- Pooling logic (BeamPool/ImpactParticles) remains compatible with the new display wrappers; further integration (having pools create/detach the Graphics) is recommended as a follow-up but not required for tests.
- TypeScript changes were kept minimal and use `any` at PIXI interop points to avoid introducing heavy typings for `pixi.js` in the repo.

