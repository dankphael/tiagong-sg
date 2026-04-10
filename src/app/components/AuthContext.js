'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Dialect color mapping
const dialectColors = {
  Hokkien: "#C0392B",
  Cantonese: "#8E44AD",
  Teochew: "#1A6B3C",
  Hakka: "#D4860B",
  Hainanese: "#1A7EA6"
};

// Create context
const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [users, setUsers] = useState([]);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    occupation: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '', // mentor | mentee | both
    dialectGroup: ''
  });

  // Load users and current session from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('tiagong_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    
    const currentUser = localStorage.getItem('tiagong_current_user');
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('tiagong_users', JSON.stringify(users));
    }
  }, [users]);

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(
      u => u.email === loginForm.email && u.password === loginForm.password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('tiagong_current_user', JSON.stringify(userWithoutPassword));
      setShowAuthModal(false);
      setLoginForm({ email: '', password: '' });
      return { success: true };
    } else {
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }
    
    if (registerForm.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    const existingUser = users.find(u => u.email === registerForm.email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      age: registerForm.age,
      occupation: registerForm.occupation,
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role || 'both',
      dialectGroup: registerForm.dialectGroup || '',
      createdAt: new Date().toISOString(),
      avatar: getAvatarFromName(registerForm.firstName)
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('tiagong_current_user', JSON.stringify(userWithoutPassword));
    setShowAuthModal(false);
    setRegisterForm({
      firstName: '',
      lastName: '',
      age: '',
      occupation: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      dialectGroup: ''
    });
    
    return { success: true };
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tiagong_current_user');
  };

  const updateUserProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('tiagong_current_user', JSON.stringify(updatedUser));
    
    // Also update in users array
    const updatedUsers = users.map(u => 
      u.email === user.email ? { ...u, ...updatedData } : u
    );
    setUsers(updatedUsers);
    
    return { success: true };
  };

  const getAvatarFromName = (name) => {
    const avatars = ['👤', '🧑', '👨', '👩', '👴', '👵', '🧔', '👱', '👲', '👳'];
    const index = name.length % avatars.length;
    return avatars[index];
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setLoginForm({ email: '', password: '' });
    setRegisterForm({
      firstName: '',
      lastName: '',
      age: '',
      occupation: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      dialectGroup: ''
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      showAuthModal,
      authMode,
      loginForm,
      registerForm,
      setLoginForm,
      setRegisterForm,
      handleLogin,
      handleRegister,
      handleLogout,
      updateUserProfile,
      openAuthModal,
      closeAuthModal,
      setShowAuthModal,
      setAuthMode,
      dialectColors
    }}>
      {children}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }} onClick={closeAuthModal}>
          <div style={{
            background: '#FAF6F0',
            borderRadius: 20,
            padding: 40,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeAuthModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#8B7355'
              }}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏮</div>
              <h2 style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: 32, 
                color: '#1A1208',
                marginBottom: 8
              }}>
                {authMode === 'login' ? 'Welcome Back' : 'Join Our Community'}
              </h2>
              <p style={{ color: '#8B7355', fontSize: 14 }}>
                {authMode === 'login' 
                  ? 'Sign in to access your profile and connect with others' 
                  : 'Create an account to become part of our dialect community'}
              </p>
            </div>
            
            {authMode === 'login' ? (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid #E8DDD0',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#FFF'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid #E8DDD0',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#FFF'
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#C0392B',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                >
                  Sign In
                </button>
                
                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#8B7355' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C0392B',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Register here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={registerForm.firstName}
                      onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="First Name"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '2px solid #E8DDD0',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FFF'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="Last Name"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '2px solid #E8DDD0',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FFF'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={registerForm.age}
                      onChange={e => setRegisterForm(f => ({ ...f, age: e.target.value }))}
                      placeholder="Age"
                      min="13"
                      max="120"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '2px solid #E8DDD0',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FFF'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={registerForm.occupation}
                      onChange={e => setRegisterForm(f => ({ ...f, occupation: e.target.value }))}
                      placeholder="Occupation"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '2px solid #E8DDD0',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FFF'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid #E8DDD0',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#FFF'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                    I want to be a...
                  </label>
                  <select
                    value={registerForm.role}
                    onChange={e => setRegisterForm(f => ({ ...f, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid #E8DDD0',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      background: '#FFF',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select your role (optional)</option>
                    <option value="mentee">Mentee - I want to learn</option>
                    <option value="mentor">Mentor - I want to teach</option>
                    <option value="both">Both - I want to learn and teach</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                    Dialect Group (optional)
                  </label>
                  <select
                    value={registerForm.dialectGroup}
                    onChange={e => setRegisterForm(f => ({ ...f, dialectGroup: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid #E8DDD0',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      background: '#FFF',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select dialect group (optional)</option>
                    <option value="Hokkien">Hokkien</option>
                    <option value="Cantonese">Cantonese</option>
                    <option value="Teochew">Teochew</option>
                    <option value="Hakka">Hakka</option>
                    <option value="Hainanese">Hainanese</option>
                    <option value="Mixed/Other">Mixed/Other</option>
                    <option value="None">None - Just interested in learning</option>
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '2px solid #E8DDD0',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FFF'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#6B5B45', fontWeight: 600, marginBottom: 6 }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '2px solid #E8DDD0',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FFF'
                      }}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#C0392B',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                >
                  Create Account
                </button>
                
                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#8B7355' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C0392B',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
