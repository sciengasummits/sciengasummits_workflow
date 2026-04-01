'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { uploadFile, updateContent, getContent, getConference } from '@/lib/api';

const PDF_FIELDS = [
    { key: 'brochure', label: 'Conference Brochure' },
    { key: 'program', label: 'Tentative Program' },
    { key: 'sponsorship', label: 'Sponsorship Catalog' },
    { key: 'abstract', label: 'Abstract Book' },
];

const MAX_MB = 10;

function UploadRow({ label, file, onFile, onClear, existingUrl }) {
    const inputRef = useRef(null);

    const handleChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > MAX_MB * 1024 * 1024) {
            alert(`File is too large. Maximum allowed size is ${MAX_MB}MB.`);
            e.target.value = '';
            return;
        }
        onFile(f);
    };

    const sizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : null;

    return (
        <div className="up-row">
            <div className="up-row-label">
                <FileText size={15} className="up-row-icon" />
                {label}
            </div>
            <div className="up-row-controls">
                {file ? (
                    <div className="up-file-chip">
                        <CheckCircle size={14} className="up-chip-ok" />
                        <span className="up-chip-name">{file.name}</span>
                        <span className="up-chip-size">{sizeMB} MB</span>
                        <button className="up-chip-clear" onClick={onClear} title="Remove">
                            <X size={13} />
                        </button>
                    </div>
                ) : existingUrl ? (
                    <div className="up-file-chip" style={{ background: '#ecfdf5' }}>
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                        <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="up-chip-name" style={{ color: '#059669', textDecoration: 'underline' }}>
                            Stored in MongoDB
                        </a>
                    </div>
                ) : (
                    <span className="up-no-file">No file chosen</span>
                )}
                <button
                    type="button"
                    className="up-choose-btn"
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload size={14} /> Choose File
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}

export default function UploadPdfs() {
    const [files, setFiles] = useState({
        brochure: null, program: null, sponsorship: null, abstract: null,
    });
    const [existingUrls, setExistingUrls] = useState({});
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Load existing PDF URLs from content
    useEffect(() => {
        (async () => {
            try {
                const data = await getContent('pdfs');
                if (data) setExistingUrls(data);
            } catch { /* ignore */ }
        })();
    }, []);

    const setFile = (key, f) => setFiles(prev => ({ ...prev, [key]: f }));
    const clearFile = (key) => setFiles(prev => ({ ...prev, [key]: null }));

    const handleSubmit = async () => {
        const hasFile = Object.values(files).some(Boolean);
        if (!hasFile) { alert('Please choose at least one file to upload.'); return; }

        setUploading(true);
        setError(null);

        try {
            const conference = getConference();
            const newUrls = { ...existingUrls };

            // Upload each selected file to MongoDB
            for (const { key } of PDF_FIELDS) {
                const file = files[key];
                if (!file) continue;

                const result = await uploadFile(file, conference);
                if (result.url) {
                    newUrls[key] = result.url;
                    newUrls[`${key}_name`] = file.name;
                    newUrls[`${key}_id`] = result.id;
                }
            }

            // Save the PDF URL map to site content so pages can reference them
            await updateContent('pdfs', newUrls);
            setExistingUrls(newUrls);
            setFiles({ brochure: null, program: null, sponsorship: null, abstract: null });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            setError(err.message || 'Upload failed');
            setTimeout(() => setError(null), 5000);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="up-page">
            {/* Header */}
            <div className="up-page-header">
                <div>
                    <h1 className="up-title">Upload Your PDFS</h1>
                    <p className="up-note">
                        <AlertCircle size={14} className="up-note-icon" />
                        <span><strong>Note:</strong> Files are stored in MongoDB (max {MAX_MB}MB per file)</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {submitted && (
                        <div className="up-save-badge">
                            <CheckCircle size={15} /> Files uploaded to MongoDB
                        </div>
                    )}
                    {error && (
                        <div className="up-save-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <AlertCircle size={15} /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Card */}
            <div className="up-card">
                {PDF_FIELDS.map(({ key, label }) => (
                    <UploadRow
                        key={key}
                        label={label}
                        file={files[key]}
                        existingUrl={existingUrls[key]}
                        onFile={(f) => setFile(key, f)}
                        onClear={() => clearFile(key)}
                    />
                ))}

                {/* Submit */}
                <div className="up-footer">
                    <button className="up-submit-btn" onClick={handleSubmit} disabled={uploading}>
                        {uploading ? (
                            <>
                                <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Uploading to MongoDB...
                            </>
                        ) : (
                            <>
                                <Upload size={15} /> Upload & Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
