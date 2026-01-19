# AGENTS — Space Unicorn Clicker Workflow

Space Unicorn Clicker is a high-performance, WebGL-powered incremental game built with React and Pixi.js.

This repository uses a **Spec-Driven Workflow** powered by a **Memory Bank**. Every agent MUST follow these principles to maintain continuity and project health.

## Core Project Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Typecheck**: `npm run typecheck`
- **Testing**: `npm run test`

## 🧩 Progressive Disclosure: Workflow Guides

Detailed instructions are split into logical modules to keep your context window clean:

1. **[Memory Bank Management](./docs/workflow/memory-bank.md)**
   - Folder structure (`/memory`), indexing rules, and ID uniqueness.
2. **[Agent Lifecycle](./docs/workflow/agent-lifecycle.md)**
   - The 6-step workflow: Start-up, Plan, Implement, Validate, Reflect, Handoff.
3. **[Templates & Formats](./docs/workflow/templates.md)**
   - Specifications for Tasks, Designs, and Requirements (EARS).
4. **[Development Standards](./docs/workflow/development-standards.md)**
   - Commit conventions, testing requirements, and failure recovery.

---

### Critical Start-up Checklist

- [ ] Read `memory/activeContext.md` and `memory/progress.md`.
- [ ] Check `memory/tasks/_index.md` for current status.
- [ ] Always create/update a task file before implementation.
