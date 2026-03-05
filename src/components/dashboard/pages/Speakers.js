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
            <img src={speaker.image} alt={speaker.name} className="sp-photo"
                style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }}
                onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        );
    }
    return (
        <div className="sp-avatar" style={{ width: size, height: size, background: col.bg, color: col.color, fontSize: size * 0.3 }}>
            {getInitials(speaker.name)}
        </div>
    );
}

/* â”€â”€â”€ Category config â”€â”€â”€ */
const CATEGORIES = [
    { key: 'All', label: 'All Speakers', db: null, color: '#6366f1' },
    { key: 'Committee', label: 'Committee', db: 'Committee', color: '#6366f1' },
    { key: 'Keynote', label: 'Speakers', db: 'Keynote', color: '#0ea5e9' },
    { key: 'Poster Presenter', label: 'Poster Presenters', db: 'Poster Presenter', color: '#10b981' },
    { key: 'Student', label: 'Students', db: 'Student', color: '#f59e0b' },
    { key: 'Delegate', label: 'Delegates', db: 'Delegate', color: '#ec4899' },
];

const EMPTY_FORM = { name: '', title: '', affiliation: '', country: '', bio: '', image: null, category: 'Committee', visible: true };
const PAGE_SIZE_OPTS = [5, 10, 25, 50];

