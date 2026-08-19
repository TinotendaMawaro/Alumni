import { X, ShieldCheck } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-purple-950 border border-purple-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-xs text-purple-100 max-h-[85vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span>School of Hospitality and Tourism</span>
        </div>
        <h3 className="text-xl font-black font-mono text-white mb-4">
          Terms & Data Protection Policy
        </h3>

        <div className="space-y-3 leading-relaxed text-purple-200">
          <p>
            <strong>1. Data Collection & Purpose:</strong> The information provided through this alumni registration portal is strictly collected for official alumni engagement, career networking, and school statistics.
          </p>
          <p>
            <strong>2. Privacy & Confidentiality:</strong> Your contact details (email and WhatsApp number) will never be sold, leased, or distributed to unauthorized third parties.
          </p>
          <p>
            <strong>3. Access Controls:</strong> Only authorized administrative personnel of the School of Hospitality and Tourism can access complete database entries.
          </p>
          <p>
            <strong>4. Right to Update or Remove:</strong> Alumni may contact the school administration at any time to request updates or complete removal of their personal profile from the database.
          </p>
          <p>
            <strong>5. Email Communications:</strong> By registering, you consent to receive official alumni communications, event invitations, and career updates from the School of Hospitality and Tourism.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-yellow-400 text-purple-950 font-bold rounded-xl hover:bg-yellow-300 transition"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};

export default TermsModal;
