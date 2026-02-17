# AI Agent Workflow Log

**Agent Used**: Google DeepMind Agent (Antigrav)

## Prompts & Outputs

### Session 1: Project Setup
*   **Prompt**: "Inside the backend folder, create a Hexagonal Architecture structure..."
*   **Output**: Created directory structure for backend.
*   **Prompt**: "Inside the frontend folder, create a React + TypeScript project..."
*   **Output**: Created vite project and hexagonal structure.

### Session 2: Database Setup
*   **Prompt**: "Define schema.prisma with: Route, ShipCompliance, BankEntry, Pool, PoolMember."
*   **Output**: Initialized Prisma and created `schema.prisma`.
*   **Prompt**: "Create a Seed Script (prisma/seed.ts) with the 5 provided mock ships."
*   **Output**: Created seed script and updated `package.json`.

## Validation / Corrections
*   User installed Prisma manually, Agent proceeded with configuration.
*   User encountered authentication error (P1000) during migration. Agent suggested credentials or Docker.
*   User fixed local Postgres auth (`pg_hba.conf`) and successfully migrated.

## Observations
*   Agent successfully scaffolded a complex directory structure in seconds.
*   Database setup required user intervention for local environment specifics (authentication).

## Best Practices Followed
*   **Hexagonal Architecture**: Strict separation of Core, Adapters, and Infrastructure.
*   **Task Tracking**: Maintained `task.md` to track progress.
