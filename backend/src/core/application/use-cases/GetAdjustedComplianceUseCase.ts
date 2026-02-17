import { ComplianceRepositoryPort } from "../ports/outbound/ComplianceRepositoryPort";
import { BankingRepositoryPort } from "../ports/outbound/BankingRepositoryPort";
import { GetComplianceSnapshotUseCase } from "./GetComplianceSnapshotUseCase";

export class GetAdjustedComplianceUseCase {
    constructor(
        private readonly getComplianceSnapshotUseCase: GetComplianceSnapshotUseCase,
        private readonly bankingRepository: BankingRepositoryPort
    ) { }

    async execute(shipId: string, year: number): Promise<number> {
        // 1. Get Base Compliance
        const snapshot = await this.getComplianceSnapshotUseCase.execute(shipId, year);

        // 2. Get Banking Entries
        const bankEntries = await this.bankingRepository.findEntriesByShipAndYear(shipId, year);

        // 3. Sum Banking Adjustments
        // Positive BankEntry means we BANKED surplus (removed from current year balance, so subtract)
        // Negative BankEntry means we USED banked surplus (added to current year balance, so add)
        // Wait, logic check:
        // If I bank surplus, my current compliance goes down? No, surplus IS positive compliance.
        // If I have +1000 surplus.
        // Option A: I leave it. CB = +1000.
        // Option B: I bank it. 'amount_gco2eq' in BankEntry = +1000.
        // Adjusted CB should reflect what is LEFT in the current year. So +1000 - 1000 = 0.
        // So SUBTRACT banked amount.

        // If I have -500 deficit.
        // I use banked surplus from previous year.
        // 'amount_gco2eq' in BankEntry.
        // If I represent usage as a positive value "Applied 500", then I ADD it to balance. -500 + 500 = 0.
        // If I represent usage as negative value in BankEntry table? 
        // The prompt says: "POST /banking/apply — apply banked surplus".
        // Let's decide convention:
        // BankEntry: 
        // type: "BANK" -> amount is positive. Subtract from currents.
        // type: "USE" -> amount is positive. Add to currents.
        // OR
        // BankEntry just has 'amount'.
        // If I BANK, I record +Amount.
        // If I USE, I record -Amount?
        // Let's look at `BankEntry` entity. It just has `amount_gco2eq`.

        // Revised Logic:
        // Banking Surplus: Record POSITIVE amount. This amount is MOVED to bank. So it leaves the current year.
        // Applying Surplus: Record NEGATIVE amount? Or distinct type?
        // Let's assume:
        // We need to support "Bank Positive CB" -> Reduces current year CB.
        // "Apply Banked Surplus" -> Increases current year CB (initial deficit).

        // Let's treat BankEntry amounts as "Adjustments to CURRENT year".
        // If I BANK 100 surplus: The intent is to SAVE it for later. So it shouldn't count for THIS year? 
        // Actually, FuelEU says you can bank surplus. The surplus exists in 2025. You bank it for 2026.
        // So for 2025, the status is "Compliant (Banked)". The balance is effectively used.
        // Effectively, `Adjusted CB` = `Raw CB` - `Banked Amount` + `Borrowed/Applied Amount`.

        // I will implement: 
        // BankSurplus -> Stores POSITIVE amount.
        // ApplyBanking -> Stores NEGATIVE amount (representing ADDITION to this year from bank? No, that's borrowing).
        // Wait. "Apply banked surplus" usually means taking from PAST year bank to fix CURRENT year deficit.

        // Let's stick to simple ledger:
        // Adjusted CB = Base CB - Sum(BankEntries).
        // If I Bank 100: Adjusted = 100 - 100 = 0.
        // If I Apply 50 (from past): I am bringing 50 INTO this year. 
        // So I should record -50? Then Adjusted = -100 - (-50) = -50. Correct.

        // So convention: 
        // Banked (Outgoing) = POSITIVE.
        // Applied (Incoming) = NEGATIVE.

        const totalBankingAdjustment = bankEntries.reduce((sum, entry) => sum + entry.amount_gco2eq, 0);

        return snapshot.cb_gco2eq - totalBankingAdjustment;
    }
}
