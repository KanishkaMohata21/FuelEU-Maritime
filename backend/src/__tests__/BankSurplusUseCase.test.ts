
import { BankSurplusUseCase } from "../core/application/use-cases/BankSurplusUseCase";
import { GetComplianceSnapshotUseCase } from "../core/application/use-cases/GetComplianceSnapshotUseCase";
import { BankingRepositoryPort } from "../core/application/ports/outbound/BankingRepositoryPort";
import { ComplianceSnapshot } from "../core/domain/entities/ComplianceSnapshot";
import { BankEntry } from "../core/domain/entities/BankEntry";

// Mock dependencies
const mockGetSnapshot = {
    execute: jest.fn()
} as unknown as GetComplianceSnapshotUseCase;

const mockRepo = {
    saveEntry: jest.fn(),
    findEntriesByShipAndYear: jest.fn()
} as unknown as BankingRepositoryPort;

describe('BankSurplusUseCase', () => {
    let useCase: BankSurplusUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new BankSurplusUseCase(mockGetSnapshot, mockRepo);
    });

    it('should throw if amount is non-positive', async () => {
        await expect(useCase.execute('S1', 2025, 0)).rejects.toThrow('Amount must be positive');
        await expect(useCase.execute('S1', 2025, -10)).rejects.toThrow('Amount must be positive');
    });

    it('should throw if insufficient available surplus', async () => {
        // Snapshot has 100 surplus
        (mockGetSnapshot.execute as jest.Mock).mockResolvedValue(new ComplianceSnapshot('id', 'S1', 2025, 100));

        // Already banked 80
        (mockRepo.findEntriesByShipAndYear as jest.Mock).mockResolvedValue([
            new BankEntry('1', 'S1', 2025, 80, new Date())
        ]);

        // Try to bank 30 (Available = 100 - 80 = 20)
        await expect(useCase.execute('S1', 2025, 30)).rejects.toThrow('Insufficient compliance surplus');
    });

    it('should save entry if valid', async () => {
        // Snapshot has 100 surplus
        (mockGetSnapshot.execute as jest.Mock).mockResolvedValue(new ComplianceSnapshot('id', 'S1', 2025, 100));

        // Already banked 0
        (mockRepo.findEntriesByShipAndYear as jest.Mock).mockResolvedValue([]);

        // Bank 50
        await useCase.execute('S1', 2025, 50);

        expect(mockRepo.saveEntry).toHaveBeenCalledWith(expect.objectContaining({
            ship_id: 'S1',
            year: 2025,
            amount_gco2eq: 50
        }));
    });
});
