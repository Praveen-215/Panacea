import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './Documents.css';

const CATEGORIES = [
    { key: '', label: 'All', icon: '📂' },
    { key: 'xray', label: 'X-Rays', icon: '🦴' },
    { key: 'ctscan', label: 'CT Scans', icon: '🧠' },
    { key: 'mri', label: 'MRI', icon: '🫀' },
    { key: 'prescription', label: 'Prescriptions', icon: '📝' },
    { key: 'labreport', label: 'Lab Reports', icon: '🔬' },
];

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export default function Documents() {
    const toast = useToast();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({ name: '', category: 'prescription', file: null });
    const [uploading, setUploading] = useState(false);
    const [renamingDoc, setRenamingDoc] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    const fetchDocuments = useCallback(async () => {
        try {
            const { data } = await api.getDocuments(activeCategory);
            setDocuments(data);
        } catch (error) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadForm.file);
            formData.append('name', uploadForm.name || uploadForm.file.name);
            formData.append('category', uploadForm.category);

            await api.uploadDocument(formData);
            toast.success('Document uploaded!');
            setShowUpload(false);
            setUploadForm({ name: '', category: 'prescription', file: null });
            await fetchDocuments();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRename = async (id) => {
        if (!renameValue.trim()) return;
        try {
            await api.renameDocument(id, renameValue);
            toast.success('Document renamed');
            setRenamingDoc(null);
            await fetchDocuments();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this document? This cannot be undone.')) return;
        try {
            await api.deleteDocument(id);
            toast.success('Document deleted');
            await fetchDocuments();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getCategoryIcon = (cat) => {
        const found = CATEGORIES.find((c) => c.key === cat);
        return found?.icon || '📄';
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p className="text-muted">Loading documents...</p>
            </div>
        );
    }

    return (
        <div className="documents-page">
            <div className="section-header">
                <h1 className="heading-2">Medical Documents</h1>
                <button className="btn btn--primary btn--sm" onClick={() => setShowUpload(true)}>
                    + Upload
                </button>
            </div>

            <p className="docs-privacy-note">
                🔒 Your documents are stored securely and only accessible to you
            </p>

            {/* Category tabs */}
            <div className="tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        className={`tab ${activeCategory === cat.key ? 'tab--active' : ''}`}
                        onClick={() => { setActiveCategory(cat.key); setLoading(true); }}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Document Grid */}
            {documents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">📁</div>
                    <p className="empty-state__title">No documents yet</p>
                    <p className="empty-state__text">Upload your medical documents to keep them organized and accessible</p>
                </div>
            ) : (
                <div className="docs-grid">
                    {documents.map((doc) => (
                        <div key={doc._id} className="doc-card glass-card">
                            <div className="doc-card__icon">
                                {getCategoryIcon(doc.category)}
                            </div>
                            <div className="doc-card__info">
                                {renamingDoc === doc._id ? (
                                    <div className="doc-card__rename">
                                        <input
                                            className="form-input"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRename(doc._id)}
                                            autoFocus
                                        />
                                        <button className="btn btn--primary btn--sm" onClick={() => handleRename(doc._id)}>
                                            Save
                                        </button>
                                        <button className="btn btn--ghost btn--sm" onClick={() => setRenamingDoc(null)}>
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <h3 className="doc-card__name">{doc.name}</h3>
                                )}
                                <div className="doc-card__meta">
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                    <span>•</span>
                                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="doc-card__actions">
                                <a
                                    href={api.getDocumentUrl(doc._id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="doc-card__btn"
                                    title="Preview"
                                >
                                    👁️
                                </a>
                                <button
                                    className="doc-card__btn"
                                    onClick={() => { setRenamingDoc(doc._id); setRenameValue(doc.name); }}
                                    title="Rename"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="doc-card__btn doc-card__btn--delete"
                                    onClick={() => handleDelete(doc._id)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="heading-3">Upload Document</h2>
                            <button className="modal-close" onClick={() => setShowUpload(false)}>✕</button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input form-select"
                                    value={uploadForm.category}
                                    onChange={(e) => setUploadForm((prev) => ({ ...prev, category: e.target.value }))}
                                >
                                    {CATEGORIES.filter((c) => c.key).map((cat) => (
                                        <option key={cat.key} value={cat.key}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Document Name</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g., Blood Test Results - Feb 2024"
                                    value={uploadForm.name}
                                    onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">File</label>
                                <div className="doc-upload-zone">
                                    <input
                                        type="file"
                                        id="doc-file"
                                        className="doc-upload-zone__input"
                                        accept="image/*,application/pdf"
                                        onChange={(e) =>
                                            setUploadForm((prev) => ({
                                                ...prev,
                                                file: e.target.files[0],
                                                name: prev.name || e.target.files[0]?.name || '',
                                            }))
                                        }
                                    />
                                    <label htmlFor="doc-file" className="doc-upload-zone__label">
                                        {uploadForm.file ? (
                                            <>
                                                <span>📄</span>
                                                <span>{uploadForm.file.name}</span>
                                                <span className="text-small text-muted">{formatFileSize(uploadForm.file.size)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="doc-upload-zone__icon">📤</span>
                                                <span>Tap to select a file</span>
                                                <span className="text-small text-muted">PDF, JPEG, PNG • Max 10MB</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" className="btn btn--ghost w-full" onClick={() => setShowUpload(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn--primary w-full" disabled={uploading}>
                                    {uploading ? <span className="spinner spinner--sm" /> : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
