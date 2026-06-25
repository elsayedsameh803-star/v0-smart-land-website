# دليل التطبيق الشامل - سمارت لاند

## 📌 نظرة عامة

تم تطوير منصة سمارت لاند بنجاح بمواصفات احترافية عالمية:

✅ **Dark Mode** - واجهة مظلمة احترافية  
✅ **Sass System** - نظام تنسيق منظم ومرن  
✅ **Social Icons** - أيقونات وسائل التواصل المدمجة  
✅ **APIs Integration** - تكامل مع خدمات حقيقية  
✅ **PDF Export** - تقارير احترافية متعددة اللغات  

---

## 🎨 النظام الجديد

### Dark Mode Implementation

#### ملفات Sass المرتبطة:
```
styles/sass/
├── variables/
│   ├── _colors.scss        # جميع متغيرات الألوان
│   ├── _typography.scss    # إعدادات الخطوط
│   ├── _spacing.scss       # التباعد والـ Radius
│   └── _index.scss
├── mixins/
│   └── _index.scss         # 15+ mixins مفيدة
└── utilities/
    ├── _globals.scss       # الأنماط الأساسية
    ├── _theme.scss         # متغيرات CSS العامة
    └── main.scss           # ملف الدخول
```

#### الألوان المستخدمة:

**Primary Colors:**
```scss
$color-background: #0a0a0a;     // Pure Black
$color-foreground: #ffffff;     // Pure White
$color-card: #1a1a1a;          // Dark Card
$color-card-foreground: #ffffff;
```

**Analysis Chart Colors:**
```scss
$color-blue: #3b82f6;      // Blue (Primary)
$color-green: #10b981;     // Green (Success)
$color-red: #ef4444;       // Red (Error)
$color-orange: #f97316;    // Orange (Warning)
$color-purple: #a855f7;    // Purple (Custom)
$color-yellow: #eab308;    // Yellow (Info)
$color-cyan: #06b6d4;      // Cyan (Secondary)
```

**Neutral Grays:**
```scss
$color-gray-50 to $color-gray-900   // 10 Gray Shades
```

---

## 🔧 Sass Architecture

### 1. Variables System

#### Colors (`_colors.scss`)
```scss
// Semantic Colors
$primary: $color-blue;
$secondary: $color-purple;
$success: $color-green;
$warning: $color-orange;
$error: $color-red;
$info: $color-cyan;
```

#### Typography (`_typography.scss`)
```scss
$font-primary: "Cairo", sans-serif;
$font-secondary: "Amiri", serif;
$font-mono: "Geist Mono", monospace;

$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
// ... والمزيد
```

#### Spacing (`_spacing.scss`)
```scss
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-4: 1rem;      // 16px
// ... حتى 40rem (160px)

$radius-md: 0.375rem;
$radius-lg: 0.5rem;
// ... والمزيد
```

### 2. Mixins Library

#### Flexbox Utilities
```scss
@mixin flex-center { }        // Center content
@mixin flex-between { }       // Space between
@mixin flex-start { }         // Align start
```

#### Responsive Design
```scss
@mixin respond($breakpoint) {
  // $breakpoint: "sm", "md", "lg", "xl", "2xl"
}
```

#### Text Utilities
```scss
@mixin truncate { }           // Ellipsis
@mixin line-clamp($lines) { } // Multi-line clamp
```

#### Interactive States
```scss
@mixin interactive-state($bg-color, $transition) { }
```

#### Animations
```scss
@mixin fade-in($duration, $delay) { }
@mixin slide-in-from-left($duration, $delay) { }
```

#### Accessibility
```scss
@mixin sr-only { }            // Screen reader only
@mixin focus-ring($color, $width, $offset) { }
```

---

## 📱 Social Media Integration

### Footer Component Updates

```tsx
// في components/footer.tsx

import { Youtube, Instagram, Facebook } from "lucide-react"

// الأيقونات المدعومة:
- YouTube      (lucide-react)
- Instagram    (lucide-react)
- Facebook     (lucide-react)
- Snapchat     (Custom SVG)
- TikTok       (Custom SVG)
```

### الروابط الافتراضية:
```
YouTube:   https://youtube.com/smartland
Instagram: https://instagram.com/smartland
Facebook:  https://facebook.com/smartland
Snapchat:  https://snapchat.com/add/smartland
TikTok:    https://tiktok.com/@smartland
```

**يمكن تخصيص الروابط بسهولة في الملف**

---

## 🔌 APIs Integration

### ملف الخدمات: `lib/api-services.ts`

