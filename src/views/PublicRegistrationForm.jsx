import { useState } from 'react';
import { User, Mail, Phone, GraduationCap, Calendar, Briefcase, MapPin, ChevronDown } from 'lucide-react';
import { PROGRAMS } from '../data/seedData';
import { getYearOptions } from '../utils/formatters';

const PublicRegistrationForm = ({ onSubmit, showSplash, setShowSplash, setSplashMessage }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    program: '',
    year: '',
    employment: '',
    location: '',
    acceptedTerms: false
  });

  const triggerSplashTransition = (message, callback) => {
    setSplashMessage(message);
    setShowSplash(true);
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => setShowSplash(false), 700);
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.acceptedTerms) {
      onSubmit({ type: 'error', message: 'You must accept the Terms & Data Privacy Policy to register.' });
      return;
    }

    triggerSplashTransition('Registering Alumni Information...', () => {
      onSubmit({ 
        type: 'submit', 
        data: {
          ...form,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          employment: form.employment.trim() || 'N/A',
          location: form.location.trim() || 'N/A',
          termsAccepted: true,
          createdAt: new Date().toISOString().split('T')[0]
        }
      });
    });
  };

  return (
    <section className="flex-1 bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-purple-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-4 border-2 border-yellow-400">
              <div className="w-14 h-14 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M50 5 L90 20 L90 55 C90 75 50 95 50 95 C50 95 10 75 10 55 L10 20 Z" fill="#6B21A8" stroke="#FACC15" strokeWidth="4"/>
                  <path d="M50 15 L50 85 M20 45 L80 45" stroke="#FACC15" strokeWidth="4"/>
                  <circle cx="50" cy="45" r="14" fill="#EAB308"/>
                  <path d="M50 36 L53 42 L59 43 L55 48 L56 54 L50 51 L44 54 L45 48 L41 43 L47 42 Z" fill="#ffffff"/>
                </svg>
              </div>
            </div>

            <p className="text-xs md:text-sm tracking-widest font-bold uppercase text-purple-200">
              School of Hospitality and Tourism
            </p>
            <h2 className="text-4xl md:text-6xl font-black font-mono text-yellow-400 uppercase tracking-tight my-1 drop-shadow-md">
              SIGN UP
            </h2>
            <div className="w-28 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto rounded-full my-2"></div>
            <h3 className="text-lg md:text-2xl font-extrabold text-white uppercase tracking-wider">
              FOR OUR ALUMNI DATABASE
            </h3>
            <p className="mt-2 text-purple-200 text-xs md:text-sm max-w-md mx-auto">
              Stay connected with peers, join alumni networks, and access career advancement opportunities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                Full Name <span className="text-yellow-400">*</span>
              </label>
              <div className="relative">
                <User className="input-icon" />
                <input 
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  placeholder="e.g. Tendai Moyo"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Email Address <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="input-icon" />
                  <input 
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="tendai@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                  WhatsApp Phone <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="input-icon" />
                  <input 
                    type="tel"
                    required
                    value={form.whatsapp}
                    onChange={e => setForm({...form, whatsapp: e.target.value})}
                    placeholder="+263 77 123 4567"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Program Studied <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="input-icon" />
                  <select
                    required
                    value={form.program}
                    onChange={e => setForm({...form, program: e.target.value})}
                    className="input-field pl-10 appearance-none"
                  >
                    <option value="" disabled>Select your program...</option>
                    {PROGRAMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-purple-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Grad Year <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="input-icon" />
                  <select
                    required
                    value={form.year}
                    onChange={e => setForm({...form, year: e.target.value})}
                    className="input-field pl-10 appearance-none"
                  >
                    <option value="" disabled>Year</option>
                    {getYearOptions().map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-purple-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Current Role / Employer
                </label>
                <div className="relative">
                  <Briefcase className="input-icon" />
                  <input 
                    type="text"
                    value={form.employment}
                    onChange={e => setForm({...form, employment: e.target.value})}
                    placeholder="e.g. Front Office Manager at Cresta"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Current Location / City
                </label>
                <div className="relative">
                  <MapPin className="input-icon" />
                  <input 
                    type="text"
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                    placeholder="e.g. Harare / Victoria Falls"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 bg-purple-950/60 p-3.5 rounded-2xl border border-purple-700/50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  required
                  checked={form.acceptedTerms}
                  onChange={e => setForm({...form, acceptedTerms: e.target.checked})}
                  className="mt-0.5 rounded border-purple-600 text-yellow-400 focus:ring-yellow-400 bg-purple-950 w-4 h-4"
                />
                <span className="text-xs text-purple-200 leading-relaxed">
                  I confirm that my details are accurate and I consent to the processing and safe storage of my personal data for School of Hospitality and Tourism official alumni updates. Read{' '}
                  <span className="text-yellow-400 underline font-bold cursor-pointer" onClick={() => onSubmit({ type: 'showTerms' })}>
                    Terms & Data Privacy Policy
                  </span>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black font-mono text-base md:text-lg rounded-xl transition-transform active:scale-[0.99] shadow-xl flex items-center justify-center gap-2 tracking-wider uppercase mt-4"
            >
              SIGN UP NOW
            </button>

          </form>

          <div className="mt-6 text-center text-[11px] text-purple-300/80 flex items-center justify-center gap-1.5">
            <span className="w-3.5 h-3.5 text-yellow-400">🔒</span>
            <span>Your information is protected by standard data encryption protocols.</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PublicRegistrationForm;
