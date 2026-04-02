'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Pencil, Trash2, Plus, X, GripVertical, Info,
    Search, ChevronLeft, ChevronRight, Upload, Building2,
    Save, CheckCircle, AlertCircle, RefreshCw, Database
} from 'lucide-react';
import { getUniversities, createUniversity, updateUniversity, deleteUniversity, uploadImage } from '@/lib/api';

const EMPTY_FORM = { name: '', link: '', image: null, visible: true };
const PAGE_SIZE_OPTS = [5, 10, 25, 50];

export default function Universities() {
    const [all, setAll] = useState([]);
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

    /* ── Load all from DB ── */
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUniversities();
            setAll(data || []);
        } catch { /* keep empty */ }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { loadAll(); }, [loadAll]);

    /* ── Filtered view ── */
    const searched = (all || []).filter(s =>
        s && (s.name || '').toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(searched.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = searched.slice((safePage - 1) * pageSize, safePage * pageSize);
    const start = searched.length ? (safePage - 1) * pageSize + 1 : 0;
    const end = Math.min(safePage * pageSize, searched.length);

    /* ── Drag-to-sort ── */
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

    /* ── Image upload ── */
    const handlePhotoChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            alert('Invalid file format. Please upload JPG, PNG, WEBP or JPEG.');
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

    /* ── Modal helpers ── */
    const openAdd = () => {
        setForm(EMPTY_FORM);
        setImagePreview(null);
        setModal({ mode: 'add' });
    };
    const openEdit = (s) => {
        setForm({ name: s.name || '', link: s.link || '', image: s.image || null, visible: s.visible !== false });
        setImagePreview(s.image || null);
        setModal({ mode: 'edit', id: s._id || s.id });
    };

    const makeAllVisible = async () => {
        setDbStatus('saving');
        try {
            const hidden = (all || []).filter(s => s && (s.visible === false || s.visible === undefined));
            for (const s of hidden) {
                if (s && s._id) await updateUniversity(s._id, { ...s, visible: true });
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

    /* ── Save (add/edit) ── */
    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (modal.mode === 'add') {
                const created = await createUniversity(form);
                setAll(prev => [...(prev || []), created]);
            } else {
                const updated = await updateUniversity(modal.id, form);
                setAll(prev => (prev || []).map(s => s && (s._id || s.id) === modal.id ? updated : s));
            }
            closeModal();
        } catch (err) { alert('Error: ' + err.message); }
        finally { setSaving(false); }
    };

    /* ── Delete ── */
    const confirmDelete = id => setDeleteId(id);
    const handleDelete = async () => {
        try {
            if (String(deleteId).length === 24) {
                await deleteUniversity(deleteId);
            }
            setAll(prev => (prev || []).filter(s => s && (s._id || s.id) !== deleteId));
        } catch (err) { alert('Error: ' + err.message); }
        finally { setDeleteId(null); }
    };

    /* ── Bulk save (order) ── */
    const saveAllToDb = async () => {
        setDbStatus('saving');
        try {
            for (let i = 0; i < (all || []).length; i++) {
                const s = all[i];
                if (!s) continue;
                if (s._id) await updateUniversity(s._id, { ...s, order: i });
                else {
                    const created = await createUniversity({ ...s, order: i });
                    setAll(prev => (prev || []).map((sp, idx) => idx === i ? created : sp));
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
    const accentColor = '#8b5cf6'; // purple for universities

    return (
        <div className="sp-page">
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                        <h1 className="sp-title" style={{ marginBottom: '4px' }}>Universities & Institutions</h1>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                            Manage the university logos shown in the scrolling marquee.
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
                            title="Set visible=true on all items so they appear on the website"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Make All Visible
                        </button>
                        <button onClick={saveAllToDb} disabled={dbStatus === 'saving'}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: `linear-gradient(135deg,${accentColor},${accentColor}cc)`, color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: `0 4px 14px ${accentColor}55` }}>
                            {dbStatus === 'saving'
                                ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                : <Database size={14} />}
                            Save to Database
                        </button>
                    </div>
                </div>

                <div className="sp-hint" style={{ marginBottom: '16px' }}>
                    <Info size={15} className="sp-hint-icon" />
                    <span><strong>Add / Edit / Delete</strong> save instantly. <strong>Save to Database</strong> persists drag-and-drop order.</span>
                </div>

                <div className="sp-toolbar" style={{ marginBottom: '16px' }}>
                    <button className="sp-add-btn" onClick={openAdd}
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
                        <Plus size={16} /> Add University
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        </div>
                    </div>
                ) : (
                    <>
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
                                <input className="sp-search-input" placeholder="Search name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                            </div>
                        </div>

                        <div className="sp-table-wrap">
                            <table className="sp-table">
                                <thead>
                                    <tr>
                                        <th className="sp-th sp-th-sno">Sno</th>
                                                <th className="sp-th sp-th-photo">Logo</th>
                                                <th className="sp-th sp-th-name">University Name</th>
                                                <th className="sp-th sp-th-action">Link</th>
                                                <th className="sp-th sp-th-action">Edit</th>
                                        <th className="sp-th sp-th-action">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="sp-empty">
                                                No universities found. Click Add University to get started.
                                            </td>
                                        </tr>
                                    ) : paginated.map((s, i) => {
                                        const uid = s._id || s.id;
                                        const rowIdx = (safePage - 1) * pageSize + i;
                                        return (
                                            <tr key={uid || i} className={`sp-tr${rowIdx % 2 !== 0 ? ' sp-tr-even' : ''}`} draggable onDragStart={() => onDragStart(uid)} onDragEnter={() => onDragEnter(uid)} onDragEnd={onDragEnd} onDragOver={e => e.preventDefault()}>
                                                <td className="sp-td sp-td-sno">
                                                    <span className="sp-drag-handle"><GripVertical size={14} /></span>
                                                    {rowIdx + 1}
                                                </td>
                                                <td className="sp-td sp-td-photo">
                                                    {s.image ? (
                                                        <img src={s.image} alt={s.name} className="sp-photo" style={{ width: 100, height: 40, objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px' }} onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <div className="sp-avatar" style={{ width: 80, height: 40, background: '#f1f5f9', color: '#94a3b8', fontSize: '12px' }}>No Logo</div>
                                                    )}
                                                </td>
                                                <td className="sp-td sp-td-name"><span className="sp-name-link">{s.name}</span></td>
                                                <td className="sp-td sp-td-action">
                                                    {s.link ? <a href={s.link} target="_blank" rel="noreferrer" style={{ color: accentColor }}><Database size={14}/></a> : '—'}
                                                </td>
                                                <td className="sp-td sp-td-action"><button className="sp-icon-btn edit" onClick={() => openEdit(s)} title="Edit"><Pencil size={15} /></button></td>
                                                <td className="sp-td sp-td-action"><button className="sp-icon-btn delete" onClick={() => confirmDelete(uid)} title="Delete"><Trash2 size={15} /></button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="sp-pagination-bar">
                            <span className="sp-entries-info">{searched.length === 0 ? 'No entries found' : `Showing ${start} to ${end} of ${searched.length} entries`}</span>
                            <div className="sp-pagination">
                                <button className="sp-page-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (<button key={p} className={`sp-page-num${p === safePage ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>))}
                                <button className="sp-page-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {modal && (
                <div className="sp-modal-overlay" onClick={closeModal}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">{modal.mode === 'add' ? 'Add University' : 'Edit University'}</h2>
                            <button className="sp-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">

                            <div className="sp-photo-upload-section">
                                <div className="sp-photo-preview" onClick={() => fileRef.current?.click()} style={{ position: 'relative', cursor: 'pointer', height: '120px', borderRadius: '8px' }}>
                                    {imagePreview
                                        ? <img src={imagePreview} alt="preview" className="sp-photo-preview-img" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                                        : <div className="sp-photo-placeholder" style={{ borderRadius: '8px' }}><Building2 size={28} color="#94a3b8" /><span>Upload Logo</span></div>
                                    }
                                    {uploading && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                            <div style={{ width: 24, height: 24, border: `3px solid ${accentColor}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                                <button className="sp-upload-btn" onClick={() => fileRef.current?.click()}>
                                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Choose Logo'}
                                </button>
                                <p style={{ color: 'red', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>* Image limit: 2MB</p>
                            </div>

                            <label className="sp-label">University Name <span className="sp-req">*</span></label>
                            <input className="sp-input" placeholder="e.g. Stanford University" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

                            <label className="sp-label" style={{ marginTop: '12px' }}>Website Link</label>
                            <input className="sp-input" placeholder="https://..." value={form.link || ''} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />

                            <label className="sp-label" style={{ marginTop: '8px' }}>Visibility</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: form.visible ? '#dcfce7' : '#fef2f2', border: `1px solid ${form.visible ? '#86efac' : '#fca5a5'}`, borderRadius: '8px' }}>
                                <input type="checkbox" id="uni-visible" checked={!!form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#16a34a' }} />
                                <label htmlFor="uni-visible" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: form.visible ? '#15803d' : '#dc2626', margin: 0 }}>
                                    {form.visible ? '✓ Visible on Marquee' : '✗ Hidden'}
                                </label>
                            </div>
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="sp-btn-save" disabled={saving} onClick={handleSave} style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}cc)` }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className="sp-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="sp-modal sp-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">Confirm Delete</h2>
                            <button className="sp-modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">
                            <p style={{ color: '#475569', margin: 0 }}>Permanently delete <strong>{all.find(s => (s._id || s.id) === deleteId)?.name}</strong>?</p>
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="sp-btn-delete" onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus { outline: 2px solid ${accentColor}; border-color: ${accentColor}; }`}</style>
        </div>
    );
}
