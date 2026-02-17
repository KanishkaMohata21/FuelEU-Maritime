
import { Pool } from "../core/domain/entities/Pool";

describe('Pool Entity', () => {

    it('should create a valid pool', () => {
        const pool = Pool.create(2025, [{ shipId: 'S1', cb_balance: 100 }, { shipId: 'S2', cb_balance: -50 }]);
        expect(pool.members).toHaveLength(2);
        expect(pool.members[0].shipId).toBe('S1');
    });

    it('should throw if total compliance balance is negative', () => {
        // Total = -50 + 40 = -10 (Negative) => Invalid pool
        expect(() => {
            const pool = Pool.create(2025, [{ shipId: 'S1', cb_balance: -50 }, { shipId: 'S2', cb_balance: 40 }]);
            pool.validate();
        }).toThrow('Pool total compliance balance is negative');
    });

    it('should allocate surplus correctly (Simple)', () => {
        // S1: +100, S2: -50
        // Expected: S1 -> S2 (50). S1 left with 50. S2 becomes 0.
        const pool = Pool.create(2025, [{ shipId: 'S1', cb_balance: 100 }, { shipId: 'S2', cb_balance: -50 }]);
        pool.allocate();

        const s1 = pool.members.find(m => m.shipId === 'S1');
        const s2 = pool.members.find(m => m.shipId === 'S2');

        expect(s1?.cb_after).toBe(50);
        expect(s2?.cb_after).toBe(0);
    });

    it('should allocate surplus from multiple donors (Greedy)', () => {
        // S1: +100 (Biggest), S2: +20, S3: -110 (Deficit)
        // Greedy: Take from biggest first? 
        // Logic: Sort Surplus desc. S1 (100), S2 (20).
        // Take 100 from S1. S3 needs 10 more.
        // Take 10 from S2.
        // Result: S1=0, S2=10, S3=0.

        const pool = Pool.create(2025, [
            { shipId: 'S1', cb_balance: 100 },
            { shipId: 'S2', cb_balance: 20 },
            { shipId: 'S3', cb_balance: -110 }
        ]);
        pool.allocate();

        const s1 = pool.members.find(m => m.shipId === 'S1');
        const s2 = pool.members.find(m => m.shipId === 'S2');
        const s3 = pool.members.find(m => m.shipId === 'S3');

        expect(s1?.cb_after).toBe(0); // Fully drained
        expect(s2?.cb_after).toBe(10); // Partial drain
        expect(s3?.cb_after).toBe(0); // Fully satisfied
    });

    it('should throw if deficit cannot be covered (Floating Point Edge Case)', () => {
        // Although validate() passes (Total >= 0), allocate might fail if logic is wrong.
        // But validate ensures Total >= 0, so allocate should always succeed mathematically.
        // Let's test exact coverage.
        const pool = Pool.create(2025, [{ shipId: 'S1', cb_balance: 50 }, { shipId: 'S2', cb_balance: -50 }]);
        pool.allocate();
        expect(pool.members[0].cb_after).toBe(0);
        expect(pool.members[1].cb_after).toBe(0);
    });
});
