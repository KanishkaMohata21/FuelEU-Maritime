export const FuelConstants = {
    LCV: {
        'HFO': 40.2,
        'LFO': 41.0,
        'MDO': 42.7,
        'MGO': 42.7,
        'LNG': 48.0,
        'Methanol': 19.9,
        'LPG': 46.0,
        'H2': 120.0,
        'NH3': 18.6
    } as Record<string, number>,

    TARGET_GHG_INTENSITY_2025: 89.3368,

    getLCV(fuelType: string): number {
        return this.LCV[fuelType] || 0; // Default to 0 if unknown
    }
};
