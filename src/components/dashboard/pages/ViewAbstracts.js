'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, ChevronsUpDown, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react';
import { getAbstracts, updateAbstractStatus, deleteAbstract } from '@/lib/api';

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_COLORS = {
    Pending: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    Accepted: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
    Rejected: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
    Revision: { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' },
};

const INTEREST_BADGE = {
    oral: { label: 'Oral Presentation', bg: '#dbeafe', color: '#1d4ed8' },
    poster: { label: 'Poster Presentation', bg: '#dcfce7', color: '#15803d' },
    workshop: { label: 'Workshop', bg: '#fef3c7', color: '#b45309' },
    student: { label: 'Student Presentation', bg: '#ede9fe', color: '#7c3aed' },
};

function InterestBadge({ interest }) {
    const v = interest?.toLowerCase() || '';
    const cfg = Object.entries(INTEREST_BADGE).find(([k]) => v.includes(k))?.[1];
    if (!cfg) return <span style={{ color: '#64748b', fontSize: 12 }}>{interest || '—'}</span>;
    return (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
            {cfg.label}
        </span>
    );
}

// Map conferenceId — the website that serves /uploads/ files
const IS_DEV = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     process.env.NODE_ENV === 'development');

const CONFERENCE_SITE_URLS = {
    liutex:      process.env.NEXT_PUBLIC_LIUTEX_URL      || (IS_DEV ? 'http://127.0.0.1:5050' : 'https://liutexsummit2026.sciengasummits.com'),
    foodagri:    process.env.NEXT_PUBLIC_FOODAGRI_URL    || 'https://foodagrisummit.sciengasummits.com',
    fluid:       process.env.NEXT_PUBLIC_FLUID_URL       || 'https://fluidsummit.sciengasummits.com',
    renewable:   process.env.NEXT_PUBLIC_RENEWABLE_URL   || (IS_DEV ? 'http://127.0.0.1:3000' : 'https://recc2026.sciengasummits.com'),
    cyber:       process.env.NEXT_PUBLIC_CYBER_URL       || (IS_DEV ? 'http://127.0.0.1:3000' : 'https://cyberquantumsummit2026.sciengasummits.com'),
    powereng:    process.env.NEXT_PUBLIC_POWERENG_URL    || 'https://powerenergysummit.com',
    iqce2027:    process.env.NEXT_PUBLIC_IQCE2027_URL    || 'https://iqce2027.sciengasummits.com',
    icogwh:      process.env.NEXT_PUBLIC_ICOGWH_URL      || 'https://icogwh2027.sciengasummits.com',
    icemmae2027: process.env.NEXT_PUBLIC_ICEMMAE_URL     || 'https://icemmae2027.sciengasummits.com',
    advancenano: process.env.NEXT_PUBLIC_ADVANCENANO_URL || 'https://advancenanosummit2026.sciengasummits.com',
    opticphoton: process.env.NEXT_PUBLIC_OPTICPHOTON_URL || 'https://opticphotonsummit2026.com',
};

