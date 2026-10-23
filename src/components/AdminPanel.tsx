import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  FileText,
  CheckCircle2,
  RefreshCw,
  Users,
  Activity,
  TrendingUp,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Radio,
  Cpu,
  LogIn,
  LogOut,
  KeyRound
} from 'lucide-react';
import { ALL_TEMPLATES } from '../data/templates';
import { getSavedApplications } from '../utils/storage';
import { GenerationRecord } from '../hooks/useAnonymousIdentity';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'admin@primary2026';

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin stats
  const [liveUsersCount, setLiveUsersCount] = useState(1);
  const [todayVisitors, setTodayVisitors] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(1);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [formatStats, setFormatStats] = useState<Array<{ id: string; title: string; count: number; category: string }>>([]);
  const [recentLogs, setRecentLogs] = useState<GenerationRecord[]>([]);
  const [storageUsageKb, setStorageUsageKb] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [swActive, setSwActive] = useState(false);

  // Check existing session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const refreshData = () => {
    // Calculate live users from localStorage heartbeats
    const now = Date.now();
    let activeHeartbeats = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('live_user_')) {
        const val = parseInt(localStorage.getItem(key) || '0', 10);
        if (now - val < 60000) {
          activeHeartbeats++;
        }
      }
    }
    // Baseline minimum 1
    setLiveUsersCount(Math.max(1, activeHeartbeats));

    // Visitors
    const allVis = parseInt(localStorage.getItem('total_unique_visitors') || '1', 10);
    setTotalVisitors(allVis);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayVis = localStorage.getItem(`visitor_day_${todayStr}`) ? 1 : 1;
    setTodayVisitors(todayVis);

    // Generation logs & total
    const historyKey = 'app_generation_stats';
    const history: GenerationRecord[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setRecentLogs(history.slice(-15).reverse());

    const totalGen = parseInt(localStorage.getItem('total_generated_count') || '0', 10);
    setTotalGenerated(totalGen > 0 ? totalGen : history.length);

    // Format usage counts
    const stats = ALL_TEMPLATES.map((tmpl) => {
      const count = parseInt(localStorage.getItem(`template_count_${tmpl.id}`) || '0', 10);
      return {
        id: tmpl.id,
        title: tmpl.shortTitle,
        count,
        category: tmpl.category,
      };
    }).sort((a, b) => b.count - a.count);

    setFormatStats(stats);

    // Saved apps & storage
    const saved = getSavedApplications();
    setSavedCount(saved.length);

    const str = localStorage.getItem('bangla_app_saved_applications_v1') || '';
    const bytes = new Blob([str]).size;
    setStorageUsageKb(Math.round(bytes / 1024));

    // Service Worker status
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setSwActive(true);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem('admin_custom_password') || DEFAULT_ADMIN_PASS;
    if (
      usernameInput.trim().toLowerCase() === DEFAULT_ADMIN_USER &&
      passwordInput.trim() === storedPass
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
      refreshData();
    } else {
      setLoginError('ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে। সঠিক তথ্য দিন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      liveUsers: liveUsersCount,
      totalGenerated,
      formatStats,
      recentLogs,
      savedApplications: getSavedApplications(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dorkhost_admin_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAnalytics = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল অ্যানালিটিক্স হিস্ট্রি রিসেট করতে চান? (সংরক্ষিত দরখাস্ত সুরক্ষিত থাকবে)')) {
      localStorage.removeItem('app_generation_stats');
      localStorage.removeItem('total_generated_count');
      ALL_TEMPLATES.forEach((t) => localStorage.removeItem(`template_count_${t.id}`));
      refreshData();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-emerald-950 flex items-center justify-between bg-[#04281f] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  সিকিউর অ্যাডমিন ও লাইভ অ্যানালিটিক্স প্যানেল
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900 border border-emerald-700 text-emerald-300">
                  /admin-panel
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                PWA লাইভ ইউজার কাউন্টার ও দরখাস্ত পরিসংখ্যান
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold border border-emerald-700/60 transition-colors"
                title="লগআউট করুন"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-emerald-900/80 text-emerald-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          
          {/* 1. If Not Authenticated -> Show Login Gate */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto py-8 space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-md">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  অ্যাডমিন প্রমাণীকরণ প্রয়োজন
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  অফিসিয়াল অ্যানালিটিক্স ও সিস্টেম ডেটা অ্যাক্সেসের জন্য ইউজারনেম ও পাসওয়ার্ড দিন
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    অ্যাডমিন ইউজারনেম (Username):
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    পাসওয়ার্ড (Password):
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>প্রবেশ করুন (Access Dashboard)</span>
                </button>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800">
                  <span className="font-bold">ডিফল্ট ক্রেডেনশিয়াল:</span> User: <code className="bg-white px-1 py-0.5 rounded font-mono">admin</code> | Pass: <code className="bg-white px-1 py-0.5 rounded font-mono">admin@primary2026</code>
                </div>
              </form>
            </div>
          ) : (
            /* 2. Authenticated Dashboard Content */
            <div className="space-y-5">
              
              {/* Top Highlights Cards (Live Users, Visitors, Generated, Storage) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Live Users Counter */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      লাইভ ইউজার
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-2xl font-black text-emerald-800">
                    {liveUsersCount} <span className="text-xs font-normal text-slate-400">জন সক্রিয়</span>
                  </p>
                  <p className="text-[10px] text-slate-400">রিয়েল-টাইম হার্টবিট ট্র্যাকিং</p>
                </div>

                {/* Total Generated */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    মোট জেনারেট
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {totalGenerated} <span className="text-xs font-normal text-slate-400">টি</span>
                  </p>
                  <p className="text-[10px] text-slate-400">দরখাস্ত সফলভাবে প্রস্তুত</p>
                </div>

                {/* Today's Visitors */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    ভিজিটর সংখ্যা
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {totalVisitors} <span className="text-xs font-normal text-slate-400">জন</span>
                  </p>
                  <p className="text-[10px] text-slate-400">ইউনিক ব্রাউজার টোকেন</p>
                </div>

                {/* Saved Apps in Storage */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    লোকাল ড্রাফট
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {savedCount} <span className="text-xs font-normal text-slate-400">({storageUsageKb} KB)</span>
                  </p>
                  <p className="text-[10px] text-slate-400">ডিভাইস লোকাল স্টোরেজ</p>
                </div>

              </div>

              {/* System & PWA Status Bar */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Cpu className="w-4 h-4 text-emerald-700" />
                    <span>PWA সার্ভিস ওয়ার্কার:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 font-bold">
                      {swActive ? 'সক্রিয় (Active)' : 'নিবন্ধিত (Offline Ready)'}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-slate-600">
                    <span>• নো-লগইন ফেজ ১ মোড</span>
                    <span>• A4 স্ট্যান্ডার্ড ৩মিমি মার্জিন</span>
                  </div>
                </div>

                <button
                  onClick={refreshData}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>রিফ্রেশ</span>
                </button>
              </div>

              {/* Popular Formats Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      জনপ্রিয় ফরম্যাট পরিসংখ্যান (Popular Application Formats)
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ১৫টি ফরম্যাট ট্র্যাকিং
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {formatStats.map((item) => {
                    const maxVal = Math.max(1, formatStats[0]?.count || 1);
                    const percent = Math.min(100, Math.round((item.count / maxVal) * 100));
                    return (
                      <div key={item.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${item.category === 'employee' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            {item.title}
                          </span>
                          <span className="font-bold text-slate-600">
                            {item.count} বার ব্যবহৃত
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.category === 'employee' ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${item.count > 0 ? Math.max(5, percent) : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Generation Stream */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      সাম্প্রতিক অ্যাক্টিভিটি লগ (Recent Applications Generated)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    সর্বশেষ {recentLogs.length}টি এন্ট্রি
                  </span>
                </div>

                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    এখনো কোনো আবেদনপত্র তৈরি করা হয়নি।
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
                    {recentLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.category === 'employee' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          <span className="font-bold text-slate-800">{log.title}</span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">({log.userId})</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Export & Reset */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>অ্যানালিটিক্স ব্যাকআপ (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAnalytics}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হিস্ট্রি ক্লিয়ার করুন</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-center text-[11px] text-slate-400">
          অফিসিয়াল দরখাস্ত প্রস্তুতকারক • সিকিউর অ্যাডমিন ও ডায়াগনস্টিকস সিস্টেম
        </div>

      </div>
    </div>
  );
};
