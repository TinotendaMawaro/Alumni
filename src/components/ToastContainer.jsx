import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs pointer-events-auto transform transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            t.type === 'success' 
              ? 'bg-slate-900 border-emerald-500/60 text-white' 
              : t.type === 'error' 
              ? 'bg-slate-900 border-rose-500/60 text-white' 
              : 'bg-slate-900 border-purple-500/60 text-white'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
          {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
          {t.type === 'info' && <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
          <span className="font-medium leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
