## Plan: Pixi Renderer Rewrite

TL;DR: Replace the DOM/SVG/CSS beam + impact visuals with a Pixi-based renderer mounted inside the existing click area. Keep React as the source of truth for game logic; provide a small visual API for spawning beams and impacts. Focus on a raw `pixi.js` integration for pooling and performance.

**Phases 6**
1. **Phase 1: Research & Setup**
    - **Objective:** Verify `pixi.js` availability and scaffold loader + small API for creating a PIXI application.
    - **Files/Functions to Modify/Create:** `src/pixi/usePixiApp.ts`, `src/pixi/textureLoader.ts`, basic Vitest loader tests
    - **Tests to Write:** `src/pixi/loader.test.ts` (tests that loader API exists and returns texture map)
    - **Steps:**
        1. Confirm `pixi.js` in `package.json` and installed.
        2. Create a minimal `loadTextures` that returns fallbacks if assets are missing.
        3. Add `createPixiApp` and `usePixiApp` helpers that mount/destroy a PIXI.Application.

2. **Phase 2: PixiStage wrapper and mount**
    - **Objective:** Implement `PixiStage` React wrapper that mounts the canvas, handles DPR/resizing, and exposes `spawnBeam` & `spawnImpact` methods via `ref`.
    - **Files/Functions to Modify/Create:** `src/pixi/PixiStage.tsx`, `src/components/PixiMountPoint.tsx`
    - **Tests to Write:** `pixi/pixi-stage.test.ts` (assert canvas created and API reachable)

3. **Phase 3: Beam system & pooling**
    - **Objective:** Implement pooled Beam objects that animate and recycle.
    - **Files/Functions to Modify/Create:** `src/pixi/effects/Beam.ts`, `src/pixi/effects/BeamPool.ts`
    - **Tests to Write:** `pixi/beam.test.ts` (spawn -> lifecycle -> recycle)

4. **Phase 4: Particles & Damage Numbers**
    - **Objective:** Add impact particles, explosion effects and floating damage numbers using pooling.
    - **Files/Functions to Modify/Create:** `src/pixi/effects/ImpactParticles.ts`, `src/pixi/effects/DamageNumbers.ts`
    - **Tests to Write:** `pixi/impact.test.ts`, `pixi/damage-numbers.test.ts`

5. **Phase 5: Integrate with React game-state & events**
    - **Objective:** Replace inline DOM/SVG visuals in `src/App.tsx` by mounting `PixiStage` and forwarding visual events from click/auto-fire logic.
    - **Files/Functions to Modify/Create:** `src/App.tsx` (visual refactor), `src/pixi/visualEvents.ts`
    - **Tests to Write:** `app/integration.pixi.test.ts` (simulate clicks and assert stardust deltas + visual event calls)

6. **Phase 6: Tests, polish, and docs**
    - **Objective:** Add tests, retina scaling, loader fallbacks, performance checks, and developer docs for assets.
    - **Files/Functions to Modify/Create:** tests in `vitest`, update `memory/designs/DESIGN005-pixi-renderer.md` and `memory/tasks/_index.md`.

**Open Questions**
1. Raw `pixi.js` (recommended) or `@inlet/react-pixi`?  
2. Keep current DOM/SVG visuals as a fallback or remove them now?  
3. Provide high-quality sprite atlases or use placeholders while iterating?

**Acceptance (Phase 1)**
- Loader API exists and returns a texture map (fallback textures allowed).  
- `createPixiApp` is callable and returns a `PIXI.Application`-like object (mounted to a DOM container).  

