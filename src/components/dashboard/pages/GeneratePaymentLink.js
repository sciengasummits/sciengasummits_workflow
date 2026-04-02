'use client';

import { useState } from 'react';
import { Link2, Plus, Pencil, Trash2, X, Save, Copy, ExternalLink, IndianRupee, DollarSign } from 'lucide-react';

const BLANK = { usd: '', inr: '', link: '' };
let _uid = 1;
const uid = () => _uid++;

export default function GeneratePaymentLink() {
    const [rows, setRows] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ ...BLANK });
    const [copied, setCopied] = useState(null);
    const [toast, setToast] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    const openAdd = () => {
        setEditId(null);
        setForm({ ...BLANK });
        setShowModal(true);
    };

    const openEdit = (row) => {
        setEditId(row.id);
        setForm({ usd: row.usd, inr: row.inr, link: row.link });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setForm({ ...BLANK });
    };

    const handleSave = () => {
        if (!form.usd || !form.inr) return;
        if (editId !== null) {
            setRows(prev => (prev || []).map(r => r.id === editId ? { ...r, ...form } : r));
            showToast('Payment link updated!');
        } else {
            const generatedLink = `https://sciengasummits.com/pay?amt=${form.inr}&cur=INR&ref=REG-${Date.now()}`;
            setRows(prev => [...(prev || []), { id: uid(), ...form, link: form.link || generatedLink }]);
            showToast('Payment link added!');
        }
        closeModal();
    };

    const handleDelete = (id) => {
        setRows(prev => (prev || []).filter(r => r.id !== id));
        showToast('Entry deleted.');
    };

    const handleCopy = (link, id) => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(id);
            setTimeout(() => setCopied(null), 1800);
        });
    };

    const canSave = form.usd.trim() && form.inr.trim();

    const modalOpen = showModal;

    return (
        <div className="ac2-page">
            {/* Toast stays unblurred */}
            {toast && <div className="gpl-toast">{toast}</div>}

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* Page Header */}
                <div className="ac2-page-header">
                    <div className="ac2-title-row">
                        <div className="ac2-title-icon" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                            <Link2 size={20} />
                        </div>
                        <div>
                            <h1 className="ac2-title">Generate Payment Link</h1>
                            <p className="ac2-subtitle">List of INR / USD â€” Registration links can be generated in Indian Rupees Only</p>
                        </div>
                    </div>
                </div>

                {/* Section Card */}
                <div className="ac2-section-card">
                    {/* Card Header */}
                    <div className="gpl-card-head">
                        <div className="gpl-head-left">
                            <span className="gpl-head-title">REGISTRATION LINKS</span>
                            <span className="gpl-count-chip">
                                <Link2 size={12} /> {rows.length} records
                            </span>
                        </div>
                        <button className="gpl-add-btn" onClick={openAdd}>
                            <Plus size={15} />
                            Add Registration-Inr
                        </button>
                    </div>

                    {/* Table */}
                    <div className="gpl-table-wrap">
                        <table className="gpl-table">
                            <thead>
                                <tr className="gpl-thead-row">
                                    <th className="gpl-th" style={{ width: 70 }}>Sno</th>
                                    <th className="gpl-th" style={{ width: 120 }}>
                                        <div className="gpl-th-inner"><DollarSign size={13} /> USD</div>
                                    </th>
                                    <th className="gpl-th" style={{ width: 120 }}>
                                        <div className="gpl-th-inner"><IndianRupee size={13} /> INR</div>
                                    </th>
                                    <th className="gpl-th">Registration Link</th>
                                    <th className="gpl-th" style={{ width: 110 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="gpl-empty">
                                            <div className="gpl-empty-inner">
                                                <Link2 size={28} className="gpl-empty-icon" />
                                                <p>No records to show.<br />Click <strong>Add Registration-Inr</strong> to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr key={row.id} className="gpl-tr">
                                            <td className="gpl-td gpl-text-center">{idx + 1}</td>
                                            <td className="gpl-td gpl-text-center">
                                                <span className="gpl-usd-chip">${row.usd}</span>
                                            </td>
                                            <td className="gpl-td gpl-text-center">
                                                <span className="gpl-inr-chip">â‚¹{row.inr}</span>
                                            </td>
                                            <td className="gpl-td">
                                                <div className="gpl-link-cell">
                                                    <a href={row.link} target="_blank" rel="noopener noreferrer" className="gpl-link-text">
                                                        {row.link}
                                                    </a>
                                                    <div className="gpl-link-actions">
                                                        <button
                                                            className={`gpl-copy-btn ${copied === row.id ? 'gpl-copied' : ''}`}
                                                            onClick={() => handleCopy(row.link, row.id)}
                                                            title="Copy link"
                                                        >
                                                            <Copy size={13} />
                                                            {copied === row.id ? 'Copied!' : 'Copy'}
                                                        </button>
                                                        <a href={row.link} target="_blank" rel="noopener noreferrer" className="gpl-open-btn" title="Open link">
                                                            <ExternalLink size={13} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="gpl-td gpl-text-center">
                                                <div className="gpl-action-btns">
                                                    <button className="gpl-icon-btn gpl-edit-btn" onClick={() => openEdit(row)} title="Edit">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button className="gpl-icon-btn gpl-del-btn" onClick={() => handleDelete(row.id)} title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {rows.length > 0 && (
                        <div className="gpl-footer">Showing {rows.length} record{rows.length !== 1 ? 's' : ''}</div>
                    )}
                </div>  {/* end ac2-section-card */}

            </div>  {/* end blur wrapper */}

            {/* Modal */}
            {showModal && (
                <div className="gpl-overlay" onClick={closeModal}>
                    <div className="gpl-modal" onClick={e => e.stopPropagation()}>
                        <div className="gpl-modal-head">
                            <div className="gpl-modal-title">
                                <div className="gpl-modal-icon">
                                    <Link2 size={16} />
                                </div>
                                {editId !== null ? 'Edit Registration Link' : 'Add Registration-Inr'}
                            </div>
                            <button className="gpl-modal-close" onClick={closeModal}><X size={16} /></button>
                        </div>

                        <div className="gpl-modal-body">
                            {/* USD */}
                            <div className="gpl-field">
                                <label className="gpl-label">USD Amount <span className="gpl-req">*</span></label>
                                <div className="gpl-input-wrap">
                                    <span className="gpl-input-prefix">$</span>
                                    <input
                                        type="number"
                                        className="gpl-input gpl-input-prefixed"
                                        placeholder="e.g. 250"
                                        value={form.usd}
                                        onChange={e => setForm(f => ({ ...f, usd: e.target.value }))}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* INR */}
                            <div className="gpl-field">
                                <label className="gpl-label">INR Amount <span className="gpl-req">*</span></label>
                                <div className="gpl-input-wrap">
                                    <span className="gpl-input-prefix">â‚¹</span>
                                    <input
                                        type="number"
                                        className="gpl-input gpl-input-prefixed"
                                        placeholder="e.g. 20000"
                                        value={form.inr}
                                        onChange={e => setForm(f => ({ ...f, inr: e.target.value }))}
                                        min="0"
                                    />
                                </div>
                                <p className="gpl-helper">Registration links are generated in Indian Rupees only.</p>
                            </div>

                            {/* Custom link override */}
                            <div className="gpl-field">
                                <label className="gpl-label">Custom Registration Link <span className="gpl-optional">(Optional)</span></label>
                                <div className="gpl-input-wrap">
                                    <span className="gpl-input-prefix"><Link2 size={13} /></span>
                                    <input
                                        type="url"
                                        className="gpl-input gpl-input-prefixed"
                                        placeholder="Leave blank to auto-generate"
                                        value={form.link}
                                        onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                                    />
                                </div>
                                <p className="gpl-helper">If left blank, a link will be auto-generated from the INR amount.</p>
                            </div>
                        </div>

                        <div className="gpl-modal-foot">
                            <button className="gpl-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="gpl-btn-save" onClick={handleSave} disabled={!canSave}>
                                <Save size={15} />
                                {editId !== null ? 'Update Link' : 'Generate Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

