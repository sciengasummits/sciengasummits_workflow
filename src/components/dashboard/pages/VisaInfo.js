'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { getContent, updateContent } from '@/lib/api';
import {
    CheckCircle, Plane,
    Bold, Italic, Underline, Strikethrough,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link, Code, Minus, Type, ChevronDown
} from 'lucide-react';

/* ── COLOUR SWATCHES (shared pattern) ── */
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

/* ── Color Picker ── */
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


/* ── MAIN COMPONENT ── */
export default function VisaInfo() {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [saved, setSaved] = useState(false);

    const DEFAULT_HTML = `<p>Welcome to the Visa Information page.</p>
<p>Please refer to your local embassy or consulate for updated visa requirements.</p>`;

    useEffect(() => {
        getContent('visaInfo').then(data => {
            if (data?.html && editorRef.current) {
                editorRef.current.innerHTML = data.html;
            } else if (editorRef.current) {
                editorRef.current.innerHTML = DEFAULT_HTML;
            }
        }).catch(() => {
            if (editorRef.current) editorRef.current.innerHTML = DEFAULT_HTML;
        });
    }, []);

    const detectColor = useCallback(() => {
        savedRangeRef.current = saveSelection();
        setCurrentColor(normalizeColor(document.queryCommandValue('foreColor')));
    }, []);

    const handleEditorMouseUp = useCallback(() => detectColor(), [detectColor]);
    const handleEditorKeyUp = useCallback(() => detectColor(), [detectColor]);

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

    const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2800); };
    const handleSubmit = async () => {
        try {
            await updateContent('visaInfo', { html: editorRef.current?.innerHTML });
            flash();
        } catch (e) { console.error('Save failed', e); }
    };

    return (
        <div className="ac2-page">

            <div className="ac2-page-header">
                <div className="ac2-title-row">
                    <div className="ac2-title-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <Plane size={20} />
                    </div>
                    <div>
                        <h1 className="ac2-title">Visa Info</h1>
                        <p className="ac2-subtitle">Configure the Visa Information page content</p>
                    </div>
                </div>
            </div>

            <div className="ac2-section-card">
                <div className="ac2-section-head">
                    <span className="ac2-section-label">Visa Info Content</span>
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

                                <Btn onCmd={() => exec('bold')} title="Bold (Ctrl+B)"><Bold size={15} /></Btn>
                                <Btn onCmd={() => exec('italic')} title="Italic (Ctrl+I)"><Italic size={15} /></Btn>
                                <Btn onCmd={() => exec('underline')} title="Underline (Ctrl+U)"><Underline size={15} /></Btn>
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

            <div className="ac2-actions-bar">
                {saved && (
                    <div className="ac2-saved-toast" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #10b981' }}>
                        <CheckCircle size={15} /> Visa Info saved
                    </div>
                )}
                <button className="ac2-submit-btn" onClick={handleSubmit} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}>
                    <CheckCircle size={16} /> Submit Content
                </button>
            </div>

        </div>
    );
}
