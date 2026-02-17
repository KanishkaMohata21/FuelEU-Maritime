import { ComplianceSnapshot } from "../../../domain/entities/ComplianceSnapshot";

export interface ComplianceRepositoryPort {
    saveSnapshot(snapshot: ComplianceSnapshot): Promise<void>;
    findSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot | null>;
}
