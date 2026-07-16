'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, AlertTriangle, Server, Shield, TrendingUp, Wifi, Database } from 'lucide-react';
import { getAllAnalyses, getAdminMetrics } from '@/lib/analysis-engine';

export default function AdminPage() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [metrics, setMetrics] = useState(getAdminMetrics([]));

  useEffect(() => {
    const dir = document.documentElement.dir;
    setLocale(dir === 'rtl' ? 'ar' : 'en');
    const results = getAllAnalyses();
    setMetrics(getAdminMetrics(results));
  }, []);

  const healthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'degraded': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'down': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold gold-gradient-text mb-2">
            {locale === 'ar' ? 'مركز الذكاء' : 'Intelligence Center'}
          </h1>
          <p className="text-smart-gray-light">
            {locale === 'ar' ? 'بيانات تشغيلية عن المنصة' : 'Operational platform data'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-smart-gold/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-smart-gold" />
              </div>
              <p className="text-sm text-smart-gray">
                {locale === 'ar' ? 'إجمالي التحليلات' : 'Total Analyses'}
              </p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalAnalyses}</p>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-smart-gray">
                {locale === 'ar' ? 'متوسط المدة' : 'Avg Duration'}
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.averageDuration > 0 ? `${(metrics.averageDuration / 1000).toFixed(1)}s` : 'N/A'}
            </p>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm text-smart-gray">
                {locale === 'ar' ? 'فشل المعالجة' : 'Processing Failures'}
              </p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.processingFailures}</p>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm text-smart-gray">
                {locale === 'ar' ? 'فشل API' : 'API Failures'}
              </p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.apiFailures}</p>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-smart-gold" />
            {locale === 'ar' ? 'صحة النظام' : 'System Health'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-smart-dark-3/50">
              <p className="text-xs text-smart-gray mb-2">
                {locale === 'ar' ? 'API' : 'API'}
              </p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${healthColor(metrics.systemHealth.api)}`}>
                {locale === 'ar'
                  ? (metrics.systemHealth.api === 'healthy' ? 'سليم' : metrics.systemHealth.api === 'degraded' ? 'متدهور' : 'معطل')
                  : metrics.systemHealth.api}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-smart-dark-3/50">
              <p className="text-xs text-smart-gray mb-2">
                {locale === 'ar' ? 'قاعدة البيانات' : 'Database'}
              </p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${healthColor(metrics.systemHealth.database)}`}>
                {locale === 'ar'
                  ? (metrics.systemHealth.database === 'healthy' ? 'سليم' : metrics.systemHealth.database === 'degraded' ? 'متدهور' : 'معطل')
                  : metrics.systemHealth.database}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-smart-dark-3/50">
              <p className="text-xs text-smart-gray mb-2">
                {locale === 'ar' ? 'آخر فحص' : 'Last Checked'}
              </p>
              <p className="text-xs text-white">
                {new Date(metrics.systemHealth.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-smart-gold" />
            {locale === 'ar' ? 'المشكلات الشائعة' : 'Common Issue Categories'}
          </h3>
          {metrics.commonIssues.length > 0 ? (
            <div className="space-y-3">
              {metrics.commonIssues.map((issue, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-smart-dark-3/50">
                  <span className="text-sm text-smart-gray-light">{issue.issue}</span>
                  <span className="text-sm font-bold text-white">{issue.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-smart-gray">
              {locale === 'ar' ? 'لا توجد بيانات تشغيلية متاحة بعد' : 'No operational data available yet'}
            </p>
          )}
        </div>

        {/* Platform Distribution */}
        <div className="glass-card rounded-xl p-6 mt-8">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-smart-gold" />
            {locale === 'ar' ? 'توزيع المنصات' : 'Platform Distribution'}
          </h3>
          {metrics.platformDistribution.length > 0 ? (
            <div className="space-y-3">
              {metrics.platformDistribution.map((platform, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-smart-dark-3/50">
                  <span className="text-sm text-smart-gray-light">{platform.name}</span>
                  <span className="text-sm font-bold text-white">{platform.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-smart-gray">
              {locale === 'ar' ? 'لا توجد بيانات توزيع متاحة بعد' : 'No distribution data available yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}