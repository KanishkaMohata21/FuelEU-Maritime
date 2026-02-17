import { Route } from '../../domain/entities/Route';
import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';

export interface RouteComparison {
    route: Route;
    percentDiff: number;
    compliant: boolean;
}

export class GetRouteComparisonUseCase {
    private readonly TARGET_INTENSITY = 89.3368; // 2% below 91.16

    constructor(private readonly routeRepository: RouteRepositoryPort) { }

    async execute(): Promise<RouteComparison[]> {
        const baseline = await this.routeRepository.findBaseline();
        const allRoutes = await this.routeRepository.findAll();

        // If no baseline is set, we can't compare properly, or we treat the target as the *only* reference?
        // Assignment says: "Fetch baseline + comparison data... percentDiff = ((comparison / baseline) - 1) * 100"
        // It implies comparing other routes TO the baseline route's intensity?
        // OR comparing routes to the TARGET. 
        // "Use target = 89.3368"
        // "Formula: percentDiff = ((comparison / baseline) - 1) * 100" -> This formula implies valid baseline route.

        // Let's assume we compare each route's intensity against the baseline's intensity.
        // BUT the prompt also says "Use target = 89.3368". 
        // Let's implement comparing against the Baseline Route if it exists.

        if (!baseline) {
            // Fallback or empty if no baseline? 
            // For now, let's just return empty or error.
            return [];
        }

        return allRoutes.map(route => {
            const comparison = route.ghg_intensity;
            const baselineValue = baseline.ghg_intensity;

            const percentDiff = ((comparison / baselineValue) - 1) * 100;
            // Compliant if intensity <= TARGET (89.3368) 
            // OR compliant if <= Baseline? 
            // Regulation usually assumes compliance against the TARGET.
            const compliant = route.ghg_intensity <= this.TARGET_INTENSITY;

            return {
                route,
                percentDiff,
                compliant
            };
        });
    }
}
