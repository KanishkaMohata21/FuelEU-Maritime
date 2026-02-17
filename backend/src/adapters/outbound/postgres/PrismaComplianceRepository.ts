import { PrismaClient } from '@prisma/client';
import { ComplianceRepositoryPort } from '../../../core/application/ports/outbound/ComplianceRepositoryPort';
import { ComplianceSnapshot } from '../../../core/domain/entities/ComplianceSnapshot';

export class PrismaComplianceRepository implements ComplianceRepositoryPort {
    constructor(private readonly prisma: PrismaClient) { }

    async saveSnapshot(snapshot: ComplianceSnapshot): Promise<void> {
        await this.prisma.shipCompliance.upsert({
            where: {
                ship_id_year: {
                    ship_id: snapshot.ship_id,
                    year: snapshot.year
                }
            },
            update: {
                cb_gco2eq: snapshot.cb_gco2eq
            },
            create: {
                id: snapshot.id,
                ship_id: snapshot.ship_id,
                year: snapshot.year,
                cb_gco2eq: snapshot.cb_gco2eq
            }
        });
    }

    async findSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot | null> {
        const result = await this.prisma.shipCompliance.findUnique({
            where: {
                ship_id_year: {
                    ship_id: shipId,
                    year: year
                }
            }
        });

        if (!result) return null;

        return new ComplianceSnapshot(
            result.id,
            result.ship_id,
            result.year,
            result.cb_gco2eq
        );
    }
}
