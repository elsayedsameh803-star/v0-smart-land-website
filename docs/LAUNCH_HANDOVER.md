# Smart Land — Launch Handover / دليل تسليم الإطلاق

> الإصدار: 2.1.0  ·  الحالة: **قبل الإعلان (Pre-launch)**  ·  آخر مراجعة: أغسطس 2026
>
> المبدأ الحاكم الكامل للمشروع: **Smart Land واجهة عرض/تحليل للبيانات الحقيقية.**
> لا تُخترَع بيانات، ولا تُقرَّب درجات بلا مصدر. ما لا يأتي من مصدر رسمي يُعرض كـ
> «غير متاح» / «فشل API» / «صلاحيات ناقصة» — صراحةً.

---

## 0) خلاصة الأمانة (لماذا هذا الملف)

بيئة العمل التي أُجريت فيها هذه المراجعة **لا تشغّل أوامر shell** (جرّبت `echo hello`,
`node -v`, `cmd /c echo ...` ولم تُنفَّذ — لم يُنشأ حتى ملف اختبار). لذلك ما يلي:
- ✅ **تم** : مراجعة كود يدوية عميقة + إصلاحات ملفات مؤكّدة (القسم 1).
- ⛔ **لم يُنفَّذ** : `lint` / `tsc` / `build` / اختبارات تشغيلية / Paymob e2e / Commit-Push-Deploy.
- ⚠️ لذلك **لا أُصرّح أن المشروع جاهز للإنتاج** — أسلّمك دليلًا تنفيذيًا يجعله جاهزًا بخطوات موثّقة.

---

## 1) الإصلاحات المطبَّقة في هذه المراجعة

| # | المشكلة | الخطورة | الملف | الإصلاح |
|---|---------|---------|-------|---------|
| 1 | مفتاح توقيع كوكي العميل كان يسترجع fallback **صلب/معلن** `smartland-customer-secret` → إمكانية تزوير هوية المشترك | **أمني حرج** | `src/lib/subscription-service.ts` | `cookieSecret()` أصبح **fail-closed**: يرمي خطأً إذا غابت `PAYMOB_CUSTOMER_SECRET`/`ADMIN_SESSION_SECRET` |
| 2 | TikTok كان يدرج `followers=0, likes=0, …` المختلقة حتى عند فشل الجلب ويرفع الثقة | صدقية/صحة بيانات | `src/app/api/analyze/tiktok/route.ts` | القيم أصبحت `undefined` وتُحذف من الاستجابة؛ المشتقات تُحسب فقط مع منشورات حقيقية |
| 3 | Snapchat يفبرك `verified:false` (لا يوجد إشارة توثيق عام) | صدقية | `snapchat/route.ts` | حُذف السطر → «غير متاح» |
| 4 | LinkedIn يفبرك `verified:false` + `isPrivate:false` | صدقية | `linkedin/route.ts` | حُذفا → «غير متاح» |
| 5 | 3 نطاقات مختلفة مكتوبة صراحة | إطلاق/SEO | `src/lib/site-config.ts` + `sitemap.ts` + `referral-storage.ts` + `admin/payment-settings/route.ts` | مصدر واحد `getSiteUrl()` يقرأ البيئة |

> تحقّق: Facebook و Instagram ومحلّل المواقع كانت سليمة صدقيةً أصلًا (تُصدر الحقول فقط عند وجودها فعليًا).

---

## 2) ما تحقّقت منه بالنِّسق السليم (قراءة كود، وليس تشغيل)

- **قاعدة البيانات 7 منصّات**: Website / Facebook / Instagram / TikTok / YouTube / LinkedIn / Snapchat — كلها تملك SSRF protection عبر `safeFetch`+`validateUrlForFetch`, وتستخرج من مصادر عامة. YouTube إضافيًا يقرأ **YouTube Data API** عند توفر `GOOGLE_API_KEY`.
- **الدرجات**: تكون من إشارات مُقاسة فعلًا (`present()` تعامل 0 والمفقود كـ«غير متحقق»؛ `overallAvailable=false` تُظهر «غير كافٍ لحساب النتيجة»). لا أرقام ثابتة.
- **AI**: `gemini-analysis.ts` يبني التحليل من البيانات الحقيقية فقط، مع حارس ضد prompt-injection، ويعود `null` عند الفشل.
- **الاشتراك**: القرارات **server-side** حصرًا؛ `applyExpiredSubscriptions()` تُبطل المنتهي قرب انتهائه؛ التجديد من `max(now,endDate)`.
- **Paymob**: دفع server-side فقط، توقيع webhook بـ HMAC معرّف، تمييز `SUCCESS/FAILED/CANCELLED/PENDING`، تفعيل الاشتراك فقط عند نجاح مؤكد، idempotent.
- **الأمان/إدارة**: أمانات في معرّفات البيئية؛ `admin` محمي بـ token موقّع HttpOnly؛ لا أسرار مكتوبة في الكود.

