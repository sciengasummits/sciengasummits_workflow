'use client';

import { useState, useRef, useCallback } from 'react';
import { Pencil, Trash2, Plus, X, GripVertical, Info, Search, ChevronLeft, ChevronRight, Upload, User } from 'lucide-react';

/* â”€â”€â”€ Sample data â”€â”€â”€ */
const INITIAL_SPEAKERS = [
    {
        id: 1,
        name: 'Mr. Edward Eastlack',
        affiliation: 'Chief Executive Officer InterModal Renewables LLC',
        country: 'USA',
        bio: 'Mr. Edward Eastlack is a seasoned energy executive with over 30 years of leadership experience in renewable energy and infrastructure development. He has pioneered multiple clean energy initiatives across North America.',
        photo: null,
    },
    {
        id: 2,
        name: 'Dr. Florian Kongoli',
        affiliation: 'Executive President (CEO) FLOGEN Technologies Inc.',
        country: 'Canada, USA',
        bio: 'Dr. Florian Kongoli is a renowned scientist and industrialist whose work spans metallurgy, materials science, and sustainable energy systems. He is the founder of FLOGEN Technologies.',
        photo: null,
    },
    {
        id: 3,
        name: 'Dr. Faisal Manzoor Arain',
        affiliation: 'CEO and Co-Founder, AM Management Global Inc',
        country: 'Alberta, Canada',
        bio: 'Dr. Faisal Manzoor Arain is an experienced academic and industry leader specializing in construction project management, sustainability, and engineering education.',
        photo: null,
    },
    {
        id: 4,
        name: 'Dr. Jaroslav Jerz',
        affiliation: 'Institute of Materials & Machine Mechanics',
        country: 'Slovakia',
        bio: 'Dr. Jaroslav Jerz is a materials scientist with deep expertise in advanced alloys, failure analysis, and sustainable manufacturing processes.',
        photo: null,
    },
];

const EMPTY_FORM = { name: '', affiliation: '', country: '', bio: '', photo: null };
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

/* â”€â”€â”€ Avatar helper â”€â”€â”€ */
function getInitials(name = '') {
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '');
    const parts = clean.split(' ').filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
    { bg: '#fee2e2', color: '#b91c1c' },
    { bg: '#dbeafe', color: '#1d4ed8' },
    { bg: '#f3e8ff', color: '#7e22ce' },
    { bg: '#dcfce7', color: '#15803d' },
    { bg: '#fef3c7', color: '#b45309' },
];

