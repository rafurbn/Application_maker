import React from 'react';
import {
  FileText,
  Bookmark,
  ShieldCheck,
  Check,
  Printer,
  Sliders,
  FolderOpen,
  LayoutDashboard,
  Eye,
  Edit3,
  UserCheck,
  Download
} from 'lucide-react';
import { DashboardTheme } from '../types';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  activeNav?: string;
  onNavChange?: (nav: 'dashboard' | 'preview' | 'editor' | 'folder' | 'settings' | 'approver') => void;
  theme?: DashboardTheme;
  onThemeChange?: (theme: DashboardTheme) => void;
  onOpenFolderUploader?: () => void;
  onOpenPrintSettings?: () => void;
  hasActiveApplication?: boolean;
  onInstallApp?: () => void;
  isInstallable?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  onOpenAdmin,
  onGoHome,
  activeNav = 'dashboard',
  onNavChange,
  theme = 'executive',
  onThemeChange,
  onOpenFolderUploader,
  onOpenPrintSettings,
  hasActiveApplication = false,
  onInstallApp,
  isInstallable = false,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 shadow-md">
      {/* Top Main Bar: Dark Emerald Brand Bar */}
      <div className="bg-[#042f24] border-b border-emerald-900/60 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Left */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                  অফিসিয়াল দরখাস্ত প্রস্তুতকারক
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-200 border border-emerald-700/80">
                  খাঁটি সরকারি
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 hidden sm:block">
                Left Aligned & Justified খাঁটি সরকারি ফরম্যাট A4 প্রিন্ট উপযোগী
              </p>
            </div>
          </button>

          {/* Center-Right: Theme Small Toggles, Status Indicators & Install Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Quick Theme Switchers Pill (ডিপ, সিলভার, ডার্ক, নেভি) */}
            {onThemeChange && (
              <div className="hidden lg:flex items-center bg-emerald-950/70 p-1 rounded-xl border border-emerald-800/60 text-[11px]">
                <button
                  onClick={() => onThemeChange('executive')}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                    theme === 'executive' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="এক্সিকিউটিভ স্যুট থিম"
                >
                  ডিপ
                </button>
                <button
                  onClick={() => onThemeChange('ivory')}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                    theme === 'ivory' ? 'bg-amber-600 text-white font-bold' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="আইভোরি ক্লাসিক থিম"
                >
                  সিলভার
                </button>
                <button
                  onClick={() => onThemeChange('cyber')}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                    theme === 'cyber' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="সাইবার ডার্ক থিম"
                >
                  ডার্ক
                </button>
                <button
                  onClick={() => onThemeChange('navy')}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                    theme === 'navy' ? 'bg-blue-600 text-white font-bold' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="রয়্যাল নেভি থিম"
                >
                  নেভি
                </button>
              </div>
            )}

            {/* Badges from Screenshot */}
            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-[11px] font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Left Aligned</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-[11px] font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Body Justified</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>অফলাইন</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-bold shadow-xs">
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>প্রিন্ট রেডি</span>
              </span>
            </div>

            {/* In-App Install App Button (PWA) */}
            {onInstallApp && (
              <button
                onClick={onInstallApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-md transition-all hover:scale-102"
                title="অ্যাপটি মোবাইল বা পিসিতে ইনস্টল করুন"
              >
                <Download className="w-3.5 h-3.5 text-amber-950" />
                <span className="hidden sm:inline">অ্যাপ ইনস্টল করুন</span>
                <span className="sm:hidden">ইনস্টল</span>
              </button>
            )}

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
              title="অ্যাডমিন ও সিস্টেম ইনফো (/admin-panel)"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>

      {/* Bottom Sub-Navigation Bar: Deep Forest Green (#021e17) */}
      <div className="bg-[#021f17] border-b border-emerald-950 text-emerald-100 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-1.5 gap-2 scrollbar-none">
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dashboard Tab */}
            <button
              onClick={() => {
                if (onNavChange) onNavChange('dashboard');
                onGoHome();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeNav === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>ড্যাশবোর্ড (Dashboard)</span>
            </button>

            {/* Print Preview A4 Tab */}
            <button
              onClick={() => {
                if (onNavChange) onNavChange('preview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeNav === 'preview'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>প্রিন্ট প্রিভিউ (A4)</span>
            </button>

            {/* Application Editor Tab */}
            <button
              onClick={() => {
                if (onNavChange) onNavChange('editor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeNav === 'editor'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>আবেদনপত্র সম্পাদনা</span>
            </button>

            {/* Folder Loader (Application) */}
            <button
              onClick={() => {
                if (onOpenFolderUploader) onOpenFolderUploader();
                else if (onNavChange) onNavChange('folder');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeNav === 'folder'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>ফোল্ডার লোডার (Application)</span>
            </button>

            {/* Print Settings */}
            <button
              onClick={() => {
                if (onOpenPrintSettings) onOpenPrintSettings();
                else if (onNavChange) onNavChange('settings');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeNav === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>প্রিন্ট সেটিংস</span>
            </button>
          </div>

          {/* Right Action: Approver / Saved Applications */}
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-900/60">
            <button
              onClick={onOpenSaved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors whitespace-nowrap border border-emerald-700/50"
              title="অনুমোদনকারী ও সংরক্ষিত দরখাস্ত"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>অনুমোদনকারী</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
