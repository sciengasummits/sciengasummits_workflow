'use client';

import { useState, useMemo } from 'react';
import {
    FileText,
    Plus,
    Search,
    Download,
    Pencil,
    X,
    Save,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
} from 'lucide-react';

/* â”€â”€ Mock data (mirrors the reference screenshots) â”€â”€ */
const INITIAL_DATA = [
    { id: 1, invoiceNo: '', name: '', email: '', phone: '', country: '', details: '', price: 0, date: '2026-02-18 15:09:08', txnId: '', status: 'Pending' },
    { id: 2, invoiceNo: '', name: '', email: '', phone: '', country: '', details: '', price: 0, date: '2026-02-15 14:37:25', txnId: '', status: 'Pending' },
    { id: 3, invoiceNo: 'INV-0003', name: 'Ms. Rooba', email: 'roobafinner@gmail.com', phone: '12345678', country: 'Japan', details: 'roobafinner@gmail.com\n12345678\nJapan\nSpeaker Registration :\nAccommodation :\nAccompanying Person :', price: 2099, date: '2026-02-13 10:20:50', txnId: '', status: 'Pending' },
    { id: 4, invoiceNo: 'INV-0004', name: 'Ms. Rooba', email: 'roobafinner@gmail.com', phone: '12345678', country: 'Japan', details: 'roobafinner@gmail.com\n12345678\nJapan\nSpeaker Registration :\nAccommodation :\nAccompanying Person :', price: 3149, date: '2026-02-13 10:18:52', txnId: '', status: 'Pending' },
    { id: 5, invoiceNo: 'INV-0005', name: 'Ms. Rooba', email: 'roobafinner@gmail.com', phone: '12345678', country: 'Japan', details: 'roobafinner@gmail.com\n12345678\nJapan\nSpeaker Registration :\nAccommodation :\nAccompanying Person :', price: 4199, date: '2026-02-13 10:16:54', txnId: '', status: 'Pending' },
    { id: 6, invoiceNo: 'INV-0006', name: 'Mr. Gift Oke Okiss Erhikevwe', email: 'okissedu@gmail.com', phone: '+2349067241063', country: 'Nigeria', details: 'okissedu@gmail.com\n+2349067241063\nNigeria\nSpeaker Registration : 999\nAccommodation : 360\nAccompanying Person :', price: 1427, date: '2026-02-11 19:07:16', txnId: '', status: 'Pending' },
    { id: 7, invoiceNo: 'INV-0007', name: 'Mr. Ganta Mohan', email: 'mohan.ganta@flyhii.in', phone: '9618850656', country: 'India', details: 'mohan.ganta@flyhii.in\n9618850656\nIndia\ne-Poster Registration : 199', price: 890, date: '2026-02-06 22:33:53', txnId: '', status: 'Pending' },
    { id: 8, invoiceNo: '', name: '', email: '', phone: '', country: '', details: '', price: 0, date: '2026-02-05 12:07:46', txnId: '', status: 'Pending' },
    { id: 9, invoiceNo: '', name: '', email: '', phone: '', country: '', details: '', price: 0, date: '2026-02-05 02:48:31', txnId: '', status: 'Pending' },
    { id: 10, invoiceNo: '', name: '', email: '', phone: '', country: '', details: '', price: 0, date: '2026-01-31 03:26:56', txnId: '', status: 'Pending' },
    { id: 11, invoiceNo: 'INV-0011', name: 'Dr. Priya Nair', email: 'priya.nair@iit.ac.in', phone: '+919876543210', country: 'India', details: 'priya.nair@iit.ac.in\n+919876543210\nIndia\nDelegate Registration : 599', price: 599, date: '2026-01-28 09:15:00', txnId: 'TXN-3310', status: 'Paid' },
    { id: 12, invoiceNo: 'INV-0012', name: 'Prof. Liang Wei', email: 'liang.wei@pku.edu.cn', phone: '+8613812345678', country: 'China', details: 'liang.wei@pku.edu.cn\n+8613812345678\nChina\nSpeaker Registration : 999\nAccommodation : 500', price: 1499, date: '2026-01-25 14:00:00', txnId: 'TXN-7821', status: 'Paid' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const BLANK_INVOICE = {
    invoiceNo: '',
    name: '',
    email: '',
    phone: '',
    country: '',
    details: '',
    price: '',
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    txnId: '',
    status: 'Pending',
};

export default function Invoices() {
    const [data, setData] = useState(INITIAL_DATA);
    const [nextId, setNextId] = useState(INITIAL_DATA.length + 1);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [showAdd, setShowAdd] = useState(false);
    const [addBuf, setAddBuf] = useState({ ...BLANK_INVOICE });
    const [editId, setEditId] = useState(null);
    const [editBuf, setEditBuf] = useState({});

    /* â”€â”€ filtered list â”€â”€ */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return data;
        return data.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.invoiceNo.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.details.toLowerCase().includes(q) ||
            r.txnId.toLowerCase().includes(q)
        );
    }, [data, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const sliced = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    /* â”€â”€ pagination pages array â”€â”€ */
    const pageNums = useMemo(() => {
        const arr = [];
        const maxShow = 7;
        if (totalPages <= maxShow) {
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

    /* â”€â”€ handlers â”€â”€ */
    const openAdd = () => { setAddBuf({ ...BLANK_INVOICE }); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);
    const saveAdd = () => {
        setData(prev => [...(prev || []), { id: nextId, ...addBuf, price: Number(addBuf.price) || 0 }]);
        setNextId(n => n + 1);
        setShowAdd(false);
    };

    const startEdit = (row) => { setEditId(row.id); setEditBuf({ ...row }); };
    const cancelEdit = () => setEditId(null);
    const saveEdit = () => {
        setData(prev => (prev || []).map(r => r.id === editId ? { ...editBuf, price: Number(editBuf.price) || 0 } : r));
        setEditId(null);
    };

    const handleDownload = (row) => {
        const content = [
            'INVOICE',
            '='.repeat(40),
            `Invoice No : ${row.invoiceNo || 'â€”'}`,
            `Name       : ${row.name || 'â€”'}`,
            `Email      : ${row.email || 'â€”'}`,
            `Phone      : ${row.phone || 'â€”'}`,
            `Country    : ${row.country || 'â€”'}`,
            `Price      : ${row.price}`,
            `Date       : ${row.date}`,
            `Txn ID     : ${row.txnId || 'â€”'}`,
            `Status     : ${row.status}`,
            '',
            'Details:',
            row.details || 'â€”',
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${row.invoiceNo || `invoice-${row.id}`}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* â”€â”€ field helpers â”€â”€ */
    const Field = ({ label, children }) => (
        <div className="inv-modal-field">
            <label className="inv-modal-label">{label}</label>
            {children}
        </div>
    );
    const Input = ({ value, onChange, placeholder, type = 'text' }) => (
        <input className="inv-modal-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
    );

    const modalOpen = showAdd;

    return (
        <div className="inv-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* â”€â”€ Page Header â”€â”€ */}
                <div className="inv-page-header">
                    <h1 className="inv-page-title">List of Invoices</h1>
                    <button id="inv-add-btn" className="inv-add-btn" onClick={openAdd}>
                        Add Invoice <Plus size={15} />
                    </button>
                </div>

                {/* â”€â”€ Card â”€â”€ */}
                <div className="inv-card">

                    {/* Toolbar */}
                    <div className="inv-toolbar">
                        <div className="inv-toolbar-left">
                            <span className="inv-entries-label">Show</span>
                            <select
                                className="inv-entries-select"
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                            >
                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="inv-entries-label">entries</span>
                        </div>

                        <div className="inv-toolbar-right">
                            <span className="inv-search-label">Search:</span>
                            <div className="inv-search-wrap">
                                <Search size={14} className="inv-search-icon" />
                                <input
                                    id="inv-search-input"
                                    className="inv-search-input"
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Filter recordsâ€¦"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="inv-table-wrap">
                        <table className="inv-table">
                            <thead>
                                <tr className="inv-thead-row">
                                    {[
                                        { label: 'Sno', w: 56 },
                                        { label: 'Invoice Number', w: 130 },
                                        { label: 'Name', w: 180 },
                                        { label: 'Details', w: 260 },
                                        { label: 'Price', w: 80 },
                                        { label: 'Date', w: 120 },
                                        { label: 'Transaction Id', w: 120 },
                                        { label: 'Download Invoice', w: 110 },
                                        { label: 'Status', w: 90 },
                                        { label: 'Edit', w: 60 },
                                    ].map(col => (
                                        <th key={col.label} className="inv-th" style={{ width: col.w }}>
                                            <div className="inv-th-inner">
                                                {col.label}
                                                {!['Download Invoice', 'Edit'].includes(col.label) && (
                                                    <ChevronsUpDown size={11} className="inv-sort-icon" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sliced.map((row, idx) => (
                                    editId === row.id ? (
                                        /* â”€â”€ Inline Edit Row â”€â”€ */
                                        <tr key={row.id} className="inv-tr inv-tr-editing">
                                            <td className="inv-td inv-center">{(safePage - 1) * pageSize + idx + 1}</td>
                                            <td className="inv-td"><input className="inv-cell-input" value={editBuf.invoiceNo} onChange={e => setEditBuf(p => ({ ...p, invoiceNo: e.target.value }))} /></td>
                                            <td className="inv-td"><input className="inv-cell-input" value={editBuf.name} onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} /></td>
                                            <td className="inv-td"><textarea className="inv-cell-input inv-cell-textarea" rows={3} value={editBuf.details} onChange={e => setEditBuf(p => ({ ...p, details: e.target.value }))} /></td>
                                            <td className="inv-td"><input className="inv-cell-input" type="number" value={editBuf.price} onChange={e => setEditBuf(p => ({ ...p, price: e.target.value }))} /></td>
                                            <td className="inv-td"><input className="inv-cell-input" value={editBuf.date} onChange={e => setEditBuf(p => ({ ...p, date: e.target.value }))} /></td>
                                            <td className="inv-td"><input className="inv-cell-input" value={editBuf.txnId} onChange={e => setEditBuf(p => ({ ...p, txnId: e.target.value }))} /></td>
                                            <td className="inv-td inv-center">
                                                <button className="inv-dl-btn" onClick={() => handleDownload(editBuf)} title="Download"><Download size={16} /></button>
                                            </td>
                                            <td className="inv-td">
                                                <select className="inv-cell-input" value={editBuf.status} onChange={e => setEditBuf(p => ({ ...p, status: e.target.value }))}>
                                                    <option>Pending</option>
                                                    <option>Paid</option>
                                                    <option>Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="inv-td inv-center">
                                                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                    <button className="inv-icon-btn inv-save-btn" onClick={saveEdit} title="Save"><Save size={14} /></button>
                                                    <button className="inv-icon-btn inv-cancel-btn" onClick={cancelEdit} title="Cancel"><X size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        /* â”€â”€ Read Row â”€â”€ */
                                        <tr key={row.id} className={`inv-tr${idx % 2 !== 0 ? ' inv-tr-alt' : ''}`}>
                                            <td className="inv-td inv-center">{(safePage - 1) * pageSize + idx + 1}</td>
                                            <td className="inv-td inv-invoice-no">{row.invoiceNo || 'â€”'}</td>
                                            <td className="inv-td inv-name">{row.name || ''}</td>
                                            <td className="inv-td inv-details">
                                                {row.details
                                                    ? row.details.split('\n').map((line, i) => <div key={i}>{line}</div>)
                                                    : ''}
                                            </td>
                                            <td className="inv-td inv-center inv-price">
                                                {row.price > 0 ? (
                                                    <span className="inv-price-link">{row.price}</span>
                                                ) : row.price === 0 ? (
                                                    <span className="inv-price-link">0</span>
                                                ) : ''}
                                            </td>
                                            <td className="inv-td inv-date">
                                                {row.date.split(' ').map((part, i) => <div key={i}>{part}</div>)}
                                            </td>
                                            <td className="inv-td inv-txn">{row.txnId || ''}</td>
                                            <td className="inv-td inv-center">
                                                <button className="inv-dl-btn" onClick={() => handleDownload(row)} title="Download Invoice">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                            <td className="inv-td">
                                                <span className={`inv-status-badge inv-status-${row.status.toLowerCase()}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="inv-td inv-center">
                                                <button className="inv-edit-btn" onClick={() => startEdit(row)} title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                ))}

                                {sliced.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="inv-empty-row">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="inv-pagination-bar">
                        <span className="inv-pagination-info">
                            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{' '}
                            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} entries
                        </span>
                        <div className="inv-pagination">
                            <button
                                className="inv-page-btn inv-page-prev"
                                disabled={safePage === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>

                            {pageNums.map((n, i) =>
                                n === 'â€¦' ? (
                                    <span key={`ellipsis-${i}`} className="inv-page-ellipsis">â€¦</span>
                                ) : (
                                    <button
                                        key={n}
                                        className={`inv-page-btn inv-page-num${safePage === n ? ' inv-page-active' : ''}`}
                                        onClick={() => setPage(n)}
                                    >
                                        {n}
                                    </button>
                                )
                            )}

                            <button
                                className="inv-page-btn inv-page-next"
                                disabled={safePage === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>  {/* end inv-card */}

            </div>  {/* end blur wrapper */}

            {/* â”€â”€ Add Invoice Modal â”€â”€ */}
            {showAdd && (
                <div className="inv-modal-overlay" onClick={closeAdd}>
                    <div className="inv-modal" onClick={e => e.stopPropagation()}>
                        <div className="inv-modal-header">
                            <div className="inv-modal-title">
                                <FileText size={18} />
                                <span>Add Invoice</span>
                            </div>
                            <button className="inv-modal-close" onClick={closeAdd}><X size={18} /></button>
                        </div>

                        <div className="inv-modal-body">
                            <div className="inv-modal-grid">
                                <Field label="Invoice Number">
                                    <Input value={addBuf.invoiceNo} onChange={e => setAddBuf(p => ({ ...p, invoiceNo: e.target.value }))} placeholder="INV-0001" />
                                </Field>
                                <Field label="Name">
                                    <Input value={addBuf.name} onChange={e => setAddBuf(p => ({ ...p, name: e.target.value }))} placeholder="Mr. John Doe" />
                                </Field>
                                <Field label="Email">
                                    <Input value={addBuf.email} type="email" onChange={e => setAddBuf(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                                </Field>
                                <Field label="Phone">
                                    <Input value={addBuf.phone} onChange={e => setAddBuf(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                                </Field>
                                <Field label="Country">
                                    <Input value={addBuf.country} onChange={e => setAddBuf(p => ({ ...p, country: e.target.value }))} placeholder="India" />
                                </Field>
                                <Field label="Price">
                                    <Input value={addBuf.price} type="number" onChange={e => setAddBuf(p => ({ ...p, price: e.target.value }))} placeholder="0" />
                                </Field>
                                <Field label="Transaction ID">
                                    <Input value={addBuf.txnId} onChange={e => setAddBuf(p => ({ ...p, txnId: e.target.value }))} placeholder="TXN-XXXX" />
                                </Field>
                                <Field label="Status">
                                    <select className="inv-modal-input" value={addBuf.status} onChange={e => setAddBuf(p => ({ ...p, status: e.target.value }))}>
                                        <option>Pending</option>
                                        <option>Paid</option>
                                        <option>Cancelled</option>
                                    </select>
                                </Field>
                            </div>
                            <Field label="Details">
                                <textarea
                                    className="inv-modal-input inv-modal-textarea"
                                    rows={4}
                                    value={addBuf.details}
                                    onChange={e => setAddBuf(p => ({ ...p, details: e.target.value }))}
                                    placeholder="Email&#10;Phone&#10;Country&#10;Speaker Registration : ..."
                                />
                            </Field>
                        </div>

                        <div className="inv-modal-footer">
                            <button className="inv-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="inv-modal-save" id="inv-modal-save-btn" onClick={saveAdd}>
                                <Save size={14} /> Save Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

