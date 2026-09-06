import { useState } from 'react';
import { User, Mail, Lock, LogIn } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    passkey: '',
    acceptedDataPrivacy: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.acceptedDataPrivacy) {
      onLogin({ type: 'error', message: 'You must accept the Data Protection Policy to access admin records.' });
      return;
    }

    if (form.passkey === 'admin123' || form.passkey === 'admin') {
      const loggedInAdmin = {
        name: form.name.trim() || 'Admin Officer',
        email: form.email.trim() || 'admin@sht.ac.zw'
      };
      onLogin({ type: 'login', admin: loggedInAdmin });
    } else {
      onLogin({ type: 'error', message: 'Invalid passkey! Use admin123' });
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 md:my-14 card p-6 md:p-8">
      
      <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-400">
        <LogIn className="w-8 h-8" />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-black font-mono text-white">Admin Portal Access</h3>
        <p className="text-xs text-slate-400 mt-1">
          Sign in with administrator credentials to view and manage alumni records.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
            Administrator Full Name <span className="text-yellow-400">*</span>
          </label>
          <div className="relative">
            <User className="input-icon" />
            <input 
              type="text"
              required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="d mutsvene"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
            Admin Email Address <span className="text-yellow-400">*</span>
          </label>
          <div className="relative">
            <Mail className="input-icon" />
            <input 
              type="email"
              required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="admin@sht.ac.zw"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
            Passkey / Security Code <span className="text-yellow-400">*</span>
          </label>
          <div className="relative">
            <Lock className="input-icon" />
            <input 
              type="password"
              required
              value={form.passkey}
              onChange={e => setForm({...form, passkey: e.target.value})}
              placeholder="Passkey (Default: admin123)"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input 
              type="checkbox"
              required
              checked={form.acceptedDataPrivacy}
              onChange={e => setForm({...form, acceptedDataPrivacy: e.target.checked})}
              className="mt-0.5 rounded border-slate-700 text-yellow-400 focus:ring-yellow-400 bg-slate-900 w-4 h-4"
            />
            <span className="text-[11px] text-slate-300 leading-snug">
              I acknowledge that I am accessing confidential student & alumni records and agree to abide by data privacy laws.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition shadow-lg text-xs md:text-sm flex items-center justify-center gap-2 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Authenticate & Enter Dashboard</span>
        </button>

        <div className="mt-3 text-center text-[11px] text-slate-500 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          Demo credentials: <span className="text-slate-300 font-medium">admin@sht.ac.zw</span> | Passkey: <code className="text-yellow-400 font-mono">admin123</code>
        </div>
      </form>

    </div>
  );
};

export default AdminLogin;
