
import { GetComplianceSnapshotUseCase } from "../core/application/use-cases/GetComplianceSnapshotUseCase";
import { ComplianceRepositoryPort } from "../core/application/ports/outbound/ComplianceRepositoryPort";
import { RouteRepositoryPort } from "../core/application/ports/outbound/RouteRepositoryPort";
import { Route } from "../core/domain/entities/Route";
import { ComplianceSnapshot } from "../core/domain/entities/ComplianceSnapshot";

// Mock dependencies
const mockComplianceRepo = {
    findSnapshot: jest.fn(),
    saveSnapshot: jest.fn()
} as unknown as ComplianceRepositoryPort;

const mockRouteRepo = {
    findAll: jest.fn()
} as unknown as RouteRepositoryPort;

describe('GetComplianceSnapshotUseCase', () => {
    let useCase: GetComplianceSnapshotUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetComplianceSnapshotUseCase(mockComplianceRepo, mockRouteRepo);
    });

    it('should return existing snapshot if found', async () => {
        const existing = new ComplianceSnapshot('id', 'R004', 2025, 100);
        (mockComplianceRepo.findSnapshot as jest.Mock).mockResolvedValue(existing);

        const result = await useCase.execute('R004', 2025);
        expect(result).toBe(existing);
        expect(mockRouteRepo.findAll).not.toHaveBeenCalled();
    });

    it('should calculate compliance correctly (Surplus)', async () => {
        (mockComplianceRepo.findSnapshot as jest.Mock).mockResolvedValue(null);

        // Mock Routes for R004/2025
        // R004: HFO, 4900t, GHGI 89.2. Target 2025 = 89.3368.
        // LCV HFO = 40.2
        // Energy = 4900 * 40.2 = 196980 MJ
        // Compliance = 196980 * (89.3368 - 89.2) = 196980 * 0.1368 = 26946.86 (approx)

        const routes = [
            // Correct ship and year
            new Route('1', 'R004', 'RoRo', 'HFO', 2025, 89.2, 4900, 11800, 4300, false),
            // Wrong ship
            new Route('2', 'R005', 'Container', 'LNG', 2025, 90.5, 4950, 11900, 4400, false),
            // Wrong year
            new Route('3', 'R004', 'RoRo', 'HFO', 2024, 89.2, 4900, 11800, 4300, false)
        ];
        (mockRouteRepo.findAll as jest.Mock).mockResolvedValue(routes);

        const result = await useCase.execute('R004', 2025);

        // Verify calculation
        // Energy = 4900 * 40.2 = 196980
        // Diff = 89.3368 - 89.2 = 0.1368
        // CB = 196980 * 0.1368 = 26946.864

        expect(result.cb_gco2eq).toBeCloseTo(26946.86, 0);
        expect(mockComplianceRepo.saveSnapshot).toHaveBeenCalledWith(expect.objectContaining({
            ship_id: 'R004',
            year: 2025,
            cb_gco2eq: expect.closeTo(26946.86, 0)
        }));
    });

    it('should calculate compliance correctly (Deficit)', async () => {
        (mockComplianceRepo.findSnapshot as jest.Mock).mockResolvedValue(null);

        // Mock Routes for R001/2025 (Hypothetical deficit)
        // GHGI 91.0 > 89.3368
        const routes = [
            new Route('1', 'R001', 'Container', 'HFO', 2025, 91.0, 1000, 1000, 1000, false)
        ];
        (mockRouteRepo.findAll as jest.Mock).mockResolvedValue(routes);

        const result = await useCase.execute('R001', 2025);

        // Energy = 1000 * 40.2 = 40200
        // Diff = 89.3368 - 91.0 = -1.6632
        // CB = 40200 * -1.6632 = -66860.64

        expect(result.cb_gco2eq).toBeLessThan(0);
        expect(result.cb_gco2eq).toBeCloseTo(-66860.64, 0);
    });
});
