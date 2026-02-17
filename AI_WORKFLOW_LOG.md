# AI Agent Workflow Log

**Project**: FuelEU Maritime Compliance Platform
**Assistants Used**: Google DeepMind Agent (Antigrav)

---

## 🛠️ Phase 1: Architecture & Scaffolding

### 📝 Prompt
> "Initialize a full-stack project with a Monorepo structure: `backend` (Node/Express/TypeScript/Prisma) and `frontend` (React/Vite/Tailwind). Enforce a Hexagonal Architecture in the backend with `core`, `adapters`, and `infrastructure` layers. Create a `task.md` to track progress."

### 🤖 Output
-   **Structure Created**:
    -   `backend/src/core/domain/entities`: `Route`, `Pool`, `ComplianceSnapshot`
    -   `backend/src/core/application/ports`: `RouteRepositoryPort`, `PoolRepositoryPort`
    -   `backend/src/adapters/inbound/http`: `RoutesController`, `PoolController`
-   **Configuration**:
    -   Initialized `tsconfig.json`, `package.json`, and `vite.config.ts`.
    -   Set up Prisma with PostgreSQL provider.

### ✅ Validation & Fixes
-   **Agent**: "I have set up the folder structure. Please configure your `.env` file."
-   **User Action**: Database connection failed (`P1000`).
-   **Correction**: Agent suggested checking `pg_hba.conf` or using the correct Docker container credentials. User fixed the local Postgres config.

---

## �️ Phase 1.5: Database Design & Seeding

### 📝 Prompt
> "Define the `schema.prisma` file with the following models: `Route` (id, year, ghg_intensity, fuelConsumption, distance), `ComplianceSnapshot` (shipId, cb_balance), `BankEntry`. Also, write a seed script `prisma/seed.ts` that populates the database with the 5 provided mock ships: R001 (Container), R002 (BulkCarrier), etc. Ensure correct data types for financial precision."

### 🤖 Output
-   **Schema**: Created optimized relational schema.
-   **Seed**:
    ```typescript
    // Generated Seed Logic
    const routes = [
      { route_id: 'R001', vesselType: 'Container', ghg_intensity: 91.0 ... },
      // ... mapped 5 ships correctly
    ];
    await prisma.route.createMany({ data: routes });
    ```
-   **Config**: Updated `package.json` with a specific seed command (`ts-node prisma/seed.ts`).

### ✅ Validation & Fixes
-   **Issue**: `ts-node` failed due to module resolution.
-   **Fix**: Agent generated a specific `tsconfig.json` for the seed execution context.

---

## �🚢 Phase 2: Domain Implementation (Routes & Compliance)

### 📝 Prompt
> "Implement the `Route` entity and `GetComplianceSnapshotUseCase`. The compliance formula is `(Target - Actual) * Energy`. Target for 2025 is 89.3368. Use standard shipping constants."

### 🤖 Output
-   **Code Generation**:
    -   Defined `Route` class with `ghg_intensity`, `fuelConsumption`, `distance`.
    -   Implemented `calculateComplianceBalance()` method in the domain service.
    -   Created `PrismaRouteRepository` to fetch routes from the database.
-   **Seed Data**:
    -   Generated `prisma/seed.ts` with 5 realistic ships (Container, BulkCarrier, Tanker) to match the assignment data.

### ✅ Validation & Fixes
-   **Issue**: The agent initially used a generic `id` for routes.
-   **Fix**: Prompted to rename to `route_id` to match the assignment spec (`R001`, `R002`, etc.) and ensure consistency across Frontend/Backend.

---

## 🏦 Phase 3: Banking & Pooling Logic

### 📝 Prompt
> "Implement the Banking and Pooling logic. Banking allows saving surplus. Pooling requires a greedy algorithm to distribute surplus to deficit ships. Ensure `CreatePoolUseCase` handles the allocation."

### 🤖 Output
-   **Algorithm Implementation**:
    ```typescript
    // Generated Greedy Allocation Logic
    const sortedMembers = members.sort((a, b) => b.complianceBalance - a.complianceBalance);
    // Logic to iterate and transfer surplus...
    ```
-   **Architecture**:
    -   Created `CreatePoolUseCase` that accepts `year` and `shipIds`.
    -   Injected `GetAdjustedComplianceUseCase` to ensure fresh data before pooling.

### ✅ Validation & Fixes
-   **Refinement**: The initial loop didn't account for floating-point precision errors (e.g., `0.0000001` surplus).
-   **Fix**: Agent added a rounding utility to ensure financial-grade precision (`toFixed(2)` logic) before persisting to the DB.

---

## 💻 Phase 4: Frontend Development

### 📝 Prompt
> "Create a React Dashboard with 4 tabs: Routes, Compare, Banking, Pooling. Use TailwindCSS for a clean, maritime-themed UI (blues/whites). Integrate with the backend APIs."

