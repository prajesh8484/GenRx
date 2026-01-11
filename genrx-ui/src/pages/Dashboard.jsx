import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();

  const [savings, setSavings] = React.useState([]);
  const [totalSaved, setTotalSaved] = React.useState(0);

  React.useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('genrx_recent_savings') || '[]');
    setSavings(savedData);

    // Calculate total saved this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const total = savedData.reduce((acc, curr) => {
        const date = new Date(curr.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            return acc + (curr.savedAmount || 0);
        }
        return acc;
    }, 0);
    
    setTotalSaved(total);
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <header className="mb-4 animate-fade-in">
        <h1 className="mb-1">
          <span className="text-gradient">{t('helloPatient')}</span> <span className="emoji-fix">👋</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>{t('manageHealth')}</p>
      </header>

      <section className="mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="mb-2">{t('quickActions')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <Link to="/search" className="card card-hover-search" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'inherit', background: 'white' }}>
            <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 15px -3px rgba(56, 189, 248, 0.2)' }}>
              <span style={{ fontSize: '2rem' }}>🔍</span>
            </div>
            <h3 className="mb-1" style={{ transition: 'color 0.3s ease' }}>{t('searchMedicine')}</h3>
            <p className="text-muted">{t('findGenericInstant')}</p>
          </Link>

          <Link to="/upload" className="card card-hover-upload" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'inherit', background: 'white' }}>
            <div style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 15px -3px rgba(244, 114, 182, 0.2)' }}>
              <span style={{ fontSize: '2rem' }}>📄</span>
            </div>
            <h3 className="mb-1" style={{ transition: 'color 0.3s ease' }}>{t('navCommonGenerics')}</h3>
            <p className="text-muted">{t('healthIssuesDesc')}</p>
          </Link>

        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="mb-2">{t('recentSavings')}</h2>
        <div className="card" style={{ background: 'white' }}>
          {savings.length > 0 ? (
              savings.map((saving, index) => (
                <div key={saving.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }} className="divider">
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{saving.original} <span style={{ color: 'var(--text-light)', margin: '0 0.5rem' }}>&rarr;</span> {saving.generic}</span>
                    <span className="text-success" style={{ fontWeight: 700, background: 'var(--success-bg)', padding: '0.4rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>💰</span> {t('saved')} ₹{saving.savedAmount}
                    </span>
                </div>
              ))
          ) : (
             <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                 <p>{t('noResults') || "No savings recorded yet. Search for medicines to start saving!"}</p>
             </div>
          )}
          
          <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: 'var(--bg-gradient)', borderRadius: 'var(--radius-md)' }}>
             <p className="text-muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalSavedMonth')}</p>
             <p style={{ fontSize: '3.5rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>₹{totalSaved}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
