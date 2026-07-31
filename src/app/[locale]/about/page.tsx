"use client";

import { usePathname } from "next/navigation";
import { Sparkles, Shield, Target, Zap, Heart, Globe, Mail, Phone, CheckCircle2, Users, Award, BarChart3 } from "lucide-react";
import Link from "next/link";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "About Smart Land",
    subtitle: "Empowering digital teams with AI-driven evidence-based audits",
    mission: "Our Mission",
    missionDesc: "To democratize digital audit intelligence — making professional-grade website and social media analysis accessible to everyone, everywhere.",
    vision: "Our Vision",
    visionDesc: "A world where every website and social media presence can be objectively measured, understood, and continuously improved.",
    story: "Our Story",
    storyDesc: "Smart Land was born from a simple observation: most website owners and digital marketers lack access to affordable, transparent, and evidence-based digital audits. Traditional tools are either too expensive, too complex, or lack transparency in their scoring. We built Smart Land to change that — providing clear, actionable insights powered by real data analysis.",
    values: "Our Values",
    value1: "Transparency",
    value1Desc: "Every score is backed by evidence you can verify. No black boxes, no hidden metrics.",
    value2: "Accessibility",
    value2Desc: "Professional-grade analysis available to everyone, regardless of budget or technical expertise.",
    value3: "Continuous Improvement",
    value3Desc: "We help you track progress over time with re-analysis and before/after comparisons.",
    value4: "Privacy First",
    value4Desc: "We only analyze what you submit. Your data stays yours. We never share or sell your information.",
    stats: "Smart Land by the Numbers",
    stat1: "100+",
    stat1Desc: "Signals Analyzed",
    stat2: "6",
    stat2Desc: "Categories Scored",
    stat3: "99.9%",
    stat3Desc: "Uptime",
    stat4: "2",
    stat4Desc: "Languages Supported",
    team: "Our Team",
    teamDesc: "Passionate engineers, data scientists, and digital strategists dedicated to making the web better.",
    cta: "Start Your First Analysis",
    whoIsItFor: "Who Is It For?",
    for1: "Website Owners & Bloggers",
    for1Desc: "Understand your site's SEO, performance, and accessibility health.",
    for2: "Digital Marketers & SEOs",
    for2Desc: "Get data-driven recommendations to improve search rankings and user experience.",
    for3: "Agencies & Freelancers",
    for3Desc: "Generate professional audit reports for clients quickly and efficiently.",
    for4: "Developers & Tech Teams",
    for4Desc: "Identify technical issues affecting performance, security, and accessibility.",
  },
  ar: {
    title: "عن سمارت لاند",
    subtitle: "تمكين الفرق الرقمية بتدقيقات مدعومة بالذكاء الاصطناعي والأدلة",
    mission: "مهمتنا",
    missionDesc: "إضفاء الطابع الديمقراطي على ذكاء التدقيق الرقمي — جعل تحليل المواقع ووسائل التواصل الاجتماعي على المستوى الاحترافي في متناول الجميع، في كل مكان.",
    vision: "رؤيتنا",
    visionDesc: "عالم يمكن فيه قياس كل موقع إلكتروني وحضور على وسائل التواصل الاجتماعي بشكل موضوعي، وفهمه، وتحسينه باستمرار.",
    story: "قصتنا",
    storyDesc: "ولدت سمارت لاند من ملاحظة بسيطة: معظم مالكي المواقع والمسوقين الرقميين يفتقرون إلى الوصول إلى تدقيقات رقمية ميسورة التكلفة وشفافة ومبنية على الأدلة. الأدوات التقليدية إما باهظة الثمن، أو معقدة للغاية، أو تفتقر إلى الشفافية في تسجيل النتائج. بنينا سمارت لاند لتغيير ذلك — تقديم رؤى واضحة وقابلة للتنفيذ مدعومة بتحليل بيانات حقيقي.",
    values: "قيمنا",
    value1: "الشفافية",
    value1Desc: "كل نتيجة مدعومة بأدلة يمكنك التحقق منها. لا صناديق سوداء، لا مقاييس مخفية.",
    value2: "إمكانية الوصول",
    value2Desc: "تحليل على المستوى الاحترافي متاح للجميع، بغض النظر عن الميزانية أو الخبرة التقنية.",
    value3: "التحسين المستمر",
    value3Desc: "نساعدك على تتبع التقدم بمرور الوقت من خلال إعادة التحليل والمقارنات قبل/بعد.",
    value4: "الخصوصية أولاً",
    value4Desc: "نقوم فقط بتحليل ما ترسله. بياناتك تبقى ملكك. نحن لا نشارك أو نبيع معلوماتك أبداً.",
    stats: "سمارت لاند بالأرقام",
    stat1: "100+",
    stat1Desc: "إشارة تم تحليلها",
    stat2: "6",
    stat2Desc: "فئة تم تسجيلها",
    stat3: "99.9%",
    stat3Desc: "وقت التشغيل",
    stat4: "2",
    stat4Desc: "اللغات المدعومة",
    team: "فريقنا",
    teamDesc: "مهندسون شغوفون، وعلماء بيانات، واستراتيجيون رقميون مكرسون لجعل الويب أفضل.",
    cta: "ابدأ تحليلك الأول",
    whoIsItFor: "لمن هذه المنصة؟",
    for1: "أصحاب المواقع والمدونين",
    for1Desc: "افهم صحة تحسين محركات البحث والأداء وإمكانية الوصول لموقعك.",
    for2: "المسوقون الرقميون ومتخصصو SEO",
    for2Desc: "احصل على توصيات مبنية على البيانات لتحسين ترتيب البحث وتجربة المستخدم.",
    for3: "الوكالات والمستقلون",
    for3Desc: "قم بإنشاء تقارير تدقيق احترافية للعملاء بسرعة وكفاءة.",
    for4: "المطورون وفرق التقنية",
    for4Desc: "حدد المشكلات التقنية التي تؤثر على الأداء والأمان وإمكانية الوصول.",
  },
};

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  return (
    <div className="min-h-screen bg-dark-950" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gold-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/25">
            <Sparkles className="w-8 h-8 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            {t.subtitle}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold text-lg hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25 gold-glow-strong-hover"
          >
            <Zap className="w-5 h-5" />
            {t.cta}
          </Link>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
            <Target className="w-10 h-10 text-gold-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">{t.mission}</h2>
            <p className="text-dark-300 leading-relaxed">{t.missionDesc}</p>
          </div>
          <div className="p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
            <Award className="w-10 h-10 text-gold-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">{t.vision}</h2>
            <p className="text-dark-300 leading-relaxed">{t.visionDesc}</p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">{t.story}</h2>
        <p className="text-dark-300 leading-relaxed text-lg text-center">{t.storyDesc}</p>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">{t.values}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: t.value1, desc: t.value1Desc, color: "from-gold-400 to-gold-600" },
            { icon: Heart, title: t.value2, desc: t.value2Desc, color: "from-gold-500 to-gold-700" },
            { icon: BarChart3, title: t.value3, desc: t.value3Desc, color: "from-gold-400 to-gold-600" },
            { icon: CheckCircle2, title: t.value4, desc: t.value4Desc, color: "from-gold-500 to-gold-700" },
          ].map((v, i) => (
            <div key={i} className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4`}>
                <v.icon className="w-6 h-6 text-dark-950" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
              <p className="text-sm text-dark-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">{t.stats}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: t.stat1, desc: t.stat1Desc },
            { stat: t.stat2, desc: t.stat2Desc },
            { stat: t.stat3, desc: t.stat3Desc },
            { stat: t.stat4, desc: t.stat4Desc },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 text-transparent bg-clip-text">{s.stat}</p>
              <p className="text-dark-400 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who It's For */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">{t.whoIsItFor}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Globe, title: t.for1, desc: t.for1Desc },
            { icon: Target, title: t.for2, desc: t.for2Desc },
            { icon: Users, title: t.for3, desc: t.for3Desc },
            { icon: Zap, title: t.for4, desc: t.for4Desc },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 card-hover-effect">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-dark-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Users className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">{t.team}</h2>
        <p className="text-dark-300 mb-8 max-w-2xl mx-auto">{t.teamDesc}</p>
        <Link
          href={`/${locale}/contact`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
        >
          <Mail className="w-4 h-4" />
          {locale === "ar" ? "تواصل معنا" : "Contact Us"}
        </Link>
      </div>
    </div>
  );
}