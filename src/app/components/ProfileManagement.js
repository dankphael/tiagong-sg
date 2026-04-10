'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';

const dialectColors = {
  Hokkien: "#C0392B",
  Cantonese: "#8E44AD",
  Teochew: "#1A6B3C",
  Hakka: "#D4860B",
  Hainanese: "#1A7EA6"
};

export default function ProfileManagement({ onClose }) {
  const { user, updateUserProfile, handleLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    occupation: user?.occupation || '',
    role: user?.role || '',
    dialectGroup: user?.dialectGroup || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = updateUserProfile(formData);
    if (result.success) {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    if (onClose) onClose();
  };

  return (
    <div style={{
      maxWidth: 700,
      margin: '0 auto',
      padding: 20
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1208, #2C1810)',
        borderRadius: 20,
        padding: '32px',
        marginBottom: 24,
        color: '#F5E6C8',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{user?.avatar || '👤'}</div>
        <h2 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: 32, 
          marginBottom: 8 
        }}>
          {user?.firstName} {user?.lastName}
        </h2>
        <p style={{ color: '#A08060', fontSize: 14 }}>
          {user?.email}
        </p>
        {user?.role && (
          <div style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '6px 16px',
            background: user.role === 'mentor' ? '#D4860B20' : user.role === 'mentee' ? '#1A6B3C20' : '#C0392B20',
            color: user.role === 'mentor' ? '#D4860B' : user.role === 'mentee' ? '#1A6B3C' : '#C0392B',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            {user.role === 'mentor' ? '🎓 Mentor' : user.role === 'mentee' ? '📚 Mentee' : '🔄 Both'}
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: '#EAFAF1',
          color: '#1A6B3C',
          padding: '12px 20px',
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'center'
        }}>
          ✓ {successMessage}
        </div>
      )}

      {/* Profile Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
          <div style={{ fontSize: 12, color: '#8B7355', marginBottom: 4 }}>Location</div>
          <div style={{ fontWeight: 600, color: '#1A1208' }}>{user?.location || 'Not set'}</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏷️</div>
          <div style={{ fontSize: 12, color: '#8B7355', marginBottom: 4 }}>Dialect</div>
          <div style={{ fontWeight: 600, color: '#1A1208' }}>{user?.dialectGroup || 'Not set'}</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💼</div>
          <div style={{ fontSize: 12, color: '#8B7355', marginBottom: 4 }}>Occupation</div>
          <div style={{ fontWeight: 600, color: '#1A1208' }}>{user?.occupation || 'Not set'}</div>
        </div>
      </div>

      {/* Edit Form */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 32,
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24 
        }}>
          <h3 style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontSize: 24, 
            color: '#1A1208' 
          }}>
            Profile Information
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '10px 20px',
                background: '#1A1208',
                color: '#F5E6C8',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px solid #E8DDD0',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: '#FAF6F0'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px solid #E8DDD0',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: '#FAF6F0'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData(f => ({ ...f, age: e.target.value }))}
                  min="13"
                  max="120"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px solid #E8DDD0',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: '#FAF6F0'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={e => setFormData(f => ({ ...f, occupation: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px solid #E8DDD0',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: '#FAF6F0'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                Location (Town/Estate)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Bedok, Chinatown, Jurong"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid #E8DDD0',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#FAF6F0'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                I want to be a...
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid #E8DDD0',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  background: '#FAF6F0',
                  outline: 'none'
                }}
              >
                <option value="">Select your role</option>
                <option value="mentee">Mentee - I want to learn</option>
                <option value="mentor">Mentor - I want to teach</option>
                <option value="both">Both - I want to learn and teach</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                Dialect Group
              </label>
              <select
                value={formData.dialectGroup}
                onChange={e => setFormData(f => ({ ...f, dialectGroup: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid #E8DDD0',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  background: '#FAF6F0',
                  outline: 'none'
                }}
              >
                <option value="">Select dialect group</option>
                <option value="Hokkien">Hokkien</option>
                <option value="Cantonese">Cantonese</option>
                <option value="Teochew">Teochew</option>
                <option value="Hakka">Hakka</option>
                <option value="Hainanese">Hainanese</option>
                <option value="Mixed/Other">Mixed/Other</option>
                <option value="None">None - Just interested in learning</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                Bio (Tell us about yourself)
              </label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                placeholder="Share your dialect journey, interests, or what you hope to achieve..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid #E8DDD0',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  background: '#FAF6F0',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#C0392B',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    age: user?.age || '',
                    occupation: user?.occupation || '',
                    role: user?.role || '',
                    dialectGroup: user?.dialectGroup || '',
                    bio: user?.bio || '',
                    location: user?.location || ''
                  });
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#E8DDD0',
                  color: '#6B5B45',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {user?.bio ? (
              <div>
                <div style={{ fontSize: 13, color: '#8B7355', fontWeight: 600, marginBottom: 8 }}>About Me</div>
                <p style={{ color: '#6B5B45', lineHeight: 1.7, fontSize: 15 }}>{user.bio}</p>
              </div>
            ) : (
              <div style={{ color: '#9B8B75', fontStyle: 'italic', fontSize: 14 }}>
                No bio yet. Click "Edit Profile" to add one!
              </div>
            )}
            
            <div style={{ paddingTop: 20, borderTop: '2px solid #F0E8DA' }}>
              <button
                onClick={handleLogoutClick}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#FFF5F5',
                  color: '#C0392B',
                  border: '2px solid #C0392B',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
