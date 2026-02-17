import { useEffect, useState } from 'react';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import type { Route } from '../core/domain/models/types';
import { RefreshCw, Target, Ship, Fuel, Activity } from 'lucide-react';

export const RoutesTab = () => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            console.log("Fetching routes...");
            const data = await apiClient.get<Route[]>('/routes');
            console.log(data);
            setRoutes(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    };

    const handleSetBaseline = async (id: string) => {
        try {
            await apiClient.post(`/routes/${id}/baseline`);
            await fetchRoutes();
        } catch (err: any) {
            alert(`Failed to set baseline: ${err.message}`);
        }
    };

    useEffect(() => { fetchRoutes(); }, []);

    const baselineCount = routes.filter(r => r.is_baseline).length;

    if (loading) {
        return (
            <div>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Vessel Routes</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Loading…</p>
                </div>
                <div className="card" style={{ padding: 28 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ marginBottom: 12, height: 36 }} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <Activity size={32} color="var(--accent-red)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{error}</p>
                <button className="btn btn-primary" onClick={fetchRoutes} style={{ marginTop: 16 }}>Retry</button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Vessel Routes</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                        {routes.length} routes tracked · {baselineCount} baseline{baselineCount !== 1 ? 's' : ''} set
                    </p>
                </div>
                <button className="btn btn-ghost" onClick={fetchRoutes}><RefreshCw size={14} /> Refresh</button>
            </div>

            {/* Stats */}
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label"><Ship size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Total Routes</div>
                    <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{routes.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label"><Fuel size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Avg GHG Intensity</div>
                    <div className="stat-value" style={{ color: 'var(--accent-indigo)' }}>
                        {routes.length > 0 ? (routes.reduce((s, r) => s + r.ghg_intensity, 0) / routes.length).toFixed(2) : '—'}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label"><Target size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Baseline</div>
                    <div className="stat-value" style={{ color: baselineCount > 0 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                        {baselineCount > 0 ? 'Set' : 'Not Set'}
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
                                <th>Vessel Type</th>
                                <th>Fuel Type</th>
                                <th>Year</th>
                                <th>GHG Intensity</th>
                                <th>Fuel Cons. (t)</th>
                                <th>Emissions (t)</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.map((route, idx) => (
                                <tr key={route.id} className="animate-fade-in" style={{ animationDelay: `${idx * 25}ms` }}>
                                    <td>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{route.route_id}</span>
                                        {route.is_baseline && <span className="badge badge-green" style={{ marginLeft: 8 }}><span className="dot dot-green" /> Baseline</span>}
                                    </td>
                                    <td>{route.vesselType ?? '—'}</td>
                                    <td><span className="badge badge-blue">{route.fuelType ?? '—'}</span></td>
                                    <td>{route.year}</td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: route.ghg_intensity <= 89.34 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                            {route.ghg_intensity.toFixed(4)}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>{route.fuelConsumption ?? '—'}</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>{route.totalEmissions ?? '—'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {!route.is_baseline && (
                                            <button className="btn btn-primary btn-sm" onClick={() => handleSetBaseline(route.route_id)}>
                                                <Target size={12} /> Set Baseline
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {routes.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No routes found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
