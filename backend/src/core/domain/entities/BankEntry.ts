export class BankEntry {
    constructor(
        public readonly id: string,
        public readonly ship_id: string,
        public readonly year: number,
        public readonly amount_gco2eq: number,
        public readonly createdAt: Date
    ) { }
}
