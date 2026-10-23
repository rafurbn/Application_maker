import React from 'react';
import { SavedApplication } from '../types';
import { Trash2, ArrowUpRight, Bookmark, Calendar, Building2 } from 'lucide-react';
import { toBanglaDate } from '../utils/banglaUtils';
import { Modal } from './Modal';

interface SavedApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedApps: SavedApplication[];
  onLoadApp: (app: SavedApplication) => void;
  onDeleteApp: (id: string) => void;
}

export const SavedApplicationsModal: React.FC<SavedApplicationsModalProps> = ({
  isOpen,
  onClose,
  savedApps,
  onLoadApp,
  onDeleteApp,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="সংরক্ষিত দরখাস্তসমূহ"
      subtitle={`এই ব্রাউজারে সংরক্ষিত মোট ${savedApps.length}টি দরখাস্ত`}
      icon={<Bookmark className="w-4 h-4" />}
      maxWidth="max-w-2xl"
    >
      {savedApps.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">এখনো কোনো দরখাস্ত সংরক্ষণ করা হয়নি</p>
          <p className="text-xs text-slate-400">
            যেকোনো দরখাস্ত তৈরি করে "সংরক্ষণ" বাটনে ক্লিক করলে তা এখানে পাবেন।
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {savedApps.map((app) => (
            <li
              key={app.id}
              className="group p-4 rounded-2xl border border-slate-200 hover:border-emerald-500/60 bg-white hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {app.category === 'employee' ? 'চাকরিজীবী' : 'শিক্ষার্থী'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{app.formatTitle}</h4>
                </div>
                <p className="text-xs text-slate-600 truncate flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    {app.applicantName} • {app.workplace}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>সংরক্ষণ: {toBanglaDate(app.savedAt)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onLoadApp(app)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  <span>লোড করুন</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteApp(app.id)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="মুছে ফেলুন"
                  aria-label={`${app.formatTitle} মুছে ফেলুন`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};
