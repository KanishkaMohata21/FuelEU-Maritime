import { useEffect, useState } from 'react';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import type { Route } from '../core/domain/models/types';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface RouteComparison {
    route: Route;
    percentDiff: number;
    compliant: boolean;
}

export const CompareTab = () => {
    const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComparison = async () => {
        try {
            setLoading(true);
            const data = await apiClient.get<RouteComparison[]>('/routes/comparison');
            setComparisons(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch comparison');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComparison(); }, []);

    if (loading) {
        return (
            <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 24 }}>Route Comparison</h2>
                <div className="card" style={{ padding: 28 }}>
                    {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ marginBottom: 12, height: 36 }} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <AlertTriangle size={32} color="var(--accent-red)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{error}</p>
                <button className="btn btn-primary" onClick={fetchComparison} style={{ marginTop: 16 }}>Retry</button>
            </div>
        );
    }

    if (comparisons.length === 0) {
        return (
            <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 24 }}>Route Comparison</h2>
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <AlertTriangle size={36} color="var(--text-muted)" style={{ marginBottom: 14 }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No comparison data available</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Ensure routes exist and a baseline is set.</p>
                </div>
            </div>
        );
    }

    const compliantCount = comparisons.filter(c => c.compliant).length;
    const nonCompliantCount = comparisons.length - compliantCount;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Route Comparison</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                        GHG intensity vs baseline · Target ≤ 89.3368 gCO₂eq/MJ
                    </p>
                </div>
                <button className="btn btn-ghost" onClick={fetchComparison}><RefreshCw size={14} /> Refresh</button>
            </div>

            {/* Stats */}
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label"><CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Compliant</div>
                    <div className="stat-value" style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="dot dot-green" /> {compliantCount}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label"><XCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Non-Compliant</div>
                    <div className="stat-value" style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="dot dot-red" /> {nonCompliantCount}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Compliance Rate</div>
                    <div className="stat-value" style={{ color: compliantCount >= nonCompliantCount ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                        {comparisons.length > 0 ? ((compliantCount / comparisons.length) * 100).toFixed(0) : 0}%
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Route ID</th>
                                <th>GHG Intensity</th>
                                <th>Diff vs Baseline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisons.map((item, idx) => (
                                <tr key={item.route.id} className="animate-fade-in" style={{ animationDelay: `${idx * 25}ms` }}>
                                    <td>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.route.route_id}</span>
                                        {item.route.is_baseline && <span className="badge badge-green" style={{ marginLeft: 8 }}>Baseline</span>}
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.compliant ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                            {item.route.ghg_intensity.toFixed(4)}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.percentDiff <= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                            {item.percentDiff > 0 ? '+' : ''}{item.percentDiff.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td>
                                        {item.compliant
                                            ? <span className="badge badge-green"><CheckCircle2 size={11} /> Compliant</span>
                                            : <span className="badge badge-red"><XCircle size={11} /> Non-Compliant</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                * Negative % = lower intensity than baseline (better). Compliance target: ≤ 89.3368 gCO₂eq/MJ.
            </p>
        </div>
    );
};
