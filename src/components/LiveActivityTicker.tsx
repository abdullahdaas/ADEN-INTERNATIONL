import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Sparkles, ShieldCheck } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../data/db';
import { ActivityLog } from '../types';

export default function LiveActivityTicker() {
  const [enabled, setEnabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityLog | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    const mountTime = Date.now();
    let isFirstLoad = true;

    const q = query(
      collection(firestore, 'activityLogs'), 
      orderBy('timestamp', 'desc'), 
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad) {
        isFirstLoad = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const activity = change.doc.data() as ActivityLog;
          const activityTime = new Date(activity.timestamp).getTime();
          
          if (activityTime > mountTime) {
            setCurrentActivity(activity);
            setVisible(true);
            setTimeout(() => {
              setVisible(false);
            }, 10000); // hide after 10 seconds
          }
        }
      });
    });

    return () => unsubscribe();
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
        className={`fixed bottom-4 left-4 z-40 w-[calc(100%-32px)] sm:w-auto max-w-sm rounded-xl border border-gold-prestige/20 bg-slate-950/95 p-4 shadow-xl shadow-black/80 backdrop-blur-md transition-all duration-500 transform ${
          visible && currentActivity ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}
      >
        {currentActivity && (
          <div className="flex items-start gap-3">
            {/* Decorative Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-prestige/10 text-gold-prestige">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold tracking-wider text-gold-prestige uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>نشاط مباشر</span>
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
                {currentActivity.details || currentActivity.action}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
