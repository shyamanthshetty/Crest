import { Outlet } from 'react-router-dom';
import { BookMarked } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-display antialiased text-slate-900">
      {/* Left side: branding/aesthetic area */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-700/30 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shadow-xl text-indigo-600">
             <BookMarked size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Crest</h1>
            <span className="text-xs uppercase font-bold text-indigo-200 tracking-widest mt-0.5 block">Highs and Lows</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Document your journey, one day at a time.</h2>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Join Crest to capture your moments, track your mood, and reflect on what matters most. Your personal space for growth and mindfulness.
          </p>
        </div>
      </div>

      {/* Right side: form area */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg text-white">
             <BookMarked size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Crest</h1>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
