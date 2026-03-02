'use client';

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, GripVertical, Image as ImageIcon, Camera, Info } from 'lucide-react';

/* â”€â”€ blank form template â”€â”€ */
const BLANK = { name: '', file: null, photoUrl: '' };

/* â”€â”€ unique id helper â”€â”€ */
let _uid = 1;
const uid = () => _uid++;

export default function PreviousGlimpses() {
    const [rows, setRows] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);   // null = add mode
    const [form, setForm] = useState({ ...BLANK });
    const [dragIdx, setDragIdx] = useState(null);
    const [overIdx, setOverIdx] = useState(null);
    const fileRef = useRef(null);

    /* â”€â”€ file pick â”€â”€ */
    const pickFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setForm(p => ({ ...p, file: f, photoUrl: URL.createObjectURL(f) }));
        e.target.value = '';
    };

    /* â”€â”€ open add modal â”€â”€ */
    const openAdd = () => {
        setEditId(null);
        setForm({ ...BLANK });
        setShowModal(true);
    };

    /* â”€â”€ open edit modal â”€â”€ */
    const openEdit = (row) => {
        setEditId(row.id);
        setForm({ name: row.name, file: row.file || null, photoUrl: row.photoUrl || '' });
        setShowModal(true);
    };

    /* â”€â”€ close modal â”€â”€ */
    const closeModal = () => { setShowModal(false); setEditId(null); setForm({ ...BLANK }); };

    /* â”€â”€ save (add or edit) â”€â”€ */
    const handleSave = () => {
        if (!form.name.trim()) return;
        if (editId !== null) {
            setRows(p => p.map(r => r.id === editId ? { ...r, name: form.name, file: form.file, photoUrl: form.photoUrl } : r));
        } else {
            setRows(p => [...p, { id: uid(), name: form.name, file: form.file, photoUrl: form.photoUrl }]);
        }
        closeModal();
    };

    /* â”€â”€ delete â”€â”€ */
    const deleteRow = (id) => setRows(p => p.filter(r => r.id !== id));

    /* â”€â”€ drag-to-reorder â”€â”€ */
    const onDragStart = (idx) => setDragIdx(idx);
    const onDragEnter = (idx) => setOverIdx(idx);
    const onDragEnd = () => {
        if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
            setDragIdx(null); setOverIdx(null); return;
        }
        const next = [...rows];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(overIdx, 0, moved);
        setRows(next);
        setDragIdx(null);
        setOverIdx(null);
    };

    const modalOpen = showModal;

    return (
        <div className="ac2-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* â”€â”€ Page Header â”€â”€ */}
                <div className="ac2-page-header">
                    <div className="ac2-title-row">
                        <div className="ac2-title-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                            <Camera size={20} />
                        </div>
                        <div>
                            <h1 className="ac2-title">Previous Glimpses</h1>
                            <p className="ac2-subtitle">Manage historical event photos and speaker highlights</p>
                        </div>
                    </div>
                </div>

                {/* â”€â”€ Note banner (Using adapted professional styling) â”€â”€ */}
                <div className="pg2-pro-note">
                    <div className="pg2-note-icon-wrap"><Info size={16} /></div>
                    <div className="pg2-note-text">
                        <strong>Ordering Tip:</strong> You can sort the speakers or photos into any desired order by dragging and dropping the rows below.
                    </div>
                </div>

                {/* â”€â”€ Table Card â”€â”€ */}
                <div className="ac2-section-card">
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">Glimpse Gallery</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="ac2-section-badge">
                                <ImageIcon size={12} style={{ marginRight: 4 }} />
                                {rows.length} {rows.length === 1 ? 'record' : 'records'}
                            </span>
                            <button className="pg2-pro-add-btn" onClick={openAdd}>
                                <Plus size={14} /> Add Glimpse
                            </button>
                        </div>
                    </div>

                    <div className="ac2-table-wrap">
                        <table className="ac2-table">
                            <thead>
                                <tr className="ac2-thead-row">
                                    <th className="ac2-th" style={{ width: 80, textAlign: 'center' }}>Sno</th>
                                    <th className="ac2-th">Name</th>
                                    <th className="ac2-th" style={{ width: 140, textAlign: 'center' }}>Photo</th>
                                    <th className="ac2-th" style={{ width: 100, textAlign: 'center' }}>Edit</th>
                                    <th className="ac2-th" style={{ width: 100, textAlign: 'center' }}>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="ac2-empty">
                                            <Camera size={32} className="ac2-empty-icon" />
                                            <p>No previous glimpses uploaded yet. Click <strong>Add Glimpse</strong> to begin.</p>
                                        </td>
                                    </tr>
                                )}

                                {rows.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className={`ac2-tr pg2-draggable-tr${dragIdx === idx ? ' pg-dragging' : ''}${overIdx === idx && dragIdx !== idx ? ' pg-drag-over' : ''}`}
                                        draggable
                                        onDragStart={() => onDragStart(idx)}
                                        onDragEnter={() => onDragEnter(idx)}
                                        onDragEnd={onDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <td className="ac2-td" style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <span className="pg2-drag-grip" title="Drag to reorder"><GripVertical size={14} /></span>
                                                <span className="ac2-sno-chip">{idx + 1}</span>
                                            </div>
                                        </td>

                                        <td className="ac2-td" style={{ fontWeight: 500, color: '#1e293b' }}>
                                            {row.name}
                                        </td>

                                        <td className="ac2-td" style={{ textAlign: 'center' }}>
                                            {row.photoUrl
                                                ? <img src={row.photoUrl} alt={row.name} className="pg2-table-thumb" />
                                                : <span className="pg2-no-thumb"><ImageIcon size={16} /></span>
                                            }
                                        </td>

                                        <td className="ac2-td" style={{ textAlign: 'center' }}>
                                            <button className="pg2-action-btn pg2-btn-edit" onClick={() => openEdit(row)} title="Edit Row">
                                                <Pencil size={14} />
                                            </button>
                                        </td>

                                        <td className="ac2-td" style={{ textAlign: 'center' }}>
                                            <button className="pg2-action-btn pg2-btn-del" onClick={() => deleteRow(row.id)} title="Delete Row">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {rows.length > 0 && (
                        <div className="ac2-table-footer">
                            <span className="ac2-row-count" style={{ marginLeft: 'auto' }}>
                                Showing 1 to {rows.length} of {rows.length} entries
                            </span>
                        </div>
                    )}
                </div>  {/* end ac2-section-card */}

            </div>  {/* end blur wrapper */}

            {/* â”€â”€ Add / Edit Modal (Professional Redesign) â”€â”€ */}
            {showModal && (
                <div className="pg2-modal-overlay" onClick={closeModal}>
                    <div className="pg2-modal-card" onClick={e => e.stopPropagation()}>

                        <div className="pg2-modal-head">
                            <div className="pg2-modal-title">
                                <Camera size={18} style={{ opacity: 0.7 }} />
                                {editId !== null ? 'Edit Previous Glimpse' : 'Add Previous Glimpse'}
                            </div>
                            <button className="pg2-modal-close" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="pg2-modal-body">
                            <div className="pg2-field-group">
                                <label className="pg2-label">Name <span className="pg2-req">*</span></label>
                                <input
                                    className="pg2-input"
                                    type="text"
                                    placeholder="e.g. RENEWABLEMEET 2025 Rome Highlights"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>

                            <div className="pg2-field-group">
                                <label className="pg2-label">Photo Image</label>
                                <div className="pg2-upload-area">
                                    {form.photoUrl ? (
                                        <div className="pg2-preview-box">
                                            <img src={form.photoUrl} alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="pg2-empty-box">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}
                                    <div className="pg2-upload-controls">
                                        <p className="pg2-upload-hint">Upload a high-quality venue or speaker photo.</p>
                                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickFile} />
                                        <button className="pg2-upload-btn" onClick={() => fileRef.current.click()}>
                                            <Plus size={14} /> Choose Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pg2-modal-foot">
                            <button className="pg2-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="pg2-btn-save" onClick={handleSave} disabled={!form.name.trim()}>
                                <Save size={15} /> {editId !== null ? 'Save Changes' : 'Upload Glimpse'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

