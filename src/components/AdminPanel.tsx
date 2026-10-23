import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Database,
  FileText,
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
} from 'lucide-react';
import { ALL_TEMPLATES } from '../data/templates';
import { getSavedApplications, analyticsResetLocal, type LocalStatsSnapshot } from '../utils/storage';
import { fetchAdminStats, isRemoteAnalyticsEnabled, type AdminStats } from '../lib/analytics';
import { Modal } from './Modal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  localStats: LocalStatsSnapshot;
  isRemoteEnabled: boolean;
}

const PASSPHRASE_KEY = 'bangla_app_admin_passphrase_v1';

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readStoredPassphrase(): string | null {
  try {
    const raw = localStorage.getItem(PASSPHRASE_KEY);
    return raw && raw.length >= 16 ? raw : null;
  } catch {
    return null;
  }
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, localStats, isRemoteEnabled }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [storageKb, setStorageKb] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [swActive, setSwActive] = useState(false);
  const [remoteStats, setRemoteStats] = useState<AdminStats | null>(null);
  const [remoteError, setRemoteError] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(false);

  const loadLocalSnapshot = useCallback(() => {
    const saved = getSavedApplications();
    setSavedCount(saved.length);
    try {
      const raw = localStorage.getItem('bangla_app_saved_applications_v1') || '';
      setStorageKb(Math.round(new Blob([raw]).size / 1024));
    } catch {
      setStorageKb(0);
    }
    setSwActive(Boolean(navigator.serviceWorker?.controller));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setNeedsSetup(!readStoredPassphrase());
      loadLocalSnapshot();
    }
  }, [isOpen, loadLocalSnapshot]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !isRemoteEnabled) return;
    const interval = setInterval(loadLocalSnapshot, 30000);
    return () => clearInterval(interval);
  }, [isOpen, isAuthenticated, isRemoteEnabled, loadLocalSnapshot]);

  const runRemoteFetch = useCallback(async () => {
    if (!isRemoteAnalyticsEnabled) return;
    setRemoteLoading(true);
    setRemoteError('');
    try {
      const token = sessionStorage.getItem('admin_session_token');
      if (!token) throw new Error('সেশন টোকেন নেই।');
      setRemoteStats(await fetchAdminStats(token));
    } catch (e) {
      setRemoteError(e instanceof Error ? e.message : 'পরিসংখ্যান আনা যায়নি।');
    } finally {
      setRemoteLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = passwordInput.trim();
    if (value.length < 6) {
      setLoginError('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (isRemoteEnabled) {
      try {
        sessionStorage.setItem('admin_session_token', value);
        const stats = await fetchAdminStats(value);
        setRemoteStats(stats);
        setIsAuthenticated(true);
        setLoginError('');
        loadLocalSnapshot();
        return;
      } catch (err) {
        sessionStorage.removeItem('admin_session_token');
        setRemoteStats(null);
        setLoginError(err instanceof Error ? err.message : 'টোকেন গ্রহণযোগ্য নয়।');
        return;
      }
    }

    const stored = readStoredPassphrase();
    const hash = await sha256(value);
    if (!stored) {
      try {
        localStorage.setItem(PASSPHRASE_KEY, hash);
      } catch {
        setLoginError('ব্রাউজারে পাসওয়ার্ড সংরক্ষণ করা যায়নি (প্রাইভেট মোড?)।');
        return;
      }
      setIsAuthenticated(true);
      setNeedsSetup(false);
      setLoginError('');
      loadLocalSnapshot();
      return;
    }
    if (stored === hash) {
      setIsAuthenticated(true);
      setLoginError('');
      loadLocalSnapshot();
    } else {
      setLoginError('পাসওয়ার্ড ভুল।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setRemoteStats(null);
    sessionStorage.removeItem('admin_session_token');
  };

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      scope: isRemoteEnabled ? 'server + this device' : 'this device only',
      server: remoteStats,
      device: {
        totalGenerations: localStats.totalGenerations,
        perTemplate: localStats.perTemplate,
        daysVisited: localStats.daysVisited,
        savedApplications: getSavedApplications(),
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-analytics_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetLocal = () => {
    if (!window.confirm('এই ব্রাউজারের ব্যবহারের হিসাব রিসেট করবেন? সংরক্ষিত দরখাস্ত থাকবে।')) return;
    analyticsResetLocal();
    setStorageKb(0);
    onClose();
    window.location.reload();
  };

  const templateRows = ALL_TEMPLATES.map((tmpl) => ({
    id: tmpl.id,
    title: tmpl.shortTitle,
    category: tmpl.category,
    deviceCount: localStats.perTemplate[tmpl.id]?.count || 0,
    serverCount: remoteStats?.popularFormats.find((f) => f.templateId === tmpl.id)?.count || 0,
  }))
    .map((row) => ({ ...row, count: isRemoteEnabled && remoteStats ? row.serverCount : row.deviceCount }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(1, ...templateRows.map((r) => r.count));
  const liveUsers = remoteStats?.liveUsers ?? null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="সিকিউর অ্যাডমিন ও লাইভ অ্যানালিটিক্স প্যানেল"
      subtitle="/admin-panel — ব্যবহারের পরিসংখ্যান ও সিস্টেম তথ্য"
      icon={<ShieldCheck className="w-4 h-4" />}
      maxWidth="max-w-3xl"
    >
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto py-6 space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-extrabold text-slate-900">অ্যাডমিন প্রবেশ</h4>
            <p className="text-xs text-slate-500 mt-1">
              {isRemoteEnabled
                ? 'সুপাবেজ সংযুক্ত — অ্যাডমিন টোকেন দিয়ে প্রবেশ করুন, পরিসংখ্যান সার্ভার থেকে আসবে।'
                : needsSetup
                  ? 'এই ব্রাউজারে প্রথমবার: একটি অ্যাডমিন পাসওয়ার্ড সেট করুন (শুধু এই ডিভাইসেই থাকে)।'
                  : 'সেট করা পাসওয়ার্ড দিন।'}
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4 text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div>
              <label htmlFor="admin-pass" className="text-xs font-bold text-slate-700 block mb-1">
                {isRemoteEnabled ? 'অ্যাডমিন টোকেন' : 'অ্যাডমিন পাসওয়ার্ড'}
              </label>
              <input
                id="admin-pass"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                autoComplete={needsSetup ? 'new-password' : 'current-password'}
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
              <span>{needsSetup && !isRemoteEnabled ? 'পাসওয়ার্ড সেট করে প্রবেশ' : 'প্রবেশ করুন'}</span>
            </button>

            {!isRemoteEnabled && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                এটি তালা দিচ্ছে শুধু এই ব্রাউজারে — ফ্রন্টএন্ড তালা কখনোই আসল সুরক্ষা নয়। সবার জন্য আসল
                লাইভ কাউন্ট ও নিরাপদ প্যানেল পেতে সুপাবেজ Edge Function + ADMIN_TOKEN চালু করুন।
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="space-y-5">
          {!isRemoteEnabled && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-[11px] leading-relaxed text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <b>সুপাবেজ সংযুক্ত নয়।</b> নিচের সব সংখ্যা শুধু <b>এই ডিভাইসের এই ব্রাউজারের</b> — অন্য
                কারুর ব্যবহার এখানে ধরা পড়েনা। সবার হিসাব দেখতে <code className="bg-white px-1 rounded">VITE_SUPABASE_URL</code>{' '}
                ও <code className="bg-white px-1 rounded">VITE_SUPABASE_ANON_KEY</code> বসিয়ে রিলিজ করুন।
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Radio className={`w-3.5 h-3.5 text-emerald-600 ${isRemoteEnabled ? 'animate-pulse' : ''}`} />
                লাইভ ইউজার
              </span>
              <p className="text-2xl font-black text-emerald-800">
                {isRemoteEnabled ? (liveUsers ?? '—') : '—'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isRemoteEnabled ? 'সার্ভার হার্টবিট (২ মিনিট)' : 'সার্ভার সংযোগ নেই'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                মোট জেনারেট
              </span>
              <p className="text-2xl font-black text-slate-900">
                {isRemoteEnabled && remoteStats ? remoteStats.totalGenerations : localStats.totalGenerations}
              </p>
              <p className="text-[10px] text-slate-400">{isRemoteEnabled ? 'সার্ভার' : 'এই ডিভাইস'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                ইউনিক ইউজার
              </span>
              <p className="text-2xl font-black text-slate-900">
                {isRemoteEnabled && remoteStats ? remoteStats.totalUsers : localStats.daysVisited.length}
              </p>
              <p className="text-[10px] text-slate-400">
                {isRemoteEnabled ? 'সার্ভার (সর্বমোট)' : 'এই ডিভাইসে ব্যবহারের দিন'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-purple-600" />
                লোকাল ড্রাফট
              </span>
              <p className="text-2xl font-black text-slate-900">
                {savedCount} <span className="text-xs font-normal text-slate-400">({storageKb} KB)</span>
              </p>
              <p className="text-[10px] text-slate-400">এই ব্রাউজারের স্টোরেজ</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <span>সার্ভিস ওয়ার্কার:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 font-bold">
                  {swActive ? 'সক্রিয় (অফলাইন রেডি)' : 'নিবন্ধিত (এখনো কন্ট্রোল করছে না)'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-slate-600">
                <span>• লগইন ছাড়া ফেজ ১</span>
                <span>• A4 মার্জিন ২২/৩৫ মিমি</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isRemoteEnabled && (
                <button
                  onClick={runRemoteFetch}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${remoteLoading ? 'animate-spin' : ''}`} />
                  <span>সার্ভার থেকে আনুন</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>

          {remoteError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{remoteError}</span>
            </div>
          )}

          {isRemoteEnabled && remoteStats && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span>সদ্য সক্রিয়: <b>{remoteStats.liveUsers}</b></span>
              <span>আজ ইউনিক: <b>{remoteStats.usersToday}</b></span>
              <span>আজ তৈরি: <b>{remoteStats.generationsToday}</b></span>
              <span>হালনাগাদ: <b>{new Date(remoteStats.lastUpdated).toLocaleTimeString('bn-BD')}</b></span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">জনপ্রিয় ফরম্যাট</h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {isRemoteEnabled && remoteStats ? 'সার্ভারের হিসাব' : 'এই ডিভাইসের হিসাব'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {templateRows.map((item) => (
                <div key={item.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.category === 'employee' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="font-bold text-slate-600 shrink-0">{item.count} বার</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.category === 'employee' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${item.count > 0 ? Math.max(4, Math.round((item.count / maxCount) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">এই ডিভাইসের ব্যবহারের দিন</h4>
            </div>
            <p className="text-xs text-slate-600">
              {localStats.daysVisited.length === 0
                ? 'এই ব্রাউজারে এখনো কোনো ব্যবহারের রেকর্ড নেই।'
                : `${localStats.daysVisited.length} দিন ব্যবহার হয়েছে — শেষ ব্যবহার ${localStats.daysVisited[localStats.daysVisited.length - 1]}`}
            </p>
            <p className="text-[11px] text-slate-400">
              আবেদনের নাম, প্রতিষ্ঠান বা মোবাইল কখনোই এখানে বা সার্ভারে সংরক্ষিত হয় না।
            </p>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>পরিসংখ্যান ব্যাকআপ (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleResetLocal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>এই ডিভাইসের হিসাব রিসেট</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
