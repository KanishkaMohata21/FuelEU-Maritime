import { PoolMember } from "./PoolMember";
import { randomUUID } from "crypto";

export class Pool {
    constructor(
        public readonly id: string,
        public readonly year: number,
        public readonly members: PoolMember[]
    ) { }

    public static create(year: number, ships: { shipId: string, cb_balance: number }[]): Pool {
        const poolId = randomUUID();
        const members = ships.map(s => new PoolMember(
            randomUUID(),
            poolId,
            s.shipId,
            s.cb_balance,
            s.cb_balance // Initially after = before
        ));

        return new Pool(poolId, year, members);
    }

    public validate(): void {
        const totalCB = this.members.reduce((sum, m) => sum + m.cb_before, 0);
        if (totalCB < 0) {
            throw new Error(`Pool total compliance balance is negative: ${totalCB}`);
        }
    }

    public allocate(): void {
        const surplusShips = this.members.filter(m => m.cb_before > 0).sort((a, b) => b.cb_before - a.cb_before);
        const deficitShips = this.members.filter(m => m.cb_before < 0).sort((a, b) => a.cb_before - b.cb_before); // Most negative first? Or least? Prompt says "Sort members desc by CB". 
        // "Sort members desc by CB" usually implies strictly ordering everyone.
        // Greedy allocation: "Transfer surplus to deficits".
        // Usually, we take biggest surplus and fill biggest deficit? Or fill smallest deficit?
        // Standard "Greedy" often means filling the largest needs first or using largest sources first.
        // Let's assume: Use largest surplus to fill deficits one by one.

        // Sort deficits by magnitude (most negative first) to ensure we help worst performers?
        // Or straightforward:
        // 1. Identify Total Surplus.
        // 2. Identify Total Deficit.
        // 3. If Total Surplus < Total Deficit -> Fail (but validate() checks this).
        // 4. Distribute.

        // Algorithm:
        // Iterate through deficit ships.
        // For each deficit ship, take needed amount from surplus ships (starting from biggest surplus).

        // Let's create a working copy of surpluses to track remaining available.
        // Actually, we can just modify cb_after.

        // Reset cb_after for everyone to start clean? No, initialized to cb_before.

        // Mutable tracking of available surplus
        const availableSurplus = surplusShips.map(s => ({ member: s, available: s.cb_before }));

        for (const deficitShip of deficitShips) {
            let needed = -deficitShip.cb_before; // Amount needed to reach 0

            // Try to fill this need from available surpluses
            for (const source of availableSurplus) {
                if (needed <= 0) break;
                if (source.available <= 0) continue;

                const take = Math.min(needed, source.available);

                // Transfer 'take' from source to deficitShip
                source.available -= take;
                needed -= take;

                // Update cb_after
                // Source gave 'take', so their cb_after reduces.
                // Deficit received 'take', so their cb_after increases.

                // Wait, I need to update the actual member objects in the array.
                // source.member is a reference.

                // Update logic:
                // We don't update source.member.cb_after immediately if we iterate multiple times?
                // Yes we can.
                // source.member.cb_after starts at cb_before.
                source.member.cb_after -= take;
                deficitShip.cb_after += take;
            }

            if (needed > 0.001) { // Floating point tolerance
                throw new Error(`Could not fully cover deficit for ship ${deficitShip.shipId}`);
            }
        }

        // Final sanity check constraints
        // Deficit ship cannot exit worse -> handled (we only added).
        // Surplus ship cannot exit negative -> handled (we limited take to available).
        // Total CB after == Total CB before -> Let's verify.
    }
}