/** Turns /uploads/foo.docx —> https://website.com/uploads/foo.docx */
function resolveFileUrl(fileUrl, conferenceId) {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl; 
    const id = (conferenceId || '').toLowerCase() || 'liutex';
    const base = (CONFERENCE_SITE_URLS[id] || CONFERENCE_SITE_URLS.liutex).replace(/\/$/, '');
    const finalUrl = `${base}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
    
    if (IS_DEV) console.log(`[FileResolver] Resolved ${fileUrl} to: ${finalUrl}`);
    
    return finalUrl;
}

export default function ViewAbstracts({ conf }) {
    const [rows, setRows] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState(10);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAbstracts();
            setRows(data || []);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSort = (field) => {
        setSortDir(sortField === field && sortDir === 'asc' ? 'desc' : 'asc');
        setSortField(field);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateAbstractStatus(id, { status: newStatus });
            setRows(prev => prev.map(r => (r._id || r.id) === id ? { ...r, status: newStatus } : r));
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this abstract?')) return;
        try {
            await deleteAbstract(id);
            setRows(prev => prev.filter(r => (r._id || r.id) !== id));
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const filtered = (rows || []).filter(r => {
        if (!r) return false;
        const q = search.toLowerCase();
        return (
            r.name?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            r.title?.toLowerCase().includes(q) ||
            r.country?.toLowerCase().includes(q) ||
            r.organization?.toLowerCase().includes(q) ||
            r.topic?.toLowerCase().includes(q)
        );
    }).sort((a, b) => {
        let va = a[sortField] ?? '', vb = b[sortField] ?? '';
        if (sortField === 'createdAt') { va = new Date(va); vb = new Date(vb); }
        if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / entries));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice((safePage - 1) * entries, safePage * entries);
    const startIdx = filtered.length ? (safePage - 1) * entries + 1 : 0;
    const endIdx = Math.min(safePage * entries, filtered.length);

    const SortIcon = ({ field }) => (
        <ChevronsUpDown size={12} style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.3, color: sortField === field ? '#7c3aed' : undefined }} />
    );

    return (
        <div className="vr-container animate-in fade-in duration-500">
            <div className="vr-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)' }}>
                        <FileText size={24} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Abstracts</h1>
                        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>All abstracts submitted from the website form</p>
                    </div>
                </div>
                <button onClick={load} className="vr-refresh-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#475569', transition: 'all 0.2s' }}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12, color: '#b91c1c', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>âš ï¸</span>
                    <div><strong>Error:</strong> {error}</div>
                </div>
            )}

            <div className="vr-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div className="vr-toolbar" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                        Show 
                        <select value={entries} onChange={e => { setEntries(Number(e.target.value)); setPage(1); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}>
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        entries
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Filter records..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            style={{ padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid #e2e8f0', width: 260, outline: 'none', fontSize: 14, transition: 'border-color 0.2s' }}
                        />
                    </div>
                </div>

                <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                    <Filter size={14} />
                    <span>Total Abstracts = <strong>{filtered.length}</strong></span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 1200 }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', width: 60 }}>Sno</th>
                                <th onClick={() => handleSort('title')} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>Title <SortIcon field="title" /></th>
                                <th onClick={() => handleSort('name')} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>Name <SortIcon field="name" /></th>
                                <th onClick={() => handleSort('country')} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>Country <SortIcon field="country" /></th>
                                <th onClick={() => handleSort('email')} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>Email <SortIcon field="email" /></th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>Phone</th>
                                <th onClick={() => handleSort('interest')} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>Category <SortIcon field="interest" /></th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>Organization</th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>Topic</th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>Abstract</th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>File</th>
                                <th onClick={() => handleSort('createdAt')} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>Date <SortIcon field="createdAt" /></th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>Status</th>
                                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9', width: 60 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={13} style={{ padding: 60, textAlign: 'center' }}>
                                        <RefreshCw size={24} className="animate-spin" style={{ color: '#7c3aed', margin: '0 auto 12px' }} />
                                        <div style={{ color: '#64748b', fontSize: 14 }}>Loading abstracts...</div>
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={13} style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                                        No abstracts found matching your criteria.
                                    </td>
                                </tr>
                            ) : paged.map((row, idx) => {
                                const uid = row._id || row.id;
                                const statusCfg = STATUS_COLORS[row.status] || STATUS_COLORS.Pending;
                                const absUrl = resolveFileUrl(row.fileUrl, row.conference || conf?.conferenceId);
                                const isExpanded = expandedId === uid;
                                
                                return (
                                    <React.Fragment key={uid}>
                                    <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9', background: isExpanded ? '#f8faff' : undefined, transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>{startIdx + idx}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{row.title || '—'}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>{row.name || '—'}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#1e293b' }}>{row.country || '—'}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 13 }}>
                                            <a href={`mailto:${row.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{row.email || '—'}</a>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#1e293b' }}>{row.phone || '—'}</td>
                                        <td style={{ padding: '16px 20px' }}><InterestBadge interest={row.interest} /></td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#7c3aed', fontWeight: 500 }}>{row.organization || '—'}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#0891b2' }}>{row.topic || '—'}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : uid)}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: isExpanded ? '#ede9fe' : '#f1f5f9', borderRadius: 8, fontSize: 12, fontWeight: 600, color: isExpanded ? '#7c3aed' : '#475569', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                            >
                                                {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                                                {isExpanded ? 'Hide' : 'View'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {absUrl ? (
                                                <a href={absUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f1f5f9', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                                                    <Download size={14} /> Doc <ExternalLink size={12} />
                                                </a>
                                            ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(row.createdAt)}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <select 
                                                value={row.status || 'Pending'} 
                                                onChange={e => handleStatusChange(uid, e.target.value)}
                                                style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, cursor: 'pointer', outline: 'none' }}
                                            >
                                                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <button onClick={(e) => handleDelete(uid, e)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr style={{ background: '#f8faff', borderBottom: '1px solid #e2e8f0' }}>
                                            <td colSpan={14} style={{ padding: '24px 40px' }}>
                                                <div style={{ background: '#fff', padding: 30, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30, marginBottom: 30 }}>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 6px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</h4>
                                                            <p style={{ margin: 0, fontSize: 15, color: '#1e293b', fontWeight: 600 }}>{row.title} {row.name}</p>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 6px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact Info</h4>
                                                            <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{row.email}</p>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#64748b' }}>{row.phone || 'No phone provided'}</p>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 6px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Session / Topic</h4>
                                                            <p style={{ margin: 0, fontSize: 14, color: '#4f46e5', fontWeight: 600 }}>{row.topic || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 6px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Organization & Country</h4>
                                                            <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{row.organization || row.affiliation || '—'}</p>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#64748b' }}>{row.country || '—'}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{ marginBottom: 30 }}>
                                                        <h4 style={{ margin: '0 0 10px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Postal Address</h4>
                                                        <p style={{ margin: 0, fontSize: 14, color: '#334155', background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #f1f5f9' }}>{row.address || 'No address provided'}</p>
                                                    </div>

                                                    <div style={{ marginBottom: 30 }}>
                                                        <h4 style={{ margin: '0 0 10px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Abstract Text</h4>
                                                        {row.abstractText ? (
                                                            <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', border: '1px solid #f1f5f9' }}>
                                                                {row.abstractText}
                                                            </div>
                                                        ) : (
                                                            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', fontStyle: 'italic' }}>No abstract text body provided.</p>
                                                        )}
                                                    </div>

                                                    {absUrl && (
                                                        <div style={{ paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div>
                                                                <h4 style={{ margin: '0 0 4px 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Uploaded File</h4>
                                                                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{row.fileName || 'document'}</p>
                                                            </div>
                                                            <a href={absUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: '#4f46e5', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                                                                <Download size={18} /> Download Document
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: 20, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                        Showing {startIdx} to {endIdx} of {filtered.length} entries
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.5 : 1 }}>
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, background: p === safePage ? '#7c3aed' : '#fff', border: '1px solid', borderColor: p === safePage ? '#7c3aed' : '#e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: p === safePage ? '#fff' : '#475569' }}>
                                {p}
                            </button>
                        ))}
                        <button disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.5 : 1 }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

