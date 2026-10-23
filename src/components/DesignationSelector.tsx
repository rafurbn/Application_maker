import React, { useState } from 'react';
import { Check, Star, ChevronDown, Sparkles, X, Briefcase } from 'lucide-react';

export const COMMON_DESIGNATIONS = [
  { id: 'asst_teacher', title: 'সহকারী শিক্ষক', isTop: true, desc: 'প্রাথমিক ও মাধ্যমিক বিদ্যালয় স্পেশাল' },
  { id: 'head_teacher', title: 'প্রধান শিক্ষক', isTop: false, desc: 'প্রাথমিক ও মাধ্যমিক বিদ্যালয়' },
  { id: 'head_teacher_current', title: 'প্রধান শিক্ষক (চলতি দায়িত্ব)', isTop: false, desc: 'সরকারি প্রাথমিক বিদ্যালয়' },
  { id: 'senior_teacher', title: 'সিনিয়র শিক্ষক', isTop: false, desc: 'মাধ্যমিক বিদ্যালয় ও কলেজ' },
  { id: 'asst_head_teacher', title: 'সহকারী প্রধান শিক্ষক', isTop: false, desc: 'মাধ্যমিক বিদ্যালয়' },
  { id: 'moulvi_teacher', title: 'সহকারী মৌলভী / ধর্মীয় শিক্ষক', isTop: false, desc: 'মাদ্রাসা ও সাধারণ বিদ্যালয়' },
  { id: 'physical_teacher', title: 'সহকারী শিক্ষক (শারীরিক শিক্ষা)', isTop: false, desc: 'বিদ্যালয় ও মাদ্রাসা' },
  { id: 'ict_teacher', title: 'সহকারী শিক্ষক (আইসিটি)', isTop: false, desc: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
  { id: 'office_assistant', title: 'অফিস সহকারী কাম কম্পিউটার অপারেটর', isTop: false, desc: 'দাপ্তরিক ও প্রশাসনিক' },
  { id: 'student', title: 'শিক্ষার্থী (ছাত্র / ছাত্রী)', isTop: false, desc: 'স্কুল, কলেজ ও বিশ্ববিদ্যালয়' },
];

interface DesignationSelectorProps {
  value: string;
  onChange: (designation: string) => void;
  showQuickChips?: boolean;
}

export const DesignationSelector: React.FC<DesignationSelectorProps> = ({
  value,
  onChange,
  showQuickChips = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleSelect = (title: string) => {
    onChange(title);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onChange(customText.trim());
      setCustomText('');
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-8"
            placeholder="পদবী লিখুন বা ডানদিকের বাটন থেকে নির্বাচন করুন"
          />
        </div>

        {/* Modal / Popup Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md shadow-xs cursor-pointer transition-colors whitespace-nowrap"
          title="পদবী নির্বাচন করুন পপআপ খুলুন"
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>পদবী নির্বাচন করুন</span>
          <ChevronDown className="w-3 h-3 text-emerald-700" />
        </button>
      </div>

      {/* Quick Chips with "সহকারী শিক্ষক" ALWAYS in the First/Top Position */}
      {showQuickChips && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-400 font-medium">দ্রুত পছন্দ:</span>

          {/* TOP HIGHLIGHTED: সহকারী শিক্ষক */}
          <button
            type="button"
            onClick={() => handleSelect('সহকারী শিক্ষক')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer border ${
              value === 'সহকারী শিক্ষক'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs scale-102'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>সহকারী শিক্ষক</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('প্রধান শিক্ষক')}
            className={`px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer border ${
              value === 'প্রধান শিক্ষক'
                ? 'bg-emerald-700 text-white border-emerald-800 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            প্রধান শিক্ষক
          </button>

          <button
            type="button"
            onClick={() => handleSelect('প্রধান শিক্ষক (চলতি দায়িত্ব)')}
            className={`px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer border ${
              value === 'প্রধান শিক্ষক (চলতি দায়িত্ব)'
                ? 'bg-emerald-700 text-white border-emerald-800 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            চলতি দায়িত্ব
          </button>

          <button
            type="button"
            onClick={() => handleSelect('শিক্ষার্থী')}
            className={`px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer border ${
              value === 'শিক্ষার্থী'
                ? 'bg-emerald-700 text-white border-emerald-800 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            শিক্ষার্থী
          </button>
        </div>
      )}

      {/* Designation Selection Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-sm font-bold text-white">পদবী নির্বাচন করুন (Select Designation)</h3>
                  <p className="text-[11px] text-emerald-200">নিচের তালিকা হতে পদবীটি বেছে নিন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {/* 1. TOP SPECIAL ROW: সহকারী শিক্ষক (সব অন্যান্য পদবীর উপরে) */}
              <div className="pb-2 border-b border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>সর্বোচ্চ পছন্দের পদবী (সবার উপরে):</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect('সহকারী শিক্ষক')}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    value === 'সহকারী শিক্ষক'
                      ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                      : 'bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>সহকারী শিক্ষক</span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                          প্রাথমিক শিক্ষক স্পেশাল
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        সকল প্রাথমিক ও মাধ্যমিক বিদ্যালয়ের শিক্ষকদের জন্য প্রধান পদবী
                      </p>
                    </div>
                  </div>
                  {value === 'সহকারী শিক্ষক' && (
                    <Check className="w-5 h-5 text-emerald-700 shrink-0" />
                  )}
                </button>
              </div>

              {/* 2. OTHER DESIGNATIONS */}
              <div className="pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  অন্যান্য সকল পদবী সমূহ:
                </div>

                <div className="space-y-1.5">
                  {COMMON_DESIGNATIONS.filter((d) => !d.isTop).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.title)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        value === item.title
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </div>
                      {value === item.title && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Manual Input form in modal footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="অন্য কোনো কাস্টম পদবী লিখুন..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  যোগ করুন
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
