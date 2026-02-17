export class Route {
    constructor(
        public readonly id: string,
        public readonly route_id: string,
        public readonly vesselType: string | null,
        public readonly fuelType: string | null,
        public readonly year: number,
        public readonly ghg_intensity: number,
        public readonly fuelConsumption: number | null,
        public readonly distance: number | null,
        public readonly totalEmissions: number | null,
        public is_baseline: boolean
    ) { }
}
