'use client';

import { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    X,
    BarChart2,
    Save,
} from 'lucide-react';

const INITIAL_DATA = [];

const EMPTY_FORM = {
    date: new Date().toISOString().slice(0, 10),
    dataCollected: '',
    individualSent: '',
    mergeMailSent: '',
    positives: '',
    virtual: '',
    abstracts: '',
    registrations: '',
    revenue: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const COLUMNS = [
    { key: 'sno', label: 'Sno' },
    { key: 'date', label: 'Date' },
    { key: 'dataCollected', label: 'Data Collected' },
    { key: 'individualSent', label: 'Individual Sent' },
    { key: 'mergeMailSent', label: 'Merge Mail Sent' },
    { key: 'positives', label: 'Positives' },
    { key: 'virtual', label: 'Virtual' },
    { key: 'abstracts', label: 'Abstracts' },
    { key: 'registrations', label: 'Registrations' },
    { key: 'revenue', label: 'Revenue' },
];

export default function WorkReports() {
    const [data, setData] = useState(INITIAL_DATA);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return data || [];
        return (data || []).filter(r =>
            r && Object.values(r).some(v => String(v).toLowerCase().includes(q))
        );
    }, [data, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const sliced = (filtered || []).slice((safePage - 1) * pageSize, safePage * pageSize);

    const pageNums = useMemo(() => {
        const arr = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) arr.push(i);
        } else {
            arr.push(1);
            if (safePage > 4) arr.push('â€¦');
            for (let i = Math.max(2, safePage - 2); i <= Math.min(totalPages - 1, safePage + 2); i++) arr.push(i);
            if (safePage < totalPages - 3) arr.push('â€¦');
            arr.push(totalPages);
        }
        return arr;
    }, [totalPages, safePage]);

    const openAdd = () => { setForm(EMPTY_FORM); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);

    const handleSave = () => {
        if (!form.date) { alert('Please fill in the Date.'); return; }
        setData(prev => [
            ...prev,
            { id: Date.now(), ...form },
        ]);
        setShowAdd(false);
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="wr-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={showAdd ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* Header */}
                <div className="wr-page-header">
                    <div className="wr-title-row">
                        <div className="wr-title-icon"><BarChart2 size={20} /></div>
                        <h1 className="wr-page-title">Work Update</h1>
                    </div>
                    <button className="wr-add-btn" onClick={openAdd}>
                        <Plus size={16} /> Add Today's Work Update
                    </button>
                </div>

                {/* Card */}
                <div className="wr-card">

                    {/* Toolbar */}
                    <div className="wr-toolbar">
                        <div className="wr-toolbar-left">
                            <span className="wr-entries-label">Show</span>
                            <select className="wr-entries-select" value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="wr-entries-label">entries</span>
                        </div>
                        <div className="wr-toolbar-right">
                            <span className="wr-search-label">Search:</span>
                            <div className="wr-search-wrap">
                                <Search size={14} className="wr-search-icon" />
                                <input
                                    className="wr-search-input"
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Filter recordsâ€¦"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="wr-table-wrap">
                        <table className="wr-table">
                            <thead>
                                <tr className="wr-thead-row">
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="wr-th">
                                            <div className="wr-th-inner">
                                                {col.label}
                                                {col.key !== 'sno' && <ChevronsUpDown size={11} className="wr-sort-icon" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(sliced || []).map((row, idx) => (
                                    <tr key={row.id} className="wr-tr">
                                        <td className="wr-td wr-center">{(safePage - 1) * pageSize + idx + 1}</td>
                                        <td className="wr-td">{row.date}</td>
                                        <td className="wr-td wr-center">{row.dataCollected}</td>
                                        <td className="wr-td wr-center">{row.individualSent}</td>
                                        <td className="wr-td wr-center">{row.mergeMailSent}</td>
                                        <td className="wr-td wr-center">{row.positives}</td>
                                        <td className="wr-td wr-center">{row.virtual}</td>
                                        <td className="wr-td wr-center">{row.abstracts}</td>
                                        <td className="wr-td wr-center">{row.registrations}</td>
                                        <td className="wr-td wr-center">{row.revenue}</td>
                                    </tr>
                                ))}
                                {sliced.length === 0 && (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className="wr-empty-row">
                                            No records to show.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="wr-pagination-bar">
                        <span className="wr-pagination-info">
                            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{' '}
                            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} entries
                        </span>
                        <div className="wr-pagination">
                            <button className="wr-page-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft size={14} /> Previous
                            </button>
                            {pageNums.map((n, i) =>
                                n === 'â€¦'
                                    ? <span key={`e${i}`} className="wr-page-ellipsis">â€¦</span>
                                    : <button key={n} className={`wr-page-btn wr-page-num${safePage === n ? ' wr-page-active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                            )}
                            <button className="wr-page-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>  {/* end wr-card */}

            </div>  {/* end blur wrapper */}

            {/* Add Modal */}
            {showAdd && (
                <div className="wr-overlay" onClick={closeAdd}>
                    <div className="wr-modal" onClick={e => e.stopPropagation()}>

                        <div className="wr-modal-header">
                            <div className="wr-modal-title-row">
                                <BarChart2 size={18} className="wr-modal-icon" />
                                <h2 className="wr-modal-title">Add Today's Work Update</h2>
                            </div>
                            <button className="wr-modal-close" onClick={closeAdd}><X size={18} /></button>
                        </div>

                        <div className="wr-modal-body">
                            {/* Date */}
                            <div className="wr-field wr-field-full">
                                <label className="wr-label">Date <span className="wr-req">*</span></label>
                                <input className="wr-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                            </div>

                            {/* Grid of numeric fields */}
                            <div className="wr-grid">
                                {[
                                    { key: 'dataCollected', label: 'Data Collected' },
                                    { key: 'individualSent', label: 'Individual Sent' },
                                    { key: 'mergeMailSent', label: 'Merge Mail Sent' },
                                    { key: 'positives', label: 'Positives' },
                                    { key: 'virtual', label: 'Virtual' },
                                    { key: 'abstracts', label: 'Abstracts' },
                                    { key: 'registrations', label: 'Registrations' },
                                    { key: 'revenue', label: 'Revenue' },
                                ].map(({ key, label }) => (
                                    <div className="wr-field" key={key}>
                                        <label className="wr-label">{label}</label>
                                        <input
                                            className="wr-input"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={form[key]}
                                            onChange={e => set(key, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="wr-modal-footer">
                            <button className="wr-cancel-btn" onClick={closeAdd}>Cancel</button>
                            <button className="wr-save-btn" onClick={handleSave}>
                                <Save size={15} /> Save Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

