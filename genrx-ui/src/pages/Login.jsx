import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-type effect
  useEffect(() => {
    const typeCredentials = async () => {
      // Small delay before starting
      await new Promise(r => setTimeout(r, 500));
      
      const userStr = 'admin';
      const passStr = 'admin';

      // Type username
      for (let i = 0; i <= userStr.length; i++) {
        setUsername(userStr.slice(0, i));
        await new Promise(r => setTimeout(r, 100)); // Typing speed
      }

      // Move to password
      await new Promise(r => setTimeout(r, 300));

      // Type password
      for (let i = 0; i <= passStr.length; i++) {
        setPassword(passStr.slice(0, i));
        await new Promise(r => setTimeout(r, 100));
      }
    };

    typeCredentials();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials (try admin/admin)');
    }
  };

  const handleMagicFill = () => {
    setUsername('admin');
    setPassword('admin');
  };

  return (
    <div className="login-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%)'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p className="text-muted">Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Username</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Sign In
          </button>
          
          <button 
            type="button"
            onClick={handleMagicFill}
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '0.9rem', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Auto-Fill Credentials (Demo)
          </button>
        </form>
      </div>
    </div>
  );
}
