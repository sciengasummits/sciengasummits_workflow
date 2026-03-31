'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

const inp = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#1e293b',
};

export default function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getContent('sessions')
            .then(d => { if (d?.sessions) setSessions(d.sessions); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setStatus('saving');
        try {
            // Merge â€” don't overwrite schedule/days managed by ConferenceSchedule page
            const existing = await getContent('sessions').catch(() => ({}));
            await updateContent('sessions', { ...existing, sessions });
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const update = (i, val) => setSessions(prev => prev.map((s, idx) => idx === i ? val : s));
    const remove = (i) => setSessions(prev => prev.filter((_, idx) => idx !== i));
    const add = () => setSessions(prev => [...prev, '']);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading sessionsâ€¦</p>
            </div>
        </div>
    );

    return (
        <div className="id-page">
            {/* Header */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Sessions</h1>
                    <p className="id-subtitle">Manage all conference session topics. Changes save to MongoDB and reflect live on the website.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'saved' && (
                        <div className="id-save-badge"><CheckCircle size={15} /> Saved!</div>
                    )}
                    {status === 'error' && (
                        <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <AlertCircle size={15} /> Error
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

            {/* Session list */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderLeft: '4px solid #6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                        Session Topics <span style={{ fontWeight: 400, color: '#64748b', fontSize: '13px' }}>({sessions.length} items)</span>
                    </span>
                    <button
                        onClick={add}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                        <Plus size={14} /> Add Session
                    </button>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sessions.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>
                            No sessions yet. Click <strong>Add Session</strong> to get started.
                        </div>
                    )}
                    {sessions.map((session, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', width: '28px', textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                            <input
                                style={{ ...inp, flex: 1 }}
                                value={session}
                                onChange={e => update(i, e.target.value)}
                                placeholder={`Session topic ${i + 1}`}
                            />
                            <button
                                onClick={() => remove(i)}
                                style={{ flexShrink: 0, background: 'none', border: '1px solid #fca5a5', borderRadius: '7px', color: '#ef4444', cursor: 'pointer', padding: '6px 9px', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={save}
                        disabled={status === 'saving'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
                    >
                        <Save size={15} /> Save All Changes
                    </button>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus { outline: 2px solid #6366f1; border-color: #6366f1; }`}</style>
        </div>
    );
}

