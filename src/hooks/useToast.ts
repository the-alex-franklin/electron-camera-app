import { useState, useEffect } from 'react';
import { ToastType } from '../components/Toast';

type Toast = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export const useToast = () => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (!toast) return;

    const hideTimer = setTimeout(() => {
      setToast(current => current ? { ...current, visible: false } : null);
    }, 2700);

    const removeTimer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [toast]);

  return { toast, showToast };
};
