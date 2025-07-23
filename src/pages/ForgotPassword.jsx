import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const response = await fetch('/api/Account/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSuccess(true);
        setSubmitted(true);
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Something went wrong. Please try again.');
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
        <div style={{ fontSize: 44, marginBottom: 12, color: '#6366f1' }}>🔒</div>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Forgot your password?</h2>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        {submitted && success ? (
          <div style={{ color: '#22c55e', fontWeight: 500, fontSize: 16, margin: '32px 0' }}>
            ✅ If this email exists, a reset link has been sent!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 22, textAlign: 'left' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: 6, color: '#6366f1', fontWeight: 600 }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #c7d2fe',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                  background: loading ? '#f1f5f9' : '#fff',
                }}
                disabled={loading}
                onFocus={e => (e.target.style.border = '1.5px solid #6366f1')}
                onBlur={e => (e.target.style.border = '1.5px solid #c7d2fe')}
              />
            </div>
            {error && (
              <div style={{ color: '#ef4444', marginBottom: 14, fontSize: 15 }}>{error}</div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                background: loading
                  ? 'linear-gradient(90deg, #a5b4fc 0%, #67e8f9 100%)'
                  : 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 17,
                padding: '12px 0',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
export default ForgotPassword; 