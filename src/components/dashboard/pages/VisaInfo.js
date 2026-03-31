'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

/* ── Shared style helpers ── */
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
    background: '#fff', color: '#1e293b',
};

const ta = { ...inp, minHeight: '90px', resize: 'vertical' };

const sectionCard = {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const sectionTitle = (color = '#6366f1') => ({
    fontSize: '15px', fontWeight: 700, color: '#1e293b',
    borderLeft: `4px solid ${color}`, paddingLeft: '12px', marginBottom: '18px',
});

/* ── Default fallback content ── */
const DEFAULT_DATA = {
    pageTitle: 'Visa Information',
    intro: 'The International Conference welcomes speakers & delegates from all over the world. Below is essential visa-related information to assist with your travel planning.',
    sections: [
        {
            id: 'visa_need',
            title: '1. Do You Need a Visa?',
            points: [
                'Check if you require a Schengen visa to enter the country using the Federal Foreign Office website or your local Embassy.',
                'Nationals of many countries (including USA, UK, Canada, Australia, Japan, and most EU countries) may enter for short-term visits (up to 90 days) without applying for a visa in advance.',
                'All visitors from non-visa-exempt countries must apply for a Schengen Visa (Type C) for conference attendance.',
            ],
        },
        {
            id: 'visa_types',
            title: '2. Visa Types',
            points: [
                'Schengen Visa: For business/conference purposes, valid for stays up to 90 days within a 180-day period.',
                'Airport Transit Visa: Required for certain nationalities even if they do not leave the airport transit area.',
            ],
        },
        {
            id: 'visa_docs',
            title: '3. Required Documents',
            points: [
                'Valid passport (minimum 6 months validity from your planned date of arrival).',
                'Proof of onward travel (confirmed return flight ticket).',
                'Proof of accommodation (hotel booking confirmation).',
                'Proof of sufficient financial means for the duration of stay.',
                'Letter of Invitation (provided by the Summit Committee upon registration).',
            ],
        },
        {
            id: 'visa_invite',
            title: '4. Invitation Letter',
            points: [
                'Registered participants can request an official invitation letter to support their visa application. This letter confirms your registration and participation in the congress.',
            ],
        },
    ],
    contactEmail: 'info@summit.com',
    note: 'Please ensure you apply for your visa well in advance of the conference date. We recommend applying at least 8 weeks before your intended travel date.',
};

export default function VisaInfo() {
    const [data, setData] = useState(DEFAULT_DATA);
    const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getContent('visa-info');
                if (res && !res.error) {
                    setData(prev => ({ ...prev, ...res }));
                }
            } catch (e) {
                console.warn('[VisaInfo] Failed to load:', e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const save = async () => {
        setStatus('saving');
        try {
            await updateContent('visa-info', data);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            console.error(e);
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    /* ── Section helpers ── */
    const updateSection = (idx, field, val) => {
        setData(prev => {
            const sections = [...prev.sections];
            sections[idx] = { ...sections[idx], [field]: val };
            return { ...prev, sections };
        });
    };

    const addSection = () => {
        setData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                { id: `section_${Date.now()}`, title: 'New Section', points: ['Add your point here.'] },
            ],
        }));
    };

    const removeSection = (idx) => {
        setData(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }));
    };

    /* ── Point helpers ── */
    const updatePoint = (sIdx, pIdx, val) => {
        setData(prev => {
            const sections = [...prev.sections];
            const points = [...sections[sIdx].points];
            points[pIdx] = val;
            sections[sIdx] = { ...sections[sIdx], points };
            return { ...prev, sections };
        });
    };

    const addPoint = (sIdx) => {
        setData(prev => {
            const sections = [...prev.sections];
            sections[sIdx] = { ...sections[sIdx], points: [...sections[sIdx].points, ''] };
            return { ...prev, sections };
        });
    };

    const removePoint = (sIdx, pIdx) => {
        setData(prev => {
            const sections = [...prev.sections];
            sections[sIdx] = { ...sections[sIdx], points: sections[sIdx].points.filter((_, i) => i !== pIdx) };
            return { ...prev, sections };
        });
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading Visa Info...</p>
            </div>
        </div>
    );

    return (
        <div className="id-page">
            {/* ── Header ── */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Visa Information</h1>
                    <p className="id-subtitle">
                        Manage the visa information page content. Changes are saved to MongoDB and reflected live on the website.
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

            {/* ── Page Header Content ── */}
            <div style={sectionCard}>
                <h2 style={sectionTitle('#f59e0b')}>📄 Page Header</h2>
                <FR label="Page Title">
                    <input
                        style={inp}
                        value={data.pageTitle || ''}
                        onChange={e => setData(prev => ({ ...prev, pageTitle: e.target.value }))}
                        placeholder="Visa Information"
                    />
                </FR>
                <FR label="Intro Paragraph">
                    <textarea
                        style={ta}
                        value={data.intro || ''}
                        onChange={e => setData(prev => ({ ...prev, intro: e.target.value }))}
                        placeholder="Brief introduction text shown at the top of the page..."
                    />
                </FR>
            </div>

            {/* ── Visa Sections ── */}
            <div style={sectionCard}>
                <h2 style={sectionTitle('#6366f1')}>📋 Visa Information Sections</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Each section represents a collapsible block (e.g. "Do You Need a Visa?", "Required Documents").
                </p>

                {(data.sections || []).map((section, sIdx) => (
                    <div key={section.id || sIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px', background: '#f8fafc', position: 'relative' }}>
                        <button
                            onClick={() => removeSection(sIdx)}
                            title="Remove section"
                            style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={13} />
                        </button>

                        {/* Section Title */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>SECTION HEADING</label>
                            <input
                                style={{ ...inp, fontWeight: 600, fontSize: '14px' }}
                                value={section.title}
                                onChange={e => updateSection(sIdx, 'title', e.target.value)}
                                placeholder="e.g. 1. Do You Need a Visa?"
                            />
                        </div>

                        {/* Bullet Points */}
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>BULLET POINTS</label>
                        {(section.points || []).map((point, pIdx) => (
                            <div key={pIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8', paddingTop: '11px', minWidth: '20px' }}>•</span>
                                <textarea
                                    style={{ ...ta, minHeight: '52px', flex: 1 }}
                                    value={point}
                                    onChange={e => updatePoint(sIdx, pIdx, e.target.value)}
                                    placeholder="Enter bullet point text..."
                                />
                                <button
                                    onClick={() => removePoint(sIdx, pIdx)}
                                    style={{ marginTop: '6px', background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addPoint(sIdx)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '4px' }}
                        >
                            <Plus size={13} /> Add Point
                        </button>
                    </div>
                ))}

                <button
                    onClick={addSection}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569' }}
                >
                    <Plus size={15} /> Add Section
                </button>
            </div>

            {/* ── Contact & Notes ── */}
            <div style={sectionCard}>
                <h2 style={sectionTitle('#10b981')}>📬 Contact & Notes</h2>
                <FR label="Contact Email">
                    <input
                        style={inp}
                        type="email"
                        value={data.contactEmail || ''}
                        onChange={e => setData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="info@summit.com"
                    />
                </FR>
                <FR label="Important Note">
                    <textarea
                        style={ta}
                        value={data.note || ''}
                        onChange={e => setData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Important note shown at the bottom of the visa info page..."
                    />
                </FR>
            </div>

            {/* ── Bottom Save ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '24px' }}>
                <button
                    onClick={save}
                    disabled={status === 'saving'}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 18px rgba(99,102,241,0.35)' }}
                >
                    <Save size={16} /> Save All Changes to Database
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus, textarea:focus { outline: 2px solid #6366f1; border-color: #6366f1; }`}</style>
        </div>
    );
}
