'use client';

import { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    X,
    Save,
    ThumbsUp,
} from 'lucide-react';

const POSITIVE_TYPES = [
    'Select Type',
    'Conference Feedback',
    'Speaker Feedback',
    'Registration Feedback',
    'General',
    'Other',
];

const INITIAL_DATA = [];

const EMPTY_FORM = {
    positiveType: 'Select Type',
    name: '',
    email: '',
    emailScreenshot: null,
    emailScreenshotName: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function Positives() {
    const [data, setData] = useState(INITIAL_DATA);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return data;
        return data.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.positiveType.toLowerCase().includes(q)
        );
    }, [data, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const sliced = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

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

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const openAdd = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setShowAdd(true);
    };

    const openEdit = (row) => {
        setEditId(row.id);
        setForm({
            positiveType: row.positiveType,
            name: row.name,
            email: row.email,
            emailScreenshot: row.emailScreenshot,
            emailScreenshotName: row.emailScreenshotName,
        });
        setShowAdd(true);
    };

    const closeModal = () => { setShowAdd(false); setEditId(null); };

    const handleSave = () => {
        if (form.positiveType === 'Select Type') { alert('Please select a Positive Type.'); return; }
        if (!form.name.trim()) { alert('Please enter a Name.'); return; }
        if (!form.email.trim()) { alert('Please enter an Email.'); return; }

        if (editId !== null) {
            setData(prev => prev.map(r => r.id === editId ? { ...r, ...form } : r));
        } else {
            setData(prev => [...prev, { id: Date.now(), ...form }]);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        setData(prev => prev.filter(r => r.id !== id));
        setDeleteId(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => set('emailScreenshot', ev.target.result);
        reader.readAsDataURL(file);
        set('emailScreenshotName', file.name);
    };

    const modalOpen = showAdd || deleteId !== null;

    return (
        <div className="pos-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* Header */}
                <div className="pos-page-header">
                    <div className="pos-title-row">
                        <div className="pos-title-icon"><ThumbsUp size={20} /></div>
                        <h1 className="pos-page-title">List of Positives</h1>
                    </div>
                    <button className="pos-add-btn" onClick={openAdd}>
                        <Plus size={16} /> Add Positive
                    </button>
                </div>

                {/* Card */}
                <div className="pos-card">

                    {/* Toolbar */}
                    <div className="pos-toolbar">
                        <div className="pos-toolbar-left">
                            <span className="pos-entries-label">Show</span>
                            <select className="pos-entries-select" value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="pos-entries-label">entries</span>
                        </div>
                        <div className="pos-toolbar-right">
                            <span className="pos-search-label">Search:</span>
                            <div className="pos-search-wrap">
                                <Search size={14} className="pos-search-icon" />
                                <input
                                    className="pos-search-input"
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Filter recordsâ€¦"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="pos-table-wrap">
                        <table className="pos-table">
                            <thead>
                                <tr className="pos-thead-row">
                                    {['SNO', 'Positive Type', 'Name', 'Email', 'Email Screenshot', 'Edit', 'Delete'].map(col => (
                                        <th key={col} className="pos-th">
                                            <div className="pos-th-inner">{col}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sliced.map((row, idx) => (
                                    <tr key={row.id} className="pos-tr">
                                        <td className="pos-td pos-center">{(safePage - 1) * pageSize + idx + 1}</td>
                                        <td className="pos-td">
                                            <span className="pos-type-badge">{row.positiveType}</span>
                                        </td>
                                        <td className="pos-td pos-name">{row.name}</td>
                                        <td className="pos-td pos-email">{row.email}</td>
                                        <td className="pos-td pos-center">
                                            {row.emailScreenshot
                                                ? <img src={row.emailScreenshot} alt="screenshot" className="pos-screenshot-thumb" />
                                                : <span className="pos-no-img">â€”</span>}
                                        </td>
                                        <td className="pos-td pos-center">
                                            <button className="pos-edit-btn" onClick={() => openEdit(row)} title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                        </td>
                                        <td className="pos-td pos-center">
                                            <button className="pos-del-btn" onClick={() => setDeleteId(row.id)} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {sliced.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="pos-empty-row">No records to show.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pos-pagination-bar">
                        <span className="pos-pagination-info">
                            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{' '}
                            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} entries
                        </span>
                        <div className="pos-pagination">
                            <button className="pos-page-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft size={14} /> Previous
                            </button>
                            {pageNums.map((n, i) =>
                                n === 'â€¦'
                                    ? <span key={`e${i}`} className="pos-page-ellipsis">â€¦</span>
                                    : <button key={n} className={`pos-page-btn pos-page-num${safePage === n ? ' pos-page-active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                            )}
                            <button className="pos-page-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>  {/* end pos-card */}

            </div>  {/* end blur wrapper */}

            {/* Add / Edit Modal */}
            {showAdd && (
                <div className="pos-overlay" onClick={closeModal}>
                    <div className="pos-modal" onClick={e => e.stopPropagation()}>
                        <div className="pos-modal-header">
                            <div className="pos-modal-title-row">
                                <ThumbsUp size={17} className="pos-modal-icon" />
                                <h2 className="pos-modal-title">{editId !== null ? 'Edit Positive' : 'Add Positive'}</h2>
                            </div>
                            <button className="pos-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>

                        <div className="pos-modal-body">
                            <div className="pos-modal-grid">

                                {/* Positive Type */}
                                <div className="pos-field">
                                    <label className="pos-label">Positive Type <span className="pos-req">*</span></label>
                                    <select className="pos-select" value={form.positiveType} onChange={e => set('positiveType', e.target.value)}>
                                        {POSITIVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                {/* Name */}
                                <div className="pos-field">
                                    <label className="pos-label">Name <span className="pos-req">*</span></label>
                                    <input className="pos-input" type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
                                </div>

                                {/* Email */}
                                <div className="pos-field pos-field-full">
                                    <label className="pos-label">Email <span className="pos-req">*</span></label>
                                    <input className="pos-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                                </div>

                                {/* Email Screenshot */}
                                <div className="pos-field pos-field-full">
                                    <label className="pos-label">Email Screenshot</label>
                                    <div className="pos-file-wrap">
                                        <label className="pos-file-label" htmlFor="pos-file-input">
                                            Choose File
                                        </label>
                                        <span className="pos-file-name">
                                            {form.emailScreenshotName || 'No file chosen'}
                                        </span>
                                        <input
                                            id="pos-file-input"
                                            type="file"
                                            accept="image/*"
                                            className="pos-file-hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {form.emailScreenshot && (
                                        <img src={form.emailScreenshot} alt="Preview" className="pos-img-preview" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pos-modal-footer">
                            <button className="pos-cancel-btn" onClick={closeModal}>Cancel</button>
                            <button className="pos-save-btn" onClick={handleSave}>
                                <Save size={15} /> {editId !== null ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId !== null && (
                <div className="pos-overlay" onClick={() => setDeleteId(null)}>
                    <div className="pos-confirm" onClick={e => e.stopPropagation()}>
                        <h3 className="pos-confirm-title">Delete Record?</h3>
                        <p className="pos-confirm-msg">This action cannot be undone.</p>
                        <div className="pos-confirm-actions">
                            <button className="pos-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="pos-del-confirm-btn" onClick={() => handleDelete(deleteId)}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

