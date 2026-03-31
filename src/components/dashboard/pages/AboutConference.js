'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link, Code, Minus, Type,
    ChevronDown, CheckCircle, AlertCircle
} from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

/* â”€â”€â”€ Pre-filled content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const INITIAL_CONTENT = `<p><strong>Dear Esteemed Participants,</strong></p>

<p>It is with great joy and enthusiasm that we extend a warm invitation to participants from around the world to join us for the <strong>Annual International Conference on Liutex and Vortex Identification (LIUTEXVORTEXSUMMIT2026)</strong>, taking place in <strong>Outram, Singapore, from December 14â€“16, 2026</strong>.</p>

<p>This conference brings together leading researchers, academicians, computational scientists, engineers, and industry professionals to explore recent developments, theoretical foundations, numerical methods, and real-world applications of Liutex-based vortex analysis.</p>

<p>The theme for LIUTEXVORTEXSUMMIT2026, <strong>"Liutex Theory and Applications in Vortex Identification and Vortex Dynamics,"</strong> aims to bring together visionaries, innovators, and scholars from across the globe. This conference will provide a dynamic platform to explore groundbreaking research through carefully curated scientific sessions covering <strong>Liutex Theory, Vortex Identification, Vortex Dynamics</strong>, and their real-world applications in <strong>aerospace, mechanical, civil, and environmental engineering</strong>.</p>

<p>The future of fluid mechanics and vortex science has never looked brighter. Don't miss this exceptional opportunity to connect, collaborate, and innovate with the global research community.</p>

<p><strong>Mark your calendars</strong> for this impactful event that promises to shape the future of vortex science. We look forward to welcoming you to <strong>Singapore</strong> for an unforgettable experience!</p>

<p>&nbsp;</p>

<p><strong>Warm regards,</strong><br/>
Conference Organizer<br/>
<strong>Organizing Committee</strong><br/>
<em><strong>LIUTEXVORTEXSUMMIT2026</strong></em></p>`;

/* â”€â”€â”€ Color palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SWATCHES = [
    ['#000000', '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#eeeeee', '#f3f3f3', '#ffffff'],
    ['#ff0000', '#ff4444', '#ff9900', '#ffcc00', '#ffff00', '#00cc00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c'],
    ['#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#e06666', '#f6b26b', '#ffd966', '#93c47d'],
    ['#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6'],
    ['#674ea7', '#a64d79', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
];

/* â”€â”€â”€ Shared: save & restore browser text selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€ Color Picker Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ColorPickerDropdown = ({ execWithSelection, currentColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const applyColor = (cmd, color) => {
        execWithSelection(cmd, color);
        setIsOpen(false);
    };

    return (
        <div className="color-picker-wrapper" ref={popoverRef}>
            <button
                className={`editor-btn color-trigger-btn${isOpen ? ' active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); setIsOpen(v => !v); }}
                title="Text & Background Color"
                type="button"
            >
                <div className="color-trigger-inner">
                    <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>A</span>
                    <span
                        className="color-indicator-bar"
                        style={{ backgroundColor: currentColor || '#000000' }}
                    />
                </div>
                <ChevronDown size={11} style={{ opacity: 0.6, marginLeft: 2 }} />
            </button>

            {isOpen && (
                <div className="color-popover">
                    <div className="color-panels-container">
                        {/* Background Color */}
                        <div className="color-panel">
                            <div className="color-panel-title">Background Color</div>
                            <button
                                className="color-panel-action"
                                onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', 'transparent'); }}
                            >Transparent</button>
                            <div className="color-grid">
                                {SWATCHES.map((row, i) => (
                                    <div key={`bg-${i}`} className="color-row">
                                        {row.map(color => (
                                            <button
                                                key={`bg-${color}`}
                                                className="color-swatch"
                                                style={{ backgroundColor: color }}
                                                onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', color); }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <button className="color-panel-select-btn" onMouseDown={(e) => e.preventDefault()}>Select</button>
                        </div>

                        {/* Foreground Color */}
                        <div className="color-panel">
                            <div className="color-panel-title">Text Color</div>
                            <button
                                className="color-panel-action"
                                onMouseDown={(e) => { e.preventDefault(); applyColor('foreColor', '#000000'); }}
                            >Reset to default</button>
                            <div className="color-grid">
                                {SWATCHES.map((row, i) => (
                                    <div key={`fg-${i}`} className="color-row">
                                        {row.map(color => (
                                            <button
                                                key={`fg-${color}`}
                                                className="color-swatch"
                                                style={{ backgroundColor: color }}
                                                onMouseDown={(e) => { e.preventDefault(); applyColor('foreColor', color); }}
                                                title={color}
                                            />
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

/* â”€â”€â”€ Toolbar Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€ Separator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Sep = () => <span className="toolbar-sep" />;

/* â”€â”€â”€ Normalize browser color to hex â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function normalizeColor(raw) {
    if (!raw || raw === 'transparent' || raw === '') return '#000000';
    const m = raw.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (m) {
        return '#' + [m[1], m[2], m[3]]
            .map(n => parseInt(n).toString(16).padStart(2, '0'))
            .join('');
    }
    return raw.startsWith('#') ? raw : '#000000';
}

/* â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AboutConference() {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

    /* Load saved content from backend on mount */
    useEffect(() => {
        getContent('aboutContent').then(data => {
            if (data?.html && editorRef.current) {
                editorRef.current.innerHTML = data.html;
            }
        }).catch(() => { });
    }, []);

    /* Detect current text color at cursor/selection */
    const detectColor = useCallback(() => {
        savedRangeRef.current = saveSelection();
        const raw = document.queryCommandValue('foreColor');
        setCurrentColor(normalizeColor(raw));
    }, []);

    const handleEditorMouseUp = useCallback(() => { detectColor(); }, [detectColor]);
    const handleEditorKeyUp = useCallback(() => { detectColor(); }, [detectColor]);

    const exec = useCallback((cmd, value = null) => {
        editorRef.current?.focus();
        if (savedRangeRef.current) {
            restoreSelection(savedRangeRef.current);
        }
        document.execCommand(cmd, false, value);
        savedRangeRef.current = saveSelection();
    }, []);

    const execWithSelection = useCallback((cmd, value) => {
        editorRef.current?.focus();
        if (savedRangeRef.current) {
            restoreSelection(savedRangeRef.current);
        }
        document.execCommand(cmd, false, value);
        savedRangeRef.current = saveSelection();
    }, []);

    const handleFontFamily = (e) => {
        e.target.blur();
        exec('fontName', e.target.value);
    };
    const handleFontSize = (e) => {
        e.target.blur();
        exec('fontSize', e.target.value);
    };

    const insertLink = () => {
        editorRef.current?.focus();
        if (savedRangeRef.current) restoreSelection(savedRangeRef.current);
        const url = prompt('Enter URL:', 'https://');
        if (url && url !== 'https://') {
            document.execCommand('createLink', false, url);
        }
    };

    /* Save to MongoDB via backend */
    const handleSubmit = async () => {
        const content = editorRef.current?.innerHTML;
        setSaveStatus('saving');
        try {
            await updateContent('aboutContent', { html: content });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 4000);
        }
    };

    return (
        <div className="ac-page">
            {/* Page title */}
            <div className="ac-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <h1 className="ac-page-title">ABOUT CONFERENCE</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {saveStatus === 'saved' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid #4ade80', color: '#16a34a', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Saved to database
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#dc2626', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
                            <AlertCircle size={14} /> Save failed â€“ check backend
                        </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '5px 10px', borderRadius: '6px' }}>
                        Syncs live to LIUTEXVORTEXSUMMIT2026 website
                    </span>
                </div>
            </div>

            {/* Editor card */}
            <div className="editor-card">
                {/* Toolbar */}
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

                    {/* Color picker */}
                    <ColorPickerDropdown execWithSelection={execWithSelection} currentColor={currentColor} />

                    <Sep />

                    {/* Text formatting */}
                    <Btn onCmd={() => exec('bold')} title="Bold (Ctrl+B)"><Bold size={15} /></Btn>
                    <Btn onCmd={() => exec('italic')} title="Italic (Ctrl+I)"><Italic size={15} /></Btn>
                    <Btn onCmd={() => exec('underline')} title="Underline (Ctrl+U)"><Underline size={15} /></Btn>
                    <Btn onCmd={() => exec('strikeThrough')} title="Strikethrough"><Strikethrough size={15} /></Btn>

                    <Sep />

                    {/* Lists */}
                    <Btn onCmd={() => exec('insertUnorderedList')} title="Bullet List"><List size={15} /></Btn>
                    <Btn onCmd={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered size={15} /></Btn>

                    <Sep />

                    {/* Alignment */}
                    <Btn onCmd={() => exec('justifyLeft')} title="Align Left"><AlignLeft size={15} /></Btn>
                    <Btn onCmd={() => exec('justifyCenter')} title="Align Center"><AlignCenter size={15} /></Btn>
                    <Btn onCmd={() => exec('justifyRight')} title="Align Right"><AlignRight size={15} /></Btn>
                    <Btn onCmd={() => exec('justifyFull')} title="Justify"><AlignJustify size={15} /></Btn>

                    <Sep />

                    {/* Misc */}
                    <Btn onCmd={insertLink} title="Insert Link"><Link size={15} /></Btn>
                    <Btn onCmd={() => exec('formatBlock', 'pre')} title="Code Block"><Code size={15} /></Btn>
                    <Btn onCmd={() => exec('insertHorizontalRule')} title="Horizontal Rule"><Minus size={15} /></Btn>

                    <Sep />

                    <Btn onCmd={() => exec('removeFormat')} title="Clear Formatting"><Type size={15} /></Btn>
                </div>

                {/* Editable body */}
                <div
                    className="editor-body"
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: INITIAL_CONTENT }}
                    spellCheck={false}
                    onMouseUp={handleEditorMouseUp}
                    onKeyUp={handleEditorKeyUp}
                    onSelect={handleEditorMouseUp}
                />
            </div>

            {/* Submit */}
            <div className="ac-actions">
                <button
                    className="btn-submit-content"
                    onClick={handleSubmit}
                    disabled={saveStatus === 'saving'}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saveStatus === 'saving' ? 0.7 : 1 }}
                >
                    {saveStatus === 'saving'
                        ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        : null}
                    {saveStatus === 'saving' ? 'Saving to Database...' : 'Save to Database'}
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

