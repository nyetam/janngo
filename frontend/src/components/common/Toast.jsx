import { useEffect, useState } from 'react';

/**
 * Toast — message temporaire affiché 3 secondes puis disparu.
 * Usage : <Toast message="..." type="success|error" onDismiss={() => ...} />
 */
export default function Toast({ message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // laisser l'animation se terminer
    }, 3000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${
        type === 'error'
          ? 'bg-red-600 text-white'
          : type === 'warning'
          ? 'bg-amber-500 text-white'
          : 'bg-green-600 text-white'
      }`}
    >
      <span className="flex-shrink-0 text-base">
        {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅'}
      </span>
      <span className="leading-snug">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="ml-auto text-white/70 hover:text-white flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Hook useToast — gestion centralisée d'un toast.
 * const { toast, showToast } = useToast();
 * showToast('Succès !', 'success');
 * return <>{toast && <Toast {...toast} onDismiss={clearToast} />}</>;
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const clearToast = () => setToast(null);

  return { toast, showToast, clearToast };
}
