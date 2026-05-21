'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Mailbox,
    Mail,
    Bell,
    CalendarClock,
    Search,
    RefreshCw,
    X,
    User,
    Phone,
    MessageSquare,
    Rss,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Filter,
    Clock,
} from 'lucide-react';
import { getMailMessages } from '@/lib/api';

const TYPE_CONFIG = {
    contact: {
        label: 'Contact Message',
        icon: <Mail size={14} />,
        color: '#3b82f6',
        bg: '#eff6ff',
        border: '#bfdbfe',
    },
    subscribe: {
        label: 'Newsletter Subscriber',
        icon: <Rss size={14} />,
        color: '#10b981',
        bg: '#ecfdf5',
        border: '#a7f3d0',
    },
    program: {
        label: 'Program Request',
        icon: <BookOpen size={14} />,
        color: '#f59e0b',
        bg: '#fffbeb',
        border: '#fde68a',
    },
};

const PAGE_SIZE = 20;

function TypeBadge({ type }) {
    const cfg = TYPE_CONFIG[type] || { label: type, color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: <Mail size={14} /> };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function formatDate(raw) {
    if (!raw) return '—';
    const d = new Date(raw);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function DetailModal({ msg, onClose }) {
    if (!msg) return null;
    const cfg = TYPE_CONFIG[msg.type] || {};
    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
                backdropFilter: 'blur(4px)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540,
                    margin: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    background: cfg.bg || '#f8fafc',
                    borderBottom: `1px solid ${cfg.border || '#e2e8f0'}`,
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: cfg.color || '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff',
                        }}>
                            {cfg.icon}
                        </span>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                                {cfg.label || msg.type}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={11} /> {formatDate(msg.createdAt)}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none', background: '#f1f5f9', borderRadius: 8,
                            width: 32, height: 32, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748b',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gap: 14 }}>
                        {msg.name && (
                            <InfoRow icon={<User size={14} />} label="Name" value={msg.name} />
                        )}
                        <InfoRow icon={<Mail size={14} />} label="Email" value={msg.email} isEmail />
                        {msg.phone && (
                            <InfoRow icon={<Phone size={14} />} label="Phone" value={msg.phone} />
                        )}
                        {msg.subject && (
                            <InfoRow icon={<MessageSquare size={14} />} label="Subject" value={msg.subject} />
                        )}
                        {msg.message && (
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                                    Message
                                </div>
                                <div style={{
                                    background: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: 8, padding: '12px 14px',
                                    color: '#374151', fontSize: 13, lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {msg.message}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, isEmail }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{
                width: 30, height: 30, borderRadius: 8,
                background: '#f1f5f9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#64748b', flexShrink: 0,
            }}>
                {icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                {isEmail ? (
                    <a href={`mailto:${value}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>{value}</a>
                ) : (
                    <div style={{ color: '#1e293b', fontSize: 13, fontWeight: 500, marginTop: 2, wordBreak: 'break-word' }}>{value}</div>
                )}
            </div>
        </div>
    );
}

export default function MailBox({ conf }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMailMessages();
            setMessages(Array.isArray(data?.messages) ? data.messages : []);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err.message || 'Failed to load messages');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filtered = useMemo(() => {
        let list = messages;
        if (typeFilter !== 'all') list = list.filter(m => m.type === typeFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                (m.name || '').toLowerCase().includes(q) ||
                (m.email || '').toLowerCase().includes(q) ||
                (m.subject || '').toLowerCase().includes(q) ||
                (m.message || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [messages, typeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // Counts per type
    const counts = useMemo(() => ({
        all: messages.length,
        contact: messages.filter(m => m.type === 'contact').length,
        subscribe: messages.filter(m => m.type === 'subscribe').length,
        program: messages.filter(m => m.type === 'program').length,
    }), [messages]);

    const accentColor = conf?.accentColor || '#3b82f6';

    return (
        <div style={{ padding: '0 0 40px 0' }}>
            {selected && <DetailModal msg={selected} onClose={() => setSelected(null)} />}

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24, flexWrap: 'wrap', gap: 12,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 14px ${accentColor}44`,
                    }}>
                        <Mailbox size={20} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Mail Box</h1>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            {lastRefresh ? `Last updated: ${formatDate(lastRefresh)}` : 'Contact, Subscribe & Program Requests'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchMessages}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '9px 16px', borderRadius: 10,
                        border: '1px solid #e2e8f0', background: '#fff',
                        color: '#374151', cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 500,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                >
                    <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
                {[
                    { key: 'all', label: 'Total Messages', icon: <Bell size={18} />, color: accentColor },
                    { key: 'contact', label: 'Contact', icon: <Mail size={18} />, color: '#3b82f6' },
                    { key: 'subscribe', label: 'Subscribers', icon: <Rss size={18} />, color: '#10b981' },
                    { key: 'program', label: 'Program Req.', icon: <BookOpen size={18} />, color: '#f59e0b' },
                ].map(({ key, label, icon, color }) => (
                    <div
                        key={key}
                        onClick={() => { setTypeFilter(key); setPage(1); }}
                        style={{
                            background: typeFilter === key ? color : '#fff',
                            border: typeFilter === key ? `2px solid ${color}` : '2px solid #e2e8f0',
                            borderRadius: 12, padding: '16px 18px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: typeFilter === key ? `0 4px 14px ${color}33` : '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                    >
                        <div style={{ color: typeFilter === key ? 'rgba(255,255,255,0.8)' : color, marginBottom: 8 }}>{icon}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: typeFilter === key ? '#fff' : '#1e293b', lineHeight: 1 }}>
                            {counts[key]}
                        </div>
                        <div style={{ fontSize: 11, color: typeFilter === key ? 'rgba(255,255,255,0.85)' : '#64748b', marginTop: 4, fontWeight: 500 }}>
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + filter toolbar */}
            <div style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                padding: '14px 18px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, subject…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{
                            width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                            border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13,
                            color: '#374151', outline: 'none', boxSizing: 'border-box',
                            background: '#f8fafc',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={14} style={{ color: '#94a3b8' }} />
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        style={{
                            border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px',
                            fontSize: 13, color: '#374151', background: '#f8fafc', cursor: 'pointer',
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="contact">Contact</option>
                        <option value="subscribe">Subscribe</option>
                        <option value="program">Program Request</option>
                    </select>
                </div>
                {(search || typeFilter !== 'all') && (
                    <button
                        onClick={() => { setSearch(''); setTypeFilter('all'); setPage(1); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '8px 12px', borderRadius: 9, border: '1px solid #fecaca',
                            background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 12,
                        }}
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                {/* Table header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 130px 1fr 180px 160px 130px',
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontSize: 11, fontWeight: 700, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                    <span>#</span>
                    <span>Type</span>
                    <span>Name / Email</span>
                    <span>Subject</span>
                    <span>Phone</span>
                    <span>Date</span>
                </div>

                {loading && (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <RefreshCw size={28} style={{ color: accentColor, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Loading messages…</p>
                    </div>
                )}

                {!loading && error && (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>⚠️ {error}</div>
                        <button
                            onClick={fetchMessages}
                            style={{
                                padding: '8px 18px', borderRadius: 9, border: `1px solid ${accentColor}`,
                                background: accentColor, color: '#fff', cursor: 'pointer', fontSize: 13,
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && paginated.length === 0 && (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Mailbox size={40} style={{ color: '#cbd5e1', marginBottom: 14 }} />
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
                            {messages.length === 0
                                ? 'No messages yet. They will appear here when visitors submit contact forms, subscribe to the newsletter, or request a program schedule.'
                                : 'No messages match your search criteria.'}
                        </p>
                    </div>
                )}

                {!loading && !error && paginated.map((msg, idx) => {
                    const rowNum = (safePage - 1) * PAGE_SIZE + idx + 1;
                    return (
                        <div
                            key={msg._id || idx}
                            onClick={() => setSelected(msg)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '50px 130px 1fr 180px 160px 130px',
                                padding: '13px 20px',
                                borderBottom: idx < paginated.length - 1 ? '1px solid #f1f5f9' : 'none',
                                alignItems: 'center', cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                            <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{rowNum}</span>

                            <span><TypeBadge type={msg.type} /></span>

                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {msg.name || <em style={{ color: '#94a3b8' }}>—</em>}
                                </div>
                                <div style={{ color: '#3b82f6', fontSize: 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {msg.email}
                                </div>
                            </div>

                            <div style={{ color: '#374151', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {msg.subject || <em style={{ color: '#cbd5e1' }}>—</em>}
                            </div>

                            <div style={{ color: '#374151', fontSize: 12 }}>
                                {msg.phone || <em style={{ color: '#cbd5e1' }}>—</em>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 11 }}>
                                <CalendarClock size={11} />
                                <span>{formatDate(msg.createdAt)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {!loading && !error && filtered.length > PAGE_SIZE && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 16, flexWrap: 'wrap', gap: 10,
                }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                        Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} messages
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <PagBtn disabled={safePage === 1} onClick={() => setPage(p => p - 1)} color={accentColor}>
                            <ChevronLeft size={14} /> Prev
                        </PagBtn>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
                            .reduce((acc, n, i, arr) => {
                                if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
                                acc.push(n);
                                return acc;
                            }, [])
                            .map((n, i) => n === '...'
                                ? <span key={`e${i}`} style={{ padding: '6px 8px', fontSize: 12, color: '#94a3b8' }}>…</span>
                                : <PagBtn key={n} active={safePage === n} onClick={() => setPage(n)} color={accentColor}>{n}</PagBtn>
                            )}
                        <PagBtn disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)} color={accentColor}>
                            Next <ChevronRight size={14} />
                        </PagBtn>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

function PagBtn({ children, disabled, onClick, active, color }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 12px', borderRadius: 8, border: active ? `2px solid ${color}` : '1px solid #e2e8f0',
                background: active ? color : '#fff',
                color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 500,
            }}
        >
            {children}
        </button>
    );
}
