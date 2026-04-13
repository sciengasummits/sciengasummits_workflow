'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

/* ── Field Row ── */
function FR({ label, children }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '12px', alignItems: 'start', marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', paddingTop: '10px' }}>{label}</label>
            <div>{children}</div>
        </div>
    );
}

const inp = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    background: '#fff', color: '#1e293b'
};

const DEFAULT_DATA = {
    registrationStartDate: '2026-08-01',
    earlyBirdEndDate: '2026-09-25',
    standardEndDate: '2026-10-30',
    onspotEndDate: '2026-12-14',
    categories: [
        { id: 'speaker', label: 'Speaker Registration', early: 599, standard: 699, onspot: 799 },
        { id: 'delegate', label: 'Delegate Registration', early: 699, standard: 799, onspot: 899 },
        { id: 'poster', label: 'Poster Registration', early: 399, standard: 499, onspot: 599 },
        { id: 'student', label: 'Student', early: 299, standard: 399, onspot: 499 },
        { id: 'virtual', label: 'Virtual (Online)', early: 200, standard: 300, onspot: 400 },
    ],
    sponsorships: [
        { id: 'platinum', label: 'Platinum Sponsor', price: 4999 },
        { id: 'diamond', label: 'Diamond Sponsor', price: 3999 },
        { id: 'gold', label: 'Gold Sponsor', price: 2999 },
        { id: 'exhibitor', label: 'Exhibitor', price: 1999 },
    ],
    accommodation: [
        { nights: 2, single: 360, double: 400, triple: 440 },
        { nights: 3, single: 540, double: 600, triple: 660 },
        { nights: 4, single: 720, double: 800, triple: 880 },
        { nights: 5, single: 900, double: 1000, triple: 1100 },
    ],
    accompanyingPersonPrice: 249,
    processingFeePercent: 5,
};