function SpeakerAvatar({ speaker, index, size = 48 }) {
    const col = AVATAR_COLORS[index % AVATAR_COLORS.length];
    if (speaker.photo) {
        return (
            <img
                src={speaker.photo}
                alt={speaker.name}
                className="sp-photo"
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <div
            className="sp-avatar"
            style={{ width: size, height: size, background: col.bg, color: col.color, fontSize: size * 0.3 }}
        >
            {getInitials(speaker.name)}
        </div>
    );
}

/* â”€â”€â”€ Main Component â”€â”€â”€ */
export default function PlenarySpeakers() {
    const [speakers, setSpeakers] = useState(INITIAL_SPEAKERS);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState(null);
    const [nextId, setNextId] = useState(INITIAL_SPEAKERS.length + 1);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    const dragIdx = useRef(null);
    const overIdx = useRef(null);
    const fileRef = useRef(null);

    /* â”€â”€â”€ Drag â”€â”€â”€ */
    const onDragStart = (i) => { dragIdx.current = i; };
    const onDragEnter = (i) => { overIdx.current = i; };
    const onDragEnd = () => {
        const from = dragIdx.current, to = overIdx.current;
        if (from === null || to === null || from === to) { dragIdx.current = overIdx.current = null; return; }
        const arr = [...speakers];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        setSpeakers(arr);
        dragIdx.current = overIdx.current = null;
    };

    /* â”€â”€â”€ Filtering & Pagination â”€â”€â”€ */
    const filtered = speakers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.affiliation.toLowerCase().includes(search.toLowerCase()) ||
        s.country.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    /* â”€â”€â”€ Modal helpers â”€â”€â”€ */
    const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: 'add' }); };
    const openEdit = (s) => { setForm({ name: s.name, affiliation: s.affiliation, country: s.country, bio: s.bio, photo: s.photo }); setModal({ mode: 'edit', id: s.id }); };
    const closeModal = () => setModal(null);

    const handlePhotoChange = useCallback((e) => {
        const file = e.target.files?.[0];
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

        const reader = new FileReader();
        reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
        reader.readAsDataURL(file);
    }, []);

    const handleSave = () => {
        if (!form.name.trim()) return;
        if (modal.mode === 'add') {
            setSpeakers(prev => [...prev, { id: nextId, ...form }]);
            setNextId(n => n + 1);
        } else {
            setSpeakers(prev => prev.map(s => s.id === modal.id ? { ...s, ...form } : s));
        }
        closeModal();
    };

    const confirmDelete = (id) => setDeleteId(id);
    const handleDelete = () => { setSpeakers(prev => prev.filter(s => s.id !== deleteId)); setDeleteId(null); };

    const start = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
    const end = Math.min(safePage * pageSize, filtered.length);

    const modalOpen = !!modal || !!deleteId;

    return (
        <div className="sp-page">
            {/* Page content â€” blurred when modal is open */}
            <div style={modalOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s ease', pointerEvents: 'none', userSelect: 'none' } : { transition: 'filter 0.2s ease' }}>
                {/* Header */}
                <div className="sp-page-header">
                    <h1 className="sp-title">List of Plenary Speakers</h1>
                </div>

                {/* Hint */}
                <div className="sp-hint">
                    <Info size={15} className="sp-hint-icon" />
                    <span><strong>Note:</strong> You can sort the speakers according to the order that you need by <strong>drag</strong> and <strong>drop</strong> each row</span>
                </div>

                {/* Toolbar */}
                <div className="sp-toolbar">
                    <button className="sp-add-btn" onClick={openAdd}>
                        <Plus size={16} /> Add Plenary
                    </button>
                </div>

                {/* Controls: Show entries + Search */}
                <div className="sp-controls">
                    <div className="sp-show-entries">
                        <span>Show</span>
                        <select
                            className="sp-entries-select"
                            value={pageSize}
                            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                        >
                            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="sp-search-wrap">
                        <Search size={14} className="sp-search-icon" />
                        <input
                            className="sp-search-input"
                            placeholder="Searchâ€¦"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="sp-table-wrap">
                    <table className="sp-table">
                        <thead>
                            <tr>
                                <th className="sp-th sp-th-sno">Sno</th>
                                <th className="sp-th sp-th-name">Name</th>
                                <th className="sp-th sp-th-affil">Affiliation</th>
                                <th className="sp-th sp-th-photo">Photo</th>
                                <th className="sp-th sp-th-bio">Biography</th>
                                <th className="sp-th sp-th-action">Edit</th>
                                <th className="sp-th sp-th-action">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="sp-empty">No speakers found.</td>
                                </tr>
                            ) : paginated.map((s, i) => {
                                const globalIdx = speakers.indexOf(s);
                                const rowIdx = (safePage - 1) * pageSize + i;
                                return (
                                    <tr
                                        key={s.id}
                                        className={`sp-tr${rowIdx % 2 !== 0 ? ' sp-tr-even' : ''}`}
                                        draggable
                                        onDragStart={() => onDragStart(globalIdx)}
                                        onDragEnter={() => onDragEnter(globalIdx)}
                                        onDragEnd={onDragEnd}
                                        onDragOver={e => e.preventDefault()}
                                    >
                                        <td className="sp-td sp-td-sno">
                                            <span className="sp-drag-handle"><GripVertical size={14} /></span>
                                            {rowIdx + 1}
                                        </td>
                                        <td className="sp-td sp-td-name">
                                            <span className="sp-name-link">{s.name}</span>
                                        </td>
                                        <td className="sp-td sp-td-affil">
                                            <div>{s.affiliation}</div>
                                            {s.country && <div className="sp-country">{s.country}</div>}
                                        </td>
                                        <td className="sp-td sp-td-photo">
                                            <SpeakerAvatar speaker={s} index={globalIdx} size={75} />
                                        </td>
                                        <td className="sp-td sp-td-bio">
                                            <div className="sp-bio-preview">
                                                {s.bio || 'â€”'}
                                            </div>
                                        </td>
                                        <td className="sp-td sp-td-action">
                                            <button className="sp-icon-btn edit" onClick={() => openEdit(s)} title="Edit">
                                                <Pencil size={15} />
                                            </button>
                                        </td>
                                        <td className="sp-td sp-td-action">
                                            <button className="sp-icon-btn delete" onClick={() => confirmDelete(s.id)} title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer: info + pagination */}
                <div className="sp-pagination-bar">
                    <span className="sp-entries-info">
                        {filtered.length === 0
                            ? 'No entries found'
                            : `Showing ${start} to ${end} of ${filtered.length} entries`}
                    </span>
                    <div className="sp-pagination">
                        <button
                            className="sp-page-btn"
                            disabled={safePage === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                className={`sp-page-num${p === safePage ? ' active' : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            className="sp-page-btn"
                            disabled={safePage === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>  {/* end sp-pagination-bar */}

            </div>  {/* end blur wrapper */}

            {/* Add / Edit Modal */}
            {modal && (
                <div className="sp-modal-overlay" onClick={closeModal}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">
                                {modal.mode === 'add' ? 'Add Plenary Speaker' : 'Edit Plenary Speaker'}
                            </h2>
                            <button className="sp-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">

                            {/* Photo upload */}
                            <div className="sp-photo-upload-section">
                                <div
                                    className="sp-photo-preview"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {form.photo
                                        ? <img src={form.photo} alt="preview" className="sp-photo-preview-img" />
                                        : <div className="sp-photo-placeholder">
                                            <User size={28} color="#94a3b8" />
                                            <span>Upload Photo</span>
                                        </div>
                                    }
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                                <button className="sp-upload-btn" onClick={() => fileRef.current?.click()}>
                                    <Upload size={14} /> Choose Photo
                                </button>
                                <p style={{ color: 'red', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                                    * Image size limit: 2MB (JPG, PNG, JPEG)
                                </p>
                            </div>

                            <label className="sp-label">Full Name <span className="sp-req">*</span></label>
                            <input className="sp-input" placeholder="e.g. Dr. Jane Smith"
                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

                            <label className="sp-label">Affiliation</label>
                            <input className="sp-input" placeholder="e.g. MIT, USA"
                                value={form.affiliation} onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))} />

                            <label className="sp-label">Country</label>
                            <input className="sp-input" placeholder="e.g. USA"
                                value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />

                            <label className="sp-label">Biography</label>
                            <textarea className="sp-textarea" placeholder="Short biographyâ€¦" rows={4}
                                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="sp-btn-save" onClick={handleSave}>
                                {modal.mode === 'add' ? 'Add Speaker' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="sp-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="sp-modal sp-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="sp-modal-header">
                            <h2 className="sp-modal-title">Confirm Delete</h2>
                            <button className="sp-modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
                        </div>
                        <div className="sp-modal-body">
                            <p style={{ color: '#475569', margin: 0 }}>
                                Are you sure you want to remove <strong>{speakers.find(s => s.id === deleteId)?.name}</strong>?
                            </p>
                        </div>
                        <div className="sp-modal-footer">
                            <button className="sp-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="sp-btn-delete" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