#### 1. YouTube API
```typescript
async function fetchYouTubeStats(channelId: string): Promise<YouTubeChannelStats>

// المتطلبات:
- YOUTUBE_API_KEY

// يُرجع:
{
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  engagementRate: number;
}
```

#### 2. Instagram API
```typescript
async function fetchInstagramStats(userId: string): Promise<InstagramAccountStats>

// المتطلبات:
- INSTAGRAM_ACCESS_TOKEN

// يُرجع:
{
  followers: number;
  following: number;
  posts: number;
  engagementRate: number;
  avgLikesPerPost: number;
  avgCommentsPerPost: number;
}
```

#### 3. Facebook API
```typescript
async function fetchFacebookStats(pageId: string): Promise<FacebookPageStats>

// المتطلبات:
- FACEBOOK_ACCESS_TOKEN

// يُرجع:
{
  followers: number;
  likes: number;
  posts: number;
  engagementRate: number;
  reachLastPost: number;
}
```

#### 4. Google Analytics API
```typescript
async function fetchGoogleAnalyticsData(viewId: string): Promise<GoogleAnalyticsData>

// المتطلبات:
- GOOGLE_ANALYTICS_TOKEN
- GOOGLE_ANALYTICS_VIEW_ID

// يُرجع:
{
  totalUsers: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
}
```

#### 5. التقرير الشامل
```typescript
async function generateAnalysisReport(
  websiteUrl: string,
  channelIds?: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    analyticsViewId?: string;
  }
): Promise<AnalysisReport>
```

---

## 📄 PDF Export Improvements

### ملف المحسّن: `lib/pdf-export.ts`

#### المميزات الجديدة:

1. **دعم اللغات المتعددة**
   ```typescript
   const isArabic = data.language === "ar"
   ```

2. **جداول احترافية**
   ```typescript
   autoTable(doc, {
     head: [...],
     body: [...],
     theme: "dark",
     headStyles: { ... },
     bodyStyles: { ... }
   })
   ```

3. **التنسيق الديناميكي**
   - رأس ملون
   - محتوى منظم
   - تذييل مع ترقيم صفحات
   - فواصل صفحات تلقائية

4. **الألوان الدلالية**
   - أزرق للـ Header
   - أحمر للمشاكل
   - أخضر للتوصيات

### الاستخدام:

```typescript
import { exportAnalysisPDF } from "@/lib/pdf-export"

exportAnalysisPDF({
  title: "Website Analysis Report",
  date: new Date().toLocaleDateString("ar-EG"),
  score: 87,
  metrics: [
    { label: "SEO Score", value: "88%" },
    { label: "Performance", value: "85%" },
    // ...
  ],
  issues: [
    { type: "Error", message: "Missing alt text" },
    // ...
  ],
  recommendations: [
    "Improve Core Web Vitals",
    // ...
  ],
  language: "ar", // أو "en"
  url: "https://example.com",
  websiteName: "My Website"
})
```

---

## 🚀 Setup والتشغيل

### 1. التثبيت
```bash
cd /vercel/share/v0-project
pnpm install
```

### 2. تشغيل الخادم
```bash
pnpm dev
```

### 3. البناء للإنتاج
```bash
pnpm build
pnpm start
```

---

## 🔐 متغيرات البيئة

### الملف: `.env.local`

```env
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_instagram_token_here

# Facebook
FACEBOOK_ACCESS_TOKEN=your_facebook_token_here

# Google Analytics
GOOGLE_ANALYTICS_VIEW_ID=your_view_id_here
GOOGLE_ANALYTICS_TOKEN=your_analytics_token_here
```

### الحصول على المفاتيح:

#### YouTube
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد
3. فعّل YouTube Data API v3
4. أنشئ API Key

