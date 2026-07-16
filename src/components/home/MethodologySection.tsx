'use client';

import { Shield, Search, BarChart3, FileText, Lock, Info } from 'lucide-react';
import Link from 'next/link';

interface Props {
  locale: 'en' | 'ar';
}

const sections = [
  {
    icon: Search,
    en: { title: 'What We Analyze', desc: 'Smart Land examines publicly available signals from your website including HTML structure, HTTP headers, performance metrics, accessibility attributes, security configurations, and content quality indicators.' },
    ar: { title: 'ماذا نحلل', desc: 'تفحص سمارت لاند الإشارات العامة المتاحة من موقعك بما في ذلك هيكل HTML، ورؤوس HTTP، ومقاييس الأداء، وسمات إمكانية الوصول، وتكوينات الأمان، ومؤشرات جودة المحتوى.' }
  },
  {
    icon: BarChart3,
    en: { title: 'Signals Measured', desc: 'We measure over 100 individual signals across six categories. Each signal is verified where possible through direct observation of the public website.' },
    ar: { title: 'الإشارات المقاسة', desc: 'نقيس أكثر من 100 إشارة فردية عبر ست فئات. يتم التحقق من كل إشارة حيثما أمكن من خلال الملاحظة المباشرة للموقع العام.' }
  },
  {
    icon: Info,
    en: { title: 'Verified Data vs. Inferred Insights', desc: 'Where possible, Smart Land directly observes and verifies data from the public website. Some insights are inferred based on established best practices and industry standards. We clearly label which is which.' },
    ar: { title: 'البيانات المؤكدة مقابل الرؤى المستنتجة', desc: 'حيثما أمكن، تراقب سمارت لاند وتتحقق من البيانات مباشرة من الموقع العام. بعض الرؤى تستنتج بناءً على أفضل الممارسات المعتمدة ومعايير الصناعة. نصنف بوضوح أيها هو أيها.' }
  },
  {
    icon: FileText,
    en: { title: 'How Scoring Works', desc: 'Each category is scored from 0-100 based on the proportion of positive signals detected. The overall score is a weighted average. Every deduction is traceable to specific evidence.' },
    ar: { title: 'كيف تعمل آلية التسجيل', desc: 'يتم تسجيل كل فئة من 0-100 بناءً على نسبة الإشارات الإيجابية المكتشفة. النتيجة الإجمالية هي متوسط مرجح. كل خصم يمكن تتبعه إلى دليل محدد.' }
  },
  {
    icon: Lock,
    en: { title: 'Data Limitations', desc: 'Smart Land analyzes only publicly available data. We cannot access password-protected pages, internal systems, or private analytics. Results reflect the state of the analyzed URL at the time of analysis.' },
    ar: { title: 'حدود البيانات', desc: 'تحلل سمارت لاند البيانات العامة المتاحة فقط. لا يمكننا الوصول إلى الصفحات المحمية بكلمة مرور أو الأنظمة الداخلية أو التحليلات الخاصة. تعكس النتائج حالة الرابط المحلل وقت التحليل.' }
  },
  {
    icon: Shield,
    en: { title: 'Privacy Principles', desc: 'We only analyze URLs you submit. We do not store personal data. Analysis results are stored securely and can be deleted at your request. We do not share your data with third parties.' },
    ar: { title: 'مبادئ الخصوصية', desc: 'نقوم فقط بتحليل الروابط التي ترسلها. لا نخزن بيانات شخصية. يتم تخزين نتائج التحليل بشكل آمن ويمكن حذفها بناءً على طلبك. لا نشارك بياناتك مع أطراف ثالثة.' }
  },
];

export function MethodologySection({ locale }: Props) {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-smart-black to-smart-dark" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold gold-gradient-text mb-4">
            {locale === 'ar' ? 'المنهجية والثقة' : 'Methodology & Trust'}
          </h2>
          <p className="text-smart-gray-light text-lg max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'كيف تقوم سمارت لاند بتحليل وتقييم الحضور الرقمي'
              : 'How Smart Land analyzes and scores digital presence'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="glass-card rounded-xl p-6 hover:border-smart-gold/30 transition-all">
                <div className="w-12 h-12 rounded-lg bg-smart-dark-3 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-smart-gold" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {locale === 'ar' ? section.ar.title : section.en.title}
                </h3>
                <p className="text-sm text-smart-gray leading-relaxed">
                  {locale === 'ar' ? section.ar.desc : section.en.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/methodology"
            className="btn-gold-outline inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm"
          >
            {locale === 'ar' ? 'اعرف المزيد عن منهجيتنا' : 'Learn More About Our Methodology'}
          </Link>
        </div>
      </div>
    </section>
  );
}