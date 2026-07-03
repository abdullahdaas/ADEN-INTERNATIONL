import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Sparkles, Home, ShieldCheck } from 'lucide-react';

export default function LiveActivityTicker() {
  const [enabled, setEnabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const activities = [
    { text: 'تم بيع منزل في الفلوجة - حي الشهداء بمبلغ 180 مليون دينار عراقي بعد 12 يوماً من النشر.', type: 'sale' },
    { text: 'تم تأجير شقة في الرمادي بمبلغ 750 ألف دينار شهرياً بعد 5 أيام من النشر.', type: 'rent' },
    { text: 'تم إضافة عقار جديد مميز في بغداد - المنصور بانتظار تواصل العملاء.', type: 'new' },
    { text: 'تم بيع أرض سكنية في الكرمة بمبلغ 95 مليون دينار عراقي بعد 8 أيام من النشر.', type: 'sale' },
    { text: 'تم حجز فيلا فاخرة في الجادرية استعداداً لإتمام معاملة البيع.', type: 'reserve' },
    { text: 'تم بيع منزل حديث في هيت (حي البكر) خلال 7 أيام من تاريخ الإعلان.', type: 'sale' }
  ];

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    // Initial delay before showing first message
    const initialTimeout = setTimeout(() => {
      setVisible(true);
    }, 4000);

    // Rotate loop
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 500); // Wait for transition
    }, 15000); // Change every 15 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <button
        id="btn-enable-notifications"
        onClick={() => setEnabled(true)}
        className="fixed bottom-4 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 shadow-lg"
        title="تفعيل إشعارات النشاط العقاري"
      >
        <BellOff className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      {/* Active notification card */}
      <div 
        id="live-activity-notification"
        className={`fixed bottom-4 left-4 z-40 max-w-sm rounded-xl border border-gold-prestige/20 bg-slate-950/95 p-4 shadow-xl shadow-black/80 backdrop-blur-md transition-all duration-500 transform ${
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start gap-3">
          
          {/* Decorative Icon */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-prestige/10 text-gold-prestige">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider text-gold-prestige uppercase flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>نشاط مباشر عقاري</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  id="btn-disable-notifications-bell"
                  onClick={() => setEnabled(false)}
                  className="p-1 text-slate-500 hover:text-slate-300"
                  title="تعطيل الإشعارات نهائياً"
                >
                  <BellOff className="h-3 w-3" />
                </button>
                <button
                  id="btn-close-notification"
                  onClick={() => setVisible(false)}
                  className="p-1 text-slate-500 hover:text-slate-300"
                  title="إغلاق مؤقت"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {activities[currentIndex].text}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
