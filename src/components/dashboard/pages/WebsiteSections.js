'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { getContent, updateContent, getConference, uploadImage, uploadFile } from '@/lib/api';
import { CONFERENCE_CONFIG } from '@/lib/conferences';

/* ── Collapsible Section Wrapper ── */
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

/* ── Field Row ── */
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
        conferenceDate: 'March 15-17, 2027',
        venue: 'Munich, Germany',
        countdownTarget: '2027-03-15T09:00:00',
        showRegister: true, showAbstract: true, showBrochure: true, showAnnouncement: false,
        announcementUrl: '/pdfs/announcement.pdf',
        brochureUrl: '/pdfs/brochure.pdf',
        abstractTemplateUrl: '/pdfs/abstract-template.doc',
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
    const [brochure, setBrochure] = useState({
        title: `International Conference on ${confSpecs.displayName}`,
        description: `Download the official conference brochure to get comprehensive information about the ${confSpecs.displayName}. It serves as your complete guide to the event.`,
        note: '* PDF will be available soon. Format: PDF',
        features: [
            'Complete 3-Day Program Schedule',
            'Keynote Speaker Biographies & Topics',
            'Workshop & Breakout Session Details',
            'Venue Maps & Accommodation Guide',
            'Sponsorship & Exhibition Opportunities',
        ]
    });
    const [marquee, setMarquee] = useState({ title: 'Supporting Universities & Institutions', items: [] });
    const [partners, setPartners] = useState({ title: 'Promoting & Media Partners', items: [] });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [highlighted, setHighlighted] = useState(null);
    const [uploadingIdx, setUploadingIdx] = useState(null);
    const [uploadingPartnerIdx, setUploadingPartnerIdx] = useState(null);

    // Refs for each section
    const sectionRefs = {
        hero: useRef(null),
        about: useRef(null),
        brochure: useRef(null),
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
                const [h, a, st, pr, mq, pa, br] = await Promise.all([
                    getContent('hero'), getContent('about'), getContent('stats'),
                    getContent('pricing'), getContent('marquee'), getContent('partners_logos'),
                    getContent('brochure')
                ]);
                if (h) setHero(prev => ({ 
                    ...prev, ...h, 
                    announcementUrl: h.announcementUrl || prev.announcementUrl || '/pdfs/announcement.pdf', 
                    brochureUrl: h.brochureUrl || prev.brochureUrl || '/pdfs/brochure.pdf',
                    abstractTemplateUrl: h.abstractTemplateUrl || prev.abstractTemplateUrl || '/pdfs/abstract-template.doc'
                }));
                if (a) setAbout(prev => ({ ...prev, ...a }));
                if (st) setStats(prev => ({ ...prev, ...st }));
                if (pr) setPricing(prev => ({ ...prev, ...pr }));
                if (mq) setMarquee(prev => ({ ...prev, ...mq }));
                if (pa) setPartners(prev => ({ ...prev, ...pa }));
                if (br) setBrochure(prev => ({ ...prev, ...br }));
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
                updateContent('brochure', brochure),
                updateContent('stats', stats),
                updateContent('pricing', pricing),
                updateContent('marquee', marquee),
                updateContent('partners_logos', partners),
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
            const newArr = [...(prev[arr] || [])];
            newArr[idx] = { ...newArr[idx], [field]: val };
            return { ...prev, [arr]: newArr };
        });
    };

    const addItem = (setter, arr, template) => {
        setter(prev => ({ ...prev, [arr]: [...(prev[arr] || []), template] }));
    };

    const removeItem = (setter, arr, idx) => {
        setter(prev => ({ ...prev, [arr]: (prev[arr] || []).filter((_, i) => i !== idx) }));
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
                    <h1 className="id-title">Registration Prices</h1>
                    <p className="id-subtitle">
                        Manage registration fees, accommodation, and sponsorship pricing for the {confSpecs.shortName}.
                        Changes are saved to MongoDB and applied live on the registration page.
                    </p>
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

            {/* ── HERO SECTION ── */}
            <Section title="🏠 Hero Section (Home Page Banner)" color="#6366f1"
                sectionRef={sectionRefs.hero} highlighted={highlighted === 'hero'}>
                <FR label="Top Subtitle">
                    <input style={inp} value={hero.subtitle} onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))} placeholder="ANNUAL INTERNATIONAL CONFERENCE ON" />
                </FR>
                <FR label="Main Title">
                    <textarea style={textarea} value={hero.title} onChange={e => setHero(h => ({ ...h, title: e.target.value }))} placeholder="QUANTUM COMPUTING AND&#10;ENGINEERING SUMMIT" rows={2} />
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
                        {[['showRegister', 'Register Now'], ['showAbstract', 'Submit Abstract'], ['showBrochure', 'Download Brochure'], ['showAnnouncement', 'Show Announcement']].map(([key, lbl]) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                <input type="checkbox" checked={!!hero[key]} onChange={e => setHero(h => ({ ...h, [key]: e.target.checked }))} />
                                {lbl}
                            </label>
                        ))}
                    </div>
                </FR>
                
                {/* ── Conference Announcement PDF ── */}
                <FR label="Announcement PDF">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input style={{...inp, flex: 1}} value={hero.announcementUrl || ''} onChange={e => setHero(h => ({ ...h, announcementUrl: e.target.value }))} placeholder="/pdfs/announcement.pdf" />
                            {hero.announcementUrl && (
                                <a href={hero.announcementUrl.startsWith('http') ? hero.announcementUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}${hero.announcementUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#6366f1' }}>
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#64748b', width: 'fit-content' }}>
                            <input
                                type="file"
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const conf = getConference();
                                        const data = await uploadFile(file, conf);
                                        if (data.url) setHero(h => ({ ...h, announcementUrl: data.url }));
                                        else alert('Upload failed: no URL returned');
                                    } catch (err) { alert(`Upload failed: ${err.message}`); }
                                }}
                            />
                            📄 {hero.announcementUrl ? 'Change PDF' : 'Upload PDF'}
                        </label>
                    </div>
                </FR>

                {/* ── Conference Brochure PDF ── */}
                <FR label="Brochure PDF">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input style={{...inp, flex: 1}} value={hero.brochureUrl || ''} onChange={e => setHero(h => ({ ...h, brochureUrl: e.target.value }))} placeholder="/pdfs/brochure.pdf" />
                            {hero.brochureUrl && (
                                <a href={hero.brochureUrl.startsWith('http') ? hero.brochureUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}${hero.brochureUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#6366f1' }}>
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#64748b', width: 'fit-content' }}>
                            <input
                                type="file"
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const conf = getConference();
                                        const data = await uploadFile(file, conf);
                                        if (data.url) setHero(h => ({ ...h, brochureUrl: data.url }));
                                        else alert('Upload failed: no URL returned');
                                    } catch (err) { alert(`Upload failed: ${err.message}`); }
                                }}
                            />
                            📄 {hero.brochureUrl ? 'Change Brochure PDF' : 'Upload Brochure PDF'}
                        </label>
                    </div>
                </FR>

                {/* ── Abstract Template ── */}
                <FR label="Abstract Template">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input style={{...inp, flex: 1}} value={hero.abstractTemplateUrl || ''} onChange={e => setHero(h => ({ ...h, abstractTemplateUrl: e.target.value }))} placeholder="/pdfs/abstract-template.doc" />
                            {hero.abstractTemplateUrl && (
                                <a href={hero.abstractTemplateUrl.startsWith('http') ? hero.abstractTemplateUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}${hero.abstractTemplateUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#6366f1' }}>
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#64748b', width: 'fit-content' }}>
                            <input
                                type="file"
                                accept=".doc,.docx,.pdf"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const conf = getConference();
                                        const data = await uploadFile(file, conf);
                                        if (data.url) setHero(h => ({ ...h, abstractTemplateUrl: data.url }));
                                        else alert('Upload failed: no URL returned');
                                    } catch (err) { alert(`Upload failed: ${err.message}`); }
                                }}
                            />
                            📄 {hero.abstractTemplateUrl ? 'Change Template' : 'Upload Template'}
                        </label>
                    </div>
                </FR>

                {/* ── Hero Background Image Upload ── */}
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
                                    try {
                                        const data = await uploadImage(file);
                                        if (data.url) setHero(h => ({ ...h, bgImage: data.url }));
                                        else alert('Upload failed: no URL returned');
                                    } catch (err) { alert(`Upload failed: ${err.message}`); }
                                }}
                            />
                            📷 {hero.bgImage ? 'Change Background Image' : 'Upload Background Image'}
                        </label>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                            Recommended: 1920×1080px or wider. JPG/PNG/WebP. Replaces the default hero background.
                        </p>
                    </div>
                </FR>
            </Section>

            {/* ── ABOUT SECTION ── */}
            <Section title="ℹ️ About Section" color="#0ea5e9"
                sectionRef={sectionRefs.about} highlighted={highlighted === 'about'}>

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

            {/* ── BROCHURE SECTION ── */}
            <Section title="📄 Brochure Page Content" color="#8b5cf6"
                sectionRef={sectionRefs.brochure} highlighted={highlighted === 'brochure'}>
                
                <FR label="Main Title">
                    <input style={inp} value={brochure.title} onChange={e => setBrochure(b => ({ ...b, title: e.target.value }))} />
                </FR>
                <FR label="Description">
                    <textarea style={textarea} value={brochure.description} onChange={e => setBrochure(b => ({ ...b, description: e.target.value }))} rows={4} />
                </FR>
                <FR label="Footer Note">
                    <input style={inp} value={brochure.note} onChange={e => setBrochure(b => ({ ...b, note: e.target.value }))} />
                </FR>
                <FR label="Brochure Features">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(brochure.features || []).map((feat, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                <input style={{ ...inp, flex: 1 }} value={feat} onChange={e => updateListItem(setBrochure, 'features', i, e.target.value)} />
                                <button onClick={() => removeListItem(setBrochure, 'features', i)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}><X size={14} /></button>
                            </div>
                        ))}
                        <button onClick={() => addListItem(setBrochure, 'features')} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '6px 12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                            <Plus size={14} /> Add Feature
                        </button>
                    </div>
                </FR>
            </Section>

            {/* ── STATS SECTION ── */}
            <Section title="📊 Stats Section" color="#10b981"
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

            {/* ── PRICING SECTION ── */}
            <Section title="💰 Registration Pricing Section" color="#f59e0b"
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

            {/* ── MARQUEE / Universities ── */}
            <Section title="🏫 Universities" color="#8b5cf6"
                sectionRef={sectionRefs.marquee} highlighted={highlighted === 'marquee'}>
                <FR label="Section Title"><input style={inp} value={marquee.title} onChange={e => setMarquee(m => ({ ...m, title: e.target.value }))} /></FR>
                <FR label="University Logos">
                    <div style={{ padding: '16px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', color: '#3730a3', fontSize: '13px' }}>
                        <strong>Note:</strong> Universities are now managed as standard records! Please click <strong>"Universities"</strong> in the left sidebar under "Home Page" to upload logos, add names, and manage order via drag-and-drop.
                    </div>
                </FR>
            </Section>

            {/* ── PROMOTING & MEDIA PARTNERS ── */}
            <Section title="🤝 Promoting & Media Partners" color="#ec4899"
                sectionRef={sectionRefs.partners} highlighted={highlighted === 'partners'}>
                <FR label="Section Title"><input style={inp} value={partners.title} onChange={e => setPartners(p => ({ ...p, title: e.target.value }))} /></FR>
                <FR label="Partner Logos">
                    <div style={{ padding: '16px', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '8px', color: '#9d174d', fontSize: '13px' }}>
                        <strong>Note:</strong> Promoting & Media Partners are now managed as standard records! Please click <strong>"Promoting & Media Partners"</strong> in the left sidebar under "Home Page" to upload logos, add names and descriptions, and manage partners.
                    </div>
                </FR>
            </Section>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { outline: 2px solid #6366f1; border-color: #6366f1; }
      `}</style>
        </div>
    );
}

