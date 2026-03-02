'use client';

import { useState, useRef } from 'react';
import { Pencil, Trash2, Plus, X, GripVertical, Info } from 'lucide-react';

const INITIAL_MEMBERS = [
    { id: 1, name: 'Dr. Jaroslav Jerz', affiliation: 'Institute of Materials & Machine Mechanics', country: 'Slovakia' },
    { id: 2, name: 'Dr. Xingxing Huang', affiliation: 'Future Energy Research Institute', country: 'Switzerland' },
    { id: 3, name: 'Prof. Sankar Kr Acharya', affiliation: 'Bidhan Chandra Krishi Viswavidyalaya', country: 'India' },
    { id: 4, name: 'Dr. Anwesha Mandal', affiliation: 'GD Goenka University, India', country: '' },
    { id: 5, name: 'Dr. Giulio Teodoro Maellaro', affiliation: 'GECO â€“ Global Engineering Constructions s.r.l', country: 'Italy' },
    { id: 6, name: 'Dr. Albin Kaelin', affiliation: 'CEO of EPEA', country: 'Switzerland' },
    { id: 7, name: 'Dr. Dimitrios Rakopoulos', affiliation: 'Centre for Research & Technology Hellas (CERTH)', country: 'Greece' },
    { id: 8, name: 'Dr. Joudi Dibsi', affiliation: 'University of Wollongong', country: 'Australia' },
    { id: 9, name: 'Salhi Nassima', affiliation: 'University of Blida', country: 'Algeria' },
    { id: 10, name: 'Prof. Dongling Ma', affiliation: 'INRS â€“ EMT Canada Research Chair (Tier 1) in Advanced Functional Nanocomposites', country: 'Canada' },
    { id: 11, name: 'Prof. Manfred Doepp', affiliation: 'Head of Holistic Center Switzerland', country: 'Switzerland' },
];

const EMPTY_FORM = { name: '', affiliation: '', country: '' };