export default function RegistrationPrices() {
    const [data, setData] = useState(DEFAULT_DATA);
    const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getContent('registration-prices');
                if (res && !res.error) {
                    setData(prev => ({ ...prev, ...res }));
                }
            } catch (e) {
                console.warn('[RegistrationPrices] Failed to load:', e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const save = async () => {
        setStatus('saving');
        try {
            await updateContent('registration-prices', data);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            console.error(e);
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    /* ── Category helpers ── */
    const updateCategory = (idx, field, val) => {
        setData(prev => {
            const cats = [...(prev.categories || [])];
            cats[idx] = { ...cats[idx], [field]: field === 'label' || field === 'id' ? val : Number(val) };
            return { ...prev, categories: cats };
        });
    };

    const addCategory = () => {
        setData(prev => ({
            ...prev,
            categories: [...prev.categories, { id: `cat_${Date.now()}`, label: 'New Category', early: 0, standard: 0, onspot: 0 }]
        }));
    };

    const removeCategory = (idx) => {
        setData(prev => ({ ...prev, categories: prev.categories.filter((_, i) => i !== idx) }));
    };

    /* ── Sponsorship helpers ── */
    const updateSponsorship = (idx, field, val) => {
        setData(prev => {
            const sp = [...(prev.sponsorships || [])];
            sp[idx] = { ...sp[idx], [field]: field === 'price' ? Number(val) : val };
            return { ...prev, sponsorships: sp };
        });
    };

    const addSponsorship = () => {
        setData(prev => ({
            ...prev,
            sponsorships: [...prev.sponsorships, { id: `sp_${Date.now()}`, label: 'New Sponsor Tier', price: 0 }]
        }));
    };

    const removeSponsorship = (idx) => {
        setData(prev => ({ ...prev, sponsorships: prev.sponsorships.filter((_, i) => i !== idx) }));
    };

    /* ── Accommodation helpers ── */
    const updateAccommodation = (idx, field, val) => {
        setData(prev => {
            const acc = [...(prev.accommodation || [])];
            acc[idx] = { ...acc[idx], [field]: Number(val) };
            return { ...prev, accommodation: acc };
        });
    };

    const addAccommodation = () => {
        setData(prev => ({
            ...prev,
            accommodation: [...prev.accommodation, { nights: 1, single: 0, double: 0, triple: 0 }]
        }));
    };

    const removeAccommodation = (idx) => {
        setData(prev => ({ ...prev, accommodation: prev.accommodation.filter((_, i) => i !== idx) }));
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading registration prices...</p>
            </div>
        </div>
    );

    const sectionCard = {
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
        padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    };

    const sectionTitle = {
        fontSize: '15px', fontWeight: 700, color: '#1e293b',
        borderLeft: '4px solid #6366f1', paddingLeft: '12px', marginBottom: '18px'
    };

    return (
        <div className="id-page">
            {/* ── Header ── */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Registration Prices</h1>
                    <p className="id-subtitle">
                        Manage registration fees, accommodation, and sponsorship pricing for the LIUTEX Summit.
                        Changes are saved to MongoDB and applied live on the registration page.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'saved' && (
                        <div className="id-save-badge"><CheckCircle size={15} /> Saved!</div>
                    )}
                    {status === 'error' && (
                        <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <AlertCircle size={15} /> Error saving
                        </div>
                    )}
                    <button
                        onClick={save}
                        disabled={status === 'saving'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}
                    >
                        {status === 'saving'
                            ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            : <Save size={16} />}
                        Save to Database
                    </button>
                </div>
            </div>

            {/* ── Phase Dates ── */}
            <div style={sectionCard}>
                <h2 style={{ ...sectionTitle, borderLeftColor: '#f59e0b' }}>📅 Registration Phase Dates</h2>
                <FR label="Registration Start Date">
                    <input
                        style={inp} type="date"
                        value={data.registrationStartDate || ''}
                        onChange={e => setData(prev => ({ ...prev, registrationStartDate: e.target.value }))}
                    />
                </FR>
                <FR label="Early Bird Date">
                    <input
                        style={inp} type="date"
                        value={data.earlyBirdEndDate || ''}
                        onChange={e => setData(prev => ({ ...prev, earlyBirdEndDate: e.target.value }))}
                    />
                </FR>
                <FR label="Standard Date">
                    <input
                        style={inp} type="date"
                        value={data.standardEndDate || ''}
                        onChange={e => setData(prev => ({ ...prev, standardEndDate: e.target.value }))}
                    />
                </FR>
                <FR label="On-Spot Date">
                    <input
                        style={inp} type="date"
                        value={data.onspotEndDate || ''}
                        onChange={e => setData(prev => ({ ...prev, onspotEndDate: e.target.value }))}
                    />
                </FR>
            </div>

            {/* ── Registration Categories ── */}
            <div style={sectionCard}>
                <h2 style={sectionTitle}>🏷️ Registration Categories &amp; Pricing (USD)</h2>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Category Label', 'Internal ID', 'Early Bird ($)', 'Standard ($)', 'On-Spot ($)', ''].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', fontWeight: 700, color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(data.categories || []).map((cat, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, minWidth: '160px' }} value={cat.label} onChange={e => updateCategory(idx, 'label', e.target.value)} placeholder="Category name" />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, minWidth: '100px', fontFamily: 'monospace', fontSize: '12px', color: '#6366f1' }} value={cat.id} onChange={e => updateCategory(idx, 'id', e.target.value)} placeholder="speaker" />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, minWidth: '90px' }} type="number" value={cat.early} onChange={e => updateCategory(idx, 'early', e.target.value)} min={0} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, minWidth: '90px' }} type="number" value={cat.standard} onChange={e => updateCategory(idx, 'standard', e.target.value)} min={0} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, minWidth: '90px' }} type="number" value={cat.onspot} onChange={e => updateCategory(idx, 'onspot', e.target.value)} min={0} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <button onClick={() => removeCategory(idx)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={addCategory}
                    style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569' }}
                >
                    <Plus size={15} /> Add Category
                </button>
            </div>

            {/* ── Sponsorship Pricing ── */}
            <div style={sectionCard}>
                <h2 style={{ ...sectionTitle, borderLeftColor: '#10b981' }}>💼 Sponsorship Opportunities (USD)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {(data.sponsorships || []).map((sp, idx) => (
                        <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                            <button onClick={() => removeSponsorship(idx)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                <X size={14} />
                            </button>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '4px' }}>TIER LABEL</label>
                                <input style={inp} value={sp.label} onChange={e => updateSponsorship(idx, 'label', e.target.value)} placeholder="Gold Sponsor" />
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '4px' }}>INTERNAL ID</label>
                                <input style={{ ...inp, fontFamily: 'monospace', fontSize: '12px', color: '#6366f1' }} value={sp.id} onChange={e => updateSponsorship(idx, 'id', e.target.value)} placeholder="gold" />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '4px' }}>PRICE ($)</label>
                                <input style={{ ...inp, fontWeight: 700 }} type="number" value={sp.price} onChange={e => updateSponsorship(idx, 'price', e.target.value)} min={0} />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addSponsorship}
                        style={{ border: '2px dashed #bbf7d0', borderRadius: '10px', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', color: '#166534', fontSize: '13px', fontWeight: 600, minHeight: '120px' }}
                    >
                        <Plus size={20} /> Add Tier
                    </button>
                </div>
            </div>

            {/* ── Accommodation Pricing ── */}
            <div style={sectionCard}>
                <h2 style={{ ...sectionTitle, borderLeftColor: '#0ea5e9' }}>🏨 Accommodation Pricing (USD)</h2>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Nights', 'Single Occupancy ($)', 'Double Occupancy ($)', 'Triple Occupancy ($)', ''].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', fontWeight: 700, color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(data.accommodation || []).map((acc, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, maxWidth: '80px' }} type="number" value={acc.nights} onChange={e => updateAccommodation(idx, 'nights', e.target.value)} min={1} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, maxWidth: '120px' }} type="number" value={acc.single} onChange={e => updateAccommodation(idx, 'single', e.target.value)} min={0} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, maxWidth: '120px' }} type="number" value={acc.double} onChange={e => updateAccommodation(idx, 'double', e.target.value)} min={0} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <input style={{ ...inp, maxWidth: '120px' }} type="number" value={acc.triple} onChange={e => updateAccommodation(idx, 'triple', e.target.value)} min={0} />
                                    </td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <button onClick={() => removeAccommodation(idx)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={addAccommodation}
                    style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569' }}
                >
                    <Plus size={15} /> Add Accommodation Option
                </button>
            </div>

            {/* ── Misc Fees ── */}
            <div style={sectionCard}>
                <h2 style={{ ...sectionTitle, borderLeftColor: '#ec4899' }}>⚙️ Miscellaneous Fees</h2>
                <FR label="Accompanying Person Fee ($)">
                    <input
                        style={{ ...inp, maxWidth: '160px' }}
                        type="number"
                        value={data.accompanyingPersonPrice ?? 249}
                        onChange={e => setData(prev => ({ ...prev, accompanyingPersonPrice: Number(e.target.value) }))}
                        min={0}
                    />
                </FR>
                <FR label="Processing Fee (%)">
                    <input
                        style={{ ...inp, maxWidth: '160px' }}
                        type="number"
                        value={data.processingFeePercent ?? 5}
                        onChange={e => setData(prev => ({ ...prev, processingFeePercent: Number(e.target.value) }))}
                        min={0}
                        max={100}
                    />
                </FR>
            </div>

            {/* Bottom Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '24px' }}>
                <button
                    onClick={save}
                    disabled={status === 'saving'}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 18px rgba(99,102,241,0.35)' }}
                >
                    <Save size={16} /> Save All Changes to Database
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus { outline: 2px solid #6366f1; border-color: #6366f1; }`}</style>
        </div>
    );
}
