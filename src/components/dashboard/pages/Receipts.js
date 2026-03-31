'use client';

import { useState, useMemo } from 'react';
import {
    Download,
    Search,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    X,
} from 'lucide-react';

/* â”€â”€ Mock data (mirrors reference screenshots) â”€â”€ */
const INITIAL_DATA = [
    {
        id: 1,
        invoiceNo: 'PM212248386',
        name: 'Dr.Mohamad Maulana Magiman',
        email: 'mdmaulana@upm.edu.my',
        phone: '',
        country: 'Malaysia',
        details: 'mdmaulana@upm.edu.my\nMalaysia\nRegistration For RENEWABLEMEET2026 BANK PAYMENT',
        price: 314,
        date: '2026-01-27 12:22:00',
        txnId: '(Bank)',
    },
    {
        id: 2,
        invoiceNo: 'PM212248326',
        name: 'Mr. Edward Eastlack',
        email: 'edward.eastlack@intermodalrenewables.com',
        phone: '5044322785',
        country: 'United States',
        details: 'edward.eastlack@intermodalrenewables.com\n5044322785\nUnited States\nSpeaker Registration : 849\nAccommodation :\nAccompanying Person :',
        price: 892,
        date: '2026-01-17 01:46:42',
        txnId: '()',
    },
    {
        id: 3,
        invoiceNo: 'PM212248131',
        name: 'Dr. Fauziah Abu Bakar',
        email: 'ab_fauziah@upm.edu.my',
        phone: '',
        country: 'Malaysia',
        details: 'ab_fauziah@upm.edu.my\nMalaysia\nRegistration For RENEWABLEMEET2026 BANK PAYMENT',
        price: 786.45,
        date: '2025-12-26 13:06:00',
        txnId: '(Bank)',
    },
    {
        id: 4,
        invoiceNo: 'ACME202547252',
        name: 'Dr. Dr. Yousif Abdelrahim',
        email: 'yabdelrahim@pmu.edu.sa',
        phone: '+966546388526',
        country: 'Saudi Arabia',
        details: 'yabdelrahim@pmu.edu.sa\n+966546388526\nSaudi Arabia\nKeynote Speaker',
        price: 209,
        date: '2025-10-24 12:35:16',
        txnId: 'pi_3SLf4KSEFv0tA9kn1b1hUjxt (Stripe)',
    },
    {
        id: 5,
        invoiceNo: 'PM212246635',
        name: 'Dr. Xi Jiang',
        email: 'xi.jiang@qmul.ac.uk',
        phone: '07941370976',
        country: 'United Kingdom',
        details: 'xi.jiang@qmul.ac.uk\n07941370976\nUnited Kingdom\nSpeaker Registration : 749\nAccommodation : 600\nAccompanying Person :',
        price: 1417,
        date: '2025-09-09 13:44:39',
        txnId: '()',
    },
    {
        id: 6,
        invoiceNo: 'PM212246367',
        name: 'Dr. Kenji Murakami',
        email: 'murakami.kenji@shizuoka.ac.jp',
        phone: '+81 8016191131',
        country: 'Japan',
        details: 'murakami.kenji@shizuoka.ac.jp\n+81 8016191131\nJapan\ncredit card',
        price: 1204,
        date: '2025-08-19 08:57:04',
        txnId: '()',
    },
    {
        id: 7,
        invoiceNo: 'ACME202546147',
        name: 'Dr. Jaroslav',
        email: 'ummsjerz@savba.sk',
        phone: '+421905746553',
        country: 'Slovak Republic',
        details: 'ummsjerz@savba.sk\n+421905746553\nSlovak Republic\nKeynote Speaker Â· In-person Speaker Participation',
        price: 629,
        date: '2025-08-05 14:13:44',
        txnId: 'pi_3RsgV2GmcWqqMjf904EXBk7G (Stripe)',
    },
];

