"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { getUserSettings, updateUserSettings, applyUserLanguage, applyUserTheme } from "@/lib/settings";
import { usePathname } from "next/navigation";
import { ArrowLeft, Globe, Moon, SunMedium, ShieldCheck, Bell, FileText, Lock, User, Settings2, Save, RotateCcw, Trash2 } from "lucide-react";

const tabs = [
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "analysis", label: "Analysis" },
  { id: "privacy", label: "Privacy" },
];

const levelOptions = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

export default function SettingsPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale;
  const isRtl = locale === "ar";
  const [currentTab, setCurrentTab] = useState("account");
  const [settings, setSettings] = useState(getUserSettings());
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settings.language) applyUserLanguage(settings.language);
    if (settings.theme) applyUserTheme(settings.theme);
  }, []);

  const handleChange = (partial: Partial<typeof settings>) => {
    setSettings((current) => {
      const next = { ...current, ...partial };
      setIsDirty(true);
      return next;
    });
  };

  const handleNested = (key: keyof typeof settings, value: any) => {
    setSettings((current) => {
      const next = { ...current, [key]: value } as typeof settings;
      setIsDirty(true);
      return next;
    });
  };

  const handleSave = () => {
    const savedSettings = updateUserSettings(settings);
    setSettings(savedSettings);
    setSaved(true);
    setIsDirty(false);
    applyUserTheme(savedSettings.theme);
    applyUserLanguage(savedSettings.language);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ];

  const themeOptions = [
    { value: "system", label: locale === "ar" ? "نظام الجهاز" : "System" },
    { value: "dark", label: locale === "ar" ? "داكن" : "Dark" },
    { value: "light", label: locale === "ar" ? "فاتح" : "Light" },
  ];

  const accountEmail = settings.account.email || "user@example.com";
  const accountName = settings.account.name || (locale === "ar" ? "مستخدم سمارت لاند" : "Smart Land User");

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-dark-950 text-gold-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold-300/80">{locale === "ar" ? "الإعدادات" : "Settings"}</p>
            <h1 className="text-3xl font-bold text-white mt-2">{locale === "ar" ? "لوحة إعدادات حسابك" : "Your Settings Dashboard"}</h1>
            <p className="mt-2 text-dark-400 max-w-2xl">{locale === "ar" ? "قم بضبط حسابك، الإشعارات، الخصوصية، المظهر والميزات من مكان واحد." : "Manage your account, notifications, privacy, appearance and analysis preferences in one secure place."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => router.push(`/${locale}`)} leftIcon={<ArrowLeft className="w-4 h-4" />}>{locale === "ar" ? "العودة" : "Back Home"}</Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />} disabled={!isDirty}>{locale === "ar" ? "حفظ التغييرات" : "Save Changes"}</Button>
            <Button variant="outline" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>{locale === "ar" ? "إعادة ضبط" : "Reset"}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-4">
            <Card className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/25"><User className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-dark-300">{accountName}</p>
                  <p className="text-xs text-dark-500">{accountEmail}</p>
                </div>
              </div>
              <div className="grid gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`w-full text-start rounded-2xl px-4 py-3 transition-all duration-200 ${currentTab === tab.id ? "bg-gold-500/10 border border-gold-500/30 text-gold-200" : "bg-dark-900 border border-dark-700 text-dark-300 hover:border-gold-500/20 hover:text-gold-200"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </Card>
            <Card className="p-4 space-y-3">
              <h2 className="text-lg font-semibold text-gold-300">{locale === "ar" ? "نصيحة" : "Tip"}</h2>
              <p className="text-sm text-dark-400">{locale === "ar" ? "استخدم هذه الصفحة لإدارة إعداداتك بشكل آمن ومخصص. أي تغيير في اللغة أو المظهر سيطبّق على الموقع بالكامل." : "Use this page to manage your settings securely and with full persistence. Language and theme changes apply across the site."}</p>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>{tabs.find((tab) => tab.id === currentTab)?.label}</CardTitle>
                <CardDescription>{locale === "ar" ? "قم بتحديث الخيارات التالية لتخصيص تجربتك." : "Update the options below to tailor your experience."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentTab === "account" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        id="account-name"
                        label={locale === "ar" ? "الاسم" : "Full Name"}
                        value={settings.account.name}
                        onChange={(e) => handleNested("account", { ...settings.account, name: e.target.value })}
                      />
                      <Input
                        id="account-email"
                        label={locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
                        type="email"
                        value={settings.account.email}
                        onChange={(e) => handleNested("account", { ...settings.account, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gold-300">{locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}</label>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-3 text-sm text-gold-200 hover:bg-gold-500/10 transition" onClick={() => alert(locale === "ar" ? "يتم تنفيذ تغيير كلمة المرور عبر النظام الأمني." : "Password change flow is handled securely.")}>{locale === "ar" ? "اضغط للتغيير" : "Open password flow"}</button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gold-300">{locale === "ar" ? "تسجيل الخروج من جميع الأجهزة" : "Sign out from all devices"}</label>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-dark-900 border border-red-500/20 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition" onClick={() => alert(locale === "ar" ? "ستتم إزالة جلساتك من جميع الأجهزة عند تنفيذ الخروج الآمن." : "Your sessions will be cleared from all devices in a secure implementation.")}>{locale === "ar" ? "تسجيل الخروج من الجميع" : "Sign out everywhere"}</button>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-dark-900 border border-red-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-red-400" />
                        <p className="text-sm font-semibold text-white">{locale === "ar" ? "حذف الحساب" : "Delete Account"}</p>
                      </div>
                      <p className="mt-2 text-sm text-dark-400">{locale === "ar" ? "يؤدي هذا إلى حذف بياناتك الشخصية وإعداداتك. تأكد من اتخاذ نسخة احتياطية إذا كنت بحاجة." : "This will remove your user settings and personal account data. Make sure you back up anything needed."}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button variant="danger" onClick={() => confirm(locale === "ar" ? "هل أنت متأكد من حذف الحساب نهائياً؟" : "Are you sure you want to delete your account permanently?") && handleReset()}>{locale === "ar" ? "حذف الحساب" : "Delete Account"}</Button>
                        <Button variant="outline" onClick={() => alert(locale === "ar" ? "لن يتم حذف الحساب الآن. يمكنك إكمال ذلك لاحقًا." : "Account deletion is not performed without your confirmation." )}>{locale === "ar" ? "إلغاء" : "Cancel"}</Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === "appearance" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <label htmlFor="language" className="block text-sm font-medium text-gold-300">{locale === "ar" ? "اللغة" : "Language"}</label>
                        <select
                          id="language"
                          value={settings.language}
                          onChange={(e) => handleChange({ language: e.target.value as "en" | "ar" })}
                          className="w-full rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                        >
                          {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="theme" className="block text-sm font-medium text-gold-300">{locale === "ar" ? "الثيم" : "Theme"}</label>
                        <select
                          id="theme"
                          value={settings.theme}
                          onChange={(e) => handleChange({ theme: e.target.value as any })}
                          className="w-full rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                        >
                          {themeOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
                        <p className="text-sm font-semibold text-gold-200 mb-2">{locale === "ar" ? "RTL/ LTR" : "RTL / LTR"}</p>
                        <p className="text-sm text-dark-400">{locale === "ar" ? "سيتم تطبيق اتجاه اللغة تلقائيًا بناءً على اختيار اللغة." : "Direction is applied automatically based on language selection."}</p>
                      </div>
                      <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
                        <p className="text-sm font-semibold text-gold-200 mb-2">{locale === "ar" ? "تطبيق شامل" : "Global application"}</p>
                        <p className="text-sm text-dark-400">{locale === "ar" ? "الإعدادات تطبق على كامل الموقع وليس الصفحة فقط." : "Settings apply across the entire site, not just this page."}</p>
                      </div>
                      <div className="rounded-2xl bg-dark-900 border border-gold-500/10 p-4">
                        <p className="text-sm font-semibold text-gold-200 mb-2">{locale === "ar" ? "حفظ تلقائي" : "Auto save"}</p>
                        <p className="text-sm text-dark-400">{locale === "ar" ? "حفظ الإعدادات يتم عند الضغط على زر الحفظ وسيبقى بعد تحديث الصفحة." : "Settings persist after saving and survive page refresh."}</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Switch
                        label={locale === "ar" ? "إشعارات إتمام التحليل" : "Analysis Complete Notifications"}
                        checked={settings.notifications.analysisComplete}
                        onChange={(e) => handleNested("notifications", { ...settings.notifications, analysisComplete: e.target.checked })}
                      />
                      <Switch
                        label={locale === "ar" ? "إشعارات التقارير" : "Report Notifications"}
                        checked={settings.notifications.reports}
                        onChange={(e) => handleNested("notifications", { ...settings.notifications, reports: e.target.checked })}
                      />
                      <Switch
                        label={locale === "ar" ? "إشعارات الحساب" : "Account Notifications"}
                        checked={settings.notifications.account}
                        onChange={(e) => handleNested("notifications", { ...settings.notifications, account: e.target.checked })}
                      />
                      <Switch
                        label={locale === "ar" ? "إشعارات العروض والتحديثات" : "Offers & Updates Notifications"}
                        checked={settings.notifications.offers}
                        onChange={(e) => handleNested("notifications", { ...settings.notifications, offers: e.target.checked })}
                      />
                    </div>
                    <p className="text-sm text-dark-400">{locale === "ar" ? "سيتم استخدام إعدادات الإشعارات هذه في واجهة الإشعارات وفي نظام الإبلاغ في التطبيق." : "These notification preferences are used by the app notification system and persist across sessions."}</p>
                  </div>
                )}

                {currentTab === "analysis" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Switch
                        label={locale === "ar" ? "حفظ التحليلات السابقة" : "Save previous analyses"}
                        checked={settings.analysis.saveHistory}
                        onChange={(e) => handleNested("analysis", { ...settings.analysis, saveHistory: e.target.checked })}
                      />
                      <Switch
                        label={locale === "ar" ? "الاحتفاظ بتاريخ التحليلات" : "Keep analysis history"}
                        checked={settings.analysis.keepHistory}
                        onChange={(e) => handleNested("analysis", { ...settings.analysis, keepHistory: e.target.checked })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gold-300">{locale === "ar" ? "مستوى تفاصيل التقرير" : "Report detail level"}</label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {levelOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleNested("analysis", { ...settings.analysis, detailLevel: option.value as any })}
                            className={`rounded-2xl border p-4 text-sm text-left transition ${settings.analysis.detailLevel === option.value ? "border-gold-500 bg-gold-500/10 text-gold-100" : "border-dark-700 bg-dark-900 text-dark-300 hover:border-gold-500/20 hover:bg-gold-500/5"}`}
                          >
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-xs text-dark-500">{locale === "ar" ? "خيارات مستوى التفاصيل" : "Detail level preference"}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Switch
                        label={locale === "ar" ? "إعدادات PDF" : "PDF settings"}
                        checked={settings.analysis.pdf.includeFindings}
                        onChange={(e) => handleNested("analysis", { ...settings.analysis, pdf: { ...settings.analysis.pdf, includeFindings: e.target.checked } })}
                        helperText={locale === "ar" ? "تشمل النتائج في تقرير PDF" : "Include findings in exported PDF reports."}
                      />
                      <Switch
                        label={locale === "ar" ? "إظهار الأقسام الهامة فقط" : "Hide minor report sections"}
                        checked={settings.analysis.hideMinorSections}
                        onChange={(e) => handleNested("analysis", { ...settings.analysis, hideMinorSections: e.target.checked })}
                        helperText={locale === "ar" ? "تقليل الأقسام غير المهمة في التقرير." : "Reduce less important sections in reports."}
                      />
                    </div>
                    <p className="text-sm text-dark-400">{locale === "ar" ? "ستؤثر هذه الخيارات على كيفية حفظ التحليلات وتصدير تقارير PDF في النظام." : "These options affect how analyses are retained and how PDF reports are generated."}</p>
                  </div>
                )}

                {currentTab === "privacy" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Switch
                        label={locale === "ar" ? "تمكين تصدير بيانات الحساب" : "Allow account export"}
                        checked={settings.privacy.allowExport}
                        onChange={(e) => handleNested("privacy", { ...settings.privacy, allowExport: e.target.checked })}
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gold-300">{locale === "ar" ? "احتفاظ البيانات (يوم)" : "Data retention (days)"}</label>
                        <input
                          type="number"
                          value={settings.privacy.dataRetentionDays}
                          onChange={(e) => handleNested("privacy", { ...settings.privacy, dataRetentionDays: Number(e.target.value) || 0 })}
                          min={0}
                          className="w-full rounded-xl bg-dark-900 border border-gold-500/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                        />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gold-500/10 bg-dark-900 p-4">
                      <h3 className="text-sm font-semibold text-gold-200">{locale === "ar" ? "إدارة البيانات" : "Data management"}</h3>
                      <p className="mt-2 text-sm text-dark-400">{locale === "ar" ? "يمكنك تصدير إعدادات الحساب وبيانات التحليل المحفوظة إذا كانت متاحة." : "You can export account preferences and stored analysis data when available."}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={() => alert(locale === "ar" ? "يتم إعداد تصدير البيانات حسب النظام الحالي." : "Data export flow is prepared for the current system.")}>{locale === "ar" ? "تصدير بيانات الحساب" : "Export account data"}</Button>
                        <Button variant="danger" onClick={() => confirm(locale === "ar" ? "هل تريد حذف بياناتك؟" : "Do you want to delete your data?") && handleReset()}>{locale === "ar" ? "حذف البيانات" : "Delete data"}</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap items-center gap-3 justify-between">
                <div className="text-sm text-dark-400">{saved ? (locale === "ar" ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully") : (locale === "ar" ? "احفظ التغييرات لتطبيقها" : "Save changes to apply them")}</div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={handleSave} disabled={!isDirty}>{locale === "ar" ? "حفظ الآن" : "Save now"}</Button>
                  <Button variant="outline" onClick={handleReset}>{locale === "ar" ? "إعادة ضبط الصفحة" : "Reset page"}</Button>
                </div>
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
