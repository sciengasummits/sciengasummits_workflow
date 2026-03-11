'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

/* ── Shared input styles ── */
const inp = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    background: '#fff', color: '#1e293b',
};
const ta = { ...inp, minHeight: '72px', resize: 'vertical' };

const sectionCard = {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

/* ── Default FAQ data ── */
const DEFAULT_DATA = {
    pageTitle: 'Frequently Asked Questions',
    ctaText: "Can't find the answer you're looking for? Please chat to our friendly team.",
    categories: [
        {
            id: 'cat_registration',
            category: 'Registration',
            items: [
                {
                    question: 'How can I register for the International Conference on Liutex Theory and Applications in Vortex Identification and Vortex Dynamics?',
                    answer: "You can register online through our website by visiting the 'Register' page. Early bird registration is available until the specified deadline.",
                },
                {
                    question: 'Is there a discount for group registrations?',
                    answer: 'Yes, we offer group discounts for groups larger than 5 attendees. Please contact our support team for more details.',
                },
                {
                    question: 'What is included in the registration fee?',
                    answer: 'The registration fee covers access to all scientific sessions, the exhibition area, conference materials, coffee breaks, and lunch.',
                },
                {
                    question: 'Can I cancel my registration?',
                    answer: 'Cancellations are subject to our refund policy. Please refer to the Terms & Conditions page for detailed information regarding deadlines and refund percentages.',
                },
            ],
        },
        {
            id: 'cat_scientific',
            category: 'Scientific Program',
            items: [
                {
                    question: 'How can I submit an abstract?',
                    answer: "Abstracts can be submitted via the 'Abstract Submission' page. Please follow the guidelines provided for formatting and submission deadlines.",
                },
                {
                    question: 'When will I be notified about my abstract acceptance?',
                    answer: 'Notifications of acceptance will be sent via email within 2-3 weeks after the submission deadline.',
                },
                {
                    question: 'What form of presentation is available?',
                    answer: 'Presentations can be in the form of oral presentations or poster displays. You can select your preference during submission, but the final decision rests with the Scientific Committee.',
                },
            ],
        },
        {
            id: 'cat_venue',
            category: 'Venue & Accommodation',
            items: [
                {
                    question: 'Where is the congress taking place?',
                    answer: 'Detailed venue information and maps are available on the Venue page.',
                },
                {
                    question: 'Are there recommended hotels nearby?',
                    answer: 'Yes, we have partnered with several hotels near the venue to offer discounted rates for attendees. Please check the Venue page.',
                },
            ],
        },
        {
            id: 'cat_visa',
            category: 'Visa & Travel',
            items: [
                {
                    question: 'Do I need a visa to attend the conference?',
                    answer: 'Visa requirements depend on your country of citizenship. We can provide an invitation letter to support your visa application upon successful registration.',
                },
                {
                    question: 'How do I request an invitation letter?',
                    answer: 'Invitation letters can be requested via email after your registration is confirmed.',
                },
            ],
        },
    ],
};

export default function FAQManager() {
    const [data, setData] = useState(DEFAULT_DATA);
    const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
    const [loading, setLoading] = useState(true);
    const [openCats, setOpenCats] = useState({});

    useEffect(() => {
        async function load() {
            try {
                const res = await getContent('faq');
                if (res && !res.error) {
                    setData(prev => ({ ...prev, ...res }));
                }
            } catch (e) {
                console.warn('[FAQManager] Failed to load:', e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const save = async () => {
        setStatus('saving');
        try {
            await updateContent('faq', data);
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            console.error(e);
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const toggleCat = (id) => setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));

    /* ── Category helpers ── */
    const addCategory = () => {
        const id = `cat_${Date.now()}`;
        setData(prev => ({
            ...prev,
            categories: [...prev.categories, { id, category: 'New Category', items: [] }],
        }));
        setOpenCats(prev => ({ ...prev, [id]: true }));
    };

    const removeCategory = (cIdx) => {
        setData(prev => ({ ...prev, categories: prev.categories.filter((_, i) => i !== cIdx) }));
    };

    const updateCategoryName = (cIdx, val) => {
        setData(prev => {
            const cats = [...prev.categories];
            cats[cIdx] = { ...cats[cIdx], category: val };
            return { ...prev, categories: cats };
        });
    };

    /* ── FAQ Item helpers ── */
    const addItem = (cIdx) => {
        setData(prev => {
            const cats = [...prev.categories];
            cats[cIdx] = {
                ...cats[cIdx],
                items: [...cats[cIdx].items, { question: '', answer: '' }],
            };
            return { ...prev, categories: cats };
        });
    };

    const removeItem = (cIdx, iIdx) => {
        setData(prev => {
            const cats = [...prev.categories];
            cats[cIdx] = { ...cats[cIdx], items: cats[cIdx].items.filter((_, i) => i !== iIdx) };
            return { ...prev, categories: cats };
        });
    };

    const updateItem = (cIdx, iIdx, field, val) => {
        setData(prev => {
            const cats = [...prev.categories];
            const items = [...cats[cIdx].items];
            items[iIdx] = { ...items[iIdx], [field]: val };
            cats[cIdx] = { ...cats[cIdx], items };
            return { ...prev, categories: cats };
        });
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading FAQ data...</p>
            </div>
        </div>
    );

    return (
        <div className="id-page">
            {/* ── Header ── */}
            <div className="id-page-header">
                <div>
                    <h1 className="id-title">FAQ Manager</h1>
                    <p className="id-subtitle">
                        Manage frequently asked questions by category. Changes are saved to MongoDB and reflected live on the website.
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

            {/* ── Page Settings ── */}
            <div style={sectionCard}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', borderLeft: '4px solid #f59e0b', paddingLeft: '12px', marginBottom: '18px' }}>
                    ⚙️ Page Settings
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Page Title</label>
                    <input
                        style={inp}
                        value={data.pageTitle || ''}
                        onChange={e => setData(prev => ({ ...prev, pageTitle: e.target.value }))}
                        placeholder="Frequently Asked Questions"
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px', alignItems: 'start' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', paddingTop: '10px' }}>CTA Text</label>
                    <textarea
                        style={ta}
                        value={data.ctaText || ''}
                        onChange={e => setData(prev => ({ ...prev, ctaText: e.target.value }))}
                        placeholder="Text shown in the 'Still have questions?' box..."
                    />
                </div>
            </div>

            {/* ── FAQ Categories ── */}
            <div style={sectionCard}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', borderLeft: '4px solid #6366f1', paddingLeft: '12px', marginBottom: '6px' }}>
                    ❓ FAQ Categories & Questions
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                    Expand a category to edit its questions and answers. Drag to reorder (not yet supported — use add/remove).
                </p>

                {(data.categories || []).map((cat, cIdx) => (
                    <div key={cat.id || cIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '14px', overflow: 'hidden' }}>
                        {/* Category Header */}
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#f8fafc', cursor: 'pointer', borderBottom: openCats[cat.id || cIdx] ? '1px solid #e2e8f0' : 'none' }}
                            onClick={() => toggleCat(cat.id || cIdx)}
                        >
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1', minWidth: '40px' }}>
                                {openCats[cat.id || cIdx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </span>
                            <input
                                style={{ ...inp, fontWeight: 700, fontSize: '14px', flex: 1, border: 'none', background: 'transparent', padding: '0' }}
                                value={cat.category}
                                onChange={e => { e.stopPropagation(); updateCategoryName(cIdx, e.target.value); }}
                                onClick={e => e.stopPropagation()}
                                placeholder="Category name (e.g. Registration)"
                            />
                            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto', paddingRight: '8px', flexShrink: 0 }}>
                                {cat.items.length} Q&amp;As
                            </span>
                            <button
                                onClick={e => { e.stopPropagation(); removeCategory(cIdx); }}
                                style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            >
                                <X size={13} />
                            </button>
                        </div>

                        {/* Category Items */}
                        {openCats[cat.id || cIdx] && (
                            <div style={{ padding: '16px' }}>
                                {cat.items.map((item, iIdx) => (
                                    <div key={iIdx} style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '14px', marginBottom: '12px', background: '#fafbfc', position: 'relative' }}>
                                        <button
                                            onClick={() => removeItem(cIdx, iIdx)}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '3px 7px', display: 'flex', alignItems: 'center' }}
                                        >
                                            <X size={12} />
                                        </button>

                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '5px', letterSpacing: '0.5px' }}>
                                                Q #{iIdx + 1} — QUESTION
                                            </label>
                                            <input
                                                style={inp}
                                                value={item.question}
                                                onChange={e => updateItem(cIdx, iIdx, 'question', e.target.value)}
                                                placeholder="Enter the question..."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'block', marginBottom: '5px', letterSpacing: '0.5px' }}>
                                                ANSWER
                                            </label>
                                            <textarea
                                                style={ta}
                                                value={item.answer}
                                                onChange={e => updateItem(cIdx, iIdx, 'answer', e.target.value)}
                                                placeholder="Enter the answer..."
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => addItem(cIdx)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f0f0ff', border: '1px dashed #a5b4fc', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#6366f1', width: '100%', justifyContent: 'center' }}
                                >
                                    <Plus size={14} /> Add Question & Answer
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    onClick={addCategory}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', marginTop: '4px' }}
                >
                    <Plus size={15} /> Add FAQ Category
                </button>
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
