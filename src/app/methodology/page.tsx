'use client';

import { Shield, Search, BarChart3, FileText, Lock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const methodologyData = [
  {
    icon: Search,
    title: 'What We Analyze',
    titleAr: 'ماذا نحلل',
    content: 'Smart Land examines publicly available signals from your website including HTML structure, HTTP headers, performance metrics, accessibility attributes, security configurations, and content quality indicators. Our analysis is based solely on data that can be observed from the public-facing version of your URL.',
    contentAr: 'تفحص سمارت لاند الإشارات العامة المتاحة من موقعك بما في ذلك هيكل HTML، ورؤوس HTTP، ومقاييس الأداء، وسمات إمكانية الوصول، وتكوينات الأمان، ومؤشرات جودة المحتوى. يعتمد تحليلنا فقط على البيانات التي يمكن ملاحظتها من النسخة العامة لموقعك.',
  },
  {
    icon: BarChart3,
    title: 'Signals Measured',
    titleAr: 'الإشارات المقاسة',
    content: 'We measure over 100 individual signals across six categories: SEO, Performance, Accessibility, Security, Content & Structure, and Technical Health. Each signal is verified where possible through direct observation of the public website. Some signals are inferred based on established best practices.',
    contentAr: 'نقيس أكثر من 100 إشارة فردية عبر ست فئات: تحسين محركات البحث، الأداء، إمكانية الوصول، الأمان، المحتوى والهيكل، والصحة التقنية. يتم التحقق من كل إشارة حيثما أمكن من خلال الملاحظة المباشرة للموقع العام. بعض الإشارات تستنتج بناءً على أفضل الممارسات المعتمدة.',
  },
  {
    icon: Info,
    title: 'Verified Data vs. Inferred Insights',
    titleAr: 'البيانات المؤكدة مقابل الرؤى المستنتجة',
    content: 'Where possible, Smart Land directly observes and verifies data from the public website. For example, we can verify the presence of meta tags, heading structure, and HTTPS configuration by examining the HTML and HTTP response. Some insights, such as performance impact assessments, are inferred based on established best practices and industry standards. We clearly label which findings are directly verified and which are inferred.',
    contentAr: 'حيثما أمكن، تراقب سمارت لاند وتتحقق من البيانات مباشرة من الموقع العام. على سبيل المثال، يمكننا التحقق من وجود العلامات التعريفية وهيكل العناوين وتكوين HTTPS من خلال فحص HTML واستجابة HTTP. بعض الرؤى، مثل تقييمات تأثير الأداء، تستنتج بناءً على أفضل الممارسات المعتمدة ومعايير الصناعة. نصنف بوضوح النتائج المؤكدة مباشرة والمستنتجة.',
  },
  {
    icon: FileText,
    title: 'How Scoring Works',
    titleAr: 'كيف تعمل آلية التسجيل',
    content: 'Each category is scored from 0 to 100 based on the proportion of positive signals detected within that category. The overall score is a weighted average of all category scores. Weights are assigned based on the relative importance of each category for overall digital health. Every score deduction is traceable to specific evidence detected during the analysis.',
    contentAr: 'يتم تسجيل كل فئة من 0 إلى 100 بناءً على نسبة الإشارات الإيجابية المكتشفة ضمن تلك الفئة. النتيجة الإجمالية هي متوسط مرجح لجميع نتائج الفئات. يتم تعيين الأوزان بناءً على الأهمية النسبية لكل فئة للصحة الرقمية العامة. كل خصم في النتيجة يمكن تتبعه إلى دليل محدد تم اكتشافه أثناء التحليل.',
  },
  {
    icon: Lock,
    title: 'Data Limitations',
    titleAr: 'حدود البيانات',
    content: 'Smart Land analyzes only publicly available data. We cannot access password-protected pages, internal systems, private analytics, or server-side configurations that are not exposed through public HTTP responses. Performance metrics are estimated based on available signals and may not reflect real-user measurements. JavaScript-rendered content may not be fully captured. Results reflect the state of the analyzed URL at the specific time of analysis.',
    contentAr: 'تحلل سمارت لاند البيانات العامة المتاحة فقط. لا يمكننا الوصول إلى الصفحات المحمية بكلمة مرور أو الأنظمة الداخلية أو التحليلات الخاصة أو تكوينات الخادم التي لا تظهر من خلال استجابات HTTP العامة. يتم تقدير مقاييس الأداء بناءً على الإشارات المتاحة وقد لا تعكس قياسات المستخدم الفعلية. قد لا يتم التقاط المحتوى المعروض بواسطة JavaScript بالكامل. تعكس النتائج حالة الرابط المحلل في الوقت المحدد للتحليل.',
  },
  {
    icon: Shield,
    title: 'Privacy Principles',
    titleAr: 'مبادئ الخصوصية',
    content: 'We only analyze URLs that you submit. We do not store personal data, passwords, or sensitive information. Analysis results are stored securely and can be deleted at your request. We do not share your analysis data with third parties. We do not sell or rent your data. Our analysis is performed in real-time and is not used for any purpose other than providing you with the audit results.',
    contentAr: 'نقوم فقط بتحليل الروابط التي ترسلها. لا نخزن بيانات شخصية أو كلمات مرور أو معلومات حساسة. يتم تخزين نتائج التحليل بشكل آمن ويمكن حذفها بناءً على طلبك. لا نشارك بيانات تحليلك مع أطراف ثالثة. لا نبيع أو نؤجر بياناتك. يتم إجراء تحليلنا في الوقت الفعلي ولا يُستخدم لأي غرض آخر غير تزويدك بنتائج التدقيق.',
  },
  {
    icon: Shield,
    title: 'Competitor Comparison Limitations',
    titleAr: 'حدود مقارنة المنافسين',
    content: 'Competitor comparisons use only publicly measurable signals. We do not have access to competitor internal systems, analytics, or private data. Results are based on available data at the time of comparison and may vary. Comparisons are intended for informational purposes and should not be considered definitive rankings.',
    contentAr: 'تستخدم مقارنات المنافسين الإشارات العامة القابلة للقياس فقط. ليس لدينا إمكانية الوصول إلى الأنظمة الداخلية للمنافسين أو التحليلات أو البيانات الخاصة. تستند النتائج إلى البيانات المتاحة وقت المقارنة وقد تختلف. المقارنات مخصصة للأغراض المعلوماتية ولا ينبغي اعتبارها تصنيفات نهائية.',
  },
];

export default function MethodologyPage() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold gold-gradient-text mb-4">
            {locale === 'ar' ? 'المنهجية والثقة' : 'Methodology & Trust'}
          </h1>
          <p className="text-lg text-smart-gray-light max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'كيف تقوم سمارت لاند بتحليل وتقييم الحضور الرقمي بشفافية وأمان'
              : 'How Smart Land transparently and securely analyzes and scores digital presence'}
          </p>
        </div>

        {/* Methodology Sections */}
        <div className="space-y-4">
          {methodologyData.map((section, i) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === i;

            return (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : i)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-smart-dark-3 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-smart-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">
                      {locale === 'ar' ? section.titleAr : section.title}
                    </h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-smart-gray" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-smart-gray" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <div className="border-t border-smart-dark-3 pt-4" />
                    <p className="text-sm text-smart-gray-light leading-relaxed">
                      {locale === 'ar' ? section.contentAr : section.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 p-8 rounded-xl border border-smart-gold/20 bg-smart-gold/5 text-center">
          <Shield className="w-12 h-12 text-smart-gold mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {locale === 'ar' ? 'موثوق وشفاف' : 'Trustworthy & Transparent'}
          </h3>
          <p className="text-sm text-smart-gray-light max-w-xl mx-auto">
            {locale === 'ar'
              ? 'سمارت لاند ملتزمة بالشفافية التامة. يتم توثيق جميع منهجيات التحليل بوضوح، وكل استنتاج يمكن تتبعه إلى أدلة محددة. نحن لا نختلق النتائج أو نستخدم توصيات عامة.'
              : 'Smart Land is committed to complete transparency. All analysis methodologies are clearly documented, and every conclusion can be traced to specific evidence. We do not fabricate results or use generic recommendations.'}
          </p>
        </div>
      </div>
    </div>
  );
}