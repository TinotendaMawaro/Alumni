import { X, CheckCircle2, Mail, Phone, GraduationCap, Calendar, Briefcase, MapPin } from 'lucide-react';

const ViewAlumnusModal = ({ alumnus, onClose }) => {
  if (!alumnus) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-900/80 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-xs">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-800 text-yellow-400 font-mono font-black text-lg flex items-center justify-center border border-purple-500/40">
            {alumnus.fullName ? alumnus.fullName.charAt(0) : 'S'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{alumnus.fullName}</h3>
            <p className="text-xs text-yellow-400 font-semibold">{alumnus.program}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Email Address</span>
              <p className="text-slate-200 font-medium truncate">{alumnus.email}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">WhatsApp Phone</span>
              <a href={`https://wa.me/${alumnus.whatsapp?.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline block font-medium">
                {alumnus.whatsapp}
              </a>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Graduation Year</span>
              <p className="text-yellow-400 font-bold">{alumnus.year}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Location</span>
              <p className="text-slate-200">{alumnus.location || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Employment / Current Role</span>
            <p className="text-slate-200 font-medium">{alumnus.employment || 'N/A'}</p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Terms & Privacy Consent:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};

export default ViewAlumnusModal;
