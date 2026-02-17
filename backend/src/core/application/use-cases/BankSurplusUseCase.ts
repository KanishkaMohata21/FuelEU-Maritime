import { BankingRepositoryPort } from "../ports/outbound/BankingRepositoryPort";
import { GetComplianceSnapshotUseCase } from "./GetComplianceSnapshotUseCase";
import { BankEntry } from "../../domain/entities/BankEntry";
import { randomUUID } from "crypto";

export class BankSurplusUseCase {
    constructor(
        private readonly getComplianceSnapshotUseCase: GetComplianceSnapshotUseCase,
        private readonly bankingRepository: BankingRepositoryPort
    ) { }

    async execute(shipId: string, year: number, amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error("Amount must be positive to bank.");
        }

        const snapshot = await this.getComplianceSnapshotUseCase.execute(shipId, year);

        // Calculate currently available surplus (Raw CB - already banked)
        const entries = await this.bankingRepository.findEntriesByShipAndYear(shipId, year);
        const alreadyBanked = entries.reduce((sum, e) => sum + (e.amount_gco2eq > 0 ? e.amount_gco2eq : 0), 0);

        const availableSurplus = snapshot.cb_gco2eq - alreadyBanked;

        if (availableSurplus < amount) {
            throw new Error("Insufficient compliance surplus to bank.");
        }

        const entry = new BankEntry(
            randomUUID(),
            shipId,
            year,
            amount, // Positive for Banking
            new Date()
        );

        await this.bankingRepository.saveEntry(entry);
    }
}
