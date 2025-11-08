# TASK006 - Draw unicorn horn beams
**Status:** Completed  
**Added:** 2025-10-27  
**Updated:** 2025-10-27

## Original Request
There should be actual beams drawn from the unicorns horn to the target ship, automatically triggered on manual firing and on firing via autofire/dps.

## Thought Process / Design reference
- The beam rendering currently reuses hard-coded start points; tracking the rendered unicorn cards will let us compute horn positions and anchor beams visually.
- This ties into the shooting/mechanic ideas captured in `/memory/designs/DESIGN004-advanced-upgrades-and-shooting-mechanisms.md` (auto-turrets, burst bursts, etc.).

## Implementation Plan
1. Record refs to the click target and each unicorn card so we can compute horn positions relative to the ship container.
2. Extend the beam state to include explicit `startX`/`startY` values and update `BeamVisual` to use those instead of fixed numbers.
3. Spawn a beam from every unicorn horn both when the player clicks and when DPS/autofire activates, keeping sparks tied to those beams.
4. Re-run existing validation (`npm run build`) and log the work once everything renders correctly.

## Progress Log
### 2025-10-27
- Task created. Ready to compute horn positions and rewire the beam rendering pipeline.
- Verified that beams were being occluded by the starfield overlays, lowered the starfield z-order and forced the pseudo layers behind the content, and gave the beam `svg` its own high stacking context so manual/autofire lasers now appear.

## Acceptance Criteria & Tests
- Clicking fires beams that begin at the horns of the rendered unicorn cards and travel toward the ship.
- Auto-generated DPS/autofire beams reuse the same horn start points.
- The change builds via `npm run build` and continues to show beams, sparks, and impact feedback without regressions.
