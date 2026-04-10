'use client';

import { useState, useEffect } from 'react';

export default function Network({ currentUser }) {
  const [tab, setTab] = useState('community');
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [filterDialect, setFilterDialect] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchConnections();
    fetchPendingRequests();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.filter((u) => u.id !== currentUser.id)); // Exclude current user
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConnections() {
    try {
      const res = await fetch(`/api/connections?userId=${currentUser.id}`);
      const data = await res.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }

  async function fetchPendingRequests() {
    try {
      const res = await fetch(`/api/connections/pending?userId=${currentUser.id}`);
      const data = await res.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }

  async function sendConnectionRequest(receiverId) {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: currentUser.id, receiverId }),
      });

      if (res.ok) {
        fetchConnections();
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  }

  async function respondToRequest(requestId, action) {
    try {
      const res = await fetch(`/api/connections/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }), // 'accept' or 'reject'
      });

      if (res.ok) {
        fetchConnections();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  }

  // Privacy: Show email only if connection is accepted
  function shouldShowEmail(userId) {
    return connections.some((c) => c.status === 'accepted' && (c.requester_id === userId || c.receiver_id === userId));
  }

  const filteredUsers = users.filter((u) => {
    const dialectMatch = filterDialect === 'All' || u.dialect_group === filterDialect;
    const searchMatch = searchTerm === '' || u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.dialect_group.includes(searchTerm);
    return dialectMatch && searchMatch;
  });

  // Sin Seh filtering: Show mentors to mentees and vice versa
  const sinSehUsers = filteredUsers.filter((u) => {
    if (currentUser.role === 'mentee') return u.role === 'mentor' || u.role === 'both';
    if (currentUser.role === 'mentor') return u.role === 'mentee' || u.role === 'both';
    return false;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#1A1208' }}>Network</h1>
      </div>

      <div style={{ display: 'flex', background: '#F0E8DA', borderRadius: 14, padding: 4, maxWidth: 500, margin: '0 auto 40px' }}>
        {[['community', 'Community'], ['sinseh', 'Sin Seh (Mentorship)'], ['requests', 'Requests']].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              background: tab === t ? '#1A1208' : 'transparent',
              color: tab === t ? '#F5E6C8' : '#8B7355',
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

      {/* Community Tab */}
      {tab === 'community' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search by name or dialect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
            />
            <select
              value={filterDialect}
              onChange={(e) => setFilterDialect(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #E8DDD0', fontSize: 14, fontFamily: 'inherit' }}
            >
              {['All', 'Hokkien', 'Cantonese', 'Teochew', 'Hakka', 'Hainanese'].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8B7355' }}>Loading users...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filteredUsers.map((user) => {
                const isConnected = connections.some((c) => (c.requester_id === user.id || c.receiver_id === user.id) && c.status === 'accepted');
                const hasPendingRequest = connections.some((c) => c.status === 'pending' && ((c.requester_id === currentUser.id && c.receiver_id === user.id)));

                return (
                  <div key={user.id} style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>
                        {user.first_name} {user.last_name}
                      </h3>
                      <p style={{ fontSize: 13, color: '#9B8B75' }}>Age {user.age} • {user.occupation}</p>
                    </div>

                    <p style={{ fontSize: 14, color: '#6B5B45', marginBottom: 12 }}>{user.dialect_group} Speaker</p>

                    {/* Email Privacy Rule */}
                    {shouldShowEmail(user.id) && (
                      <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 12 }}>📧 {user.email}</p>
                    )}

                    <button
                      onClick={() => sendConnectionRequest(user.id)}
                      disabled={isConnected || hasPendingRequest}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 10,
                        background: isConnected ? '#EAFAF1' : hasPendingRequest ? '#F0E8DA' : '#1A1208',
                        color: isConnected ? '#1A6B3C' : hasPendingRequest ? '#8B7355' : '#F5E6C8',
                        border: 'none',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        cursor: isConnected || hasPendingRequest ? 'default' : 'pointer',
                      }}
                    >
                      {isConnected ? 'Connected ✓' : hasPendingRequest ? 'Request Sent' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sin Seh Tab */}
      {tab === 'sinseh' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {sinSehUsers.map((user) => (
              <div key={user.id} style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1208', marginBottom: 12 }}>
                  {user.first_name} {user.last_name}
                </h3>
                <p style={{ fontSize: 14, color: '#C0392B', fontWeight: 600, marginBottom: 12 }}>
                  {currentUser.role === 'mentee' ? '🎓 Mentor' : '👤 Mentee'}
                </p>
                <button
                  onClick={() => sendConnectionRequest(user.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    background: '#C0392B',
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Connect with {user.first_name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div>
          <h2 style={{ fontSize: 24, color: '#1A1208', marginBottom: 24 }}>Pending Connection Requests</h2>
          {pendingRequests.length === 0 ? (
            <p style={{ color: '#8B7355', textAlign: 'center' }}>No pending requests</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {pendingRequests.map((req) => (
                <div key={req.id} style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1208', marginBottom: 12 }}>
                    {req.requester_name} wants to connect
                  </h3>
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
                      }}
                    >
                      Accept
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
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
