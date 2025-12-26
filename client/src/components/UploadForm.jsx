import React, { useState } from 'react';
import axios from 'axios';

export default function UploadForm({ refreshVideos }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // 1. Add state for the error message
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    // Clear previous errors
    setErrorMessage('');
    
    const formData = new FormData();
    formData.append('video', file);

    setUploading(true);
    try {
      await axios.post('http://127.0.0.1:5001/api/videos/upload', formData);
      setFile(null);
      document.getElementById('fileInput').value = "";
      refreshVideos();
    } catch (err) {
      console.error(err);
      // 2. Set the error state instead of alerting
      const msg = err.response?.data?.error || err.message;
      setErrorMessage(`Upload Failed: ${msg}`);
    }
    setUploading(false);
  };

  return (
    <div className="upload-card">
      <div className="file-input-wrapper">
        <input 
          id="fileInput"
          type="file" 
          onChange={e => {
            setFile(e.target.files[0]);
            setErrorMessage(''); // Clear error when selecting new file
          }} 
          accept="video/*" 
          style={{ color: '#fff' }}
        />
      </div>
      
      <button 
        className="primary-btn" 
        onClick={handleUpload} 
        disabled={uploading || !file}
      >
        {uploading ? 'Uploading...' : 'Start Analysis & Upload'}
      </button>

      {/* 3. Display the error message here if it exists */}
      {errorMessage && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          borderRadius: '6px',
          border: '1px solid #ef4444'
        }}>
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}