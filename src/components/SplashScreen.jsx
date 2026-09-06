import { RefreshCw } from 'lucide-react';
import Logo from './Logo';

const SplashScreen = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 bg-purple-950 flex flex-col items-center justify-center p-6 text-center transition-opacity duration-300">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-md p-3 border-2 border-yellow-400 shadow-2xl flex items-center justify-center animate-pulse overflow-hidden">
          <Logo className="w-full h-full object-contain" />
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