---

## 3) متغيرات البيئة — اضبطها على Vercel (وهذا إلزامي قبل الإطلاق)

| المتغير | الحالة | مطلوب؟ | ملاحظة |
|---------|--------|--------|--------|
| `NEXT_PUBLIC_SITE_URL` | ⚠️ غير موجود | **نعم** | عيّنه بالدومين النهائي (يُغذّي site-config) |
| `ADMIN_PASSWORD` | موجود محليًا فقط | **نعم** | القيمة الحالية `25802580` **ضعيفة → دائرها (rotate)** بقيمة قوية |
| `ADMIN_SESSION_SECRET` | موجود محليًا | **نعم** | احتفظ بقيمة عشوائية قوية |
| `PAYMOB_MODE` | غائب | نعم | عيّنه `test` مبدئيًا ثم `live` بعد نجاح e2e |
| `PAYMOB_SECRET_KEY` | غائب | نعم (للدفع) | من لوحة Paymob (Test) |
| `PAYMOB_PUBLIC_KEY` | غائب | نعم | — |
| `PAYMOB_INTEGRATION_ID` | غائب | نعم | — |
| `PAYMOB_IFRAME_ID` | غائب | نعم | — |
| `PAYMOB_HMAC_SECRET` | غائب | نعم | لتوقيع webhook |
| `PAYMOB_CUSTOMER_SECRET` | غائب | ⚠️ مطلوب الآن | بعد إصلاح #1 (أو يرث `ADMIN_SESSION_SECRET`) |
| `GEMINI_API_KEY` | غائب | اختياري (للـ AI) | يُفضَّل لإثراء التحليل عبر Gemini |
| `GOOGLE_API_KEY` | موجود محليًا | اختياري | لـ YouTube Data API + Gemini fallback |
| `TIKTOK_CLIENT_KEY` | موجود في Vercel | **مطلوب للتكامل الرسمي** | مفتاح تطبيق TikTok for Developers — server-side فقط |
| `TIKTOK_CLIENT_SECRET` | موجود في Vercel | **مطلوب للتكامل الرسمي** | سريّ — يُقرأ في الخادم فقط ويمنع وضعه في الواجهة أو السجلات |
| `TIKTOK_CLIENT_KEY` | موجود في Vercel | **مطلوب للتكامل الرسمي** | مفتاح تطبيق TikTok for Developers (server-side فقط — لا يُمرَّر للمتصفح) |
| `TIKTOK_CLIENT_SECRET` | موجود في Vercel | **مطلوب للتكامل الرسمي** | سريّ — يُقرأ في الخادم فقط ويمنع منعًا باتًا وضعه في الواجهة أو السجلات |

> ⛔ **أمان** : يوجد في `.env.local` المحلي `VERCEL_OIDC_TOKEN` — وهو حساس جدًا (يغمر بوصول لمشروع Vercel). **أزِله من أي ملف محلي** واحتفظ به فقط في أسرار Vercel، ودائر أي مفتاح سبق نشره.
> تأكّد أيضًا: `.gitignore` يستثني `.env*` (فعلًا) — لا تُرفع أي `.env` إلى git.

---

## 4) Runbook — الأوامر لإتمام التحقق (شغّلها من جهازك وارسل مخرجاتها)

```bash
cd "c:\Users\Fast\OneDrive\Desktop\new smart land"
npm install
npm run lint        # يُصلح أي تحذيرات/أخطاء ESLint
npx tsc --noEmit    # فحص الأنواع — أهم خطوة بعد تعديلات المراجعة
npm run build       # البناء الإنتاجي
npm start           # ثم جرّب يدويًا
```

بعد تعديلات هذه المراجعة (خاصة `site-config.ts` الجديد والاستيرادات) **يجب** تمرير `tsc` و`build`. إن ظهرت أخطاء أرسلها إليّ نصيًا وأصلحها فورًا.

