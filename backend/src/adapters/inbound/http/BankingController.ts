import { Request, Response } from 'express';
import { GetBankingRecordsUseCase } from '../../../core/application/use-cases/GetBankingRecordsUseCase';
import { BankSurplusUseCase } from '../../../core/application/use-cases/BankSurplusUseCase';
import { ApplyBankingUseCase } from '../../../core/application/use-cases/ApplyBankingUseCase';

export class BankingController {
    constructor(
        private readonly getBankingRecordsUseCase: GetBankingRecordsUseCase,
        private readonly bankSurplusUseCase: BankSurplusUseCase,
        private readonly applyBankingUseCase: ApplyBankingUseCase
    ) { }

    async getBankingRecords(req: Request, res: Response): Promise<void> {
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

            const records = await this.getBankingRecordsUseCase.execute(shipId, year);
            res.json(records);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get banking records' });
        }
    }

    async bankSurplus(req: Request, res: Response): Promise<void> {
        try {
            const { shipId, year, amount } = req.body;

            if (!shipId || !year || !amount) {
                res.status(400).json({ error: 'shipId, year, and amount are required' });
                return;
            }

            await this.bankSurplusUseCase.execute(shipId, parseInt(year), parseFloat(amount));
            res.status(200).send();
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error.message || 'Failed to bank surplus' });
        }
    }

    async applyBanking(req: Request, res: Response): Promise<void> {
        try {
            const { shipId, year, amount } = req.body;

            if (!shipId || !year || !amount) {
                res.status(400).json({ error: 'shipId, year, and amount are required' });
                return;
            }

            await this.applyBankingUseCase.execute(shipId, parseInt(year), parseFloat(amount));
            res.status(200).send();
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error.message || 'Failed to apply banking' });
        }
    }
}
