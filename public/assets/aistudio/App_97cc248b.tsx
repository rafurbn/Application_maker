import { useState, useEffect } from 'react';
import { SubCategoryType, ApplicationFormData, SavedApplication } from './types';
import { ALL_TEMPLATES, getDefaultFormData, getSampleFormData } from './data/templates';
import { getSavedApplications, saveApplicationLocally, deleteSavedApplication, type SaveResult } from './utils/storage';
import { useAnonymousIdentity } from './hooks/useAnonymousIdentity';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ApplicationForm } from './components/ApplicationForm';
import { DocumentPreview } from './components/DocumentPreview';
import { SavedApplicationsModal } from './components/SavedApplicationsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdSlot } from './components/AdSlot';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ArrowLeft } from 'lucide-react';

// Above this many saved applications the localStorage copy starts to be at risk on
// phones with a small quota, so the user is warned before saving can fail.
const SAVED_APPLICATIONS_SOFT_LIMIT = 50;


export default function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<SubCategoryType | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData | null>(null);
  const [savedApps, setSavedApps] = useState<SavedApplication[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { trackApplicationGeneration } = useAnonymousIdentity();

  // Load saved apps from local storage on mount
  useEffect(() => {
    setSavedApps(getSavedApplications());

    // Check if directly navigating to /admin-panel
    if (window.location.pathname === '/admin-panel') {
      setIsAdminModalOpen(true);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleSelectTemplate = (templateId: SubCategoryType) => {
    const template = ALL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setFormData(getDefaultFormData(template));
      setActiveMobileTab('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const handleFormChange = (updatedFields: Partial<ApplicationFormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const handleResetForm = () => {
    if (currentTemplate) {
      setFormData(getDefaultFormData(currentTemplate));
      showToast('ফর্ম ডিফল্ট মানে রিসেট করা হয়েছে', 'info');
    }
  };

  const handleFillSample = () => {
    if (currentTemplate) {
      setFormData(getSampleFormData(currentTemplate));
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
    showToast(`'${saved.formatTitle}' সফলভাবে লোড হয়েছে`, 'success');
  };

  const handleLogGeneration = () => {
    if (currentTemplate) {
      trackApplicationGeneration(currentTemplate.id, currentTemplate.title);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Header */}
      <Header
        savedCount={savedApps.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onGoHome={() => setSelectedTemplateId(null)}
      />

      {/* Main App Content */}
      <main className="flex-1 pb-16">
        {!selectedTemplateId || !currentTemplate || !formData ? (
          /* Home Screen with Two-Part Layout */
          <HomeScreen onSelectTemplate={handleSelectTemplate} />
        ) : (
          /* Application Generator Split-View Screen */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Navigation & Breadcrumb Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 no-print">
              <button
                onClick={() => setSelectedTemplateId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span>সব ফরম্যাটে ফিরে যান</span>
              </button>

              {/* Quick Template Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  অন্য ফরম্যাট দেখুন:
                </span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value as SubCategoryType)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 font-medium shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
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
            © {new Date().getFullYear()} আবেদনপত্র প্রস্তুতকারক (PWA) • প্রাথমিক বিদ্যালয় ও শিক্ষা প্রতিষ্ঠান স্পেশাল
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>নো-লগইন পলিসি</span>
            <span>•</span>
            <span>অফলাইন ক্যাশিং</span>
            <span>•</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-emerald-700 transition-colors"
            >
              অ্যাডমিন পোর্টাল
            </button>
          </div>
        </div>
      </footer>

      {/* Saved Applications Modal */}
      <SavedApplicationsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedApps={savedApps}
        onLoadApp={handleLoadSaved}
        onDeleteApp={handleDeleteSaved}
      />

      {/* Admin Panel Modal */}
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
