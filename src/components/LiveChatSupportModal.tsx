import React, { useState } from 'react';
import { Send, X, Bot, Shield, PhoneCall } from 'lucide-react';
import { openWhatsAppShare } from '../utils/helpers';

interface LiveChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
}

export default function LiveChatSupportModal({ isOpen, onClose }: LiveChatSupportModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'support',
      text: 'مرحباً بك في خدمة الدعم الفني المباشر لمنصة الكابتن الرياضية! ⚽ كيف يمكننا مساعدتك اليوم بخصوص الحجوزات أو الملاعب أو الدوريات؟',
      time: 'الآن'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated instant assistant response
    setTimeout(() => {
      let replyText = 'شكراً لتواصلك معنا! فريق دعم الكابتن يتابع طلبك وسيقوم بخدمتك فوراً. يمكنك أيضاً التواصل المباشر عبر واتساب.';
      if (input.includes('حجز') || input.includes('ملعب')) {
        replyText = 'بخصوص حجز الملاعب: جميع الأسعار معروضة بدون أي عمولة إضافية وبإمكانك الدفع نقداً عند الحضور أو عبر شام كاش مع تأكيد فوري.';
      } else if (input.includes('دوري') || input.includes('بطولة')) {
        replyText = 'قسم الدوريات يتيح لك تسجيل فريقك ومتابعة جدول الترتيب والنتائج وجوائز البطولة مباشرة من المنصة.';
      } else if (input.includes('شام كاش')) {
        replyText = 'عند اختيار الدفع عبر شام كاش، يظهر رقم حساب صاحب الملعب أو البطولة ليتم التحويل وإرفاق رقم المعاملة.';
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        text: replyText,
        time: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div
      id="modal-live-chat"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border border-[#00FFD2]/30 rounded-2xl w-full max-w-lg h-[540px] flex flex-col glow-primary shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050707] border-b border-[#00FFD2]/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/40 flex items-center justify-center text-[#00FFD2]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm font-['Cairo']">الدعم الفني المباشر (الكابتن)</h3>
                <span className="w-2 h-2 rounded-full bg-[#00FFD2] animate-pulse"></span>
              </div>
              <p className="text-[11px] text-gray-400">فريق خدمة العملاء متصل وجاهز للرد</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openWhatsAppShare('مرحباً، أحتاج مساعدة بخصوص تطبيق الكابتن الرياضي', '0945688090')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs flex items-center gap-1 border border-emerald-500/30 transition-colors"
              title="محادثة واتساب مباشرة"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050707]/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#00FFD2] text-black font-medium rounded-br-none shadow-md'
                    : 'bg-[#0d1211] text-gray-200 border border-[#00FFD2]/20 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-2 bg-[#050707] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setInput('كيف أقوم بحجز ملعب عبر شام كاش؟')}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#00FFD2]/10 hover:text-[#00FFD2] text-gray-300 border border-white/10 transition-colors"
          >
            حجز عبر شام كاش؟
          </button>
          <button
            onClick={() => setInput('هل توجد أي عمولة على حجز الملاعب؟')}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#00FFD2]/10 hover:text-[#00FFD2] text-gray-300 border border-white/10 transition-colors"
          >
            هل توجد عمولة؟
          </button>
          <button
            onClick={() => setInput('كيف أنشئ طلباً لبطاقة لاعب كشاف؟')}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#00FFD2]/10 hover:text-[#00FFD2] text-gray-300 border border-white/10 transition-colors"
          >
            بطاقة كشاف المواهب؟
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#0d1211] border-t border-[#00FFD2]/20 flex items-center gap-2">
          <input
            id="input-chat-message"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب استفسارك أو رسالتك هنا..."
            className="flex-1 bg-[#050707] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2] transition-colors"
          />
          <button
            id="btn-send-chat"
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black transition-all glow-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
