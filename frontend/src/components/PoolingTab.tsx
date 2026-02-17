import { useState } from 'react';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import type { PoolMember } from '../core/domain/models/types';
import { Link2, Info, ArrowUpCircle, ArrowDownCircle, Minus, Users, Loader2 } from 'lucide-react';

export const PoolingTab = () => {
    const [year, setYear] = useState('2025');
    const [shipIds, setShipIds] = useState('');
    const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreatePool = async () => {
        try {
            setIsLoading(true);
            const idsArray = shipIds.split(',').map(s => s.trim()).filter(s => s.length > 0);
            if (idsArray.length === 0) {
                setMessage('Error: Please enter at least one Ship ID.');
                setIsLoading(false);
                return;
            }
            const members = await apiClient.post<PoolMember[]>('/pools', { year: parseInt(year), shipIds: idsArray });
            setPoolMembers(members);
            setMessage('Success: Pool created and allocated!');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
            setPoolMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const donorsCount = poolMembers.filter(m => m.cb_after < m.cb_before).length;
    const receiversCount = poolMembers.filter(m => m.cb_after > m.cb_before).length;
    const totalAfter = poolMembers.reduce((s, m) => s + m.cb_after, 0);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Pooling</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    Create compliance pools and allocate surplus between ships.
                </p>
            </div>

            {/* Info Banner */}
            <div style={{
                padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 'var(--radius-sm)', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
                <Info size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
                    Enter ship IDs separated by commas. The system fetches adjusted compliance balances and uses <strong>greedy allocation</strong> to transfer surplus to cover deficits.
                </p>
            </div>

            {/* Controls */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <div className="controls-row" style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 120px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Year</label>
                        <input type="number" value={year} onChange={e => setYear(e.target.value)} className="input" />
                    </div>
                    <div style={{ flex: '1 1 280px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Ship IDs (comma separated)</label>
                        <input type="text" value={shipIds} onChange={e => setShipIds(e.target.value)} className="input" placeholder="R001, R002" />
                    </div>
                    <button className="btn btn-primary" onClick={handleCreatePool} disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Allocating…</> : <><Link2 size={14} /> Create Pool</>}
                    </button>
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
                    {message.includes('Error') ? <Info size={15} /> : <Link2 size={15} />}
                    {message.replace('Error: ', '').replace('Success: ', '')}
                </div>
            )}

            {/* Results */}
            {poolMembers.length > 0 && (
                <div className="animate-fade-in">
                    <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-label"><Users size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Members</div>
                            <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{poolMembers.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label"><ArrowUpCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Donors</div>
                            <div className="stat-value" style={{ color: 'var(--accent-indigo)' }}>{donorsCount}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label"><ArrowDownCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Receivers</div>
                            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{receiversCount}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Pool Total</div>
                            <div className="stat-value" style={{ color: totalAfter >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {totalAfter.toFixed(0)}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link2 size={15} color="var(--text-muted)" />
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Allocation Results</h3>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ship ID</th>
                                    <th>Before</th>
                                    <th>After</th>
                                    <th>Transfer</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {poolMembers.map((m, idx) => {
                                    const transfer = m.cb_after - m.cb_before;
                                    return (
                                        <tr key={m.shipId} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.shipId}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: m.cb_before >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {m.cb_before.toFixed(2)}
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: m.cb_after >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {m.cb_after.toFixed(2)}
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: transfer > 0 ? 'var(--accent-green)' : transfer < 0 ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>
                                                {transfer > 0 ? '+' : ''}{transfer.toFixed(2)}
                                            </td>
                                            <td>
                                                {transfer > 0
                                                    ? <span className="badge badge-green"><ArrowDownCircle size={10} /> Receiver</span>
                                                    : transfer < 0
                                                        ? <span className="badge badge-blue"><ArrowUpCircle size={10} /> Donor</span>
                                                        : <span className="badge badge-amber"><Minus size={10} /> Unchanged</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {poolMembers.length === 0 && !message && (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <Link2 size={36} color="var(--text-muted)" style={{ marginBottom: 14 }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No pool created yet</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Enter ship IDs above and click "Create Pool" to run greedy allocation.</p>
                </div>
            )}
        </div>
    );
};
