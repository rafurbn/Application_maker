import { useState, useEffect, useRef } from 'react';
import { SubCategoryType, ApplicationFormData, SavedApplication, DashboardTheme } from './types';
import { ALL_TEMPLATES, getDefaultFormData, getSampleFormData } from './data/templates';
import {
  getSavedApplications,
  saveApplicationLocally,
  deleteSavedApplication,
  readPreferences,
  writePreferences,
  exportBackup,
  importBackup,
  eraseDeviceData,
  type SaveResult,
} from './utils/storage';
import { useAnonymousIdentity } from './hooks/useAnonymousIdentity';
import { usePwaInstall } from './hooks/usePwaInstall';
import { analyticsStatus } from './lib/analytics';
import { Header, type AppNav } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ApplicationForm } from './components/ApplicationForm';
import { DocumentPreview } from './components/DocumentPreview';
import { SavedApplicationsModal } from './components/SavedApplicationsModal';
import { AdminPanel } from './components/AdminPanel';
import { Modal } from './components/Modal';
import { TextImportPanel } from './components/TextImportPanel';
import { AdSlot } from './components/AdSlot';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ArrowLeft, Share, PlusSquare, Smartphone, Download, Upload, Trash2, ShieldCheck, Phone } from 'lucide-react';

const SAVED_APPLICATIONS_SOFT_LIMIT = 50;

