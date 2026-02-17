
# Reflection on Using AI Agents for FuelEU Maritime Development

### 🧠 What was learned using AI agents?
Working with AI agents reinforced the importance of **clear architectural boundaries**. By explicitly defining Hexagonal Architecture (Ports & Adapters) upfront, the agent was able to generate highly modular code (Entities, Use Cases, Repositories) that adhered strictly to separation of concerns. The AI excelled at boilerplate generation but required precise guidance for complex business logic, such as the **greedy allocation algorithm** for pooling and the specific compliance formulas. 

A key learning was the **iterative nature of testing**. The agent initially struggled with mocking complex dependency chains (e.g., sequential API calls in `BankingTab` or `Pool` entity state updates). However, through feedback loops where error logs were provided, the agent could self-correct, teaching us that AI is not just a code generator but a collaborative debugger that improves with context.

### ⚡ Efficiency gains vs manual coding
The efficiency gains were substantial, estimating a **5x to 10x speed increase** for initial scaffolding and boilerplate code. 
-   **Backend**: Setting up the entire Hexagonal structure, Prisma schema, and CRUD endpoints took minutes instead of hours.
-   **Frontend**: Creating responsive UI components with consistent styling and mock data integration was significantly faster than manual coding.
-   **Testing**: Writing comprehensive unit tests (Jest/Vitest) is often tedious. The agent automated 80-90% of this work, including complex mocks, allowing the developer to focus on edge cases and logic verification.

Overall, the project timeline was compressed from what might have been a 3-4 day sprint into a few hours of intense, guided development.

### 🔧 Improvements for next time
1.  **Granular Task Breakdown**: While the agent handled large tasks well, breaking down complex logic (like Pooling) into smaller, verifiable chunks earlier would reduce debugging time.
2.  **Integration First**: Implementing end-to-end integration tests sooner, rather than relying solely on unit tests, would have caught identifying issues (like the `PoolingTab` title mismatch) earlier in the cycle.
