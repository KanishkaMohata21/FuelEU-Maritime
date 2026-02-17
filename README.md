
# FuelEU Maritime Compliance Dashboard

A comprehensive compliance management system designed to help shipping companies monitor, bank, and pool their GHG intensity balance under FuelEU Maritime regulations.

## 🌟 Overview

This application allows users to:
1.  **Monitor Routes**: Track voyages and view GHG intensity against 2025 targets.
2.  **Manage Compliance**: Calculate compliance balance (CB) and bank surplus for future use.
3.  **Pool Compliance**: Create pools to transfer surplus from over-compliant ships to under-compliant ones using a greedy allocation algorithm.
4.  **Visualize Data**: Interactive dashboard with real-time updates and historical tracking.

## 🏗️ Architecture (Hexagonal)

The backend follows **Hexagonal Architecture (Ports & Adapters)** to decouple core business logic from external dependencies.

```mermaid
graph TD
    subgraph "Core Domain & Application"
        Entities[Entities (Ship, Route, Pool)]
        UseCases[Use Cases (CreatePool, BankSurplus)]
        Ports[Ports (Repository Interfaces)]
    end

    subgraph "Adapters (Infrastructure)"
        API[API Controllers (Express)]
        DB[Database Adapters (Prisma/Postgres)]
    end

    API -->|Calls| UseCases
    UseCases -->|Uses| Ports
    DB -->|Implements| Ports
    UseCases -->|Manipulates| Entities
```

-   **Domain Layer**: Contains pure business logic and entities (`Ship`, `Pool`, `ComplianceSnapshot`).
-   **Application Layer**: Orchestrates logic via Use Cases (`CreatePoolUseCase`, `GetRoutesUseCase`).
-   **Ports**: Interfaces defining how data is accessed (`PoolRepositoryPort`).
-   **Adapters**:
    -   *Inbound*: `PoolController` (HTTP/Express).
    -   *Outbound*: `PrismaPoolRepository` (PostgreSQL).

## 🚀 Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL (Running locally or via Docker)

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env with DATABASE_URL
npx prisma migrate dev
npx prisma db seed # Seeds initial data (R001-R005)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🧪 Testing

### Automated Unit Tests
Run the comprehensive test suite covering both backend logic and frontend components.

**Backend (Jest):**
```bash
cd backend
npm test
```
*Tests: Compliance Calculation, Banking Logic, Pooling Orchestration.*

**Frontend (Vitest):**
```bash
cd frontend
npx vitest run
```
*Tests: Components (Banking, Routes, Compare, Pooling).*

### Manual Verification Guide

1.  **Routes & Baseline**
    -   **Goal**: Ensure data loads.
    -   **Step**: Go to **Routes Tab**. Verify 5 routes are listed. Click "Set Baseline" on any route.

2.  **Banking Surplus**
    -   **Goal**: Bank surplus from a compliant ship.
    -   **Step**: Go to **Banking Tab**.
        -   **Ship ID**: `R004` (Year `2025`).
        -   Click **Fetch Data**.
        -   Enter Amount: `100`. Click **Bank Surplus**.
        -   Verify "Transactions" count increases.

3.  **Pooling Compliance**
    -   **Goal**: Verify greedy allocation.
    -   **Step**: Go to **Pooling Tab**.
        -   **Year**: `2025`.
        -   **Ship IDs**: `R004, R005`.
        -   Click **Create Pool**.
        -   **Result**: Verify `R004` (Surplus) donates to `R005` (Deficit) in the "Allocation Results" table.

## 📡 Sample API Requests

### Get Routes
**Request:**
```http
GET /routes
```
**Response:**
```json
[
  {
    "route_id": "R001",
    "vesselType": "Container",
    "ghg_intensity": 91.0,
    "year": 2024
  }
]
```

### Create Pool
**Request:**
```http
POST /pools
Content-Type: application/json

{
  "year": 2025,
  "shipIds": ["R004", "R005"] // Example: R004 (Surplus), R005 (Deficit)
}
```
**Response:**
```json
[
  {
    "shipId": "R004",
    "cb_before": 26946.86,
    "cb_after": 21500.00,
    "role": "Donor"
  },
  {
    "shipId": "R005",
    "cb_before": -5400.00,
    "cb_after": 0.00,
    "role": "Receiver"
  }
]
```
