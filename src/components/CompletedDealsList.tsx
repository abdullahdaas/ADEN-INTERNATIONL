import React from 'react';
import { BadgeCheck, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { CompletedDeal } from '../types';
import { formatPrice } from './PropertyCard';

interface CompletedDealsListProps {
  deals: CompletedDeal[];
}

export default function CompletedDealsList({ deals }: CompletedDealsListProps) {
  return (
    <div id="completed-deals-section" className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BadgeCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">آخر الصفقات العقارية المكتملة</h3>
            <p className="text-xs text-slate-400 font-sans">عمليات البيع والتأجير الموثقة مؤخراً عبر المنصة</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>تحديث مباشر</span>
        </div>
      </div>

      {/* Grid of Deals */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-slate-500">لا توجد صفقات مكتملة مسجلة بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals?.slice(0, 4)?.map((deal, index) => {
            const isSale = deal.type === 'بيع';
            return (
              <div 
                key={deal.id || index}
                className="relative flex flex-col justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 hover:border-emerald-500/20 transition-all group"
              >
                {/* Badge decoration */}
                <div className={`absolute top-3 left-3 h-2 w-2 rounded-full ${isSale ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isSale ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      تم ال{isSale ? 'بيع' : 'تأجير'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{deal.date}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                    {deal.propertyTitle}
                  </h4>
                  <p className="text-[10.5px] text-slate-400 mb-3">
                    {deal.governorate} • {deal.district} • {deal.neighborhood}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3 mt-2 flex items-center justify-between">
                  <div className="text-xs font-bold text-gold-prestige">
                    {formatPrice(deal.price, isSale ? 'للبيع' : 'للإيجار')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    خلال <span className="font-bold text-white font-mono">{deal.daysToComplete}</span> أيام من النشر
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
