import { useEffect, useState } from 'react';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import type { BankEntry, ComplianceSnapshot } from '../core/domain/models/types';
import { Search, ArrowUpCircle, ArrowDownCircle, History, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const BankingTab = () => {
    const [shipId, setShipId] = useState('');
    const [year, setYear] = useState('2025');
    const [snapshot, setSnapshot] = useState<ComplianceSnapshot | null>(null);
    const [adjustedCB, setAdjustedCB] = useState<number | null>(null);
    const [records, setRecords] = useState<BankEntry[]>([]);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [fetched, setFetched] = useState(false);

    const fetchData = async () => {
        if (!shipId || !year) return;
        try {
            const snap = await apiClient.get<ComplianceSnapshot>(`/compliance/cb?shipId=${shipId}&year=${year}`);
            setSnapshot(snap);
            const adj = await apiClient.get<{ adjusted_cb_gco2eq: number }>(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
            setAdjustedCB(adj.adjusted_cb_gco2eq);
            const recs = await apiClient.get<BankEntry[]>(`/banking/records?shipId=${shipId}&year=${year}`);
            setRecords(recs);
            setMessage('');
            setFetched(true);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
            setSnapshot(null);
            setAdjustedCB(null);
            setRecords([]);
            setFetched(true);
        }
    };

    const handleBank = async () => {
        try {
            await apiClient.post('/banking/bank', { shipId, year: parseInt(year), amount: parseFloat(amount) });
            setMessage('Success: Surplus banked!');
            setAmount('');
            fetchData();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    const handleApply = async () => {
        try {
            await apiClient.post('/banking/apply', { shipId, year: parseInt(year), amount: parseFloat(amount) });
            setMessage('Success: Banking applied!');
            setAmount('');
            fetchData();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    useEffect(() => { if (shipId && year) fetchData(); }, []);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Banking & Compliance</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    Manage compliance balance, bank surplus, and apply credits.
                </p>
            </div>

            {/* Search Controls */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <div className="controls-row" style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Ship ID</label>
                        <input type="text" value={shipId} onChange={e => setShipId(e.target.value)} className="input" placeholder="e.g. R004" />
                    </div>
                    <div style={{ flex: '0 0 120px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Year</label>
                        <input type="number" value={year} onChange={e => setYear(e.target.value)} className="input" />
                    </div>
                    <button className="btn btn-primary" onClick={fetchData}><Search size={14} /> Fetch Data</button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className="animate-slide-down" style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20,
                    fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
                    background: message.includes('Error') ? '#fef2f2' : '#ecfdf5',
                    color: message.includes('Error') ? 'var(--accent-red)' : 'var(--accent-green)',
                    border: `1px solid ${message.includes('Error') ? '#fecaca' : '#a7f3d0'}`,
                }}>
                    {message.includes('Error') ? <Activity size={15} /> : <ArrowUpCircle size={15} />}
                    {message.replace('Error: ', '').replace('Success: ', '')}
                </div>
            )}

            {fetched && (
                <div className="animate-fade-in">
                    {/* Stats */}
                    <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-label"><TrendingUp size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Raw CB</div>
                            <div className="stat-value" style={{ color: snapshot && snapshot.cb_gco2eq >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {snapshot ? snapshot.cb_gco2eq.toFixed(2) : '—'}
                            </div>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>gCO₂eq</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label"><TrendingDown size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Adjusted CB</div>
                            <div className="stat-value" style={{ color: adjustedCB !== null && adjustedCB >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {adjustedCB !== null ? adjustedCB.toFixed(2) : '—'}
                            </div>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>gCO₂eq</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label"><History size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Transactions</div>
                            <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{records.length}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 14 }}>Quick Actions</h3>
                        <div className="controls-row" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input" style={{ width: 180, flex: 'unset' }} placeholder="Amount (gCO₂eq)" />
                            <button className="btn btn-success" onClick={handleBank}><ArrowUpCircle size={14} /> Bank Surplus</button>
                            <button className="btn btn-danger" onClick={handleApply}><ArrowDownCircle size={14} /> Apply Banked</button>
                        </div>
                    </div>

                    {/* History */}
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <History size={15} color="var(--text-muted)" />
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Banking History</h3>
                        </div>
                        {records.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r, idx) => (
                                        <tr key={r.id} className="animate-fade-in" style={{ animationDelay: `${idx * 35}ms` }}>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                                {new Date(r.createdAt).toLocaleString()}
                                            </td>
                                            <td>
                                                {r.amount_gco2eq > 0
                                                    ? <span className="badge badge-green"><ArrowUpCircle size={10} /> Banked</span>
                                                    : <span className="badge badge-red"><ArrowDownCircle size={10} /> Applied</span>
                                                }
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: r.amount_gco2eq > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {r.amount_gco2eq > 0 ? '+' : ''}{r.amount_gco2eq.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No banking records found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!fetched && (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <Search size={36} color="var(--text-muted)" style={{ marginBottom: 14 }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Enter a Ship ID and Year to get started</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>View compliance balance, bank surplus, or apply credits.</p>
                </div>
            )}
        </div>
    );
};
