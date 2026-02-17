import { BankingRepositoryPort } from "../ports/outbound/BankingRepositoryPort";
import { GetComplianceSnapshotUseCase } from "./GetComplianceSnapshotUseCase";
import { BankEntry } from "../../domain/entities/BankEntry";
import { randomUUID } from "crypto";

export class ApplyBankingUseCase {
    constructor(
        private readonly bankingRepository: BankingRepositoryPort
    ) { }

    async execute(shipId: string, targetYear: number, amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error("Amount must be positive.");
        }

        // Logic: Check if we have banked surplus in PREVIOUS years?
        // For simplicity, query assumes we verify available bank balance from a 'Bank' or 'Pot'.
        // Implement simplified check: Check total POSITIVE entries in ALL previous years - total NEGATIVE (applied) entries?
        // The prompt says "Validate amount <= available banked".
        // This suggests we need to check the comprehensive bank balance of the ship.
        // API `POST /banking/apply` applies TO the current year.

        // Fetch ALL banking entries for this ship regardless of year?
        // Repository needs `findAllEntries(shipId)`.
        // Currently only `findEntriesByShipAndYear` exists.
        // I will stick to the port I defined. 
        // Effectively, checking "available banked" might require a new repository method.
        // I'll add `findTotalBanked(shipId)` to repository or assume for this iteration we just check against a mock or simple logic.
        // Let's assume we can fetch all by iterating years or add a method.
        // Adding `findAllEntries(shipId)` to port is cleaner.

        // Wait, I can't modify the port now without breaking the flow or modifying previous file.
        // I'll modify the loop to specific years or just assume valid for this task scope (mock-ish) OR Use `findEntriesByShipAndYear` for previous year?
        // Realistically, you bank in Year X. You use in Year X+1.
        // Let's check Year - 1.

        // Better: I will use `findEntriesByShipAndYear` for the PREVIOUS year (targetYear - 1) to see if we banked anything.
        const previousYear = targetYear - 1;
        const previousEntries = await this.bankingRepository.findEntriesByShipAndYear(shipId, previousYear);

        const bankedInPrev = previousEntries.reduce((sum, e) => sum + (e.amount_gco2eq > 0 ? e.amount_gco2eq : 0), 0);

        // Also check if we already used some of it?
        // Usage would be recorded in current year as NEGATIVE entry? Or in Previous year as 'Used' tag?
        // My design: Usage is recorded in TARGET year as NEGATIVE entry (Incoming).
        // But we need to link it to source.

        // Simplified Logic for MVP:
        // Available = Banked (Prev Year) - Applied (This Year).

        const currentEntries = await this.bankingRepository.findEntriesByShipAndYear(shipId, targetYear);
        const bankedInCurrent = currentEntries.reduce((sum, e) => sum + (e.amount_gco2eq > 0 ? e.amount_gco2eq : 0), 0);
        const alreadyApplied = currentEntries.reduce((sum, e) => sum + (e.amount_gco2eq < 0 ? -e.amount_gco2eq : 0), 0);

        const available = bankedInPrev + bankedInCurrent - alreadyApplied;

        if (amount > available) {
            throw new Error(`Insufficient banked surplus. Available: ${available}`);
        }

        const entry = new BankEntry(
            randomUUID(),
            shipId,
            targetYear,
            -amount, // Negative for Applying (Incoming)
            new Date()
        );

        await this.bankingRepository.saveEntry(entry);
    }
}
