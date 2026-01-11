import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function JanAushadhi() {
  const { t } = useLanguage();
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleFindNearest = () => {
    if (location) {
      window.open(`https://www.google.com/maps/search/Jan+Aushadhi+Kendra/@${location.lat},${location.lng},15z`, '_blank');
      return;
    }

    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
          // Auto open map on success? Maybe just show button. 
          // User interaction flow: Click Find -> Allow Perms -> Button text changes -> Click Open Map
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check your browser settings.");
          setLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocating(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="text-center mb-4">
        <h1 className="mb-2" style={{ fontSize: '3rem' }}>
            <span className="text-gradient">Pradhan Mantri Bhartiya<br/>Janaushadhi Pariyojana</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            {t('findStoreText')}
        </p>
      </div>

      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '900px', margin: '2rem auto', padding: '4rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', boxShadow: '0 20px 25px -5px rgba(14, 165, 233, 0.1)' }}>
          <div style={{ background: 'white', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.2)' }}>
             <span style={{ fontSize: '3rem' }}>🏥</span>
          </div>
          
          <h4 style={{ color: '#0369a1', marginBottom: '1rem', fontSize: '1.75rem' }}>{t('needItNow')}</h4>
          <p style={{ color: '#0c4a6e', marginBottom: '3rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
             Locate the nearest government-subsidized pharmacy to get high-quality generic medicines at affordable prices.
          </p>

          <button 
            onClick={handleFindNearest} 
            className="btn" 
            disabled={locating}
            style={{ 
              background: '#0ea5e9', 
              color: 'white', 
              padding: '1.2rem 3rem', 
              fontSize: '1.2rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '50px',
              cursor: locating ? 'wait' : 'pointer',
              boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)',
              transition: 'all 0.2s ease',
              minWidth: '300px'
            }}
          >
            {locating ? t('gettingLocation') : location ? t('openMap') : t('findStoreBtn')}
          </button>
          
          {location && (
            <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
                 <p style={{ fontSize: '1.1rem', color: '#0284c7', fontWeight: 600, marginBottom: '0.5rem' }}>
                   {t('locationFound')}
                 </p>
                 <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Click the button above to view on Google Maps
                 </p>
            </div>
          )}
      </div>

    </div>
  );
}
