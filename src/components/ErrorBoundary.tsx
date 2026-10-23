import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Eraser } from 'lucide-react';
import { eraseDeviceData } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, a single render error leaves an installed PWA as a dead window and
 * Chrome only reports "failed to start several times" — no clue and no way out.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('অ্যাপ থেমে গেছে', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const wipeAndRestart = () => {
      const ok = window.confirm(
        'এই ডিভাইসে সংরক্ষিত দরখাস্ত, পছন্দ ও পরিসংখ্যান মুছে অ্যাপটি নতুন করে খোলা হবে?\n\nআগে প্রয়োজন হলে ব্রাউজারে সাইটটি খুলে "আপনার তথ্য ও ব্যাকআপ" থেকে ব্যাকআপ নিন।',
      );
      if (!ok) return;
      eraseDeviceData();
      window.location.replace('/');
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </span>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-slate-900">অ্যাপটি চালু হতে পারেনি</h1>
              <p className="text-xs leading-relaxed text-slate-600">
                আবার চেষ্টা করলে বেশিরভাগ সমস্যাই সমাধান হয়ে যায়। আপনার এই ডিভাইসে সংরক্ষিত
                দরখাস্তগুলো এই সমস্যায় মুছে যায়নি।
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>আবার চেষ্টা করুন</span>
            </button>
            <button
              type="button"
              onClick={wipeAndRestart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Eraser className="h-4 w-4 text-slate-500" />
              <span>ডেটা মুছে নতুন করে শুরু</span>
            </button>
          </div>

          <details className="text-[11px] text-slate-500">
            <summary className="cursor-pointer font-semibold">প্রযুক্তিগত বিবরণ (শুধু রিপোর্টের জন্য)</summary>
            <pre className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto whitespace-pre-wrap break-all font-mono">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
