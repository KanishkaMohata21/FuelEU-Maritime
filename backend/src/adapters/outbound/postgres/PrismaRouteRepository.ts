import { PrismaClient } from '@prisma/client';
import { RouteRepositoryPort } from '../../../core/application/ports/outbound/RouteRepositoryPort';
import { Route } from '../../../core/domain/entities/Route';

export class PrismaRouteRepository implements RouteRepositoryPort {
    private prisma = new PrismaClient();

    async findAll(): Promise<Route[]> {
        const routes = await this.prisma.route.findMany();
        return routes.map(this.toDomain);
    }

    async findById(id: string): Promise<Route | null> {
        const route = await this.prisma.route.findUnique({ where: { route_id: id } });
        return route ? this.toDomain(route) : null;
    }

    async setBaseline(routeId: string): Promise<void> {
        // Transaction to ensure only one baseline exists
        await this.prisma.$transaction([
            this.prisma.route.updateMany({ data: { is_baseline: false } }),
            this.prisma.route.update({
                where: { route_id: routeId },
                data: { is_baseline: true },
            }),
        ]);
    }

    async findBaseline(): Promise<Route | null> {
        const route = await this.prisma.route.findFirst({ where: { is_baseline: true } });
        return route ? this.toDomain(route) : null;
    }

    private toDomain(ormRoute: any): Route {
        return new Route(
            ormRoute.id,
            ormRoute.route_id,
            ormRoute.vesselType,
            ormRoute.fuelType,
            ormRoute.year,
            ormRoute.ghg_intensity,
            ormRoute.fuelConsumption,
            ormRoute.distance,
            ormRoute.totalEmissions,
            ormRoute.is_baseline
        );
    }
}
