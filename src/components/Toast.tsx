import { FC } from 'react';

export type ToastType = 'info' | 'error' | 'success';

export type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export const Toast: FC<ToastProps> = ({ message, type, visible }) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg max-w-xs backdrop-blur-lg pointer-events-none ${
        (() => {
          if (type === 'error') return 'bg-red-500/80 text-white';
          if (type === 'success') return 'bg-green-500/80 text-white';
          return 'bg-blue-500/80 text-white';
        })()
      }`}
      style={{
        animation: (() => {
          if (visible) return 'toast-slide-in 0.3s ease-out forwards';
          return 'toast-slide-out 0.3s ease-out forwards';
        })(),
      }}
    >
      {message}
    </div>
  );
};
