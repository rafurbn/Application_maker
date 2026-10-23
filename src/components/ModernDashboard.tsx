import React, { useState, useMemo } from 'react';
import { OfficialApplication, ApplicationSection, DashboardTheme } from '../types';
import {
  Calendar,
  Activity,
  Heart,
  FileText,
  Clock,
  ShieldCheck,
  Plane,
  Briefcase,
  GraduationCap,
  BookOpen,
  Wallet,
  Repeat,
  Award,
  UserCheck,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Building2,
  FileCheck,
  X,
  Printer,
  Palette
} from 'lucide-react';
import { DesignationSelector } from './DesignationSelector';

interface ModernDashboardProps {
  applications: OfficialApplication[];
  onSelectApplication: (app: OfficialApplication) => void;
  onOpenFolderUploader: () => void;
  theme: DashboardTheme;
  onThemeChange: (theme: DashboardTheme) => void;
  onUpdateGlobalDesignation?: (designation: string) => void;
  currentGlobalDesignation?: string;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  applications,
  onSelectApplication,
  onOpenFolderUploader,
  theme,
  onThemeChange,
  onUpdateGlobalDesignation,
  currentGlobalDesignation = 'সহকারী শিক্ষক',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | ApplicationSection>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [previewApp, setPreviewApp] = useState<OfficialApplication | null>(null);

  const isDark = theme === 'cyber' || theme === 'navy';

