import React from 'react';
import { X, Sliders, CheckCircle2, RotateCcw, Printer } from 'lucide-react';
import { PrintSettings } from '../types';

interface PrintSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrintSettings;
  onUpdateSettings: (settings: Partial<PrintSettings>) => void;
  onResetSettings: () => void;
}

export const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/60 flex items-center justify-center text-emerald-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">প্রিন্ট ও পেজ সেটিংস (Print Settings)</h3>
              <p className="text-xs text-emerald-200">সরকারি স্ট্যান্ডার্ড A4 পেজ ও মার্জিন কনফিগারেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Alignment Rule Alert */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">সরকারি আবেদনপত্র স্ট্যান্ডার্ড সক্রিয়:</p>
              <p className="text-emerald-800/90 mt-0.5">
                হেডার, তারিখ ও সাক্ষর সম্পূর্ণ <b>Left-Aligned</b> এবং মূল দরখাস্তের বিবরণী ও প্রার্থনা সম্পূর্ণ <b>Justified</b> ফরম্যাটে লক করা রয়েছে।
              </p>
            </div>
          </div>

          {/* Font Size Option */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">ফন্ট সাইজ (Font Size):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: 'কমপ্যাক্ট (১৪pt)' },
                { id: 'medium', label: 'স্ট্যান্ডার্ড (১৫pt)' },
                { id: 'large', label: 'বড় (১৬pt)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: item.id as any })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    settings.fontSize === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Spacing Option */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">লাইন স্পেসিং (Line Spacing):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tight', label: 'টাইট (১.৩)' },
                { id: 'normal', label: 'স্বাভাবিক (১.৫)' },
                { id: 'relaxed', label: 'খোলামেলা (১.৭)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onUpdateSettings({ lineSpacing: item.id as any })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    settings.lineSpacing === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Elements Visibility */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">উপাদান প্রদর্শন (Toggle Elements):</label>
            
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="font-medium text-slate-800">মাধ্যম: যথাযথ কর্তৃপক্ষ (Through Channel)</span>
                <input
                  type="checkbox"
                  checked={settings.showThrough}
                  onChange={(e) => onUpdateSettings({ showThrough: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="font-medium text-slate-800">স্মারক / রেফারেন্স নম্বর (Ref No)</span>
                <input
                  type="checkbox"
                  checked={settings.showRefNo}
                  onChange={(e) => onUpdateSettings({ showRefNo: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="font-medium text-slate-800">সংযুক্তিসমূহ তালিকা (Attachments)</span>
                <input
                  type="checkbox"
                  checked={settings.showAttachments}
                  onChange={(e) => onUpdateSettings({ showAttachments: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট মানে ফেরান</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            সংরক্ষণ ও বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
