'use client';

import { useState } from 'react';
import { Save, RotateCcw, CheckCircle, Tag } from 'lucide-react';

const COMMON_KEYWORDS = 'Solar Energy, Wind Power Energy, Hydro Power, Geothermal Energy, Hydrogen and Fuel Cells, Biomass, Photovoltaic cells, Nuclear Energy, Power Energy Management.';

const DEFAULTS = {
    homepage: {
        title: 'RENEWABLEMEET2026',
        description: '2nd International Meet & Expo on Renewable and Sustainable Energy at Rome, Italy ,May 25-26, 2026',
        keywords: COMMON_KEYWORDS,
    },
    home: {
        title: 'RENEWABLEMEET2026 | 2nd International Meet & Expo on Renewable and Sustainable Energy | Rome, Italy',
        description: '2nd International Meet & Expo on Renewable and Sustainable Energy (RENEWABLEMEET2026) will be held in Rome, Italy during May 25-26, 2026',
        keywords: COMMON_KEYWORDS,
    },
    contact: {
        title: 'RENEWABLEMEET2026 | Contact RENEWABLEMEET2026 | Rome, Italy',
        description: 'Contact information at 2nd International Meet & Expo on Renewable and Sustainable Energy (RENEWABLEMEET2026) will be held in Rome, Italy during May 25-26, 2026',
        keywords: COMMON_KEYWORDS,
    },
    registration: {
        title: 'RENEWABLEMEET2026| Get Register for RENEWABLEMEET2026 | Online Registration',
        description: 'Register to our conference today to gain unlimited access to all scientific sessions. Get ready to join us in taking your knowledge to next level. Complete your registration through online registration form',
        keywords: COMMON_KEYWORDS,
    },
    guidelines: {
        title: 'RENEWABLEMEET2026 | Guidelines for Joining RENEWABLEMEET2026 | Rome, Italy',
        description: 'Guideline for joining Renewable and Sustainable Energy to know more about our conference RENEWABLEMEET2026',
        keywords: COMMON_KEYWORDS,
    },
    policies: {
        title: 'RENEWABLEMEET2026 | Policies for Joining RENEWABLEMEET2026 | Rome, Italy',
        description: 'Policies for Joining Renewable and Sustainable Energy to know more about our conference',
        keywords: COMMON_KEYWORDS,
    },
};

const SECTIONS = [
    { key: 'homepage', label: 'Homepage' },
    { key: 'home', label: 'Home Page' },
    { key: 'contact', label: 'Contact Page' },
    { key: 'registration', label: 'Registration Page' },
    { key: 'guidelines', label: 'Guidelines Page' },
    { key: 'policies', label: 'Policies Page' },
];

/* â”€â”€ Field group: note banner + textarea â”€â”€ */
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

/* â”€â”€ One page section card â”€â”€ */
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
    const [saved, setSaved] = useState(false);

    const handleChange = (section, field, value) => {
        setForm(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleUpdate = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        setForm(DEFAULTS);
        setSaved(false);
    };

    return (
        <div className="mt-page">
            {/* Page header */}
            <div className="mt-page-header">
                <div>
                    <h1 className="mt-title">Meta Tags</h1>
                    <p className="mt-subtitle">Configure SEO meta tags for each page of your conference website.</p>
                </div>
                {saved && (
                    <div className="mt-save-badge">
                        <CheckCircle size={15} /> Changes saved
                    </div>
                )}
            </div>

            {/* All section cards */}
            <div className="mt-sections">
                {SECTIONS.map(({ key, label }) => (
                    <SectionCard
                        key={key}
                        label={label}
                        data={form[key]}
                        onChange={(field, value) => handleChange(key, field, value)}
                    />
                ))}
            </div>

            {/* Action buttons */}
            <div className="mt-actions">
                <button className="mt-btn-reset" onClick={handleReset}>
                    <RotateCcw size={15} /> Reset
                </button>
                <button className="mt-btn-save" onClick={handleUpdate}>
                    <Save size={15} /> Update
                </button>
            </div>
        </div>
    );
}

