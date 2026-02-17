export class PoolMember {
    constructor(
        public readonly id: string,
        public readonly poolId: string,
        public readonly shipId: string,
        public readonly cb_before: number,
        public cb_after: number
    ) { }
}