/* Helper for avatars */
function getInitials(name) {
    if (!name) return '?';
    // Strip prefixes like Dr., Prof.
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '');
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function OrganizingCommittee() {
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [modal, setModal] = useState(null); // null | { mode:'add' } | { mode:'edit', id }
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState(null);
    const [nextId, setNextId] = useState(INITIAL_MEMBERS.length + 1);

    // Drag-and-drop state
    const dragIdx = useRef(null);
    const overIdx = useRef(null);

    /* â”€â”€â”€ Drag handlers â”€â”€â”€ */
    const onDragStart = (i) => { dragIdx.current = i; };
    const onDragEnter = (i) => { overIdx.current = i; };
    const onDragEnd = () => {
        const from = dragIdx.current, to = overIdx.current;
        if (from === null || to === null || from === to) { dragIdx.current = overIdx.current = null; return; }
        const arr = [...members];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        setMembers(arr);
        dragIdx.current = overIdx.current = null;
    };

    /* â”€â”€â”€ Modal helpers â”€â”€â”€ */
    const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: 'add' }); };
    const openEdit = (m) => { setForm({ name: m.name, affiliation: m.affiliation, country: m.country }); setModal({ mode: 'edit', id: m.id }); };
    const closeModal = () => setModal(null);

    const handleSave = () => {
        if (!form.name.trim()) return;
        if (modal.mode === 'add') {
            setMembers(prev => [...prev, { id: nextId, ...form }]);
            setNextId(n => n + 1);
        } else {
            setMembers(prev => prev.map(m => m.id === modal.id ? { ...m, ...form } : m));
        }
        closeModal();
    };

    const confirmDelete = (id) => setDeleteId(id);
    const handleDelete = () => { setMembers(prev => prev.filter(m => m.id !== deleteId)); setDeleteId(null); };

    const modalOpen = !!modal || !!deleteId;

    return (
        <div className="oc-page">
            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>
                {/* Header */}
                <div className="oc-page-header">
                    <h1 className="oc-title">List of Organizing Committee</h1>
                </div>

                {/* Hint */}
                <div className="oc-hint">
                    <Info size={15} className="oc-hint-icon" />
                    <span><strong>Note:</strong> You can sort the committee members according to the order that you need by <strong>drag</strong> and <strong>drop</strong> each row</span>
                </div>

                {/* Add button */}
                <div>
                    <button className="oc-add-btn" onClick={openAdd}>
                        <Plus size={16} /> Add Committee
                    </button>
                </div>

                {/* Table */}
                <div className="oc-table-wrap">
                    <table className="oc-table">
                        <thead>
                            <tr>
                                <th className="oc-th oc-th-sno">Sno</th>
                                <th className="oc-th oc-th-name">Name</th>
                                <th className="oc-th oc-th-affil">Affiliation</th>
                                <th className="oc-th oc-th-action">Edit</th>
                                <th className="oc-th oc-th-action">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m, i) => (
                                <tr
                                    key={m.id}
                                    className={`oc-tr${i % 2 === 0 ? ' oc-tr-even' : ' oc-tr-odd'}`}
                                    draggable
                                    onDragStart={() => onDragStart(i)}
                                    onDragEnter={() => onDragEnter(i)}
                                    onDragEnd={onDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <td className="oc-td oc-td-sno">
                                        <span className="oc-drag-handle"><GripVertical size={14} /></span>
                                        {i + 1}
                                    </td>
                                    <td className="oc-td oc-td-name">
                                        <div className="oc-user-cell">
                                            <div className={`oc-avatar oc-avatar-${(i % 5) + 1}`}>{getInitials(m.name)}</div>
                                            <span className="oc-name-link">{m.name}</span>
                                        </div>
                                    </td>
                                    <td className="oc-td oc-td-affil">
                                        <div>{m.affiliation}</div>
                                        {m.country && <div className="oc-country">{m.country}</div>}
                                    </td>
                                    <td className="oc-td oc-td-action">
                                        <button className="oc-icon-btn edit" onClick={() => openEdit(m)} title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                    <td className="oc-td oc-td-action">
                                        <button className="oc-icon-btn delete" onClick={() => confirmDelete(m.id)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>  {/* end oc-table-wrap */}

            </div>  {/* end blur wrapper */}

            {/* Add / Edit Modal */}
            {modal && (
                <div className="oc-modal-overlay" onClick={closeModal}>
                    <div className="oc-modal" onClick={e => e.stopPropagation()}>
                        <div className="oc-modal-header">
                            <h2 className="oc-modal-title">{modal.mode === 'add' ? 'Add Committee Member' : 'Edit Committee Member'}</h2>
                            <button className="oc-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>
                        <div className="oc-modal-body">
                            <label className="oc-label">Full Name <span className="oc-req">*</span></label>
                            <input
                                className="oc-input"
                                placeholder="e.g. Dr. John Smith"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                            <label className="oc-label">Affiliation</label>
                            <input
                                className="oc-input"
                                placeholder="e.g. University of Science"
                                value={form.affiliation}
                                onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))}
                            />
                            <label className="oc-label">Country</label>
                            <input
                                className="oc-input"
                                placeholder="e.g. Switzerland"
                                value={form.country}
                                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                            />
                        </div>
                        <div className="oc-modal-footer">
                            <button className="oc-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="oc-btn-save" onClick={handleSave}>
                                {modal.mode === 'add' ? 'Add Member' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="oc-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="oc-modal oc-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="oc-modal-header">
                            <h2 className="oc-modal-title">Confirm Delete</h2>
                            <button className="oc-modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
                        </div>
                        <div className="oc-modal-body">
                            <p style={{ color: '#475569', margin: 0 }}>Are you sure you want to remove <strong>{members.find(m => m.id === deleteId)?.name}</strong> from the committee?</p>
                        </div>
                        <div className="oc-modal-footer">
                            <button className="oc-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="oc-btn-delete" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

