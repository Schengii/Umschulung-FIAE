// frontend/src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from './Toast.jsx';

export default function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const eErr = email && !emailRegex.test(email) ? 'Ungültige E‑Mail-Adresse' : '';
    const pErr = password && password.length < 8 ? 'Passwort muss mindestens 8 Zeichen haben' : '';
    setEmailError(eErr);
    setPasswordError(pErr);
    setIsValid(!eErr && !pErr && email && password);
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isValid) return;
    try {
      await login(email, password);
      setShowToast(true);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          {emailError && <p className="auth-error">{emailError}</p>}
        </label>
        <label>
          Passwort
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {passwordError && <p className="auth-error">{passwordError}</p>}
        </label>
        <button type="submit" className="btn btn-primary" disabled={!isValid}>Login</button>
      </form>
      {showToast && (
        <Toast message="Erfolgreich eingeloggt!" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