export default function AllSpeakers() {
    const [all, setAll] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dbStatus, setDbStatus] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const dragIdx = useRef(null);
    const overIdx = useRef(null);
    const fileRef = useRef(null);

    /* â”€â”€â”€ Load all speakers from DB â”€â”€â”€ */
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSpeakers();
            setAll(data);
        } catch { /* keep empty */ }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { loadAll(); }, [loadAll]);

    /* â”€â”€â”€ Filtered view â”€â”€â”€ */
    const tabFiltered = activeTab === 'All' ? all : all.filter(s => s.category === activeTab);
    const searched = tabFiltered.filter(s =>
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.affiliation || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.country || '').toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(searched.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = searched.slice((safePage - 1) * pageSize, safePage * pageSize);
    const start = searched.length ? (safePage - 1) * pageSize + 1 : 0;
    const end = Math.min(safePage * pageSize, searched.length);

    const activeCatColor = CATEGORIES.find(c => c.key === activeTab)?.color || '#6366f1';

    /* â”€â”€â”€ Drag-to-sort (within current view) â”€â”€â”€ */
    const onDragStart = (id) => { dragIdx.current = id; };
    const onDragEnter = (id) => { overIdx.current = id; };
    const onDragEnd = () => {
        const fromId = dragIdx.current, toId = overIdx.current;
        if (!fromId || !toId || fromId === toId) { dragIdx.current = overIdx.current = null; return; }
        setAll(prev => {
            const arr = [...prev];
            const from = arr.findIndex(s => (s._id || s.id) === fromId);
            const to = arr.findIndex(s => (s._id || s.id) === toId);
            const [moved] = arr.splice(from, 1);
            arr.splice(to, 0, moved);
            return arr;
        });
        dragIdx.current = overIdx.current = null;
    };

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

        const reader = new FileReader();
        reader.onload = ev => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
        setUploading(true);
        try {
            const result = await uploadImage(file);
            setForm(f => ({ ...f, image: result.url }));
            setImagePreview(result.url);
        } catch {
            setForm(f => ({ ...f, image: URL.createObjectURL(file) }));
        } finally { setUploading(false); }
    }, []);

    /* â”€â”€â”€ Modal helpers â”€â”€â”€ */
    const openAdd = () => {
        const defaultCat = activeTab === 'All' ? 'Committee' : activeTab;
        setForm({ ...EMPTY_FORM, category: defaultCat });
        setImagePreview(null);
        setModal({ mode: 'add' });
    };
    const openEdit = (s) => {
        setForm({ name: s.name || '', title: s.title || '', affiliation: s.affiliation || '', country: s.country || '', bio: s.bio || '', image: s.image || null, category: s.category || 'Committee', visible: s.visible !== false });
        setImagePreview(s.image || null);
        setModal({ mode: 'edit', id: s._id || s.id });
    };

    /* â”€â”€â”€ Make all existing speakers visible (one-click fix) â”€â”€â”€ */
    const makeAllVisible = async () => {
        setDbStatus('saving');
        try {
            const hidden = all.filter(s => s.visible === false || s.visible === undefined);
            for (const s of hidden) {
                if (s._id) await updateSpeaker(s._id, { ...s, visible: true });
            }
            await loadAll();
            setDbStatus('saved');
            setTimeout(() => setDbStatus(null), 3000);
        } catch {
            setDbStatus('error');
            setTimeout(() => setDbStatus(null), 4000);
        }
    };
    const closeModal = () => { setModal(null); setImagePreview(null); };

    /* â”€â”€â”€ Save (add/edit) â”€â”€â”€ */
    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (modal.mode === 'add') {
                const created = await createSpeaker(form);
                setAll(prev => [...prev, created]);
            } else {
                const updated = await updateSpeaker(modal.id, form);
                setAll(prev => prev.map(s => (s._id || s.id) === modal.id ? updated : s));
            }
            closeModal();
        } catch (err) { alert('Error: ' + err.message); }
        finally { setSaving(false); }
    };

    /* â”€â”€â”€ Delete â”€â”€â”€ */
    const confirmDelete = id => setDeleteId(id);
    const handleDelete = async () => {
        try {
            await deleteSpeaker(deleteId);
            setAll(prev => prev.filter(s => (s._id || s.id) !== deleteId));
        } catch (err) { alert('Error: ' + err.message); }
        finally { setDeleteId(null); }
    };

    /* â”€â”€â”€ Bulk save (order) â”€â”€â”€ */
    const saveAllToDb = async () => {
        setDbStatus('saving');
        try {
            for (let i = 0; i < all.length; i++) {
                const s = all[i];
                if (s._id) await updateSpeaker(s._id, { ...s, order: i });
                else {
                    const created = await createSpeaker({ ...s, order: i });
                    setAll(prev => prev.map((sp, idx) => idx === i ? created : sp));
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

    return (
        <div className="sp-page">
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s' }}>

                {/* â”€â”€ Header â”€â”€ */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                        <h1 className="sp-title" style={{ marginBottom: '4px' }}>All Speakers</h1>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                            Manage all speaker categories in one place. Use the tabs to filter by category.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {dbStatus === 'saved' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <CheckCircle size={14} /> Saved!
                            </div>
                        )}
                        {dbStatus === 'error' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <AlertCircle size={14} /> Error
                            </div>
                        )}
                        <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={makeAllVisible} disabled={dbStatus === 'saving'}
                            title="Set visible=true on all speakers so they appear on the website"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Make All Visible
                        </button>
                        <button onClick={saveAllToDb} disabled={dbStatus === 'saving'}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                            {dbStatus === 'saving'
                                ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                : <Database size={14} />}
                            Save to Database
                        </button>
                    </div>
                </div>

                {/* â”€â”€ Hint â”€â”€ */}
                <div className="sp-hint">
                    <Info size={15} className="sp-hint-icon" />
                    <span>Use <strong>tabs</strong> to filter by category. <strong>Add / Edit / Delete</strong> save instantly to MongoDB. <strong>Save to Database</strong> persists drag-and-drop order.</span>
                </div>

                {/* â”€â”€ Category Tabs â”€â”€ */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => { setActiveTab(cat.key); setPage(1); }}
                            style={{
                                padding: '7px 16px', borderRadius: '20px', border: '2px solid',
                                cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                                borderColor: activeTab === cat.key ? cat.color : '#e2e8f0',
                                background: activeTab === cat.key ? cat.color : '#fff',
                                color: activeTab === cat.key ? '#fff' : '#64748b',
                                boxShadow: activeTab === cat.key ? `0 4px 12px ${cat.color}44` : 'none',
                            }}
                        >
                            {cat.label}
                            <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8 }}>
                                ({cat.key === 'All' ? all.length : all.filter(s => s.category === cat.key).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* â”€â”€ Toolbar â”€â”€ */}
                <div className="sp-toolbar">
                    <button className="sp-add-btn" onClick={openAdd}
                        style={{ background: `linear-gradient(135deg, ${activeCatColor}, ${activeCatColor}cc)` }}>
                        <Plus size={16} /> Add {activeTab === 'All' ? 'Speaker' : CATEGORIES.find(c => c.key === activeTab)?.label.replace(/s$/, '')}
                    </button>
                </div>

                {/* â”€â”€ Loading â”€â”€ */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
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
                                <input className="sp-search-input" placeholder="Search name, affiliationâ€¦" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="sp-table-wrap">
                            <table className="sp-table">
                                <thead>
                                    <tr>
                                        <th className="sp-th sp-th-sno">Sno</th>
                                        <th className="sp-th sp-th-name">Name</th>
                                        <th className="sp-th" style={{ minWidth: '80px' }}>Category</th>
                                        <th className="sp-th sp-th-affil">Title / Affiliation</th>
                                        <th className="sp-th sp-th-photo">Photo</th>
                                        <th className="sp-th sp-th-bio">Bio</th>
                                        <th className="sp-th sp-th-action">Edit</th>
                                        <th className="sp-th sp-th-action">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="sp-empty">
                                                {all.length === 0
                                                    ? 'No speakers in database yet. Click Add Speaker to get started.'
                                                    : 'No speakers found in this category.'}
                                            </td>
                                        </tr>
                                    ) : paginated.map((s, i) => {
                                        const uid = s._id || s.id;
                                        const rowIdx = (safePage - 1) * pageSize + i;
                                        const catCfg = CATEGORIES.find(c => c.key === s.category) || CATEGORIES[0];
                                        return (
                                            <tr key={uid || i}
                                                className={`sp-tr${rowIdx % 2 !== 0 ? ' sp-tr-even' : ''}`}
                                                draggable
                                                onDragStart={() => onDragStart(uid)}
                                                onDragEnter={() => onDragEnter(uid)}
                                                onDragEnd={onDragEnd}
                                                onDragOver={e => e.preventDefault()}
                                            >
                                                <td className="sp-td sp-td-sno">
                                                    <span className="sp-drag-handle"><GripVertical size={14} /></span>
                                                    {rowIdx + 1}
                                                </td>
                                                <td className="sp-td sp-td-name"><span className="sp-name-link">{s.name}</span></td>
                                                <td className="sp-td">
                                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: catCfg.color + '18', color: catCfg.color, whiteSpace: 'nowrap' }}>
                                                        {s.category}
                                                    </span>
                                                </td>
                                                <td className="sp-td sp-td-affil">
                                                    {s.title && <div style={{ fontWeight: 600, fontSize: '12px', color: catCfg.color, marginBottom: '2px' }}>{s.title}</div>}
                                                    <div>{s.affiliation}</div>
                                                    {s.country && <div className="sp-country">{s.country}</div>}
                                                </td>
                                                <td className="sp-td sp-td-photo">
                                                    <SpeakerAvatar speaker={s} index={rowIdx} size={68} />
                                                </td>
                                                <td className="sp-td sp-td-bio">
                                                    <div className="sp-bio-preview">{s.bio || 'â€”'}</div>
                                                </td>
                                                <td className="sp-td sp-td-action">
                                                    <button className="sp-icon-btn edit" onClick={() => openEdit(s)} title="Edit"><Pencil size={15} /></button>
                                                </td>
                                                <td className="sp-td sp-td-action">
                                                    <button className="sp-icon-btn delete" onClick={() => confirmDelete(uid)} title="Delete"><Trash2 size={15} /></button>
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
                                {searched.length === 0 ? 'No entries found' : `Showing ${start} to ${end} of ${searched.length} entries`}
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

                        {/* Bottom save */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingBottom: '8px' }}>
                            <button onClick={saveAllToDb} disabled={dbStatus === 'saving'}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 18px rgba(99,102,241,0.35)' }}>
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
                    <div className="sp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">{modal.mode === 'add' ? 'Add Speaker' : 'Edit Speaker'}</h2>
                            <button className="sp-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">

                            {/* Photo upload */}
                            <div className="sp-photo-upload-section">
                                <div className="sp-photo-preview" onClick={() => fileRef.current?.click()} style={{ position: 'relative', cursor: 'pointer' }}>
                                    {imagePreview
                                        ? <img src={imagePreview} alt="preview" className="sp-photo-preview-img" style={{ objectFit: 'cover' }} />
                                        : <div className="sp-photo-placeholder"><User size={28} color="#94a3b8" /><span>Upload Photo</span></div>
                                    }
                                    {uploading && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                                            <div style={{ width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                                <button className="sp-upload-btn" onClick={() => fileRef.current?.click()}>
                                    <Upload size={14} /> {uploading ? 'Uploadingâ€¦' : 'Choose Photo'}
                                </button>
                                <p style={{ color: 'red', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                                    * Image size limit: 2MB (JPG, PNG, JPEG)
                                </p>
                                {form.image && !uploading && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#10b981', textAlign: 'center' }}>âœ“ Image uploaded</p>}
                            </div>

                            {/* Category selector */}
                            <label className="sp-label">Category <span className="sp-req">*</span></label>
                            <select className="sp-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                style={{ cursor: 'pointer' }}>
                                {CATEGORIES.filter(c => c.key !== 'All').map(c => (
                                    <option key={c.key} value={c.key}>{c.label}</option>
                                ))}
                            </select>

                            <label className="sp-label">Full Name <span className="sp-req">*</span></label>
                            <input className="sp-input" placeholder="e.g. Dr. Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

                            <label className="sp-label">Title / Role</label>
                            <input className="sp-input" placeholder="e.g. Professor of Fluid Mechanics" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

                            <label className="sp-label">Affiliation</label>
                            <input className="sp-input" placeholder="e.g. MIT, USA" value={form.affiliation} onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))} />

                            <label className="sp-label">Country</label>
                            <input className="sp-input" placeholder="e.g. USA" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />

                            <label className="sp-label">Biography</label>
                            <textarea className="sp-textarea" rows={4} placeholder="Short biographyâ€¦" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />

                            <label className="sp-label" style={{ marginTop: '8px' }}>Visibility on Website</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: form.visible ? '#dcfce7' : '#fef2f2', border: `1px solid ${form.visible ? '#86efac' : '#fca5a5'}`, borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="speaker-visible"
                                    checked={!!form.visible}
                                    onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#16a34a' }}
                                />
                                <label htmlFor="speaker-visible" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: form.visible ? '#15803d' : '#dc2626', margin: 0 }}>
                                    {form.visible ? 'âœ“ Visible â€” will appear on the website' : 'âœ— Hidden â€” will NOT appear on the website'}
                                </label>
                            </div>
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="sp-btn-save" disabled={saving} onClick={handleSave}
                                style={{ background: `linear-gradient(135deg,#6366f1,#8b5cf6)`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {saving
                                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Savingâ€¦</>
                                    : <><Save size={14} />{modal.mode === 'add' ? 'Add & Save' : 'Save Changes'}</>}
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
                                Permanently delete <strong>{all.find(s => (s._id || s.id) === deleteId)?.name}</strong> from the database?
                            </p>
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="sp-btn-delete" onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

