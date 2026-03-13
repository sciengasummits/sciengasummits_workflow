'use client';
 
import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, User, X } from 'lucide-react';
import { getContent, updateContent, uploadImage } from '@/lib/api';
 
export default function ChairmanCards({ type }) {
    // type is 'main-chairman' | 'chairman-1' | 'chairman-2'
    const [form, setForm] = useState({
        name: '',
        affiliation: '',
        country: '',
        title: 'CONFERENCE CHAIRMAN',
        image: ''
    });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
 
    const labels = {
        'main-chairman': { title: 'Main Chairman', key: 'chairman-main' },
        'chairman-1': { title: 'Chairman-1', key: 'chairman-1' },
        'chairman-2': { title: 'Chairman-2', key: 'chairman-2' },
    };
 
    const config = labels[type] || labels['main-chairman'];
 
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getContent(config.key);
                if (data) {
                    setForm({
                        name: data.name || '',
                        affiliation: data.affiliation || '',
                        country: data.country || '',
                        title: data.title || 'CONFERENCE CHAIRMAN',
                        image: data.image || ''
                    });
                } else {
                    // Reset to defaults if no data found for this key
                    setForm({
                        name: '',
                        affiliation: '',
                        country: '',
                        title: 'CONFERENCE CHAIRMAN',
                        image: ''
                    });
                }
            } catch (e) {
                console.warn('Load failed:', e.message);
            }
            setLoading(false);
        }
        load();
    }, [type, config.key]);
 
    const handleSave = async () => {
        setStatus('saving');
        try {
            await updateContent(config.key, form);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };
 
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = await uploadImage(file);
            if (data.url) setForm(prev => ({ ...prev, image: data.url }));
        } catch (e) {
            alert('Image upload failed');
        }
    };
 
    if (loading) return (
        <div className="id-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading Chairman data...</p>
            </div>
        </div>
    );
 
    return (
        <div className="id-page">
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">{config.title} Card Settings</h1>
                    <p className="id-subtitle">Configure the identity and details for the {config.title} section.</p>
                </div>
                {status === 'saved' && (
                    <div className="id-save-badge"><CheckCircle size={15} /> Saved to database</div>
                )}
                {status === 'error' && (
                    <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <AlertCircle size={15} /> Save failed
                    </div>
                )}
            </div>
 
            <div className="id-card">
                <div className="id-section">
                    <div className="id-section-header">
                        <span className="id-section-dot" />
                        <span className="id-section-title">{config.title} Card Details</span>
                    </div>
 
                    <div className="id-field-row">
                        <div className="id-field-label"><div><span className="id-label-text">Section Badge</span><span className="id-colon">:</span></div></div>
                        <div className="id-field-input">
                            <input
                                className="id-input"
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. CONFERENCE CHAIRMAN"
                            />
                        </div>
                    </div>
 
                    <div className="id-field-row">
                        <div className="id-field-label"><div><span className="id-label-text">Full Name</span><span className="id-colon">:</span></div></div>
                        <div className="id-field-input">
                            <input
                                className="id-input"
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Prof. Chaoqun Liu"
                            />
                        </div>
                    </div>
 
                    <div className="id-field-row">
                        <div className="id-field-label"><div><span className="id-label-text">Affiliation</span><span className="id-colon">:</span></div></div>
                        <div className="id-field-input">
                            <input
                                className="id-input"
                                type="text"
                                value={form.affiliation}
                                onChange={e => setForm({ ...form, affiliation: e.target.value })}
                                placeholder="e.g. University of Texas at Arlington"
                            />
                        </div>
                    </div>
 
                    <div className="id-field-row">
                        <div className="id-field-label"><div><span className="id-label-text">Country</span><span className="id-colon">:</span></div></div>
                        <div className="id-field-input">
                            <input
                                className="id-input"
                                type="text"
                                value={form.country}
                                onChange={e => setForm({ ...form, country: e.target.value })}
                                placeholder="e.g. China"
                            />
                        </div>
                    </div>
 
                    <div className="id-field-row">
                        <div className="id-field-label"><div><span className="id-label-text">Avatar Image</span><span className="id-colon">:</span></div></div>
                        <div className="id-field-input">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                {form.image ? (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={form.image}
                                            alt="Avatar"
                                            style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                        />
                                        <button
                                            onClick={() => setForm({ ...form, image: '' })}
                                            style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(239,68,68,0.4)' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ width: '100px', height: '120px', background: '#f1f5f9', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        <User size={40} />
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                        {form.image ? 'Change Photo' : 'Upload Photo'}
                                    </label>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Recommended: 400x500px or similar ratio.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
 
                <div className="id-actions">
                    <button
                        className="id-btn-save"
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', fontWeight: 700 }}
                    >
                        {status === 'saving' ? (
                            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        ) : (
                            <Save size={18} />
                        )}
                        {status === 'saving' ? 'Saving...' : 'Save Chairman Card'}
                    </button>
                </div>
            </div>
 
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
 
