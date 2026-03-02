'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X, Calendar } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

const inp = {
    padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', background: '#fff', color: '#1e293b',
};

const DAY_PALETTE = [
    '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4',
];

function DayCard({ dayIndex, dayData, onChange, onRemove, canRemove }) {
    const color = DAY_PALETTE[dayIndex % DAY_PALETTE.length];
    const { label, rows } = dayData;

    const updateRow = (i, field, val) =>
        onChange({ ...dayData, rows: rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r) });

    const addRow = () => onChange({ ...dayData, rows: [...rows, { time: '', program: '' }] });
    const removeRow = (i) => onChange({ ...dayData, rows: rows.filter((_, idx) => idx !== i) });
    const setLabel = (v) => onChange({ ...dayData, label: v });

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            {/* Card header */}
            <div style={{ background: '#f8fafc', padding: '13px 18px', borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span style={{ fontSize: '18px' }}>ðŸ“…</span>
                    {/* Editable day label */}
                    <input
                        style={{ ...inp, fontWeight: 700, fontSize: '14px', color: '#1e293b', border: '1px solid transparent', background: 'transparent', padding: '4px 8px', borderRadius: '6px', minWidth: 100, maxWidth: 220 }}
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        placeholder={`Day ${dayIndex + 1}`}
                        onFocus={e => { e.target.style.border = `1px solid ${color}`; e.target.style.background = '#fff'; }}
                        onBlur={e => { e.target.style.border = '1px solid transparent'; e.target.style.background = 'transparent'; }}
                    />
                    <span style={{ fontWeight: 400, color: '#64748b', fontSize: '12px' }}>({rows.length} slots)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={addRow}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: color, color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                        <Plus size={13} /> Add Slot
                    </button>
                    {canRemove && (
                        <button
                            onClick={onRemove}
                            title="Remove this day"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                            <X size={13} /> Remove Day
                        </button>
                    )}
                </div>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 36px', gap: '8px', padding: '10px 18px 4px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Programme</span>
                <span />
            </div>

            {/* Rows */}
            <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {rows.length === 0 && (
                    <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                        No slots yet â€” click <strong>Add Slot</strong>.
                    </div>
                )}
                {rows.map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 36px', gap: '8px', alignItems: 'center' }}>
                        <input
                            style={{ ...inp, width: '100%' }}
                            value={row.time}
                            onChange={e => updateRow(i, 'time', e.target.value)}
                            placeholder="e.g. 9.00 â€“ 10.30"
                        />
                        <input
                            style={{ ...inp, width: '100%' }}
                            value={row.program}
                            onChange={e => updateRow(i, 'program', e.target.value)}
                            placeholder="e.g. Plenary Sessions"
                        />
                        <button
                            onClick={() => removeRow(i)}
                            style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '7px', color: '#ef4444', cursor: 'pointer', padding: '5px 7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ConferenceSchedule() {
    // days = array of { label, rows }
    const [days, setDays] = useState([
        { label: 'Day 1', rows: [] },
        { label: 'Day 2', rows: [] },
        { label: 'Day 3', rows: [] },
    ]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    /* â”€â”€â”€ Load from DB â”€â”€â”€ */
    useEffect(() => {
        getContent('sessions')
            .then(d => {
                if (d?.days?.length) {
                    // New format: array of { label, rows }
                    setDays(d.days);
                } else if (d?.schedule) {
                    // Legacy format: { day1: [...], day2: [...], day3: [...] }
                    const legacy = [];
                    ['day1', 'day2', 'day3'].forEach((k, i) => {
                        if (d.schedule[k]) legacy.push({ label: `Day ${i + 1}`, rows: d.schedule[k] });
                    });
                    if (legacy.length) setDays(legacy);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    /* â”€â”€â”€ Mutators â”€â”€â”€ */
    const updateDay = (i, updated) => setDays(prev => prev.map((d, idx) => idx === i ? updated : d));
    const removeDay = (i) => setDays(prev => prev.filter((_, idx) => idx !== i));
    const addDay = () => {
        const next = days.length + 1;
        setDays(prev => [...prev, { label: `Day ${next}`, rows: [] }]);
    };

    /* â”€â”€â”€ Save â”€â”€â”€ */
    const save = async () => {
        setStatus('saving');
        try {
            const existing = await getContent('sessions').catch(() => ({}));
            await updateContent('sessions', {
                ...existing,
                days,                                   // new array-based format
                schedule: Object.fromEntries(           // keep legacy key for backward compat
                    days.map((d, i) => [`day${i + 1}`, d.rows])
                ),
            });
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading scheduleâ€¦</p>
            </div>
        </div>
    );

    return (
        <div className="id-page">
            {/* Header */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">Conference Schedule</h1>
                    <p className="id-subtitle">Manage the conference programme. Changes save to MongoDB and reflect live on the website.</p>
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

            {/* Day cards */}
            {days.map((day, i) => (
                <DayCard
                    key={i}
                    dayIndex={i}
                    dayData={day}
                    onChange={updated => updateDay(i, updated)}
                    onRemove={() => removeDay(i)}
                    canRemove={days.length > 1}
                />
            ))}

            {/* Add Another Day */}
            <button
                onClick={addDay}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '14px', marginBottom: '20px',
                    background: 'transparent', border: '2px dashed #c7d2fe',
                    borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
                    fontWeight: 700, color: '#6366f1',
                    transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f0ff'; e.currentTarget.style.borderColor = '#6366f1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
            >
                <Calendar size={17} /> Add Another Day
            </button>

            {/* Bottom save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
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

