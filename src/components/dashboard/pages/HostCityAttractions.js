'use client';

import { useState, useRef, useEffect } from 'react';
import {
    CheckCircle, Plus, Trash2, Image as ImageIcon,
    MapPin, Building2, Globe, Thermometer, Users, Clock, Save, X, Pencil
} from 'lucide-react';
import { getContent, updateContent, uploadImage } from '@/lib/api';

const BLANK_ATTRACTION = { id: '', name: '', distance: '', imageUrl: '' };

const genId = () => Math.random().toString(36).slice(2, 9);

export default function HostCityAttractions() {
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    /* ── Host City fields ── */
    const [cityName, setCityName] = useState('Munich, Germany');
    const [desc1, setDesc1] = useState('');
    const [desc2, setDesc2] = useState('');
    const [population, setPopulation] = useState('1.5M+');
    const [temperature, setTemperature] = useState('15°C');
    const [timezone, setTimezone] = useState('GMT+1');
    const [cityImageUrl, setCityImageUrl] = useState('');
    const cityImgRef = useRef(null);

    /* ── Attractions ── */
    const [attractions, setAttractions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editBuf, setEditBuf] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [addBuf, setAddBuf] = useState({ ...BLANK_ATTRACTION });
    const [deleteId, setDeleteId] = useState(null);
    const addImgRef = useRef(null);
    const editImgRef = useRef(null);

    /* ── Load ── */
    useEffect(() => {
        getContent('hostCityAttractions').then(data => {
            if (!data) return;
            setCityName(data.cityName || 'Munich, Germany');
            setDesc1(data.desc1 || '');
            setDesc2(data.desc2 || '');
            setPopulation(data.population || '1.5M+');
            setTemperature(data.temperature || '15°C');
            setTimezone(data.timezone || 'GMT+1');
            setCityImageUrl(data.cityImageUrl || '');
            setAttractions(Array.isArray(data.attractions) ? data.attractions : []);
        }).catch(() => { });
    }, []);

    const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

    /* ── Image Upload helpers ── */
    const pickCityImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try { const { url } = await uploadImage(file); setCityImageUrl(url); }
        catch (err) { alert('Upload failed: ' + err.message); }
        e.target.value = '';
    };

    const pickAttractionImg = async (e, setter) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const { url } = await uploadImage(file);
            setter(prev => ({ ...prev, imageUrl: url }));
        } catch (err) { alert('Upload failed: ' + err.message); }
        e.target.value = '';
    };

    /* ── Save All ── */
    const handleSubmit = async () => {
        setSaving(true);
        try {
            await updateContent('hostCityAttractions', {
                cityName, desc1, desc2,
                population, temperature, timezone,
                cityImageUrl, attractions
            });
            flash();
        } catch (e) { console.error('Save failed', e); alert('Save failed: ' + e.message); }
        finally { setSaving(false); }
    };

    /* ── Attraction CRUD ── */
    const openAdd = () => { setAddBuf({ ...BLANK_ATTRACTION, id: genId() }); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);
    const saveAdd = () => {
        if (!addBuf.name.trim()) return alert('Attraction name is required.');
        setAttractions(prev => [...prev, addBuf]);
        setShowAdd(false);
    };

    const startEdit = (item) => { setEditingId(item.id); setEditBuf({ ...item }); };
    const cancelEdit = () => { setEditingId(null); setEditBuf({}); };
    const saveEdit = () => {
        setAttractions(prev => prev.map(a => a.id === editingId ? editBuf : a));
        setEditingId(null);
    };

    const confirmDelete = () => {
        setAttractions(prev => prev.filter(a => a.id !== deleteId));
        setDeleteId(null);
    };

    const modalOpen = showAdd || !!deleteId;

    return (
        <div className="ac2-page">

            {/* ── Page Header ── */}
            <div className="ac2-page-header">
                <div className="ac2-title-row">
                    <div className="ac2-title-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                        <Globe size={20} />
                    </div>
                    <div>
                        <h1 className="ac2-title">Host City &amp; Attractions</h1>
                        <p className="ac2-subtitle">Edit the host city information and nearby attractions shown on the Venue page</p>
                    </div>
                </div>
            </div>

            <div style={modalOpen ? { filter: 'blur(3px)', pointerEvents: 'none' } : {}}>

                {/* ══ Section 1 – City Details ══ */}
                <div className="ac2-section-card">
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">About the Host City</span>
                        <span className="ac2-section-badge"><Building2 size={12} style={{ marginRight: 4 }} />City Info</span>
                    </div>
                    <div className="ac2-editor-body">
                        {/* City Name */}
                        <div className="ac2-field-row">
                            <label className="ac2-field-label">City &amp; Country</label>
                            <input
                                className="ac2-text-input"
                                value={cityName}
                                onChange={e => setCityName(e.target.value)}
                                placeholder="e.g. Munich, Germany"
                            />
                        </div>

                        {/* Description paragraph 1 */}
                        <div className="ac2-field-row" style={{ marginTop: '1rem' }}>
                            <label className="ac2-field-label">Description – Paragraph 1</label>
                            <textarea
                                className="ac2-text-input"
                                rows={4}
                                value={desc1}
                                onChange={e => setDesc1(e.target.value)}
                                placeholder="First paragraph about the host city..."
                                style={{ resize: 'vertical', minHeight: '90px' }}
                            />
                        </div>

                        {/* Description paragraph 2 */}
                        <div className="ac2-field-row" style={{ marginTop: '1rem' }}>
                            <label className="ac2-field-label">Description – Paragraph 2</label>
                            <textarea
                                className="ac2-text-input"
                                rows={4}
                                value={desc2}
                                onChange={e => setDesc2(e.target.value)}
                                placeholder="Second paragraph about the host city..."
                                style={{ resize: 'vertical', minHeight: '90px' }}
                            />
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="ac2-field-row" style={{ margin: 0 }}>
                                <label className="ac2-field-label"><Users size={13} style={{ marginRight: 4 }} />Population</label>
                                <input className="ac2-text-input" value={population} onChange={e => setPopulation(e.target.value)} placeholder="e.g. 1.5M+" />
                            </div>
                            <div className="ac2-field-row" style={{ margin: 0 }}>
                                <label className="ac2-field-label"><Thermometer size={13} style={{ marginRight: 4 }} />Avg. Temperature</label>
                                <input className="ac2-text-input" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="e.g. 15°C" />
                            </div>
                            <div className="ac2-field-row" style={{ margin: 0 }}>
                                <label className="ac2-field-label"><Clock size={13} style={{ marginRight: 4 }} />Time Zone</label>
                                <input className="ac2-text-input" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="e.g. GMT+1" />
                            </div>
                        </div>

                        {/* City Image */}
                        <div className="ac2-field-row" style={{ marginTop: '1.25rem' }}>
                            <label className="ac2-field-label"><ImageIcon size={13} style={{ marginRight: 4 }} />City Background Image</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                {cityImageUrl && (
                                    <img
                                        src={cityImageUrl}
                                        alt="City"
                                        style={{ width: 180, height: 110, objectFit: 'cover', borderRadius: 10, border: '2px solid #e2e8f0' }}
                                    />
                                )}
                                <div>
                                    <input ref={cityImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickCityImage} />
                                    <button className="mp-choose-btn" onClick={() => cityImgRef.current.click()}>
                                        <ImageIcon size={14} /> {cityImageUrl ? 'Change Image' : 'Upload Image'}
                                    </button>
                                    <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>JPG, PNG, WEBP · max 2 MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ Section 2 – Nearby Attractions ══ */}
                <div className="ac2-section-card" style={{ marginTop: '1.5rem' }}>
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">Nearby Attractions</span>
                        <span className="ac2-section-badge"><MapPin size={12} style={{ marginRight: 4 }} />{attractions.length} items</span>
                    </div>

                    <div className="ac2-editor-body">
                        {/* Toolbar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                                Add, edit or remove the places shown in the &quot;Nearby Attractions&quot; section.
                            </p>
                            <button className="mp-add-btn" onClick={openAdd}>
                                Add Attraction <Plus size={15} />
                            </button>
                        </div>

                        {/* Attractions Table */}
                        <div className="mp-card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                            <div className="mp-table-wrap">
                                <table className="mp-table">
                                    <thead>
                                        <tr className="mp-thead-row">
                                            <th className="mp-th" style={{ width: 50, textAlign: 'center' }}>#</th>
                                            <th className="mp-th" style={{ width: '35%' }}>Name</th>
                                            <th className="mp-th" style={{ width: '15%' }}>Distance</th>
                                            <th className="mp-th" style={{ textAlign: 'center', width: 120 }}>Image</th>
                                            <th className="mp-th" style={{ textAlign: 'center', width: 120 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attractions.length === 0 && (
                                            <tr><td colSpan={5} className="mp-empty">No attractions added yet. Click &quot;Add Attraction&quot; to get started.</td></tr>
                                        )}
                                        {attractions.map((item, idx) => (
                                            <tr key={item.id} className={`mp-tr${editingId === item.id ? ' mp-editing' : ''}`}>
                                                <td className="mp-td mp-sno">{idx + 1}</td>
                                                <td className="mp-td">
                                                    {editingId === item.id
                                                        ? <input className="mp-cell-input" value={editBuf.name} onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} />
                                                        : <span className="mp-name">{item.name}</span>}
                                                </td>
                                                <td className="mp-td">
                                                    {editingId === item.id
                                                        ? <input className="mp-cell-input" value={editBuf.distance} onChange={e => setEditBuf(p => ({ ...p, distance: e.target.value }))} placeholder="e.g. 1.5 km" />
                                                        : <span style={{ fontSize: '13px', color: '#64748b' }}>{item.distance || '—'}</span>}
                                                </td>
                                                <td className="mp-td" style={{ textAlign: 'center' }}>
                                                    <div className="mp-photo-cell">
                                                        {editingId === item.id ? (
                                                            <>
                                                                <img src={editBuf.imageUrl || '/placeholder-img.png'} className="mp-thumb" alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.src = '/placeholder-img.png'} />
                                                                <input ref={editImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickAttractionImg(e, setEditBuf)} />
                                                                <button className="mp-photo-btn" onClick={() => editImgRef.current.click()}><Pencil size={10} /></button>
                                                            </>
                                                        ) : (
                                                            <img src={item.imageUrl || '/placeholder-img.png'} className="mp-thumb" alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.src = '/placeholder-img.png'} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="mp-td" style={{ textAlign: 'center' }}>
                                                    {editingId === item.id ? (
                                                        <div className="mp-action-btns">
                                                            <button className="mp-icon-btn mp-save" onClick={saveEdit}><Save size={16} /></button>
                                                            <button className="mp-icon-btn mp-cancel" onClick={cancelEdit}><X size={16} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="mp-action-btns">
                                                            <button className="mp-icon-btn mp-edit" onClick={() => startEdit(item)}><Pencil size={16} /></button>
                                                            <button className="mp-icon-btn mp-delete" onClick={() => setDeleteId(item.id)}><Trash2 size={16} /></button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ Submit bar ══ */}
                <div className="ac2-actions-bar">
                    {saved && (
                        <div className="ac2-saved-toast" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #10b981' }}>
                            <CheckCircle size={15} /> Host city &amp; attractions saved!
                        </div>
                    )}
                    <button
                        className="ac2-submit-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)', opacity: saving ? 0.7 : 1 }}
                    >
                        <CheckCircle size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {/* ── Add Attraction Modal ── */}
            {showAdd && (
                <div className="mp-modal-overlay" onClick={closeAdd}>
                    <div className="mp-modal" onClick={e => e.stopPropagation()}>
                        <div className="mp-modal-header">
                            <span>Add Nearby Attraction</span>
                            <button className="mp-modal-close" onClick={closeAdd}><X size={18} /></button>
                        </div>
                        <div className="mp-modal-body">
                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Attraction Name *</label>
                                <input className="mp-modal-input" placeholder="e.g. Marienplatz" value={addBuf.name} onChange={e => setAddBuf(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Distance from Venue</label>
                                <input className="mp-modal-input" placeholder="e.g. 1.5 km" value={addBuf.distance} onChange={e => setAddBuf(p => ({ ...p, distance: e.target.value }))} />
                            </div>
                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Photo</label>
                                <div className="mp-modal-photo-row">
                                    {addBuf.imageUrl && (
                                        <img src={addBuf.imageUrl} className="mp-modal-preview" alt="" style={{ objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.src = '/placeholder-img.png'} />
                                    )}
                                    <input ref={addImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickAttractionImg(e, setAddBuf)} />
                                    <button className="mp-choose-btn" onClick={() => addImgRef.current.click()}><ImageIcon size={14} /> Choose Photo</button>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>* Max 2MB (JPG, PNG, WEBP)</p>
                            </div>
                        </div>
                        <div className="mp-modal-footer">
                            <button className="mp-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="mp-modal-save" onClick={saveAdd}><Save size={14} /> Add Attraction</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteId && (
                <div className="mp-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="mp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="mp-modal-header">
                            <span>Confirm Delete</span>
                            <button className="mp-modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
                        </div>
                        <div className="mp-modal-body" style={{ padding: '24px 20px', textAlign: 'center' }}>
                            <p style={{ color: '#475569', margin: 0, fontSize: '15px' }}>
                                Permanently delete this attraction?
                            </p>
                        </div>
                        <div className="mp-modal-footer">
                            <button className="mp-modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="mp-modal-save" onClick={confirmDelete} style={{ background: '#ef4444', color: 'white', border: 'none' }}>
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
