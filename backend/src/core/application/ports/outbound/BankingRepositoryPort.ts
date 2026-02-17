import { BankEntry } from "../../../domain/entities/BankEntry";

export interface BankingRepositoryPort {
    saveEntry(entry: BankEntry): Promise<void>;
    findEntriesByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
}
