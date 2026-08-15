"use client";

import { Star, Quote, Users } from "lucide-react";

interface TestimonialsSectionProps {
  locale: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "TESTIMONIALS",
    title: "Loved by Digital Teams Worldwide",
    subtitle: "See how Smart Land helps businesses and creators improve their digital presence",
    name1: "Sarah Ahmed",
    role1: "Digital Marketing Manager",
    company1: "TechNova",
    text1: "Smart Land completely transformed how we audit our digital presence. The detailed analysis helped us improve our website score from 62 to 91 in just 3 months. The evidence-based findings made it easy to prioritize fixes.",
    name2: "Mohamed El-Sayed",
    role2: "Content Creator",
    company2: "YouTube & Instagram",
    text2: "As a content creator, I needed to understand why my engagement was low. Smart Land's social media analysis gave me clear, actionable insights. My engagement rate doubled within 6 weeks of following their recommendations.",
    name3: "Layla Hassan",
    role3: "E-commerce Founder",
    company3: "Layla Store",
    text3: "The competitor comparison feature is a game-changer. I can now see exactly where I stand against my competitors and what I need to do to get ahead. Worth every penny!",
    name4: "Omar Farouk",
    role4: "SEO Specialist",
    company4: "Digital Agency",
    text4: "I've tried many audit tools, but Smart Land is the most comprehensive and accurate. The technical depth is impressive - from security headers to structured data. My clients love the professional PDF reports.",
    name5: "Nour Ibrahim",
    role5: "Startup Founder",
    company5: "NourTech",
    text5: "The real-time analysis and instant recommendations saved us weeks of manual auditing. Smart Land identified critical security issues we didn't even know existed. Highly recommended!",
    name6: "Ahmed Khalil",
    role6: "Social Media Manager",
    company6: "BrandBoost",
    text6: "Managing multiple client accounts across different platforms was chaotic. Smart Land's unified analysis dashboard makes it effortless. The unique insights per platform are incredibly valuable.",
    verified: "Verified User",
    rating: "5.0",
    totalReviews: "2,500+",
    reviewsLabel: "reviews from verified users",
  },
  ar: {
    badge: "آراء العملاء",
    title: "محبوب من فرق رقمية حول العالم",
    subtitle: "شاهد كيف تساعد سمارت لاند الشركات وصناع المحتوى في تحسين حضورهم الرقمي",
    name1: "سارة أحمد",
    role1: "مديرة التسويق الرقمي",
    company1: "TechNova",
    text1: "سمارت لاند غيرت تماماً طريقة تدقيق حضورنا الرقمي. التحليل المفصل ساعدنا في تحسين درجة موقعنا من 62 إلى 91 في 3 أشهر فقط. النتائج القائمة على الأدلة جعلت تحديد الأولويات سهلاً.",
    name2: "محمد السيد",
    role2: "صانع محتوى",
    company2: "يوتيوب وإنستغرام",
    text2: "كصانع محتوى، كنت بحاجة لفهم سبب انخفاض تفاعلي. تحليل سمارت لاند للسوشيال ميديا أعطاني رؤى واضحة وقابلة للتنفيذ. تضاعف معدل تفاعلي خلال 6 أسابيع من اتباع توصياتهم.",
    name3: "ليلى حسن",
    role3: "مؤسسة متجر إلكتروني",
    company3: "Layla Store",
    text3: "ميزة مقارنة المنافسين تغير قواعد اللعبة. الآن أستطيع رؤية موقفي بالضبط مقابل منافسي وما أحتاج فعله للتفوق. تستحق كل قرش!",
    name4: "عمر فاروق",
    role4: "أخصائي SEO",
    company4: "وكالة رقمية",
    text4: "جربت العديد من أدوات التدقيق، لكن سمارت لاند هي الأكثر شمولاً ودقة. العمق التقني مذهل - من رؤوس الأمان إلى البيانات المنظمة. عملائي يحبون تقارير PDF الاحترافية.",
    name5: "نور إبراهيم",
    role5: "مؤسس شركة ناشئة",
    company5: "NourTech",
    text5: "التحليل الفوري والتوصيات الفورية وفرت علينا أسابيع من التدقيق اليدوي. سمارت لاند حددت مشاكل أمنية حرجة لم نكن نعرف بوجودها. أنصح به بشدة!",
    name6: "أحمد خليل",
    role6: "مدير سوشيال ميديا",
    company6: "BrandBoost",
    text6: "إدارة حسابات عملاء متعددة عبر منصات مختلفة كانت فوضوية. لوحة تحليل سمارت لاند الموحدة تجعلها سهلة. الرؤى الفريدة لكل منصة قيمة بشكل لا يصدق.",
    verified: "مستخدم موثق",
    rating: "5.0",
    totalReviews: "2,500+",
    reviewsLabel: "تقييم من مستخدمين موثقين",
  },
};

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const testimonials = [
    { name: t.name1, role: t.role1, company: t.company1, text: t.text1, initials: "SA" },
    { name: t.name2, role: t.role2, company: t.company2, text: t.text2, initials: "ME" },
    { name: t.name3, role: t.role3, company: t.company3, text: t.text3, initials: "LH" },
    { name: t.name4, role: t.role4, company: t.company4, text: t.text4, initials: "OF" },
    { name: t.name5, role: t.role5, company: t.company5, text: t.text5, initials: "NI" },
    { name: t.name6, role: t.role6, company: t.company6, text: t.text6, initials: "AK" },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Users className="w-4 h-4 text-gold-400" />
            <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
              {t.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* Rating summary */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold-400 fill-gold-400" />
              ))}
            </div>
            <span className="text-gold-300 font-bold text-lg">{t.rating}</span>
            <span className="text-dark-400 text-sm">
              {t.totalReviews} {t.reviewsLabel}
            </span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10 shadow-lg hover:shadow-gold-500/10 transition-all duration-300 hover:-translate-y-2 gold-glow-hover card-hover-effect"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-gold-500/20" />

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-dark-300 text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-sm shadow-lg shadow-gold-500/20">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-dark-400 text-xs">{testimonial.role} · {testimonial.company}</p>
                  <p className="text-gold-500/70 text-xs mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    {t.verified}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}