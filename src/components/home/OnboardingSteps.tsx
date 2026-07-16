'use client';

interface Props {
  locale: 'en' | 'ar';
}

const steps = [
  { 
    icon: '🔗',
    en: { title: 'Submit your link', desc: 'Enter any public website URL to begin the analysis.' },
    ar: { title: 'أرسل الرابط', desc: 'أدخل أي رابط موقع عام لبدء التحليل.' }
  },
  { 
    icon: '🤖',
    en: { title: 'Smart Land analyzes real data', desc: 'Our AI examines available public signals across multiple dimensions.' },
    ar: { title: 'سمارت لاند تحلل البيانات الفعلية', desc: 'يقوم الذكاء الاصطناعي لدينا بفحص الإشارات العامة المتاحة عبر أبعاد متعددة.' }
  },
  { 
    icon: '📊',
    en: { title: 'Discover strengths & weaknesses', desc: 'Get a transparent breakdown with evidence for every finding.' },
    ar: { title: 'اكتشف نقاط القوة والضعف', desc: 'احصل على تحليل شفاف مع أدلة لكل نتيجة.' }
  },
  { 
    icon: '🔧',
    en: { title: 'Understand how to fix problems', desc: 'Receive actionable fix recommendations with technical examples.' },
    ar: { title: 'افهم كيفية إصلاح المشكلات', desc: 'احصل على توصيات إصلاح قابلة للتنفيذ مع أمثلة تقنية.' }
  },
  { 
    icon: '📈',
    en: { title: 'Re-analyze & measure improvement', desc: 'Track your progress over time with before/after comparisons.' },
    ar: { title: 'أعد التحليل وقياس التحسن', desc: 'تتبع تقدمك بمرور الوقت مع مقارنات قبل/بعد.' }
  },
];

export function OnboardingSteps({ locale }: Props) {
  const t = (key: 'title' | 'desc', step: typeof steps[0]) => {
    return locale === 'ar' ? step.ar[key] : step.en[key];
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-smart-dark to-smart-black" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold gold-gradient-text mb-4">
            {locale === 'ar' ? 'كيف تعمل سمارت لاند' : 'How Smart Land Works'}
          </h2>
          <p className="text-smart-gray-light text-lg max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'خمس خطوات بسيطة لتحليل حضورك الرقمي وتحسينه'
              : 'Five simple steps to analyze and improve your digital presence'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-smart-gold/40 to-transparent" />
              )}
              
              <div className="glass-card rounded-xl p-6 text-center h-full hover:border-smart-gold/30 transition-all">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-smart-dark-3 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div className="text-xs text-smart-gold font-semibold mb-2">
                  {locale === 'ar' ? `الخطوة ${i + 1}` : `Step ${i + 1}`}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {t('title', step)}
                </h3>
                <p className="text-xs text-smart-gray leading-relaxed">
                  {t('desc', step)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}