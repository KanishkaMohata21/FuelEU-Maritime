import { Request, Response } from 'express';
import { CreatePoolUseCase } from '../../../core/application/use-cases/CreatePoolUseCase';

export class PoolController {
    constructor(private readonly createPoolUseCase: CreatePoolUseCase) { }

    async createPool(req: Request, res: Response): Promise<void> {
        try {
            const { year, shipIds } = req.body;

            if (!year || !Array.isArray(shipIds) || shipIds.length === 0) {
                res.status(400).json({ error: 'year and non-empty shipIds array are required' });
                return;
            }

            const pool = await this.createPoolUseCase.execute(parseInt(year), shipIds);

            // Return formatted response
            // "Return cb_after per member"
            const result = pool.members.map(m => ({
                shipId: m.shipId,
                cb_before: m.cb_before, // Optional but good for context
                cb_after: m.cb_after
            }));

            res.json(result);
        } catch (error: any) {
            console.error(error);
            // Validation errors (Total CB < 0) should return 400
            if (error.message && error.message.includes("negative")) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to create pool' });
            }
        }
    }
}
