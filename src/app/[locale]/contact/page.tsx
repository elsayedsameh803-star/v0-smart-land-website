"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, Phone, MessageSquare, MapPin, Clock, Send, CheckCircle2, AlertCircle, Sparkles, Heart, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/constants";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Contact Us",
    subtitle: "We'd love to hear from you. Get in touch with our team.",
    name: "Your Name",
    email: "Your Email",
    subject: "Subject",
    message: "Your Message",
    send: "Send Message",
    sending: "Sending...",
    success: "Message Sent Successfully!",
    successDesc: "Thank you for reaching out. We'll get back to you within 24 hours.",
    error: "Something went wrong",
    errorDesc: "Please try again or email us directly at",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    messageRequired: "Message is required",
    messageMin: "Message must be at least 10 characters",
    contactInfo: "Contact Information",
    workingHours: "Working Hours",
    workingHoursVal: "Sunday - Thursday, 9:00 AM - 6:00 PM (GMT+2)",
    followUs: "Follow Us",
    whatsapp: "WhatsApp",
    callUs: "Call Us",
    emailUs: "Email Us",
    or: "or",
    helpCenter: "Visit our Help Center",
    helpCenterDesc: "Find answers to common questions in our FAQ section.",
    visitFaq: "Visit FAQ",
  },
  ar: {
    title: "اتصل بنا",
    subtitle: "يسعدنا التواصل معك. تواصل مع فريقنا.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "رسالتك",
    send: "إرسال الرسالة",
    sending: "جارٍ الإرسال...",
    success: "تم إرسال الرسالة بنجاح!",
    successDesc: "شكراً لتواصلك معنا. سنرد عليك خلال 24 ساعة.",
    error: "حدث خطأ ما",
    errorDesc: "يرجى المحاولة مرة أخرى أو مراسلتنا مباشرة على",
    nameRequired: "الاسم مطلوب",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
    messageRequired: "الرسالة مطلوبة",
    messageMin: "يجب أن تكون الرسالة 10 أحرف على الأقل",
    contactInfo: "معلومات التواصل",
    workingHours: "ساعات العمل",
    workingHoursVal: "الأحد - الخميس، 9:00 صباحاً - 6:00 مساءً (توقيت مصر)",
    followUs: "تابعنا",
    whatsapp: "واتساب",
    callUs: "اتصل بنا",
    emailUs: "راسلنا",
    or: "أو",
    helpCenter: "زر مركز المساعدة",
    helpCenterDesc: "اعثر على إجابات للأسئلة الشائعة في قسم الأسئلة الشائعة.",
    visitFaq: "زيارة الأسئلة الشائعة",
  },
};

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error" | "sending">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t.nameRequired;
    if (!formData.email.trim()) newErrors.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.emailInvalid;
    if (!formData.message.trim()) newErrors.message = t.messageRequired;
    else if (formData.message.trim().length < 10) newErrors.message = t.messageMin;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    
    // Send email via mailto as fallback - real implementation would use an API
    const mailtoLink = `mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(formData.subject || `Message from ${formData.name}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
    
    try {
      // Simulate send - in production, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Also open mailto as fallback
      window.open(mailtoLink, "_blank");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-dark-950" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-dark-950" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{t.title}</h1>
          <p className="text-xl text-dark-300">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <h2 className="text-lg font-bold text-white mb-6">{t.contactInfo}</h2>
              
              <div className="space-y-5">
                <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">{t.emailUs}</p>
                    <p className="text-sm text-white group-hover:text-gold-300 transition-colors">{COMPANY_INFO.email}</p>
                  </div>
                </a>

                <a href={`https://wa.me/${COMPANY_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">{t.whatsapp}</p>
                    <p className="text-sm text-white group-hover:text-emerald-300 transition-colors">{COMPANY_INFO.phone}</p>
                  </div>
                </a>

                <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">{t.callUs}</p>
                    <p className="text-sm text-white group-hover:text-blue-300 transition-colors">{COMPANY_INFO.phone}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">{t.workingHours}</p>
                    <p className="text-sm text-white">{t.workingHoursVal}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <h3 className="text-sm font-bold text-white mb-4">{t.followUs}</h3>
              <div className="flex gap-3">
                {[
                  { icon: Twitter, href: "https://twitter.com/smartland", label: "Twitter" },
                  { icon: Linkedin, href: "https://linkedin.com/company/smartland", label: "LinkedIn" },
                  { icon: Github, href: "https://github.com/smartland", label: "GitHub" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-dark-800 border border-gold-500/10 flex items-center justify-center text-dark-400 hover:text-gold-400 hover:border-gold-500/30 transition-all"
                    aria-label={s.label}>
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Help Center */}
            <div className="p-6 rounded-2xl bg-dark-800/60 border border-gold-500/10">
              <h3 className="text-sm font-bold text-white mb-2">{t.helpCenter}</h3>
              <p className="text-sm text-dark-400 mb-4">{t.helpCenterDesc}</p>
              <Link href={`/${locale}/faq`} className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                {t.visitFaq} →
              </Link>
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold group-hover:text-emerald-300 transition-colors">
                {locale === "ar" ? "تواصل معنا عبر واتساب" : "Chat with us on WhatsApp"}
              </span>
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="p-12 rounded-2xl bg-dark-800/60 border border-gold-500/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.success}</h3>
                <p className="text-dark-400 mb-6">{t.successDesc}</p>
                <button onClick={() => setStatus("idle")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all">
                  {locale === "ar" ? "إرسال رسالة أخرى" : "Send Another Message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10">
                {status === "error" && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-red-400 font-medium">{t.error}</p>
                      <p className="text-red-400/80 text-sm">{t.errorDesc} <a href={`mailto:${COMPANY_INFO.email}`} className="underline">{COMPANY_INFO.email}</a></p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">{t.name} *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-dark-900/80 border ${errors.name ? 'border-red-500' : 'border-gold-500/20'} text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all`}
                      placeholder={isRtl ? "اسمك" : "John Doe"} dir={isRtl ? "rtl" : "ltr"} />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">{t.email} *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-dark-900/80 border ${errors.email ? 'border-red-500' : 'border-gold-500/20'} text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all`}
                      placeholder="email@example.com" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-dark-300 mb-2">{t.subject}</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/80 border border-gold-500/20 text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all"
                    placeholder={isRtl ? "موضوع الرسالة" : "How can we help you?"} dir={isRtl ? "rtl" : "ltr"} />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-dark-300 mb-2">{t.message} *</label>
                  <textarea rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-dark-900/80 border ${errors.message ? 'border-red-500' : 'border-gold-500/20'} text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all resize-none`}
                    placeholder={isRtl ? "رسالتك..." : "Tell us about your project or question..."} dir={isRtl ? "rtl" : "ltr"} />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>

                <button type="submit" disabled={status === "sending"}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {status === "sending" ? (
                    <><div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" /> {t.sending}</>
                  ) : (
                    <><Send className="w-5 h-5" /> {t.send}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}