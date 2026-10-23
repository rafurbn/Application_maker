import { useState, useEffect } from 'react';
import { SubCategoryType, ApplicationFormData, SavedApplication, DashboardTheme, PrintSettings } from './types';
import { ALL_TEMPLATES, getDefaultFormData, getSampleFormData } from './data/templates';
import { getSavedApplications, saveApplicationLocally, deleteSavedApplication, type SaveResult } from './utils/storage';
import { useAnonymousIdentity } from './hooks/useAnonymousIdentity';
import { usePwaInstall } from './hooks/usePwaInstall';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ApplicationForm } from './components/ApplicationForm';
import { DocumentPreview } from './components/DocumentPreview';
import { SavedApplicationsModal } from './components/SavedApplicationsModal';
import { AdminPanel } from './components/AdminPanel';
import { FolderUploader } from './components/FolderUploader';
import { PrintSettingsModal } from './components/PrintSettingsModal';
import { AdSlot } from './components/AdSlot';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ArrowLeft, X, Share, PlusSquare, Smartphone } from 'lucide-react';

const SAVED_APPLICATIONS_SOFT_LIMIT = 50;

const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  fontSize: 'medium',
  fontFamily: 'serif',
  lineSpacing: 'normal',
  headerAlign: 'left',
  bodyAlign: 'justify',
  showRefNo: false,
  showThrough: true,
  showAttachments: true,
  showCc: false,
};

