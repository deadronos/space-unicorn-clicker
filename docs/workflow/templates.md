# Templates & Formats

## Task Template (`memory/tasks/TASKNNN-name.md`)

```markdown
---
ID: TASKNNN
Title: Short Description
Status: Pending | In Progress | Completed | Blocked
Added: YYYY-MM-DD
Updated: YYYY-MM-DD
---

# Original Request

[The user's original goal]

# Thought Process / Design Reference

[Link to /memory/designs/DESIGNNN-*.md if applicable]

# Implementation Plan

1. [ ] Step one...

# Progress Log

- YYYY-MM-DD: Started work...

# Acceptance Criteria & Tests

- [ ] Logic X works correctly (tested via vitest)
```

## Design Template (`memory/designs/DESIGNNN-name.md`)

```markdown
---
ID: DESIGNNN
Title: Short Description
Status: Draft | Approved | Archived
Author: Author Name
Date: YYYY-MM-DD
---

## Overview

[Context and purpose]

## Architecture/Flow

[Mermaid or ASCII diagram]

## Interfaces & Contracts

[API signatures, data models]

## Acceptance Criteria

[What defines success]

## Risks & Trade-offs

[Potential issues]
```

## Requirements (EARS Format)

Stored in `memory/requirements.md`. Use the format:
`WHEN <trigger>, THE SYSTEM SHALL <behavior>. [Acceptance: <test description>]`

Example:
`WHEN a player clicks the unicorn, THE SYSTEM SHALL increment the score by 1. [Acceptance: unit test simulates click increments count]`
