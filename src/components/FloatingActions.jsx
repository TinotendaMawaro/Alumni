import { useEffect, useState } from 'react';
import { CreditCard, MessageCircle, X, Phone } from 'lucide-react';

const SUPPORT_PHONE = '+263772490374';
const SUPPORT_NAME = 'Chairman Robson';
const SUPPORT_PHONE_DISPLAY = '+263 77 249 0374';

const WhatsAppGlyph = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.256.59 4.46 1.71 6.4L3.2 28.8l6.56-1.72a12.75 12.75 0 0 0 6.243 1.596h.005c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.72 12.72 0 0 0 16.004 3.2zm0 23.3h-.004a10.6 10.6 0 0 1-5.39-1.475l-.387-.23-4.03 1.058 1.076-3.93-.252-.403a10.57 10.57 0 0 1-1.62-5.62c0-5.87 4.78-10.65 10.65-10.65 2.845 0 5.517 1.108 7.53 3.117a10.57 10.57 0 0 1 3.115 7.533c0 5.87-4.78 10.65-10.65 10.65zm5.845-7.983c-.32-.16-1.897-.937-2.192-1.044-.295-.108-.51-.16-.724.16-.214.32-.833 1.044-1.022 1.258-.19.214-.38.24-.7.08-.32-.16-1.35-.497-2.572-1.586-.95-.848-1.59-1.894-1.776-2.214-.187-.32-.02-.492.14-.65.145-.145.32-.38.48-.57.16-.19.214-.32.32-.534.107-.214.053-.4-.027-.56-.08-.16-.724-1.755-.992-2.4-.26-.63-.527-.544-.724-.554-.186-.008-.4-.01-.614-.01-.214 0-.56.08-.853.4-.293.32-1.118 1.092-1.118 2.664 0 1.57 1.145 3.09 1.304 3.304.16.214 2.246 3.43 5.44 4.807.76.328 1.354.525 1.817.672.764.242 1.46.208 2.01.126.613-.09 1.897-.775 2.164-1.524.267-.75.267-1.39.187-1.525-.08-.134-.294-.214-.614-.374z" />
  </svg>
);

const Fab = ({ onClick, label, text, tone, children }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`h-9 pl-2.5 pr-3.5 rounded-full flex items-center gap-2 bg-slate-900/50 border border-white/25 hover:border-white/50 hover:bg-white/10 backdrop-blur-md transition-all ${tone}`}
  >
    {children}
    <span className="text-[11px] font-bold tracking-wide text-white">{text}</span>
  </button>
);

const FloatingActions = ({ onNavigate }) => {
  const [openPanel, setOpenPanel] = useState(null); // 'support' | 'whatsapp' | null

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (name) => setOpenPanel(prev => (prev === name ? null : name));
  const close = () => setOpenPanel(null);

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2">
      {openPanel && (
        <div className="glass-strong w-64 max-w-[calc(100vw-1.5rem)] p-3 space-y-2.5 text-slate-100 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-wider">
                {openPanel === 'support' ? 'Support' : 'WhatsApp'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {openPanel === 'support'
                  ? `Questions about membership or alumni records? Reach ${SUPPORT_NAME}.`
                  : `Message ${SUPPORT_NAME} directly on WhatsApp.`}
              </p>
            </div>
            <button
              onClick={close}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition flex-shrink-0"
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Call {SUPPORT_NAME}</span>
                <span className="block text-xs font-bold text-white truncate">{SUPPORT_PHONE_DISPLAY}</span>
              </span>
            </a>

            <a
              href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${SUPPORT_NAME}, I have a question about the SHT Alumni portal.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 transition"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/25 text-emerald-200 flex items-center justify-center flex-shrink-0">
                <WhatsAppGlyph className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[9px] uppercase tracking-wider text-emerald-200/80">WhatsApp</span>
                <span className="block text-xs font-bold text-white truncate">Start a chat</span>
              </span>
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end gap-2">
        <Fab
          onClick={() => toggle('whatsapp')}
          label="Questions? WhatsApp us"
          text="WhatsApp"
          tone="text-emerald-300"
        >
          <WhatsAppGlyph className="w-4 h-4" />
        </Fab>

        <Fab
          onClick={() => toggle('support')}
          label="Questions? Chat with support"
          text="Support"
          tone="text-yellow-300"
        >
          <MessageCircle className="w-4 h-4" />
        </Fab>

        <Fab
          onClick={() => onNavigate?.('payments')}
          label="Make a membership payment"
          text="Pay"
          tone="text-yellow-300"
        >
          <CreditCard className="w-4 h-4" />
        </Fab>
      </div>
    </div>
  );
};

export default FloatingActions;
