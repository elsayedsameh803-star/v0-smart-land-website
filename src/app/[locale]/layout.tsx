import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/lib/i18n";
import { Toaster } from "sonner";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const dict = await getDictionary(locale);

  return (
    <div dir={dir} className="locale-wrapper">
      <Header locale={locale} dictionary={dict} />
      <main>{children}</main>
      <Footer />
      <Toaster 
        position={locale === "ar" ? "top-left" : "top-right"} 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#facc15',
            border: '1px solid rgba(234, 179, 8, 0.2)',
          },
        }}
      />
    </div>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}
