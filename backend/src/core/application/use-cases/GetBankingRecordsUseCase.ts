import { BankingRepositoryPort } from "../ports/outbound/BankingRepositoryPort";
import { BankEntry } from "../../domain/entities/BankEntry";

export class GetBankingRecordsUseCase {
    constructor(private readonly bankingRepository: BankingRepositoryPort) { }

    async execute(shipId: string, year: number): Promise<BankEntry[]> {
        return this.bankingRepository.findEntriesByShipAndYear(shipId, year);
    }
}
