import { Pool } from "../../domain/entities/Pool";
import { PoolRepositoryPort } from "../ports/outbound/PoolRepositoryPort";
import { GetAdjustedComplianceUseCase } from "./GetAdjustedComplianceUseCase";

export class CreatePoolUseCase {
    constructor(
        private readonly poolRepository: PoolRepositoryPort,
        private readonly getAdjustedComplianceUseCase: GetAdjustedComplianceUseCase
    ) { }

    async execute(year: number, shipIds: string[]): Promise<Pool> {
        // 1. Fetch Adjusted Compliance for all ships
        // We use Adjusted CB because pooling happens AFTER banking?
        // Rules say: "Banked surplus... can be pooled".
        // "Deficit... can be pooled".
        // So yes, we take the post-banking status.

        const shipBalances = await Promise.all(shipIds.map(async (id) => {
            const cb = await this.getAdjustedComplianceUseCase.execute(id, year);
            return { shipId: id, cb_balance: cb };
        }));

        // 2. Create Pool Domain Object
        const pool = Pool.create(year, shipBalances);

        // 3. Validation
        pool.validate();

        // 4. Greedy Allocation
        pool.allocate();

        // 5. Persist
        await this.poolRepository.save(pool);

        return pool;
    }
}
