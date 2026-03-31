'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, CheckCircle } from 'lucide-react';

const CONF_NAME = '2nd International Meet & Expo on Renewable and Sustainable Energy';

const INITIAL_DATA = [
    {
        id: 1,
        conferenceName: CONF_NAME,
        shortName: 'RENEWABLEMEET2026',
        entityName: 'sciengasummits',
        responseFrom: 'halasz.marianna@rkk.uni-obuda.hu',
        name: 'Prof. Dr. Marianna Ãgnes HalÃ¡sz',
        response: 'unabletoattend',
        date: '2026-02-20',
        category: '',
    },
    {
        id: 2,
        conferenceName: CONF_NAME,
        shortName: 'RENEWABLEMEET2026',
        entityName: 'sciengasummits',
        responseFrom: 'fayaz81sg@gmail.com',
        name: 'Fayyaz Ali Shah',
        response: 'asking support',
        date: '2026-02-19',
        category: '',
    },
    {
        id: 3,
        conferenceName: CONF_NAME,
        shortName: 'RENEWABLEMEET2026',
        entityName: 'sciengasummits',
        responseFrom: 'vijayakumar.varadarajan@gmail.com',
        name: 'Vijayakumar Varadarajan',
        response: 'asking support',
        date: '2026-02-14',
        category: '',
    },
    {
        id: 4,
        conferenceName: CONF_NAME,
        shortName: 'RENEWABLEMEET2026',
        entityName: 'sciengasummits',
        responseFrom: 'tillmann.philippi@liwest.at',
        name: 'Tillmann Philippi',
        response: 'unabletoattend',
        date: '2026-02-14',
        category: '',
    },
    {
        id: 5,
        conferenceName: CONF_NAME,
        shortName: 'RENEWABLEMEET2026',
        entityName: 'sciengasummits',
        responseFrom: 'rsikkema@hetnet.nl',
        name: 'Dr. Sikkema Richard',
        response: 'unabletoattend',
        date: '2026-02-13',
        category: '',
    },
];

const BLANK_ROW = {
    conferenceName: CONF_NAME,
    shortName: 'RENEWABLEMEET2026',
    entityName: 'acmemeetings',
    responseFrom: '',
    name: '',
    response: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
};

function ResponseBadge({ value }) {
    if (!value) return null;
    const isUnable = value.toLowerCase().includes('unable');
    return (
        <span className={`du-badge ${isUnable ? 'du-badge-red' : 'du-badge-blue'}`}>
            {value}
        </span>
    );
}

