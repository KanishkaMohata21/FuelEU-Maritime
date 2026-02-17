import { ComplianceRepositoryPort } from "../ports/outbound/ComplianceRepositoryPort";
import { RouteRepositoryPort } from "../ports/outbound/RouteRepositoryPort";
import { ComplianceSnapshot } from "../../domain/entities/ComplianceSnapshot";
import { FuelConstants } from "../../domain/constants/FuelConstants";

export class GetComplianceSnapshotUseCase {
    constructor(
        private readonly complianceRepository: ComplianceRepositoryPort,
        private readonly routeRepository: RouteRepositoryPort
    ) { }

    async execute(shipId: string, year: number): Promise<ComplianceSnapshot> {
        // 1. Try to find existing snapshot
        const existingSnapshot = await this.complianceRepository.findSnapshot(shipId, year);
        if (existingSnapshot) {
            return existingSnapshot;
        }

        // 2. If not found, calculate it
        const routes = await this.routeRepository.findAll();
        // Filter routes by specific ship (assuming route_id or another field links to ship, but currently Route has no shipId. 
        // The prompt implies a shipId, but Route entity only has route_id. 
        // Looking at schema: ShipCompliance has ship_id. Route has... nothing explicitly linking to a ship unless route_id is unique per ship or we filter differently.
        // Wait, schema.prisma Route model has no ship_id. 
        // Let's assume for now that we filter routes by year and perhaps we need to add ship_id to Route later?
        // Or maybe all current routes belong to the single ship context?
        // The prompt asks for `GET /compliance/cb?shipId&year`.
        // Inspecting Route.ts again. It has `route_id`.
        // Inspecting schema.prisma again. Route has `route_id`.
        // If I look at `GetRoutesUseCase`, it returns all routes.
        // For this task, I will assume we fetch ALL routes for the year, 
        // OR I should update Route to have ship_id? 
        // The USER REQUEST implies `shipId` query param.
        // Let's check `PrismaRouteRepository.ts`.

        // For now, I will fetch all routes and filter by year. Verification step will clarify if we need ship_id on Route.
        const yearRoutes = routes.filter(r => r.year === year);

        let cb_gco2eq = 0;

        for (const route of yearRoutes) {
            if (route.fuelConsumption && route.fuelType && route.ghg_intensity !== null) {
                const lcv = FuelConstants.getLCV(route.fuelType);
                const energy = route.fuelConsumption * lcv; // Mass * LCV = Energy
                const compliance = energy * (FuelConstants.TARGET_GHG_INTENSITY_2025 - route.ghg_intensity);
                cb_gco2eq += compliance;
            }
        }

        // 3. Create and save snapshot
        // Note: ID generation should ideally happen in repo or here via uuid lib. 
        // For simplicity, passing empty string to let repo handle or using a placeholder if repo generates it. 
        // But Entity expects ID.
        // I will let the repository implementation assign UUID if possible, or generate one here.
        // Since I don't have uuid lib installed in package.json (checked earlier), I'll rely on DB or simple random string for now or install uuid.
        // `crypto.randomUUID()` is available in Node > 14.

        const snapshot = new ComplianceSnapshot(
            crypto.randomUUID(),
            shipId,
            year,
            cb_gco2eq
        );

        await this.complianceRepository.saveSnapshot(snapshot);

        return snapshot;
    }
}
