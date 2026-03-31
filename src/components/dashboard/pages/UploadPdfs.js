'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const PDF_FIELDS = [
    { key: 'brochure', label: 'Conference Brochure' },
    { key: 'program', label: 'Tentative Program' },
    { key: 'sponsorship', label: 'Sponsorship Catalog' },
    { key: 'abstract', label: 'Abstract Book' },
];

const MAX_MB = 4;

function UploadRow({ label, file, onFile, onClear }) {
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
    const [submitted, setSubmitted] = useState(false);

    const setFile = (key, f) => setFiles(prev => ({ ...prev, [key]: f }));
    const clearFile = (key) => setFiles(prev => ({ ...prev, [key]: null }));

    const handleSubmit = () => {
        const hasFile = Object.values(files).some(Boolean);
        if (!hasFile) { alert('Please choose at least one file to upload.'); return; }
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="up-page">
            {/* Header */}
            <div className="up-page-header">
                <div>
                    <h1 className="up-title">Upload Your PDFS</h1>
                    <p className="up-note">
                        <AlertCircle size={14} className="up-note-icon" />
                        <span><strong>Note:</strong> Ensure the uploaded file is below {MAX_MB}MB</span>
                    </p>
                </div>
                {submitted && (
                    <div className="up-save-badge">
                        <CheckCircle size={15} /> Files uploaded
                    </div>
                )}
            </div>

            {/* Card */}
            <div className="up-card">
                {PDF_FIELDS.map(({ key, label }) => (
                    <UploadRow
                        key={key}
                        label={label}
                        file={files[key]}
                        onFile={(f) => setFile(key, f)}
                        onClear={() => clearFile(key)}
                    />
                ))}

                {/* Submit */}
                <div className="up-footer">
                    <button className="up-submit-btn" onClick={handleSubmit}>
                        <Upload size={15} /> Submit
                    </button>
                </div>
            </div>
        </div>
    );
}

