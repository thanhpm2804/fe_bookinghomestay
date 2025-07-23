import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy email từ query param nếu có
  const query = new URLSearchParams(location.search);
  const email = query.get('email') || '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email.trim()) {
      setError('Missing email. Please go back and request password reset again.');
      return;
    }
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/Account/reset-password-with-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          newPassword: password
        }),
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        let errorText = await response.text();
        let data;
        try {
          data = JSON.parse(errorText);
        } catch {
          data = {};
        }
        setError(data.message || errorText || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
      fontFamily: 'Segoe UI, sans-serif',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '40px 32px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 12, color: '#06b6d4' }}>🔑</div>
        <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Reset your password</h2>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>
          Enter the code sent to your email and set a new password.
        </p>
        {success ? (
          <div style={{ color: '#22c55e', fontWeight: 500, fontSize: 16, margin: '32px 0' }}>
            🎉 Your password has been reset!<br />You can now log in with your new password.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18, textAlign: 'left' }}>
              <label htmlFor="code" style={{ display: 'block', marginBottom: 6, color: '#06b6d4', fontWeight: 600 }}>
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                placeholder="Enter code"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #bae6fd',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                  marginBottom: 6,
                  background: loading ? '#f1f5f9' : '#fff',
                }}
                disabled={loading}
                onFocus={e => (e.target.style.border = '1.5px solid #06b6d4')}
                onBlur={e => (e.target.style.border = '1.5px solid #bae6fd')}
              />
            </div>
            <div style={{ marginBottom: 18, textAlign: 'left', position: 'relative' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6, color: '#06b6d4', fontWeight: 600 }}>
                New Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="New password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #bae6fd',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                  marginBottom: 6,
                  background: loading ? '#f1f5f9' : '#fff',
                }}
                disabled={loading}
                onFocus={e => (e.target.style.border = '1.5px solid #06b6d4')}
                onBlur={e => (e.target.style.border = '1.5px solid #bae6fd')}
              />
              <span
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 40,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 18,
                  color: '#06b6d4',
                }}
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            <div style={{ marginBottom: 18, textAlign: 'left', position: 'relative' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: 6, color: '#06b6d4', fontWeight: 600 }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #bae6fd',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                  marginBottom: 6,
                  background: loading ? '#f1f5f9' : '#fff',
                }}
                disabled={loading}
                onFocus={e => (e.target.style.border = '1.5px solid #06b6d4')}
                onBlur={e => (e.target.style.border = '1.5px solid #bae6fd')}
              />
              <span
                onClick={() => setShowConfirmPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 40,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 18,
                  color: '#06b6d4',
                }}
                tabIndex={0}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </span>
            </div>
            {error && (
              <div style={{ color: '#ef4444', marginBottom: 14, fontSize: 15 }}>{error}</div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                background: loading
                  ? 'linear-gradient(90deg, #a5f3fc 0%, #bae6fd 100%)'
                  : 'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 17,
                padding: '12px 0',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(6,182,212,0.08)',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword; 