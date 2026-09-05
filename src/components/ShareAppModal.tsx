import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { openWhatsAppShare } from '../utils/helpers';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APP_OFFICIAL_URL = 'https://al-captain-web-56264.vercel.app';

export default function ShareAppModal({ isOpen, onClose }: ShareAppModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const qrImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    // Generate high-resolution QR code for the exact URL
    QRCode.toDataURL(
      APP_OFFICIAL_URL,
      {
        width: 360,
        margin: 2,
        color: {
          dark: '#050707',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }
    )
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_OFFICIAL_URL);
      setIsCopied(true);
      setShareSuccessMessage('تم نسخ رابط المنصة إلى الحافظة بنجاح 📋');
      setTimeout(() => setIsCopied(false), 3000);
      setTimeout(() => setShareSuccessMessage(null), 3500);
    } catch {
      // Fallback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'al-captain-app-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShareSuccessMessage('تم تحميل باركود التطبيق كصورة PNG بنجاح 📥');
    setTimeout(() => setShareSuccessMessage(null), 3500);
  };

  const handleWhatsAppShare = () => {
    const text = `⚽ *تطبيق الكابتن الرياضي في سوريا* 🏆
━━━━━━━━━━━━━━━━━━━━━
🔥 المنصة الرياضية الأولى لحجز ملاعب كرة القدم ومباريات التحدي في سوريا بدون وسيط وبـ 0% عمولة!

✅ حجز فوري للملاعب في جميع المحافظات السورية
✅ إطلاق وقبول تحديات المباريات الودية
✅ كشاف المواهب وبطاقات اللاعبين الكروية (CV)
✅ دوريات وبطولات محلية معتمدة

📲 افتح التطبيق مباشرة عبر الرابط:
${APP_OFFICIAL_URL}
━━━━━━━━━━━━━━━━━━━━━
امسح الباركود أو اضغط الرابط وشاركنا التحدي! ⚽🤝`;

    openWhatsAppShare(text);
    setShareSuccessMessage('جاري فتح واتساب لمشاركة التطبيق مع الفرق والأصدقاء 📲');
    setTimeout(() => setShareSuccessMessage(null), 3500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق الكابتن الرياضي - Al-Captain',
          text: 'منصة حجز ملاعب كرة القدم وتحديات المباريات في سوريا بـ 0% عمولة',
          url: APP_OFFICIAL_URL
        });
        setShareSuccessMessage('تمت المشاركة بنجاح! 🚀');
        setTimeout(() => setShareSuccessMessage(null), 3500);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleWhatsAppShare();
        }
      }
    } else {
      handleWhatsAppShare();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-['Cairo']">
      <div className="bg-[#0d1211] border border-[#00FFD2]/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#050707]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>مشاركة التطبيق والباركود (QR Code)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  رابط معتمد
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                امسح الباركود بكاميرا الهاتف أو شارك الرابط مع كباتن الفرق
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status notification */}
          {shareSuccessMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{shareSuccessMessage}</span>
            </div>
          )}

          {/* QR Code Presentation Box */}
          <div className="bg-[#050707] border border-white/10 rounded-3xl p-6 text-center space-y-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFD2]/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Stadium Header badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFD2]/10 border border-[#00FFD2]/30 text-[#00FFD2] text-xs font-black">
              <span>⚽ منصة الكابتن الرياضية - Al-Captain</span>
            </div>

            {/* The QR Code Image */}
            <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-4 border-[#00FFD2]/50 inline-block">
              {isGenerating ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-gray-800">
                  <div className="w-8 h-8 border-3 border-[#00FFD2] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold">جاري توليد الباركود...</span>
                </div>
              ) : (
                <img
                  ref={qrImageRef}
                  src={qrDataUrl}
                  alt="باركود تطبيق الكابتن"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                />
              )}
            </div>

            <p className="text-xs text-gray-300 flex items-center justify-center gap-1.5 font-medium">
              <Smartphone className="w-4 h-4 text-[#00FFD2]" />
              <span>وجّه كاميرا هاتفك نحو الباركود لفتح التطبيق وتثبيته فوراً</span>
            </p>
          </div>

          {/* Official URL Copy Bar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              رابط التطبيق الرسمي المباشر:
            </label>
            <div className="flex items-center gap-2 bg-[#050707] border border-white/10 rounded-2xl p-2 pl-3">
              <input
                type="text"
                readOnly
                value={APP_OFFICIAL_URL}
                className="flex-1 bg-transparent text-xs text-[#00FFD2] font-mono outline-none px-2 direction-ltr text-left"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg glow-primary cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة عبر واتساب</span>
            </button>

            {/* Download QR Code Button */}
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl || isGenerating}
              className="py-3 px-3 rounded-2xl bg-[#050707] hover:bg-white/10 border border-white/15 text-gray-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#00FFD2]" />
              <span>تحميل الباركود (PNG)</span>
            </button>

            {/* Open Direct URL in new tab */}
            <a
              href={APP_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-2xl bg-[#050707] hover:bg-white/10 border border-white/15 text-gray-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>فتح الرابط مباشرة</span>
            </a>
          </div>

          {/* Quality & Safety Guarantee note */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              رابط مشفّر وآمن، معتمد لجميع محافظات سوريا بدون عمولة، متوافق مع كافة أجهزة الأندرويد والآيفون.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#050707] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
