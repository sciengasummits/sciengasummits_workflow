'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Topbar({ onToggleSidebar, eventName, username, onLogout, conf }) {
    const [showMenu, setShowMenu] = useState(false);
    const accent = conf?.accentColor || '#6366f1';
    const accentGlow = conf?.accentGlow || 'rgba(99,102,241,0.35)';

    return (
        <header className="topbar" style={{ position: 'relative' }}>
            <div className="topbar-left">
                <button className="hamburger" onClick={onToggleSidebar} title="Toggle Sidebar">
                    <Menu size={20} />
                </button>
                <span className="topbar-title">Conference Management System</span>
            </div>
            <div className="topbar-right">
                <div className="event-badge">
                    {eventName || 'LIUTEXSUMMIT2026'}
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowMenu(v => !v)}
                        title="User Menu"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                            color: '#fff', border: 'none', borderRadius: '10px',
                            padding: '8px 16px', cursor: 'pointer', fontWeight: 700,
                            fontSize: '12px', letterSpacing: '0.5px',
                            boxShadow: `0 3px 12px ${accentGlow}`,
                            transition: 'all 0.2s',
                        }}
                    >
                        <User size={14} />
                        {username || 'LIUTEXSUMMIT2026'}
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            minWidth: '200px', zIndex: 1000, overflow: 'hidden',
                        }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logged in as</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '2px', wordBreak: 'break-all' }}>{username}</div>
                            </div>
                            <button
                                onClick={() => { setShowMenu(false); onLogout && onLogout(); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    width: '100%', padding: '12px 16px', background: 'none',
                                    border: 'none', cursor: 'pointer', color: '#ef4444',
                                    fontSize: '14px', fontWeight: 600, transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.target.style.background = '#fff1f2'}
                                onMouseLeave={e => e.target.style.background = 'none'}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
