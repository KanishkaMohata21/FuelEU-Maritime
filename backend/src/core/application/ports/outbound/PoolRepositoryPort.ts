import { Pool } from "../../../domain/entities/Pool";

export interface PoolRepositoryPort {
    save(pool: Pool): Promise<void>;
    findById(id: string): Promise<Pool | null>;
}
