import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Search() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    t('loading0'),
    t('loading1'),
    t('loading2'),
    t('loading3'),
    t('loading4'),
    t('loading5')
  ];

  // Rotate loading messages with random intervals (2-4 seconds)
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }

    const rotateMessage = () => {
      setLoadingMessageIndex((prev) => {
        const nextIndex = prev + 1;
        
        // Stop cycling after reaching the last message
        if (nextIndex >= loadingMessages.length) {
          return loadingMessages.length - 1; // Stay on "Almost there..."
        }
        
        // Schedule next rotation with random delay (2-4 seconds)
        const randomDelay = 2000 + Math.random() * 2000; // 2000-4000ms
        setTimeout(rotateMessage, randomDelay);
        
        return nextIndex;
      });
    };

    // Start the first rotation after a random delay
    const initialDelay = 2000 + Math.random() * 2000;
    const timeout = setTimeout(rotateMessage, initialDelay);

    return () => clearTimeout(timeout);
  }, [loading, loadingMessages]); // Added loadingMessages dependency

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

  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        setLoading(true); // Show loading while transcribing
        // Reset loading message index to start from beginning
        setLoadingMessageIndex(0);

        try {
          // Update loading messages temporarily for transcription
          // Note: In a real app we might want separate state for this, 
          // but reuse loading state for simplicity
          
          const response = await fetch('http://localhost:3000/api/voice-search', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Voice search failed');
          }

          const data = await response.json();
          if (data.text) {
            setQuery(data.text);
            // Auto search after transcription
            handleSearch({ preventDefault: () => {} }, data.text); 
          }
        } catch (error) {
          console.error('Error processing voice:', error);
          alert('Could not process voice. Please try again.');
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 5 seconds automatically (or add a stop button)
      // For now, let's make it a toggle button interaction, but here's a simple toggle logic
      // storing recorder in a ref would be better for manual stop, 
      // but let's implement a simple "hold to record" or "click to start/stop" 
      // simplified: click to start, auto stop after silence or 5s? 
      // Let's go with Manual Stop for better UX.
      
      // Store recorder in state/ref to stop it later
      setRecorder(mediaRecorder);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone.');
    }
  };

  const [recorder, setRecorder] = useState(null);

  const stopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      recorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecorder(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Modified handleSearch to accept optional query override
  const handleSearch = async (e, queryOverride = null) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const searchQuery = queryOverride || query;
    if (!searchQuery.trim()) return;

    if (!queryOverride) {
        // Only set loading if not already set (voice search handles its own loading start)
        setLoading(true);
    }
    
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error:", errorText);
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Search result:", data);
      
      setResult(data.result);
      
      // Calculate and save savings automatically
      if (data.result && data.result.medicines && data.result.medicines.length > 1) {
          calculateAndSaveSavings(data.result.medicines);
      }

    } catch (error) {
      console.error("Error searching:", error);
      alert("Failed to fetch results. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAndSaveSavings = (medicines) => {
    try {
        const original = medicines.find(m => m.type.toLowerCase().includes('original'));
        const generics = medicines.filter(m => m.type.toLowerCase().includes('generic'));

        if (!original || generics.length === 0) return;

        const parsePrice = (p) => parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
        
        const originalPrice = parsePrice(original.price);
        // Find cheapest generic
        const cheapestGeneric = generics.reduce((min, curr) => {
            return parsePrice(curr.price) < parsePrice(min.price) ? curr : min;
        }, generics[0]);

        const bestGenericPrice = parsePrice(cheapestGeneric.price);
        const savedAmount = originalPrice - bestGenericPrice;

        if (savedAmount > 0) {
            const newSaving = {
                id: Date.now(),
                original: original.name,
                generic: cheapestGeneric.name,
                savedAmount: Math.round(savedAmount),
                date: new Date().toISOString()
            };

            const existingSavings = JSON.parse(localStorage.getItem('genrx_recent_savings') || '[]');
            
            // Avoid duplicates for the same medicine search in a short time or just keep history?
            // Let's filter out if the same original medicine was saved recently to avoid spam
            const filteredSavings = existingSavings.filter(s => s.original !== newSaving.original);
            
            // Add to top
            const updatedSavings = [newSaving, ...filteredSavings].slice(0, 5); // Keep last 5
            
            localStorage.setItem('genrx_recent_savings', JSON.stringify(updatedSavings));
            console.log("Saved saving:", newSaving);
        }
    } catch (err) {
        console.error("Error calculating savings:", err);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
      <div className="text-center mb-4">
        <h1 className="mb-2" style={{ fontSize: '3rem' }}>
            <span className="text-gradient">{t('findGeneric')}</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>{t('saveMoney')}</p>
      </div>
      
      <form onSubmit={handleSearch} className="mb-4 card" style={{ display: 'flex', flexWrap: 'nowrap', maxWidth: '700px', margin: '0 auto 4rem auto', padding: '0.75rem', flexDirection: 'row', gap: '0.5rem', alignItems: 'center', borderRadius: '50px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
          <input 
            type="text" 
            className="input" 
            style={{ flex: 1, minWidth: 0, marginBottom: 0, border: 'none', boxShadow: 'none', background: 'transparent', paddingLeft: '1.5rem' }}
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          <button 
            type="button"
            onClick={toggleRecording}
            className={`btn`}
            style={{ 
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: isRecording ? '#ef4444' : '#f1f5f9',
                color: isRecording ? 'white' : '#64748b',
                transition: 'all 0.3s ease'
            }}
            title={isRecording ? t('stopRecording') : t('voiceSearch')}
          >
            {isRecording ? (
                <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px' }}></div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            )}
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.8rem 2rem', borderRadius: '50px', whiteSpace: 'nowrap', opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
             {loading ? t('searchingBtn') : t('searchBtn')}
          </button>
      </form>

      {isRecording && <p className="text-center text-danger mt-2" style={{ fontSize: '0.9rem', animation: 'pulse 1.5s infinite', marginTop: '-3rem', marginBottom: '3rem' }}>{t('listening')}</p>}
      {!isRecording && loading && query === '' && <p className="text-center text-muted mt-2" style={{ fontSize: '0.9rem', marginTop: '-3rem', marginBottom: '3rem' }}>{t('processingVoice')}</p>}

      {loading && (
        <div className="card animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #f3f4f6', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.1rem', 
            fontWeight: 500,
            margin: 0,
            minHeight: '1.5rem',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {loadingMessages[loadingMessageIndex]}
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {!loading && result && (
        <div className="card animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-gradient)' }}>
            <h3 className="mb-1" style={{ fontSize: '1.5rem' }}>{t('analysisResult')}</h3>
            {result.active_composition && (
                <p className="text-muted" style={{ margin: 0, fontSize: '1rem' }}>
                    {t('activeComposition')}: <strong style={{ color: 'var(--primary)' }}>{result.active_composition}</strong>
                </p>
            )}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1.5rem 2rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('medicine')}</th>
                  <th style={{ padding: '1.5rem 2rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('type')}</th>
                  <th style={{ padding: '1.5rem 2rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('price')}</th>
                  <th style={{ padding: '1.5rem 2rem', textAlign: 'right', fontWeight: '600', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {result.medicines && result.medicines.map((med, index) => {
                   const isGeneric = med.type?.toLowerCase().includes('generic');
                   const rowStyle = isGeneric ? { background: '#f0fdf4' } : {};
                   const typeBadgeStyle = isGeneric 
                     ? { background: 'var(--success-bg)', color: 'var(--success)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }
                     : { background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' };

                   return (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border)', ...rowStyle, transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: 'var(--text-main)' }}>{med.name}</td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <span style={typeBadgeStyle}>{med.type}</span>
                      </td>
                      <td style={{ padding: '1.5rem 2rem', fontWeight: '700', fontSize: '1.1rem' }}>{med.price}</td>
                      <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                        {med.url && med.url !== '#' ? (
                            <a 
                                href={med.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn"
                                style={{ 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    padding: '0.6rem 1.2rem', 
                                    borderRadius: '50px',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)'
                                }}
                            >
                                {t('buyNow')}
                            </a>
                        ) : (
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('na')}</span>
                        )}
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Show message if only original medicine (no cheaper generics found) */}
          {result.medicines && result.medicines.length === 1 && result.medicines[0].type?.toLowerCase() === 'original' && (
              <div style={{ padding: '2rem', background: '#fffbeb', borderTop: '1px solid #fcd34d', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#92400e', fontSize: '1rem', fontWeight: 500 }}>
                      {t('noCheaperFound')}
                  </p>
              </div>
          )}
          
          {(!result.medicines || result.medicines.length === 0) && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  {t('noResults')}
                  {result.raw_text && (
                     <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                         <summary>{t('debuggingInfo')}</summary>
                         <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem', overflow: 'auto' }}>
                             {result.raw_text}
                         </pre>
                     </details>
                  )}
              </div>
          )}
        </div>
      )}

      {/* Jan Aushadhi Kendra Locator Section */}
      {!loading && result && (
        <div className="card animate-slide-up" style={{ maxWidth: '900px', margin: '3rem auto', padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', boxShadow: '0 20px 25px -5px rgba(14, 165, 233, 0.1)' }}>
          <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.2)' }}>
             <span style={{ fontSize: '2.5rem' }}>🏥</span>
          </div>
          <h4 style={{ color: '#0369a1', marginBottom: '0.5rem', fontSize: '1.5rem' }}>{t('needItNow')}</h4>
          <p style={{ color: '#0c4a6e', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            {t('findStoreText')}
          </p>
          <button 
            onClick={handleFindNearest} 
            className="btn" 
            disabled={locating}
            style={{ 
              background: '#0ea5e9', 
              color: 'white', 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '50px',
              cursor: locating ? 'wait' : 'pointer',
              boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {locating ? t('gettingLocation') : location ? t('openMap') : t('findStoreBtn')}
          </button>
          
          {location && (
            <p style={{ marginTop: '1.5rem', fontSize: '1rem', color: '#0284c7', fontWeight: 500 }}>
              {t('locationFound')}
            </p>
          )}
        </div>
      )}

      <style>{`
          @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.05); }
              100% { opacity: 1; transform: scale(1); }
          }
      `}</style>
    </div>
  );
}

