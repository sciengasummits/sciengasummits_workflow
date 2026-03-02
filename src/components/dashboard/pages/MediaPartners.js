'use client';

import { useState, useRef, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Save, CheckCircle, Image as ImageIcon, Link as LinkIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const BLANK_ROW = {
    name: '',
    link: '',
    description: '',
    photo: null,
    photoUrl: '',
};

const INITIAL_DATA = [
    {
        id: 1,
        name: 'Allconference alert',
        link: 'https://allconferencealert.net/italy.php',
        description: '......',
        photoUrl: 'https://via.placeholder.com/150/ffffff/000000?text=ACA',
    },
    {
        id: 2,
        name: 'International Conference Alerts',
        link: 'https://internationalconferencealerts.com/eventdetails.php?id=101102296',
        description: '......',
        photoUrl: 'https://via.placeholder.com/150/ffffff/000000?text=ICA',
    }
];

export default function MediaPartners() {
    const [rows, setRows] = useState(INITIAL_DATA);
    const [nextId, setNextId] = useState(3);
    const [editingId, setEditingId] = useState(null);
    const [editBuf, setEditBuf] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [addBuf, setAddBuf] = useState({ ...BLANK_ROW });
    const [saved, setSaved] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const addFileRef = useRef(null);
    const editFileRef = useRef(null);

    /* â”€â”€ helpers â”€â”€ */
    const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

    const pickFile = (e, setter) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setter(prev => ({ ...prev, photo: file, photoUrl: url }));
        e.target.value = '';
    };

    /* â”€â”€ add â”€â”€ */
    const openAdd = () => { setAddBuf({ ...BLANK_ROW }); setShowAdd(true); };
    const closeAdd = () => setShowAdd(false);
    const saveAdd = () => {
        setRows(prev => [...prev, { id: nextId, ...addBuf }]);
        setNextId(n => n + 1);
        setShowAdd(false);
        flashSaved();
    };

    /* â”€â”€ edit â”€â”€ */
    const startEdit = (row) => { setEditingId(row.id); setEditBuf({ ...row }); };
    const cancelEdit = () => { setEditingId(null); setEditBuf({}); };
    const saveEdit = () => {
        setRows(prev => prev.map(r => r.id === editingId ? { ...editBuf } : r));
        setEditingId(null);
        flashSaved();
    };

    /* â”€â”€ delete â”€â”€ */
    const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

    /* â”€â”€ search filter â”€â”€ */
    const filteredRows = useMemo(() => {
        if (!searchTerm) return rows;
        const lower = searchTerm.toLowerCase();
        return rows.filter(r =>
            r.name.toLowerCase().includes(lower) ||
            r.link.toLowerCase().includes(lower) ||
            r.description.toLowerCase().includes(lower)
        );
    }, [rows, searchTerm]);

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
        <div className="mp-page">

            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>

                {/* â”€â”€ Header â”€â”€ */}
                <div className="mp-page-header">
                    <h1 className="mp-title">List Of Media Partners</h1>
                </div>

                {/* â”€â”€ Add button & Search Toolbar â”€â”€ */}
                <div className="mp-toolbar-row">
                    <div className="mp-actions-left">
                        <button className="mp-add-btn" onClick={openAdd}>
                            Add Media Partners <Plus size={16} />
                        </button>
                        {saved && (
                            <div className="mp-save-badge">
                                <CheckCircle size={14} /> Saved
                            </div>
                        )}
                    </div>

                    <div className="mp-search-box">
                        <label>Search:</label>
                        <div className="mp-search-input-wrap">
                            <Search size={14} className="mp-search-icon" />
                            <input
                                type="text"
                                placeholder="Type to search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* â”€â”€ Table card â”€â”€ */}
                <div className="mp-card">
                    <div className="mp-table-wrap">
                        <table className="mp-table">
                            <thead>
                                <tr className="mp-thead-row">
                                    {COLS.map(col => (
                                        <th key={col.label} className="mp-th" style={{ textAlign: col.align, width: col.width }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, idx) =>
                                    editingId === row.id ? (
                                        /* â”€â”€ Edit row â”€â”€ */
                                        <tr key={row.id} className="mp-tr mp-tr-editing">
                                            <td className="mp-td mp-sno">{idx + 1}</td>
                                            <td className="mp-td">
                                                <input className="mp-cell-input" value={editBuf.name}
                                                    onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} placeholder="Partner name" />
                                            </td>
                                            <td className="mp-td">
                                                <input className="mp-cell-input" value={editBuf.link}
                                                    onChange={e => setEditBuf(p => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                                            </td>
                                            <td className="mp-td">
                                                <input className="mp-cell-input" value={editBuf.description}
                                                    onChange={e => setEditBuf(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                                            </td>
                                            <td className="mp-td" style={{ textAlign: 'center' }}>
                                                <div className="mp-photo-cell" style={{ justifyContent: 'center' }}>
                                                    {editBuf.photoUrl
                                                        ? <img src={editBuf.photoUrl} alt="partner" className="mp-thumb" />
                                                        : <span className="mp-no-photo"><ImageIcon size={16} /></span>
                                                    }
                                                    <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                                        onChange={e => pickFile(e, setEditBuf)} />
                                                    <button className="mp-photo-btn" onClick={() => editFileRef.current.click()} title="Change photo">
                                                        <ImageIcon size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="mp-td" style={{ textAlign: 'center' }}>
                                                <button className="mp-icon-btn mp-save" onClick={saveEdit} title="Save"><Save size={15} /></button>
                                            </td>
                                            <td className="mp-td" style={{ textAlign: 'center' }}>
                                                <button className="mp-icon-btn mp-cancel" onClick={cancelEdit} title="Cancel"><X size={15} /></button>
                                            </td>
                                        </tr>
                                    ) : (
                                        /* â”€â”€ Read row â”€â”€ */
                                        <tr key={row.id} className={`mp-tr${idx % 2 !== 0 ? ' mp-tr-alt' : ''}`}>
                                            <td className="mp-td mp-sno">{idx + 1}</td>
                                            <td className="mp-td mp-name">{row.name}</td>
                                            <td className="mp-td mp-link">
                                                {row.link
                                                    ? <a href={row.link} target="_blank" rel="noreferrer" className="mp-link-anchor">
                                                        <LinkIcon size={13} /> {row.link}
                                                    </a>
                                                    : 'â€”'}
                                            </td>
                                            <td className="mp-td mp-desc">{row.description || 'â€”'}</td>
                                            <td className="mp-td" style={{ textAlign: 'center' }}>
                                                {row.photoUrl
                                                    ? <img src={row.photoUrl} alt="partner" className="mp-thumb mp-circle-thumb" />
                                                    : <span className="mp-no-photo mp-circle-thumb" style={{ margin: '0 auto' }}><ImageIcon size={16} /></span>}
                                            </td>
                                            <td className="mp-td" style={{ textAlign: 'center' }}>
                                                <button className="mp-icon-btn mp-edit mp-simple-edit" onClick={() => startEdit(row)} title="Edit">
                                                    <Pencil size={15} />
                                                </button>
                                            </td>
                                            <td className="mp-td" style={{ textAlign: 'center' }}>
                                                <button className="mp-icon-btn mp-delete mp-simple-delete" onClick={() => deleteRow(row.id)} title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}

                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="mp-empty">
                                            {searchTerm ? 'No matching records found' : 'No records to show'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* â”€â”€ Pagination Footer â”€â”€ */}
                    <div className="mp-pagination-footer">
                        <div className="mp-page-info">
                            Showing {filteredRows.length > 0 ? 1 : 0} to {filteredRows.length} of {filteredRows.length} entries
                        </div>
                        <div className="mp-pagination-controls">
                            <button className="mp-page-btn disabled">Previous</button>
                            <button className="mp-page-btn active">1</button>
                            <button className="mp-page-btn disabled">Next</button>
                        </div>
                    </div>
                </div>  {/* end mp-card */}

            </div>  {/* end blur wrapper */}

            {/* â”€â”€ Add Modal â”€â”€ */}
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
                                <input className="mp-modal-input" type="text" placeholder="Partner name"
                                    value={addBuf.name} onChange={e => setAddBuf(p => ({ ...p, name: e.target.value }))} />
                            </div>

                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Link</label>
                                <input className="mp-modal-input" type="url" placeholder="https://example.com"
                                    value={addBuf.link} onChange={e => setAddBuf(p => ({ ...p, link: e.target.value }))} />
                            </div>

                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Description</label>
                                <textarea className="mp-modal-input mp-modal-textarea" rows={3} placeholder="Brief description..."
                                    value={addBuf.description} onChange={e => setAddBuf(p => ({ ...p, description: e.target.value }))} />
                            </div>

                            <div className="mp-modal-field">
                                <label className="mp-modal-label">Photo / Logo</label>
                                <div className="mp-modal-photo-row">
                                    {addBuf.photoUrl
                                        ? <img src={addBuf.photoUrl} alt="preview" className="mp-modal-preview" />
                                        : <div className="mp-modal-preview-placeholder"><ImageIcon size={28} /></div>}
                                    <input ref={addFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => pickFile(e, setAddBuf)} />
                                    <button className="mp-choose-btn" onClick={() => addFileRef.current.click()}>
                                        <ImageIcon size={14} /> Choose Image
                                    </button>
                                </div>
                            </div>

                        </div>

                        <div className="mp-modal-footer">
                            <button className="mp-modal-cancel" onClick={closeAdd}>Cancel</button>
                            <button className="mp-modal-save" onClick={saveAdd}>
                                <Save size={14} /> Save Partner
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

