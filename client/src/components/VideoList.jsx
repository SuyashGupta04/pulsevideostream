import React from 'react';
import axios from 'axios';

export default function VideoList({ videos, userRole, refreshVideos }) {
  
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5001/api/videos/${id}`);
      refreshVideos();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'safe': return 'status-safe';
      case 'flagged': return 'status-flagged';
      default: return 'status-processing';
    }
  };

  return (
    <div className="video-grid">
      {videos.map(video => (
        <div key={video._id} className="video-card">
          <div className="player-wrapper">
            {video.status === 'safe' ? (
              <video controls width="100%" height="100%" poster={video.thumbnail ? `http://127.0.0.1:5001/uploads/${video.thumbnail}` : null}
      src={`http://127.0.0.1:5001/api/videos/stream/${video._id}`} />
            ) : video.status === 'flagged' ? (
              <div className="flagged-screen">
                <span style={{fontSize: '2rem'}}>⚠️</span>
                <span>Flagged Content</span>
              </div>
            ) : (
              <div style={{color: 'var(--primary)'}}>Processing... {video.progress}%</div>
            )}
          </div>

          <div className="card-header">
            <h3 className="video-title">{video.title}</h3>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span className={`status-badge ${getStatusClass(video.status)}`}>{video.status}</span>
              
              {/* ADMIN ACTION: Delete Button */}
              {userRole === 'admin' && (
                <button 
                  onClick={() => handleDelete(video._id)}
                  style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold'}}
                >
                  DELETE
                </button>
              )}
            </div>
            
            {video.status === 'processing' && (
              <div className="progress-container">
                <div className="progress-fill" style={{width: `${video.progress}%`}}></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}