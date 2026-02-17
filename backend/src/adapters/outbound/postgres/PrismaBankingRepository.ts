import { PrismaClient } from '@prisma/client';
import { BankingRepositoryPort } from '../../../core/application/ports/outbound/BankingRepositoryPort';
import { BankEntry } from '../../../core/domain/entities/BankEntry';

export class PrismaBankingRepository implements BankingRepositoryPort {
    constructor(private readonly prisma: PrismaClient) { }

    async saveEntry(entry: BankEntry): Promise<void> {
        await this.prisma.bankEntry.create({
            data: {
                id: entry.id,
                ship_id: entry.ship_id,
                year: entry.year,
                amount_gco2eq: entry.amount_gco2eq,
                createdAt: entry.createdAt
            }
        });
    }

    async findEntriesByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
        const results = await this.prisma.bankEntry.findMany({
            where: {
                ship_id: shipId,
                year: year
            }
        });

        return results.map((r: any) => new BankEntry(
            r.id,
            r.ship_id,
            r.year,
            r.amount_gco2eq,
            r.createdAt
        ));
    }
}
