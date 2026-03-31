'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, CheckCircle, AlertCircle, Tag, Loader } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

const LIUTEX_KEYWORDS = 'LIUTEX2026, Liutex Theory, Vortex Identification, Vortex Dynamics, CFD Conference 2026, Computational Fluid Dynamics, Fluid Mechanics Conference 2026, Turbulence Conference, Singapore Conference December 2026, Abstract submission fluid mechanics';

const DEFAULTS = {
    home: {
        title: 'LIUTEX2026 | International Conference on Liutex Theory & Vortex Dynamics – Singapore Dec 14–16',
        description: 'LIUTEX2026 – International Conference on Liutex Theory and Applications in Vortex Identification and Vortex Dynamics. December 14–16, 2026, Outram, Singapore. Submit abstracts, register now.',
        keywords: LIUTEX_KEYWORDS,
    },
    contact: {
        title: 'Contact Us | LIUTEX2026 | Singapore',
        description: 'Get in touch with the LIUTEX2026 organizing committee for questions on registration, abstract submission, visa, or the conference schedule.',
        keywords: LIUTEX_KEYWORDS,
    },
    registration: {
        title: 'Register | LIUTEX2026 | Online Registration',
        description: 'Register for LIUTEX2026 today to gain access to all scientific sessions. Early bird rates available until September 30, 2026. Complete your registration through the online form.',
        keywords: LIUTEX_KEYWORDS,
    },
    speakers: {
        title: 'Speakers | LIUTEX2026 | Keynote & Invited Speakers',
        description: 'Meet the world-class keynote and invited speakers at LIUTEX2026 – International Conference on Liutex Theory & Vortex Dynamics, Singapore, December 2026.',
        keywords: LIUTEX_KEYWORDS,
    },
    venue: {
        title: 'Venue | LIUTEX2026 | Outram, Singapore',
        description: 'LIUTEX2026 will be held in Outram, Singapore, December 14–16, 2026. Learn about the venue, accommodation, and travel information.',
        keywords: LIUTEX_KEYWORDS,
    },
    abstract: {
        title: 'Abstract Submission | LIUTEX2026 | Call for Papers',
        description: 'Submit your abstract to LIUTEX2026. The call for papers is open for topics in Liutex Theory, Vortex Identification, Vortex Dynamics, Turbulence, CFD, and Fluid Mechanics.',
        keywords: LIUTEX_KEYWORDS,
    },
};

const SECTIONS = [
    { key: 'home', label: 'Home Page' },
    { key: 'contact', label: 'Contact Page' },
    { key: 'registration', label: 'Registration Page' },
    { key: 'speakers', label: 'Speakers Page' },
    { key: 'venue', label: 'Venue Page' },
    { key: 'abstract', label: 'Abstract Submission Page' },
];

/* ── Field group: note banner + textarea ── */
function MetaField({ note, value, onChange, rows = 4 }) {
    return (
        <div className="mt-field">
            <div className="mt-note-banner">
                <Tag size={13} className="mt-note-icon" />
                {note}
            </div>
            <textarea
                className="mt-textarea"
                rows={rows}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

/* ── One page section card ── */
function SectionCard({ label, data, onChange }) {
    return (
        <div className="mt-section-card">
            <div className="mt-section-title">{`Meta Tags For ${label}`}</div>
            <MetaField
                note="Note: Title Bars should be upto 50-60 characters."
                value={data.title}
                onChange={e => onChange('title', e.target.value)}
                rows={3}
            />
            <MetaField
                note="Note: Description should be upto 120-150 characters."
                value={data.description}
                onChange={e => onChange('description', e.target.value)}
                rows={4}
            />
            <MetaField
                note="Note: Each keyword seperated by ',' and Meta Keywords limit - 10 keywords"
                value={data.keywords}
                onChange={e => onChange('keywords', e.target.value)}
                rows={4}
            />
        </div>
    );
}

export default function MetaTags() {
    const [form, setForm] = useState(DEFAULTS);
    const [status, setStatus] = useState(null); // null | 'loading' | 'saving' | 'saved' | 'error'

    // ── Load from DB on mount ──
    useEffect(() => {
        setStatus('loading');
        getContent('meta_tags').then(data => {
            if (data && Object.keys(data).some(k => SECTIONS.find(s => s.key === k))) {
                // Merge DB data with defaults (so new sections get defaults)
                setForm(prev => ({ ...prev, ...data }));
            }
        }).catch(console.warn).finally(() => setStatus(null));
    }, []);

    const handleChange = (section, field, value) => {
        setForm(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleUpdate = async () => {
        setStatus('saving');
        try {
            await updateContent('meta_tags', form);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const handleReset = () => {
        setForm(DEFAULTS);
        setStatus(null);
    };

    return (
        <div className="mt-page">
            {/* Page header */}
            <div className="mt-page-header">
                <div>
                    <h1 className="mt-title">Meta Tags</h1>
                    <p className="mt-subtitle">Configure SEO meta tags for each page of your conference website. Changes are saved to the database and applied live on the LIUTEX site.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {status === 'loading' && (
                        <div className="mt-save-badge" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
                            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
                        </div>
                    )}
                    {status === 'saving' && (
                        <div className="mt-save-badge" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
                            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
                        </div>
                    )}
                    {status === 'saved' && (
                        <div className="mt-save-badge">
                            <CheckCircle size={15} /> Saved to database
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mt-save-badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            <AlertCircle size={15} /> Save failed
                        </div>
                    )}
                </div>
            </div>

            {/* All section cards */}
            <div className="mt-sections">
                {SECTIONS.map(({ key, label }) => (
                    <SectionCard
                        key={key}
                        label={label}
                        data={form[key] || DEFAULTS[key]}
                        onChange={(field, value) => handleChange(key, field, value)}
                    />
                ))}
            </div>

            {/* Action buttons */}
            <div className="mt-actions">
                <button className="mt-btn-reset" onClick={handleReset}>
                    <RotateCcw size={15} /> Reset to Defaults
                </button>
                <button className="mt-btn-save" onClick={handleUpdate} disabled={status === 'saving' || status === 'loading'}>
                    <Save size={15} /> {status === 'saving' ? 'Saving...' : 'Save to Database'}
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
