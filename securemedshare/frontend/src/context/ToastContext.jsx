import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = (id) => setItems((s) => s.filter((t) => t.id !== id));

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, type, message }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 5000);
  }, []);

  const icon = { success: CheckCircle2, error: XCircle, info: Info };
  const tone = {
    success: "border-teal-200 bg-teal-50 text-teal-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-navy-100 bg-navy-50 text-navy-900",
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {items.map((t) => {
          const Icon = icon[t.type] || Info;
          return (
            <div key={t.id} className={`flex items-start gap-2 rounded-lg border p-3 text-sm shadow-lg ${tone[t.type] || tone.info}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
