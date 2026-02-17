export class ComplianceSnapshot {
    constructor(
        public readonly id: string,
        public readonly ship_id: string,
        public readonly year: number,
        public readonly cb_gco2eq: number
    ) { }
}