export default function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<SubCategoryType | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData | null>(null);
  const [savedApps, setSavedApps] = useState<SavedApplication[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastSeq = useRef(0);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Dashboard theme ও ডিফল্ট পদবী — ডিভাইসে মনে রাখা হয়
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>('executive');
  const [globalDesignation, setGlobalDesignation] = useState<string>('সহকারী শিক্ষক');
  const [activeNav, setActiveNav] = useState<AppNav>('dashboard');

  const { stats, isRemoteEnabled, trackApplicationGeneration } = useAnonymousIdentity();
  const { isInstallable, isInstalled, showIosPrompt, setShowIosPrompt, installApp } = usePwaInstall();
  const remoteAnalytics = analyticsStatus();

  useEffect(() => {
    setSavedApps(getSavedApplications());
    const prefs = readPreferences();
    setDashboardTheme(prefs.theme);
    setGlobalDesignation(prefs.globalDesignation);

    // PWA shortcuts: /?template=joining_letter এবং /?view=saved
    const params = new URLSearchParams(window.location.search);
    const templateParam = params.get('template');
    const deepLinked = templateParam ? ALL_TEMPLATES.find((t) => t.id === templateParam) : undefined;
    if (deepLinked) {
      const initial = getDefaultFormData(deepLinked);
      if (prefs.globalDesignation) initial.designation = prefs.globalDesignation;
      setSelectedTemplateId(deepLinked.id);
      setFormData(initial);
      setActiveMobileTab('form');
      setActiveNav('editor');
    }
    if (params.get('view') === 'saved') setIsSavedModalOpen(true);

    // /admin-panel বা #admin-panel ঠিকানা দিয়ে খুললে সরাসরি অ্যাডমিন প্যানেল
    if (window.location.pathname === '/admin-panel' || window.location.hash === '#admin-panel') {
      setIsAdminModalOpen(true);
    }

    const handleHash = () => {
      if (window.location.hash === '#admin-panel') {
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    toastSeq.current += 1;
    const id = `toast-${toastSeq.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleInstallApp = async () => {
    const installed = await installApp();
    if (installed) {
      showToast('ইনস্টল অনুরোধ গ্রহণ হয়েছে। আইকন হোম স্ক্রিনে না দেখা দিলে অ্যাপ ড্রয়ারে খুঁজুন, কিংবা ফোনের সেটিংসে Chrome-কে "হোম স্ক্রিন শর্টকাট তৈরি"-এর অনুমতি দিন।', 'success');
      return;
    }
    showToast(
      'এই ফোনটি থেকে স্বয়ংক্রিয় ইনস্টল-অপশন এখনো আসেনি — Chrome মেনু (⋮) থেকে "Install app" (পুরোনো ভার্সনে "হোম স্ক্রিনে যোগ করুন") চাপুন, মেনু দিয়ে ইনস্টল সবসময়ই যায়।',
      'info',
    );
  };

  const openTemplate = (templateId: SubCategoryType, useSample: boolean) => {
    const template = ALL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const initial = useSample ? getSampleFormData(template) : getDefaultFormData(template);
    if (globalDesignation) initial.designation = globalDesignation;
    setSelectedTemplateId(templateId);
    setFormData(initial);
    setActiveMobileTab(useSample ? 'preview' : 'form');
    setActiveNav('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTemplate = (templateId: SubCategoryType) => openTemplate(templateId, false);

  const handleGlobalDesignationChange = (newDesig: string) => {
    setGlobalDesignation(newDesig);
    writePreferences({ globalDesignation: newDesig });
    if (formData) {
      setFormData((prev) => (prev ? { ...prev, designation: newDesig } : null));
    }
    showToast(`ডিফল্ট পদবী "${newDesig}" মনে রাখা হয়েছে`, 'success');
  };

  const currentTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const handleFormChange = (updatedFields: Partial<ApplicationFormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const handleResetForm = () => {
    if (!currentTemplate) return;
    openTemplate(currentTemplate.id, false);
    showToast('ফর্ম নতুনভাবে খোলা হয়েছে', 'info');
  };

  const handleFillSample = () => {
    if (!currentTemplate) return;
    openTemplate(currentTemplate.id, true);
    showToast('নমুনা তথ্য বসানো হয়েছে — প্রিন্টের আগে নিজের তথ্য বসিয়ে নিন', 'info');
  };

  const handleImportText = (fields: Partial<ApplicationFormData>) => {
    if (!currentTemplate || !formData) {
      const template = ALL_TEMPLATES.find((t) => t.id === 'casual_leave');
      if (template) {
        const initial = getDefaultFormData(template);
        if (globalDesignation) initial.designation = globalDesignation;
        setSelectedTemplateId(template.id);
        setFormData({ ...initial, ...fields });
      }
    } else {
      handleFormChange(fields);
    }
    setIsImportModalOpen(false);
    setActiveMobileTab('preview');
    setActiveNav('editor');
    showToast('পেস্ট করা লেখা থেকে আবেদন তৈরি হয়েছে', 'success');
  };

  const handleSaveApplication = (): SaveResult => {
    if (!currentTemplate || !formData) return { ok: false, reason: 'unavailable' };
    const result = saveApplicationLocally({
      formatId: currentTemplate.id,
      formatTitle: currentTemplate.title,
      category: currentTemplate.category,
      applicantName: formData.applicantName || 'আবেদনকারী',
      workplace: formData.workplace || 'প্রতিষ্ঠান',
      subject: formData.subject || currentTemplate.defaultSubject,
      data: formData,
    });
    if (!result.ok) {
      showToast('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ বন্ধ বা পূর্ণ। কিছু দরখাস্ত মুছে আবার চেষ্টা করুন।', 'error');
      return result;
    }
    const all = getSavedApplications();
    setSavedApps(all);
    trackApplicationGeneration(currentTemplate.id, currentTemplate.title, currentTemplate.category);
    showToast(
      result.reason === 'quota'
        ? 'স্টোরেজ পূর্ণ ছিল — পুরোনো একটি দরখাস্ত মুছে এটি সংরক্ষণ করা হয়েছে।'
        : 'দরখাস্তটি এই ডিভাইসের ব্রাউজারে সংরক্ষিত হয়েছে।',
      result.reason === 'quota' ? 'info' : 'success',
    );
    if (all.length > SAVED_APPLICATIONS_SOFT_LIMIT) {
      showToast('সংরক্ষিত দরখাস্ত ৫০টির বেশি — জরুরি কয়েকটি রেখে বাকিগুলো মুছুন বা ব্যাকআপ নিন।', 'info');
    }
    return result;
  };

  const handleDeleteSaved = (id: string) => {
    setSavedApps(deleteSavedApplication(id));
    showToast('সংরক্ষিত দরখাস্তটি মুছে ফেলা হয়েছে', 'info');
  };

  const handleLoadSaved = (saved: SavedApplication) => {
    setSelectedTemplateId(saved.formatId);
    setFormData(saved.data);
    setActiveNav('editor');
    setActiveMobileTab('form');
    setIsSavedModalOpen(false);
    showToast(`"${saved.formatTitle}" ফর্মে খোলা হয়েছে`, 'success');
  };

  const handleLogGeneration = () => {
    if (currentTemplate) {
      trackApplicationGeneration(currentTemplate.id, currentTemplate.title, currentTemplate.category);
    }
  };

  const handleExportBackup = () => {
    try {
      const bundle = exportBackup();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dorkhost-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`${bundle.applications.length}টি দরখাস্তের ব্যাকআপ নামানো হয়েছে`, 'success');
    } catch (e) {
      console.error('Backup export failed', e);
      showToast('ব্যাকআপ ফাইল তৈরি করা যায়নি', 'error');
    }
  };

  const handleImportBackup = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const result = importBackup(text);
      if (result.ok) {
        const prefs = readPreferences();
        setDashboardTheme(prefs.theme);
        setGlobalDesignation(prefs.globalDesignation);
        setSavedApps(getSavedApplications());
        showToast(`${result.added}টি দরখাস্ত ফিরে এসেছে`, 'success');
      } else {
        showToast(result.reason || 'ব্যাকআপ ফাইলটি খোলা যায়নি', 'error');
      }
    } catch (e) {
      console.error('Backup import failed', e);
      showToast('ব্যাকআপ ফাইলটি পড়া যায়নি', 'error');
    }
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleEraseData = () => {
    const confirmed = window.confirm(
      'এই ডিভাইস থেকে অ্যাপটির সব তথ্য (সংরক্ষিত দরখাস্ত, পছন্দ, গোপন পরিচয়) মুছে যাবে। পরে ফেরানো যাবে না। চালিয়ে যাবেন?',
    );
    if (!confirmed) return;
    eraseDeviceData();
    setSavedApps([]);
    setSelectedTemplateId(null);
    setFormData(null);
    setActiveNav('dashboard');
    setIsDataModalOpen(false);
    showToast('এই ডিভাইসের অ্যাপ-তথ্য মুছে ফেলা হয়েছে', 'info');
  };

  const handleNavChange = (nav: AppNav) => {
    if (nav === 'dashboard') {
      setActiveNav('dashboard');
      setSelectedTemplateId(null);
      return;
    }
    if (nav === 'preview' || nav === 'editor') {
      if (!selectedTemplateId) openTemplate('casual_leave', false);
      setActiveMobileTab(nav === 'preview' ? 'preview' : 'form');
      setActiveNav('editor');
      return;
    }
    if (nav === 'saved') {
      setIsSavedModalOpen(true);
      return;
    }
    if (nav === 'import') {
      setIsImportModalOpen(true);
      return;
    }
    setIsDataModalOpen(true);
  };

  const applyThemeChange = (theme: DashboardTheme) => {
    setDashboardTheme(theme);
    writePreferences({ theme });
  };

  const themeBgClass = (() => {
    switch (dashboardTheme) {
      case 'ivory':
        return 'bg-[#faf7f2] text-stone-900';
      case 'navy':
        return 'bg-[#0a1426] text-slate-100';
      case 'cyber':
        return 'bg-[#04130e] text-slate-100';
      case 'executive':
      default:
        return 'bg-[#f4f7f5] text-slate-800';
    }
  })();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeBgClass}`}>
      <Header
        savedCount={savedApps.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onGoHome={() => {
          setSelectedTemplateId(null);
          setActiveNav('dashboard');
        }}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        theme={dashboardTheme}
        onThemeChange={applyThemeChange}
        hasActiveApplication={Boolean(selectedTemplateId)}
        onInstallApp={handleInstallApp}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
      />

      <main className="flex-1 pb-16">
        {!selectedTemplateId || !currentTemplate || !formData ? (
          <HomeScreen
            onSelectTemplate={handleSelectTemplate}
            onPreviewSample={(id) => openTemplate(id, true)}
            onOpenImport={() => setIsImportModalOpen(true)}
            globalDesignation={globalDesignation}
            onUpdateGlobalDesignation={handleGlobalDesignationChange}
            theme={dashboardTheme}
            onThemeChange={applyThemeChange}
            onInstallApp={handleInstallApp}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            savedApps={savedApps}
            onOpenSaved={() => setIsSavedModalOpen(true)}
            onLoadSaved={handleLoadSaved}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 no-print">
              <button
                onClick={() => {
                  setSelectedTemplateId(null);
                  setActiveNav('dashboard');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span>সব ফরম্যাটে ফিরে যান</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium hidden sm:inline">অন্য ফরম্যাট:</span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value as SubCategoryType)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 font-semibold shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <optgroup label="পার্ট ১: চাকরিজীবী (প্রাথমিক বিদ্যালয়)">
                    {ALL_TEMPLATES.filter((t) => t.category === 'employee').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortTitle}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="পার্ট ২: শিক্ষার্থী (স্কুল ও কলেজ)">
                    {ALL_TEMPLATES.filter((t) => t.category === 'student').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortTitle}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex sm:hidden p-1 bg-slate-200/90 rounded-xl no-print">
              <button
                onClick={() => setActiveMobileTab('form')}
                aria-pressed={activeMobileTab === 'form'}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMobileTab === 'form' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                তথ্য ইনপুট ফর্ম
              </button>
              <button
                onClick={() => setActiveMobileTab('preview')}
                aria-pressed={activeMobileTab === 'preview'}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMobileTab === 'preview' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                লাইভ প্রিভিউ ও PDF
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={`lg:col-span-5 no-print ${activeMobileTab === 'form' ? 'block' : 'hidden sm:block'}`}>
                <ApplicationForm
                  template={currentTemplate}
                  formData={formData}
                  onChange={handleFormChange}
                  onReset={handleResetForm}
                  onFillSample={handleFillSample}
                />
              </div>

              <div className={`lg:col-span-7 ${activeMobileTab === 'preview' ? 'block' : 'hidden sm:block'}`}>
                <DocumentPreview
                  template={currentTemplate}
                  formData={formData}
                  onSave={handleSaveApplication}
                  onLogGeneration={handleLogGeneration}
                  onNotify={showToast}
                  onBodyChange={(customText) => handleFormChange({ customBodyText: customText })}
                />
              </div>
            </div>

            <AdSlot slotId="generator-bottom-slot" format="banner" />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} অফিসিয়াল দরখাস্ত প্রস্তুতকারক (PWA) • সরকারি প্রাথমিক বিদ্যালয় ও শিক্ষা প্রতিষ্ঠান
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>লিখা বামে সারিবদ্ধ, বডি জাস্টিফাইড</span>
            <span>•</span>
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-emerald-700 transition-colors font-semibold"
            >
              আপনার তথ্য ও ব্যাকআপ
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-emerald-700 transition-colors font-semibold"
            >
              অ্যাডমিন পোর্টাল (/admin-panel)
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Admin: Rafiqul Islam</span>
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <a
            href="https://wa.me/8801732679551"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Mobile+ WhatsApp: +8801732-679551</span>
          </a>
        </div>
      </footer>

      {/* iOS / ম্যানুয়াল ইনস্টল নির্দেশিকা */}
      <Modal
        isOpen={showIosPrompt}
        onClose={() => setShowIosPrompt(false)}
        title="আইফোনে অ্যাপ ইনস্টল নির্দেশিকা"
        subtitle="Safari ব্রাউজারে নিচের ধাপগুলো অনুসরণ করুন"
        icon={<Smartphone className="w-4 h-4" />}
        maxWidth="max-w-sm"
      >
        <ol className="space-y-2.5 text-left text-xs">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              ১
            </span>
            <p>
              Safari-র নিচে <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> <b>Share</b> বোতামে ট্যাপ করুন।
            </p>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              ২
            </span>
            <p>
              নিচে স্ক্রোল করে <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" />{' '}
              <b>Add to Home Screen</b> বেছে নিন।
            </p>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              ৩
            </span>
            <p>
              উপরে ডানপাশে <b>Add</b> চাপুন — হোম স্ক্রিনে অ্যাপের আইকন যোগ হবে।
            </p>
          </li>
        </ol>
      </Modal>

      {/* পুরোনো আবেদনের লেখা পেস্ট */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="পুরোনো আবেদনপত্রের লেখা থেকে নতুন আবেদন"
        subtitle="লেখা পেস্ট করুন বা টেক্সট ফাইল বাছুন — সব কাজ আপনার ব্রাউজারেই হয়"
        icon={<Upload className="w-4 h-4" />}
      >
        <TextImportPanel onImport={handleImportText} />
      </Modal>

      {/* তথ্য, ব্যাকআপ ও গোপনীয়তা */}
      <Modal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        title="আপনার তথ্য, ব্যাকআপ ও পরিসংখ্যান"
        subtitle="এই অ্যাপে লগইন নেই — আবেদনের সব তথ্য এই ব্রাউজারেই থাকে"
        icon={<Download className="w-4 h-4" />}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs leading-relaxed text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">এই ডিভাইসে যা সংরক্ষিত</p>
            <p>সংরক্ষিত দরখাস্ত: {savedApps.length} টি</p>
            <p>এই ব্রাউজারে তৈরি/প্রিন্টের হিসাব: {stats.totalGenerations} বার</p>
            <p className="text-emerald-800 font-medium">{remoteAnalytics.note}</p>
            <p className="text-slate-500">
              আপনার নাম, মোবাইল বা প্রতিষ্ঠানের তথ্য কোথাও পাঠানো হয় না। ব্যবহারের হিসাবে শুধু একটি গোপন
              সংখ্যা (uid) পাঠানো হয়, এবং তা-ও সার্ভার সংযোগ চালু থাকলেই।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ব্যাকআপ নামান (JSON)</span>
            </button>

            <input
              ref={importFileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => handleImportBackup(e.target.files?.[0])}
            />
            <button
              onClick={() => importFileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>ব্যাকআপ ফেরান</span>
            </button>

            <button
              onClick={handleEraseData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>এই ডিভাইসের তথ্য মুছুন</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            ফোন বদলালে, ব্রাউজারের ডাটা ক্লিয়ার করলে বা অ্যাপ আনইনস্টল করলে সংরক্ষিত দরখাস্ত মুছে যায়।
            গুরুত্বপূর্ণ আবেদনের ব্যাকআপ আগেই নামিয়ে রাখুন।
          </p>
        </div>
      </Modal>

      <SavedApplicationsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedApps={savedApps}
        onLoadApp={handleLoadSaved}
        onDeleteApp={handleDeleteSaved}
      />

      <AdminPanel
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        localStats={stats}
        isRemoteEnabled={isRemoteEnabled}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
