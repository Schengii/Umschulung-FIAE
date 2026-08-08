// frontend/src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from './Toast.jsx';

export default function Register({ onRegisterSuccess }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const eErr = email && !emailRegex.test(email) ? 'Ungültige E‑Mail-Adresse' : '';
    const pErr = password && password.length < 8 ? 'Passwort muss mindestens 8 Zeichen haben' : '';
    const nErr = name && name.trim() === '' ? 'Name darf nicht leer sein' : '';
    setEmailError(eErr);
    setPasswordError(pErr);
    setNameError(nErr);
    setIsValid(!eErr && !pErr && !nErr && email && password && name);
  }, [email, password, name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isValid) return;
    try {
      await register(email, password, name);
      setShowToast(true);
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Registrieren</h2>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Name
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          {nameError && <p className="auth-error">{nameError}</p>}
        </label>
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
        <button type="submit" className="btn btn-primary" disabled={!isValid}>Registrieren</button>
      </form>
      {showToast && (
        <Toast message="Erfolgreich registriert!" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
