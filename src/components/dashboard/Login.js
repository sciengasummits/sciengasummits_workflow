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
            <div className="login-bg">
                <div className="login-blob login-blob-1" />
                <div className="login-blob login-blob-2" />
                <div className="login-blob login-blob-3" />
            </div>

            <div className="login-container">
                <div className="login-branding">
                    <div className="login-logo-ring">
                        <Shield size={32} className="login-logo-icon" />
                    </div>
                    <h1 className="login-brand-title" style={{ fontSize: '1.15rem', letterSpacing: '1px' }}>CONFERENCE MANAGEMENT</h1>
                    <p className="login-brand-subtitle">LUITEX &amp; FOOD AGRI SUMMIT 2026</p>
                </div>

                <div className={`login-card ${success ? 'login-card-success' : ''}`}>
                    {success ? (
                        <div className="login-success-state">
                            <CheckCircle2 size={48} className="login-success-icon" />
                            <p className="login-success-text">Signing you in…</p>
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

                            <div className="login-steps">
                                <div className={`login-step ${!showOtpStep ? 'login-step-active' : 'login-step-done'}`}>
                                    <span className="login-step-dot">{showOtpStep ? '✓' : '1'}</span>
                                    <span className="login-step-label">Username</span>
                                </div>
                                <div className="login-step-line" />
                                <div className={`login-step ${showOtpStep ? 'login-step-active' : ''}`}>
                                    <span className="login-step-dot">2</span>
                                    <span className="login-step-label">OTP Verify</span>
                                </div>
                            </div>

                            {error && (
                                <div className="login-error-banner">
                                    <AlertCircle size={15} />
                                    <span>{error}</span>
                                </div>
                            )}

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
                                            'Continue →'
                                        )}
                                    </button>
                                </form>
                            )}

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
                                        ← Back
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                <p className="login-footer-text">
                    © 2026 LIUTEX SUMMIT. All rights reserved.
                </p>
            </div>
        </div>
    );
}
