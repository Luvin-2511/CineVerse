import React, { useEffect, useState } from "react";
import "../styles/Toast.scss";

const Toast = ({ message, type, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`toast toast--${type} ${isLeaving ? "toast--leave" : ""}`}>
      <div className="toast__icon">
        {type === "error" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )}
      </div>
      <p className="toast__message">{message}</p>
      <button className="toast__close" onClick={onClose}>✕</button>
    </div>
  );
};

export default Toast;