#### Instagram
1. اذهب إلى [Facebook Developers](https://developers.facebook.com)
2. أنشئ تطبيق جديد
3. أضف Instagram Graph API
4. أنشئ access token

#### Facebook
1. اذهب إلى [Facebook Developers](https://developers.facebook.com)
2. أنشئ تطبيق جديد
3. أضف Facebook Graph API
4. أنشئ access token للصفحة

#### Google Analytics
1. اذهب إلى [Google Analytics](https://analytics.google.com)
2. احصل على View ID
3. استخدم Google OAuth للحصول على access token

---

## 🎯 استخدام الـ Sass

### مثال 1: Component مخصص

```tsx
// في component.tsx
"use client"

import "@/styles/sass/main.scss"

export function MyComponent() {
  return (
    <div className="analysis-card">
      <h2>تحليل البيانات</h2>
      <div className="metric-row">
        <span>المقياس</span>
        <span>القيمة</span>
      </div>
    </div>
  )
}
```

### مثال 2: Tailwind مع Sass

```tsx
export function Card() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* المحتوى */}
    </div>
  )
}
```

### مثال 3: استخدام Mixins

```scss
// في ملف .scss مخصص
@use "@/styles/sass/variables" as *;
@use "@/styles/sass/mixins" as *;

.custom-button {
  @include flex-center;
  @include interactive-state($primary);
  
  @include respond("md") {
    // Responsive styles
  }
}
```

---

## ✅ اختبار الميزات

### 1. التحقق من Dark Mode
```bash
# افتح المتصفح واذهب إلى:
http://localhost:3000

# يجب أن ترى:
✓ خلفية سوداء (#0a0a0a)
✓ نص أبيض واضح
✓ أيقونات ملونة
```

### 2. اختبار الأيقونات الاجتماعية
```bash
# مرّر لأسفل الصفحة للوصول للـ Footer
# يجب أن ترى 5 أيقونات:
✓ YouTube (أحمر)
✓ Instagram (وردي)
✓ Facebook (أزرق)
✓ Snapchat (أصفر)
✓ TikTok (أسود)
```

### 3. اختبار PDF Export
```bash
# انقر على زر تحميل التقرير
# يجب أن تحصل على:
✓ ملف PDF برابط صحيح
✓ محتوى منسّق بشكل احترافي
✓ دعم اللغة العربية
```

### 4. فحص الأداء
```bash
agent-browser vitals "http://localhost:3000" --json
```

---

## 📊 بيانات الاختبار (Mock Data)

### استخدام البيانات الوهمية:

```typescript
import { getMockAnalysisReport } from "@/lib/api-services"

// احصل على تقرير بيانات وهمية
const report = getMockAnalysisReport("https://example.com")

// النتيجة:
{
  score: 87,
  metrics: { ... },
  youtube: {
    subscriberCount: 45230,
    videoCount: 287,
    viewCount: 5432100,
    engagementRate: 4.2
  },
  instagram: { ... },
  facebook: { ... },
  googleAnalytics: { ... }
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الألوان لا تظهر بشكل صحيح

**الحل:**
```bash
# تأكد من تحديث globals.css
# تحقق من:
1. @import "../styles/main.scss" موجود
2. :root { ... } بتحديث الـ CSS variables
3. مسح cache المتصفح
```

### المشكلة: الأيقونات الاجتماعية لا تظهر

**الحل:**
```bash
# تحقق من:
1. lucide-react مثبت: pnpm list lucide-react
2. الـ SVGs محفوظة بشكل صحيح
3. لا توجد أخطاء في Console
```

### المشكلة: PDF لا يُصدَّر بالعربية

**الحل:**
```bash
# تأكد من:
1. language: "ar" معيّن في البيانات
2. jspdf-autotable مثبت
3. الخطوط العربية مدعومة
```

---

## 🔄 التحديثات المستقبلية

### قريباً:
- [ ] تحليل الكلمات المفتاحية
- [ ] تقارير المنافسين
- [ ] توصيات الذكاء الاصطناعي
- [ ] إشعارات التنبيهات
- [ ] لوحة تحكم متقدمة
- [ ] تقارير مجدولة
- [ ] مشاركة التقارير

---

## 📚 المراجع والموارد

### التوثيق الرسمية:
- [Next.js Docs](https://nextjs.org/docs)
- [Sass Docs](https://sass-lang.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [YouTube API](https://developers.google.com/youtube/v3)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Google Analytics API](https://developers.google.com/analytics/devguides/reporting/core/v4)
- [jsPDF Docs](https://github.com/parallax/jsPDF)

---

## 💬 الدعم والمساعدة

### للتواصل:
- 📧 **البريد**: info@smartland.com
- 📱 **الهاتف**: +20 127 209 7150
- 🌐 **الموقع**: https://smartland.app

---

## ✨ الخلاصة

تم بناء منصة احترافية مع:
- ✅ نظام Sass متقدم وقابل للتوسع
- ✅ Dark Mode كامل مع ألوان مميزة
- ✅ أيقونات وسائل تواصل مدمجة
- ✅ تكامل APIs حقيقي
- ✅ تقارير PDF احترافية
- ✅ دعم متعدد اللغات

**الحالة: جاهز للإنتاج ✅**

---

**آخر تحديث**: 2026-06-25  
**الإصدار**: 1.0.0  
**الحالة**: ✅ نشط وآمن
