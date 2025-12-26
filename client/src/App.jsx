import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import VideoList from './components/VideoList';
import Login from './components/Login';
import './App.css';

const socket = io('import.meta.env.VITE_API_URL');

function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  
  // NEW: Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Helper to set Token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5001/api/videos');
      setVideos(res.data);
    } catch (err) { console.error(err); }
  };

  // Handle Login
  const handleLogin = (userData, token) => {
    setUser(userData);
    setAuthToken(token); // Save token for requests
    fetchVideos(); // Fetch THIS user's videos
  };

  // Filter Logic
  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="container">
      <header>
        <div>
          <h1><span className="logo">Pulse</span>Stream</h1>
          <div style={{color: '#94a3b8'}}>
            {user.role === 'admin' ? 'Admin View (All Videos)' : 'My Video Library'}
          </div>
        </div>
        
        {/* NEW: Search Bar & Filter */}
        <div style={{display: 'flex', gap: '10px'}}>
          <input 
            type="text" 
            placeholder="Search videos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: 'white'}}
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', background: '#334155', color: 'white', border: 'none'}}
          >
            <option value="all">All Status</option>
            <option value="safe">Safe</option>
            <option value="flagged">Flagged</option>
            <option value="processing">Processing</option>
          </select>
          <button onClick={() => setUser(null)} className="primary-btn" style={{background: '#334155'}}>Logout</button>
        </div>
      </header>
      
      {user.role === 'admin' && <UploadForm refreshVideos={fetchVideos} />}
      
      <h2 style={{marginTop: '2rem'}}>
        {filteredVideos.length} Video{filteredVideos.length !== 1 && 's'} Found
      </h2>
      
      <VideoList videos={filteredVideos} userRole={user.role} refreshVideos={fetchVideos} />
    </div>
  );
}

export default App;