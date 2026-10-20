import { useState, useRef, useEffect } from 'react';
import './PrescriptionUploadModal.css';

export default function PrescriptionUploadModal({
  isOpen,
  onClose,
  onSubmit,
  medicineName,
  pharmacyName,
  isLoading,
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setError('Only prescription images and PDF files are accepted.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Prescription file must be within 5MB size limit.');
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a prescription file.');
      return;
    }
    onSubmit(file);
  };

  if (!isOpen) return null;

  return (
    <div className="prescription-modal-overlay" onClick={onClose}>
      <div className="prescription-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
        <button className="prescription-modal-close" onClick={onClose} aria-label="Close upload modal">✕</button>
        
        <h2 id="upload-modal-title">Upload Prescription</h2>
        <p className="prescription-modal-subtitle">
          For <strong>{medicineName}</strong> from <strong>{pharmacyName}</strong>
        </p>

        {/* Checklist */}
        <div className="prescription-checklist">
          <h3>Valid prescription must include:</h3>
          <ul>
            <li><span className="check-icon">✓</span> Doctor's signature/stamp visible</li>
            <li><span className="check-icon">✓</span> Patient's name</li>
            <li><span className="check-icon">✓</span> Date of prescription</li>
            <li><span className="check-icon">✓</span> Medicine name(s) clearly written</li>
            <li><span className="check-icon">✓</span> Doctor's registration number (if visible)</li>
          </ul>
        </div>

        {/* Upload Area */}
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
          
          {file ? (
            <div className="file-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Prescription preview" />
              ) : (
                <div className="pdf-icon">
                  <span>📄</span>
                  <p>{file.name}</p>
                </div>
              )}
              <div className="file-actions">
                <button type="button" className="btn-reupload" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Re-upload</button>
                <button type="button" className="btn-remove" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}>Remove</button>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">📁</span>
              <p>Drag & drop prescription image or PDF here</p>
              <p className="upload-hint">or click to browse (max 5MB)</p>
            </div>
          )}
        </div>

        {error && <p className="upload-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="button" className="btn-submit" onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}