"use client";

import { usePathname } from "next/navigation";
import { Shield, Lock, Eye, FileText, AlertTriangle, CheckCircle2, Globe, Mail, UserCheck, Database, Cookie, Trash2, Share2, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your data",
    lastUpdated: "Last Updated: July 2026",
    intro: "At Smart Land, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
    section1: "1. Information We Collect",
    section1Content: "We collect information you provide directly to us: URLs you submit for analysis, and any data you enter in our contact forms (name, email, message). We also automatically collect certain technical information when you use our platform: browser type, device information, pages visited, time spent on pages, and referral sources through Google Analytics.",
    section2: "2. How We Use Your Information",
    section2Content: "We use the collected information to: provide and maintain our analysis services, improve and personalize your experience, send periodic emails regarding our services (if you opt-in), respond to your inquiries and support requests, analyze usage patterns to improve our platform, and detect and prevent fraudulent or unauthorized use.",
    section3: "3. Google Analytics",
    section3Content: "We use Google Analytics 4 (GA4) to understand how visitors interact with our platform. Google Analytics collects information such as how often users visit, what pages they visit, and what other sites they used prior to coming to our platform. Google uses the data collected to track and examine the use of our platform, to prepare reports on its activities, and to share them with other Google services. Google may use the data collected to contextualize and personalize the ads of its own advertising network. You can opt-out of Google Analytics by installing the Google Analytics opt-out browser add-on.",
    section4: "4. Cookies and Tracking Technologies",
    section4Content: "We use cookies and similar tracking technologies to track activity on our platform and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. We use the following types of cookies: Essential cookies (required for the platform to function), Analytics cookies (to understand how users interact with our platform), and Preference cookies (to remember your preferences and settings). You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
    section5: "5. Data Protection and Security",
    section5Content: "We implement appropriate technical and organizational security measures to protect your information. All data transmitted between your browser and our servers is encrypted using HTTPS/SSL. We implement security headers including HSTS, X-Content-Type-Options, and X-Frame-Options. We regularly review our data collection, storage, and processing practices to prevent unauthorized access. However, no method of transmission over the Internet or electronic storage is 100% secure.",
    section6: "6. Data Sharing and Third Parties",
    section6Content: "We do not sell, trade, or rent your personal information to third parties. We may share aggregated, non-personally identifiable information publicly and with our partners. We may share your information with third-party service providers who perform services on our behalf (e.g., Vercel for hosting, Google Analytics for analytics). These third parties have access to your information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
    section7: "7. Your Rights",
    section7Content: "Depending on your location, you may have the following rights regarding your data: Right to access - request copies of your personal data; Right to rectification - request correction of inaccurate data; Right to erasure - request deletion of your data; Right to restrict processing - request limitation of how we process your data; Right to data portability - request transfer of your data to another service; Right to object - object to our processing of your data. To exercise any of these rights, please contact us using the information below.",
    section8: "8. Data Retention",
    section8Content: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Analysis results are stored locally on your device using localStorage. We do not store analysis results on our servers. Contact form submissions are retained for a maximum of 12 months unless a longer retention period is required by law.",
    section9: "9. User Responsibility",
    section9Content: "You are responsible for maintaining the confidentiality of any account credentials and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account or device. You should not submit any URLs that contain personal or sensitive information about yourself or others.",
    section10: "10. Disclaimer of Liability",
    section10Content: "Smart Land provides analysis based on publicly available data. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the analysis results. Any reliance you place on such information is strictly at your own risk. We shall not be liable for any loss or damage arising from the use of our platform.",
    section11: "11. Intellectual Property Rights",
    section11Content: "The Smart Land platform, including its original content, features, and functionality, is owned by Smart Land and is protected by international copyright, trademark, and other intellectual property laws. The analysis results generated by our platform are provided for your personal use. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.",
    section12: "12. Contact Us About Privacy",
    section12Content: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:",
    section13: "13. Changes to This Privacy Policy",
    section13Content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.",
    contactEmail: "Email: elsayedsameh803@gmail.com",
    contactWhatsApp: "WhatsApp: 01272097150",
    agree: "By using Smart Land, you consent to our Privacy Policy and agree to its Terms of Service.",
    backToHome: "Back to Home",
  },
  ar: {
    title: "سياسة الخصوصية",
    subtitle: "كيف نجمع ونستخدم ونحمي بياناتك",
    lastUpdated: "آخر تحديث: يوليو 2026",
    intro: "في سمارت لاند، نأخذ خصوصيتك على محمل الجد. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونكشف ونحمي معلوماتك عند استخدام منصتنا.",
    section1: "1. المعلومات التي نجمعها",
    section1Content: "نجمع المعلومات التي تقدمها لنا مباشرة: الروابط التي ترسلها للتحليل، وأي بيانات تدخلها في نماذج الاتصال الخاصة بنا (الاسم، البريد الإلكتروني، الرسالة). نقوم أيضاً بجمع معلومات تقنية معينة تلقائياً عند استخدام منصتنا: نوع المتصفح، معلومات الجهاز، الصفحات التي تمت زيارتها، الوقت الذي تقضيه في الصفحات، ومصادر الإحالة من خلال Google Analytics.",
    section2: "2. كيف نستخدم معلوماتك",
    section2Content: "نستخدم المعلومات التي تم جمعها من أجل: تقديم وصيانة خدمات التحليل الخاصة بنا، تحسين وتخصيص تجربتك، إرسال رسائل بريد إلكتروني دورية حول خدماتنا (إذا اخترت الاشتراك)، الرد على استفساراتك وطلبات الدعم، تحليل أنماط الاستخدام لتحسين منصتنا، وكشف ومنع الاستخدام الاحتيالي أو غير المصرح به.",
    section3: "3. Google Analytics",
    section3Content: "نستخدم Google Analytics 4 (GA4) لفهم كيفية تفاعل الزوار مع منصتنا. يجمع Google Analytics معلومات مثل عدد مرات زيارة المستخدمين، والصفحات التي يزورونها، والمواقع الأخرى التي استخدموها قبل القدوم إلى منصتنا. تستخدم Google البيانات التي تم جمعها لتتبع وفحص استخدام منصتنا، وإعداد تقارير عن أنشطتها، ومشاركتها مع خدمات Google الأخرى. قد تستخدم Google البيانات التي تم جمعها لتحديد سياق وتخصيص إعلانات شبكتها الإعلانية الخاصة. يمكنك إلغاء الاشتراك في Google Analytics عن طريق تثبيت الوظيفة الإضافية لمتصفح Google Analytics.",
    section4: "4. ملفات تعريف الارتباط (Cookies) وتقنيات التتبع",
    section4Content: "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتتبع النشاط على منصتنا وتخزين معلومات معينة. ملفات تعريف الارتباط هي ملفات تحتوي على كمية صغيرة من البيانات قد تتضمن معرفاً فريداً مجهولاً. نستخدم الأنواع التالية من ملفات تعريف الارتباط: ملفات أساسية (ضرورية لعمل المنصة)، ملفات تحليلية (لفهم كيفية تفاعل المستخدمين مع منصتنا)، وملفات تفضيلات (لتذكر تفضيلاتك وإعداداتك). يمكنك توجيه متصفحك لرفض جميع ملفات تعريف الارتباط أو الإشارة عند إرسال ملف تعريف ارتباط.",
    section5: "5. حماية البيانات والأمان",
    section5Content: "ننفذ تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك. جميع البيانات المنقولة بين متصفحك وخوادمنا مشفرة باستخدام HTTPS/SSL. ننفذ رؤوس أمان بما في ذلك HSTS و X-Content-Type-Options و X-Frame-Options. نراجع بانتظام ممارسات جمع البيانات وتخزينها ومعالجتها لمنع الوصول غير المصرح به. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100٪.",
    section6: "6. مشاركة البيانات والأطراف الثالثة",
    section6Content: "نحن لا نبيع أو نتبادل أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك المعلومات المجمعة وغير الشخصية علناً ومع شركائنا. قد نشارك معلوماتك مع مزودي خدمات طرف ثالث الذين يؤدون خدمات نيابة عنا (مثل Vercel للاستضافة، Google Analytics للتحليلات). هؤلاء الأطراف الثالثة لديهم إمكانية الوصول إلى معلوماتك فقط لأداء هذه المهام نيابة عنا وهم ملزمون بعدم الكشف عنها أو استخدامها لأي غرض آخر.",
    section7: "7. حقوقك",
    section7Content: "اعتماداً على موقعك، قد تكون لديك الحقوق التالية فيما يتعلق ببياناتك: الحق في الوصول - طلب نسخ من بياناتك الشخصية؛ الحق في التصحيح - طلب تصحيح البيانات غير الدقيقة؛ الحق في المحو - طلب حذف بياناتك؛ الحق في تقييد المعالجة - طلب الحد من كيفية معالجة بياناتك؛ الحق في قابلية نقل البيانات - طلب نقل بياناتك إلى خدمة أخرى؛ الحق في الاعتراض - الاعتراض على معالجتنا لبياناتك. لممارسة أي من هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات أدناه.",
    section8: "8. الاحتفاظ بالبيانات",
    section8Content: "نحتفظ بمعلوماتك الشخصية فقط للمدة اللازمة لتحقيق الأغراض الموضحة في سياسة الخصوصية هذه. يتم تخزين نتائج التحليل محلياً على جهازك باستخدام localStorage. لا نخزن نتائج التحليل على خوادمنا. يتم الاحتفاظ بإرسالات نموذج الاتصال لمدة أقصاها 12 شهراً ما لم تتطلب فترة احتفاظ أطول بموجب القانون.",
    section9: "9. مسؤولية المستخدم",
    section9Content: "أنت مسؤول عن الحفاظ على سرية أي بيانات اعتماد الحساب وتقييد الوصول إلى جهازك. أنت توافق على تحمل المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك أو جهازك. يجب ألا ترسل أي روابط تحتوي على معلومات شخصية أو حساسة عن نفسك أو عن الآخرين.",
    section10: "10. إخلاء المسؤولية",
    section10Content: "تقدم سمارت لاند تحليلاً بناءً على البيانات المتاحة للجمهور. لا نقدم أي تعهدات أو ضمانات من أي نوع، صريحة أو ضمنية، حول اكتمال أو دقة أو موثوقية أو ملاءمة أو توفر نتائج التحليل. أي اعتماد تضعه على هذه المعلومات يكون على مسؤوليتك الخاصة. لا نتحمل المسؤولية عن أي خسارة أو ضرر ناشئ عن استخدام منصتنا.",
    section11: "11. حقوق الملكية الفكرية",
    section11Content: "منصة سمارت لاند، بما في ذلك محتواها الأصلي وميزاتها ووظائفها، مملوكة لسمارت لاند ومحمية بموجب قوانين حقوق النشر والعلامات التجارية والملكية الفكرية الدولية. نتائج التحليل التي تولدها منصتنا مقدمة لاستخدامك الشخصي. لا يجوز لك نسخ أو توزيع أو تعديل أو إنشاء أعمال مشتقة دون موافقتنا الخطية المسبقة.",
    section12: "12. اتصل بنا بخصوص الخصوصية",
    section12Content: "إذا كانت لديك أي أسئلة أو استفسارات أو طلبات بخصوص سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى الاتصال بنا:",
    section13: "13. التغييرات على سياسة الخصوصية هذه",
    section13Content: "قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنبلغك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ 'آخر تحديث'. يُنصح بمراجعة سياسة الخصوصية هذه بشكل دوري لأي تغييرات. التغييرات على سياسة الخصوصية هذه تصبح سارية المفعول عند نشرها على هذه الصفحة.",
    contactEmail: "البريد الإلكتروني: elsayedsameh803@gmail.com",
    contactWhatsApp: "واتساب: 01272097150",
    agree: "باستخدام سمارت لاند، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على شروط الخدمة الخاصة بنا.",
    backToHome: "العودة إلى الرئيسية",
  },
};

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const sections = [
    { icon: FileText, title: t.section1, content: t.section1Content },
    { icon: Eye, title: t.section2, content: t.section2Content },
    { icon: Globe, title: t.section3, content: t.section3Content },
    { icon: Cookie, title: t.section4, content: t.section4Content },
    { icon: Lock, title: t.section5, content: t.section5Content },
    { icon: Share2, title: t.section6, content: t.section6Content },
    { icon: UserCheck, title: t.section7, content: t.section7Content },
    { icon: Database, title: t.section8, content: t.section8Content },
    { icon: AlertTriangle, title: t.section9, content: t.section9Content },
    { icon: Shield, title: t.section10, content: t.section10Content },
    { icon: CheckCircle2, title: t.section11, content: t.section11Content },
    { icon: Mail, title: t.section12, content: t.section12Content },
    { icon: RefreshCw, title: t.section13, content: t.section13Content },
  ];

  return (
    <div className="min-h-screen bg-dark-950" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t.title}</h1>
          <p className="text-xl text-dark-300 mb-4">{t.subtitle}</p>
          <p className="text-sm text-dark-500">{t.lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Intro */}
        <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 mb-8">
          <p className="text-dark-300 leading-relaxed">{t.intro}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center shrink-0 mt-1">
                  <section.icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                  <p className="text-dark-300 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-gold-400 mt-1" />
            <div>
              <p className="text-dark-300">{t.contactEmail}</p>
              <p className="text-dark-300">{t.contactWhatsApp}</p>
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="mt-8 p-6 rounded-2xl bg-gold-500/5 border border-gold-500/20">
          <p className="text-gold-300 text-center">{t.agree}</p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}