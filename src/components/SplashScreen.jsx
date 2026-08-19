import { RefreshCw } from 'lucide-react';

const SplashScreen = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 bg-purple-950 flex flex-col items-center justify-center p-6 text-center transition-opacity duration-300">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-md p-3 border-2 border-yellow-400 shadow-2xl flex items-center justify-center animate-pulse">
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-700">
            <path d="M50 5 L90 20 L90 55 C90 75 50 95 50 95 C50 95 10 75 10 55 L10 20 Z" fill="#6B21A8" stroke="#FACC15" strokeWidth="4"/>
            <path d="M50 15 L50 85 M20 45 L80 45" stroke="#FACC15" strokeWidth="4"/>
            <circle cx="50" cy="45" r="14" fill="#EAB308"/>
            <path d="M50 36 L53 42 L59 43 L55 48 L56 54 L50 51 L44 54 L45 48 L41 43 L47 42 Z" fill="#ffffff"/>
          </svg>
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-yellow-400/20 blur-xl -z-10"></div>
      </div>
      <h2 className="text-xl md:text-2xl font-black tracking-wider text-yellow-400 uppercase font-mono">
        School of Hospitality & Tourism
      </h2>
      <p className="text-purple-200 text-xs md:text-sm mt-1 mb-8 font-medium">Alumni Management Portal</p>

      <div className="flex items-center gap-3 bg-purple-900/80 px-5 py-2.5 rounded-full border border-purple-700/60 shadow-lg">
        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
        <span className="text-xs font-semibold text-slate-200">{message}</span>
      </div>
    </div>
  );
};

export default SplashScreen;
