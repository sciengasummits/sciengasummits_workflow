'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Pencil, Trash2, Plus, X, GripVertical, Info,
    Search, ChevronLeft, ChevronRight, Upload, User,
    Save, CheckCircle, AlertCircle, RefreshCw, Database
} from 'lucide-react';
import { getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker, uploadImage } from '@/lib/api';

/* â”€â”€â”€ Avatar helpers â”€â”€â”€ */
const AVATAR_COLORS = [
    { bg: '#fee2e2', color: '#b91c1c' },
    { bg: '#dbeafe', color: '#1d4ed8' },
    { bg: '#f3e8ff', color: '#7e22ce' },
    { bg: '#dcfce7', color: '#15803d' },
    { bg: '#fef3c7', color: '#b45309' },
];

function getInitials(name = '') {
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '');
    const parts = clean.split(' ').filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SpeakerAvatar({ speaker, index, size = 48 }) {
    const col = AVATAR_COLORS[index % AVATAR_COLORS.length];
    if (speaker.image) {
        return (
            <img
                src={speaker.image}
                alt={speaker.name}
                className="sp-photo"
                style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }}
                onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
        );
    }
    return (
        <div className="sp-avatar" style={{ width: size, height: size, background: col.bg, color: col.color, fontSize: size * 0.3 }}>
            {getInitials(speaker.name)}
        </div>
    );
}

const EMPTY_FORM = { name: '', title: '', affiliation: '', country: '', bio: '', image: null };
const PAGE_SIZE_OPTS = [5, 10, 25, 50];

/**
 * SpeakerPage â€” full CRUD with backend + image upload
 * @prop {string} title         â€” page heading
 * @prop {string} addLabel      â€” add button label
 * @prop {string} accentColor   â€” accent hex colour
 * @prop {string} dbCategory    â€” exact category string stored in MongoDB
 * @prop {Array}  initialSpeakers â€” fallback seed data shown before backend loads
 */
