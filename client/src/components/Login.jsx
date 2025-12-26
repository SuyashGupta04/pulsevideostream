import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:5001/api/auth/login', { username, password });
      // Pass the real user data up to App.js
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2>Login</h2>
        <p style={{color: '#94a3b8', marginBottom: '20px'}}>Enter your credentials</p>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          
          <button type="submit" style={styles.btn}>Login</button>
        </form>

        {error && <p style={{color: '#ef4444', marginTop: '10px'}}>{error}</p>}
        
        <div style={{marginTop: '20px', fontSize: '0.8rem', color: '#64748b'}}>
          <p>Default Admin: <b>admin / admin123</b></p>
          <p>Default Viewer: <b>viewer / viewer123</b></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  card: {
    backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px',
    textAlign: 'center', border: '1px solid #334155', width: '300px'
  },
  input: {
    padding: '12px', borderRadius: '6px', border: '1px solid #334155',
    backgroundColor: '#0f172a', color: 'white'
  },
  btn: {
    padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none',
    borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold'
  }
};