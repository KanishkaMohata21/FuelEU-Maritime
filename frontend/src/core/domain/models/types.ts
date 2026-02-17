export interface Route {
    id: string;
    route_id: string;
    vesselType: string | null;
    fuelType: string | null;
    year: number;
    ghg_intensity: number;
    fuelConsumption: number | null; // in tonnes
    distance: number | null; // in km
    totalEmissions: number | null; // in tonnes
    is_baseline: boolean;
}

export interface ComplianceSnapshot {
    id: string;
    ship_id: string;
    year: number;
    cb_gco2eq: number;
}

export interface BankEntry {
    id: string;
    ship_id: string;
    year: number;
    amount_gco2eq: number;
    createdAt: string; // ISO Date string from JSON
}

export interface PoolMember {
    id: string;
    poolId: string;
    shipId: string;
    cb_before: number;
    cb_after: number;
}

export interface Pool {
    id: string;
    year: number;
    members: PoolMember[];
}
