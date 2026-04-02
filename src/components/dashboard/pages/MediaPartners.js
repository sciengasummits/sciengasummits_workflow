'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Save, CheckCircle, Image as ImageIcon, Link as LinkIcon, Search, AlertCircle } from 'lucide-react';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor, uploadImage } from '@/lib/api';

const BLANK_ROW = {
    name: '',
    link: '',
    description: '',
    photoUrl: '',
    type: 'media_partner',
};

export default function MediaPartners() {
    const [rows, setRows] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editBuf, setEditBuf] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [addBuf, setAddBuf] = useState({ ...BLANK_ROW });
    const [saved, setSaved] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const addFileRef = useRef(null);
    const editFileRef = useRef(null);

    /* ── helpers ── */
    const flashSaved = (ok = true) => { 
        setSaved(ok ? 'saved' : 'error'); 
        setTimeout(() => setSaved(null), 3000); 
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getSponsors('media_partner');
            if (data) {
                setRows(data.map(s => ({ ...s, id: s._id, photoUrl: s.logo })));
            }
        } catch (err) {
            console.error('Failed to load media partners:', err);
        } finally {
            setLoading(false);
        }
    };

    const pickFile = async (e, setter) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            alert('Invalid format. JPG, PNG, WEBP only.');
            return;
        }
        if (file.size > maxSize) {
            alert('File too large. Max 2MB.');
            return;
        }

        try {
            const { url } = await uploadImage(file);
            setter(prev => ({ ...prev, photoUrl: url, logo: url }));
        } catch (err) {
            alert('Upload failed: ' + err.message);
        }
        e.target.value = '';
    };

    /* ── add ── */
    const openAdd = () => { setAddBuf({ ...BLANK_ROW }); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);
    const saveAdd = async () => {
        if (!addBuf.name) return alert('Name is required');
        try {
            const created = await createSponsor({ 
                name: addBuf.name, 
                link: addBuf.link, 
                description: addBuf.description, 
                logo: addBuf.photoUrl, 
                type: 'media_partner' 
            });
            setRows(prev => [...(prev || []), { ...created, id: created._id, photoUrl: created.logo }]);
            setShowAdd(false);
            flashSaved();
        } catch (err) {
            alert(err.message);
            flashSaved(false);
        }
    };

    /* ── edit ── */
    const startEdit = (row) => { setEditingId(row.id); setEditBuf({ ...row }); };
    const cancelEdit = () => { setEditingId(null); setEditBuf({}); };
    const saveEdit = async () => {
        try {
            const updated = await updateSponsor(editBuf.id, { 
                name: editBuf.name, 
                link: editBuf.link, 
                description: editBuf.description, 
                logo: editBuf.photoUrl,
                type: 'media_partner'
            });
            setRows(prev => (prev || []).map(r => r.id === editingId ? { ...updated, id: updated._id, photoUrl: updated.logo } : r));
            setEditingId(null);
            flashSaved();
        } catch (err) {
            alert(err.message);
            flashSaved(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async () => {
        try {
            await deleteSponsor(deleteId);
            setRows(prev => (prev || []).filter(r => r.id !== deleteId));
            flashSaved();
        } catch (err) {
            alert('Delete failed');
        } finally {
            setDeleteId(null);
        }
    };

    /* ── search filter ── */
    const filteredRows = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return (rows || []).filter(r =>
            r && (
                (r.name || '').toLowerCase().includes(lower) ||
                (r.link || '').toLowerCase().includes(lower)
            )
        );
    }, [rows, searchTerm]);

    const COLS = [
        { label: 'Sno', align: 'center', width: '60px' },
        { label: 'Name', align: 'left', width: '30%' },
        { label: 'Link', align: 'left', width: '30%' },
        { label: 'Photo', align: 'center', width: '120px' },
        { label: 'Actions', align: 'center', width: '120px' },
    ];

    if (loading) return <div className="mp-loading">Loading partners...</div>;

    const modalOpen = showAdd || !!deleteId;

    return (
        <div className="mp-page">
            <div style={modalOpen ? { filter: 'blur(4px)', pointerEvents: 'none' } : {}}>
                <div className="mp-page-header">
                    <h1 className="mp-title">Media Partners</h1>
                    <p className="mp-subtitle">Manage promoting and media partners displayed on the website</p>
                </div>

                <div className="mp-toolbar-row">
                    <div className="mp-actions-left">
                        <button className="mp-add-btn" onClick={openAdd}>
                            Add New Partner <Plus size={16} />
                        </button>
                        {saved === 'saved' && <div className="mp-save-badge"><CheckCircle size={14} /> Saved</div>}
                        {saved === 'error' && <div className="mp-save-badge error"><AlertCircle size={14} /> Error</div>}
                    </div>

                    <div className="mp-search-box">
                        <div className="mp-search-input-wrap">
                            <Search size={14} className="mp-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="mp-card">
                    <div className="mp-table-wrap">
                        <table className="mp-table">
                            <thead>
                                <tr className="mp-thead-row">
                                    {COLS.map(col => (
                                        <th key={col.label} className="mp-th" style={{ textAlign: col.align, width: col.width }}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, idx) => (
                                    <tr key={row.id} className={`mp-tr ${editingId === row.id ? 'mp-editing' : ''}`}>
                                        <td className="mp-td mp-sno">{idx + 1}</td>
                                        <td className="mp-td">
                                            {editingId === row.id 
                                                ? <input className="mp-cell-input" value={editBuf.name} onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} />
                                                : <span className="mp-name">{row.name}</span>}
                                        </td>
                                        <td className="mp-td">
                                            {editingId === row.id
                                                ? <input className="mp-cell-input" value={editBuf.link} onChange={e => setEditBuf(p => ({ ...p, link: e.target.value }))} />
                                                : <a href={row.link} target="_blank" rel="noreferrer" className="mp-link-anchor text-truncate"><LinkIcon size={12}/> {row.link || '—'}</a>}
                                        </td>
                                        <td className="mp-td" style={{ textAlign: 'center' }}>
                                            <div className="mp-photo-cell">
                                                {editingId === row.id ? (
                                                    <>
                                                        <img src={editBuf.photoUrl || '/placeholder-img.png'} className="mp-thumb" alt="" />
                                                        <input ref={editFileRef} type="file" style={{ display: 'none' }} onChange={e => pickFile(e, setEditBuf)} />
                                                        <button className="mp-photo-btn" onClick={() => editFileRef.current.click()}><Pencil size={10}/></button>
                                                    </>
                                                ) : (
                                                    <img src={row.photoUrl || '/placeholder-img.png'} className="mp-thumb" alt="" onError={e => e.target.src='/placeholder-img.png'} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="mp-td" style={{ textAlign: 'center' }}>
                                            {editingId === row.id ? (
                                                <div className="mp-action-btns">
                                                    <button className="mp-icon-btn mp-save" onClick={saveEdit}><Save size={16} /></button>
                                                    <button className="mp-icon-btn mp-cancel" onClick={cancelEdit}><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <div className="mp-action-btns">
                                                    <button className="mp-icon-btn mp-edit" onClick={() => startEdit(row)}><Pencil size={16} /></button>
                                                    <button className="mp-icon-btn mp-delete" onClick={() => setDeleteId(row.id)}><Trash2 size={16} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={COLS.length} className="mp-empty">No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* ── Pagination Footer ── */}
                    <div className="mp-pagination-footer">
                        <div className="mp-page-info">
                            Showing {filteredRows.length} of {rows.length} entries
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add Modal ── */}
            {showAdd && (
                <div className="mp-modal-overlay" onClick={closeAdd}>
                    <div className="mp-modal" onClick={e => e.stopPropagation()}>
                        <div className="mp-modal-header">
                            <span>Add Media Partner</span>
                            <button className="mp-modal-close" onClick={closeAdd}><X size={18} /></button>
                        </div>
                        <div className="mp-modal-body">
                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Name</label>
                                <input className="mp-modal-input" placeholder="Partner Name" value={addBuf.name} onChange={e => setAddBuf(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Website Link</label>
                                <input className="mp-modal-input" placeholder="https://..." value={addBuf.link} onChange={e => setAddBuf(p => ({ ...p, link: e.target.value }))} />
                            </div>
                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Logo</label>
                                <div className="mp-modal-photo-row">
                                    <img src={addBuf.photoUrl || '/placeholder-img.png'} className="mp-modal-preview" alt="" />
                                    <input ref={addFileRef} type="file" style={{ display: 'none' }} onChange={e => pickFile(e, setAddBuf)} />
                                    <button className="mp-choose-btn" onClick={() => addFileRef.current.click()}><ImageIcon size={14}/> Choose Logo</button>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>
                                    * Max 2MB (JPG, PNG, WEBP)
                                </p>
                            </div>
                        </div>
                        <div className="mp-modal-footer">
                            <button className="mp-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="mp-modal-save" onClick={saveAdd}><Save size={14}/> Save Partner</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Modal ── */}
            {deleteId && (
                <div className="mp-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="mp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="mp-modal-header">
                            <span>Confirm Delete</span>
                            <button className="mp-modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
                        </div>
                        <div className="mp-modal-body" style={{ padding: '24px 20px', textAlign: 'center' }}>
                            <p style={{ color: '#475569', margin: 0, fontSize: '15px' }}>
                                Permanently delete this media partner?
                            </p>
                        </div>
                        <div className="mp-modal-footer">
                            <button className="mp-modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="mp-modal-save" onClick={handleDelete} style={{ background: '#ef4444', color: 'white', border: 'none' }}>
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