  // Helper for rendering icons
  const getIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'calendar': return <Calendar className={className} />;
      case 'activity': return <Activity className={className} />;
      case 'heart': return <Heart className={className} />;
      case 'file-text': return <FileText className={className} />;
      case 'clock': return <Clock className={className} />;
      case 'shield': return <ShieldCheck className={className} />;
      case 'plane': return <Plane className={className} />;
      case 'briefcase': return <Briefcase className={className} />;
      case 'graduation-cap': return <GraduationCap className={className} />;
      case 'book-open': return <BookOpen className={className} />;
      case 'wallet': return <Wallet className={className} />;
      case 'repeat': return <Repeat className={className} />;
      case 'award': return <Award className={className} />;
      case 'user-check': return <UserCheck className={className} />;
      default: return <FileText className={className} />;
    }
  };

  // Accent color themes for cards adapting to Dark or Light modes
  const getThemeStyles = (color: string) => {
    if (theme === 'cyber') {
      switch (color) {
        case 'rose':
          return {
            iconBg: 'bg-rose-950/80 text-rose-300 border-rose-800/50 group-hover:bg-rose-600 group-hover:text-white',
            tag: 'text-rose-300 bg-rose-950/60 border-rose-800/60',
            dot: 'bg-rose-400',
            topLine: 'from-rose-500 via-pink-400 to-rose-300',
            hoverBorder: 'hover:border-rose-400/80',
            btn: 'bg-rose-950/80 hover:bg-rose-600 text-rose-200 hover:text-white',
          };
        case 'indigo':
        case 'blue':
          return {
            iconBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50 group-hover:bg-indigo-600 group-hover:text-white',
            tag: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/60',
            dot: 'bg-indigo-400',
            topLine: 'from-indigo-500 via-cyan-400 to-blue-400',
            hoverBorder: 'hover:border-indigo-400/80',
            btn: 'bg-indigo-950/80 hover:bg-indigo-600 text-indigo-200 hover:text-white',
          };
        case 'amber':
          return {
            iconBg: 'bg-amber-950/80 text-amber-300 border-amber-800/50 group-hover:bg-amber-600 group-hover:text-white',
            tag: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
            dot: 'bg-amber-400',
            topLine: 'from-amber-500 via-orange-400 to-yellow-300',
            hoverBorder: 'hover:border-amber-400/80',
            btn: 'bg-amber-950/80 hover:bg-amber-600 text-amber-200 hover:text-white',
          };
        case 'cyan':
        case 'teal':
        case 'emerald':
        default:
          return {
            iconBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50 group-hover:bg-emerald-600 group-hover:text-white',
            tag: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60',
            dot: 'bg-emerald-400',
            topLine: 'from-emerald-500 via-teal-400 to-cyan-400',
            hoverBorder: 'hover:border-emerald-400/80',
            btn: 'bg-emerald-950/80 hover:bg-emerald-600 text-emerald-200 hover:text-white',
          };
      }
    }

    if (theme === 'navy') {
      switch (color) {
        case 'rose':
          return {
            iconBg: 'bg-pink-950/80 text-pink-300 border-pink-800/50 group-hover:bg-pink-600 group-hover:text-white',
            tag: 'text-pink-300 bg-pink-950/60 border-pink-800/60',
            dot: 'bg-pink-400',
            topLine: 'from-pink-500 via-rose-400 to-red-300',
            hoverBorder: 'hover:border-pink-400/80',
            btn: 'bg-pink-950/80 hover:bg-pink-600 text-pink-200 hover:text-white',
          };
        case 'amber':
          return {
            iconBg: 'bg-amber-950/80 text-amber-300 border-amber-800/50 group-hover:bg-amber-600 group-hover:text-white',
            tag: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
            dot: 'bg-amber-400',
            topLine: 'from-amber-500 via-orange-400 to-yellow-300',
            hoverBorder: 'hover:border-amber-400/80',
            btn: 'bg-amber-950/80 hover:bg-amber-600 text-amber-200 hover:text-white',
          };
        default:
          return {
            iconBg: 'bg-blue-950/80 text-cyan-300 border-blue-800/50 group-hover:bg-blue-600 group-hover:text-white',
            tag: 'text-cyan-300 bg-blue-950/60 border-blue-800/60',
            dot: 'bg-cyan-400',
            topLine: 'from-blue-500 via-indigo-400 to-cyan-300',
            hoverBorder: 'hover:border-cyan-400/80',
            btn: 'bg-blue-950/80 hover:bg-blue-600 text-blue-200 hover:text-white',
          };
      }
    }

    // Default Light (Executive & Ivory)
    switch (color) {
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200 group-hover:bg-rose-600 group-hover:text-white',
          tag: 'text-rose-700 bg-rose-50/90 border-rose-200',
          dot: 'bg-rose-500',
          topLine: 'from-rose-500 via-pink-400 to-rose-300',
          hoverBorder: 'hover:border-rose-400/80',
          btn: 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white',
          tag: 'text-indigo-700 bg-indigo-50/90 border-indigo-200',
          dot: 'bg-indigo-500',
          topLine: 'from-indigo-600 via-blue-500 to-cyan-400',
          hoverBorder: 'hover:border-indigo-400/80',
          btn: 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white',
        };
      case 'blue':
        return {
          iconBg: 'bg-sky-50 text-sky-600 border-sky-200 group-hover:bg-sky-600 group-hover:text-white',
          tag: 'text-sky-700 bg-sky-50/90 border-sky-200',
          dot: 'bg-sky-500',
          topLine: 'from-blue-500 via-sky-400 to-indigo-300',
          hoverBorder: 'hover:border-sky-400/80',
          btn: 'bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white',
          tag: 'text-amber-800 bg-amber-50/90 border-amber-200',
          dot: 'bg-amber-500',
          topLine: 'from-amber-500 via-orange-400 to-yellow-300',
          hoverBorder: 'hover:border-amber-400/80',
          btn: 'bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white',
        };
      case 'teal':
        return {
          iconBg: 'bg-teal-50 text-teal-600 border-teal-200 group-hover:bg-teal-600 group-hover:text-white',
          tag: 'text-teal-700 bg-teal-50/90 border-teal-200',
          dot: 'bg-teal-500',
          topLine: 'from-teal-500 via-emerald-400 to-teal-300',
          hoverBorder: 'hover:border-teal-400/80',
          btn: 'bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white',
        };
      case 'cyan':
        return {
          iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200 group-hover:bg-cyan-600 group-hover:text-white',
          tag: 'text-cyan-800 bg-cyan-50/90 border-cyan-200',
          dot: 'bg-cyan-500',
          topLine: 'from-cyan-500 via-sky-400 to-blue-300',
          hoverBorder: 'hover:border-cyan-400/80',
          btn: 'bg-cyan-50 hover:bg-cyan-600 text-cyan-800 hover:text-white',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-600 border-purple-200 group-hover:bg-purple-600 group-hover:text-white',
          tag: 'text-purple-700 bg-purple-50/90 border-purple-200',
          dot: 'bg-purple-500',
          topLine: 'from-purple-600 via-fuchsia-400 to-indigo-300',
          hoverBorder: 'hover:border-purple-400/80',
          btn: 'bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white',
        };
      case 'emerald':
      default:
        return {
          iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-700 group-hover:text-white',
          tag: 'text-emerald-800 bg-emerald-50/90 border-emerald-200',
          dot: 'bg-emerald-500',
          topLine: 'from-emerald-600 via-teal-400 to-green-300',
          hoverBorder: 'hover:border-emerald-400/80',
          btn: 'bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white',
        };
    }
  };

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Section filter
      if (selectedSection !== 'all' && app.section !== selectedSection) {
        return false;
      }
      // Tag filter
      if (selectedTag !== 'all') {
        const matchesTag =
          app.badge.toLowerCase().includes(selectedTag.toLowerCase()) ||
          app.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
          app.subject.toLowerCase().includes(selectedTag.toLowerCase());
        if (!matchesTag) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          app.title.toLowerCase().includes(query) ||
          (app.englishTitle && app.englishTitle.toLowerCase().includes(query)) ||
          app.badge.toLowerCase().includes(query) ||
          app.subject.toLowerCase().includes(query) ||
          app.summary.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [applications, selectedSection, selectedTag, searchQuery]);

  const employeeApps = filteredApplications.filter((a) => a.section === 'employee');
  const studentApps = filteredApplications.filter((a) => a.section === 'student');

  const popularTags = [
    { label: 'সব', value: 'all' },
    { label: 'ছুটি', value: 'ছুটি' },
    { label: 'মেডিক্যাল', value: 'মেডিক্যাল' },
    { label: 'মাতৃত্বকালীন', value: 'মাতৃত্বকালীন' },
    { label: 'পাসপোর্ট NOC', value: 'পাসপোর্ট' },
    { label: 'টিসি (TC)', value: 'ছাড়পত্র' },
    { label: 'প্রশংসাপত্র', value: 'প্রশংসাপত্র' },
    { label: 'বিনা বেতন', value: 'বিনা বেতনে' },
    { label: 'পিআরএল', value: 'পিআরএল' },
  ];

  // Theme descriptions
  const themeOptions = [
    { id: 'executive', name: '🌿 এক্সিকিউটিভ স্লেট', desc: 'মডার্ন সফট টেক ও এম্বিয়েন্ট গ্লো (সুপারিশকৃত)' },
    { id: 'cyber', name: '⚡ সাইবার ডার্ক', desc: 'ফিউচারিস্টিক হাই-টেক ডার্ক মোড' },
    { id: 'navy', name: '🏛️ রয়্যাল নেভি', desc: 'কর্পোরেট ডিপ স্যাফায়ার ব্লু' },
    { id: 'ivory', name: '📜 ক্লাসিক আইভরি', desc: 'অফিসিয়াল গোল্ড ও পেপার ফিনিশ' },
  ];

  // Theme specific container classes
  const cardContainerClass = isDark
    ? theme === 'cyber'
      ? 'bg-[#072118]/85 border-emerald-800/40 text-white'
      : 'bg-[#0f1d38]/85 border-blue-900/50 text-white'
    : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-sm';

  const cardTitleClass = isDark
    ? 'text-white'
    : 'text-slate-900';

  const cardDescClass = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const cardFooterClass = isDark
    ? 'bg-black/25 border-t border-white/10'
    : 'bg-slate-50/70 border-t border-slate-100';

  const toolbarClass = isDark
    ? theme === 'cyber'
      ? 'bg-[#072118]/90 border-emerald-800/50 text-white'
      : 'bg-[#0f1d38]/90 border-blue-900/50 text-white'
    : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-sm';

  const inputClass = isDark
    ? 'bg-black/40 border-white/20 text-white placeholder:text-slate-400 focus:border-emerald-400'
    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500';

  return (
    <div className="space-y-8">
      {/* ======================================================== */}
      {/* 0. THEME ATMOSPHERE CONTROLLER BAR */}
      {/* ======================================================== */}
      <div className={`rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 backdrop-blur-md border ${
        isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white/80 border-emerald-200/60 shadow-xs text-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <Palette className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
          <span className="text-xs font-bold">
            ড্যাশবোর্ড ব্যাকগ্রাউন্ড কালার নির্বাচন:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full md:w-auto">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onThemeChange(opt.id as DashboardTheme)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                theme === opt.id
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50 scale-[1.02]'
                  : isDark
                  ? 'bg-white/10 hover:bg-white/20 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{opt.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. HIGH-TECH ULTRA-MODERN HERO BANNER */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#05261c] via-[#093527] to-[#041a13] text-white shadow-2xl border border-emerald-500/30 p-6 sm:p-9 lg:p-10">
        {/* Ambient Glows & Tech Grid Accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />

        {/* Large Decorative SVG Outline matching official briefcase silhouette */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden lg:block">
          <svg className="w-64 h-64 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Tech Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>অফিসিয়াল দরখাস্ত প্রস্তুতকারক</span>
            <span className="text-emerald-400/60">·</span>
            <span>পেশা-ভিত্তিক</span>
            <span className="text-emerald-400/60">·</span>
            <span>আল্ট্রা-স্লিম PWA</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              মাত্র কয়েকটি ইনপুটে প্রস্তুত করুন নিখুঁত{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-emerald-200 to-teal-100">
                অফিসিয়াল বাংলা দরখাস্ত
              </span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
              সরকারি প্রাথমিক বিদ্যালয়ের সহকারী ও প্রধান শিক্ষকের জন্য ৮টি বিশেষ সরকারি ফরম্যাট এবং স্কুল-কলেজের শিক্ষার্থীদের জন্য ৭টি প্রাতিষ্ঠানিক ফরম্যাট। সরাসরি প্রিন্ট ও PDF ডাউনলোড করুন।
            </p>
          </div>

          {/* 3 Pillar Features */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-emerald-200 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>সরকারি নিয়ম অনুযায়ী সঠিক ধারা</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>লাইভ প্রিভিউ ও ১-ক্লিকে PDF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-300" />
              <span>লেফট-অ্যালাইন ও জাস্টিফাইড বডি</span>
            </div>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectApplication(applications[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>প্রথম আবেদন তৈরি শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="/assets/aistudio/application_18e2efad.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-semibold text-xs transition-all"
              title="আপনার আপলোড করা মূল ৮-পৃষ্ঠা পিডিএফ টেমপ্লেট দেখুন"
            >
              <FileCheck className="w-4 h-4 text-emerald-300" />
              <span>📄 মূল ৮-পৃষ্ঠা PDF টেমপ্লেট</span>
            </a>

            <button
              onClick={onOpenFolderUploader}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-xs cursor-pointer transition-all"
            >
              <span>📂 পিসির Aplication ফোল্ডার</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 1.5 APPLICANT DESIGNATION POPUP SELECTOR (সহকারী শিক্ষক সবার উপরে) */}
      {/* ======================================================== */}
      <div className={`rounded-xl p-3 sm:p-4 backdrop-blur-md border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
        isDark ? 'bg-black/30 border-emerald-900/40 text-white' : 'bg-white/90 border-emerald-200/90 text-slate-800 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>আবেদনকারীর পদবী নির্বাচন:</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                সকল দরখাস্তের জন্য প্রযোজ্য
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-emerald-200/70' : 'text-slate-500'}`}>
              পপআপ এ অন্যান্য পদবী সমূহের উপরে <strong>“সহকারী শিক্ষক”</strong> পদবীটি অন্তর্ভুক্ত রয়েছে
            </p>
          </div>
        </div>

        <div className="w-full md:w-96">
          <DesignationSelector
            value={currentGlobalDesignation}
            onChange={(val) => onUpdateGlobalDesignation?.(val)}
            showQuickChips={true}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MODERN SEARCH & SEGMENTED CONTROLS TOOLBAR */}
      {/* ======================================================== */}
      <div className={`rounded-2xl p-4 sm:p-5 backdrop-blur-md border space-y-3.5 transition-colors ${toolbarClass}`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Segmented Section Filters */}
          <div className={`inline-flex items-center p-1 rounded-xl border self-start md:self-auto overflow-x-auto max-w-full ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100/90 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedSection('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedSection === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব ফরম্যাট (১৫)
            </button>

            <button
              type="button"
              onClick={() => setSelectedSection('employee')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedSection === 'employee'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>১. চাকুরীজীবী পার্ট (৮)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSection('student')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedSection === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>২. শিক্ষার্থী পার্ট (৭)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="দরখাস্ত খুঁজুন (যেমন: ছুটি, পাসপোর্ট, টিসি, পিআরএল)..."
              className={`w-full pl-10 pr-9 py-2 text-xs rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${inputClass}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Tag Chips */}
        <div className={`flex items-center gap-1.5 flex-wrap pt-1 text-xs border-t ${
          isDark ? 'border-white/10' : 'border-slate-100'
        }`}>
          <span className={`text-[11px] font-semibold mr-1 flex items-center gap-1 ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}>
            <SlidersHorizontal className="w-3 h-3" />
            দ্রুত ফিল্টার:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => setSelectedTag(tag.value)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                selectedTag === tag.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tag.label}
            </button>
          ))}
          {(selectedTag !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedTag('all');
                setSearchQuery('');
                setSelectedSection('all');
              }}
              className="text-[11px] text-emerald-400 hover:underline font-semibold ml-2 cursor-pointer"
            >
              সব রিসেট
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PART 1: চাকুরীজীবী (প্রাথমিক বিদ্যালয় স্পেশাল - ৮টি ফরম্যাট) */}
      {/* ======================================================== */}
      {(selectedSection === 'all' || selectedSection === 'employee') && employeeApps.length > 0 && (
        <section className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    পার্ট ১: চাকুরীজীবী (প্রাথমিক বিদ্যালয় স্পেশাল)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ৮টি ফরম্যাট
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                  সহকারী শিক্ষক, প্রধান শিক্ষক (চলতি দায়িত্বসহ) ও সরকারি কর্মকর্তা কর্মচারীদের জন্য নির্ধারিত ফরম্যাট
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {employeeApps.map((app) => {
              const themeStyle = getThemeStyles(app.accentColor);
              return (
                <div
                  key={app.id}
                  className={`group relative rounded-xl backdrop-blur-md shadow-xs hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden border ${cardContainerClass} ${themeStyle.hoverBorder}`}
                >
                  {/* Top Colorful Accent Line */}
                  <div className={`h-1 w-full bg-gradient-to-r ${themeStyle.topLine}`} />

                  <div className="p-4 space-y-3">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${themeStyle.iconBg}`}>
                        {getIcon(app.iconName, 'w-4 h-4')}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${themeStyle.tag}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${themeStyle.dot}`} />
                        {app.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className={`text-sm font-bold transition-colors line-clamp-1 ${cardTitleClass}`}>
                        {app.title}
                      </h3>
                      {app.englishTitle && (
                        <p className={`text-[11px] font-medium ${isDark ? 'text-emerald-300/60' : 'text-slate-400'}`}>
                          {app.englishTitle}
                        </p>
                      )}
                    </div>

                    {/* Summary */}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${cardDescClass}`}>
                      {app.summary}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className={`p-3 flex items-center justify-between gap-2 ${cardFooterClass}`}>
                    <button
                      type="button"
                      onClick={() => setPreviewApp(app)}
                      className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                        isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                      title="দ্রুত প্রিভিউ দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectApplication(app)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${themeStyle.btn}`}
                    >
                      <span>তৈরি করুন</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. AD / ANNOUNCEMENT BANNER SLOT */}
      {/* ======================================================== */}
      <div className={`rounded-xl border border-dashed p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left backdrop-blur-md ${
        isDark ? 'border-emerald-700/40 bg-emerald-950/30 text-white' : 'border-slate-300 bg-white/70 text-slate-800'
      }`}>
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            বিজ্ঞপ্তি ও হালনাগাদ তথ্য (Phase 2)
          </div>
          <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            সকল আবেদনপত্র সম্পূর্ণ সরকারি নিয়মানুযায়ী স্ট্যান্ডার্ড A4 ফরম্যাটে এবং Left-Aligned ও Justified বডি স্টাইলে সাজানো।
          </div>
        </div>
        <button
          onClick={onOpenFolderUploader}
          className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors border ${
            isDark ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-white hover:border-emerald-500 border-slate-200 text-slate-800'
          }`}
        >
          📂 পিসির ফাইল থেকে ইমপোর্ট করুন
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. PART 2: শিক্ষার্থী (স্কুল, কলেজ ও বিশ্ববিদ্যালয় - ৭টি ফরম্যাট) */}
      {/* ======================================================== */}
      {(selectedSection === 'all' || selectedSection === 'student') && studentApps.length > 0 && (
        <section className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    পার্ট ২: শিক্ষার্থী (স্কুল, কলেজ ও বিশ্ববিদ্যালয়)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    ৭টি ফরম্যাট
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-indigo-200/70' : 'text-slate-500'}`}>
                  প্রাতিষ্ঠানিক প্রধান (প্রধান শিক্ষক / অধ্যক্ষ) বরাবর আবেদনের জন্য ৭টি প্রয়োজনীয় ফরম্যাট
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studentApps.map((app) => {
              const themeStyle = getThemeStyles(app.accentColor);
              return (
                <div
                  key={app.id}
                  className={`group relative rounded-xl backdrop-blur-md shadow-xs hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden border ${cardContainerClass} ${themeStyle.hoverBorder}`}
                >
                  {/* Top Colorful Accent Line */}
                  <div className={`h-1 w-full bg-gradient-to-r ${themeStyle.topLine}`} />

                  <div className="p-4 space-y-3">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${themeStyle.iconBg}`}>
                        {getIcon(app.iconName, 'w-4 h-4')}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${themeStyle.tag}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${themeStyle.dot}`} />
                        {app.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className={`text-sm font-bold transition-colors line-clamp-1 ${cardTitleClass}`}>
                        {app.title}
                      </h3>
                      {app.englishTitle && (
                        <p className={`text-[11px] font-medium ${isDark ? 'text-indigo-300/60' : 'text-slate-400'}`}>
                          {app.englishTitle}
                        </p>
                      )}
                    </div>

                    {/* Summary */}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${cardDescClass}`}>
                      {app.summary}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className={`p-3 flex items-center justify-between gap-2 ${cardFooterClass}`}>
                    <button
                      type="button"
                      onClick={() => setPreviewApp(app)}
                      className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                        isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                      title="দ্রুত প্রিভিউ দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectApplication(app)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${themeStyle.btn}`}
                    >
                      <span>তৈরি করুন</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty Search Result */}
      {filteredApplications.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center space-y-3 backdrop-blur-md ${toolbarClass}`}>
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>কোনো দরখাস্ত ফরম্যাট খুঁজে পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            &quot;{searchQuery}&quot; দিয়ে কোনো ফলাফল পাওয়া যায়নি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('all');
              setSelectedSection('all');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            সব ফরম্যাট দেখুন
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. QUICK PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#06241a] text-white flex items-center justify-between border-b border-emerald-900/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{previewApp.title}</h3>
                  <p className="text-[11px] text-emerald-300">{previewApp.badge}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewApp(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Strict Left Align & Justified */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans-bn bg-slate-50">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-left">
                <div className="text-slate-600 font-semibold">তারিখ: {previewApp.date}</div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800">বরাবর,</div>
                  <div className="font-bold text-slate-900">{previewApp.recipient.designation}</div>
                  <div className="text-slate-700">{previewApp.recipient.office}</div>
                  <div className="text-slate-700">{previewApp.recipient.address}</div>
                </div>

                {previewApp.through && (
                  <div className="text-slate-800 font-medium">
                    <span className="font-bold">মাধ্যম:</span> {previewApp.through}
                  </div>
                )}

                <div className="font-bold text-slate-900 border-b pb-1">
                  বিষয়: {previewApp.subject}
                </div>

                <div className="font-semibold text-slate-800">{previewApp.salutation}</div>

                <div className="space-y-2">
                  {previewApp.bodyParagraphs.map((p, i) => (
                    <p key={i} className="application-body-text text-slate-800 indent-4">
                      {p}
                    </p>
                  ))}
                  {previewApp.prayerText && (
                    <p className="application-body-text font-medium text-slate-800 indent-4">
                      {previewApp.prayerText}
                    </p>
                  )}
                </div>

                <div className="pt-4 text-left border-t border-slate-100 space-y-2">
                  <div className="text-slate-700">{previewApp.closing}</div>
                  <div className="font-bold text-slate-900">{previewApp.applicant.name}</div>
                  <div className="text-slate-800 font-medium">
                    পদবী: <span className="font-bold text-emerald-800">{previewApp.applicant.designation}</span>
                  </div>
                  <div className="text-slate-600">{previewApp.applicant.institute}</div>

                  {/* Quick Designation Change inside Modal */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      আবেদনকারীর পদবী পরিবর্তন (পপআপে সবার উপরে “সহকারী শিক্ষক”):
                    </label>
                    <DesignationSelector
                      value={previewApp.applicant.designation}
                      onChange={(newDesig) => {
                        setPreviewApp({
                          ...previewApp,
                          applicant: {
                            ...previewApp.applicant,
                            designation: newDesig,
                          },
                        });
                        onUpdateGlobalDesignation?.(newDesig);
                      }}
                      showQuickChips={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Left-Aligned & Justified বডি সক্রিয়
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewApp(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = previewApp;
                    setPreviewApp(null);
                    onSelectApplication(target);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>এই দরখাস্ত তৈরি ও প্রিন্ট করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