### اختبارات يدوية ما بعد البناء
1. `/` → landing يعمل ، `/en` و `/ar`.
2. حمّل أي موقع URL وتحقق من صدق الأرقام والدرجات.
3. حمّل منصّات (فيسبوك/إنستغرام/يوتيوب/تيك توك/لينكد إن/سناب) واختبر الحالة الناجحة والفاشلة (نتيجة صريحة لا أصفار).
4. Paymob e2e بمفاتيح Test: ابدأ دفعًا → نفّذ دفعًا → تحقّق أن الاشتراك يتحوّل `active`؛ ونفّذ فشلًا/إلغاءً وتأكّد من `failed`/`cancelled`.
5. Free vs Premium: تأكّد أن المجاني لا يصل لميزات Premium حتى بطلب من المتصفح.
6. الـ 404 والـ loading والـ error states، وتنقّل عربي (RTL) وإنجليزي.
7. تصدير PDF وتقارير.

---

## 5) قائمة التأهيل التسويقي (Landing Reader)

- [ ] تُفهم القيمة خلال ثوانٍ (Hero واضح).
- [ ] CTA واحد واضح (ابدأ تحليلًا).
- [ ] تجربة التحليل سهلة (إدخال URL/منصّة → نتيجة).
- [ ] Pricing واضح؛ Free vs Premium متميّز.
- [ ] Trust signals (شعارات عملاء، أرقام استخدام).
- [ ] FAQ، Contact، Privacy، Terms، (Refund إن طُبّق).
- [ ] لا أزرار/صفحات مكسورة؛ تفحّص كل الروابط.
- [ ] SEO: title/description/OG على كل الصفحات، `sitemap.xml`، `robots.txt` بنطاق موحّد (ثبّت `NEXT_PUBLIC_SITE_URL`).
- [ ] منصّات الهاتف/الكمبيوتر، RTL/EN، PWA (manifest+sw).

---

## 6) واقع البيانات حسب المنصّة (بلا تجميل)

