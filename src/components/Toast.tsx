import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useStore();
  const [visible, setVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (toastMessage) {
      setCurrentText(toastMessage);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!visible && !currentText) return null;

  return (
    <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      {currentText}
    </div>
  );
};
