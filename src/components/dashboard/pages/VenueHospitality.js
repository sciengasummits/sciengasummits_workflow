'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getContent, updateContent, uploadImage } from '@/lib/api';
import {
    CheckCircle, MapPin, Building, Globe, Thermometer, Users, Clock,
    Bold, Italic, Underline, Strikethrough,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link, Code, Minus, Type, ChevronDown,
    Image as ImageIcon, Plus, Trash2, Pencil, Save, X
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   COLOUR SWATCHES
══════════════════════════════════════════════════════════ */
const SWATCHES = [
    ['#000000', '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#eeeeee', '#f3f3f3', '#ffffff'],
    ['#ff0000', '#ff4444', '#ff9900', '#ffcc00', '#ffff00', '#00cc00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c'],
    ['#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#e06666', '#f6b26b', '#ffd966', '#93c47d'],
    ['#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6'],
    ['#674ea7', '#a64d79', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
];

/* ── Save/restore browser selection ── */
function saveSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0).cloneRange();
}
function restoreSelection(range) {
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
}

function normalizeColor(raw) {
    if (!raw || raw === 'transparent' || raw === '') return '#000000';
    const m = raw.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    return raw.startsWith('#') ? raw : '#000000';
}

/* ══════════════════════════════════════════════════════════
   Color Picker
══════════════════════════════════════════════════════════ */
const ColorPickerDropdown = ({ execWithSelection, currentColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        const away = (e) => { if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsOpen(false); };
        if (isOpen) document.addEventListener('mousedown', away);
        return () => document.removeEventListener('mousedown', away);
    }, [isOpen]);

    const applyColor = (cmd, color) => { execWithSelection(cmd, color); setIsOpen(false); };

    return (
        <div className="color-picker-wrapper" ref={popoverRef}>
            <button
                className={`editor-btn color-trigger-btn${isOpen ? ' active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); setIsOpen(v => !v); }}
                title="Text & Background Colour"
                type="button"
            >
                <div className="color-trigger-inner">
                    <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>A</span>
                    <span className="color-indicator-bar" style={{ backgroundColor: currentColor || '#000000' }} />
                </div>
                <ChevronDown size={11} style={{ opacity: 0.6, marginLeft: 2 }} />
            </button>

            {isOpen && (
                <div className="color-popover">
                    <div className="color-panels-container">
                        <div className="color-panel">
                            <div className="color-panel-title">Background Color</div>
                            <button className="color-panel-action" onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', 'transparent'); }}>Transparent</button>
                            <div className="color-grid">
                                {SWATCHES.map((row, i) => (
                                    <div key={`bg-${i}`} className="color-row">
                                        {row.map(c => (
                                            <button key={`bg-${c}`} className="color-swatch" style={{ backgroundColor: c }}
                                                onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', c); }} title={c} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="color-panel">
                            <div className="color-panel-title">Text Color</div>
                            <button className="color-panel-action" onMouseDown={(e) => { e.preventDefault(); applyColor('foreColor', '#000000'); }}>Reset to default</button>
                            <div className="color-grid">
                                {SWATCHES.map((row, i) => (
                                    <div key={`fg-${i}`} className="color-row">
                                        {row.map(c => (
                                            <button key={`fg-${c}`} className="color-swatch" style={{ backgroundColor: c }}
                                                onMouseDown={(e) => { e.preventDefault(); applyColor('foreColor', c); }} title={c} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Btn = ({ onCmd, title, children, active }) => (
    <button className={`editor-btn${active ? ' active' : ''}`} onMouseDown={(e) => { e.preventDefault(); onCmd(); }} title={title} type="button">
        {children}
    </button>
);
const Sep = () => <span className="toolbar-sep" />;

const genId = () => Math.random().toString(36).slice(2, 9);
const BLANK_ATTRACTION = { id: '', name: '', distance: '', imageUrl: '' };

/* Portal wrapper for modals (bypasses transform stacking context) */
function ModalPortal({ children }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function VenueHospitality() {
    /* ── Rich text editor ── */
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [currentColor, setCurrentColor] = useState('#000000');

    /* ── Map ── */
    const [mapLink, setMapLink] = useState('');

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
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingEdit, setIsUploadingEdit] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const addImgRef = useRef(null);
    const editImgRef = useRef(null);

    /* ── Hero Images ── */
    const [heroImages, setHeroImages] = useState([]);
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const heroImgRef = useRef(null);

    /* ── Status ── */
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const DEFAULT_HTML = `<p>Welcome to the conference venue. Please update this description from the dashboard.</p>`;

    /* ── Load ── */
    useEffect(() => {
        // Load venue content (rich text + map)
        getContent('venueContent').then(data => {
            if (data?.html && editorRef.current) {
                editorRef.current.innerHTML = data.html;
            } else if (editorRef.current) {
                editorRef.current.innerHTML = DEFAULT_HTML;
            }
            if (data?.mapLink) setMapLink(data.mapLink);
        }).catch(() => {
            if (editorRef.current) editorRef.current.innerHTML = DEFAULT_HTML;
        });

        // Load host city & attractions
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
        // Load hero images
        getContent('venueHeroImages').then(data => {
            if (data && Array.isArray(data.images)) {
                setHeroImages(data.images);
            }
        }).catch(() => { });
    }, []);

    /* ── Color detection ── */
    const detectColor = useCallback(() => {
        savedRangeRef.current = saveSelection();
        setCurrentColor(normalizeColor(document.queryCommandValue('foreColor')));
    }, []);

    const handleEditorMouseUp = useCallback(() => detectColor(), [detectColor]);
    const handleEditorKeyUp = useCallback(() => detectColor(), [detectColor]);

    /* ── Exec ── */
    const exec = useCallback((cmd, value = null) => {
        editorRef.current?.focus();
        if (savedRangeRef.current) restoreSelection(savedRangeRef.current);
        document.execCommand(cmd, false, value);
        savedRangeRef.current = saveSelection();
    }, []);

    const execWithSelection = useCallback((cmd, value) => {
        editorRef.current?.focus();
        if (savedRangeRef.current) restoreSelection(savedRangeRef.current);
        document.execCommand(cmd, false, value);
        savedRangeRef.current = saveSelection();
    }, []);

    const handleFontFamily = (e) => { e.target.blur(); exec('fontName', e.target.value); };
    const handleFontSize = (e) => { e.target.blur(); exec('fontSize', e.target.value); };

    const insertLink = () => {
        editorRef.current?.focus();
        if (savedRangeRef.current) restoreSelection(savedRangeRef.current);
        const url = prompt('Enter URL:', 'https://');
        if (url && url !== 'https://') document.execCommand('createLink', false, url);
    };

    /* ── Image Upload helpers ── */
    const pickCityImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try { const { url } = await uploadImage(file); setCityImageUrl(url); }
        catch (err) { alert('Upload failed: ' + err.message); }
        e.target.value = '';
    };

    const pickHeroImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingHero(true);
        try {
            const { url } = await uploadImage(file);
            setHeroImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url }]);
        } catch (err) { alert('Upload failed: ' + err.message); }
        finally { setIsUploadingHero(false); }
        e.target.value = '';
    };

    const removeHeroImage = (id) => {
        if (confirm('Remove this hero image?')) {
            setHeroImages(prev => prev.filter(img => img.id !== id));
        }
    };

    const pickAttractionImg = async (e, setter, setUploading) => {
        const file = e.target.files[0];
        if (!file) return;
        if (setUploading) setUploading(true);
        try {
            const { url } = await uploadImage(file);
            setter(prev => ({ ...prev, imageUrl: url }));
        } catch (err) { alert('Upload failed: ' + err.message); }
        finally { if (setUploading) setUploading(false); }
        e.target.value = '';
    };

    /* ── Save All ── */
    const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };
    const handleSubmit = async () => {
        setSaving(true);
        try {
            await updateContent('venueContent', { html: editorRef.current?.innerHTML, mapLink });
            await updateContent('hostCityAttractions', {
                cityName, desc1, desc2,
                population, temperature, timezone,
                cityImageUrl, attractions
            });
            await updateContent('venueHeroImages', { images: heroImages });
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
                    <div className="ac2-title-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <Building size={20} />
                    </div>
                    <div>
                        <h1 className="ac2-title">Conference Venue</h1>
                        <p className="ac2-subtitle">Manage all venue content — city info, description, stats, attractions & map</p>
                    </div>
                </div>
            </div>

            <div style={modalOpen ? { filter: 'blur(3px)', pointerEvents: 'none' } : {}}>

                {/* ══ Section 1 – About the Host City ══ */}
                <div className="ac2-section-card">
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">About the Host City</span>
                        <span className="ac2-section-badge"><Globe size={12} style={{ marginRight: 4 }} />City Info</span>
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

                {/* ══ Section 2 – Venue Description (Rich Text) ══ */}
                <div className="ac2-section-card" style={{ marginTop: '1.5rem' }}>
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">Venue Description</span>
                        <span className="ac2-section-badge">Rich Text</span>
                    </div>
                    <div className="ac2-editor-body">
                        <div className="ac2-field-row">
                            <label className="ac2-field-label">Edit Content</label>
                            <div className="editor-card">
                                <div className="editor-toolbar">
                                    <select className="toolbar-select font-family-select" onChange={handleFontFamily} defaultValue="sans-serif" onMouseDown={() => { savedRangeRef.current = saveSelection(); }}>
                                        <option value="Arial">Arial</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="sans-serif">Source Sans Pro</option>
                                        <option value="Verdana">Verdana</option>
                                    </select>
                                    <select className="toolbar-select font-size-select" onChange={handleFontSize} defaultValue="3" onMouseDown={() => { savedRangeRef.current = saveSelection(); }}>
                                        <option value="1">8px</option>
                                        <option value="2">10px</option>
                                        <option value="3">12px</option>
                                        <option value="4">14px</option>
                                        <option value="5">18px</option>
                                        <option value="6">24px</option>
                                        <option value="7">36px</option>
                                    </select>
                                    <Sep />
                                    <ColorPickerDropdown execWithSelection={execWithSelection} currentColor={currentColor} />
                                    <Sep />
                                    <Btn onCmd={() => exec('bold')} title="Bold"><Bold size={15} /></Btn>
                                    <Btn onCmd={() => exec('italic')} title="Italic"><Italic size={15} /></Btn>
                                    <Btn onCmd={() => exec('underline')} title="Underline"><Underline size={15} /></Btn>
                                    <Btn onCmd={() => exec('strikeThrough')} title="Strikethrough"><Strikethrough size={15} /></Btn>
                                    <Sep />
                                    <Btn onCmd={() => exec('insertUnorderedList')} title="Bullet List"><List size={15} /></Btn>
                                    <Btn onCmd={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered size={15} /></Btn>
                                    <Sep />
                                    <Btn onCmd={() => exec('justifyLeft')} title="Align Left"><AlignLeft size={15} /></Btn>
                                    <Btn onCmd={() => exec('justifyCenter')} title="Align Center"><AlignCenter size={15} /></Btn>
                                    <Btn onCmd={() => exec('justifyRight')} title="Align Right"><AlignRight size={15} /></Btn>
                                    <Btn onCmd={() => exec('justifyFull')} title="Justify"><AlignJustify size={15} /></Btn>
                                    <Sep />
                                    <Btn onCmd={insertLink} title="Insert Link"><Link size={15} /></Btn>
                                    <Btn onCmd={() => exec('formatBlock', 'pre')} title="Code Block"><Code size={15} /></Btn>
                                    <Btn onCmd={() => exec('insertHorizontalRule')} title="Horizontal Rule"><Minus size={15} /></Btn>
                                    <Sep />
                                    <Btn onCmd={() => exec('removeFormat')} title="Clear Formatting"><Type size={15} /></Btn>
                                </div>

                                <div
                                    className="editor-body"
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                    onMouseUp={handleEditorMouseUp}
                                    onKeyUp={handleEditorKeyUp}
                                    onSelect={handleEditorMouseUp}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ Section 3 – Nearby Attractions ══ */}
                <div className="ac2-section-card" style={{ marginTop: '1.5rem' }}>
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">Nearby Attractions</span>
                        <span className="ac2-section-badge"><MapPin size={12} style={{ marginRight: 4 }} />{attractions.length} items</span>
                    </div>
                    <div className="ac2-editor-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                                Add, edit or remove places shown in the &quot;Nearby Attractions&quot; section.
                            </p>
                            <button className="mp-add-btn" onClick={openAdd}>
                                Add Attraction <Plus size={15} />
                            </button>
                        </div>

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
                                                                <img src={editBuf.imageUrl || '/placeholder-img.png'} className="mp-thumb" alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6, opacity: isUploadingEdit ? 0.5 : 1 }} onError={e => e.target.src = '/placeholder-img.png'} />
                                                                <input ref={editImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickAttractionImg(e, setEditBuf, setIsUploadingEdit)} />
                                                                <button className="mp-photo-btn" onClick={() => editImgRef.current.click()} disabled={isUploadingEdit}><Pencil size={10} /></button>
                                                            </>
                                                        ) : (
                                                            <img src={item.imageUrl || '/placeholder-img.png'} className="mp-thumb" alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.src = '/placeholder-img.png'} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="mp-td" style={{ textAlign: 'center' }}>
                                                    {editingId === item.id ? (
                                                        <div className="mp-action-btns">
                                                            <button className="mp-icon-btn mp-save" onClick={saveEdit} disabled={isUploadingEdit}><Check size={16} /></button>
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

                {/* ══ Section 4 – Venue Hero Carousel Images ══ */}
                <div className="ac2-section-card" style={{ marginTop: '1.5rem' }}>
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">Venue Hero Carousel Images</span>
                        <span className="ac2-section-badge">Slider</span>
                    </div>
                    <div className="ac2-editor-body" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Images to display in the main hero slider on the Venue page.</p>
                            <div>
                                <input ref={heroImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickHeroImage} />
                                <button className="mp-choose-btn" onClick={() => heroImgRef.current.click()} disabled={isUploadingHero} style={{ background: '#083344', color: '#fff', border: 'none', padding: '6px 12px' }}>
                                    {isUploadingHero ? 'Uploading...' : <><Plus size={14} /> Add Image</>}
                                </button>
                            </div>
                        </div>

                        {heroImages.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                                <ImageIcon size={32} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>No hero images added. Frontend will use default images.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {heroImages.map((img, idx) => (
                                    <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                                        <img src={img.url} alt={`Hero ${idx + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                                        <button 
                                            onClick={() => removeHeroImage(img.id)}
                                            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                                            title="Remove Image"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '4px 6px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Slide {idx + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ Section 5 – Map Location ══ */}
                <div className="ac2-section-card" style={{ marginTop: '1.5rem' }}>
                    <div className="ac2-section-head">
                        <span className="ac2-section-label">Location Map</span>
                        <span className="ac2-section-badge"><MapPin size={12} style={{ marginRight: 4 }} />Google Maps HTML</span>
                    </div>
                    <div className="ac2-editor-body">
                        <div className="vh2-map-flex">
                            <div className="vh2-map-input-area">
                                <label className="ac2-field-label">Embed Map URL</label>
                                <div className="vh2-input-wrap">
                                    <div className="vh2-input-icon"><Code size={16} /></div>
                                    <input
                                        type="url"
                                        className="vh2-map-input"
                                        placeholder="e.g. https://www.google.com/maps/embed?pb=..."
                                        value={mapLink}
                                        onChange={(e) => setMapLink(e.target.value)}
                                    />
                                </div>
                                <p className="vh2-map-help">Paste the `src` URL found in Google Maps {"->"} Share {"->"} Embed a map.</p>
                            </div>

                            {/* Live Preview */}
                            <div className="vh2-map-preview-zone">
                                {mapLink ? (
                                    <iframe
                                        src={mapLink}
                                        className="vh2-iframe"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Venue Preview Map"
                                    />
                                ) : (
                                    <div className="vh2-map-placeholder">
                                        <MapPin size={28} className="vh2-placeholder-icon" />
                                        <span>No map link provided. Enter a URL to see the preview.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ Submit bar ══ */}
                <div className="ac2-actions-bar">
                    {saved && (
                        <div className="ac2-saved-toast" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #10b981' }}>
                            <CheckCircle size={15} /> All venue content saved!
                        </div>
                    )}
                    <button
                        className="ac2-submit-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)', opacity: saving ? 0.7 : 1 }}
                    >
                        <CheckCircle size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {/* ── Add Attraction Modal ── */}
            {showAdd && (
                <ModalPortal>
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
                                    {addBuf.imageUrl ? (
                                        <img src={addBuf.imageUrl} className="mp-modal-preview" alt="" style={{ objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.src = '/placeholder-img.png'} />
                                    ) : (
                                        <div className="mp-modal-preview-placeholder" style={{ width: 120, height: 80, borderRadius: 8, background: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                            No Photo
                                        </div>
                                    )}
                                    <input ref={addImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickAttractionImg(e, setAddBuf, setIsUploading)} />
                                    <button className="mp-choose-btn" onClick={() => addImgRef.current.click()} disabled={isUploading}>
                                        {isUploading ? 'Uploading...' : <><ImageIcon size={14} /> Choose Photo</>}
                                    </button>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>* Max 2MB (JPG, PNG, WEBP)</p>
                            </div>
                        </div>
                        <div className="mp-modal-footer">
                            <button className="mp-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="mp-modal-save" onClick={saveAdd} disabled={isUploading}>
                                {isUploading ? 'Uploading Image...' : <><Save size={14} /> Add Attraction</>}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteId && (
                <ModalPortal>
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
                </ModalPortal>
            )}
        </div>
    );
}
