'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Plus, X, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { getContent, updateContent } from '@/lib/api';

const inp = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    background: '#fff', color: '#1e293b'
};

const textarea = { ...inp, resize: 'vertical', minHeight: '60px' };

export default function FAQ() {
    const [faqs, setFaqs] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getContent('faq');
                if (data && data.faqs) {
                    setFaqs(data.faqs);
                } else {
                    setFaqs([
                        {
                            category: "General",
                            items: [{ question: "What is this conference about?", answer: "This is an international conference..." }]
                        }
                    ]);
                }
            } catch (e) { console.warn(e.message); }
            setLoading(false);
        }
        load();
    }, []);

    const save = async () => {
        setStatus('saving');
        try {
            await updateContent('faq', { faqs });
            setStatus('saved');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            setStatus('error');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const addCategory = () => {
        setFaqs(prev => [...prev, { category: 'New Category', items: [] }]);
    };

    const removeCategory = (catIdx) => {
        setFaqs(prev => prev.filter((_, i) => i !== catIdx));
    };

    const updateCategoryName = (catIdx, val) => {
        setFaqs(prev => {
            const arr = [...prev];
            arr[catIdx] = { ...arr[catIdx], category: val };
            return arr;
        });
    };

    const addQuestion = (catIdx) => {
        setFaqs(prev => {
            const arr = [...prev];
            arr[catIdx].items = [...(arr[catIdx].items || []), { question: 'New Question?', answer: 'New Answer' }];
            return arr;
        });
    };

    const removeQuestion = (catIdx, itemIdx) => {
        setFaqs(prev => {
            const arr = [...prev];
            arr[catIdx].items = arr[catIdx].items.filter((_, i) => i !== itemIdx);
            return arr;
        });
    };

    const updateQuestion = (catIdx, itemIdx, field, val) => {
        setFaqs(prev => {
            const arr = [...prev];
            const items = [...arr[catIdx].items];
            items[itemIdx] = { ...items[itemIdx], [field]: val };
            arr[catIdx].items = items;
            return arr;
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
        <div className="id-page" style={{ padding: '24px' }}>
            <div className="id-page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>FAQ Manager</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Configure the Frequently Asked Questions for your website.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {status === 'saved' && <div className="id-save-badge"><CheckCircle size={15} /> Saved!</div>}
                    {status === 'error' && <div className="id-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}><AlertCircle size={15} /> Error</div>}
                    <button
                        onClick={save}
                        disabled={status === 'saving'}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}
                    >
                        {status === 'saving'
                            ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {faqs.map((cat, catIdx) => (
                    <div key={catIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                        <button onClick={() => removeCategory(catIdx)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', padding: '6px' }}><X size={16} /></button>
                        
                        <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>CATEGORY NAME</label>
                            <input style={{ ...inp, fontWeight: 700, fontSize: '15px' }} value={cat.category} onChange={e => updateCategoryName(catIdx, e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            {(cat.items || []).map((item, itemIdx) => (
                                <div key={itemIdx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', position: 'relative', display: 'grid', gap: '12px' }}>
                                    <button onClick={() => removeQuestion(catIdx, itemIdx)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
                                    
                                    <div style={{ paddingRight: '24px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>QUESTION</label>
                                        <input style={inp} value={item.question} onChange={e => updateQuestion(catIdx, itemIdx, 'question', e.target.value)} placeholder="Enter question..." />
                                    </div>
                                    
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>ANSWER</label>
                                        <textarea style={textarea} value={item.answer} onChange={e => updateQuestion(catIdx, itemIdx, 'answer', e.target.value)} placeholder="Enter answer..." />
                                    </div>
                                </div>
                            ))}
                            
                            <button onClick={() => addQuestion(catIdx)} style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', background: '#fff', border: '1px dashed #94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0f172a', width: '200px' }}>
                                <Plus size={16} /> Add Question
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={addCategory} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                    <Plus size={18} /> Add New Category
                </button>
            </div>

            <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            input:focus, textarea:focus { outline: 2px solid #10b981; border-color: #10b981; }
            `}</style>
        </div>
    );
}
