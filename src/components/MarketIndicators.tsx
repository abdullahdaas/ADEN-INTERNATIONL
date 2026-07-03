import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Building2, CalendarDays, Award, MapPin } from 'lucide-react';
import { MarketIndicator } from '../types';
import { formatPrice } from './PropertyCard';

interface MarketIndicatorsProps {
  stats: {
    activeCount: number;
    soldCount: number;
    rentedCount: number;
    avgDaysToSell: number;
    avgDaysToRent: number;
    highestSale: number;
    highestRent: number;
    activeRegions: { name: string; count: number }[];
    governorateStats: MarketIndicator[];
  };
}

export default function MarketIndicators({ stats }: MarketIndicatorsProps) {
  return (
    <div id="market-indicators-panel" className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
      
      {/* Panel Header */}
      <div className="flex items-center space-x-3 space-x-reverse mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-prestige/10 text-gold-prestige border border-gold-prestige/20">
          <BarChart3 className="h-5.5 w-5.5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-sans">مؤشرات السوق العقاري العراقي</h3>
          <p className="text-xs text-slate-400 font-sans">تحليلات وإحصاءات دقيقة لمعدلات الأسعار وفترات التسويق والنشاط الجغرافي</p>
        </div>
      </div>

      {/* Main Stats Counters Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        
        {/* Active Property Stats */}
        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30">
          <span className="text-xs font-semibold text-slate-400 block mb-1">العقارات المعروضة حالياً</span>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-black text-white font-mono">{stats.activeCount}</span>
            <span className="text-[10px] text-slate-500 font-sans">إعلان نشط</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-800 rounded overflow-hidden">
            <div className="h-full bg-gold-prestige" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Sold Count Stats */}
        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30">
          <span className="text-xs font-semibold text-slate-400 block mb-1">الصفقات المكتملة</span>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.soldCount + stats.rentedCount}</span>
            <span className="text-[10px] text-slate-500 font-sans">صفقة موثقة</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400/90 font-sans">
            {stats.soldCount} بيع • {stats.rentedCount} إيجار
          </div>
        </div>

        {/* Avg Days To Sell */}
        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30">
          <span className="text-xs font-semibold text-slate-400 block mb-1">متوسط مدة البيع</span>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.avgDaysToSell}</span>
            <span className="text-[10px] text-slate-500 font-sans">يوم في المتوسط</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-sans">
            متوسط الإيجار: <span className="text-white font-mono font-bold">{stats.avgDaysToRent}</span> أيام
          </div>
        </div>

        {/* Highest Sale Value */}
        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30">
          <span className="text-xs font-semibold text-slate-400 block mb-1">أعلى قيمة صفقة مسجلة</span>
          <div className="flex items-baseline space-x-1.5 space-x-reverse">
            <span className="text-lg font-black text-gold-accent font-sans">{formatPrice(stats.highestSale, 'للبيع')}</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-sans">
            أعلى إيجار: <span className="text-white font-mono font-bold">{formatPrice(stats.highestRent, 'للإيجار')}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Governorate Price Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-white/5 bg-slate-950/20">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-gold-prestige" />
            <span>متوسط الأسعار ومستويات الطلب حسب المحافظات</span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 pb-2">
                  <th className="py-2.5 font-bold">المحافظة</th>
                  <th className="py-2.5 font-bold">متوسط سعر البيع</th>
                  <th className="py-2.5 font-bold">متوسط الإيجار الشهري</th>
                  <th className="py-2.5 font-bold text-center">المبيعات</th>
                  <th className="py-2.5 font-bold text-center">الإيجارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {stats.governorateStats?.map((gov: any, idx: number) => (
                  <tr key={gov.governorate || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-bold text-white flex items-center gap-1">
                      <span className="text-gold-prestige">•</span>
                      <span>{gov.governorate}</span>
                    </td>
                    <td className="py-3 font-sans text-gold-prestige font-bold">
                      {gov.avgSalePrice > 0 ? formatPrice(gov.avgSalePrice, 'للبيع') : '—'}
                    </td>
                    <td className="py-3 font-sans text-blue-400 font-bold">
                      {gov.avgRentPrice > 0 ? formatPrice(gov.avgRentPrice, 'للإيجار') : '—'}
                    </td>
                    <td className="py-3 text-center font-mono font-semibold text-emerald-400">
                      {gov.totalSold} صفقات
                    </td>
                    <td className="py-3 text-center font-mono font-semibold text-indigo-400">
                      {gov.totalRented} صفقات
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Active Regions List */}
        <div className="p-5 rounded-xl border border-white/5 bg-slate-950/20 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-gold-prestige" />
              <span>المناطق الأكثر نشاطاً عقارياً</span>
            </h4>
            <p className="text-xs text-slate-400 mb-5 font-sans">
              المناطق الجغرافية التي تسجل أعلى معدلات تداول ومبيعات خلال الأسبوع الماضي
            </p>

            <div className="space-y-4">
              {stats.activeRegions?.map((region: any, idx: number) => (
                <div key={region.name || idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-prestige/10 text-xs font-bold text-gold-prestige">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{region.name}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold font-sans">
                    {region.count} صفقة منجزة
                  </span>
                </div>
              ))}
              {stats.activeRegions.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  لا توجد سجلات كافية لعرض المناطق النشطة.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-[10.5px] text-slate-400 flex items-center gap-1 font-sans">
            <Sparkles className="h-3.5 w-3.5 text-gold-prestige" />
            <span>يتم تحديث المؤشرات تلقائياً فور إدراج الصفقات العقارية.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
