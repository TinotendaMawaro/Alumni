import { useState } from 'react';
import { User, Mail, Lock, LogIn, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import {
  authenticateAdmin,
  setAdminPassword,
  PASSWORD_MIN_LENGTH,
} from '../services/adminAuth';

const AdminLogin = ({ onLogin }) => {
  // 'login' = enter email + passkey/password; 'set-password' = first-time setup
  const [step, setStep] = useState('login');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    passkey: '',
    acceptedDataPrivacy: false,
  });

  // First-login password setup state
  const [setup, setSetup] = useState({ email: '', name: '', password: '', confirm: '' });

  const fail = (message) => onLogin({ type: 'error', message });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.acceptedDataPrivacy) {
      fail('You must accept the Data Protection Policy to access admin records.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authenticateAdmin(form.email, form.passkey);

      if (result.status === 'ok') {
        onLogin({ type: 'login', admin: result.admin });
      } else if (result.status === 'must_set_password') {
        // Move the first-time user to the permanent-password screen.
        setSetup({
          email: result.email,
          name: form.name.trim() || result.name,
          password: '',
          confirm: '',
        });
        setStep('set-password');
      } else {
        fail(result.message);
      }
    } catch (err) {
      fail(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (setup.password !== setup.confirm) {
      fail('Passwords do not match. Please re-enter them.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await setAdminPassword(setup.email, setup.password, setup.name);
      if (result.status === 'ok') {
        onLogin({ type: 'login', admin: result.admin });
      } else {
        fail(result.message);
      }
    } catch (err) {
      fail(err?.message || 'Could not save your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // First-time permanent-password setup screen
  // ------------------------------------------------------------------
  if (step === 'set-password') {
    return (
      <div className="max-w-md mx-auto my-8 md:my-14 card p-6 md:p-8">
        <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-black font-mono text-white">Set Your Password</h3>
          <p className="text-xs text-slate-400 mt-1">
            First-time sign in for <span className="text-slate-200 font-semibold">{setup.email}</span>.
            Choose a permanent password — the default passkey will no longer work after this.
          </p>
        </div>

        <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="input-icon" />
              <input
                type="text"
                value={setup.name}
                onChange={e => setSetup({ ...setup, name: e.target.value })}
                placeholder="e.g. Treasurer"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              New Password <span className="text-yellow-400">*</span>
            </label>
            <div className="relative">
              <KeyRound className="input-icon" />
              <input
                type="password"
                required
                value={setup.password}
                onChange={e => setSetup({ ...setup, password: e.target.value })}
                placeholder="Create a secure password"
                className="input-field pl-10"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              At least {PASSWORD_MIN_LENGTH} characters, including letters and numbers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              Confirm Password <span className="text-yellow-400">*</span>
            </label>
            <div className="relative">
              <Lock className="input-icon" />
              <input
                type="password"
                required
                value={setup.confirm}
                onChange={e => setSetup({ ...setup, confirm: e.target.value })}
                placeholder="Re-enter your password"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg text-xs md:text-sm flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{submitting ? 'Saving…' : 'Save Password & Enter Dashboard'}</span>
          </button>
        </form>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Standard login screen
  // ------------------------------------------------------------------
  return (
    <div className="max-w-md mx-auto my-8 md:my-14 card p-6 md:p-8">

      <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-400">
        <LogIn className="w-8 h-8" />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-black font-mono text-white">Admin Portal Access</h3>
        <p className="text-xs text-slate-400 mt-1">
          Sign in with your committee administrator credentials to view and manage records.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
            Administrator Full Name
          </label>
          <div className="relative">
            <User className="input-icon" />
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your name (optional)"
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
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="role@schotoalumni.co.zw"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
            Password / Passkey <span className="text-yellow-400">*</span>
          </label>
          <div className="relative">
            <Lock className="input-icon" />
            <input
              type="password"
              required
              value={form.passkey}
              onChange={e => setForm({ ...form, passkey: e.target.value })}
              placeholder="Your password (first time: default passkey)"
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
              onChange={e => setForm({ ...form, acceptedDataPrivacy: e.target.checked })}
              className="mt-0.5 rounded border-slate-700 text-yellow-400 focus:ring-yellow-400 bg-slate-900 w-4 h-4"
            />
            <span className="text-[11px] text-slate-300 leading-snug">
              I acknowledge that I am accessing confidential student &amp; alumni records and agree to abide by data privacy laws.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg text-xs md:text-sm flex items-center justify-center gap-2 mt-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          <span>{submitting ? 'Authenticating…' : 'Authenticate & Enter Dashboard'}</span>
        </button>
      </form>

    </div>
  );
};

export default AdminLogin;
