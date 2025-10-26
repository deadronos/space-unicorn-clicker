# TASK005 - Add Unicorn Spawning Upgrade

**Status:** In Progress  
**Added:** 2025-10-26  
**Updated:** 2025-10-26

## Original Request

User requested: "please add an upgrade to spawn more unicorns shooting lasers, maybe have crits a small chance to increase this upgrade also"

## Thought Process

The current game has a single unicorn that shoots lasers. The user wants:
1. An upgrade that spawns additional unicorns
2. These additional unicorns should also shoot lasers
3. Critical hits should have a small chance to increase the unicorn count

Design decisions:
- Add a new upgrade called "Unicorn Squadron" or similar that increases the number of unicorns
- Each unicorn should contribute to DPS (auto-fire lasers)
- Visual representation: show multiple unicorns on screen
- Crit-based bonus: when a critical hit occurs, there's a small chance (e.g., 5%) to permanently increase the unicorn count by 1
- Track unicorn count in GameSnapshot
- The upgrade should be reasonably priced to fit with existing progression

## Implementation Plan

1. Add `unicornCount` field to GameSnapshot interface
2. Create new upgrade definition "🦄 Unicorn Squadron" that increases unicorn count
3. Update deriveStats to apply unicorn count (each extra unicorn adds DPS)
4. Implement crit-based unicorn spawn chance in handleAttack
5. Update visual rendering to show multiple unicorns
6. Add visual feedback when a new unicorn is spawned from a crit
7. Test all functionality
8. Update requirements.md with new EARS requirement

## Progress Tracking

**Overall Status:** In Progress - 10%

### Subtasks

| ID   | Description                                  | Status      | Updated    | Notes |
|------|----------------------------------------------|-------------|------------|-------|
| 5.1  | Add unicornCount to GameSnapshot             | Not Started | 2025-10-26 |       |
| 5.2  | Create Unicorn Squadron upgrade definition   | Not Started | 2025-10-26 |       |
| 5.3  | Implement DPS scaling per unicorn            | Not Started | 2025-10-26 |       |
| 5.4  | Add crit-based unicorn spawn chance          | Not Started | 2025-10-26 |       |
| 5.5  | Update visual rendering for multiple unicorns| Not Started | 2025-10-26 |       |
| 5.6  | Add visual feedback for unicorn spawn        | Not Started | 2025-10-26 |       |
| 5.7  | Test implementation                          | Not Started | 2025-10-26 |       |
| 5.8  | Update documentation                         | Not Started | 2025-10-26 |       |

## Progress Log

### 2025-10-26

- Created task file
- Analyzed current game structure
- Developed implementation plan
