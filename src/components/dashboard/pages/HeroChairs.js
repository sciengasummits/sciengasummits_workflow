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

    const [chairs, setChairs] = useState({
        chair: { name: '', title: 'Chair Person', designation: '', affiliation: '', country: '', image: '' },
        viceChair: { name: '', title: 'Vice Chair Person', designation: '', affiliation: '', country: '', image: '' },
        coChair: { name: '', title: 'Co-chair Person', designation: '', affiliation: '', country: '', image: '' }
    });

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getContent('heroChairs');
                if (data) {
                    setChairs(prev => ({ ...prev, ...data }));
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

    const handlePhotoUpload = async (role, file) => {
        if (!file) return;
        try {
            const data = await uploadImage(file);
            if (data.url) {
                setChairs(prev => ({
                    ...prev,
                    [role]: { ...prev[role], image: data.url }
                }));
            }
        } catch (e) {
            alert('Upload failed: ' + e.message);
        }
    };

    const renderChairCard = (role, label) => {
        const data = chairs[role] || { name: '', title: label, designation: '', affiliation: '', image: '' };
        return (
            <div key={role} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={20} color="var(--accent)" /> {label}
                </h3>
                
                <FR label="Full Name">
                    <input style={inp} value={data.name} onChange={e => setChairs(p => ({ ...p, [role]: { ...data, name: e.target.value } }))} placeholder="Dr. John Doe" />
                </FR>
                
                <FR label="Designation">
                    <input style={inp} value={data.designation} onChange={e => setChairs(p => ({ ...p, [role]: { ...data, designation: e.target.value } }))} placeholder="Professor" />
                </FR>

                <FR label="Affiliation">
                    <input style={inp} value={data.affiliation} onChange={e => setChairs(p => ({ ...p, [role]: { ...data, affiliation: e.target.value } }))} placeholder="Cambridge University" />
                </FR>

                <FR label="Country">
                    <input style={inp} value={data.country || ''} onChange={e => setChairs(p => ({ ...p, [role]: { ...data, country: e.target.value } }))} placeholder="USA" />
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
                            <input type="file" hidden accept="image/*" onChange={e => handlePhotoUpload(role, e.target.files[0])} />
                        </label>
                        {data.image && (
                            <button onClick={() => setChairs(p => ({ ...p, [role]: { ...data, image: '' } }))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Remove</button>
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
                    <h1 className="id-title">Hero Section Chairs</h1>
                    <p className="id-subtitle">Configure the Chair persons displayed on the homepage banner.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'saved' && <div className="id-save-badge"><CheckCircle size={15} /> Saved!</div>}
                    {status === 'error' && <div className="id-save-badge danger"><AlertCircle size={15} /> Error</div>}
                    <button
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}
                    >
                        {status === 'saving' ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                {renderChairCard("chair", "Conference Chair Person")}
                {renderChairCard("viceChair", "Conference Co-chair Person 1")}
                {renderChairCard("coChair", "Conference Co-chair Person 2")}
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px 20px', marginTop: '30px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#9a3412', fontSize: '14px', fontWeight: 700 }}>📌 Note:</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#9a3412', lineHeight: 1.5 }}>
                    These three leaders will be prominently displayed at the bottom of the Home Page Hero section. 
                    Ensure high-quality square photos for the best appearance.
                </p>
            </div>
        </div>
    );
}
