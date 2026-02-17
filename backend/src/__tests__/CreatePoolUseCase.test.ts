
import { CreatePoolUseCase } from "../core/application/use-cases/CreatePoolUseCase";
import { PoolRepositoryPort } from "../core/application/ports/outbound/PoolRepositoryPort";
import { GetAdjustedComplianceUseCase } from "../core/application/use-cases/GetAdjustedComplianceUseCase";
import { Pool } from "../core/domain/entities/Pool";

// Mock dependencies
const mockPoolRepo = {
    save: jest.fn()
} as unknown as PoolRepositoryPort;

const mockGetAdjusted = {
    execute: jest.fn()
} as unknown as GetAdjustedComplianceUseCase;

describe('CreatePoolUseCase', () => {
    let useCase: CreatePoolUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreatePoolUseCase(mockPoolRepo, mockGetAdjusted);
    });

    it('should create and allocate a valid pool', async () => {
        // Setup ship balances
        // S1: +100, S2: -50
        (mockGetAdjusted.execute as jest.Mock)
            .mockResolvedValueOnce(100)  // S1
            .mockResolvedValueOnce(-50); // S2

        const pool = await useCase.execute(2025, ['S1', 'S2']);

        expect(pool).toBeInstanceOf(Pool);
        expect(pool.year).toBe(2025);
        expect(pool.members).toHaveLength(2);

        // Validated allocation result
        // S1 should have 50 left
        // S2 should have 0
        const s1 = pool.members.find(m => m.shipId === 'S1');
        const s2 = pool.members.find(m => m.shipId === 'S2');
        expect(s1?.cb_after).toBe(50);
        expect(s2?.cb_after).toBe(0);

        expect(mockPoolRepo.save).toHaveBeenCalledWith(pool);
    });

    it('should bubble up validation errors (Negative Total)', async () => {
        // S1: -10, S2: -50 (Total -60) -> Invalid
        (mockGetAdjusted.execute as jest.Mock)
            .mockResolvedValueOnce(-10)
            .mockResolvedValueOnce(-50); // S2

        await expect(useCase.execute(2025, ['S1', 'S2']))
            .rejects
            .toThrow('Pool total compliance balance is negative');

        expect(mockPoolRepo.save).not.toHaveBeenCalled();
    });
});
