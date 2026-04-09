import { X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import './Toaster.scss';

export function Toaster() {
  const { toasts, remove } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="toaster" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => remove(toast.id)}
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
