'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Save, CheckCircle, AlertCircle, RefreshCw,
    Upload, FileText, Info, Link, Loader
} from 'lucide-react';
import { getContent, updateContent, uploadFile, getConference } from '@/lib/api';

const DEFAULT_DATA = {
    pdfUrl: '',
    title: 'Quantum Computing & Engineering Summit 2027 (IQCE-2027)',
    description: 'Download the official conference brochure to get comprehensive information about the Quantum Computing & Engineering Summit. It serves as your complete guide to the event, featuring detailed schedules, speaker profiles, and venue information.',
    note: '* PDF will be available soon. Format: PDF',
    features: [
        'Complete 3-Day Program Schedule',
        'Keynote Speaker Biographies & Topics',
        'Workshop & Breakout Session Details',
        'Venue Maps & Accommodation Guide',
        'Sponsorship & Exhibition Opportunities',
    ],
};

export default function BrochureDashboard() {
    const [data, setData] = useState(DEFAULT_DATA);
    const [status, setStatus] = useState(null); // null | 'loading' | 'saving' | 'saved' | 'error'
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    /* ── Load from DB ── */
    const loadData = async () => {
        setStatus('loading');
        try {
            const d = await getContent('brochure');
            if (d) setData(prev => ({ ...prev, ...d }));
        } catch { /* keep defaults */ }
        finally { setStatus(null); }
    };

    useEffect(() => { loadData(); }, []);

    /* ── PDF Upload ── */
    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            e.target.value = '';
            return;
        }
        const maxSize = 10 * 1024 * 1024; // 10MB limit based on route.js
        if (file.size > maxSize) {
            alert('File size exceeds 10MB limit.');
            e.target.value = '';
            return;
        }
        setUploading(true);
        try {
            const conf = getConference();
            const result = await uploadFile(file, conf);
            
            setData(prev => ({
                ...prev,
                pdfUrl: result.url,
                note: `* File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB • Format: PDF`,
            }));
        } catch (err) {
            alert('Upload failed: ' + (err.message || 'Unknown error'));
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    /* ── Save to DB ── */
    const handleSave = async () => {
        setStatus('saving');
        try {
            await updateContent('brochure', data);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const accentColor = '#6366f1';

    return (
        <div className="sp-page">
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                    <h1 className="sp-title" style={{ marginBottom: '4px' }}>Brochure</h1>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        Manage the conference brochure PDF and details shown on the website.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {status === 'loading' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
                        </div>
                    )}
                    {status === 'saved' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Saved to Database!
                        </div>
                    )}
                    {status === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <AlertCircle size={14} /> Save Failed
                        </div>
                    )}
                    <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={handleSave} disabled={status === 'saving' || status === 'loading'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: `0 4px 14px ${accentColor}44` }}>
                        {status === 'saving'
                            ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            : <Save size={14} />}
                        Save to Database
                    </button>
                </div>
            </div>

            {/* ── Hint ── */}
            <div className="sp-hint" style={{ marginBottom: '20px' }}>
                <Info size={15} className="sp-hint-icon" />
                <span><strong>Note:</strong> Upload the official conference PDF brochure. The PDF URL and all details will be shown live on the website brochure page.</span>
            </div>

            {/* ── Main settings grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Left column: PDF Upload */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color={accentColor} /> PDF Brochure File
                    </h2>

                    {/* Upload area */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        style={{ border: '2px dashed #c7d2fe', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#f5f3ff', marginBottom: '16px', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
                    >
                        {uploading
                            ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 36, height: 36, border: `3px solid ${accentColor}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                <span style={{ color: accentColor, fontWeight: 600, fontSize: '14px' }}>Uploading PDF...</span>
                            </div>
                            : <>
                                <Upload size={32} color={accentColor} style={{ marginBottom: 10 }} />
                                <p style={{ fontWeight: 600, color: '#4f46e5', margin: '0 0 4px' }}>Click to Upload PDF</p>
                                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Max 20MB • PDF format only</p>
                            </>
                        }
                    </div>
                    <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={handlePdfUpload} />

                    {/* Manual URL */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Link size={12} /> PDF URL (or paste link)
                        </label>
                        <input
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                            value={data.pdfUrl}
                            onChange={e => setData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                            placeholder="https://example.com/brochure.pdf"
                            onFocus={e => e.target.style.border = `1px solid ${accentColor}`}
                            onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
                        />
                    </div>

                    {data.pdfUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '9px', fontSize: '13px' }}>
                            <CheckCircle size={14} color="#16a34a" />
                            <a href={data.pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 600, wordBreak: 'break-all' }}>
                                PDF Linked ↗
                            </a>
                        </div>
                    )}

                    {/* Note text */}
                    <div style={{ marginTop: '16px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Download Note (shown below button)
                        </label>
                        <input
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                            value={data.note}
                            onChange={e => setData(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="* File size: 2.5 MB • Format: PDF"
                            onFocus={e => e.target.style.border = `1px solid ${accentColor}`}
                            onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
                        />
                    </div>
                </div>

                {/* Right column: Content details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Brochure title */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Conference Title (shown on brochure preview card)
                        </label>
                        <textarea
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                            rows={3}
                            value={data.title}
                            onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Conference full name..."
                            onFocus={e => e.target.style.border = `1px solid ${accentColor}`}
                            onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Description Paragraph (shown below "Inside the Brochure" heading)
                        </label>
                        <textarea
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                            rows={4}
                            value={data.description || ''}
                            onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what the brochure contains..."
                            onFocus={e => e.target.style.border = `1px solid ${accentColor}`}
                            onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
                        />
                    </div>

                    {/* Features list */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                "Inside the Brochure" Features
                            </label>
                            <button
                                onClick={() => setData(prev => ({ ...prev, features: [...(prev.features || []), ''] }))}
                                style={{ fontSize: '12px', padding: '4px 10px', background: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                + Add
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(data.features || []).map((feat, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#1e293b', outline: 'none' }}
                                        value={feat}
                                        onChange={e => {
                                            const updated = [...(data.features || [])];
                                            updated[i] = e.target.value;
                                            setData(prev => ({ ...prev, features: updated }));
                                        }}
                                        placeholder={`Feature ${i + 1}`}
                                        onFocus={e => e.target.style.border = `1px solid ${accentColor}`}
                                        onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
                                    />
                                    <button
                                        onClick={() => setData(prev => ({ ...prev, features: (prev.features || []).filter((_, idx) => idx !== i) }))}
                                        style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus, textarea:focus { outline: 2px solid ${accentColor}; border-color: ${accentColor}; }`}</style>
        </div>
    );
}
