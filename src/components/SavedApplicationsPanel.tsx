import React from 'react';
import { SavedApplication } from '../types';
import { ALL_TEMPLATES } from '../data/templates';
import { toBanglaDate } from '../utils/banglaUtils';
import { ArrowUpRight, Bookmark, Trash2 } from 'lucide-react';

interface SavedApplicationsPanelProps {
  savedApps: SavedApplication[];
  onSave: () => void;
  onLoad: (app: SavedApplication) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
}

// The catalogue title carries a numbering and an English note meant for the format
// picker; a phone-sized list of saved applications wants the short name instead.
function listTitle(app: SavedApplication): string {
  return ALL_TEMPLATES.find((t) => t.id === app.formatId)?.shortTitle || app.formatTitle;
}

// Most teachers finish the whole job on a phone, so saving and the saved list sit
// at the bottom of the input form — the last thing a thumb touches after typing.
export const SavedApplicationsPanel: React.FC<SavedApplicationsPanelProps> = ({
  savedApps,
  onSave,
  onLoad,
  onDelete,
  onViewAll,
}) => {
  const recent = savedApps.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 mt-6">
      <button
        type="button"
        onClick={onSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-bold shadow-xs transition-colors"
        title="এই ডিভাইসের ব্রাউজারে দরখাস্তটি সংরক্ষণ করুন"
      >
        <Bookmark className="w-4 h-4" />
        <span>সেভ করুন</span>
      </button>
      <p className="text-[11px] text-slate-500 text-center -mt-2">
        সংরক্ষিত দরখাস্ত শুধু এই ফোন/ব্রাউজারে থাকে — অন্য কারো দেখতে পায় না।
      </p>

      <div className="pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            সাম্প্রতিক সংরক্ষিত ({savedApps.length})
          </h4>
          {savedApps.length > 0 && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              সব দেখুন
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            এখনো কিছু সেভ করেননি। তথ্য পূরণ শেষে উপরের <span className="font-semibold text-slate-600">সেভ করুন</span> বাটনে চাপ দিন।
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((app) => (
              <li
                key={app.id}
                className="rounded-xl border border-slate-200 hover:border-emerald-500/60 bg-slate-50/60 hover:bg-emerald-50/20 transition-colors flex items-center gap-2 px-3 py-2.5"
              >
                <button
                  onClick={() => onLoad(app)}
                  className="min-w-0 flex-1 text-left"
                  title="ফর্মে আবার খুলুন"
                >
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {listTitle(app)}
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    {app.applicantName} • {app.workplace} • {toBanglaDate(app.savedAt)}
                  </span>
                </button>
                <button
                  onClick={() => onLoad(app)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                  aria-label={`${app.formatTitle} ফর্মে খুলুন`}
                >
                  <span>খুলুন</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(app.id)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="মুছে ফেলুন"
                  aria-label={`${app.formatTitle} মুছে ফেলুন`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
