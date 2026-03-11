'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

export default function ContactSettings({ type }) {
    // type is 'email' | 'phone' | 'whatsapp'
    const [form, setForm] = useState({ value: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const labels = {
        email: { title: 'Send Email', label: 'Email Address', placeholder: 'contact@liutexvortexsummit.com', field: 'email' },
        phone: { title: 'Call Us Now', label: 'Phone Number', placeholder: '+91 7842090097', field: 'phone' },
        whatsapp: { title: 'WhatsApp', label: 'WhatsApp Number', placeholder: '+91 7842090097', field: 'whatsapp' },
    };

    const config = labels[type];

    useEffect(() => {
        async function load() {
            try {
                const contactData = await getContent('contact');
                setForm({ value: contactData?.[config.field] || '' });
            } catch (e) { console.warn('Load failed:', e.message); }
            setLoading(false);
        }
        load();
    }, [type, config.field]);

    const handleSave = async () => {
        setStatus('saving');
        try {
            const currentData = await getContent('contact') || {};
            await updateContent('contact', {
                ...currentData,
                [config.field]: form.value
            });
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const handleReset = () => {
        setForm({ value: '' });
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
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">{config.title} Settings</h1>
                    <p className="id-subtitle">All changes sync live to the website via backend API.</p>
                </div>
                {status === 'saved' && (
                    <div className="id-save-badge"><CheckCircle size={15} /> Saved to database</div>
                )}
                {status === 'error' && (
                    <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <AlertCircle size={15} /> Save failed – check backend
                    </div>
                )}
            </div>

            <div className="id-card">
                <div className="id-section">
                    <div className="id-section-header">
                        <span className="id-section-dot" />
                        <span className="id-section-title">{config.title} Information</span>
                    </div>

                    <div className="id-field-row">
                        <div className="id-field-label"><div><span className="id-label-text">{config.label}</span><span className="id-colon">:</span></div></div>
                        <div className="id-field-input">
                            <input
                                className="id-input"
                                type="text"
                                value={form.value}
                                onChange={e => setForm({ value: e.target.value })}
                                placeholder={config.placeholder}
                            />
                        </div>
                    </div>
                </div>

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
