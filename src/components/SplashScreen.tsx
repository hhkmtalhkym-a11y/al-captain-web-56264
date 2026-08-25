import { useEffect, useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import AppOfficialLogo from './AppOfficialLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      id="splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#031c18] via-[#050707] to-[#011412] text-white px-6 overflow-hidden select-none"
    >
      {/* Decorative background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#00FFD2]/10 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#ff2a5f]/10 blur-3xl pointer-events-none"></div>

      {/* Main Official Logo Container */}
      <div className="relative flex flex-col items-center text-center z-10">
        <div className="relative mb-6 transform transition-all duration-1000 scale-100 hover:scale-105">
          <AppOfficialLogo size="2xl" />
          <div className="absolute -bottom-2 -right-2 bg-[#ff2a5f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-lg">
            SYRIA 🇸🇾
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-2 justify-center font-['Cairo']">
          <span className="text-[#00FFD2] drop-shadow-[0_0_12px_rgba(0,255,210,0.5)]">الكابتن</span>
          <span className="text-sm sm:text-base font-semibold px-2.5 py-1 rounded-md bg-[#0d1211] text-[#00FFD2] border border-[#00FFD2]/30">
            AL-CAPTAIN
          </span>
        </h1>

        <p className="text-gray-400 text-sm sm:text-base max-w-sm mx-auto mb-8 font-medium">
          المنصة الرياضية الرسمية الأولى لحجز الملاعب والبطولات في سوريا
        </p>

        {/* Progress Bar */}
        <div className="w-64 sm:w-72 bg-[#0d1211] h-2 rounded-full border border-[#00FFD2]/20 overflow-hidden mb-3 relative">
          <div
            className="h-full bg-gradient-to-r from-[#00b293] to-[#00FFD2] transition-all duration-150 ease-out glow-primary"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between w-64 sm:w-72 text-xs text-gray-500 font-mono">
          <span>جاري التحميل...</span>
          <span className="text-[#00FFD2]">{progress}%</span>
        </div>
      </div>

      {/* Skip button for instant entry */}
      <button
        id="btn-skip-splash"
        onClick={onFinish}
        className="absolute bottom-8 text-xs text-gray-400 hover:text-[#00FFD2] transition-colors flex items-center gap-1 bg-[#0d1211]/80 px-4 py-2 rounded-full border border-[#00FFD2]/20 backdrop-blur-md"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#00FFD2]" />
        تخطي المقدمة والبدء فوراً
      </button>
    </div>
  );
}
