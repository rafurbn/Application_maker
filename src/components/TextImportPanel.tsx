import React, { useRef, useState } from 'react';
import { ClipboardPaste, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ApplicationFormData } from '../types';

interface TextImportPanelProps {
  onImport: (fields: Partial<ApplicationFormData>) => void;
}

const SUBJECT_RE = /^বিষয়\s*[:\-–]\s*/;
const HEADER_RE = /^(বরাবর|তারিখ|মাধ্যম|প্রাপক|স্মারক|ক্রমিক)\s*[:\-–]?/;
const CLOSING_RE = /^(নিবেদক|বিনীত নিবেদক|বিনীত|অনুরোধক্রমে|আবেদনকারী)\s*[:]?/;

export function parseApplicationText(text: string): { subject: string; body: string } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let subject = '';
  const bodyParts: string[] = [];

  for (const line of lines) {
    if (SUBJECT_RE.test(line)) {
      subject = line.replace(SUBJECT_RE, '').trim();
      continue;
    }
    if (HEADER_RE.test(line) || CLOSING_RE.test(line)) continue;
    const isPrayer = line.startsWith('অতএব');
    if (isPrayer || line.length > 25) bodyParts.push(line);
  }

  return { subject, body: bodyParts.join('\n\n') };
}

export const TextImportPanel: React.FC<TextImportPanelProps> = ({ onImport }) => {
  const [pasteText, setPasteText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      setPasteText(text);
      setFileName(file.name);
      setStatus(null);
    } catch {
      setStatus('ফাইলটি পড়া যায়নি — লেখা কপি করে নিচের বক্সে পেস্ট করুন।');
    }
  };

  const handleApply = () => {
    const { subject, body } = parseApplicationText(pasteText);
    if (!body) {
      setStatus('এই লেখা থেকে অংশ বডি খুঁজে পাওয়া যায়নি। পুরো আবেদনপত্রটি পেস্ট করুন।');
      return;
    }
    onImport({
      ...(subject ? { subject } : {}),
      customBodyText: body,
    });
    setStatus('আবেদনের বডি যুক্ত হয়েছে — "লাইভ প্রিভিউ" ট্যাবে দেখে প্রিন্ট করুন।');
  };

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 text-xs leading-relaxed space-y-1">
        <p className="font-bold text-emerald-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" />
          পুরোনো আবেদনপত্রের লেখা থেকে নতুন প্রিন্ট-রেডি আবেদন বানান
        </p>
        <p className="text-emerald-800">
          নিচে লেখা পেস্ট করুন (অথবা টেক্সট ফাইল বাছুন)। অ্যাপটি শুধু <b>বিষয়</b> ও মূল বডি অংশটি নিয়ে
          নেবে — বরাবর/তারিখ/স্বাক্ষরের অংশ আপনার ফরমে ভরা থাকে, সেটি এই অ্যাপের A4 ফরম্যাট অনুযায়ী বসবে।
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.text,text/plain"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-700" />
          <span>টেক্সট ফাইল বাছুন</span>
        </button>
        {fileName && (
          <span className="text-[11px] text-slate-600 font-mono truncate max-w-[16rem]">{fileName}</span>
        )}
      </div>

      <textarea
        rows={8}
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        placeholder={'বিষয়: ৪ (চার) দিনের নৈমিত্তিক ছুটি মঞ্জুর প্রসঙ্গে॥\n\nসবিনয় নিবেদন এই যে...\n\nঅতএব, মহোদয় সমীপে বিনীত প্রার্থনা...'}
        className="w-full px-3 py-2.5 text-sm leading-relaxed border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-sans-bn"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-slate-500">
          এই লেখা আপনার ডিভাইস ছেড়ে কোথাও যায় না — পেস্ট ও রূপান্তর সম্পূর্ণ ব্রাউজারেই হয়।
        </p>
        <button
          type="button"
          disabled={!pasteText.trim()}
          onClick={handleApply}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>ফর্মে যুক্ত করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {status && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-px" />
          <span>{status}</span>
        </div>
      )}
    </div>
  );
};