### 🤖 Output
-   **Components**:
    -   `RoutesTab`: Table with compliance status.
    -   `CompareTab`: Bar chart using formatted CSS bars (no heavy charting library needed).
    -   `BankingTab`: Interactive UI to "Bank Surplus" or "Apply to Deficit".
    -   `PoolingTab`: Drag-and-drop style selection (implemented as checkboxes) to create pools.
-   **Styling**:
    -   Generated responsive layouts with `flex` and `grid`.
    -   Added loading states and error handling for API failures.

### ✅ Validation & Fixes
-   **Issue**: Frontend failed to fetch data due to CORS.
-   **Fix**: Agent updated `backend/server.ts` to include `app.use(cors())` and configured the Vite proxy in `vite.config.ts`.

---

## � Phase 3: API & Endpoint Implementation

### 📝 Prompt
> "Implement the Express API endpoints to expose the core logic. Group them by feature:
> 1.  **Routes**: GET `/routes` (all), POST `/routes/:id/baseline` (set baseline), GET `/routes/comparison` (calculate % diff & compliant flag).
> 2.  **Compliance**: GET `/compliance/cb` (snapshot), GET `/compliance/adjusted-cb` (after banking).
> 3.  **Banking**: GET `/banking/records`, POST `/banking/bank` (bank surplus), POST `/banking/apply` (validate amount <= available).
> 4.  **Pooling**: POST `/pools` (greedy allocation). Validate that the sum of CB >= 0 and no deficit ship exists worse off."

### 🤖 Output
-   **Routes**: implemented `RoutesController` with `getComparison` logic `((ghg / baseline) - 1) * 100`.
-   **Compliance**: Wired `GetComplianceSnapshotUseCase` to `/compliance/cb`.
-   **Banking**:
    -   Implemented validation middleware.
    -   Created `BankingController` with methods `bankSurplus` and `applyBanking`.
-   **Pooling**:
    -   Implemented `PoolController.createPool`.
    -   Added verification logic: `if (poolSum < 0) throw new BadRequestError(...)`.

### ✅ Validation & Fixes
-   **Issue**: `POST /pools` was crashing on empty member lists.
-   **Fix**: Added a guard clause `if (members.length < 2)` to ensure a pool has at least two ships.

---

## �🔗 Phase 4.5: Frontend-Backend Integration

### 📝 Prompt
> "Integrate the Frontend Tabs with the Backend API. Create a reusable `HttpApiClient` using `fetch` to handle requests to `http://localhost:3000`. Ensure the `RoutesTab` fetches data from `/routes` and the `BankingTab` posts directly to `/banking/apply`. Handle CORS errors."

### 🤖 Output
-   **API Client**:
    -   Created typed `get<T>` and `post<T>` methods.
    -   Centralized error handling (e.g., throwing on 400/500 status codes).
-   **Proxy Config**:
    -   Updated `vite.config.ts` to proxy `/api` requests to the backend during development to avoid CORS issues entirely.

### ✅ Validation & Fixes
-   **Issue**: Frontend failed to fetch data due to CORS on `localhost:3000`.
-   **Fix**: Agent updated `backend/server.ts` to include `app.use(cors())` and configured the Vite proxy settings correctly.

---

## 🧪 Phase 5: Testing & Verification

### 📝 Prompt
> "Write unit tests for the backend use cases and frontend components. Ensure the Pooling algorithm is verified."

### 🤖 Output
-   **Backend Tests (Jest)**:
    -   `CreatePoolUseCase.test.ts`: Verified that surplus ships correctly zero out deficit ships.
    -   `Compliance.test.ts`: Verified the math against manual calculation.
-   **Frontend Tests (Vitest)**:
    -   Render tests for all Tabs.
    -   Mocked `fetch` calls to test success/error states.

### ✅ Validation & Fixes
-   **Observation**: One test failed because the mock date was different from the system date.
-   **Fix**: Hardcoded dates in test fixtures to ensure determinism.

---

## 🧠 Reflection & Best Practices

### Observations
1.  **Architecture First**: Defining the directory structure (Ports/Adapters) *before* writing logic prevented the "God Class" anti-pattern.
2.  **Context Management**: Providing the `schema.prisma` file to the agent before asking for Frontend interfaces ensured 100% type safety without shared packages.
3.  **Error Recovery**: The agent is excellent at fixing its own compilation errors if fed the error log immediately.

### Best Practices Followed
-   **Task Tracking**: Updated `task.md` after every major step.
-   **Separation of Concerns**: UI components never calculate compliance; they only display it.
-   **Defensive Coding**: Added `try/catch` blocks in all Controllers to prevent server crashes.

---
**Status**: 🟢 Completed | **Documentation**: Updated | **Tests**: Passed