export default function DailyUpdate() {
    const [rows, setRows] = useState(INITIAL_DATA);
    const [nextId, setNextId] = useState(INITIAL_DATA.length + 1);
    const [editingId, setEditingId] = useState(null);
    const [editBuf, setEditBuf] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [addBuf, setAddBuf] = useState({ ...BLANK_ROW });
    const [saved, setSaved] = useState(false);

    /* â”€â”€ Edit â”€â”€ */
    const startEdit = (row) => { setEditingId(row.id); setEditBuf({ ...row }); };
    const cancelEdit = () => { setEditingId(null); setEditBuf({}); };
    const saveEdit = () => {
        setRows(prev => prev.map(r => r.id === editingId ? { ...editBuf } : r));
        setEditingId(null);
        flashSaved();
    };

    /* â”€â”€ Delete â”€â”€ */
    const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

    /* â”€â”€ Add â”€â”€ */
    const openAdd = () => { setAddBuf({ ...BLANK_ROW }); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);
    const saveAdd = () => {
        setRows(prev => [...prev, { id: nextId, ...addBuf }]);
        setNextId(n => n + 1);
        setShowAdd(false);
        flashSaved();
    };

    const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
    const setAdd = (f, v) => setAddBuf(prev => ({ ...prev, [f]: v }));
    const setEdit = (f, v) => setEditBuf(prev => ({ ...prev, [f]: v }));

    const COLS = ['SNO', 'Conference Name', 'Short Name', 'Entity Name', 'Response From', 'Name', 'Response', 'Date', 'Category', 'Edit', 'Delete'];

    const modalOpen = showAdd;

    return (
        <div className="du-page">
            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>
                {/* Header */}
                <div className="du-page-header">
                    <h1 className="du-title">List of Daily Updates</h1>
                    {saved && (
                        <div className="du-save-badge">
                            <CheckCircle size={14} /> Saved
                        </div>
                    )}
                </div>

                {/* Add button */}
                <div>
                    <button className="du-add-btn" onClick={openAdd}>
                        <Plus size={15} /> Add Daily Updates
                    </button>
                </div>

                {/* Table card */}
                <div className="du-card">
                    <div className="du-table-wrap">
                        <table className="du-table">
                            <thead>
                                <tr className="du-thead-row">
                                    {COLS.map(col => (
                                        <th key={col} className="du-th">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    editingId === row.id ? (
                                        /* â”€â”€ Edit row â”€â”€ */
                                        <tr key={row.id} className="du-tr du-tr-editing">
                                            <td className="du-td du-sno">{idx + 1}</td>
                                            <td className="du-td"><input className="du-cell-input" value={editBuf.conferenceName} onChange={e => setEdit('conferenceName', e.target.value)} /></td>
                                            <td className="du-td"><input className="du-cell-input" value={editBuf.shortName} onChange={e => setEdit('shortName', e.target.value)} /></td>
                                            <td className="du-td"><input className="du-cell-input" value={editBuf.entityName} onChange={e => setEdit('entityName', e.target.value)} /></td>
                                            <td className="du-td"><input className="du-cell-input" value={editBuf.responseFrom} onChange={e => setEdit('responseFrom', e.target.value)} /></td>
                                            <td className="du-td"><input className="du-cell-input" value={editBuf.name} onChange={e => setEdit('name', e.target.value)} /></td>
                                            <td className="du-td"><input className="du-cell-input" value={editBuf.response} onChange={e => setEdit('response', e.target.value)} /></td>
                                            <td className="du-td"><input className="du-cell-input" type="date" value={editBuf.date} onChange={e => setEdit('date', e.target.value)} /></td>
                                            <td className="du-td">
                                                <select
                                                    className="du-cell-input"
                                                    value={editBuf.category}
                                                    onChange={e => setEdit('category', e.target.value)}
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="Unable to attend">Unable to attend</option>
                                                    <option value="Positive">Positive</option>
                                                    <option value="Asking Support">Asking Support</option>
                                                    <option value="Unsubscribe">Unsubscribe</option>
                                                </select>
                                            </td>
                                            <td className="du-td">
                                                <button className="du-icon-btn du-save" onClick={saveEdit} title="Save"><Save size={15} /></button>
                                            </td>
                                            <td className="du-td">
                                                <button className="du-icon-btn du-cancel" onClick={cancelEdit} title="Cancel"><X size={15} /></button>
                                            </td>
                                        </tr>
                                    ) : (
                                        /* â”€â”€ Read row â”€â”€ */
                                        <tr key={row.id} className={`du-tr${idx % 2 !== 0 ? ' du-tr-alt' : ''}`}>
                                            <td className="du-td du-sno">{idx + 1}</td>
                                            <td className="du-td du-conf-name">{row.conferenceName}</td>
                                            <td className="du-td du-short">{row.shortName}</td>
                                            <td className="du-td">{row.entityName}</td>
                                            <td className="du-td du-email">{row.responseFrom}</td>
                                            <td className="du-td du-name">{row.name}</td>
                                            <td className="du-td"><ResponseBadge value={row.response} /></td>
                                            <td className="du-td du-date">{row.date}</td>
                                            <td className="du-td">{row.category}</td>
                                            <td className="du-td">
                                                <button className="du-icon-btn du-edit" onClick={() => startEdit(row)} title="Edit"><Pencil size={15} /></button>
                                            </td>
                                            <td className="du-td">
                                                <button className="du-icon-btn du-delete" onClick={() => deleteRow(row.id)} title="Delete"><Trash2 size={15} /></button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="du-empty">No daily updates yet. Click "Add Daily Updates" to begin.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>  {/* end du-card */}

            </div>  {/* end blur wrapper */}

            {/* Add Modal */}
            {showAdd && (
                <div className="du-modal-overlay" onClick={closeAdd}>
                    <div className="du-modal" onClick={e => e.stopPropagation()}>
                        <div className="du-modal-header">
                            <span>Add Daily Update</span>
                            <button className="du-modal-close" onClick={closeAdd}><X size={18} /></button>
                        </div>
                        <div className="du-modal-body">
                            {[
                                ['Conference Name', 'conferenceName', 'text'],
                                ['Short Name', 'shortName', 'text'],
                                ['Entity Name', 'entityName', 'text'],
                                ['Response From (Email)', 'responseFrom', 'email'],
                                ['Name', 'name', 'text'],
                                ['Response', 'response', 'text'],
                                ['Date', 'date', 'date'],
                                ['Category', 'category', 'text'],
                            ].map(([label, field, type]) => (
                                <div className="du-modal-field" key={field}>
                                    <label className="du-modal-label">{label}</label>
                                    {field === 'category' ? (
                                        <select
                                            className="du-modal-input"
                                            value={addBuf[field]}
                                            onChange={e => setAdd(field, e.target.value)}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Unable to attend">Unable to attend</option>
                                            <option value="Positive">Positive</option>
                                            <option value="Asking Support">Asking Support</option>
                                            <option value="Unsubscribe">Unsubscribe</option>
                                        </select>
                                    ) : (
                                        <input
                                            className="du-modal-input"
                                            type={type}
                                            value={addBuf[field]}
                                            onChange={e => setAdd(field, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="du-modal-footer">
                            <button className="du-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="du-modal-save" onClick={saveAdd}>
                                <Save size={14} /> Save Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

