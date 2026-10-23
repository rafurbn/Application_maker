import React, { useState, useEffect } from 'react';
import { OfficialApplication, PrintSettings } from '../types';
import { DesignationSelector } from './DesignationSelector';
import { PrintPreviewSheet } from './PrintPreviewSheet';
import {
  ChevronLeft,
  Printer,
  FileDown,
  RotateCcw,
  Sparkles,
  FileText,
  User,
  Building,
  Calendar,
  Eye,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ApplicationInputDashboardProps {
  application: OfficialApplication;
  onUpdateApplication: (app: OfficialApplication) => void;
  onBackToDashboard: () => void;
  printSettings: PrintSettings;
  globalDesignation?: string;
  onUpdateGlobalDesignation?: (desig: string) => void;
}

export const ApplicationInputDashboard: React.FC<ApplicationInputDashboardProps> = ({
  application,
  onUpdateApplication,
  onBackToDashboard,
  printSettings,
  globalDesignation = 'সহকারী শিক্ষক',
  onUpdateGlobalDesignation,
}) => {
  // Input fields state
  const [applicantName, setApplicantName] = useState(application.applicant.name || 'মোছাঃ ফাতেমা আক্তার');
  const [applicantDesignation, setApplicantDesignation] = useState(
    application.applicant.designation || globalDesignation || 'সহকারী শিক্ষক'
  );
  const [applicantInstitute, setApplicantInstitute] = useState('কালাইউরা সরকারি প্রাথমিক বিদ্যালয়');
  const [applicantUpazila, setApplicantUpazila] = useState('বিয়ানীবাজার');
  const [applicantZila, setApplicantZila] = useState('সিলেট');
  const [applicantPhone, setApplicantPhone] = useState(application.applicant.phone || '০১৭১১-XXXXXX');

  // Recipient inputs
  const [recipientDesignation, setRecipientDesignation] = useState(
    application.recipient.designation || 'প্রধান শিক্ষক / ব্যবস্থাপক'
  );
  const [recipientInstitute, setRecipientInstitute] = useState('কালাইউরা সরকারি প্রাথমিক বিদ্যালয়');
  const [recipientUpazila, setRecipientUpazila] = useState('বিয়ানীবাজার');
  const [recipientZila, setRecipientZila] = useState('সিলেট');
  const [through, setThrough] = useState(application.through || 'যথাযথ কর্তৃপক্ষ।');

  // Application specific inputs
  const [date, setDate] = useState(application.date || '২৬ অক্টোবর ২০২৬');
  const [startDate, setStartDate] = useState('২৭ অক্টোবর ২০২৬');
  const [endDate, setEndDate] = useState('২৯ অক্টোবর ২০২৬');
  const [daysCount, setDaysCount] = useState('৩');
  const [reason, setReason] = useState('জরুরি পারিবারিক');
  const [diseaseName, setDiseaseName] = useState('তীব্র শারীরিক অসুস্থতা');
  const [expectedBirthDate, setExpectedBirthDate] = useState('১০ নভেম্বর ২০২৬');
  const [maternityStage, setMaternityStage] = useState<'প্রথম' | 'দ্বিতীয়'>('প্রথম');
  const [previousLeaveType, setPreviousLeaveType] = useState('চিকিৎসা ছুটি');
  const [retirementDate, setRetirementDate] = useState('১৪ জানুয়ারি ২০২৭');
  const [travelPurpose, setTravelPurpose] = useState('পবিত্র ওমরাহ পালনের');
  const [destinationCountry, setDestinationCountry] = useState('সৌদি আরব');
  const [marriageDate, setMarriageDate] = useState('২০ নভেম্বর ২০২৬');

  // View mode on mobile: 'form' or 'preview'
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Sync designation with global if updated
  useEffect(() => {
    if (globalDesignation && globalDesignation !== applicantDesignation) {
      setApplicantDesignation(globalDesignation);
    }
  }, [globalDesignation]);

  // Generate updated OfficialApplication based on user inputs matching the PDF templates exactly
  const constructApplication = (): OfficialApplication => {
    let bodyText = '';
    let prayerText = '';
    let subject = application.subject;

    const fullRecipientAddress = recipientUpazila ? `${recipientUpazila}, ${recipientZila}।` : `${recipientZila}।`;
    const fullApplicantInstitute = `${applicantInstitute}, ${applicantUpazila}, ${applicantZila}।`;

    if (application.id === 'cl-application') {
      subject = 'নৈমিত্তিক ছুটির জন্য আবেদন।';
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। আমার ${reason} কারণে আগামী ${startDate} হতে ${endDate} পর্যন্ত মোট ${daysCount} দিন কর্মস্থলে উপস্থিত থাকা সম্ভব হবে না। এমতাবস্থায় উল্লেখিত দিন সমূহের নৈমিত্তিক ছুটি মঞ্জুরীর জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।`;
      prayerText = `অতএব, মহোদয় সমীপে বিনীত প্রার্থনা, আমাকে প্রার্থীত ${daysCount} দিনের নৈমিত্তিক ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`;
    } else if (application.id === 'medical-leave-app') {
      subject = 'চিকিৎসা ছুটির জন্য আবেদন।';
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। আমি গত কয়েকদিন ধরে ${diseaseName}-এ ভুগছি। একারণে ডাক্তারের শরণাপন্ন হলে ডাক্তার আমাকে সম্পূর্ণ বিশ্রামে থাকার পরামর্শ প্রদান করেন। এমতাবস্থায় আমার আগামী ${startDate} হতে ${endDate} পর্যন্ত মোট ${daysCount} দিনের চিকিৎসা ছুটির প্রয়োজন। এ প্রেক্ষিতে মহোদয়ের নিকট ${daysCount} দিনের চিকিৎসা ছুটি মঞ্জুরীর জন্য বিনীত আবেদন করছি।`;
      prayerText = `অতএব, বিনীত প্রার্থনা এই যে, আমার শারীরিক অবস্থা বিবেচনা করে প্রার্থীত ${daysCount} দিনের চিকিৎসা ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`;
    } else if (application.id === 'maternity-leave-app') {
      subject = `${maternityStage} মাতৃত্বকালীন ছুটির জন্য আবেদন।`;
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। বর্তমানে আমি সন্তানসম্ভবা এবং চিকিৎসকের মতামত অনুযায়ী আমার সন্তান জন্মদানের সম্ভাব্য তারিখ ${expectedBirthDate}। এমতাবস্থায়, চিকিৎসকের পরামর্শ ও সরকারি বিধি মোতাবেক সন্তান প্রসবের পূর্ববর্তী ও পরবর্তী সময়ের জন্য আমার মোট ৬ (ছয়) মাস মাতৃত্বকালীন ছুটি প্রয়োজন। এ প্রেক্ষিতে, আগামী ${startDate} হতে ${endDate} পর্যন্ত মোট ৬ (ছয়) মাস ${maternityStage} মাতৃত্বকালীন ছুটি ভোগ করার জন্য মহোদয়ের নিকট বিনীত আবেদন জানাচ্ছি।`;
      prayerText = `অতএব, বিনীত প্রার্থনা এই যে, আমার শারীরিক অবস্থা এবং প্রচলিত সরকারি বিধিমালা বিবেচনা করে উক্ত মেয়াদের জন্য পূর্ণ বেতনসহ ${maternityStage} মাতৃত্বকালীন ছুটি মঞ্জুর করতে আপনার সদয় আদেশ দানে বাধিত করবেন।`;
    } else if (application.id === 'joining-letter-app') {
      subject = `${previousLeaveType} শেষে কর্মস্থলে যোগদানের আবেদন।`;
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী, ${applicantInstitute}, ${applicantUpazila}, ${applicantZila}-এর ${applicantDesignation}। আমি বিগত ${startDate} হতে ${endDate} পর্যন্ত মোট ${daysCount} দিনের ${previousLeaveType}তে ছিলাম। উক্ত ছুটির মেয়াদ শেষে অদ্য ${date} তারিখ পূর্বাহ্ণে পুনরায় আমি আমার কর্তব্য কাজে যোগদান করেছি।`;
      prayerText = `অতএব, মহোদয় সমীপে প্রার্থনা এই যে, আমার এই যোগদানপত্রটি গ্রহণপূর্বক চাকুরীবহি বা অফিসিয়াল নথিতে অন্তর্ভুক্ত করার সদয় ব্যবস্থা গ্রহণে আপনার মর্জি হয়।`;
    } else if (application.id === 'prl-pension-app') {
      subject = 'অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুরীর আবেদন।';
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। আগামী ${retirementDate} তারিখে আমার বয়স ৫৯ বছর পূর্ণ হবে এবং আমি চাকুরি হতে অবসরে যাওয়ার যোগ্যতা অর্জন করব। আমি অবসর উত্তর ছুটি (PRL) ভোগ করতে ইচ্ছুক মর্মে মহোদয়ে নিকট আমাকে বিধি মোতাবেক অবসরে ${startDate} হতে ${endDate} পর্যন্ত মোট ০১ বছরের অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুরীর জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।`;
      prayerText = `অতএব, মহোদয় সমীপে প্রার্থনা এই যে, আমাকে আগামী ${startDate} হতে ${endDate} পর্যন্ত ০১ বছরের অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুর করতে আপনার সদয় মর্জি হয়।`;
    } else if (application.id === 'passport-noc-app') {
      subject = 'আন্তর্জাতিক পাসপোর্ট তৈরির জন্য অনাপত্তি সনদ (NOC) পাওয়ার আবেদন।';
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। আমার ${travelPurpose} উদ্দেশ্যে একটি নতুন আন্তর্জাতিক পাসপোর্ট তৈরি করা প্রয়োজন। পাসপোর্ট অফিসের নিয়ম অনুযায়ী কর্তৃপক্ষের অনাপত্তি সনদ (NOC) জমা দেওয়া বাধ্যতামূলক।`;
      prayerText = `অতএব, বিনীত প্রার্থনা এই যে, আমার অনুকূলে আন্তর্জাতিক পাসপোর্ট তৈরির জন্য একটি বিভাগীয় অনাপত্তি সনদ (NOC) প্রদান করতে আপনার সদয় মর্জি হয়।`;
    } else if (application.id === 'ex-bangladesh-app') {
      subject = 'বহিঃবাংলাদেশ ছুটি মঞ্জুরের জন্য আবেদন।';
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। আমার ${travelPurpose} উদ্দেশ্যে আগামী ${startDate} হতে ${endDate} পর্যন্ত মোট ${daysCount} দিন ${destinationCountry} ভ্রমণের প্রয়োজন। উক্ত ভ্রমণের যাবতীয় খরচ আমি নিজস্ব তহবিল থেকে বহন করব এবং এতে সরকারের বা প্রতিষ্ঠানের কোনো আর্থিক সংশ্লেষ থাকবে না।`;
      prayerText = `অতএব, বিনীত প্রার্থনা এই যে, আমার অনুকূলে উক্ত মেয়াদের জন্য বহিঃবাংলাদেশ ছুটি (Ex-Bangladesh Leave) মঞ্জুর করতে আপনার সদয় আদেশ কামনা করছি।`;
    } else if (application.id === 'earned-leave-app') {
      subject = 'অর্জিত ছুটি/বৈবাহিক ছুটির জন্য আবেদন।';
      bodyText = `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicantInstitute}, ${applicantUpazila}, ${applicantZila} এর ${applicantDesignation}। আগামী ${marriageDate} তারিখে আমি বিবাহ বন্ধনে আবদ্ধ হতে যাচ্ছি। বিবাহ অনুষ্ঠান সম্পন্ন করা এবং আনুষঙ্গিক পারিবারিক কাজ সম্পন্ন করার জন্য আমার আগামী ${startDate} হতে ${endDate} পর্যন্ত মোট ${daysCount} দিন অর্জিত ছুটি প্রয়োজন।`;
      prayerText = `অতএব, বিনীত প্রার্থনা এই যে, আমার জীবনের এই বিশেষ অনুষ্ঠান ও পারিবারিক প্রয়োজনীয়তা বিবেচনা করে উক্ত ${daysCount} দিনের অর্জিত/বৈবাহিক ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`;
    } else {
      // Default / student formats
      bodyText = application.bodyParagraphs[0] || 'বিনীত নিবেদন এই যে...';
      prayerText = application.prayerText || 'অতএব, সদয় বিবেচনা কামনা করছি।';
    }

    return {
      ...application,
      date,
      subject,
      through,
      recipient: {
        designation: recipientDesignation,
        office: recipientInstitute,
        address: fullRecipientAddress,
      },
      salutation: 'মহোদয়,',
      bodyParagraphs: [bodyText],
      prayerText,
      closing: 'নিবেদক,',
      applicant: {
        ...application.applicant,
        name: applicantName,
        designation: applicantDesignation,
        institute: fullApplicantInstitute,
        phone: applicantPhone,
      },
    };
  };

  const currentGeneratedApp = constructApplication();

  // Handle immediate designation change from DesignationSelector
  const handleDesignationChange = (newDesig: string) => {
    setApplicantDesignation(newDesig);
    onUpdateGlobalDesignation?.(newDesig);
  };

  // Direct 1-click PDF download
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-application');
    if (!element) {
      window.print();
      return;
    }

    try {
      setIsExportingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2.8,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`${application.title.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF error, falling back to print:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Reset to sample template values
  const handleResetToSample = () => {
    setApplicantName('মোছাঃ ফাতেমা আক্তার');
    setApplicantDesignation('সহকারী শিক্ষক');
    setApplicantInstitute('কালাইউরা সরকারি প্রাথমিক বিদ্যালয়');
    setApplicantUpazila('বিয়ানীবাজার');
    setApplicantZila('সিলেট');
    setApplicantPhone('০১৭১১-XXXXXX');
    setStartDate('২৭ অক্টোবর ২০২৬');
    setEndDate('২৯ অক্টোবর ২০২৬');
    setDaysCount('৩');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="no-print bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>সব ফরম্যাট ড্যাশবোর্ডে ফিরুন</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                ইনপুট ড্যাশবোর্ড সক্রিয়
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {application.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              নিচের ইনপুটগুলো পূরণ করলেই সাথে সাথে ডানদিকের A4 পাতায় হুবহু পিডিএফ দরখাস্ত তৈরি হবে
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <a
            href="/assets/aistudio/application_18e2efad.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors"
            title="আপনার মূল ৮-পৃষ্ঠা পিডিএফ টেমপ্লেট দেখুন"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>মূল PDF</span>
          </a>

          <button
            type="button"
            onClick={handleResetToSample}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="নমুনা তথ্য দিয়ে পুনরায় লোড করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট (Ctrl + P)</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden no-print flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileView('form')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors text-center ${
            mobileView === 'form' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          📝 ইনপুট ড্যাশবোর্ড ফর্ম
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors text-center ${
            mobileView === 'preview' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          📄 লাইভ A4 প্রিভিউ ও প্রিন্ট
        </button>
      </div>

      {/* Main Grid: Left Input Dashboard Form | Right Live A4 Sheet Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: THE INPUT DASHBOARD FORM */}
        {/* ======================================================== */}
        <div className={`lg:col-span-6 space-y-5 no-print ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* SECTION 1: আবেদনকারীর তথ্য (Applicant Information) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  ১. আবেদনকারীর তথ্য (আবেদনকারী যিনি দরখাস্ত পাঠাচ্ছেন)
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                পদবীতে সহকারী শিক্ষক শীর্ষে
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Applicant Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদনকারীর নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="যেমন: মোছাঃ ফাতেমা আক্তার"
                />
              </div>

              {/* Applicant Designation with Popup & "সহকারী শিক্ষক" at the top */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পদবী নির্বাচন <span className="text-red-500">*</span>{' '}
                  <span className="text-[10px] text-emerald-700 font-normal">
                    (পপআপে সবার উপরে “সহকারী শিক্ষক” রাখা আছে)
                  </span>
                </label>
                <DesignationSelector
                  value={applicantDesignation}
                  onChange={handleDesignationChange}
                  showQuickChips={true}
                />
              </div>

              {/* Institute & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিদ্যালয় / কর্মস্থলের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantInstitute}
                    onChange={(e) => setApplicantInstitute(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="কালাইউরা সরকারি প্রাথমিক বিদ্যালয়"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">উপজেলা</label>
                  <input
                    type="text"
                    value={applicantUpazila}
                    onChange={(e) => setApplicantUpazila(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="বিয়ানীবাজার"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={applicantZila}
                    onChange={(e) => setApplicantZila(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="সিলেট"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="০১৭১১-XXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: প্রাপকের তথ্য (Recipient / Authority) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                ২. প্রাপকের তথ্য (বরাবর - যার নিকট আবেদন পেশ করা হচ্ছে)
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কর্তৃপক্ষের পদবি <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientDesignation}
                    onChange={(e) => setRecipientDesignation(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="প্রধান শিক্ষক / ব্যবস্থাপক / উপজেলা শিক্ষা অফিসার"
                  />
                  <select
                    onChange={(e) => e.target.value && setRecipientDesignation(e.target.value)}
                    className="text-xs bg-slate-100 border border-slate-300 rounded-xl px-2 cursor-pointer"
                  >
                    <option value="">বাছাই করুন</option>
                    <option value="প্রধান শিক্ষক / ব্যবস্থাপক">প্রধান শিক্ষক / ব্যবস্থাপক</option>
                    <option value="উপজেলা শিক্ষা অফিসার">উপজেলা শিক্ষা অফিসার</option>
                    <option value="জেলা প্রাথমিক শিক্ষা অফিসার">জেলা প্রাথমিক শিক্ষা অফিসার</option>
                    <option value="মহাপরিচালক">মহাপরিচালক</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    কার্যালয় বা প্রতিষ্ঠানের নাম
                  </label>
                  <input
                    type="text"
                    value={recipientInstitute}
                    onChange={(e) => setRecipientInstitute(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="উপজেলা শিক্ষা অফিস / বিদ্যালয়"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">উপজেলা</label>
                  <input
                    type="text"
                    value={recipientUpazila}
                    onChange={(e) => setRecipientUpazila(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="বিয়ানীবাজার"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={recipientZila}
                    onChange={(e) => setRecipientZila(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="সিলেট"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">মাধ্যম</label>
                  <input
                    type="text"
                    value={through}
                    onChange={(e) => setThrough(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="যথাযথ কর্তৃপক্ষ।"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: আবেদনের সুনির্দিষ্ট বিবরণ (Application-Specific Variables) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                ৩. ছুটির / দরখাস্তের সুনির্দিষ্ট তথ্যাবলী
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Submission Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদনের তারিখ (আজকের তারিখ)
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="যেমন: ২৬ অক্টোবর ২০২৬"
                />
              </div>

              {/* Start Date, End Date, Days Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ছুটি শুরুর তারিখ
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="২৭ অক্টোবর ২০২৬"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ছুটি শেষের তারিখ
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="২৯ অক্টোবর ২০২৬"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মোট দিন সংখ্যা
                  </label>
                  <input
                    type="text"
                    value={daysCount}
                    onChange={(e) => setDaysCount(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                    placeholder="৩"
                  />
                </div>
              </div>

              {/* Template Specific Dynamic Inputs */}
              {application.id === 'cl-application' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ছুটির কারণ (নৈমিত্তিক)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="জরুরি পারিবারিক / আকস্মিক অসুস্থতা / ব্যক্তিগত"
                    />
                    <button
                      type="button"
                      onClick={() => setReason('জরুরি পারিবারিক')}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      পারিবারিক
                    </button>
                    <button
                      type="button"
                      onClick={() => setReason('আকস্মিক অসুস্থতা')}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      অসুস্থতা
                    </button>
                  </div>
                </div>
              )}

              {application.id === 'medical-leave-app' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    রোগের নাম বা শারীরিক অসুস্থতার বিবরণ
                  </label>
                  <input
                    type="text"
                    value={diseaseName}
                    onChange={(e) => setDiseaseName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="তীব্র শারীরিক অসুস্থতা / মেরুদণ্ডের ব্যথা / টাইফয়েড জ্বর"
                  />
                </div>
              )}

              {application.id === 'maternity-leave-app' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      সন্তান জন্মদানের সম্ভাব্য তারিখ
                    </label>
                    <input
                      type="text"
                      value={expectedBirthDate}
                      onChange={(e) => setExpectedBirthDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="১০ নভেম্বর ২০২৬"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      মাতৃত্বকালীন পর্যায়
                    </label>
                    <select
                      value={maternityStage}
                      onChange={(e) => setMaternityStage(e.target.value as 'প্রথম' | 'দ্বিতীয়')}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="প্রথম">প্রথম মাতৃত্বকালীন ছুটি</option>
                      <option value="দ্বিতীয়">দ্বিতীয় মাতৃত্বকালীন ছুটি</option>
                    </select>
                  </div>
                </div>
              )}

              {application.id === 'joining-letter-app' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পূর্বে যে ছুটি ভোগ করেছিলেন
                  </label>
                  <select
                    value={previousLeaveType}
                    onChange={(e) => setPreviousLeaveType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="নৈমিত্তিক ছুটি">নৈমিত্তিক ছুটি</option>
                    <option value="চিকিৎসা ছুটি">চিকিৎসা ছুটি</option>
                    <option value="মাতৃত্বকালীন ছুটি">মাতৃত্বকালীন ছুটি</option>
                    <option value="অর্জিত ছুটি">অর্জিত ছুটি</option>
                  </select>
                </div>
              )}

              {application.id === 'prl-pension-app' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ৫৯ বছর পূর্ণ হয়ে অবসরের তারিখ
                  </label>
                  <input
                    type="text"
                    value={retirementDate}
                    onChange={(e) => setRetirementDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="১৪ জানুয়ারি ২০২৭"
                  />
                </div>
              )}

              {application.id === 'passport-noc-app' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পাসপোর্ট তৈরির মূল উদ্দেশ্য
                  </label>
                  <input
                    type="text"
                    value={travelPurpose}
                    onChange={(e) => setTravelPurpose(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="পবিত্র ওমরাহ পালন / জরুরি চিকিৎসা / বিদেশ ভ্রমণ"
                  />
                </div>
              )}

              {application.id === 'ex-bangladesh-app' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ভ্রমণকারী দেশের নাম
                    </label>
                    <input
                      type="text"
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="সৌদি আরব / ভারত"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ভ্রমণের উদ্দেশ্য
                    </label>
                    <input
                      type="text"
                      value={travelPurpose}
                      onChange={(e) => setTravelPurpose(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="পবিত্র ওমরাহ পালনের"
                    />
                  </div>
                </div>
              )}

              {application.id === 'earned-leave-app' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিবাহের নির্ধারিত তারিখ
                  </label>
                  <input
                    type="text"
                    value={marriageDate}
                    onChange={(e) => setMarriageDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="২০ নভেম্বর ২০২৬"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LIVE REAL-TIME GENERATED A4 PREVIEW */}
        {/* ======================================================== */}
        <div className={`lg:col-span-6 space-y-4 ${mobileView === 'form' ? 'hidden lg:block' : 'block'}`}>
          <div className="no-print bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ইনপুট অনুযায়ী লাইভ প্রস্তুতকৃত A4 দরখাস্ত (Left Aligned & Justified)</span>
            </div>
            <span className="font-bold text-emerald-800">১০০% ভেক্টর রেডি</span>
          </div>

          {/* Render the printable sheet */}
          <PrintPreviewSheet
            application={currentGeneratedApp}
            settings={printSettings}
          />
        </div>
      </div>
    </div>
  );
};
