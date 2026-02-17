import { Request, Response } from 'express';
import { GetComplianceSnapshotUseCase } from '../../../core/application/use-cases/GetComplianceSnapshotUseCase';
import { GetAdjustedComplianceUseCase } from '../../../core/application/use-cases/GetAdjustedComplianceUseCase';

export class ComplianceController {
    constructor(
        private readonly getComplianceSnapshotUseCase: GetComplianceSnapshotUseCase,
        private readonly getAdjustedComplianceUseCase: GetAdjustedComplianceUseCase
    ) { }

    async getComplianceBalance(req: Request, res: Response): Promise<void> {
        try {
            const shipId = req.query.shipId as string;
            const yearStr = req.query.year as string;

            if (!shipId || !yearStr) {
                res.status(400).json({ error: 'shipId and year are required' });
                return;
            }

            const year = parseInt(yearStr);
            if (isNaN(year)) {
                res.status(400).json({ error: 'year must be a number' });
                return;
            }

            const snapshot = await this.getComplianceSnapshotUseCase.execute(shipId, year);
            res.json(snapshot);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch compliance balance' });
        }
    }

    async getAdjustedCompliance(req: Request, res: Response): Promise<void> {
        try {
            const shipId = req.query.shipId as string;
            const yearStr = req.query.year as string;

            if (!shipId || !yearStr) {
                res.status(400).json({ error: 'shipId and year are required' });
                return;
            }

            const year = parseInt(yearStr);
            if (isNaN(year)) {
                res.status(400).json({ error: 'year must be a number' });
                return;
            }

            const adjustedCB = await this.getAdjustedComplianceUseCase.execute(shipId, year);
            res.json({ adjusted_cb_gco2eq: adjustedCB });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch adjusted compliance' });
        }
    }
}
