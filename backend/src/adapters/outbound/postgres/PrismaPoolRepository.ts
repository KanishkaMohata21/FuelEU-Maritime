import { PrismaClient } from '@prisma/client';
import { PoolRepositoryPort } from '../../../core/application/ports/outbound/PoolRepositoryPort';
import { Pool } from '../../../core/domain/entities/Pool';
import { PoolMember } from '../../../core/domain/entities/PoolMember';

export class PrismaPoolRepository implements PoolRepositoryPort {
    constructor(private readonly prisma: PrismaClient) { }

    async save(pool: Pool): Promise<void> {
        await this.prisma.pool.create({
            data: {
                id: pool.id,
                year: pool.year,
                members: {
                    create: pool.members.map(m => ({
                        id: m.id,
                        shipId: m.shipId,
                        cb_before: m.cb_before,
                        cb_after: m.cb_after
                    }))
                }
            }
        });
    }

    async findById(id: string): Promise<Pool | null> {
        const result = await this.prisma.pool.findUnique({
            where: { id },
            include: { members: true }
        });

        if (!result) return null;

        const members = result.members.map((m: any) => new PoolMember(
            m.id,
            m.poolId,
            m.shipId,
            m.cb_before,
            m.cb_after
        ));

        return new Pool(result.id, result.year, members);
    }
}
