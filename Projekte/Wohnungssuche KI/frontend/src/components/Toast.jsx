// frontend/src/components/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ message, onClose, severity = 'info', duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const toastClass = `toast toast-${severity}`;

  return (
    <div className="toast-container">
      <div className={toastClass}>
        {message}
      </div>
    </div>
  );
}
