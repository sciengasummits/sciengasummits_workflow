'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X, Upload, User } from 'lucide-react';
import { getContent, updateContent, getConference, uploadImage } from '@/lib/api';
import { CONFERENCE_CONFIG } from '@/lib/conferences';

/* ── Field Row ── */
function FR({ label, children }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px', alignItems: 'start', marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', paddingTop: '10px' }}>{label}</label>
            <div>{children}</div>
        </div>
    );
}

const inp = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    background: '#fff', color: '#1e293b'
};

export default function HeroChairs({ conf }) {
    const activeConf = getConference();
    const confSpecs = conf || CONFERENCE_CONFIG[activeConf] || CONFERENCE_CONFIG.liutex;

    const [chairs, setChairs] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getContent('heroChairs');
                if (data) {
                    if (Array.isArray(data)) {
                        // Ideally stored as a top-level array (future backend)
                        setChairs(data);
                    } else if (data._items && Array.isArray(data._items)) {
                        // ✅ Current deployed backend stores array as data._items
                        setChairs(data._items);
                    } else if (typeof data === 'object') {
                        // Migrate from old chair/viceChair/coChair schema
                        const legacyKeys = ['chair', 'viceChair', 'coChair'];
                        const hasLegacy = legacyKeys.some(k => data[k] && data[k].name);
                        if (hasLegacy) {
                            const migrated = [];
                            legacyKeys.forEach(k => {
                                if (data[k] && data[k].name) {
                                    migrated.push({ id: Date.now() + Math.random(), ...data[k] });
                                }
                            });
                            setChairs(migrated);
                        } else {
                            // Recover from corrupted numeric-key save
                            const numKeys = Object.keys(data)
                                .filter(k => !isNaN(k))
                                .sort((a, b) => Number(a) - Number(b));
                            if (numKeys.length > 0) {
                                const recovered = numKeys.map(k => data[k]).filter(c => c && c.name);
                                setChairs(recovered);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Failed to load hero chairs:', e.message);
            }
            setLoading(false);
        }
        load();
    }, [confSpecs]);

    const handleSave = async () => {
        setStatus('saving');
        try {
            await updateContent('heroChairs', chairs);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            console.error('Save failed:', e);
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const handlePhotoUpload = async (index, file) => {
        if (!file) return;
        try {
            const data = await uploadImage(file);
            if (data.url) {
                const newChairs = [...chairs];
                newChairs[index].image = data.url;
                setChairs(newChairs);
            }
        } catch (e) {
            alert('Upload failed: ' + e.message);
        }
    };

    const addChair = () => {
        setChairs(prev => [...(prev || []), { id: Date.now(), title: 'Conference Chair Person', name: '', designation: '', affiliation: '', country: '', image: '' }]);
    };

    const removeChair = (index) => {
        setChairs(prev => (prev || []).filter((_, i) => i !== index));
    };

    const updateChair = (index, field, value) => {
        const newChairs = [...chairs];
        newChairs[index][field] = value;
        setChairs(newChairs);
    };

    const renderChairCard = (data, index) => {
        return (
            <div key={data.id || index} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <User size={20} color="var(--accent)" />
                        <input 
                            style={{ ...inp, flex: 1, padding: '6px 10px', fontSize: '15px' }} 
                            value={data.title} 
                            onChange={e => updateChair(index, 'title', e.target.value)} 
                            placeholder="Role / Position" 
                        />
                    </h3>
                    <button onClick={() => removeChair(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px' }}>
                        <X size={16} /> Remove
                    </button>
                </div>
                
                <FR label="Full Name">
                    <input style={inp} value={data.name} onChange={e => updateChair(index, 'name', e.target.value)} placeholder="Dr. John Doe" />
                </FR>
                
                <FR label="Designation">
                    <input style={inp} value={data.designation} onChange={e => updateChair(index, 'designation', e.target.value)} placeholder="Professor" />
                </FR>

                <FR label="Affiliation">
                    <input style={inp} value={data.affiliation} onChange={e => updateChair(index, 'affiliation', e.target.value)} placeholder="Cambridge University" />
                </FR>

                <FR label="Country">
                    <input style={inp} value={data.country || ''} onChange={e => updateChair(index, 'country', e.target.value)} placeholder="USA" />
                </FR>

                <FR label="Photo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '120px', height: '140px', borderRadius: '12px', backgroundColor: '#f1f5f9', overflow: 'hidden', border: '2px solid #e2e8f0', flexShrink: 0 }}>
                            {data.image ? (
                                <img src={data.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <label style={{ cursor: 'pointer', padding: '10px 20px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={16} /> Upload Photo
                            <input type="file" hidden accept="image/*" onChange={e => handlePhotoUpload(index, e.target.files[0])} />
                        </label>
                        {data.image && (
                            <button onClick={() => updateChair(index, 'image', '')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Remove</button>
                        )}
                    </div>
                </FR>
            </div>
        );
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="id-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Conference Chairs</h1>
                    <p className="id-subtitle">Configure the Chair persons displayed on the homepage banner.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'saved' && <div className="id-save-badge"><CheckCircle size={15} /> Saved!</div>}
                    {status === 'error' && <div className="id-save-badge danger"><AlertCircle size={15} /> Error</div>}
                    <button
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: status === 'saving' ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 18px rgba(99,102,241,0.35)', transition: 'background 0.3s' }}
                    >
                        {status === 'saving' ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                {chairs.map((chair, index) => renderChairCard(chair, index))}
                
                <button 
                    onClick={addChair}
                    style={{ 
                        width: '100%', padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', 
                        borderRadius: '16px', color: '#64748b', fontSize: '15px', fontWeight: 700, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#475569'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <Plus size={20} /> Add New Role/Position
                </button>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px 20px', marginTop: '30px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#9a3412', fontSize: '14px', fontWeight: 700 }}>📌 Note:</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#9a3412', lineHeight: 1.5 }}>
                    These leaders will be prominently displayed at the bottom of the Home Page Hero section. 
                    Ensure high-quality square photos for the best appearance. Add as many as needed.
                </p>
            </div>
        </div>
    );
}
