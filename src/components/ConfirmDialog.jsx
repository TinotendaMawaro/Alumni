import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const confirmClass = type === 'danger' 
    ? 'bg-rose-600 hover:bg-rose-500 text-white' 
    : 'bg-purple-700 hover:bg-purple-600 text-white';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{message}</p>
        
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`btn ${confirmClass} flex-1`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