| المنصّة | المتحقق عليه من المصدر | غير متاح (يُعرض «غير متاح») | ملاحظة مصدر |
|--------|------------------------|------------------------------|-------------|
| Website | HTML، headers، meta، headings، links، img، ssl… | أداء Core Web Vitals حقيقي لا يستلزم headless | فحص مباشر من الخادم |
| Instagram | الملف العام، المتابعون، المنشورات، engagement من عينة | بيانات غير عامة/حساب خاص | صفحة عامة + sharedData |
| Facebook | سلوك صفحة/فولو/الأوصاف (عند توفّره) | كثير محجوب خلف login wall | صفحة/ملف mbasic |
| TikTok | oEmbed (عنوان/مؤلف/صورة) + **Research API** (مشاهدات/إعجابات/تعليقات/مشاركات/مدة/هاشتاجات) + **Display API** (عند تفويض الزائر لحسابه) | كل مقياس لا يُجلب من API يُعرض «غير متاح»؛ لا أرقام مختلقة | API رسمي TikTok for Developers + oEmbed |
| YouTube | YouTube Data API (عند المفتاح) + صفحة | إن لم يتوفّر المفتاح نبقى على scrape | API رسمي |
| LinkedIn | وصف/تعريف/Skills من الصفحة | الموظفون/verification/خصوصية | صفحة عامة |
| Snapchat | name/bio/links/og | followers/توثيق (بعد إصلاح #3) | صفحة عامة |

---

## 7) Permissions / مفاتيح API مطلوبة (لا App Review حاليًا)

- لا يلزم **App Review** في التصميم الحالي (استخراج عام).
- **YouTube/Gemini**: `GOOGLE_API_KEY` فقط.
- **إثراء مستقبلي (اختياري)**: Facebook/Instagram Graph API → يتطلب App Review + permissions
  (`pages_read_engagement`, `instagram_business_basic`, `public_profile`) — مشروع منفصل.

### TikTok — الواقع الدقيق للمصدر (تقرير صريح)

لا يمكن تحليل **فيديو تيك توك عام بمجرد وضع رابطه** عبر Display API إلا إذا كان
الفيديو مملوكًا لحسابٍ فاوضك (OAuth). لذلك النظام يستخدم - بالترتيب -:

| المسار | الـ API / `Product` | المطلوب | بيانات تُقرأ فعلًا |
|--------|--------------------|---------|--------------------|
| 1 | **oEmbed** `GET tiktok.com/oembed?url=` | لا مفاتيح | `title`, `author_name`, `author_url`, `thumbnail_url` فقط |
| 2 | **Research API** `POST /v2/research/video/query/` | موافقة مشروع Research + `TIKTOK_CLIENT_KEY/SECRET` + client access token | لكل فيديو: `view_count`, `like_count`, `comment_count`, `share_count`, `play_count`, `duration`, `video_description`, `hashtag_info`, `music_info`, `create_time` |
| 3 | **Research API** `POST /v2/research/user/info/` | مشروع Research (كما أعلاه) | `display_name`, `bio_description`, `avatar_url`, `is_verified`, `follower_count`, `following_count`, `likes_count`, `video_count` |
| 4 | **Display API** `/v2/user/info/`, `/v2/video/list/`, `/v2/video/query/` | تطبيق معتمد **Login Kit + TikTok API** مع scopes `user.info.basic`, `video.list` + **تفويض الزائر** عبر OAuth (Authorization Code) | نفس مقاييس الفيديو + `create_time`, `cover_image_url`, `share_url`, `hashtag_names`, ومعلومات المستخدم (المتابِعون، المهتم) |

- **هل يحتاج المستخدم دعوة وحساب TikTok والموافقة؟** نعم — لتشغيل `Display API` للمقاييس على **فيديوهات خاصة به**، يبدأ OAuth عبر زر "ربط حساب تيك توك" في الواجهة (`/api/tiktok/oauth/start`). أمّا Research API (نفس مفاتيح `TIKTOK_CLIENT_KEY/SECRET`) فلا يتطلب تسجيل دخول من الزائر بل **موافقة مشروع Research** على مستوى التطبيق.
- **ماذا لو كان المطلوب فقط تحليل فيديو عام بدون OAuth؟** المسار الوحيد المأذون لقراءة المقاييس العامة لفيديو عشوائي هو Research API (`/v2/research/video/query/` بحقل `video_id`). بدون موافقة Research يعرض النظام العنوان/المؤلف/الصورة فقط ولا يختلق أرقامًا.
- **ممنوع scraping**: لا يَستخدم الكود فحص HTML للصفحة العامة إطلاقًا. كل قراءة ملهـ API رسمي.
- **الأسرار**: `TIKTOK_CLIENT_SECRET` يُقرأ من `process.env` في الخادم فقط؛ tokens تُخزن في كوكي `HttpOnly/Secure` مشفرة؛ ولا تُسجَّل أي مفاتيح في السجلات (`src/lib/tiktok-log.ts` تستبدل كل ما يشبه سرًا).

---

## 8) موانع الإطلاق الحالية (blockers) — واضحة وبلا مواربة

1. **لم يُبنَ ولم يُفحص `tsc` ولا `lint`** بعد تعديلات المراجعة → شغّل القسم 4 أولًا.
2. **Paymob غير مُفعّل** (لا مفاتيح Test) → بدونها لا يوجد اشتراك مدفوع.
3. **نطاق `NEXT_PUBLIC_SITE_URL` غير محدد** وإن كان الكود موحّدًا الآن → عيّنه وأعد توليد `sitemap/robots`.
4. **كلمة مرور الأدمن + VERCEL_OIDC_TOKEN** → دائرتهما.
5. هذه المراجعة بيئةٌ لا تسمح بالنشر → **Commit / Push / Deploy** لم يتم (أمر تنفيذي مفتوح).

---

## 9) كيف تُكمل (بأولوية)

1. عيّن المتغيرات في Vercel (القسم 3)، ودائر الأسرار.
2. شغّل Runbook (القسم 4) وأرسل لي أي خطأ ⇒ أصلحه.
3. نفّذ Paymob e2e بمفاتيح Test ⇒ حدّثنا بنتيجة.
4. جرّب المنصّات + Free/Premium + AR/EN + PDF (القسم 4 يدوي).
5. عند النجاح: `git add -A && git commit && git push` ثم `vercel --prod`.
6. أعد تقييم `ready` بعد هذه البنود.

> **قاعدة Soul**: كل رقم يظهر للمستخدم = (a) قادم من المصدر، أو (b) محسوب من بيانات المصدر، أو (c) يُعلَن «غير متاح/فشل/صلاحيات» — لا غير.