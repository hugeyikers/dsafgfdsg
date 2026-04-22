import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const { login, isLoading, error, isLogged, clearError } = useAuthStore();

  useEffect(() => {
    if (isLogged) {
      navigate('/kanban', { replace: true });
    }
    return () => clearError();
  }, [isLogged, navigate, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
        alert("Password must be at least 6 characters long"); 
        return;
    }

    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      <div className="login-box" style={styles.box}>
        <div className="login-logo">
          <h1 style={{ margin: 0, color: '#2c3e50' }}>kanban</h1>
          <p style={{ margin: '5px 0 20px', color: '#7f8c8d' }}>kanban system</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={styles.formGroup}>
            <label style={styles.label}>Identifier / AD Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="e.g. kanban@host.com" 
              required 
              className="form-control"
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group" style={styles.formGroup}>
            <label style={styles.label}>System Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••••••" 
              required 
              className="form-control"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login" 
            style={{...styles.button, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer'}}
            disabled={isLoading}
          >
            {isLoading ? 'Authorizing...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>

        <div className="system-footer-login" style={styles.footer}>
          SSL Encrypted Connection (AES-256)<br />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  } as React.CSSProperties,
  box: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  } as React.CSSProperties,
  formGroup: {
    textAlign: 'left',
    marginBottom: '20px',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: '8px',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #bdc3c7',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  button: {
    width: '100%',
    padding: '12px',
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: '10px',
  } as React.CSSProperties,
  errorAlert: {
    background: '#e74c3c',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'left',
  } as React.CSSProperties,
  footer: {
    marginTop: '30px',
    fontSize: '11px',
    color: '#bdc3c7',
    lineHeight: '1.5',
  } as React.CSSProperties,
};

export default Login;