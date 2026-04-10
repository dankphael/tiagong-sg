'use client';

import { useState, useEffect } from 'react';

export default function Profile({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(currentUser);
  const [formData, setFormData] = useState({
    first_name: currentUser.first_name || '',
    last_name: currentUser.last_name || '',
    age: currentUser.age || '',
    occupation: currentUser.occupation || '',
    dialect_group: currentUser.dialect_group || 'Hokkien',
    role: currentUser.role || 'none',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetchPendingRequests();
    fetchConnections();
  }, []);

  async function fetchPendingRequests() {
    try {
      const res = await fetch(`/api/connections/pending?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }

  async function fetchConnections() {
    try {
      const res = await fetch(`/api/connections?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
        return;
      }

      // Update local state and localStorage
      setProfile(data);
      localStorage.setItem('user', JSON.stringify(data));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function respondToRequest(requestId, action) {
    try {
      const res = await fetch(`/api/connections/${requestId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchPendingRequests();
        fetchConnections();
        setMessage({ type: 'success', text: `Request ${action === 'accept' ? 'approved' : 'declined'}!` });
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      setMessage({ type: 'error', text: 'Failed to respond to request' });
    }
  }

  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#1A1208' }}>My Profile</h1>
        <button
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            background: '#C0392B',
            color: 'white',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#F0E8DA', borderRadius: 14, padding: 4, maxWidth: 600, marginBottom: 40 }}>
        {[['profile', 'Edit Profile'], ['requests', `Requests (${pendingRequests.length})`], ['connections', `Connections (${acceptedConnections.length})`]].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              background: activeTab === t ? '#1A1208' : 'transparent',
              color: activeTab === t ? '#F5E6C8' : '#8B7355',
              border: 'none',
              fontSize: 14,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Edit Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {message.text && (
            <div style={{ 
              background: message.type === 'success' ? '#EAFAF1' : '#FDEDEC', 
              color: message.type === 'success' ? '#1A6B3C' : '#C0392B', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 24,
              fontSize: 14 
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Dialect Group</label>
                <select
                  value={formData.dialect_group}
                  onChange={(e) => setFormData({ ...formData, dialect_group: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                >
                  {['Hokkien', 'Cantonese', 'Teochew', 'Hakka', 'Hainanese'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
                >
                  <option value="mentee">Mentee (Learning)</option>
                  <option value="mentor">Mentor (Teaching)</option>
                  <option value="both">Both</option>
                  <option value="none">Just Exploring</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B5B45', marginBottom: 6 }}>Email (Read-only)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit', background: '#F5F5F5', color: '#888' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#1A1208',
                color: '#F5E6C8',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <h2 style={{ fontSize: 24, color: '#1A1208', marginBottom: 24 }}>Incoming Connection Requests</h2>
          {pendingRequests.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <p style={{ color: '#8B7355', fontSize: 16 }}>No pending requests</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {pendingRequests.map((req) => (
                <div key={req.id} style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>
                    {req.requester_name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#9B8B75', marginBottom: 12 }}>{req.dialect_group} • {req.occupation}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => respondToRequest(req.id, 'accept')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 8,
                        background: '#1A6B3C',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => respondToRequest(req.id, 'reject')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 8,
                        background: '#C0392B',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                      }}
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div>
          <h2 style={{ fontSize: 24, color: '#1A1208', marginBottom: 24 }}>My Connections</h2>
          {acceptedConnections.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <p style={{ color: '#8B7355', fontSize: 16 }}>You haven't connected with anyone yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {acceptedConnections.map((conn) => (
                <div key={conn.id} style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>
                    {conn.connected_user_name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 12 }}>📧 {conn.connected_user_email}</p>
                  <p style={{ fontSize: 13, color: '#9B8B75' }}>Connected since {new Date(conn.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