export default function SpeakerPage({
    title = 'Speakers',
    addLabel = 'Add Speaker',
    accentColor = '#6366f1',
    dbCategory = 'Delegate',
    initialSpeakers = [],
}) {
    const [speakers, setSpeakers] = useState(initialSpeakers);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);       // modal save spinner
    const [dbStatus, setDbStatus] = useState(null);        // 'saving' | 'saved' | 'error'
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const dragIdx = useRef(null);
    const overIdx = useRef(null);
    const fileRef = useRef(null);

    /* â”€â”€â”€ Load from backend â”€â”€â”€ */
    const loadSpeakers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSpeakers();
            const filtered = data.filter(s => s.category === dbCategory);
            setSpeakers(filtered.length > 0 ? filtered : initialSpeakers);
        } catch {
            // Keep seed data on error
        } finally {
            setLoading(false);
        }
    }, [dbCategory]); // eslint-disable-line

    useEffect(() => { loadSpeakers(); }, [loadSpeakers]);

    /* â”€â”€â”€ Drag-to-sort â”€â”€â”€ */
    const onDragStart = (i) => { dragIdx.current = i; };
    const onDragEnter = (i) => { overIdx.current = i; };
    const onDragEnd = () => {
        const from = dragIdx.current, to = overIdx.current;
        if (from === null || to === null || from === to) { dragIdx.current = overIdx.current = null; return; }
        const arr = [...speakers];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        setSpeakers(arr);
        dragIdx.current = overIdx.current = null;
    };

    /* â”€â”€â”€ Filtering & Pagination â”€â”€â”€ */
    const filtered = speakers.filter(s =>
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.affiliation || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.country || '').toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
    const start = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
    const end = Math.min(safePage * pageSize, filtered.length);

    /* â”€â”€â”€ Image upload â”€â”€â”€ */
    const handlePhotoChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: Limit 2MB, formats jpg, png, jpeg
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            alert('Invalid file format. Please upload JPG, PNG or JPEG.');
            e.target.value = '';
            return;
        }

        if (file.size > maxSize) {
            alert('File size exceeds 2MB limit.');
            e.target.value = '';
            return;
        }

        // Show local preview instantly
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
        // Upload to backend
        setUploading(true);
        try {
            const result = await uploadImage(file);
            setForm(f => ({ ...f, image: result.url }));
            setImagePreview(result.url);
        } catch {
            // Keep local preview as fallback
            setForm(f => ({ ...f, image: URL.createObjectURL(file) }));
        } finally {
            setUploading(false);
        }
    }, []);

    /* â”€â”€â”€ Modal helpers â”€â”€â”€ */
    const openAdd = () => {
        setForm(EMPTY_FORM);
        setImagePreview(null);
        setModal({ mode: 'add' });
    };
    const openEdit = (s) => {
        setForm({
            name: s.name || '',
            title: s.title || '',
            affiliation: s.affiliation || '',
            country: s.country || '',
            bio: s.bio || '',
            image: s.image || null,
        });
        setImagePreview(s.image || null);
        setModal({ mode: 'edit', id: s._id || s.id });
    };
    const closeModal = () => { setModal(null); setImagePreview(null); };

    /* â”€â”€â”€ Save (create / update) to MongoDB â”€â”€â”€ */
    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        const payload = { ...form, category: dbCategory };
        try {
            if (modal.mode === 'add') {
                const created = await createSpeaker(payload);
                setSpeakers(prev => [...prev, created]);
            } else {
                const updated = await updateSpeaker(modal.id, payload);
                setSpeakers(prev => prev.map(s => (s._id || s.id) === modal.id ? updated : s));
            }
            closeModal();
        } catch (err) {
            alert('Error saving speaker: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    /* â”€â”€â”€ Delete from MongoDB â”€â”€â”€ */
    const confirmDelete = (id) => setDeleteId(id);
    const handleDelete = async () => {
        try {
            await deleteSpeaker(deleteId);
            setSpeakers(prev => prev.filter(s => (s._id || s.id) !== deleteId));
        } catch (err) {
            alert('Error deleting speaker: ' + err.message);
        } finally {
            setDeleteId(null);
        }
    };

    /* â”€â”€â”€ Save ALL (bulk â€” used when re-ordering via drag) â”€â”€â”€ */
    const saveAllToDb = async () => {
        setDbStatus('saving');
        try {
            // For each speaker without a _id (seed data), create it; otherwise update order
            for (let i = 0; i < speakers.length; i++) {
                const s = speakers[i];
                const payload = { ...s, category: dbCategory, order: i };
                if (s._id) {
                    await updateSpeaker(s._id, payload);
                } else {
                    const created = await createSpeaker(payload);
                    setSpeakers(prev => prev.map((sp, idx) => idx === i ? created : sp));
                }
            }
            setDbStatus('saved');
            setTimeout(() => setDbStatus(null), 3000);
        } catch {
            setDbStatus('error');
            setTimeout(() => setDbStatus(null), 4000);
        }
    };

    const modalOpen = !!modal || !!deleteId;

    /* â”€â”€â”€ Render â”€â”€â”€ */
    return (
        <div className="sp-page">

            {/* â”€â”€ Blurred layer â”€â”€ */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s' }}>

                {/* Header */}
                <div className="sp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <h1 className="sp-title">List of {title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* DB status badge */}
                        {dbStatus === 'saved' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <CheckCircle size={14} /> Saved to Database!
                            </div>
                        )}
                        {dbStatus === 'error' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <AlertCircle size={14} /> Save Failed
                            </div>
                        )}
                        {/* Refresh */}
                        <button
                            onClick={loadSpeakers}
                            title="Refresh from database"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                        {/* Save to DB */}
                        <button
                            onClick={saveAllToDb}
                            disabled={dbStatus === 'saving'}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: `0 4px 14px ${accentColor}44` }}
                        >
                            {dbStatus === 'saving'
                                ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                : <Database size={14} />}
                            Save to Database
                        </button>
                    </div>
                </div>

                {/* Hint */}
                <div className="sp-hint">
                    <Info size={15} className="sp-hint-icon" />
                    <span><strong>Note:</strong> Drag &amp; drop rows to reorder. Click <strong>Save to Database</strong> to persist order changes. Individual add/edit/delete are saved instantly.</span>
                </div>

                {/* Toolbar */}
                <div className="sp-toolbar">
                    <button
                        className="sp-add-btn"
                        onClick={openAdd}
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
                    >
                        <Plus size={16} /> {addLabel}
                    </button>
                </div>

                {/* Loading spinner */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '14px' }}>Loading from databaseâ€¦</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Controls */}
                        <div className="sp-controls">
                            <div className="sp-show-entries">
                                <span>Show</span>
                                <select className="sp-entries-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                    {PAGE_SIZE_OPTS.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="sp-search-wrap">
                                <Search size={14} className="sp-search-icon" />
                                <input className="sp-search-input" placeholder="Searchâ€¦" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="sp-table-wrap">
                            <table className="sp-table">
                                <thead>
                                    <tr>
                                        <th className="sp-th sp-th-sno">Sno</th>
                                        <th className="sp-th sp-th-name">Name</th>
                                        <th className="sp-th sp-th-affil">Title / Affiliation</th>
                                        <th className="sp-th sp-th-photo">Photo</th>
                                        <th className="sp-th sp-th-bio">Biography</th>
                                        <th className="sp-th sp-th-action">Edit</th>
                                        <th className="sp-th sp-th-action">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="sp-empty">
                                                No {title.toLowerCase()} found. Click <strong>{addLabel}</strong> to add one.
                                            </td>
                                        </tr>
                                    ) : paginated.map((s, i) => {
                                        const globalIdx = speakers.indexOf(s);
                                        const rowIdx = (safePage - 1) * pageSize + i;
                                        return (
                                            <tr
                                                key={s._id || s.id || i}
                                                className={`sp-tr${rowIdx % 2 !== 0 ? ' sp-tr-even' : ''}`}
                                                draggable
                                                onDragStart={() => onDragStart(globalIdx)}
                                                onDragEnter={() => onDragEnter(globalIdx)}
                                                onDragEnd={onDragEnd}
                                                onDragOver={e => e.preventDefault()}
                                            >
                                                <td className="sp-td sp-td-sno">
                                                    <span className="sp-drag-handle"><GripVertical size={14} /></span>
                                                    {rowIdx + 1}
                                                </td>
                                                <td className="sp-td sp-td-name">
                                                    <span className="sp-name-link">{s.name}</span>
                                                </td>
                                                <td className="sp-td sp-td-affil">
                                                    {s.title && <div style={{ fontWeight: 600, fontSize: '12px', color: accentColor, marginBottom: '2px' }}>{s.title}</div>}
                                                    <div>{s.affiliation}</div>
                                                    {s.country && <div className="sp-country">{s.country}</div>}
                                                </td>
                                                <td className="sp-td sp-td-photo">
                                                    <SpeakerAvatar speaker={s} index={globalIdx} size={72} />
                                                </td>
                                                <td className="sp-td sp-td-bio">
                                                    <div className="sp-bio-preview">{s.bio || 'â€”'}</div>
                                                </td>
                                                <td className="sp-td sp-td-action">
                                                    <button className="sp-icon-btn edit" onClick={() => openEdit(s)} title="Edit"><Pencil size={15} /></button>
                                                </td>
                                                <td className="sp-td sp-td-action">
                                                    <button className="sp-icon-btn delete" onClick={() => confirmDelete(s._id || s.id)} title="Delete"><Trash2 size={15} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="sp-pagination-bar">
                            <span className="sp-entries-info">
                                {filtered.length === 0 ? 'No entries found' : `Showing ${start} to ${end} of ${filtered.length} entries`}
                            </span>
                            <div className="sp-pagination">
                                <button className="sp-page-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} className={`sp-page-num${p === safePage ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                ))}
                                <button className="sp-page-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Bottom save button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingBottom: '8px' }}>
                            <button
                                onClick={saveAllToDb}
                                disabled={dbStatus === 'saving'}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: `0 4px 18px ${accentColor}44` }}
                            >
                                {dbStatus === 'saving'
                                    ? <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                    : <Save size={15} />}
                                Save All to Database
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* â”€â”€ Add / Edit Modal â”€â”€ */}
            {modal && (
                <div className="sp-modal-overlay" onClick={closeModal}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">
                                {modal.mode === 'add' ? addLabel : `Edit Speaker`}
                            </h2>
                            <button className="sp-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">

                            {/* Photo upload */}
                            <div className="sp-photo-upload-section">
                                <div
                                    className="sp-photo-preview"
                                    onClick={() => fileRef.current?.click()}
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                >
                                    {imagePreview
                                        ? <img src={imagePreview} alt="preview" className="sp-photo-preview-img" style={{ objectFit: 'cover' }} />
                                        : <div className="sp-photo-placeholder">
                                            <User size={28} color="#94a3b8" />
                                            <span>Upload Photo</span>
                                        </div>
                                    }
                                    {uploading && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                                            <div style={{ width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                                <button className="sp-upload-btn" onClick={() => fileRef.current?.click()}>
                                    <Upload size={14} /> {uploading ? 'Uploading…' : 'Choose Photo'}
                                </button>
                                <p style={{ color: 'red', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                                    * Image size limit: 2MB (JPG, PNG, JPEG)
                                </p>
                                {form.image && !uploading && (
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#10b981', textAlign: 'center' }}>
                                        ✔ Image uploaded to server
                                    </p>
                                )}
                            </div>

                            <label className="sp-label">Full Name <span className="sp-req">*</span></label>
                            <input className="sp-input" placeholder="e.g. Dr. Jane Smith"
                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

                            <label className="sp-label">Title / Role</label>
                            <input className="sp-input" placeholder="e.g. Professor of Fluid Mechanics"
                                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

                            <label className="sp-label">Affiliation</label>
                            <input className="sp-input" placeholder="e.g. MIT, USA"
                                value={form.affiliation} onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))} />

                            <label className="sp-label">Country</label>
                            <input className="sp-input" placeholder="e.g. USA"
                                value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />

                            <label className="sp-label">Biography</label>
                            <textarea className="sp-textarea" placeholder="Short biographyâ€¦" rows={4}
                                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button
                                className="sp-btn-save"
                                disabled={saving}
                                onClick={handleSave}
                                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {saving
                                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Savingâ€¦</>
                                    : <><Save size={14} /> {modal.mode === 'add' ? 'Add & Save' : 'Save Changes'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* â”€â”€ Delete Confirm â”€â”€ */}
            {deleteId && (
                <div className="sp-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="sp-modal sp-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">Confirm Delete</h2>
                            <button className="sp-modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">
                            <p style={{ color: '#475569', margin: 0 }}>
                                Are you sure you want to permanently delete <strong>{speakers.find(s => (s._id || s.id) === deleteId)?.name}</strong> from the database?
                            </p>
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="sp-btn-delete" onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus, textarea:focus { outline: 2px solid ${accentColor}; border-color: ${accentColor}; }`}</style>
        </div>
    );
}

