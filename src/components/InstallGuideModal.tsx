import React from 'react';
import { Check, Copy, Download, ExternalLink, Share, Smartphone, SquarePlus, X } from 'lucide-react';
import type { InstallGuideKind } from '../hooks/usePwaInstall';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: InstallGuideKind;
  inAppBrowser: boolean;
  isInstallable: boolean;
  onRetryInstall: () => void;
}

const STEP_ICON_CLASS = 'w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5';

const CopySuggestions: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const commands = [{ label: 'অ্যাপের লিংক কপি করুন', text: 'https://application-maker-tau.vercel.app/' }];

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-2">
      {commands.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => copy(item.text)}
          className="w-full flex items-center justify-between gap-2 text-left text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-colors"
        >
          <span>{item.label}</span>
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
        </button>
      ))}
    </div>
  );
};

function DeviceSteps({ kind }: { kind: InstallGuideKind }) {
  if (kind === 'ios') {
    return (
      <ol className="space-y-3 text-xs text-slate-700">
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>১</span>
          <p>
            <b>Safari</b> ব্রাউজারে অ্যাপটি খুলুন (Chrome বা Facebook-এর ভেতরের ব্রাউজারে আইফোনে ইনস্টল হয় না)।
          </p>
        </li>
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>২</span>
          <p>
            নিচের <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> <b>Share</b> বোতামে ট্যাপ করুন।
          </p>
        </li>
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>৩</span>
          <p>
            <SquarePlus className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" /> <b>Add to Home Screen</b> বেছে নিন,
            তারপর উপরে <b>Add</b> চাপুন।
          </p>
        </li>
      </ol>
    );
  }

  if (kind === 'android') {
    return (
      <ol className="space-y-3 text-xs text-slate-700">
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>১</span>
          <p>
            অ্যাপটি <b>Chrome</b> ব্রাউজারে খোলা রাখুন। Facebook বা WhatsApp-এর ভেতরের ব্রাউজারে খুললে ইনস্টল অপশন আসে না —
            ওই ব্রাউজারের মেনু থেকে “Open in browser” / “Chrome-এ খুলুন” চাপুন।
          </p>
        </li>
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>২</span>
          <p>
            উপরে/নিচে <b>⋮ (তিন ডট)</b> মেনু চাপুন। পুরোনো ফোনে মেনুটা নিচের ডানদিকে থাকে।
          </p>
        </li>
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>৩</span>
          <p>
            মেনুতে <b>“Install app”</b> / <b>“অ্যাপ ইনস্টল করুন”</b> দেখালে সেটি চাপুন। না দেখালে{' '}
            <b>“Add to Home screen”</b> / <b>“হোম স্ক্রিনে যোগ করুন”</b> চাপুন।
          </p>
        </li>
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>৪</span>
          <p>
            কোনো একটিও না দেখালে Chrome-এর <b>Settings → সাইট সেটিংস</b>-এ এই সাইটের জন্য “হোম স্ক্রিনে যোগ করুন”
            শর্টকাট তৈরি চালু রাখুন, অথবা Chrome আপডেট করুন।
          </p>
        </li>
        <li className="flex items-start gap-2.5">
          <span className={STEP_ICON_CLASS}>৫</span>
          <p>
            ইনস্টলের পর অ্যাপ আইকনটি হোম স্ক্রিনে না দেখালে অ্যাপ ড্রয়ার (সব অ্যাপ) খুঁজুন — দেখতে হবে <b>“দরখাস্ত”</b>।
          </p>
        </li>
      </ol>
    );
  }

  return (
    <ol className="space-y-3 text-xs text-slate-700">
      <li className="flex items-start gap-2.5">
        <span className={STEP_ICON_CLASS}>১</span>
        <p>
          কম্পিউটারে <b>Chrome</b> বা <b>Edge</b> দিয়ে অ্যাপটি খুলুন।
        </p>
      </li>
      <li className="flex items-start gap-2.5">
        <span className={STEP_ICON_CLASS}>২</span>
        <p>
          অ্যাড্রেস বারের ডান দিকে <Download className="w-3.5 h-3.5 inline mx-0.5 text-emerald-700" />
          <b> ইনস্টল আইকন</b> চাপুন। না দেখালে <b>⋮ → Install অফিসিয়াল দরখাস্ত…</b> বেছে নিন।
        </p>
      </li>
      <li className="flex items-start gap-2.5">
        <span className={STEP_ICON_CLASS}>৩</span>
        <p>
          ইনস্টল হলে ডেস্কটপ/স্টার্ট মেনুতে অ্যাপ আইকন তৈরি হবে — সেখান থেকেই ব্রাউজার ছাড়া চালানো যাবে।
        </p>
      </li>
    </ol>
  );
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  kind,
  inAppBrowser,
  isInstallable,
  onRetryInstall,
}) => {
  if (!isOpen) return null;

  const title =
    kind === 'ios' ? 'আইফোনে অ্যাপ ইনস্টল' : kind === 'android' ? 'Android ফোনে অ্যাপ ইনস্টল' : 'পিসিতে অ্যাপ ইনস্টল';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 bg-emerald-900 px-4 py-3 text-white">
          <div className="flex items-start gap-2.5">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="text-[11px] text-emerald-200">২ মিনিটের কাজ — একবার ইনস্টল করলেই হবে</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4">
          {inAppBrowser && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
              আপনি Facebook / WhatsApp-এর ভেতরের ব্রাউজারে আছেন — এখানে ইনস্টল বাটন কাজ করে না। উপরের ↙/⋮ মেনু থেকে
              “Open in browser” চেপে Chrome-এ খুলুন, তারপর আবার ইনস্টল বাটন চাপুন।
            </div>
          )}

          <DeviceSteps kind={kind} />

          {kind === 'android' && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500">লিংকটি কপি করে Chrome-এর অ্যাড্রেস বারে পেস্ট করলেও ইনস্টল করা যাবে</p>
              <CopySuggestions />
            </div>
          )}

          <button
            type="button"
            onClick={onRetryInstall}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500"
          >
            <Download className="h-4 w-4" />
            {isInstallable ? 'আবার ইনস্টল পপআপ দেখান' : 'ব্রাউজারের ইনস্টল পপআপ আবার চেষ্টা করুন'}
          </button>

          <a
            href="https://application-maker-tau.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            https://application-maker-tau.vercel.app/ — Chrome-এ নতুন ট্যাবে খুলুন
          </a>
        </div>
      </div>
    </div>
  );
};
