'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, ChevronsUpDown, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRegistrations, updateRegistrationStatus } from '@/lib/api';

function formatDate(dateStr) {
    if (!dateStr) return 'â€”';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
}

const STATUS_COLORS = {
    Pending: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    Confirmed: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
    Cancelled: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
    Paid: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
};

export default function ViewRegistrations() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState(10);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [editId, setEditId] = useState(null); // inline status editing

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRegistrations(); // uses conference from login session
            setRows(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* â”€â”€â”€ Sort â”€â”€â”€ */
    const handleSort = (field) => {
        setSortDir(sortField === field && sortDir === 'asc' ? 'desc' : 'asc');
        setSortField(field);
    };

    /* â”€â”€â”€ Filter & sort â”€â”€â”€ */
    const filtered = rows.filter(r => {
        const q = search.toLowerCase();
        const displayStatus = (r.status === 'success' || r.status === 'Paid') ? 'Paid' : 'Pending';
        return (
            (r.name || '').toLowerCase().includes(q) ||
            (r.email || '').toLowerCase().includes(q) ||
            (r.country || '').toLowerCase().includes(q) ||
            (r.txnId || '').toLowerCase().includes(q) ||
            displayStatus.toLowerCase().includes(q)
        );
    }).sort((a, b) => {
        let va = a[sortField] ?? '', vb = b[sortField] ?? '';
        if (sortField === 'totalAmount') { va = Number(va); vb = Number(vb); }
        if (sortField === 'createdAt') { va = new Date(va); vb = new Date(vb); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / entries));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice((safePage - 1) * entries, safePage * entries);
    const startIdx = filtered.length ? (safePage - 1) * entries + 1 : 0;
    const endIdx = Math.min(safePage * entries, filtered.length);

    /* â”€â”€â”€ Inline status update â”€â”€â”€ */
    const handleStatusChange = async (id, newStatus) => {
        try {
            const updated = await updateRegistrationStatus(id, { status: newStatus });
            setRows(prev => prev.map(r => (r._id || r.id) === id ? updated : r));
        } catch { /* silent */ }
        setEditId(null);
    };

    const SortIcon = ({ field }) => (
        <ChevronsUpDown size={12} className="vr-sort-icon"
            style={{ color: sortField === field ? '#6366f1' : undefined }} />
    );

    return (
        <div className="ac2-page">
            {/* Header */}
            <div className="ac2-page-header">
                <div className="ac2-title-row">
                    <div className="ac2-title-icon" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}>
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <h1 className="ac2-title">Registrations</h1>
                        <p className="ac2-subtitle">All conference registrations submitted from the website</p>
                    </div>
                </div>
                <button onClick={load}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="vr-card">
                {/* Toolbar */}
                <div className="vr-toolbar">
                    <div className="vr-toolbar-left">
                        <span className="vr-entries-label">Show</span>
                        <select className="vr-entries-select" value={entries}
                            onChange={e => { setEntries(Number(e.target.value)); setPage(1); }}>
                            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="vr-entries-label">entries</span>
                    </div>
                    <div className="vr-toolbar-right">
                        <div className="vr-search-box">
                            <span className="vr-search-label">Search:</span>
                            <div className="vr-search-input-wrap">
                                <Search size={14} className="vr-search-icon" />
                                <input type="text" className="vr-search-input" value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Filter records..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Count banner */}
                <div className="vr-count-banner">
                    <Filter size={14} className="vr-count-icon" />
                    <span>Total Registrations = <strong>{rows.length}</strong>
                        {filtered.length !== rows.length && <span style={{ color: '#64748b', fontWeight: 400 }}> ({filtered.length} matching search)</span>}
                    </span>
                </div>

                {/* Loading / Error */}
                {loading && (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        Loading registrations from database…
                    </div>
                )}
                {error && !loading && (
                    <div style={{ color: '#ef4444', textAlign: 'center', padding: '60px 0' }}>
                        ⚠️ {error}. Make sure the backend server is running and refresh.
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="vr-table-wrapper">
                        <table className="vr-table">
                            <thead>
                                <tr className="vr-thead-row">
                                    <th className="vr-th" style={{ width: 50 }}><div className="vr-th-content">Sno</div></th>
                                    <th className="vr-th vr-sortable" style={{ width: 60 }} onClick={() => handleSort('title')}>
                                        <div className="vr-th-content">Title <SortIcon field="title" /></div>
                                    </th>
                                    <th className="vr-th vr-sortable" style={{ minWidth: 140 }} onClick={() => handleSort('name')}>
                                        <div className="vr-th-content">Name <SortIcon field="name" /></div>
                                    </th>
                                    <th className="vr-th vr-sortable" style={{ minWidth: 180 }} onClick={() => handleSort('email')}>
                                        <div className="vr-th-content">Email <SortIcon field="email" /></div>
                                    </th>
                                    <th className="vr-th" style={{ minWidth: 120 }}><div className="vr-th-content">Phone</div></th>
                                    <th className="vr-th vr-sortable" style={{ minWidth: 100 }} onClick={() => handleSort('country')}>
                                        <div className="vr-th-content">Country <SortIcon field="country" /></div>
                                    </th>
                                    <th className="vr-th vr-sortable" style={{ width: 80 }} onClick={() => handleSort('totalAmount')}>
                                        <div className="vr-th-content">Amount <SortIcon field="totalAmount" /></div>
                                    </th>
                                    <th className="vr-th vr-sortable" style={{ minWidth: 130 }} onClick={() => handleSort('createdAt')}>
                                        <div className="vr-th-content">Date <SortIcon field="createdAt" /></div>
                                    </th>
                                    <th className="vr-th" style={{ minWidth: 110 }}><div className="vr-th-content">Status</div></th>
                                    <th className="vr-th" style={{ minWidth: 110 }}><div className="vr-th-content">Txn ID</div></th>
                                    <th className="vr-th" style={{ minWidth: 200 }}><div className="vr-th-content">Description</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="sp-empty" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                                            {rows.length === 0
                                                ? 'No registrations yet. They will appear here once users submit the website form.'
                                                : 'No registrations match your search.'}
                                        </td>
                                    </tr>
                                ) : paged.map((row, idx) => {
                                    const uid = row._id || row.id;
                                    const actualStatus = (row.status === 'success' || row.status === 'Paid') ? 'Paid' : 'Pending';
                                    const statusCfg = STATUS_COLORS[actualStatus];
                                    return (
                                        <tr key={uid || idx} className="vr-tr">
                                            <td className="vr-td vr-text-center">{startIdx + idx}</td>
                                            <td className="vr-td">{row.title}</td>
                                            <td className="vr-td vr-font-medium">{row.name || 'â€”'}</td>
                                            <td className="vr-td">
                                                {row.email
                                                    ? <a href={`mailto:${row.email}`} className="vr-email-link">{row.email}</a>
                                                    : 'â€”'}
                                            </td>
                                            <td className="vr-td">{row.phone || 'â€”'}</td>
                                            <td className="vr-td">{row.country || 'â€”'}</td>
                                            <td className="vr-td vr-text-center">
                                                {row.totalAmount ? `$${row.totalAmount}` : 'â€”'}
                                            </td>
                                            <td className="vr-td vr-text-sm">{formatDate(row.createdAt)}</td>
                                            <td className="vr-td">
                                                <span
                                                    style={{
                                                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                                        background: statusCfg.bg, color: statusCfg.color,
                                                        border: `1px solid ${statusCfg.border}`, display: 'inline-block'
                                                    }}
                                                >
                                                    {actualStatus}
                                                </span>
                                            </td>
                                            <td className="vr-td" style={{ fontSize: '12px', color: '#64748b' }}>
                                                {row.txnId || <span style={{ color: '#cbd5e1' }}>â€”</span>}
                                            </td>
                                            <td className="vr-td vr-td-desc">
                                                {(row.description || '').split('\n').map((line, i) => (
                                                    <div key={i} className="vr-desc-line">{line}</div>
                                                ))}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="vr-pagination-container">
                        <div className="vr-pagination-info">
                            Showing {startIdx} to {endIdx} of {filtered.length} entries
                        </div>
                        <div className="vr-pagination">
                            <button className="vr-page-btn vr-page-prev" disabled={safePage === 1}
                                onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft size={14} /> Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p}
                                    className={`vr-page-btn vr-page-num${p === safePage ? ' vr-page-active' : ''}`}
                                    onClick={() => setPage(p)}>
                                    {p}
                                </button>
                            ))}
                            <button className="vr-page-btn vr-page-next" disabled={safePage === totalPages}
                                onClick={() => setPage(p => p + 1)}>
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

