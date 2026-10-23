import React, { useState, useMemo } from 'react';
import { SubCategoryType, FormatTemplate, DashboardTheme } from '../types';
import { ALL_TEMPLATES } from '../data/templates';
import { DesignationSelector } from './DesignationSelector';
import { AdSlot } from './AdSlot';
import {
  CalendarDays,
  Activity,
  HeartHandshake,
  FileCheck,
  Clock,
  ShieldCheck,
  Plane,
  Award,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Gift,
  ArrowRightLeft,
  BadgeCheck,
  UserCheck,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Briefcase,
  School,
  Files,
  Printer,
  FolderOpen,
  Building2,
  FileText,
  Sliders,
  Palette,
  Download
} from 'lucide-react';

// Icon mapping matching the 15 templates with domain-specific coloring
const ICON_MAP: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
  CalendarDays: {
    icon: <CalendarDays className="w-5 h-5 text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  Activity: {
    icon: <Activity className="w-5 h-5 text-rose-600" />,
    bg: 'bg-rose-50',
    border: 'border-rose-200'
  },
  HeartHandshake: {
    icon: <HeartHandshake className="w-5 h-5 text-pink-600" />,
    bg: 'bg-pink-50',
    border: 'border-pink-200'
  },
  FileCheck: {
    icon: <FileCheck className="w-5 h-5 text-teal-600" />,
    bg: 'bg-teal-50',
    border: 'border-teal-200'
  },
  Clock: {
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  ShieldCheck: {
    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  Plane: {
    icon: <Plane className="w-5 h-5 text-cyan-600" />,
    bg: 'bg-cyan-50',
    border: 'border-cyan-200'
  },
  Award: {
    icon: <Award className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  GraduationCap: {
    icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  CalendarCheck: {
    icon: <CalendarCheck className="w-5 h-5 text-teal-600" />,
    bg: 'bg-teal-50',
    border: 'border-teal-200'
  },
  BookOpen: {
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  Gift: {
    icon: <Gift className="w-5 h-5 text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  ArrowRightLeft: {
    icon: <ArrowRightLeft className="w-5 h-5 text-rose-600" />,
    bg: 'bg-rose-50',
    border: 'border-rose-200'
  },
  BadgeCheck: {
    icon: <BadgeCheck className="w-5 h-5 text-indigo-600" />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  UserCheck: {
    icon: <UserCheck className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
};

// Tag labels for each template matching screenshot exactly
const TEMPLATE_CARD_TAGS: Record<string, string> = {
  casual_leave: 'নৈমিত্তিক ছুটি (CL)',
  medical_leave: 'চিকিৎসা ছুটি',
  maternity_leave: 'মাতৃত্বকালীন ছুটি',
  joining_letter: 'যোগদানপত্র (Joining)',
  prl_pension: 'পিআরএল ও পেনশন',
  passport_noc: 'পাসপোর্ট অনাপত্তি (NOC)',
  ex_bangladesh: 'বহিঃবাংলাদেশ ছুটি',
  earned_leave: 'অর্জিত / বৈবাহিক ছুটি',
  student_absence_leave: 'অনুপস্থিতি ছুটি',
  student_advance_leave: 'অগ্রিম ছুটি',
  student_fee_waiver: 'বিনা বেতনে অধ্যয়ন',
  student_poor_fund: 'দরিদ্র তহবিল সাহায্য',
  student_tc: 'ছাড়পত্র (TC)',
  student_testimonial: 'প্রশংসাপত্র (Testimonial)',
  student_readmission: 'পুনঃভর্তি',
};

// English subtitles matching screenshot
const TEMPLATE_ENGLISH_TITLES: Record<string, string> = {
  casual_leave: 'Casual Leave (CL)',
  medical_leave: 'Medical Leave',
  maternity_leave: 'Maternity Leave',
  joining_letter: 'Joining Report',
  prl_pension: 'PRL & Pension',
  passport_noc: 'Passport NOC',
  ex_bangladesh: 'Ex-Bangladesh Leave',
  earned_leave: 'Earned / Marriage Leave',
  student_absence_leave: 'Leave of Absence',
  student_advance_leave: 'Advance Leave',
  student_fee_waiver: 'Fee Waiver / Free Studentship',
  student_poor_fund: 'Poor Fund Assistance',
  student_tc: 'Transfer Certificate (TC)',
  student_testimonial: 'Testimonial Application',
  student_readmission: 'Re-admission',
};

interface HomeScreenProps {
  onSelectTemplate: (templateId: SubCategoryType) => void;
  onDirectPrint?: (templateId: SubCategoryType) => void;
  onOpenFolderUploader?: () => void;
  globalDesignation: string;
  onUpdateGlobalDesignation: (desig: string) => void;
  theme: DashboardTheme;
  onThemeChange: (theme: DashboardTheme) => void;
  onInstallApp?: () => void;
  isInstallable?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectTemplate,
  onDirectPrint,
  onOpenFolderUploader,
  globalDesignation,
  onUpdateGlobalDesignation,
  theme,
  onThemeChange,
  onInstallApp,
  isInstallable = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'employee' | 'student'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const employeeTemplates = useMemo(
    () => ALL_TEMPLATES.filter((t) => t.category === 'employee'),
    []
  );

  const studentTemplates = useMemo(
    () => ALL_TEMPLATES.filter((t) => t.category === 'student'),
    []
  );

  // Quick filter tags from screenshot
  const filterChips = [
    { label: 'সব', value: 'all' },
    { label: 'ছুটি', value: 'ছুটি' },
    { label: 'মেডিকেল', value: 'চিকিৎসা' },
    { label: 'মাতৃত্বকালীন', value: 'মাতৃত্বকালীন' },
    { label: 'পাসপোর্ট/NOC', value: 'পাসপোর্ট' },
    { label: 'টিসি (TC)', value: 'ছাড়পত্র' },
    { label: 'পেনশন/PRL', value: 'পেনশন' },
    { label: 'ফি মওকুফ', value: 'বিনা বেতনে' },
    { label: 'রি-ভর্তি', value: 'পুনঃভর্তি' },
  ];

  const matchesFilter = (template: FormatTemplate) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        template.title.toLowerCase().includes(q) ||
        template.shortTitle.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.defaultSubject.toLowerCase().includes(q) ||
        (TEMPLATE_ENGLISH_TITLES[template.id] || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    // Tag chip
    if (selectedTag !== 'all') {
      const tag = selectedTag.toLowerCase();
      const matchTag =
        template.title.toLowerCase().includes(tag) ||
        template.shortTitle.toLowerCase().includes(tag) ||
        template.description.toLowerCase().includes(tag) ||
        template.defaultSubject.toLowerCase().includes(tag) ||
        (TEMPLATE_CARD_TAGS[template.id] || '').toLowerCase().includes(tag);
      if (!matchTag) return false;
    }

    return true;
  };

  const filteredEmployee = employeeTemplates.filter(matchesFilter);
  const filteredStudent = studentTemplates.filter(matchesFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* 1. Theme Selector Banner Bar (matching image_102660cd.png top banner) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>ড্যাশবোর্ড ব্যাকগ্রাউন্ড কালার নির্বাচন:</span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-semibold">
          <button
            onClick={() => onThemeChange('executive')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              theme === 'executive'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>🌿 এক্সিকিউটিভ স্যুট</span>
          </button>

          <button
            onClick={() => onThemeChange('ivory')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              theme === 'ivory'
                ? 'bg-amber-700 text-white border-amber-800 shadow-2xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>📜 আইভোরি ক্লাসিক</span>
          </button>

          <button
            onClick={() => onThemeChange('navy')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              theme === 'navy'
                ? 'bg-blue-800 text-white border-blue-900 shadow-2xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>🏛️ রয়্যাল নেভি</span>
          </button>

          <button
            onClick={() => onThemeChange('cyber')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              theme === 'cyber'
                ? 'bg-slate-900 text-white border-slate-950 shadow-2xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>⚪ ক্লিন হোয়াইট</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Banner (matching image_102660cd.png) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06392a] via-[#094735] to-[#04281c] text-white p-6 sm:p-9 shadow-xl border border-emerald-800/70">
        
        {/* Subtle Watermark Stamp Illustration on the right */}
        <div className="absolute right-6 bottom-4 opacity-15 pointer-events-none hidden md:block">
          <svg className="w-64 h-64 text-emerald-300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="25" y="10" width="50" height="20" rx="8" />
            <rect x="18" y="32" width="64" height="24" rx="8" />
            <rect x="10" y="58" width="80" height="30" rx="8" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-800/80 border border-emerald-600/60 text-emerald-200 text-xs font-bold">
              অফিসিয়াল দরখাস্ত প্রস্তুতকারক
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-800/80 border border-emerald-600/60 text-emerald-200 text-xs font-semibold">
              নো-লগইন
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-800/80 border border-emerald-600/60 text-emerald-200 text-xs font-semibold">
              ফাস্ট প্রিন্ট PWA
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            মাত্র কয়েকটি ইনপুটে প্রস্তুত করুন নিখুঁত <br />
            <span className="text-emerald-300">অফিসিয়াল বাংলা দরখাস্ত</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            সরকারি প্রাথমিক বিদ্যালয়ের সহকারী ও প্রধান শিক্ষকের জন্য ৮টি বিশেষ সরকারি ফরম্যাট এবং স্কুল-কলেজের শিক্ষার্থীদের জন্য ৭টি প্রাতিষ্ঠানিক ফরম্যাট। সরাসরি প্রিন্ট ও PDF ডাউনলোড করুন।
          </p>

          {/* Bullet Features */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 text-xs text-emerald-200 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>সরকারি নিয়ম অনুযায়ী সঠিক ভাষা</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>লাইভ প্রিভিউ ও ১-ক্লিকে PDF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>ডাটাবেজ ছাড়াই ডিভাইসেই অটো সেভ</span>
            </div>
          </div>

          {/* 3 Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectTemplate('casual_leave')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
            >
              <span>প্রথম আবেদন তৈরি শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('student');
                const el = document.getElementById('student-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-900 text-white border border-emerald-700/80 font-bold text-xs sm:text-sm transition-all"
            >
              <School className="w-4 h-4 text-emerald-300" />
              <span>স্কুল ও কলেজের শিক্ষার্থী</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
            </button>

            <button
              onClick={onOpenFolderUploader}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-amber-300 border border-emerald-800/80 font-bold text-xs sm:text-sm transition-all"
            >
              <FolderOpen className="w-4 h-4 text-amber-300" />
              <span>পিসির Application ফোল্ডার</span>
            </button>

            {onInstallApp && (
              <button
                onClick={onInstallApp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
                title="PWA অ্যাপ্লিকেশনটি মোবাইল বা কম্পিউটারে ইনস্টল করুন"
              >
                <Download className="w-4 h-4 text-amber-950" />
                <span>অ্যাপ ইনস্টল করুন (PWA)</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Designation Selector Card ("আবেদনকারীর পদবী নির্বাচন" from image_102660cd.png) */}
      <div className="bg-white rounded-2xl border-2 border-emerald-300/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left Side: Info and Notice */}
          <div className="flex items-start gap-3 max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  আবেদনকারীর পদবী নির্বাচন:
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  সকল ফরম্যাটে প্রযোজ্য
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                যেকোনো এ্যাপে পদবী সমূহের শীর্ষে <span className="font-bold text-emerald-800">“সহকারী শিক্ষক”</span> পদবী অন্তর্ভুক্ত রয়েছে
              </p>
            </div>
          </div>

          {/* Right Side: Input, Popup Trigger, and Quick Chips */}
          <div className="w-full lg:max-w-md">
            <DesignationSelector
              value={globalDesignation}
              onChange={onUpdateGlobalDesignation}
              showQuickChips={true}
            />
          </div>

        </div>
      </div>

      {/* 4. Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        
        {/* Top Row: 3 Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Main 3 Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব ফরম্যাট (১৫)
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'employee'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>১. চাকরিজীবী পার্ট (৮)</span>
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>২. শিক্ষার্থী পার্ট (৭)</span>
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="দরখাস্ত খুঁজুন (যেমন: ছুটি, পাসপোর্ট, টিসি, যোগদান)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

        </div>

        {/* Bottom Row: Quick Filter Tag Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-slate-500">ফিল্টারিং:</span>
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setSelectedTag(chip.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedTag === chip.value
                  ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

      </div>

      {/* 5. Part 1: চাকরিজীবী (প্রাথমিক বিদ্যালয় স্পেশাল) Grid (8 Cards) */}
      {(activeTab === 'all' || activeTab === 'employee') && filteredEmployee.length > 0 && (
        <section className="space-y-3.5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    পার্ট ১: চাকরিজীবী (প্রাথমিক বিদ্যালয় স্পেশাল)
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ৮টি সরকারি
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  সহকারী শিক্ষক, প্রধান শিক্ষক (চলতি দায়িত্বসহ) ও সরকারি কর্মকর্তা কর্মচারীদের জন্য নির্ধারিত ফরম্যাট
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEmployee.map((tmpl) => {
              const iconData = ICON_MAP[tmpl.iconName] || {
                icon: <Files className="w-5 h-5 text-emerald-600" />,
                bg: 'bg-slate-50',
                border: 'border-slate-200',
              };
              const englishTitle = TEMPLATE_ENGLISH_TITLES[tmpl.id] || '';
              const cardTag = TEMPLATE_CARD_TAGS[tmpl.id] || tmpl.shortTitle;

              return (
                <div
                  key={tmpl.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl ${iconData.bg} border ${iconData.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        {iconData.icon}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {cardTag}
                      </span>
                    </div>

                    {/* Title & English Subtitle & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {tmpl.title}
                      </h3>
                      {englishTitle && (
                        <p className="text-[11px] text-slate-400 font-medium">
                          {englishTitle}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>

                  {/* Dual Action Buttons from Screenshot: [প্রিন্ট] & [তৈরি করুন ->] */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDirectPrint ? onDirectPrint(tmpl.id) : onSelectTemplate(tmpl.id)}
                      className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      title="নমুনা সরাসরি প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>প্রিন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTemplate(tmpl.id)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 group-hover:translate-x-0.5"
                    >
                      <span>তৈরি করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Phase 2 Notification Banner (matching image_102660cd.png) */}
      <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/90 p-4 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2">
            <span>বিজ্ঞপ্তি ও অনুমোদন তথ্য (PHASE 2)</span>
          </h4>
          <p className="text-xs text-emerald-800/80">
            সকল আবেদনপত্র সম্পূর্ণ সরকারি নিয়মানুযায়ী স্ট্যান্ডার্ড A4 ফরম্যাটে এবং Left Aligned ও Justified বডি স্টাইলে সাজানো।
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFolderUploader}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs transition-colors shrink-0"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>পিসির ফাইল থেকে ইনপুট করুন</span>
        </button>
      </div>

      {/* Middle AdSlot */}
      <AdSlot slotId="home-middle-slot" format="banner" />

      {/* 7. Part 2: শিক্ষার্থী (স্কুল, কলেজ ও বিশ্ববিদ্যালয়) Grid (7 Cards) */}
      {(activeTab === 'all' || activeTab === 'student') && filteredStudent.length > 0 && (
        <section id="student-section" className="space-y-3.5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                <School className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    পার্ট ২: শিক্ষার্থী (স্কুল, কলেজ ও বিশ্ববিদ্যালয়)
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                    ৭টি সরকারি
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  প্রাতিষ্ঠানিক প্রধান (প্রধান শিক্ষক / অধ্যক্ষ) বরাবর আবেদনের জন্য ৭টি প্রয়োজনীয় ফরম্যাট
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStudent.map((tmpl) => {
              const iconData = ICON_MAP[tmpl.iconName] || {
                icon: <School className="w-5 h-5 text-blue-600" />,
                bg: 'bg-blue-50',
                border: 'border-blue-200',
              };
              const englishTitle = TEMPLATE_ENGLISH_TITLES[tmpl.id] || '';
              const cardTag = TEMPLATE_CARD_TAGS[tmpl.id] || tmpl.shortTitle;

              return (
                <div
                  key={tmpl.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl ${iconData.bg} border ${iconData.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        {iconData.icon}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {cardTag}
                      </span>
                    </div>

                    {/* Title & English Subtitle & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-800 transition-colors line-clamp-1">
                        {tmpl.title}
                      </h3>
                      {englishTitle && (
                        <p className="text-[11px] text-slate-400 font-medium">
                          {englishTitle}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>

                  {/* Dual Action Buttons from Screenshot: [প্রিন্ট] & [তৈরি করুন ->] */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDirectPrint ? onDirectPrint(tmpl.id) : onSelectTemplate(tmpl.id)}
                      className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      title="নমুনা সরাসরি প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>প্রিন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTemplate(tmpl.id)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 group-hover:translate-x-0.5"
                    >
                      <span>তৈরি করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* No Results Message */}
      {filteredEmployee.length === 0 && filteredStudent.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-500 text-sm">কোনো দরখাস্তের ফরম্যাট খুঁজে পাওয়া যায়নি।</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('all');
            }}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            সার্চ ও ফিল্টার ক্লিয়ার করুন
          </button>
        </div>
      )}

    </div>
  );
};
