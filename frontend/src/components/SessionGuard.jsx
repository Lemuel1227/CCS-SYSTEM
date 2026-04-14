import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg.jpg';

const SessionGuard = ({ onLogout, onPasswordConfirmed }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.remove('dark-theme');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password === 'password123') {
      setError('Please choose a password different from the default.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.put('/api/auth/change-password', { password });

      // Update local storage so we don't trigger it again
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token); // Refresh token

      if (onPasswordConfirmed) {
        onPasswordConfirmed();
      }
      
      navigate('/dashboard'); 
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }}></div>

      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '12px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '28px', fontWeight: 'bold' }}>Update Password</h2>
        <p style={{ margin: '0 0 24px 0', color: '#64748b', lineHeight: '1.5', fontSize: '15px' }}>  
          For security reasons, you must change your default password before accessing your portal.
        </p>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  paddingRight: '40px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Enter new secure password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}       
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  paddingRight: '40px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}       
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>     
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoading}
              style={{
                flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px'
              }}
            >
              Sign Out
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 2, padding: '14px', background: 'var(--primary-color, #db5515)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px'
              }}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionGuard;
