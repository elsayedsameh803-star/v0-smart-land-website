import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const LANGUAGES = {
  ar: { name: 'العربية', dir: 'rtl' },
  en: { name: 'English', dir: 'ltr' },
  fr: { name: 'Français', dir: 'ltr' },
  es: { name: 'Español', dir: 'ltr' },
  de: { name: 'Deutsch', dir: 'ltr' },
  tr: { name: 'Türkçe', dir: 'ltr' },
  id: { name: 'Bahasa Indonesia', dir: 'ltr' }
};

function detectLanguage(element: HTMLElement): string {
  const text = element.innerText || '';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[çğıöşüÇĞİÖŞÜ]/.test(text)) return 'tr';
  if (/\b(le|la|les|un|une|et|pour)\b/i.test(text)) return 'fr';
  if (/\b(el|la|los|las|y|para)\b/i.test(text)) return 'es';
  if (/\b(der|die|das|und|für)\b/i.test(text)) return 'de';
  if (/\b(yang|dan|untuk|dari)\b/i.test(text)) return 'id';
  return 'en';
}

export async function exportToPDF(
  elementId: string,
  options: {
    filename?: string;
    lang?: string;
    orientation?: 'portrait' | 'landscape';
    quality?: number;
  } = {}
): Promise<void> {
  const {
    filename = 'smart-land-report',
    lang = 'auto',
    orientation = 'portrait',
    quality = 2
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error('❌ Element not found:', elementId);
    return;
  }

  const detectedLang = lang === 'auto' ? detectLanguage(element) : lang;
  const config = LANGUAGES[detectedLang as keyof typeof LANGUAGES] || LANGUAGES.ar;

  const btn = document.activeElement as HTMLButtonElement | null;
  const originalText = btn?.innerText || '';

  try {
    if (btn) btn.innerText = '⏳ جاري التصدير...';

    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc: Document) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.direction = config.dir;
          clonedEl.style.textAlign = config.dir === 'rtl' ? 'right' : 'left';
        }
      }
    });

    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    let imgY = 10;

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Smart Land - ${config.name}`, pdfWidth / 2, 7, { align: 'center' });

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    let heightLeft = imgHeight * ratio;
    while (heightLeft >= pdfHeight - 20) {
      imgY = heightLeft - imgHeight * ratio;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight - 20;
    }

    pdf.save(`${filename}-${detectedLang}-${Date.now()}.pdf`);

    if (btn) {
      btn.innerText = '✅ تم التصدير';
      setTimeout(() => { if (btn) btn.innerText = originalText; }, 2000);
    }

  } catch (error) {
    console.error('❌ PDF Export Error:', error);
    alert('حدث خطأ أثناء التصدير');
    if (btn) btn.innerText = originalText;
  }
}