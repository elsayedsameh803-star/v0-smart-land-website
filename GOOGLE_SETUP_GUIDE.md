# دليل إعداد Google Analytics و Search Console
# Google Analytics & Search Console Setup Guide

## العربية 🇸🇦

### 1. إضافة Google Analytics

#### الخطوة 1: إنشاء حساب Google Analytics
1. اذهب إلى [Google Analytics](https://analytics.google.com)
2. انقر على "Create Account" (إنشاء حساب جديد)
3. أدخل تفاصيل الموقع الخاص بك

#### الخطوة 2: الحصول على Measurement ID
1. بعد إنشاء الحساب، انقر على "Admin" (الإدارة)
2. اختر "Property" (الممتلكات) من العمود الأيسر
3. اذهب إلى "Data Streams" (مسارات البيانات)
4. انقر على موقعك الويب
5. انسخ "Measurement ID" (معرف القياس) - يبدأ بـ G-

#### الخطوة 3: إضافة متغير البيئة
1. أنشئ ملف `.env.local` في جذر المشروع
2. أضف السطر التالي:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
3. استبدل `G-XXXXXXXXXX` بـ Measurement ID الخاص بك

### 2. إضافة Google Search Console

#### الخطوة 1: التحقق من الموقع
1. اذهب إلى [Google Search Console](https://search.google.com/search-console)
2. انقر على "Add Property" (إضافة ممتلكات)
3. أدخل عنوان موقعك

#### الخطوة 2: اختيار طريقة التحقق
- الطريقة الموصى بها: عنصر DNS أو ملف تحميل
- الطريقة المستخدمة هنا: Meta Tag (عنصر Meta)

#### الخطوة 3: الحصول على رمز التحقق
1. اختر "HTML Tag" من خيارات التحقق
2. انسخ السمة `content` من الكود المعطى
3. استخدم القيمة في ملف `layout.tsx`

#### الخطوة 4: تحديث ملف layout
في ملف `/app/layout.tsx`، أضف:
```tsx
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
```

استبدل `YOUR_VERIFICATION_CODE_HERE` برمز التحقق من Search Console

### 3. تتبع الأحداث المخصصة

يمكنك تتبع أحداث معينة باستخدام الدالات المتاحة في `lib/google-analytics.ts`:

```typescript
import { trackEvent, trackPDFDownload, trackAnalysisSubmit } from '@/lib/google-analytics'

// تتبع تحميل PDF
trackPDFDownload('report_2024.pdf', 'ar')

// تتبع تقديم التحليل
trackAnalysisSubmit('example.com', 'website_analysis')

// تتبع حدث مخصص
trackEvent('custom_event', {
  user_action: 'value',
  timestamp: new Date().toISOString(),
})
```

### 4. التحقق من التثبيت

1. افتح موقعك في المتصفح
2. افتح Developer Tools (F12 أو Ctrl+Shift+I)
3. انقر على Network أو Console
4. ابحث عن طلبات `google-analytics` أو `gtag`
5. تأكد من أن الطلبات تُرسل بنجاح

---

## English 🇬🇧

### 1. Setting up Google Analytics

#### Step 1: Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Create Account"
3. Enter your website details

#### Step 2: Get Measurement ID
1. After account creation, click "Admin"
2. Select "Property" from the left column
3. Go to "Data Streams"
4. Click on your website property
5. Copy "Measurement ID" (starts with G-)

#### Step 3: Add Environment Variable
1. Create `.env.local` file in the root directory
2. Add:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
3. Replace `G-XXXXXXXXXX` with your Measurement ID

### 2. Setting up Google Search Console

#### Step 1: Verify Website
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter your website URL

#### Step 2: Choose Verification Method
- Recommended: DNS or file upload
- Used here: HTML Meta Tag

#### Step 3: Get Verification Code
1. Select "HTML Tag" from verification options
2. Copy the `content` attribute from the provided code
3. Use it in `layout.tsx`

#### Step 4: Update layout.tsx
In `/app/layout.tsx`, add:
```tsx
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
```

Replace `YOUR_VERIFICATION_CODE_HERE` with your verification code

### 3. Track Custom Events

Use available functions from `lib/google-analytics.ts`:

```typescript
import { trackEvent, trackPDFDownload, trackAnalysisSubmit } from '@/lib/google-analytics'

// Track PDF download
trackPDFDownload('report_2024.pdf', 'ar')

// Track analysis submission
trackAnalysisSubmit('example.com', 'website_analysis')

// Track custom event
trackEvent('custom_event', {
  user_action: 'value',
  timestamp: new Date().toISOString(),
})
```

### 4. Verify Installation

1. Open your website in browser
2. Open Developer Tools (F12 or Ctrl+Shift+I)
3. Check Network or Console tab
4. Look for `google-analytics` or `gtag` requests
5. Ensure requests are sent successfully

---

## الميزات المضافة / Added Features ✨

- ✅ Google Analytics Real-time Tracking
- ✅ Custom Event Tracking
- ✅ PDF Download Tracking
- ✅ Analysis Submission Tracking
- ✅ Social Media Click Tracking
- ✅ Language Change Tracking
- ✅ User Engagement Tracking
- ✅ Google Search Console Integration
- ✅ Arabic Language Support with Proper Rendering
- ✅ Multi-language PDF Export

---

## ملفات جديدة / New Files 📁

- `lib/google-analytics.ts` - Google Analytics tracker functions
- `lib/pdf-export-improved.ts` - Improved PDF export with Arabic support
- `.env.example` - Environment variables template
- `GOOGLE_SETUP_GUIDE.md` - This guide

---

## الخطوات التالية / Next Steps 🚀

1. انسخ ملف `.env.example` إلى `.env.local`
2. أضف قيم Google Analytics و Search Console
3. اختبر التتبع في Developer Tools
4. تحقق من البيانات في Google Analytics Dashboard

---

**للمساعدة والدعم، اتصل بنا في:**
**For support, contact us at:**
- Email: info@smartland.com
- Phone: +20 127 209 7150
