'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, CheckCircle, AlertCircle, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor, uploadImage } from '@/lib/api';

const BLANK_ROW = {
    name: '',
    link: '',
    description: '',
    photo: null,
    photoUrl: '',
};

export default function Sponsors() {
    const [rows, setRows] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editBuf, setEditBuf] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [addBuf, setAddBuf] = useState({ ...BLANK_ROW });
    const [saved, setSaved] = useState(null); // null | 'saved' | 'error'
    const [loading, setLoading] = useState(true);

    const addFileRef = useRef(null);
    const editFileRef = useRef(null);

    // Load sponsors from backend
    useEffect(() => {
        getSponsors('sponsor').then(data => {
            if (data) setRows(data.map(s => ({ ...s, id: s._id, photoUrl: s.logo })));
        }).catch(console.warn).finally(() => setLoading(false));
    }, []);

    /* â”€â”€ helpers â”€â”€ */
    const flashSaved = (ok = true) => { setSaved(ok ? 'saved' : 'error'); setTimeout(() => setSaved(null), 3000); };

    const pickFile = async (e, setter) => {
        const file = e.target.files[0];
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

        e.target.value = '';
        try {
            const { url } = await uploadImage(file);
            setter(prev => ({ ...prev, photoUrl: url, logo: url }));
        } catch {
            const url = URL.createObjectURL(file);
            setter(prev => ({ ...prev, photoUrl: url }));
        }
    };

    /* â”€â”€ add â”€â”€ */
    const openAdd = () => { setAddBuf({ ...BLANK_ROW }); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);
    const saveAdd = async () => {
        try {
            const created = await createSponsor({ name: addBuf.name, link: addBuf.link, description: addBuf.description, logo: addBuf.photoUrl, type: 'sponsor' });
            setRows(prev => [...(prev || []), { ...created, id: created._id, photoUrl: created.logo }]);
            setShowAdd(false);
            flashSaved();
        } catch { flashSaved(false); }
    };

    /* â”€â”€ edit â”€â”€ */
    const startEdit = (row) => { setEditingId(row.id); setEditBuf({ ...row }); };
    const cancelEdit = () => { setEditingId(null); setEditBuf({}); };
    const saveEdit = async () => {
        try {
            const updated = await updateSponsor(editBuf.id, { name: editBuf.name, link: editBuf.link, description: editBuf.description, logo: editBuf.photoUrl });
            setRows(prev => (prev || []).map(r => r.id === editingId ? { ...updated, id: updated._id, photoUrl: updated.logo } : r));
            setEditingId(null);
            flashSaved();
        } catch { flashSaved(false); }
    };

    /* â”€â”€ delete â”€â”€ */
    const deleteRow = async (id) => {
        try { 
            if (String(id).length === 24) {
                await deleteSponsor(id); 
            }
            setRows(prev => (prev || []).filter(r => r.id !== id)); 
        }
        catch { alert('Delete failed'); }
    };

    const COLS = [
        { label: 'Sno', align: 'center', width: '60px' },
        { label: 'Name', align: 'left', width: '20%' },
        { label: 'Link', align: 'left', width: '20%' },
        { label: 'Description', align: 'left', width: '30%' },
        { label: 'Photo', align: 'center', width: '80px' },
        { label: 'Edit', align: 'center', width: '60px' },
        { label: 'Delete', align: 'center', width: '60px' },
    ];

    const modalOpen = showAdd;

    return (
        <div className="sp-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* â”€â”€ Header â”€â”€ */}
                <div className="sp-page-header">
                    <h1 className="sp-title">List of Sponsors</h1>
                </div>

                {/* â”€â”€ Add button â”€â”€ */}
                <div className="sp-actions-row">
                    <button className="sp-add-btn" id="sp-add-sponsor-btn" onClick={openAdd}>
                        Add Sponsors <Plus size={16} />
                    </button>
                    {saved && (
                        <div className="sp-save-badge">
                            <CheckCircle size={14} /> Saved
                        </div>
                    )}
                </div>

                {/* â”€â”€ Table card â”€â”€ */}
                <div className="sp-card">
                    <div className="sp-table-wrap">
                        <table className="sp-table">
                            <thead>
                                <tr className="sp-thead-row">
                                    {COLS.map(col => (
                                        <th key={col.label} className="sp-th" style={{ textAlign: col.align, width: col.width }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) =>
                                    editingId === row.id ? (
                                        /* â”€â”€ Edit row â”€â”€ */
                                        <tr key={row.id} className="sp-tr sp-tr-editing">
                                            <td className="sp-td sp-sno">{idx + 1}</td>
                                            <td className="sp-td">
                                                <input className="sp-cell-input" value={editBuf.name || ''}
                                                    onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} placeholder="Sponsor name" />
                                            </td>
                                            <td className="sp-td">
                                                <input className="sp-cell-input" value={editBuf.link || ''}
                                                    onChange={e => setEditBuf(p => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                                            </td>
                                            <td className="sp-td">
                                                <input className="sp-cell-input" value={editBuf.description || ''}
                                                    onChange={e => setEditBuf(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                                            </td>
                                            <td className="sp-td" style={{ textAlign: 'center' }}>
                                                <div className="sp-photo-cell" style={{ justifyContent: 'center' }}>
                                                    {editBuf.photoUrl
                                                        ? <img src={editBuf.photoUrl} alt="sponsor" className="sp-thumb" />
                                                        : <span className="sp-no-photo"><ImageIcon size={16} /></span>
                                                    }
                                                    <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                                        onChange={e => pickFile(e, setEditBuf)} />
                                                    <button className="sp-photo-btn" onClick={() => editFileRef.current.click()} title="Change photo">
                                                        <ImageIcon size={13} />
                                                    </button>
                                                    <p style={{ color: 'red', fontSize: '10px', marginTop: '4px' }}>
                                                        * 2MB limit
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="sp-td" style={{ textAlign: 'center' }}>
                                                <button className="sp-icon-btn sp-save" onClick={saveEdit} title="Save"><Save size={15} /></button>
                                            </td>
                                            <td className="sp-td" style={{ textAlign: 'center' }}>
                                                <button className="sp-icon-btn sp-cancel" onClick={cancelEdit} title="Cancel"><X size={15} /></button>
                                            </td>
                                        </tr>
                                    ) : (
                                        /* â”€â”€ Read row â”€â”€ */
                                        <tr key={row.id} className={`sp-tr${idx % 2 !== 0 ? ' sp-tr-alt' : ''}`}>
                                            <td className="sp-td sp-sno">{idx + 1}</td>
                                            <td className="sp-td sp-name">{row.name}</td>
                                            <td className="sp-td sp-link">
                                                {row.link
                                                    ? <a href={row.link} target="_blank" rel="noreferrer" className="sp-link-anchor">
                                                        <LinkIcon size={13} /> {row.link}
                                                    </a>
                                                    : 'â€”'}
                                            </td>
                                            <td className="sp-td sp-desc">{row.description || 'â€”'}</td>
                                            <td className="sp-td" style={{ textAlign: 'center' }}>
                                                {row.photoUrl
                                                    ? <img src={row.photoUrl} alt="sponsor" className="sp-thumb" />
                                                    : <span className="sp-no-photo" style={{ margin: '0 auto' }}><ImageIcon size={16} /></span>}
                                            </td>
                                            <td className="sp-td" style={{ textAlign: 'center' }}>
                                                <button className="sp-icon-btn sp-edit" onClick={() => startEdit(row)} title="Edit">
                                                    <Pencil size={15} />
                                                </button>
                                            </td>
                                            <td className="sp-td" style={{ textAlign: 'center' }}>
                                                <button className="sp-icon-btn sp-delete" onClick={() => deleteRow(row.id)} title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="sp-empty">No records to show</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>  {/* end sp-card */}

            </div>  {/* end blur wrapper */}

            {/* â”€â”€ Add Modal â”€â”€ */}
            {showAdd && (
                <div className="sp-modal-overlay" onClick={closeAdd}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()}>
                        <div className="sp-modal-header">
                            <span>Add Sponsor</span>
                            <button className="sp-modal-close" onClick={closeAdd}><X size={18} /></button>
                        </div>

                        <div className="sp-modal-body">

                            <div className="sp-modal-field">
                                <label className="sp-modal-label">Name</label>
                                <input className="sp-modal-input" type="text" placeholder="Sponsor name"
                                    value={addBuf.name || ''} onChange={e => setAddBuf(p => ({ ...p, name: e.target.value }))} />
                            </div>

                            <div className="sp-modal-field">
                                <label className="sp-modal-label">Link</label>
                                <input className="sp-modal-input" type="url" placeholder="https://example.com"
                                    value={addBuf.link || ''} onChange={e => setAddBuf(p => ({ ...p, link: e.target.value }))} />
                            </div>

                            <div className="sp-modal-field">
                                <label className="sp-modal-label">Description</label>
                                <textarea className="sp-modal-input sp-modal-textarea" rows={3} placeholder="Brief description..."
                                    value={addBuf.description || ''} onChange={e => setAddBuf(p => ({ ...p, description: e.target.value }))} />
                            </div>

                            <div className="sp-modal-field">
                                <label className="sp-modal-label">Photo / Logo</label>
                                <div className="sp-modal-photo-row">
                                    {addBuf.photoUrl
                                        ? <img src={addBuf.photoUrl} alt="preview" className="sp-modal-preview" />
                                        : <div className="sp-modal-preview-placeholder"><ImageIcon size={28} /></div>}
                                    <input ref={addFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => pickFile(e, setAddBuf)} />
                                    <button className="sp-choose-btn" onClick={() => addFileRef.current.click()}>
                                        <ImageIcon size={14} /> Choose Image
                                    </button>
                                    <p style={{ color: 'red', fontSize: '11px', marginTop: '10px' }}>
                                        * Image size limit: 2MB (JPG, PNG, JPEG)
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="sp-modal-footer">
                            <button className="sp-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="sp-modal-save" onClick={saveAdd}>
                                <Save size={14} /> Save Sponsor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