export default function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<SubCategoryType | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData | null>(null);
  const [savedApps, setSavedApps] = useState<SavedApplication[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isPrintSettingsModalOpen, setIsPrintSettingsModalOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dashboard Theme & Global Designation
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>('executive');
  const [globalDesignation, setGlobalDesignation] = useState<string>('সহকারী শিক্ষক');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'preview' | 'editor' | 'folder' | 'settings' | 'approver'>('dashboard');

  const { trackApplicationGeneration } = useAnonymousIdentity();
  const { isInstallable, showIosPrompt, setShowIosPrompt, installApp } = usePwaInstall();

  // Load saved apps from local storage on mount
  useEffect(() => {
    setSavedApps(getSavedApplications());

    // Check if directly navigating to /admin-panel or hash #admin-panel
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
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleInstallApp = async () => {
    const installed = await installApp();
    if (installed) {
      showToast('অ্যাপ্লিকেশনটি সফলভাবে ইনস্টল করা হয়েছে!', 'success');
    }
  };

  const handleSelectTemplate = (templateId: SubCategoryType) => {
    const template = ALL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      const initialData = getDefaultFormData(template);
      if (globalDesignation) {
        initialData.designation = globalDesignation;
      }
      setFormData(initialData);
      setActiveMobileTab('form');
      setActiveNav('editor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Direct 1-Click Print from Home Dashboard Cards
  const handleDirectPrint = (templateId: SubCategoryType) => {
    const template = ALL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      const sample = getSampleFormData(template);
      if (globalDesignation) {
        sample.designation = globalDesignation;
      }
      setFormData(sample);
      setActiveMobileTab('preview');
      setActiveNav('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Track analytics
      trackApplicationGeneration(template.id, template.title, template.category);

      showToast('আবেদনপত্র প্রিন্ট প্রিভিউ প্রস্তুত হয়েছে', 'info');
      setTimeout(() => {
        window.print();
      }, 400);
    }
  };

  const handleGlobalDesignationChange = (newDesig: string) => {
    setGlobalDesignation(newDesig);
    if (formData) {
      setFormData((prev) => (prev ? { ...prev, designation: newDesig } : null));
    }
    showToast(`ডিফল্ট পদবী '${newDesig}' নির্ধারিত হয়েছে`, 'success');
  };

  const currentTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const handleFormChange = (updatedFields: Partial<ApplicationFormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const handleResetForm = () => {
    if (currentTemplate) {
      const reset = getDefaultFormData(currentTemplate);
      if (globalDesignation) {
        reset.designation = globalDesignation;
      }
      setFormData(reset);
      showToast('ফর্ম ডিফল্ট মানে রিসেট করা হয়েছে', 'info');
    }
  };

  const handleFillSample = () => {
    if (currentTemplate) {
      const sample = getSampleFormData(currentTemplate);
      if (globalDesignation) {
        sample.designation = globalDesignation;
      }
      setFormData(sample);
      showToast('নমুনা তথ্য সফলভাবে যুক্ত হয়েছে! ডানপাশে লাইভ প্রিভিউ দেখুন।', 'success');
    }
  };

  const handleSaveApplication = (): SaveResult => {
    if (!currentTemplate || !formData) return { ok: false, reason: 'unavailable' };
    if (savedApps.length >= SAVED_APPLICATIONS_SOFT_LIMIT) {
      showToast(
        `সংরক্ষিত দরখাস্ত ${savedApps.length}টি হয়েছে — পুরোনোগুলো একবার মুছে ফেলা ভালো, নাহলে ফোনের স্টোরেজ ভরে যেতে পারে।`,
        'info',
      );
    }
    const result = saveApplicationLocally({
      formatId: currentTemplate.id,
      formatTitle: currentTemplate.title,
      category: currentTemplate.category,
      applicantName: formData.applicantName || 'আবেদনকারী',
      workplace: formData.workplace || 'প্রতিষ্ঠান',
      subject: formData.subject || currentTemplate.defaultSubject,
      data: formData,
    });
    if (result.ok) {
      setSavedApps(getSavedApplications());
      trackApplicationGeneration(currentTemplate.id, currentTemplate.title, currentTemplate.category);
      showToast(
        result.reason === 'quota'
          ? 'স্টোরেজ পূর্ণ হওয়ায় সবচেয়ে পুরোনো দরখাস্তটি মুছে এই দরখাস্তটি সংরক্ষণ করা হয়েছে।'
          : 'দরখাস্তটি আপনার ব্রাউজারে সফলভাবে সংরক্ষিত হয়েছে!',
        result.reason === 'quota' ? 'info' : 'success',
      );
    } else {
      showToast('সংরক্ষণ ব্যর্থ — ব্রাউজার স্টোরেজ পূর্ণ। পুরোনো দরখাস্ত মুছে আবার চেষ্টা করুন।', 'error');
    }
    return result;
  };

  const handleDeleteSaved = (id: string) => {
    const updated = deleteSavedApplication(id);
    setSavedApps(updated);
    showToast('সংরক্ষিত দরখাস্তটি মুছে ফেলা হয়েছে', 'info');
  };

  const handleLoadSaved = (saved: SavedApplication) => {
    setSelectedTemplateId(saved.formatId);
    setFormData(saved.data);
    setActiveNav('editor');
    showToast(`'${saved.formatTitle}' সফলভাবে লোড হয়েছে`, 'success');
  };

  const handleLogGeneration = () => {
    if (currentTemplate) {
      trackApplicationGeneration(currentTemplate.id, currentTemplate.title, currentTemplate.category);
    }
  };

  // Nav Bar Routing Handlers
  const handleNavChange = (nav: 'dashboard' | 'preview' | 'editor' | 'folder' | 'settings' | 'approver') => {
    setActiveNav(nav);
    if (nav === 'dashboard') {
      setSelectedTemplateId(null);
    } else if (nav === 'preview') {
      if (!selectedTemplateId) {
        handleSelectTemplate('casual_leave');
      }
      setActiveMobileTab('preview');
    } else if (nav === 'editor') {
      if (!selectedTemplateId) {
        handleSelectTemplate('casual_leave');
      }
      setActiveMobileTab('form');
    } else if (nav === 'folder') {
      setIsFolderModalOpen(true);
    } else if (nav === 'settings') {
      setIsPrintSettingsModalOpen(true);
    } else if (nav === 'approver') {
      setIsSavedModalOpen(true);
    }
  };

  // Background Theme Styling
  const getThemeBgClass = () => {
    switch (dashboardTheme) {
      case 'ivory':
        return 'bg-[#faf7f2] text-stone-900';
      case 'navy':
        return 'bg-[#0a1426] text-slate-100';
      case 'cyber':
        return 'bg-[#031c15] text-slate-100';
      case 'executive':
      default:
        return 'bg-[#f4f7f5] text-slate-800';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getThemeBgClass()}`}>
      
      {/* Top Header matching image_102660cd.png */}
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
        onThemeChange={(th) => {
          setDashboardTheme(th);
          showToast(`থিম পরিবর্তন করা হয়েছে`, 'info');
        }}
        onOpenFolderUploader={() => setIsFolderModalOpen(true)}
        onOpenPrintSettings={() => setIsPrintSettingsModalOpen(true)}
        hasActiveApplication={Boolean(selectedTemplateId)}
        onInstallApp={handleInstallApp}
        isInstallable={isInstallable}
      />

      {/* Main App Content */}
      <main className="flex-1 pb-16">
        {!selectedTemplateId || !currentTemplate || !formData ? (
          /* Home Screen with Two-Part Layout */
          <HomeScreen
            onSelectTemplate={handleSelectTemplate}
            onDirectPrint={handleDirectPrint}
            onOpenFolderUploader={() => setIsFolderModalOpen(true)}
            globalDesignation={globalDesignation}
            onUpdateGlobalDesignation={handleGlobalDesignationChange}
            theme={dashboardTheme}
            onThemeChange={setDashboardTheme}
            onInstallApp={handleInstallApp}
            isInstallable={isInstallable}
          />
        ) : (
          /* Application Generator Split-View Screen */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Navigation & Breadcrumb Bar */}
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

              {/* Quick Template Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                  অন্য ফরম্যাট দেখুন:
                </span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value as SubCategoryType)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 font-semibold shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <optgroup label="পার্ট ১: চাকরিজীবী (প্রাথমিক বিদ্যালয় স্পেশাল)">
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

            {/* Mobile Tab Switcher between Form & Preview */}
            <div className="flex sm:hidden p-1 bg-slate-200/90 rounded-xl no-print">
              <button
                onClick={() => setActiveMobileTab('form')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMobileTab === 'form'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                তথ্য ইনপুট ফর্ম
              </button>
              <button
                onClick={() => setActiveMobileTab('preview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMobileTab === 'preview'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                লাইভ প্রিভিউ ও PDF
              </button>
            </div>

            {/* Split View Grid: Left Form, Right Live A4 Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form Controls */}
              <div className={`lg:col-span-5 no-print ${activeMobileTab === 'form' ? 'block' : 'hidden sm:block'}`}>
                <ApplicationForm
                  template={currentTemplate}
                  formData={formData}
                  onChange={handleFormChange}
                  onReset={handleResetForm}
                  onFillSample={handleFillSample}
                />
              </div>

              {/* Right Column: Live A4 Document Preview */}
              <div className={`lg:col-span-7 ${activeMobileTab === 'preview' ? 'block' : 'hidden sm:block'}`}>
                <DocumentPreview
                  template={currentTemplate}
                  formData={formData}
                  onSave={handleSaveApplication}
                  onLogGeneration={handleLogGeneration}
                  onBodyChange={(customText) => handleFormChange({ customBodyText: customText })}
                />
              </div>

            </div>

            {/* Bottom AdSense Slot */}
            <AdSlot slotId="generator-bottom-slot" format="banner" />

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 space-y-1 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} অফিসিয়াল দরখাস্ত প্রস্তুতকারক (PWA) • সরকারি প্রাথমিক বিদ্যালয় ও শিক্ষা প্রতিষ্ঠান স্পেশাল
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Left Aligned & Justified</span>
            <span>•</span>
            <span>নো-লগইন পলিসি</span>
            <span>•</span>
            <span>অফলাইন ক্যাশিং</span>
            <span>•</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-emerald-700 transition-colors font-semibold"
            >
              অ্যাডমিন পোর্টাল (/admin-panel)
            </button>
          </div>
        </div>
      </footer>

      {/* iOS Safari PWA Installation Guidance Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                আইফোনে অ্যাপ ইনস্টল নির্দেশিকা
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Safari ব্রাউজারে নিচের ধাপগুলো অনুসরণ করে সরাসরি হোম স্ক্রিনে যুক্ত করুন:
              </p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ১
                </span>
                <p className="text-slate-700">
                  Safari স্ক্রিনের নিচে <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> <b>Share</b> বোতামে ট্যাপ করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ২
                </span>
                <p className="text-slate-700">
                  নিচে স্ক্রোল করে <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" /> <b>Add to Home Screen</b> বেছে নিন।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ৩
                </span>
                <p className="text-slate-700">
                  উপরে ডানপাশে <b>Add</b> বাটনে চাপুন। আপনার মোবাইলে অ্যাপ তৈরি হয়ে যাবে!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosPrompt(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              বুঝেছি, বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Folder Loader Modal (Application) */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-amber-300">
                  📁
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    পিসির ফোল্ডার লোডার (Application Folder Loader)
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    আপনার পিসির ফোল্ডার বা ফাইল নির্বাচন করে দরখাস্তের ডেটা ইনপুট বা কোড দেখুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <FolderUploader
                onImportFromFile={(parsed) => {
                  if (parsed.applicant?.designation) {
                    setGlobalDesignation(parsed.applicant.designation);
                  }
                  showToast('ফাইল থেকে তথ্য সফলভাবে ইমপোর্ট করা হয়েছে', 'success');
                  setIsFolderModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Print Settings Modal */}
      <PrintSettingsModal
        isOpen={isPrintSettingsModalOpen}
        onClose={() => setIsPrintSettingsModalOpen(false)}
        settings={printSettings}
        onUpdateSettings={(updated) => {
          setPrintSettings((prev) => ({ ...prev, ...updated }));
          showToast('প্রিন্ট সেটিংস হালনাগাদ করা হয়েছে', 'info');
        }}
        onResetSettings={() => {
          setPrintSettings(DEFAULT_PRINT_SETTINGS);
          showToast('প্রিন্ট সেটিংস ডিফল্ট মানে রিসেট করা হয়েছে', 'info');
        }}
      />

      {/* Saved Applications Modal (Approver / Archive) */}
      <SavedApplicationsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedApps={savedApps}
        onLoadApp={handleLoadSaved}
        onDeleteApp={handleDeleteSaved}
      />

      {/* Admin Panel Modal (/admin-panel) */}
      <AdminPanel
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Notification Toast Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

    </div>
  );
}
