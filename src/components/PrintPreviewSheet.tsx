import React, { useState } from 'react';
import { OfficialApplication, PrintSettings } from '../types';
import {
  Printer,
  Copy,
  Download,
  Check,
  AlignLeft,
  AlignJustify,
  FileDown,
  Loader2,
  FileCheck,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintPreviewSheetProps {
  application: OfficialApplication;
  settings: PrintSettings;
  onUpdateSettings?: (settings: Partial<PrintSettings>) => void;
}

export const PrintPreviewSheet: React.FC<PrintPreviewSheetProps> = ({
  application,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isTemplatePlaceholderMode, setIsTemplatePlaceholderMode] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-application');
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2.8,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`${application.title.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed, using print dialog:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyText = () => {
    const lines: string[] = [];
    if (application.refNo) lines.push(`স্মারক নং: ${application.refNo}`);
    lines.push(`তারিখ: ${application.date}`);
    lines.push('বরাবর,');
    lines.push(application.recipient.designation);
    lines.push(application.recipient.office);
    lines.push(application.recipient.address);
    if (application.through) lines.push(`মাধ্যম: ${application.through}`);
    lines.push(`বিষয়: ${application.subject}`);
    lines.push(application.salutation);
    application.bodyParagraphs.forEach(p => lines.push(p));
    if (application.prayerText) lines.push(application.prayerText);
    lines.push(application.closing);
    lines.push(application.applicant.name);
    lines.push(application.applicant.designation);
    lines.push(application.applicant.institute);
    if (application.applicant.phone) lines.push(`মোবাইল: ${application.applicant.phone}`);

    navigator.clipboard.writeText(lines.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${application.title} - ${application.subject}</title>
  <style>
    @page { size: A4 portrait; margin: 20mm; }
    body { font-family: 'Noto Sans Bengali', Kalpurush, SolaimanLipi, sans-serif; font-size: 14pt; line-height: 1.8; color: #111; margin: 0; padding: 25px; }
    .app-sheet { max-width: 800px; margin: 0 auto; text-align: left; }
    .app-body { text-align: justify; text-justify: inter-word; line-height: 1.85; margin: 16px 0; }
    .app-left { text-align: left; }
    .signature-box { margin-top: 40px; text-align: left; display: inline-block; }
  </style>
</head>
<body>
  <div class="app-sheet">
    ${application.refNo ? `<p class="app-left"><strong>স্মারক নং:</strong> ${application.refNo}</p>` : ''}
    <p class="app-left"><strong>তারিখ:</strong> ${application.date}</p>
    <div class="app-left" style="margin: 16px 0;">
      <p style="margin: 2px 0;">বরাবর,</p>
      <p style="margin: 2px 0;"><strong>${application.recipient.designation}</strong></p>
      <p style="margin: 2px 0;">${application.recipient.office}</p>
      <p style="margin: 2px 0;">${application.recipient.address}</p>
    </div>
    ${application.through ? `<p class="app-left" style="margin: 12px 0;"><strong>মাধ্যম:</strong> ${application.through}</p>` : ''}
    <p class="app-left" style="margin: 16px 0; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 4px;">
      বিষয়: ${application.subject}
    </p>
    <p class="app-left" style="margin: 14px 0;">${application.salutation}</p>
    ${application.bodyParagraphs.map(p => `<p class="app-body">${p}</p>`).join('')}
    ${application.prayerText ? `<p class="app-body">${application.prayerText}</p>` : ''}
    <div style="margin-top: 40px;" class="app-left">
      <p style="margin: 2px 0;">${application.closing}</p>
      <p style="margin: 2px 0; font-weight: bold;">${application.applicant.name}</p>
      <p style="margin: 2px 0;">${application.applicant.designation}</p>
      <p style="margin: 2px 0;">${application.applicant.institute}</p>
      ${application.applicant.phone ? `<p style="margin: 2px 0;">মোবাইল: ${application.applicant.phone}</p>` : ''}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${application.title.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Font styling helpers
  const fontClass = settings.fontFamily === 'serif' ? 'font-serif-bn' : 'font-sans-bn';
  const sizeClassMap: Record<'small' | 'medium' | 'large', string> = {
    small: 'text-[13.5px] leading-[1.7]',
    medium: 'text-[15px] leading-[1.85]',
    large: 'text-[16.5px] leading-[1.9]',
  };
  const sizeClass = sizeClassMap[settings.fontSize] || sizeClassMap.medium;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Action Bar - Hidden in Print */}
      <div className="no-print w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <AlignLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>সকল আবেদনপত্র: Left Aligned</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full border border-teal-200">
            <AlignJustify className="w-3.5 h-3.5 text-teal-600" />
            <span>আবেদন বডি: Justified</span>
          </div>

          {/* Toggle between filled and raw bracket template mode */}
          <button
            type="button"
            onClick={() => setIsTemplatePlaceholderMode(!isTemplatePlaceholderMode)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              isTemplatePlaceholderMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="ব্র্যাকেট নমুনা টেমপ্লেট যেমন [শুরুর তারিখ], [নাম] দেখতে ক্লিক করুন"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isTemplatePlaceholderMode ? '✓ ব্র্যাকেট টেমপ্লেট রূপ' : 'ব্র্যাকেট টেমপ্লেট ভিউ'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* View / Download Original PDF Template */}
          <a
            href="/assets/aistudio/application_18e2efad.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            title="আপনার মূল ৮-পৃষ্ঠার নমুনা পিডিএফ ফাইলটি দেখুন"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>মূল PDF টেমপ্লেট</span>
          </a>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="সম্পূর্ণ টেক্সট কপি করুন"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট কপি'}</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="HTML ফাইল হিসেবে সংরক্ষণ"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>HTML</span>
          </button>

          {/* 1-Click PDF Generation */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="সরাসরি A4 PDF ফাইল ডাউনলোড করুন"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isGeneratingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
          </button>

          {/* Standard Browser Print to PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            title="সরাসরি প্রিন্ট বা সেভ অ্যাজ PDF (Ctrl + P)"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট ও PDF (Ctrl + P)</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="w-full flex justify-center overflow-x-auto pb-12 print:p-0 print:overflow-visible">
        <div
          id="printable-application"
          className={`a4-sheet ${fontClass} ${sizeClass} shadow-xl border border-slate-200 print:shadow-none print:border-none print:m-0`}
        >
          {/* Official Letter Layout - Strictly Left-Aligned */}
          <div className="application-container text-left w-full space-y-4">
            {/* Top Date & Ref No */}
            <div className="space-y-1">
              {application.refNo && settings.showRefNo && (
                <div className="text-left font-medium text-slate-700">
                  <span className="font-semibold text-slate-900">স্মারক নং:</span> {application.refNo}
                </div>
              )}
              <div className="text-left font-medium text-slate-800">
                <span className="font-semibold text-slate-900">তারিখ:</span>{' '}
                {isTemplatePlaceholderMode ? '[আজকের তারিখ]' : application.date}
              </div>
            </div>

            {/* Recipient Block - Left Aligned */}
            <div className="space-y-0.5 text-left text-slate-900 leading-snug">
              <div className="font-medium">বরাবর,</div>
              <div className="font-bold text-slate-950 text-[1.05em]">
                {isTemplatePlaceholderMode
                  ? '[কর্তৃপক্ষের পদবি - যেমন: প্রধান শিক্ষক/ব্যবস্থাপক]'
                  : application.recipient.designation}
              </div>
              <div>
                {isTemplatePlaceholderMode ? '[প্রতিষ্ঠানের নাম]' : application.recipient.office}
              </div>
              <div>
                {isTemplatePlaceholderMode
                  ? '[উপজেলার নাম], [জেলার নাম]।`'
                  : application.recipient.address}
              </div>
            </div>

            {/* Through (যথাযথ কর্তৃপক্ষের মাধ্যমে) - Left Aligned */}
            {application.through && settings.showThrough && (
              <div className="text-left text-slate-800">
                <span className="font-semibold text-slate-900">মাধ্যম:</span>{' '}
                <span className="font-medium">
                  {application.through}
                </span>
              </div>
            )}

            {/* Subject - Left Aligned */}
            <div className="text-left pt-1">
              <div className="inline-block pb-0.5 font-bold text-slate-950 text-[1.05em]">
                <span className="font-bold">বিষয়:</span> {application.subject}
              </div>
            </div>

            {/* Salutation - Left Aligned */}
            <div className="text-left font-semibold text-slate-900 pt-1">
              {application.salutation}
            </div>

            {/* Application Body Paragraphs - STRICTLY JUSTIFIED */}
            <div className="space-y-3.5">
              {application.bodyParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="application-body-text text-slate-900"
                >
                  {paragraph}
                </p>
              ))}

              {/* Prayer text - STRICTLY JUSTIFIED */}
              {application.prayerText && (
                <p className="application-body-text text-slate-900 font-medium">
                  {application.prayerText}
                </p>
              )}
            </div>

            {/* Closing & Signature Block - Left Aligned */}
            <div className="mt-10 pt-4 text-left">
              <div className="inline-block text-left space-y-1">
                <div className="text-slate-800 mb-8">{application.closing}</div>
                <div className="font-bold text-slate-950 text-[1.05em]">
                  {isTemplatePlaceholderMode ? '[নাম]' : application.applicant.name}
                </div>
                <div className="text-slate-800">
                  {isTemplatePlaceholderMode ? '[পদবি]' : application.applicant.designation}
                </div>
                <div className="text-slate-700">
                  {isTemplatePlaceholderMode
                    ? '[কর্মস্থলের নাম]'
                    : application.applicant.institute}
                </div>
                {isTemplatePlaceholderMode && (
                  <div className="text-slate-700">[উপজেলার নাম], [জেলার নাম]</div>
                )}
                <div className="text-slate-700 text-[0.9em]">
                  {isTemplatePlaceholderMode ? '[মোবাইল নম্বর:]' : `মোবাইল: ${application.applicant.phone || ''}`}
                </div>
              </div>
            </div>

            {/* Attachments (সংযুক্তি) - Left Aligned */}
            {application.attachments && application.attachments.length > 0 && settings.showAttachments && (
              <div className="mt-6 pt-3 border-t border-slate-200 text-left text-[0.9em] text-slate-700">
                <div className="font-bold text-slate-900 mb-1">সংযুক্তি:</div>
                <ul className="space-y-0.5 list-none pl-0">
                  {application.attachments.map((item, idx) => (
                    <li key={idx} className="text-slate-800">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* CC List (অনুলিপি) - Left Aligned */}
            {application.ccList && application.ccList.length > 0 && settings.showCc && (
              <div className="mt-4 pt-2 border-t border-slate-200 text-left text-[0.88em] text-slate-700">
                <div className="font-bold text-slate-900 mb-1">অনুলিপি সদয় অবগতি ও প্রয়োজনীয় ব্যবস্থা গ্রহণে:</div>
                <ul className="space-y-0.5 list-none pl-0">
                  {application.ccList.map((item, idx) => (
                    <li key={idx} className="text-slate-800">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
