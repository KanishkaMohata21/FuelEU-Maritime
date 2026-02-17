import { useState } from 'react';
import './App.css';
import { RoutesTab } from './components/RoutesTab';
import { CompareTab } from './components/CompareTab';
import { BankingTab } from './components/BankingTab';
import { PoolingTab } from './components/PoolingTab';
import { Anchor, BarChart3, Landmark, Link2 } from 'lucide-react';

const tabs = [
  { id: 'routes', label: 'Routes', icon: Anchor },
  { id: 'compare', label: 'Compare', icon: BarChart3 },
  { id: 'banking', label: 'Banking', icon: Landmark },
  { id: 'pooling', label: 'Pooling', icon: Link2 },
] as const;

type TabId = typeof tabs[number]['id'];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('routes');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Anchor size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1.2 }}>FuelEU Maritime</h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, lineHeight: 1 }}>Compliance Dashboard</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="tab-bar" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 4, background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
          {activeTab === 'pooling' && <PoolingTab />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-default)',
        padding: '14px 24px',
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        background: '#fff',
      }}>
        FuelEU Maritime Compliance System &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
