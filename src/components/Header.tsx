import React from 'react';
import {
  FileText,
  ShieldCheck,
  Check,
  Printer,
  ClipboardPaste,
  Database,
  LayoutDashboard,
  Eye,
  Edit3,
  Bookmark,
  Download,
} from 'lucide-react';
import { DashboardTheme } from '../types';

export type AppNav = 'dashboard' | 'preview' | 'editor' | 'import' | 'data' | 'saved';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  activeNav?: AppNav;
  onNavChange?: (nav: AppNav) => void;
  theme?: DashboardTheme;
  onThemeChange?: (theme: DashboardTheme) => void;
  hasActiveApplication?: boolean;
  onInstallApp?: () => void;
  isInstallable?: boolean;
}

const THEME_BUTTONS: { value: DashboardTheme; label: string; activeClass: string; title: string }[] = [
  { value: 'executive', label: 'মিন্ট', activeClass: 'bg-emerald-600 text-white font-bold', title: 'মিন্ট এক্সিকিউটিভ থিম' },
  { value: 'ivory', label: 'আইভোরি', activeClass: 'bg-amber-600 text-white font-bold', title: 'আইভোরি ক্লাসিক থিম' },
  { value: 'cyber', label: 'ডার্ক', activeClass: 'bg-emerald-700 text-white font-bold', title: 'ডার্ক সাইবার থিম' },
  { value: 'navy', label: 'নেভি', activeClass: 'bg-blue-600 text-white font-bold', title: 'রয়্যাল নেভি থিম' },
];

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  onOpenAdmin,
  onGoHome,
  activeNav = 'dashboard',
  onNavChange,
  theme = 'executive',
  onThemeChange,
  hasActiveApplication = false,
  onInstallApp,
  isInstallable = false,
}) => {
  const navItems: { nav: AppNav; label: string; icon: React.ReactNode }[] = [
    { nav: 'dashboard', label: 'ড্যাশবোর্ড', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { nav: 'preview', label: 'প্রিন্ট প্রিভিউ (A4)', icon: <Eye className="w-3.5 h-3.5" /> },
    { nav: 'editor', label: 'তথ্য পূরণ', icon: <Edit3 className="w-3.5 h-3.5" /> },
    { nav: 'import', label: 'লেখা পেস্ট', icon: <ClipboardPaste className="w-3.5 h-3.5 text-amber-300" /> },
    { nav: 'data', label: 'তথ্য ও ব্যাকআপ', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="no-print sticky top-0 z-40 shadow-md">
      {/* Brand bar */}
      <div className="bg-[#042f24] border-b border-emerald-900/60 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 text-left group focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                  অফিসিয়াল দরখাস্ত প্রস্তুতকারক
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-200 border border-emerald-700/80">
                  লগইন ছাড়া
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 hidden sm:block">
                লেখা বামে সারিবদ্ধ, বডি জাস্টিফাইড — A4 প্রিন্ট উপযোগী
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            {onThemeChange && (
              <div
                className="hidden lg:flex items-center bg-emerald-950/70 p-1 rounded-xl border border-emerald-800/60 text-[11px]"
                role="group"
                aria-label="থিম নির্বাচন"
              >
                {THEME_BUTTONS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => onThemeChange(item.value)}
                    aria-pressed={theme === item.value}
                    title={item.title}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                      theme === item.value
                        ? item.activeClass
                        : 'text-emerald-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-[11px] font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Left Aligned</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-[11px] font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Body Justified</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-bold shadow-xs">
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>প্রিন্ট রেডি</span>
              </span>
            </div>

            {onInstallApp && (
              <button
                onClick={onInstallApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-md transition-all hover:scale-102"
                title={
                  isInstallable
                    ? 'অ্যাপটি মোবাইল বা পিসিতে ইনস্টল করুন'
                    : 'হোম স্ক্রিনে যোগ করার নিয়ম দেখান'
                }
              >
                <Download className="w-3.5 h-3.5 text-amber-950" />
                <span className="hidden sm:inline">অ্যাপ ইনস্টল করুন</span>
                <span className="sm:hidden">ইনস্টল</span>
              </button>
            )}

            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
              title="অ্যাডমিন প্যানেল (/admin-panel)"
              aria-label="অ্যাডমিন প্যানেল"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub navigation */}
      <nav
        aria-label="অ্যাপ নেভিগেশন"
        className="bg-[#021f17] border-b border-emerald-950 text-emerald-100 text-xs font-semibold"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-1.5 gap-2 scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.nav;
              const isDisabledTab =
                (item.nav === 'preview' || item.nav === 'editor') && !hasActiveApplication;
              return (
                <button
                  key={item.nav}
                  onClick={() => onNavChange?.(item.nav)}
                  aria-current={isActive ? 'page' : undefined}
                  title={isDisabledTab ? 'আগে একটি ফরম্যাট বাছুন' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-emerald-900/60">
            <button
              onClick={onOpenSaved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors whitespace-nowrap border border-emerald-700/50"
              title="এই ডিভাইসে সংরক্ষিত দরখাস্ত"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-300" />
              <span>আমার সংরক্ষিত</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
