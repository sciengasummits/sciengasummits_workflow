'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { getContent, updateContent, getConference } from '@/lib/api';
import { CONFERENCE_CONFIG } from '@/lib/conferences';

/* â”€â”€ Collapsible Section Wrapper â”€â”€ */
function Section({ title, color = '#6366f1', children, sectionRef, highlighted }) {
    const [open, setOpen] = useState(true);
    return (
        <div
            ref={sectionRef}
            style={{
                border: highlighted ? `2px solid ${color}` : '1px solid #e2e8f0',
                borderRadius: '12px', overflow: 'hidden', marginBottom: '16px',
                boxShadow: highlighted ? `0 0 0 4px ${color}22` : 'none',
                transition: 'box-shadow 0.4s, border 0.4s'
            }}
        >
            <div
                onClick={() => setOpen(o => !o)}
                style={{ background: '#f8fafc', padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${color}` }}
            >
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{title}</span>
                {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>
            {open && <div style={{ padding: '18px' }}>{children}</div>}
        </div>
    );
}

/* â”€â”€ Field Row â”€â”€ */
function FR({ label, children }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', alignItems: 'start', marginBottom: '12px' }}>
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
const textarea = { ...inp, resize: 'vertical', minHeight: '80px' };

export default function WebsiteSections({ section, conf }) {
    const activeConf = getConference();
    const confSpecs = conf || CONFERENCE_CONFIG[activeConf] || CONFERENCE_CONFIG.liutex;

    const [hero, setHero] = useState({
        subtitle: 'INTERNATIONAL CONFERENCE ON',
        title: confSpecs.displayName,
        description: `International Conference on ${confSpecs.shortName}. where global experts unite to shape the future of science.`,
        conferenceDate: 'December 14-16, 2026',
        venue: 'Outram, Singapore',
        countdownTarget: '2026-12-14T09:00:00',
        showRegister: true, showAbstract: true, showBrochure: true,
    });

    const [about, setAbout] = useState({
        subtitle: `${confSpecs.displayName} and Its Applications`,
        title: 'About The Conference',
        paragraph1: '',
        paragraph2: '',
        objectives: [],
        keyThemes: [],
    });

    const [stats, setStats] = useState({
        title: `${confSpecs.shortName} CONFERENCES APPROACH`,
        items: [],
    });

    const [pricing, setPricing] = useState({ title: 'REGISTRATION PRICING', packages: [] });
    const [marquee, setMarquee] = useState({ title: 'Supporting Universities & Institutions', items: [] });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [highlighted, setHighlighted] = useState(null);

    // Refs for each section
    const sectionRefs = {
        hero: useRef(null),
        about: useRef(null),
        stats: useRef(null),
        pricing: useRef(null),
        marquee: useRef(null),
        partners: useRef(null),
    };

    // Auto-scroll + highlight when `section` prop changes
    useEffect(() => {
        if (!section || loading) return;
        const ref = sectionRefs[section];
        if (ref) {
            setTimeout(() => {
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setHighlighted(section);
                    setTimeout(() => setHighlighted(null), 2200);
                }
            }, 150);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section, loading]);

    useEffect(() => {
        async function load() {
            try {
                const [h, a, st, pr, mq] = await Promise.all([
                    getContent('hero'), getContent('about'), getContent('stats'),
                    getContent('pricing'), getContent('marquee'),
                ]);
                if (h) setHero(h);
                if (a) setAbout(a);
                if (st) setStats(st);
                if (pr) setPricing(pr);
                if (mq) setMarquee(mq);
            } catch (e) { console.warn(e.message); }
            setLoading(false);
        }
        load();
    }, [confSpecs]);

    const save = async () => {
        setStatus('saving');
        try {
            await Promise.all([
                updateContent('hero', hero),
                updateContent('about', about),
                updateContent('stats', stats),
                updateContent('pricing', pricing),
                updateContent('marquee', marquee),
            ]);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    // Array helpers
    const updateItem = (setter, arr, idx, field, val) => {
        setter(prev => {
            const newArr = [...(prev[arr])];
            newArr[idx] = { ...newArr[idx], [field]: val };
            return { ...prev, [arr]: newArr };
        });
    };

    const addItem = (setter, arr, template) => {
        setter(prev => ({ ...prev, [arr]: [...(prev[arr] || []), template] }));
    };

    const removeItem = (setter, arr, idx) => {
        setter(prev => ({ ...prev, [arr]: prev[arr].filter((_, i) => i !== idx) }));
    };

    const updateListItem = (setter, field, idx, val) => {
        setter(prev => {
            const a = [...(prev[field] || [])];
            a[idx] = val;
            return { ...prev, [field]: a };
        });
    };

    const addListItem = (setter, field) => {
        setter(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
    };

    const removeListItem = (setter, field, idx) => {
        setter(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    };

    const updatePkgFeature = (pkgIdx, fIdx, val) => {
        setPricing(prev => {
            const pkgs = [...prev.packages];
            const feats = [...pkgs[pkgIdx].features];
            feats[fIdx] = val;
            pkgs[pkgIdx] = { ...pkgs[pkgIdx], features: feats };
            return { ...prev, packages: pkgs };
        });
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading website data...</p>
            </div>
        </div>
    );

    return (
        <div className="id-page">
            {/* Header */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Website Sections Manager</h1>
                    <p className="id-subtitle">Edit all sections of the {confSpecs.shortName} website. Changes save directly to MongoDB and reflect live on the site.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'saved' && <div className="id-save-badge"><CheckCircle size={15} /> Saved!</div>}
                    {status === 'error' && <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}><AlertCircle size={15} /> Error</div>}
                    <button
                        onClick={save}
                        disabled={status === 'saving'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}
                    >
                        {status === 'saving'
                            ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            : <Save size={16} />}
                        Save All to Database
                    </button>
                </div>
            </div>

            {/* â”€â”€ HERO SECTION â”€â”€ */}
            <Section title="ðŸ  Hero Section (Home Page Banner)" color="#6366f1"
                sectionRef={sectionRefs.hero} highlighted={highlighted === 'hero'}>
                <FR label="Top Subtitle">
                    <input style={inp} value={hero.subtitle} onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))} placeholder="ANNUAL INTERNATIONAL CONFERENCE ON" />
                </FR>
                <FR label="Main Title">
                    <textarea style={textarea} value={hero.title} onChange={e => setHero(h => ({ ...h, title: e.target.value }))} placeholder="LIUTEX AND VORTEX&#10;IDENTIFICATION" rows={2} />
                </FR>
                <FR label="Description">
                    <textarea style={textarea} value={hero.description} onChange={e => setHero(h => ({ ...h, description: e.target.value }))} rows={3} />
                </FR>
                <FR label="Conference Date Text">
                    <input style={inp} value={hero.conferenceDate} onChange={e => setHero(h => ({ ...h, conferenceDate: e.target.value }))} placeholder="December 14-16, 2026" />
                </FR>
                <FR label="Venue">
                    <input style={inp} value={hero.venue} onChange={e => setHero(h => ({ ...h, venue: e.target.value }))} placeholder="Outram, Singapore" />
                </FR>
                <FR label="Countdown Target">
                    <input style={inp} type="datetime-local" value={hero.countdownTarget?.slice(0, 16) || ''} onChange={e => setHero(h => ({ ...h, countdownTarget: e.target.value }))} />
                </FR>
                <FR label="Show Buttons">
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {[['showRegister', 'Register Now'], ['showAbstract', 'Submit Abstract'], ['showBrochure', 'Download Brochure']].map(([key, lbl]) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                <input type="checkbox" checked={!!hero[key]} onChange={e => setHero(h => ({ ...h, [key]: e.target.checked }))} />
                                {lbl}
                            </label>
                        ))}
                    </div>
                </FR>

                {/* â”€â”€ Hero Background Image Upload â”€â”€ */}
                <FR label="Background Image">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Current preview */}
                        {hero.bgImage && (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={hero.bgImage}
                                    alt="Hero background preview"
                                    style={{ width: '100%', maxWidth: '420px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e2e8f0' }}
                                />
                                <button
                                    onClick={() => setHero(h => ({ ...h, bgImage: '' }))}
                                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                                    title="Remove background image"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}
                        {/* Upload button */}
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', border: '2px dashed #c7d2fe', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#6366f1', width: 'fit-content' }}>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const fd = new FormData();
                                    fd.append('image', file);
                                    try {
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                                        const res = await fetch(`${apiUrl}/upload`, { method: 'POST', body: fd });
                                        const data = await res.json();
                                        if (data.url) setHero(h => ({ ...h, bgImage: data.url }));
                                        else if (data.error) alert(`Upload failed: ${data.error}`);
                                    } catch { alert('Upload failed. Is the backend running?'); }
                                }}
                            />
                            ðŸ“· {hero.bgImage ? 'Change Background Image' : 'Upload Background Image'}
                        </label>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                            Recommended: 1920Ã—1080px or wider. JPG/PNG/WebP. Replaces the default hero background.
                        </p>
                    </div>
                </FR>
            </Section>

            {/* â”€â”€ ABOUT SECTION â”€â”€ */}
            <Section title="â„¹ï¸ About Section" color="#0ea5e9"
                sectionRef={sectionRefs.about} highlighted={highlighted === 'about'}>
                <FR label="Subtitle"><input style={inp} value={about.subtitle} onChange={e => setAbout(a => ({ ...a, subtitle: e.target.value }))} /></FR>
                <FR label="Title"><input style={inp} value={about.title} onChange={e => setAbout(a => ({ ...a, title: e.target.value }))} /></FR>
                <FR label="Paragraph 1"><textarea style={textarea} value={about.paragraph1} onChange={e => setAbout(a => ({ ...a, paragraph1: e.target.value }))} rows={4} /></FR>
                <FR label="Paragraph 2"><textarea style={textarea} value={about.paragraph2} onChange={e => setAbout(a => ({ ...a, paragraph2: e.target.value }))} rows={4} /></FR>

                <FR label="Objectives">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(about.objectives || []).map((obj, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                <input style={{ ...inp, flex: 1 }} value={obj} onChange={e => updateListItem(setAbout, 'objectives', i, e.target.value)} />
                                <button onClick={() => removeListItem(setAbout, 'objectives', i)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}><X size={14} /></button>
                            </div>
                        ))}
                        <button onClick={() => addListItem(setAbout, 'objectives')} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '6px 12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                            <Plus size={14} /> Add Objective
                        </button>
                    </div>
                </FR>

                <FR label="Key Themes">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(about.keyThemes || []).map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                <input style={{ ...inp, flex: 1 }} value={t} onChange={e => updateListItem(setAbout, 'keyThemes', i, e.target.value)} />
                                <button onClick={() => removeListItem(setAbout, 'keyThemes', i)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}><X size={14} /></button>
                            </div>
                        ))}
                        <button onClick={() => addListItem(setAbout, 'keyThemes')} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '6px 12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                            <Plus size={14} /> Add Theme
                        </button>
                    </div>
                </FR>
            </Section>

            {/* â”€â”€ STATS SECTION â”€â”€ */}
            <Section title="ðŸ“Š Stats Section" color="#10b981"
                sectionRef={sectionRefs.stats} highlighted={highlighted === 'stats'}>
                <FR label="Section Title"><input style={inp} value={stats.title} onChange={e => setStats(s => ({ ...s, title: e.target.value }))} /></FR>
                <FR label="Stats Items">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {(stats.items || []).map((item, i) => (
                            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', position: 'relative' }}>
                                <button onClick={() => removeItem(setStats, 'items', i)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
                                <div style={{ marginBottom: '6px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>NUMBER</label>
                                    <input style={{ ...inp, fontSize: '14px', fontWeight: 700 }} value={item.number} onChange={e => updateItem(setStats, 'items', i, 'number', e.target.value)} placeholder="100+" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>LABEL</label>
                                    <input style={inp} value={item.label} onChange={e => updateItem(setStats, 'items', i, 'label', e.target.value)} placeholder="Speakers" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addItem(setStats, 'items', { number: '0+', label: 'New Stat' })}
                            style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', color: '#64748b', fontSize: '13px' }}>
                            <Plus size={20} /> Add Stat
                        </button>
                    </div>
                </FR>
            </Section>

            {/* â”€â”€ PRICING SECTION â”€â”€ */}
            <Section title="ðŸ’° Registration Pricing Section" color="#f59e0b"
                sectionRef={sectionRefs.pricing} highlighted={highlighted === 'pricing'}>
                <FR label="Section Title"><input style={inp} value={pricing.title} onChange={e => setPricing(p => ({ ...p, title: e.target.value }))} /></FR>
                <FR label="Packages">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(pricing.packages || []).map((pkg, pIdx) => (
                            <div key={pIdx} style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                                <button onClick={() => removeItem(setPricing, 'packages', pIdx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={16} /></button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>PACKAGE TITLE</label>
                                        <input style={inp} value={pkg.title} onChange={e => updateItem(setPricing, 'packages', pIdx, 'title', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>PRICE</label>
                                        <input style={inp} value={pkg.price} onChange={e => updateItem(setPricing, 'packages', pIdx, 'price', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>CURRENCY</label>
                                        <input style={inp} value={pkg.currency} onChange={e => updateItem(setPricing, 'packages', pIdx, 'currency', e.target.value)} placeholder="USD" />
                                    </div>
                                </div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>FEATURES</label>
                                {(pkg.features || []).map((feat, fIdx) => (
                                    <div key={fIdx} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                                        <input style={{ ...inp, flex: 1, padding: '6px 10px', fontSize: '12px' }} value={feat} onChange={e => updatePkgFeature(pIdx, fIdx, e.target.value)} />
                                        <button onClick={() => {
                                            setPricing(prev => {
                                                const pkgs = [...prev.packages];
                                                pkgs[pIdx] = { ...pkgs[pIdx], features: pkgs[pIdx].features.filter((_, fi) => fi !== fIdx) };
                                                return { ...prev, packages: pkgs };
                                            });
                                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={13} /></button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    setPricing(prev => {
                                        const pkgs = [...prev.packages];
                                        pkgs[pIdx] = { ...pkgs[pIdx], features: [...(pkgs[pIdx].features || []), ''] };
                                        return { ...prev, packages: pkgs };
                                    });
                                }} style={{ marginTop: '4px', fontSize: '12px', color: '#6366f1', background: 'none', border: '1px dashed #a5b4fc', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                                    <Plus size={12} style={{ display: 'inline' }} /> Add Feature
                                </button>
                            </div>
                        ))}
                        <button onClick={() => addItem(setPricing, 'packages', { title: 'New Package', price: '0', currency: 'USD', features: ['Feature 1'] })}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed #fde68a', borderRadius: '10px', background: 'none', cursor: 'pointer', color: '#b45309', fontWeight: 600, fontSize: '13px' }}>
                            <Plus size={16} /> Add Package
                        </button>
                    </div>
                </FR>
            </Section>

            {/* â”€â”€ MARQUEE / Universities â”€â”€ */}
            <Section title="ðŸ« Universities Marquee" color="#8b5cf6"
                sectionRef={sectionRefs.marquee} highlighted={highlighted === 'marquee'}>
                <FR label="Section Title"><input style={inp} value={marquee.title} onChange={e => setMarquee(m => ({ ...m, title: e.target.value }))} /></FR>
                <FR label="Universities / Institutions">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                        {(marquee.items || []).map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '6px' }}>
                                <input style={{ ...inp, flex: 1 }} value={item} onChange={e => updateListItem(setMarquee, 'items', i, e.target.value)} />
                                <button onClick={() => removeListItem(setMarquee, 'items', i)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addListItem(setMarquee, 'items')} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '7px 14px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        <Plus size={14} /> Add Institution
                    </button>
                </FR>
            </Section>

            {/* â”€â”€ PROMOTING & MEDIA PARTNERS â”€â”€ */}
            <Section title="ðŸ¤ Promoting & Media Partners" color="#ec4899"
                sectionRef={sectionRefs.partners} highlighted={highlighted === 'partners'}>
                <div style={{ padding: '6px 0' }}>
                    <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px', lineHeight: 1.6 }}>
                        Manage your conference sponsors and media partners from their dedicated pages. Use the links below to navigate directly to those sections.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <a
                            href="#"
                            onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('nav-to', { detail: 'sponsors' })); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', boxShadow: '0 3px 12px rgba(245,158,11,0.35)' }}
                        >
                            <ExternalLink size={15} /> Manage Sponsors
                        </a>
                        <a
                            href="#"
                            onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('nav-to', { detail: 'mediapartners' })); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', boxShadow: '0 3px 12px rgba(236,72,153,0.35)' }}
                        >
                            <ExternalLink size={15} /> Manage Media Partners
                        </a>
                    </div>
                    <div style={{ marginTop: '20px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px 18px' }}>
                        <p style={{ fontSize: '12px', color: '#92400e', fontWeight: 600, margin: 0 }}>
                            ðŸ’¡ Tip: Sponsors and Media Partners logos, links and descriptions are managed from their own dedicated pages accessible via the sidebar under <strong>Partners</strong>.
                        </p>
                    </div>
                </div>
            </Section>

            {/* Bottom Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                    onClick={save}
                    disabled={status === 'saving'}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 18px rgba(99,102,241,0.35)' }}
                >
                    <Save size={16} /> Save All Changes to Database
                </button>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { outline: 2px solid #6366f1; border-color: #6366f1; }
      `}</style>
        </div>
    );
}

