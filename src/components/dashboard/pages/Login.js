'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Lock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = '';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Auto-focus first OTP box when OTP step shown
  useEffect(() => {
    if (showOtpStep && otpRefs[0].current) {
      otpRefs[0].current.focus();
    }
  }, [showOtpStep]);

  async function handleUsernameSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    setLoading(true);
    try {
      // Generate and send OTP
      const res = await fetch(`${API_BASE}/api/auth/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setLoading(false);
        setOtpSent(true);
        setShowOtpStep(true);
        setOtpSentMessage(data.message);
      } else {
        setLoading(false);
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setLoading(false);
      setError('Cannot connect to server. Please try again.');
    }
  }

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 3);
    otpRefs[focusIdx].current.focus();
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setError('Please enter the complete 4-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), otp: enteredOtp })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onLogin({ username: data.username, conferenceId: data.conferenceId, displayName: data.displayName }), 800);
      } else {
        setLoading(false);
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '']);
        otpRefs[0].current.focus();
      }
    } catch {
      setLoading(false);
      setError('Cannot connect to server. Please try again.');
    }
  }

  function handleBack() {
    setShowOtpStep(false);
    setOtp(['', '', '', '']);
    setError('');
    setOtpSent(false);
    setOtpSentMessage('');
  }

  return (
    <div className="login-root">
      {/* Animated background blobs */}
      <div className="login-bg">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />
      </div>

      <div className="login-container">
        {/* Logo / Branding */}
        <div className="login-branding">
          <div className="login-logo-ring">
            <Shield size={32} className="login-logo-icon" />
          </div>
          <h1 className="login-brand-title" style={{ fontSize: '1.15rem', letterSpacing: '1px' }}>CONFERENCE MANAGEMENT</h1>
          <p className="login-brand-subtitle">LUITEX &amp; FOOD AGRI SUMMIT 2026</p>
        </div>

        {/* Card */}
        <div className={`login-card ${success ? 'login-card-success' : ''}`}>
          {success ? (
            <div className="login-success-state">
              <CheckCircle2 size={48} className="login-success-icon" />
              <p className="login-success-text">Signing you inâ€¦</p>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2 className="login-card-title">Sign In</h2>
                <p className="login-card-desc">
                  {showOtpStep
                    ? 'Enter the 4-digit OTP to continue'
                    : 'Enter your username to get started'}
                </p>
              </div>

              {/* Step indicator */}
              <div className="login-steps">
                <div className={`login-step ${!showOtpStep ? 'login-step-active' : 'login-step-done'}`}>
                  <span className="login-step-dot">{showOtpStep ? 'âœ“' : '1'}</span>
                  <span className="login-step-label">Username</span>
                </div>
                <div className="login-step-line" />
                <div className={`login-step ${showOtpStep ? 'login-step-active' : ''}`}>
                  <span className="login-step-dot">2</span>
                  <span className="login-step-label">OTP Verify</span>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="login-error-banner">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Username */}
              {!showOtpStep && (
                <form onSubmit={handleUsernameSubmit} className="login-form">
                  <div className="login-field">
                    <label className="login-label">Username</label>
                    <div className="login-input-wrap">
                      <User size={17} className="login-input-icon" />
                      <input
                        id="login-username"
                        type="text"
                        className="login-input"
                        placeholder="Enter your username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(''); }}
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    id="login-continue-btn"
                    type="submit"
                    className="login-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="login-spinner" />
                    ) : (
                      'Continue â†’'
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP */}
              {showOtpStep && (
                <form onSubmit={handleSignIn} className="login-form">
                  {otpSentMessage && (
                    <div className="login-success-notice">
                      <CheckCircle2 size={13} />
                      <span>{otpSentMessage}</span>
                    </div>
                  )}

                  {otpSent && (
                    <div className="login-otp-notice">
                      <Lock size={13} />
                      <span>OTP is valid for <strong>10 minutes</strong></span>
                    </div>
                  )}

                  <div className="login-field">
                    <label className="login-label">Enter OTP</label>
                    <div className="login-otp-boxes" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          id={`otp-box-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className={`login-otp-box ${digit ? 'login-otp-box-filled' : ''}`}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    id="login-signin-btn"
                    type="submit"
                    className="login-btn"
                    disabled={loading}
                  >
                    {loading ? <span className="login-spinner" /> : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    className="login-back-btn"
                    onClick={handleBack}
                  >
                    â† Back
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="login-footer-text">
          Â© 2026 LIUTEX SUMMIT. All rights reserved.
        </p>
      </div>

      <style>{`
        /* â”€â”€ Root & Background â”€â”€ */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1117;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }
        .login-blob-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #6366f1, #8b5cf6);
          top: -80px; left: -100px;
          animation-delay: 0s;
        }
        .login-blob-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #06b6d4, #3b82f6);
          bottom: -60px; right: -80px;
          animation-delay: 2s;
        }
        .login-blob-3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, #f472b6, #a855f7);
          top: 50%; right: 25%;
          animation-delay: 4s;
        }

        @keyframes blobFloat {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(30px) scale(1.06); }
        }

        /* â”€â”€ Container â”€â”€ */
        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
          max-width: 480px;
          padding: 20px;
          position: relative;
          z-index: 10;
        }

        /* â”€â”€ Branding â”€â”€ */
        .login-branding {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .login-logo-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 28px rgba(99, 102, 241, 0.55);
          margin-bottom: 4px;
        }

        .login-logo-icon {
          color: #fff;
        }

        .login-brand-title {
          font-size: 1.55rem;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .login-brand-subtitle {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0;
          letter-spacing: 0.4px;
        }

        /* â”€â”€ Card â”€â”€ */
        .login-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(18px);
          border-radius: 20px;
          padding: 40px 44px 36px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          transition: transform 0.3s ease;
        }

        .login-card:hover {
          transform: translateY(-2px);
        }

        .login-card-success {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 180px;
        }

        /* â”€â”€ Card Header â”€â”€ */
        .login-card-header {
          margin-bottom: 20px;
          text-align: center;
        }

        .login-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }

        .login-card-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        /* â”€â”€ Steps â”€â”€ */
        .login-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .login-step {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .login-step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .login-step-active .login-step-dot {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: #6366f1;
          color: #fff;
          box-shadow: 0 0 10px rgba(99,102,241,0.4);
        }

        .login-step-done .login-step-dot {
          background: #22c55e;
          border-color: #22c55e;
          color: #fff;
        }

        .login-step-label {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }

        .login-step-active .login-step-label {
          color: #a5b4fc;
        }

        .login-step-done .login-step-label {
          color: #4ade80;
        }

        .login-step-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
          width: 40px;
        }

        /* â”€â”€ Error Banner â”€â”€ */
        .login-error-banner {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 0.78rem;
          margin-bottom: 14px;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* â”€â”€ Form â”€â”€ */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .login-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.3px;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 13px;
          color: #475569;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px 13px 40px;
          color: #f1f5f9;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          box-sizing: border-box;
        }

        .login-input::placeholder {
          color: #334155;
        }

        .login-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
        }

        /* â”€â”€ OTP Boxes â”€â”€ */
        .login-otp-boxes {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .login-otp-box {
          width: 56px;
          height: 58px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #f1f5f9;
          font-size: 1.3rem;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          font-family: inherit;
        }

        .login-otp-box:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
          transform: scale(1.06);
        }

        .login-otp-box-filled {
          border-color: #8b5cf6;
          background: rgba(139,92,246,0.1);
          color: #c4b5fd;
        }

        /* â”€â”€ OTP Notice â”€â”€ */
        .login-otp-notice {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #64748b;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .login-success-notice {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #22c55e;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 10px;
        }

        /* â”€â”€ Buttons â”€â”€ */
        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(99,102,241,0.35);
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(99,102,241,0.5);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-back-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: #64748b;
          border-radius: 10px;
          padding: 9px;
          cursor: pointer;
          font-size: 0.8rem;
          font-family: inherit;
          transition: color 0.2s, border-color 0.2s;
          width: 100%;
        }

        .login-back-btn:hover {
          color: #94a3b8;
          border-color: rgba(255,255,255,0.2);
        }

        /* â”€â”€ Spinner â”€â”€ */
        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* â”€â”€ Success State â”€â”€ */
        .login-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }

        .login-success-icon {
          color: #4ade80;
          filter: drop-shadow(0 0 10px rgba(74,222,128,0.5));
        }

        .login-success-text {
          color: #94a3b8;
          font-size: 0.88rem;
          margin: 0;
        }

        /* â”€â”€ Footer â”€â”€ */
        .login-footer-text {
          font-size: 0.72rem;
          color: #334155;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

