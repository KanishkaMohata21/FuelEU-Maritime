import { Request, Response } from 'express';
import { GetRoutesUseCase } from '../../../core/application/use-cases/GetRoutesUseCase';
import { SetBaselineUseCase } from '../../../core/application/use-cases/SetBaselineUseCase';
import { GetRouteComparisonUseCase } from '../../../core/application/use-cases/GetRouteComparisonUseCase';

export class RoutesController {
    constructor(
        private readonly getRoutesUseCase: GetRoutesUseCase,
        private readonly setBaselineUseCase: SetBaselineUseCase,
        private readonly getRouteComparisonUseCase: GetRouteComparisonUseCase
    ) { }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const routes = await this.getRoutesUseCase.execute();
            res.json(routes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch routes' });
        }
    }

    async setBaseline(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string') {
                res.status(400).json({ error: 'Invalid route parameter' });
                return;
            }

            await this.setBaselineUseCase.execute(id);
            res.status(200).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to set baseline' });
        }
    }

    async getComparison(req: Request, res: Response): Promise<void> {
        try {
            const comparison = await this.getRouteComparisonUseCase.execute();
            res.json(comparison);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch comparison' });
        }
    }
}
