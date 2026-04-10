'use client';

import { useState } from 'react';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [dialectGroup, setDialectGroup] = useState('Hokkien');
  const [role, setRole] = useState('both');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = {
        email,
        password,
        ...(mode === 'register' && {
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age),
          occupation,
          dialect_group: dialectGroup,
          role,
        }),
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Store token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: '#1A1208' }}>
          {mode === 'login' ? 'Welcome Back' : 'Join tiagong.sg'}
        </h1>
        <p style={{ color: '#8B7355', marginTop: 8 }}>
          {mode === 'login'
            ? 'Sign in to connect with dialect learners'
            : 'Create your profile to start learning'}
        </p>
      </div>

      <form onSubmit={handleAuth} style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {error && (
          <div style={{ background: '#FDEDEC', color: '#C0392B', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Common Fields */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
          />
        </div>

        {/* Register-only Fields */}
        {mode === 'register' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Your job"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Dialect Group</label>
              <select
                value={dialectGroup}
                onChange={(e) => setDialectGroup(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
              >
                {['Hokkien', 'Cantonese', 'Teochew', 'Hakka', 'Hainanese'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Your Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
              >
                <option value="mentee">Mentee (Learning)</option>
                <option value="mentor">Mentor (Teaching)</option>
                <option value="both">Both</option>
                <option value="none">Just Exploring</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#C0392B',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#8B7355', fontSize: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#C0392B', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}
