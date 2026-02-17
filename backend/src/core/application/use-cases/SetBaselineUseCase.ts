import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';

export class SetBaselineUseCase {
    constructor(private readonly routeRepository: RouteRepositoryPort) { }

    async execute(routeId: string): Promise<void> {
        await this.routeRepository.setBaseline(routeId);
    }
}
