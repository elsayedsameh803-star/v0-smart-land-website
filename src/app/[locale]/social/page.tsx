import { MetaConnect } from "@/components/auth/MetaConnect";
import { TikTokConnectCard } from "@/components/analysis/TikTokConnectCard";

export const metadata = {
  title: "Facebook & Instagram Analytics",
  description:
    "Connect your Facebook account for precise Page and Instagram analytics on Smart Land.",
};

export default function SocialPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-300/80">
          {isAr ? "التحليلات الاجتماعية" : "Social Analytics"}
        </p>
        <h1 className="text-3xl font-bold text-white mt-2">
          {isAr ? "تحليلات فيسبوك وإنستجرام" : "Facebook & Instagram Analytics"}
        </h1>
        <p className="mt-2 text-dark-400 max-w-2xl">
          {isAr
            ? "اربط حساب فيسبوك لتحليل صفحاتك وحسابات إنستجرام التابعة لها بصلاحيات دقيقة."
            : "Connect your Facebook account to analyze your Pages and linked Instagram accounts with precise insights."}
        </p>

        <MetaConnect locale={locale} />
        <TikTokConnectCard locale={locale} />
      </div>
    </div>
  );
}