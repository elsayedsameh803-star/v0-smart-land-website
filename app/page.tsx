"use client"

import { useState } from "react"
import { exportAnalysisPDF } from "@/lib/pdf-export"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [contactSent, setContactSent] = useState(false)

  const handleAnalyze = async () => {
    if (!url) return
    setLoading(true)
    setTimeout(() => {
      setResults({
        score: 85,
        metrics: [
          { label: "سرعة الموقع", value: "92%" },
          { label: "SEO", value: "88%" },
          { label: "الأمان", value: "95%" },
        ],
        issues: [
          { type: "warning", message: "صور كبيرة الحجم" },
          { type: "info", message: "ممكن تحسين الـ Meta Tags" },
        ],
        recommendations: ["ضغط الصور", "تحسين العناوين"],
      })
      setLoading(false)
    }, 2000)
  }

  const handlePDF = () => {
    if (!results) return
    exportAnalysisPDF({
      title: "تحليل الموقع",
      date: new Date().toLocaleDateString("ar-SA"),
      score: results.score,
      metrics: results.metrics,
      issues: results.issues,
      recommendations: results.recommendations,
    })
  }

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSent(true)
    setTimeout(() => setContactSent(false), 3000)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#2a2a35] bg-[#0a0a0f]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
              <circle cx="20" cy="20" r="18" stroke="#d4af37" strokeWidth="2" />
              <path d="M12 24L18 16L22 20L28 12" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="28" cy="12" r="2.5" fill="#d4af37" />
            </svg>
            <div>
              <span className="text-lg font-bold text-[#d4af37]">SMART LAND</span>
              <span className="block text-[9px] text-gray-400 -mt-1 tracking-widest">ANALYTICS</span>
            </div>
          </div>
          <div className="flex gap-5 text-sm">
            <button onClick={() => scrollTo("about")} className="text-gray-400 hover:text-[#d4af37] transition-colors">من نحن</button>
            <button onClick={() => scrollTo("contact")} className="text-gray-400 hover:text-[#d4af37] transition-colors">اتصل بينا</button>
            <button onClick={() => scrollTo("privacy")} className="text-gray-400 hover:text-[#d4af37] transition-colors">سياسة الخصوصية</button>
          </div>
        </div>
      </nav>

      {/* ===== HERO / ANALYSIS ===== */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            منصة <span className="text-[#d4af37]">سمارت لاند</span> للتحليل الذكي
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            حلل موقعك أو حساباتك على السوشيال ميديا واطلع تقرير احترافي في ثواني
          </p>

          <div className="relative max-w-xl mx-auto mb-8">
            <input
              type="url"
              placeholder="أدخل رابط الموقع أو الحساب..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-5 py-4 bg-[#1a1a25] border border-[#2a2a35] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-all text-right"
              dir="rtl"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔗</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="px-10 py-4 bg-linear-to-r from-[#d4af37] to-[#b8960f] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? "⏳ جاري التحليل..." : "🚀 ابدأ التحليل الآن"}
          </button>

          {results && (
            <button
              onClick={handlePDF}
              className="mt-4 block mx-auto px-8 py-3 border-2 border-[#d4af37] text-[#d4af37] font-semibold rounded-xl hover:bg-[#d4af37] hover:text-black transition-all"
            >
              📄 تحميل تقرير PDF
            </button>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#d4af37] mb-2">{results.score}%</div>
                <div className="text-gray-400">النتيجة العامة</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {results.metrics.map((m: any, i: number) => (
                  <div key={i} className="bg-[#1a1a25] rounded-xl p-4 text-center border border-[#2a2a35]">
                    <div className="text-[#d4af37] font-bold text-xl">{m.value}</div>
                    <div className="text-gray-400 text-sm">{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>الملاحظات
                </h3>
                <div className="space-y-3">
                  {results.issues.map((issue: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-[#1a1a25] rounded-lg p-4 border-r-2 border-yellow-500">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">{issue.type === "warning" ? "تحذير" : "معلومة"}</span>
                      <span className="text-gray-300 text-sm">{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>التوصيات
                </h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-[#1a1a25] rounded-lg p-4">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className="text-gray-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="py-16 px-4 border-t border-[#2a2a35]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-6 text-center">من نحن</h2>
          <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-8 space-y-6">
            <p className="text-gray-300 leading-relaxed">
              سمارت لاند هي منصة تحليل ذكية متخصصة في تقييم أداء المواقع الإلكترونية وحسابات السوشيال ميديا باستخدام أحدث تقنيات الذكاء الاصطناعي.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1a1a25] rounded-xl p-4 text-center border border-[#2a2a35]">
                <div className="text-[#d4af37] text-2xl font-bold">10K+</div>
                <div className="text-gray-400 text-sm">عميل</div>
              </div>
              <div className="bg-[#1a1a25] rounded-xl p-4 text-center border border-[#2a2a35]">
                <div className="text-[#d4af37] text-2xl font-bold">50K+</div>
                <div className="text-gray-400 text-sm">تقرير</div>
              </div>
              <div className="bg-[#1a1a25] rounded-xl p-4 text-center border border-[#2a2a35]">
                <div className="text-[#d4af37] text-2xl font-bold">7</div>
                <div className="text-gray-400 text-sm">لغات</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-16 px-4 border-t border-[#2a2a35]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-2 text-center">اتصل بينا</h2>
          <p className="text-gray-400 text-center mb-10">نحن هنا لمساعدتك</p>

          <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-8">
            <form onSubmit={handleContact} className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">الاسم</label>
                <input type="text" required className="w-full px-4 py-3 bg-[#1a1a25] border border-[#2a2a35] rounded-xl text-white focus:outline-none focus:border-[#d4af37]" dir="rtl" />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">البريد الإلكتروني</label>
                <input type="email" required className="w-full px-4 py-3 bg-[#1a1a25] border border-[#2a2a35] rounded-xl text-white focus:outline-none focus:border-[#d4af37]" dir="rtl" />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">الرسالة</label>
                <textarea rows={5} required className="w-full px-4 py-3 bg-[#1a1a25] border border-[#2a2a35] rounded-xl text-white focus:outline-none focus:border-[#d4af37] resize-none" dir="rtl"></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-linear-to-r from-[#d4af37] to-[#b8960f] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#d4af37]/30">
                {contactSent ? "✓ تم الإرسال" : "إرسال الرسالة"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#2a2a35] grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a1a25] rounded-lg flex items-center justify-center text-[#d4af37]">📧</div>
                <div><div className="text-sm text-gray-400">البريد</div><div className="text-white">info@smartland.com</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a1a25] rounded-lg flex items-center justify-center text-[#d4af37]">📍</div>
                <div><div className="text-sm text-gray-400">الموقع</div><div className="text-white">القاهرة، مصر</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRIVACY ===== */}
      <section id="privacy" className="py-16 px-4 border-t border-[#2a2a35]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-6 text-center">سياسة الخصوصية</h2>
          <div className="bg-[#111118] border border-[#2a2a35] rounded-2xl p-8 space-y-6 text-gray-300 leading-relaxed">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">1. جمع المعلومات</h3>
              <p>نقوم بجمع المعلومات التي تقدمها لنا طوعاً عند استخدام المنصة. لا نجمع معلومات شخصية حساسة.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">2. استخدام المعلومات</h3>
              <p>نستخدم المعلومات لتقديم خدمات التحليل وإنشاء التقارير فقط. لا نبيع أو نشارك بياناتك.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">3. ملفات Cookies</h3>
              <p>قد نستخدم ملفات Cookies لتحسين تجربة المستخدم وتحليل حركة المرور.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">4. حماية البيانات</h3>
              <p>نستخدم تقنيات تشفير حديثة لحماية بياناتك. جميع التحليلات تتم بشكل آمن.</p>
            </div>
            <div className="pt-4 text-sm text-gray-500 border-t border-[#2a2a35]">
              آخر تحديث: {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0a0a0f] border-t border-[#2a2a35] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#d4af37] font-bold">SMART LAND</span>
            <span className="text-gray-500 text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => scrollTo("about")} className="text-gray-400 hover:text-[#d4af37] transition-colors">من نحن</button>
            <button onClick={() => scrollTo("contact")} className="text-gray-400 hover:text-[#d4af37] transition-colors">اتصل بينا</button>
            <button onClick={() => scrollTo("privacy")} className="text-gray-400 hover:text-[#d4af37] transition-colors">سياسة الخصوصية</button>
          </div>
        </div>
      </footer>
    </div>
  )
}