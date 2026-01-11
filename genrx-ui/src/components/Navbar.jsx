import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { t } = useLanguage();
  const { isElderlyMode, toggleElderlyMode } = useAccessibility();
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0.75rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/genrx_logo.png" alt="GenRx Logo" style={{ height: '32px', width: 'auto' }} /> GenRx
        </Link>
        
        {/* Helper to keep toggle/lang accessible on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
           {/* Mobile Hamburger Button */}
           <button 
            className="nav-mobile-btn"
            onClick={() => setIsOpen(!isOpen)}
            style={{ fontSize: '1.5rem', padding: '0.5rem', color: 'var(--text-main)' }}
          >
            {isOpen ? '✕' : '☰'}
          </button>

          {/* Desktop Menu */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link 
              to="/search" 
              style={{ 
                color: location.pathname === '/search' ? 'var(--primary)' : 'var(--text-muted)', 
                background: location.pathname === '/search' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                textDecoration: 'none', 
                fontWeight: location.pathname === '/search' ? '700' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {t('navSearch')}
            </Link>
            <Link 
              to="/stores" 
              style={{ 
                color: location.pathname === '/stores' ? 'var(--primary)' : 'var(--text-muted)', 
                background: location.pathname === '/stores' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                textDecoration: 'none', 
                fontWeight: location.pathname === '/stores' ? '700' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {t('navFindStores')}
            </Link>
            <Link 
              to="/upload" 
              style={{ 
                color: location.pathname === '/upload' ? 'var(--primary)' : 'var(--text-muted)', 
                background: location.pathname === '/upload' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                textDecoration: 'none', 
                fontWeight: location.pathname === '/upload' ? '700' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {t('navCommonGenerics')}
            </Link>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 0.5rem' }}></div>
          
          <button 
            onClick={toggleElderlyMode}
            title="Elderly Friendly Mode (Increase Text Size)"
            style={{
              background: isElderlyMode ? 'var(--primary)' : 'transparent',
              color: isElderlyMode ? 'white' : 'var(--text-muted)',
              border: isElderlyMode ? 'none' : '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
              marginRight: '0.5rem'
            }}
          >
            👓
          </button>

          <LanguageSwitcher />

          {/* User Profile */}
          {user && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 0.5rem' }}></div>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(13, 148, 136, 0.1)',
                  borderRadius: '2rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                  A
                </div>
                <span className="nav-desktop">Admin</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div 
          className="nav-mobile-menu glass"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            padding: '1rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          <Link 
              to="/search" 
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'flex-start', border: location.pathname === '/search' ? '1px solid var(--primary)' : '1px solid #e2e8f0', color: location.pathname === '/search' ? 'var(--primary)' : 'inherit' }}
            >
              {t('navSearch')}
            </Link>
            <Link 
              to="/stores" 
               className="btn btn-outline"
               style={{ width: '100%', justifyContent: 'flex-start', border: location.pathname === '/stores' ? '1px solid var(--primary)' : '1px solid #e2e8f0', color: location.pathname === '/stores' ? 'var(--primary)' : 'inherit' }}
            >
              {t('navFindStores')}
            </Link>
            <Link 
              to="/upload" 
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'flex-start', border: location.pathname === '/upload' ? '1px solid var(--primary)' : '1px solid #e2e8f0', color: location.pathname === '/upload' ? 'var(--primary)' : 'inherit' }}
            >
              {t('navCommonGenerics')}
            </Link>
        </div>
      )}
    </nav>
  );
}