const REFUND_CATEGORIES = [
    'Select Category',
    'Duplicate Payment',
    'Event Cancelled',
    'Speaker Withdrawal',
    'Overpayment',
    'Technical Error',
    'Other',
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function Receipts() {
    const [data] = useState(INITIAL_DATA);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    /* refund modal */
    const [refundRow, setRefundRow] = useState(null);
    const [refundCat, setRefundCat] = useState('Select Category');
    const [refundReason, setRefundReason] = useState('');

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

    /* â”€â”€ download receipt â”€â”€ */
    const handleDownload = (row) => {
        const content = [
            'RECEIPT',
            '='.repeat(40),
            `Invoice No  : ${row.invoiceNo}`,
            `Name        : ${row.name}`,
            `Email       : ${row.email}`,
            `Country     : ${row.country}`,
            `Price       : ${row.price}`,
            `Date        : ${row.date}`,
            `Transaction : ${row.txnId}`,
            '',
            'Details:',
            row.details,
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${row.invoiceNo}-receipt.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* â”€â”€ refund modal â”€â”€ */
    const openRefund = (row) => { setRefundRow(row); setRefundCat('Select Category'); setRefundReason(''); };
    const closeRefund = () => setRefundRow(null);
    const submitRefund = () => {
        if (refundCat === 'Select Category') {
            alert('Please select a category.');
            return;
        }
        alert(`Refund submitted for ${refundRow.invoiceNo}\nCategory: ${refundCat}\nReason: ${refundReason}`);
        closeRefund();
    };

    const modalOpen = !!refundRow;

    return (
        <div className="rcp-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* â”€â”€ Page Header â”€â”€ */}
                <div className="rcp-page-header">
                    <h1 className="rcp-page-title">List of Receipts</h1>
                </div>

                {/* â”€â”€ Card â”€â”€ */}
                <div className="rcp-card">

                    {/* Toolbar */}
                    <div className="rcp-toolbar">
                        <div className="rcp-toolbar-left">
                            <span className="rcp-entries-label">Show</span>
                            <select
                                className="rcp-entries-select"
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                            >
                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="rcp-entries-label">entries</span>
                        </div>

                        <div className="rcp-toolbar-right">
                            <span className="rcp-search-label">Search:</span>
                            <div className="rcp-search-wrap">
                                <Search size={14} className="rcp-search-icon" />
                                <input
                                    id="rcp-search-input"
                                    className="rcp-search-input"
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Filter recordsâ€¦"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rcp-table-wrap">
                        <table className="rcp-table">
                            <thead>
                                <tr className="rcp-thead-row">
                                    {[
                                        { label: 'SNO', w: 56 },
                                        { label: 'Invoice Number', w: 140 },
                                        { label: 'Name', w: 180 },
                                        { label: 'Details', w: 280 },
                                        { label: 'Price', w: 80 },
                                        { label: 'Date', w: 120 },
                                        { label: 'Transaction Id', w: 200 },
                                        { label: 'Download Receipt', w: 110 },
                                        { label: 'Issue Refund', w: 90 },
                                    ].map(col => (
                                        <th key={col.label} className="rcp-th" style={{ width: col.w }}>
                                            <div className="rcp-th-inner">
                                                {col.label}
                                                {!['Download Receipt', 'Issue Refund'].includes(col.label) && (
                                                    <ChevronsUpDown size={11} className="rcp-sort-icon" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sliced.map((row, idx) => (
                                    <tr key={row.id} className={`rcp-tr${idx % 2 !== 0 ? ' rcp-tr-alt' : ''}`}>
                                        <td className="rcp-td rcp-center">{(safePage - 1) * pageSize + idx + 1}</td>
                                        <td className="rcp-td rcp-invoice-no">{row.invoiceNo}</td>
                                        <td className="rcp-td rcp-name">{row.name}</td>
                                        <td className="rcp-td rcp-details">
                                            {row.details.split('\n').map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                        </td>
                                        <td className="rcp-td rcp-center rcp-price">{row.price}</td>
                                        <td className="rcp-td rcp-date">
                                            {row.date.split(' ').map((part, i) => <div key={i}>{part}</div>)}
                                        </td>
                                        <td className="rcp-td rcp-txn">{row.txnId}</td>

                                        {/* Download Receipt */}
                                        <td className="rcp-td rcp-center">
                                            <button
                                                className="rcp-dl-btn"
                                                onClick={() => handleDownload(row)}
                                                title="Download Receipt"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </td>

                                        {/* Issue Refund */}
                                        <td className="rcp-td rcp-center">
                                            <button
                                                className="rcp-refund-btn"
                                                onClick={() => openRefund(row)}
                                                title="Issue Refund"
                                            >
                                                <RotateCcw size={13} />
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {sliced.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="rcp-empty-row">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="rcp-pagination-bar">
                        <span className="rcp-pagination-info">
                            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{' '}
                            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} entries
                        </span>
                        <div className="rcp-pagination">
                            <button
                                className="rcp-page-btn rcp-page-prev"
                                disabled={safePage === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>

                            {pageNums.map((n, i) =>
                                n === 'â€¦' ? (
                                    <span key={`ellipsis-${i}`} className="rcp-page-ellipsis">â€¦</span>
                                ) : (
                                    <button
                                        key={n}
                                        className={`rcp-page-btn rcp-page-num${safePage === n ? ' rcp-page-active' : ''}`}
                                        onClick={() => setPage(n)}
                                    >
                                        {n}
                                    </button>
                                )
                            )}

                            <button
                                className="rcp-page-btn rcp-page-next"
                                disabled={safePage === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>  {/* end rcp-card */}

            </div>  {/* end blur wrapper */}

            {/* â”€â”€ Issue Refund Modal â”€â”€ */}
            {refundRow && (
                <div className="rcp-modal-overlay" onClick={closeRefund}>
                    <div className="rcp-modal" onClick={e => e.stopPropagation()}>

                        {/* Close */}
                        <button className="rcp-modal-close" onClick={closeRefund} title="Close">
                            <X size={18} />
                        </button>

                        <div className="rcp-modal-body">
                            {/* LEFT â€” Refunds mini table */}
                            <div className="rcp-modal-left">
                                <h2 className="rcp-modal-section-title">Refunds</h2>
                                <div className="rcp-mini-table-wrap">
                                    <table className="rcp-mini-table">
                                        <thead>
                                            <tr className="rcp-mini-thead">
                                                <th className="rcp-mini-th" style={{ width: 50 }}>SNO</th>
                                                <th className="rcp-mini-th" style={{ width: 120 }}>Invoice Number</th>
                                                <th className="rcp-mini-th" style={{ width: 160 }}>Name</th>
                                                <th className="rcp-mini-th">Details</th>
                                                <th className="rcp-mini-th" style={{ width: 70 }}>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="rcp-mini-tr">
                                                <td className="rcp-mini-td rcp-center">1</td>
                                                <td className="rcp-mini-td rcp-mini-inv">{refundRow.invoiceNo}</td>
                                                <td className="rcp-mini-td rcp-mini-name">{refundRow.name}</td>
                                                <td className="rcp-mini-td rcp-mini-detail">{refundRow.email}</td>
                                                <td className="rcp-mini-td rcp-center">{refundRow.price}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* RIGHT â€” Category + Reason */}
                            <div className="rcp-modal-right">
                                <h2 className="rcp-modal-section-title">Select Category</h2>

                                <div className="rcp-modal-field">
                                    <select
                                        className="rcp-modal-select"
                                        value={refundCat}
                                        onChange={e => setRefundCat(e.target.value)}
                                    >
                                        {REFUND_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="rcp-modal-field">
                                    <label className="rcp-modal-label">Reason:</label>
                                    <textarea
                                        className="rcp-modal-textarea"
                                        rows={5}
                                        value={refundReason}
                                        onChange={e => setRefundReason(e.target.value)}
                                        placeholder="Describe the reason for refundâ€¦"
                                    />
                                </div>

                                <div className="rcp-modal-actions">
                                    <button className="rcp-modal-submit" onClick={submitRefund}>Submit</button>
                                    <button className="rcp-modal-reset" onClick={() => { setRefundCat('Select Category'); setRefundReason(''); }}>Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

