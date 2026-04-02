'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import {
    CheckCircle, Plus, Trash2, FileImage, Upload,
    Bold, Italic, Underline, Strikethrough,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link, Code, Minus, Type,
    ChevronDown, BedDouble
} from 'lucide-react';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COLOUR SWATCHES  (identical to AboutConference)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SWATCHES = [
    ['#000000', '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#eeeeee', '#f3f3f3', '#ffffff'],
    ['#ff0000', '#ff4444', '#ff9900', '#ffcc00', '#ffff00', '#00cc00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c'],
    ['#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#e06666', '#f6b26b', '#ffd966', '#93c47d'],
    ['#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6'],
    ['#674ea7', '#a64d79', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
];

/* â”€â”€ Save / restore browser text-selection â”€â”€ */
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

/* â”€â”€ rgb(...) â†’ #rrggbb â”€â”€ */
function normalizeColor(raw) {
    if (!raw || raw === 'transparent' || raw === '') return '#000000';
    const m = raw.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    return raw.startsWith('#') ? raw : '#000000';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Colour picker dropdown (from AboutConference)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
                        {/* Background colour */}
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
                            <button className="color-panel-select-btn" onMouseDown={(e) => e.preventDefault()}>Select</button>
                        </div>

                        {/* Text colour */}
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
                            <button className="color-panel-select-btn" onMouseDown={(e) => e.preventDefault()}>Select</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* â”€â”€ Simple toolbar button (reuses AboutConference CSS) â”€â”€ */
const Btn = ({ onCmd, title, children, active }) => (
    <button
        className={`editor-btn${active ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); onCmd(); }}
        title={title}
        type="button"
    >
        {children}
    </button>
);

const Sep = () => <span className="toolbar-sep" />;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Row factory
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let _uid = 4;
const makeRow = () => ({ id: _uid++, file: null, previewUrl: '', title: '' });

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Accommodation() {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [saved, setSaved] = useState(false);
    const [rows, setRows] = useState([
        { id: 1, file: null, previewUrl: '', title: '' },
        { id: 2, file: null, previewUrl: '', title: '' },
        { id: 3, file: null, previewUrl: '', title: '' },
    ]);

    /* Detect colour under cursor */
    const detectColor = useCallback(() => {
        savedRangeRef.current = saveSelection();
        setCurrentColor(normalizeColor(document.queryCommandValue('foreColor')));
    }, []);

    const handleEditorMouseUp = useCallback(() => detectColor(), [detectColor]);
    const handleEditorKeyUp = useCallback(() => detectColor(), [detectColor]);

    /* Execute + persist selection */
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

    /* Font / size dropdowns */
    const handleFontFamily = (e) => { e.target.blur(); exec('fontName', e.target.value); };
    const handleFontSize = (e) => { e.target.blur(); exec('fontSize', e.target.value); };

    /* Link */
    const insertLink = () => {
        editorRef.current?.focus();
        if (savedRangeRef.current) restoreSelection(savedRangeRef.current);
        const url = prompt('Enter URL:', 'https://');
        if (url && url !== 'https://') document.execCommand('createLink', false, url);
    };

    /* Image rows */
    const handleFileChange = (id, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setRows(p => (p || []).map(r => r && r.id === id ? { ...r, file, previewUrl: URL.createObjectURL(file) } : r));
        e.target.value = '';
    };
    const handleTitleChange = (id, val) =>
        setRows(p => (p || []).map(r => r && r.id === id ? { ...r, title: val } : r));
    const deleteRow = (id) => setRows(p => (p || []).filter(r => r && r.id !== id));
    const addRow = () => setRows(p => [...p, makeRow()]);

    const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2800); };
    const handleSubmit = () => {
        console.log('Submitting accommodation');
        flash();
    };

    return (
        <div className="ac2-page">

            {/* â”€â”€ Page header â”€â”€ */}
            <div className="ac2-page-header">
                <div className="ac2-title-row">
                    <div className="ac2-title-icon">
                        <BedDouble size={20} />
                    </div>
                    <div>
                        <h1 className="ac2-title">Accommodation</h1>
                        <p className="ac2-subtitle">Manage venue accommodation details and photo gallery</p>
                    </div>
                </div>
            </div>

            {/* â•â• Section 1 â€” Rich-text editor (uses AboutConference toolbar) â•â• */}
            <div className="ac2-section-card">
                <div className="ac2-section-head">
                    <span className="ac2-section-label">Venue Description</span>
                    <span className="ac2-section-badge">Rich Text</span>
                </div>

                <div className="ac2-editor-body">
                    <div className="ac2-field-row">
                        <label className="ac2-field-label">Edit Venue</label>

                        {/* â”€â”€ Editor card â€” reuses AboutConference CSS classes â”€â”€ */}
                        <div className="editor-card">

                            {/* â”€â”€ Toolbar (exact same as AboutConference) â”€â”€ */}
                            <div className="editor-toolbar">

                                {/* Font family */}
                                <select
                                    className="toolbar-select font-family-select"
                                    onChange={handleFontFamily}
                                    title="Font Family"
                                    defaultValue="sans-serif"
                                    onMouseDown={() => { savedRangeRef.current = saveSelection(); }}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="sans-serif">Source Sans Pro</option>
                                    <option value="Verdana">Verdana</option>
                                </select>

                                {/* Font size */}
                                <select
                                    className="toolbar-select font-size-select"
                                    onChange={handleFontSize}
                                    title="Font Size"
                                    defaultValue="3"
                                    onMouseDown={() => { savedRangeRef.current = saveSelection(); }}
                                >
                                    <option value="1">8px</option>
                                    <option value="2">10px</option>
                                    <option value="3">12px</option>
                                    <option value="4">14px</option>
                                    <option value="5">18px</option>
                                    <option value="6">24px</option>
                                    <option value="7">36px</option>
                                </select>

                                <Sep />

                                {/* Colour picker */}
                                <ColorPickerDropdown execWithSelection={execWithSelection} currentColor={currentColor} />

                                <Sep />

                                {/* Formatting */}
                                <Btn onCmd={() => exec('bold')} title="Bold (Ctrl+B)">        <Bold size={15} /></Btn>
                                <Btn onCmd={() => exec('italic')} title="Italic (Ctrl+I)">      <Italic size={15} /></Btn>
                                <Btn onCmd={() => exec('underline')} title="Underline (Ctrl+U)">   <Underline size={15} /></Btn>
                                <Btn onCmd={() => exec('strikeThrough')} title="Strikethrough">        <Strikethrough size={15} /></Btn>

                                <Sep />

                                {/* Lists */}
                                <Btn onCmd={() => exec('insertUnorderedList')} title="Bullet List">    <List size={15} /></Btn>
                                <Btn onCmd={() => exec('insertOrderedList')} title="Numbered List">  <ListOrdered size={15} /></Btn>

                                <Sep />

                                {/* Alignment */}
                                <Btn onCmd={() => exec('justifyLeft')} title="Align Left">    <AlignLeft size={15} /></Btn>
                                <Btn onCmd={() => exec('justifyCenter')} title="Align Center">  <AlignCenter size={15} /></Btn>
                                <Btn onCmd={() => exec('justifyRight')} title="Align Right">   <AlignRight size={15} /></Btn>
                                <Btn onCmd={() => exec('justifyFull')} title="Justify">       <AlignJustify size={15} /></Btn>

                                <Sep />

                                {/* Misc */}
                                <Btn onCmd={insertLink} title="Insert Link">        <Link size={15} /></Btn>
                                <Btn onCmd={() => exec('formatBlock', 'pre')} title="Code Block">         <Code size={15} /></Btn>
                                <Btn onCmd={() => exec('insertHorizontalRule')} title="Horizontal Rule">    <Minus size={15} /></Btn>

                                <Sep />

                                <Btn onCmd={() => exec('removeFormat')} title="Clear Formatting"><Type size={15} /></Btn>
                            </div>

                            {/* Editable area */}
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

            {/* â•â• Section 2 â€” Photo Gallery â•â• */}
            <div className="ac2-section-card">
                <div className="ac2-section-head">
                    <span className="ac2-section-label">Photo Gallery</span>
                    <span className="ac2-section-badge">
                        <FileImage size={12} style={{ marginRight: 4 }} />
                        {rows.length} {rows.length === 1 ? 'image' : 'images'}
                    </span>
                </div>

                <div className="ac2-table-wrap">
                    <table className="ac2-table">
                        <thead>
                            <tr className="ac2-thead-row">
                                <th className="ac2-th ac2-col-sno">#</th>
                                <th className="ac2-th ac2-col-img">Image</th>
                                <th className="ac2-th ac2-col-title">Image Title</th>
                                <th className="ac2-th ac2-col-del">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(rows || []).filter(r => !!r).map((row, idx) => (
                                <tr key={row.id} className="ac2-tr">
                                    <td className="ac2-td ac2-td-sno">
                                        <span className="ac2-sno-chip">{idx + 1}</span>
                                    </td>

                                    <td className="ac2-td ac2-td-img">
                                        <div className="ac2-upload-zone">
                                            {row.previewUrl
                                                ? <img src={row.previewUrl} alt="preview" className="ac2-preview-img" />
                                                : (
                                                    <div className="ac2-no-img-placeholder">
                                                        <Upload size={16} className="ac2-upload-icon" />
                                                        <span>No image selected</span>
                                                    </div>
                                                )
                                            }
                                            <label className="ac2-upload-btn-label">
                                                <input type="file" accept="image/*" style={{ display: 'none' }}
                                                    onChange={(e) => handleFileChange(row.id, e)} />
                                                <span className="ac2-choose-btn">
                                                    <Upload size={12} />
                                                    {row.file ? 'Change' : 'Choose File'}
                                                </span>
                                                {row.file && <span className="ac2-filename">{row.file.name}</span>}
                                            </label>
                                        </div>
                                    </td>

                                    <td className="ac2-td ac2-td-title">
                                        <input type="text" className="ac2-title-input"
                                            placeholder="Enter image title..."
                                            value={row.title}
                                            onChange={(e) => handleTitleChange(row.id, e.target.value)} />
                                    </td>

                                    <td className="ac2-td ac2-td-del">
                                        <button className="ac2-del-btn" onClick={() => deleteRow(row.id)} title="Remove row">
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="ac2-empty">
                                        <FileImage size={32} className="ac2-empty-icon" />
                                        <p>No images added yet. Click <strong>Add Image Row</strong> to get started.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="ac2-table-footer">
                    <button className="ac2-add-btn" onClick={addRow}>
                        <Plus size={15} /> Add Image Row
                    </button>
                    <span className="ac2-row-count">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* â•â• Submit bar â•â• */}
            <div className="ac2-actions-bar">
                {saved && (
                    <div className="ac2-saved-toast">
                        <CheckCircle size={15} /> Changes saved successfully
                    </div>
                )}
                <button className="ac2-submit-btn" onClick={handleSubmit}>
                    <CheckCircle size={16} /> Submit Content
                </button>
            </div>

        </div>
    );
}

