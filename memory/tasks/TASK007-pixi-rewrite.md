# TASK007 - Rewrite visuals with Pixi.js
**Status:** Pending  
**Added:** 2025-11-08  
**Updated:** 2025-11-08

## Original Request
The user installed `pixi.js` and asked for a full rewrite of the unicorn firing at battleship visuals (beams, sparks, explosions, damage numbers) to use Pixi.js. They also asked for a design doc in `/memory/designs` and an implementation plan in `/memory/tasks`.

## Thought Process
Keep the game logic in `src/App.tsx` (React) as the single source of truth. Move the heavy, frequent, and animation-focused visuals into a Pixi-based renderer that is mounted inside the same click-area. Use pooled Beam and Particle objects and a central loader to ensure performance and predictable lifetime management. Provide a simple visual API so React triggers visuals after state updates (spawn beam, spawn impact) and Pixi returns optional callbacks for pointer events if needed.

## Plan: Pixi Renderer Rewrite
TL;DR: Create a small Pixi rendering layer (wrapper + effects modules) that receives derived snapshots and an explicit visual event queue from React; implement pooling for beams and particles; integrate into `App.tsx` by mounting the Pixi canvas in the click-area and forwarding spawn calls when clicks/auto-fire occur.

**Phases 6**
1. **Phase 1: Research & Setup**
    - **Objective:** Verify pixi.js install, pick integration approach (raw pixi vs `@inlet/react-pixi`), scaffold base files and loader.
    - **Files/Functions to Modify/Create:** `src/pixi/usePixiApp.ts`, `src/pixi/textureLoader.ts`, `public/assets/` placeholders
    - **Tests to Write:** `pixi/loader.test.ts` (loader returns expected textures/fallbacks)
    - **Steps:**
        1. Confirm `pixi.js` version and compatibility.
        2. Add placeholder assets to `public/assets` if needed.
        3. Create `usePixiApp` hook and test loader behavior.

2. **Phase 2: PixiStage wrapper and mount**
    - **Objective:** Create `PixiStage` React wrapper that mounts a `PIXI.Application`, handles resizing/DPR, and exposes a small API to spawn visuals.
    - **Files/Functions to Modify/Create:** `src/pixi/PixiStage.tsx`, `src/components/PixiMountPoint.tsx`
    - **Tests to Write:** `pixi/pixi-stage.test.ts` (asserts canvas created and API is callable)
    - **Steps:**
        1. Implement `PixiStage` mounting and teardown.
        2. Wire loader from Phase 1 and expose `spawnBeam` & `spawnImpact` refs.

3. **Phase 3: Beam system & pooling**
    - **Objective:** Implement pooled beam objects that animate from unicorn horn to ship, with crit visuals.
    - **Files/Functions to Modify/Create:** `src/pixi/effects/Beam.ts`, `src/pixi/effects/BeamPool.ts`
    - **Tests to Write:** `pixi/beam.test.ts` (spawn->life->recycle)
    - **Steps:**
        1. Implement Beam class that creates sprites/graphics, plays an animation over a duration, and notifies when finished.
        2. Add pool manager to reuse Beam instances.

4. **Phase 4: Particles & Damage Numbers**
    - **Objective:** Add impact particles, explosion effects and floating damage numbers using pooled emitters and lightweight text.
    - **Files/Functions to Modify/Create:** `src/pixi/effects/ImpactParticles.ts`, `src/pixi/effects/DamageNumbers.ts`
    - **Tests to Write:** `pixi/impact.test.ts`, `pixi/damage-numbers.test.ts` (presence and lifecycle assertions)
    - **Steps:**
        1. Implement a small particle emitter (sprite pooling) for sparks/explosions.
        2. Create DamageNumbers that float/fade and return to pool.

5. **Phase 5: Integrate with React game-state & events**
    - **Objective:** Replace inline visual blocks in `src/App.tsx` with the `PixiStage` mount; ensure clicks and auto-DPS call `spawnBeam`/`spawnImpact` appropriately while preserving all existing game effects and rewards.
    - **Files/Functions to Modify/Create:** `src/App.tsx` (refactor visuals), add small adapter if needed `src/pixi/visualEvents.ts`
    - **Tests to Write:** `app/integration.pixi.test.ts` (simulate click -> expect stardust delta and a visual event queued)
    - **Steps:**
        1. Mount `PixiStage` in the click-area and forward derived snapshot.
        2. Replace `BeamVisual`, `ImpactSparks`, `DamageNumbers` DOM renders with the Pixi mount.
        3. Ensure `lastTick`/autosave and existing persistence remain unchanged.

6. **Phase 6: Tests, polish, and docs**
    - **Objective:** Add tests, polish visuals (retina scaling, fallbacks), update memory/designs and memory/tasks, and document how to add assets.
    - **Files/Functions to Modify/Create:** tests in `vitest`/`jest`, update `memory/designs/DESIGN005-pixi-renderer.md` and `memory/tasks/_index.md`.
    - **Tests to Write:** end-to-end visual smoke test, loader failure fallback test.
    - **Steps:**
        1. Write tests and run them locally.
        2. Profile performance with realistic beam counts.
        3. Update memory bank (designs & tasks) and add developer README for Pixi assets.

**Open Questions**
1. Use raw `pixi.js` (recommended) or `@inlet/react-pixi` (declarative)? (Raw recommended for pooling/performance.)
2. Do you want the existing DOM/SVG visuals preserved as a fallback or removed entirely? (Keep as fallback recommended.)
3. Supply new assets/atlases or accept placeholder art during development?

---

## Phase 1 Complete

- **Review status:** APPROVED
- **Summary:** Phase 1 deliverables for TASK007 (Pixi rewrite) were reviewed. Vitest tests ran and passed (2/2). `vitest.config.ts` sets `watch: false` and `test.environment = 'jsdom'`. The created Pixi helper and loader export the expected symbols and behave correctly at runtime. A full `tsc --noEmit` across the repo produced ambient/type errors unrelated to the new code (see notes).
- **Files created:**
    - `src/pixi/textureLoader.ts`
    - `src/pixi/usePixiApp.ts`
    - `src/pixi/loader.test.ts`
    - `src/pixi/usePixiApp.test.ts`
- **Tests executed:** `npx vitest --run` — 2 passed, 0 failed.
- **Notes:** Running `npx tsc --noEmit` on the repo surfaced many type errors due to `tsconfig` `lib` settings and ambient typings (missing ES2015/DOM libs). To enable project-wide typechecking, update `tsconfig.json` to include appropriate `lib` entries.

**Next steps**
- Continue with Phase 2 (PixiStage wrapper and mount).

## Progress Log
- 2025-11-08: Task created and draft plan written. Waiting for approval to proceed with implementation phases.

## Acceptance Criteria (short)
- Beam spawn + impact animations occur visually in Pixi and align with existing damage rewards.
- No memory leaks or runaway allocations with frequent clicking or long idle sessions.
- Reasonable performance under test load (10+ beams + particles).

---
