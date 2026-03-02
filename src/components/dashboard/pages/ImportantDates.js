'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, CheckCircle, AlertCircle, X, Plus } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

const ICON_OPTIONS = ['CalendarDays', 'CheckCircle', 'Clock', 'Star', 'Calendar', 'MapPin'];

export default function ImportantDates() {
    const [form, setForm] = useState({
        shortName: 'LIUTEXSUMMIT2026',
        completeUrl: 'https://liutexvortexsummit.com/',
        title: 'Annual International Conference on Liutex and Vortex Identification',
        subject: 'Liutex and Vortex Identification',
        venue: 'Outram, Singapore',
        dates: 'December 14-16, 2026',
        theme: 'Liutex Theory and Applications in Vortex Identification and Vortex Dynamics',
        email: 'info@liutexvortexsummit.com',
        facebook: '', twitter: '', linkedin: '',
        fullName: 'Conference Organizer',
        countdownTarget: '2026-12-14T09:00:00',
    });
    const [importantDates, setImportantDates] = useState([
        { month: 'JUN', day: '15', year: '2026', event: 'Abstract Submission Opens', icon: 'CalendarDays' },
        { month: 'SEP', day: '25', year: '2026', event: 'Early Bird Deadline', icon: 'CheckCircle' },
        { month: 'OCT', day: '30', year: '2026', event: 'Submission Deadline', icon: 'Clock' },
        { month: 'DEC', day: '14', year: '2026', event: 'Conference Date', icon: 'Star', sub: 'December 14-16, 2026, Singapore' },
    ]);
    const [status, setStatus] = useState(null); // 'saving' | 'saved' | 'error'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const info = await getContent('hero');
                const datesData = await getContent('importantDates');
                const contactData = await getContent('contact');
                setForm(prev => ({
                    ...prev,
                    dates: info?.conferenceDate || prev.dates,
                    venue: info?.venue || prev.venue,
                    countdownTarget: info?.countdownTarget || prev.countdownTarget,
                    email: contactData?.email || prev.email,
                    facebook: contactData?.socialLinks?.facebook || '',
                    twitter: contactData?.socialLinks?.twitter || '',
                    linkedin: contactData?.socialLinks?.linkedin || '',
                }));
                if (datesData?.dates) setImportantDates(datesData.dates);
            } catch (e) { console.warn('Load failed:', e.message); }
            setLoading(false);
        }
        load();
    }, []);

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const updateDate = (idx, field, value) => {
        setImportantDates(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    const addDate = () => {
        setImportantDates(prev => [...prev, { month: 'JAN', day: '01', year: '2026', event: 'New Event', icon: 'Calendar', sub: '' }]);
    };

    const removeDate = (idx) => {
        setImportantDates(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        setStatus('saving');
        try {
            // Save hero info
            await updateContent('hero', {
                conferenceDate: form.dates,
                venue: form.venue,
                countdownTarget: form.countdownTarget,
            });
            // Save important dates
            await updateContent('importantDates', { dates: importantDates });
            // Save contact
            await updateContent('contact', {
                email: form.email,
                socialLinks: { facebook: form.facebook, twitter: form.twitter, linkedin: form.linkedin }
            });
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const handleReset = () => {
        setForm(prev => ({ ...prev }));
        setStatus(null);
    };

    if (loading) return (
        <div className="id-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading from database...</p>
            </div>
        </div>
    );

    return (
        <div className="id-page">
            {/* Page Header */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Conference Info & Important Dates</h1>
                    <p className="id-subtitle">All changes sync live to the LIUTEXSUMMIT2026 website via backend API.</p>
                </div>
                {status === 'saved' && (
                    <div className="id-save-badge"><CheckCircle size={15} /> Saved to database</div>
                )}
                {status === 'error' && (
                    <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <AlertCircle size={15} /> Save failed â€“ check backend
                    </div>
                )}
            </div>

            <div className="id-card">
                {/* Conference Info */}
                <div className="id-section">
                    <div className="id-section-header">
                        <span className="id-section-dot" />
                        <span className="id-section-title">Conference Information</span>
                    </div>

                    {[
                        { key: 'shortName', label: 'Conference Short Name', type: 'text', placeholder: 'LIUTEXSUMMIT2026' },
                        { key: 'completeUrl', label: 'Conference URL', type: 'url', placeholder: 'https://liutexvortexsummit.com/' },
                        { key: 'title', label: 'Full Conference Title', type: 'text', placeholder: 'Annual International Conference on...' },
                        { key: 'subject', label: 'Conference Subject', type: 'text', placeholder: 'Subject area' },
                        { key: 'venue', label: 'Conference Venue', type: 'text', placeholder: 'City, Country' },
                        { key: 'dates', label: 'Conference Dates', type: 'text', placeholder: 'December 14-16, 2026' },
                        { key: 'theme', label: 'Conference Theme', type: 'text', placeholder: 'Theme of the conference' },
                        { key: 'email', label: 'Primary Email', type: 'email', placeholder: 'info@conference.com' },
                        { key: 'countdownTarget', label: 'Countdown Target (Date & Time)', type: 'datetime-local', placeholder: '' },
                    ].map(({ key, label, type, placeholder }) => (
                        <div className="id-field-row" key={key}>
                            <div className="id-field-label"><div><span className="id-label-text">{label}</span><span className="id-colon">:</span></div></div>
                            <div className="id-field-input">
                                <input className="id-input" type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="id-divider" />

                {/* Social Links */}
                <div className="id-section">
                    <div className="id-section-header">
                        <span className="id-section-dot id-dot-blue" />
                        <span className="id-section-title">Social Media Links</span>
                    </div>
                    {[
                        { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                        { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                        { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
                    ].map(({ key, label, placeholder }) => (
                        <div className="id-field-row" key={key}>
                            <div className="id-field-label"><span className="id-label-text">{label}:</span></div>
                            <div className="id-field-input">
                                <input className="id-input" type="url" value={form[key]} onChange={set(key)} placeholder={placeholder} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="id-divider" />

                {/* Important Dates Cards */}
                <div className="id-section">
                    <div className="id-section-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="id-section-dot id-dot-amber" />
                            <span className="id-section-title">Important Dates (Displayed on Website)</span>
                        </div>
                        <button onClick={addDate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            <Plus size={14} /> Add Date
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                        {importantDates.map((d, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', position: 'relative' }}>
                                <button onClick={() => removeDate(idx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                    <X size={16} />
                                </button>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                    {[
                                        { key: 'month', label: 'Month (e.g. JAN)', placeholder: 'DEC' },
                                        { key: 'day', label: 'Day', placeholder: '14' },
                                        { key: 'year', label: 'Year', placeholder: '2026' },
                                        { key: 'event', label: 'Event Label', placeholder: 'Conference Date' },
                                        { key: 'sub', label: 'Sub-text (optional)', placeholder: 'Dec 14-16, Singapore' },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                                            <input
                                                className="id-input"
                                                type="text"
                                                value={d[key] || ''}
                                                onChange={e => updateDate(idx, key, e.target.value)}
                                                placeholder={placeholder}
                                                style={{ padding: '7px 10px', fontSize: '13px' }}
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Icon</label>
                                        <select className="id-input" value={d.icon || 'Calendar'} onChange={e => updateDate(idx, 'icon', e.target.value)} style={{ padding: '7px 10px', fontSize: '13px' }}>
                                            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="id-actions">
                    <button className="id-btn-reset" onClick={handleReset}><RotateCcw size={15} /> Reset</button>
                    <button className="id-btn-save" onClick={handleSave} disabled={status === 'saving'}>
                        {status === 'saving' ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : <Save size={15} />}
                        {status === 'saving' ? ' Saving...' : ' Save to Database'}
                    </button>
                </div>
            </div>
        </div>
    );
}

