import { Route } from '../../domain/entities/Route';
import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';

export class GetRoutesUseCase {
    constructor(private readonly routeRepository: RouteRepositoryPort) { }

    async execute(): Promise<Route[]> {
        return this.routeRepository.findAll();
    }
}
