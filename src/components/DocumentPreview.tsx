import React, { useRef, useState } from 'react';
import { FormatTemplate, ApplicationFormData } from '../types';
import { type SaveResult } from '../utils/storage';
import { collectDocumentIssues } from '../utils/validation';
import { toBanglaDate, toBanglaNumber, formatDaysWithSuffix, getTodayISODate } from '../utils/banglaUtils';
import {
  Printer,
  Download,
  Bookmark,
  Edit3,
  Check,
  ZoomIn,
  ZoomOut,
  Copy,
  AlignJustify,
  AlertTriangle
} from 'lucide-react';

interface DocumentPreviewProps {
  template: FormatTemplate;
  formData: ApplicationFormData;
  onSave: () => SaveResult;
  onLogGeneration: () => void;
  onBodyChange?: (customText: string) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  template,
  formData,
  onSave,
  onLogGeneration,
  onBodyChange,
  onNotify,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fontSize, setFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');

  const isEmployee = template.category === 'employee';

  const getVal = (val: string | undefined, fallback: string): string => {
    return val && val.trim() !== '' ? val.trim() : fallback;
  };

  // Clean trailing punctuation to prevent double dandas or periods before 'এর'
  const cleanWorkplace = getVal(formData.workplace, '[প্রতিষ্ঠানের নাম]').replace(/[।,\.]/g, '').trim();
  const cleanUpazila = getVal(formData.upazilaOrArea, '[উপজেলার নাম]').replace(/[।,\.]/g, '').trim();
  const cleanDistrict = getVal(formData.district, '[জেলার নাম]').replace(/[।,\.]/g, '').trim();

  // "ব্যবস্থাপক" কথাটি সম্পূর্ণ বাদ দেওয়া হয়েছে
  const getRecipientDisplay = () => {
    if (formData.recipient === 'অন্যান্য' && formData.customRecipient) {
      return formData.customRecipient.replace(/\/?ব্যবস্থাপক/g, '').trim();
    }
    const raw = formData.recipient || template.defaultRecipient || 'প্রধান শিক্ষক';
    return raw.replace(/\/?ব্যবস্থাপক/g, '').trim() || 'প্রধান শিক্ষক';
  };

  const getDesignationDisplay = () => {
    if (formData.designation === 'অন্যান্য' && formData.customDesignation) {
      return formData.customDesignation;
    }
    return getVal(formData.designation, isEmployee ? 'সহকারী শিক্ষক' : 'শিক্ষার্থী');
  };

  // ---------------------------------------------------------------------------
  // Generate Official Body & Prayer Text Matching PDF Verbatim
  // ---------------------------------------------------------------------------
  const generateOfficialContent = (): { mainBody: string; prayerText: string } => {
    if (formData.customBodyText && formData.customBodyText.trim() !== '') {
      return { mainBody: formData.customBodyText, prayerText: '' };
    }

    const desig = getDesignationDisplay();
    const days = formData.totalDays || '';
    const start = formData.leaveStartDate ? toBanglaDate(formData.leaveStartDate) : '[শুরুর তারিখ]';
    const end = formData.leaveEndDate ? toBanglaDate(formData.leaveEndDate) : '[শেষের তারিখ]';

    switch (template.id) {
      case 'casual_leave': {
        const reason = getVal(formData.leaveReason, 'জরুরি পারিবারিক');
        const daysExact = formatDaysWithSuffix(days, 'দিন');
        const daysPrayer = formatDaysWithSuffix(days, 'দিনের');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। আমার ${reason} কারণে আগামী ${start} হতে ${end} পর্যন্ত মোট ${daysExact} কর্মস্থলে উপস্থিত থাকা সম্ভব হবে না। এমতাবস্থায় উল্লেখিত দিন সমূহের নৈমিত্তিক ছুটি মঞ্জুরীর জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।`,
          prayerText: `অতএব, মহোদয় সমীপে বিনীত প্রার্থনা, আমাকে প্রার্থীত ${daysPrayer} নৈমিত্তিক ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`,
        };
      }

      case 'medical_leave': {
        const illness = getVal(formData.leaveReason, 'তীব্র শারীরিক অসুস্থতা');
        const daysNeeds = formatDaysWithSuffix(days, 'দিনের');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। আমি গত কয়েকদিন ধরে ${illness}-এ ভুগছি। একারণে ডাক্তারের শরণাপন্ন হলে ডাক্তার আমাকে সম্পূর্ণ বিশ্রামে থাকার পরামর্শ প্রদান করেন। এমতাবস্থায় আমার আগামী ${start} হতে ${end} পর্যন্ত মোট ${daysNeeds} চিকিৎসা ছুটির প্রয়োজন। এ প্রেক্ষিতে মহোদয়ের নিকট ${daysNeeds} চিকিৎসা ছুটি মঞ্জুরীর জন্য বিনীত আবেদন করছি।`,
          prayerText: `অতএব, বিনীত প্রার্থনা এই যে, আমার শারীরিক অবস্থা বিবেচনা করে প্রার্থীত ${daysNeeds} চিকিৎসা ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`,
        };
      }

      case 'maternity_leave': {
        const stage = getVal(formData.maternityStage || formData.leaveReason, 'প্রথম');
        const edd = formData.expectedDeliveryDate ? toBanglaDate(formData.expectedDeliveryDate) : '[সম্ভাব্য তারিখ]';
        const mStart = formData.leaveStartDate ? toBanglaDate(formData.leaveStartDate) : '[ছুটি শুরুর তারিখ]';
        const mEnd = formData.leaveEndDate ? toBanglaDate(formData.leaveEndDate) : '[ছুটি শেষের তারিখ]';
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। বর্তমানে আমি সন্তানসম্ভবা এবং চিকিৎসকের মতামত অনুযায়ী আমার সন্তান জন্মদানের সম্ভাব্য তারিখ ${edd}। এমতাবস্থায়, চিকিৎসকের পরামর্শ ও সরকারি বিধি মোতাবেক সন্তান প্রসবের পূর্ববর্তী ও পরবর্তী সময়ের জন্য আমার মোট ৬ (ছয়) মাস মাতৃত্বকালীন ছুটি প্রয়োজন। এ প্রেক্ষিতে, আগামী ${mStart} হতে ${mEnd} পর্যন্ত মোট ৬ (ছয়) মাস ${stage} মাতৃত্বকালীন ছুটি ভোগ করার জন্য মহোদয়ের নিকট বিনীত আবেদন জানাচ্ছি।`,
          prayerText: `অতএব, বিনীত প্রার্থনা এই যে, আমার শারীরিক অবস্থা এবং প্রচলিত সরকারি বিধিমালা বিবেচনা করে উক্ত মেয়াদের জন্য পূর্ণ বেতনসহ ${stage} মাতৃত্বকালীন ছুটি মঞ্জুর করতে আপনার সদয় আদেশ দানে বাধিত করবেন।`,
        };
      }

      case 'joining_letter': {
        const jType = getVal(formData.joiningType, 'চিকিৎসা ছুটি');
        const jStart = formData.leaveStartDate ? toBanglaDate(formData.leaveStartDate) : '[ছুটি শুরুর তারিখ]';
        const jEnd = formData.leaveEndDate ? toBanglaDate(formData.leaveEndDate) : '[ছুটি শেষের তারিখ]';
        const todayStr = toBanglaDate(formData.joiningDate || formData.date || getTodayISODate());
        const session = getVal(formData.joiningTimeSession, 'পূর্বাহ্ণে');
        const daysPast = formatDaysWithSuffix(days, 'দিনের');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী, ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict}-এর ${desig}। আমি বিগত ${jStart} হতে ${jEnd} পর্যন্ত মোট ${daysPast} ${jType}তে ছিলাম। উক্ত ছুটির মেয়াদ শেষে অদ্য ${todayStr} তারিখ ${session} পুনরায় আমি আমার কর্তব্য কাজে যোগদান করেছি।`,
          prayerText: `অতএব, মহোদয় সমীপে প্রার্থনা এই যে, আমার এই যোগদানপত্রটি গ্রহণপূর্বক চাকুরীবহি বা অফিসিয়াল নথিতে অন্তর্ভুক্ত করার সদয় ব্যবস্থা গ্রহণে আপনার মর্জি হয়।`,
        };
      }

      case 'prl_pension': {
        const retDate = formData.prlRetirementDate ? toBanglaDate(formData.prlRetirementDate) : '[অবসরের তারিখ]';
        const pStart = formData.leaveStartDate ? toBanglaDate(formData.leaveStartDate) : '[ছুটি শুরুর তারিখ]';
        const pEnd = formData.leaveEndDate ? toBanglaDate(formData.leaveEndDate) : '[ছুটি শেষের তারিখ]';
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। আগামী ${retDate} তারিখে আমার বয়স ৫৯ বছর পূর্ণ হবে এবং আমি চাকুরি হতে অবসরে যাওয়ার যোগ্যতা অর্জন করব। আমি অবসর উত্তর ছুটি (PRL) ভোগ করতে ইচ্ছুক মর্মে মহোদয়ে নিকট আমাকে বিধি মোতাবেক অবসরে ${pStart} হতে ${pEnd} পর্যন্ত মোট ০১ বছরের অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুরীর জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।`,
          prayerText: `অতএব, মহোদয় সমীপে প্রার্থনা এই যে, আমাকে আগামী ${pStart} হতে ${pEnd} পর্যন্ত ০১ বছরের অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুর করতে আপনার সদয় মর্জি হয়।`,
        };
      }

      case 'passport_noc': {
        const purpose = getVal(
          formData.passportPurpose || formData.leaveReason,
          'ব্যক্তিগত ও ধর্মীয় প্রয়োজনে পবিত্র ওমরাহ পালনের উদ্দেশ্যে'
        );
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। আমার ${purpose} একটি নতুন আন্তর্জাতিক পাসপোর্ট তৈরি করা প্রয়োজন। পাসপোর্ট অফিসের নিয়ম অনুযায়ী কর্তৃপক্ষের অনাপত্তি সনদ (NOC) জমা দেওয়া বাধ্যতামূলক।`,
          prayerText: `অতএব, বিনীত প্রার্থনা এই যে, আমার অনুকূলে আন্তর্জাতিক পাসপোর্ট তৈরির জন্য একটি বিভাগীয় অনাপত্তি সনদ (NOC) প্রদান করতে আপনার সদয় মর্জি হয়।`,
        };
      }

      case 'ex_bangladesh': {
        const exPurpose = getVal(formData.exBangladeshPurpose || formData.leaveReason, 'পবিত্র হজ্ব ও ওমরাহ পালন');
        const country = getVal(formData.destinationCountry, 'সৌদি আরব');
        const cStart = formData.leaveStartDate ? toBanglaDate(formData.leaveStartDate) : '[যাত্রার তারিখ]';
        const cEnd = formData.leaveEndDate ? toBanglaDate(formData.leaveEndDate) : '[ফেরার তারিখ]';
        const daysExact = formatDaysWithSuffix(days, 'দিন');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। আমার ${exPurpose}-এর উদ্দেশ্যে আগামী ${cStart} হতে ${cEnd} পর্যন্ত মোট ${daysExact} ${country} ভ্রমণের প্রয়োজন। উক্ত ভ্রমণের যাবতীয় খরচ আমি নিজস্ব তহবিল থেকে বহন করব এবং এতে সরকারের বা প্রতিষ্ঠানের কোনো আর্থিক সংশ্লেষ থাকবে না।`,
          prayerText: `অতএব, বিনীত প্রার্থনা এই যে, আমার অনুকূলে উক্ত মেয়াদের জন্য বহিঃবাংলাদেশ ছুটি (Ex-Bangladesh Leave) মঞ্জুর করতে আপনার সদয় আদেশ কামনা করছি।`,
        };
      }

      case 'earned_leave': {
        const wedDate = formData.weddingDate ? toBanglaDate(formData.weddingDate) : '[বিবাহের তারিখ]';
        const eStart = formData.leaveStartDate ? toBanglaDate(formData.leaveStartDate) : '[ছুটি শুরুর তারিখ]';
        const eEnd = formData.leaveEndDate ? toBanglaDate(formData.leaveEndDate) : '[ছুটি শেষের তারিখ]';
        const daysExact = formatDaysWithSuffix(days, 'দিন');
        const daysPrayer = formatDaysWithSuffix(days, 'দিনের');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace}, ${cleanUpazila}, ${cleanDistrict} এর ${desig}। আগামী ${wedDate} তারিখে আমি বিবাহ বন্ধনে আবদ্ধ হতে যাচ্ছি। বিবাহ অনুষ্ঠান সম্পন্ন করা এবং আনুষঙ্গিক পারিবারিক কাজ সম্পন্ন করার জন্য আমার আগামী ${eStart} হতে ${eEnd} পর্যন্ত মোট ${daysExact} অর্জিত ছুটি প্রয়োজন।`,
          prayerText: `অতএব, বিনীত প্রার্থনা এই যে, আমার জীবনের এই বিশেষ অনুষ্ঠান ও পারিবারিক প্রয়োজনীয়তা বিবেচনা করে উক্ত ${daysPrayer} অর্জিত/বৈবাহিক ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`,
        };
      }

      // Student Templates
      case 'student_absence_leave': {
        const reason = getVal(formData.leaveReason, 'হঠাৎ তীব্র জ্বরে আক্রান্ত হওয়ার কারণে');
        const daysNeeds = formatDaysWithSuffix(days, 'দিন');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${getVal(formData.studentClass, '১০ম')} শ্রেণির একজন নিয়মিত শিক্ষার্থী। রোল নম্বর: ${toBanglaNumber(formData.rollNumber) || '০১'}। আমার ${reason} গত ${start} হতে ${end} পর্যন্ত মোট ${daysNeeds} বিদ্যালয়ে উপস্থিত হতে পারিনি।`,
          prayerText: `অতএব, মহোদয় সমীপে প্রার্থনা এই যে, আমাকে উক্ত দিনগুলোর অনুপস্থিতিজনিত ছুটি মঞ্জুর করে বাধিত করবেন।`,
        };
      }

      case 'student_advance_leave': {
        const reason = getVal(formData.leaveReason, 'বড় বোনের শুভ বিবাহ অনুষ্ঠানে যোগদানের কারণে');
        const daysNeeds = formatDaysWithSuffix(days, 'দিন');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${getVal(formData.studentClass, '৮ম')} শ্রেণির একজন নিয়মিত শিক্ষার্থী। রোল নম্বর: ${toBanglaNumber(formData.rollNumber) || '০১'}। আমার ${reason} আগামী ${start} হতে ${end} পর্যন্ত মোট ${daysNeeds} বিদ্যালয়ে উপস্থিত থাকা সম্ভব হবে না।`,
          prayerText: `অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমাকে উক্ত দিনগুলোর জন্য অগ্রিম ছুটি মঞ্জুর করতে সদয় মর্জি হয়।`,
        };
      }

      case 'student_fee_waiver': {
        const guardian = getVal(formData.fatherOrGuardianName, 'মোঃ আব্দুল জলিল');
        const condition = getVal(formData.familyMonthlyIncome, 'পিতা একজন স্বল্প আয়ের দিনমজুর, পরিবারে সদস্য সংখ্যা ৬ জন');
        const result = getVal(formData.gpaOrLastExamResult, 'পূর্ববর্তী বার্ষিক পরীক্ষায় জিপিএ ৫.০০');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${getVal(formData.studentClass, '৯ম')} শ্রেণির একজন নিয়মিত শিক্ষার্থী। রোল নম্বর: ${toBanglaNumber(formData.rollNumber) || '০১'}। আমার পিতা/অভিভাবক ${guardian}। ${condition} হওয়ায় আমার পক্ষে নিয়মিত মাসিক বেতন ও ফিস পরিশোধ করা অসম্ভব হয়ে পড়েছে। উল্লেখ্য যে, ${result}।`,
          prayerText: `অতএব, মহোদয় সমীপে প্রার্থনা এই যে, আমার পরিবারের আর্থিক অবস্থা ও লেখাপড়ার প্রতি আগ্রহ বিবেচনা করে আমাকে বিনা বেতনে অধ্যয়নের সুযোগ দিয়ে বাধিত করবেন।`,
        };
      }

      case 'student_poor_fund': {
        const guardian = getVal(formData.fatherOrGuardianName, 'মোঃ আব্দুল জলিল');
        const need = getVal(formData.leaveReason, 'এসএসসি পরীক্ষার ফরম ফিলাপের ফি পরিশোধের জন্য');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${getVal(formData.studentClass, '১০ম')} শ্রেণির একজন নিয়মিত শিক্ষার্থী। রোল নম্বর: ${toBanglaNumber(formData.rollNumber) || '০১'}। আমার পিতা/অভিভাবক ${guardian} একজন স্বল্প আয়ের মানুষ। বর্তমানে ${need} আর্থিক সমস্যার সম্মুখীন হচ্ছি।`,
          prayerText: `অতএব, মহোদয় সমীপে বিনীত প্রার্থনা, বিদ্যালয়ের দরিদ্র তহবিল থেকে আমাকে এককালীন আর্থিক সাহায্য প্রদান করতে আপনার সদয় মর্জি হয়।`,
        };
      }

      case 'student_tc': {
        const reason = getVal(formData.tcReason, 'পিতার সরকারি চাকরিজনিত কারণে নতুন কর্মস্থলে বদলি');
        const newSch = getVal(formData.newSchoolName, 'সিলেট সরকারি উচ্চ বিদ্যালয়');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${getVal(formData.studentClass, '৭ম')} শ্রেণির শিক্ষার্থী। রোল নম্বর: ${toBanglaNumber(formData.rollNumber) || '০১'}। আমার ${reason} আমাদের পরিবারকে স্থানান্তরিত হতে হচ্ছে। ফলে আমি উক্ত নতুন এলাকার ${newSch}-এ ভর্তি হতে ইচ্ছুক।`,
          prayerText: `অতএব, মহোদয়ের নিকট প্রার্থনা এই যে, আমাকে বিদ্যালয় হতে ছাড়পত্র (TC) প্রদান করার সদয় ব্যবস্থা গ্রহণ করবেন।`,
        };
      }

      case 'student_testimonial': {
        const pYear = toBanglaNumber(getVal(formData.passingYear, '২০২৫'));
        const sClass = getVal(formData.studentClass, 'এসএসসি');
        const roll = toBanglaNumber(getVal(formData.rollNumber, '২১৫৬৩৪'));
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার প্রতিষ্ঠান হতে বিগত ${pYear} সনে অনুষ্ঠিত ${sClass} পরীক্ষায় অংশগ্রহণ করে সফলতার সাথে উত্তীর্ণ হয়েছি। আমার বোর্ড রোল ও রেজিস্ট্রেশন নম্বর: ${roll}। বর্তমানে উচ্চশিক্ষায় ভর্তির জন্য আমার একটি চারিত্রিক ও শিক্ষাগত প্রশংসাপত্র প্রয়োজন।`,
          prayerText: `অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমাকে একটি প্রশংসাপত্র প্রদান করে বাধিত করবেন।`,
        };
      }

      case 'student_readmission': {
        const sClass = getVal(formData.studentClass, '৬ষ্ঠ');
        const roll = toBanglaNumber(getVal(formData.rollNumber, '০১'));
        const reason = getVal(formData.leaveReason, 'দীর্ঘদিন জন্ডিসে আক্রান্ত হয়ে চিকিৎসাধীন থাকার কারণে');
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${sClass} শ্রেণির শিক্ষার্থী ছিলাম। আমার রোল নম্বর ছিল: ${roll}। দুর্ভাগ্যবশত, আমার ${reason} যথাসময়ে বেতন পরিশোধ করতে না পারায় আমার নাম কর্তন করা হয়। বর্তমানে আমি সম্পূর্ণ সুস্থ এবং পুনরায় পাঠদানে আগ্রহী।`,
          prayerText: `অতএব, মহোদয় সমীপে বিনীত প্রার্থনা, আমাকে জরিমানাসহ পুনরায় ক্লাসে ভর্তির অনুমতি দানে আপনার সদয় মর্জি হয়।`,
        };
      }

      default:
        return {
          mainBody: `সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${cleanWorkplace} এর ${desig}। প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য বিনীত নিবেদন করছি।`,
          prayerText: `অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, উক্ত আবেদনটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।`,
        };
    }
  };

  const { mainBody, prayerText } = generateOfficialContent();
  const documentIssues = collectDocumentIssues(template, formData, `${mainBody} ${prayerText}`);

  const handlePrint = () => {
    onLogGeneration();
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = documentRef.current;
    if (!element) return;
    setIsDownloading(true);
    onLogGeneration();

    try {
      // Lazy-loaded so the ~700 kB rasteriser stays off the first-load critical path.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // The zoom slider scales an ancestor; capture at true size so every
        // export is identical regardless of the on-screen zoom level.
        onclone: (doc) => {
          const wrap = doc.querySelector('[data-zoom-wrap]') as HTMLElement | null;
          if (wrap) wrap.style.transform = 'none';
        },
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();
      const pxPerMm = canvas.width / pageWidthMm;
      const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

      let offset = 0;
      let pageIndex = 0;
      while (offset < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - offset);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceHeightPx;
        const ctx = slice.getContext('2d');
        if (!ctx) throw new Error('ক্যানভাস আঁকা যায়নি');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, sliceHeightPx);
        ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageWidthMm, sliceHeightPx / pxPerMm);

        offset += sliceHeightPx;
        pageIndex += 1;
      }

      const safeTitle = (formData.subject || template.shortTitle || 'application').replace(/[/\\?%*:|"<>]/g, '_');
      pdf.save(`${safeTitle}.pdf`);
      onNotify?.(`${pageIndex}টি পৃষ্ঠার PDF ডাউনলোড হয়েছে`, 'success');
    } catch (err) {
      console.error('PDF generation failed', err);
      onNotify?.('PDF তৈরি করা যায়নি — "প্রিন্ট" বাটন থেকেও Save as PDF করতে পারবেন।', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyText = () => {
    const text = documentRef.current?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Action Ribbon (No Print) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        
        {/* Left side actions: Save, Edit, Copy */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
            title="ব্রাউজারে সংরক্ষণ করুন"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
            <span>সংরক্ষণ</span>
          </button>

          <button
            onClick={() => setIsEditingBody(!isEditingBody)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isEditingBody
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="আবেদনপত্রের বডি সরাসরি এডিট করুন"
          >
            {isEditingBody ? <Check className="w-3.5 h-3.5 text-amber-700" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditingBody ? 'সম্পন্ন' : 'বডি এডিট'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
            title="পুরো আবেদনপত্রের লেখা কপি করুন"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'কপি হয়েছে!' : 'কপি'}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            <AlignJustify className="w-3.5 h-3.5 text-emerald-700" />
            <span>বডি: জাস্টিফাই • শিরোনাম: বামে</span>
          </div>
        </div>

        {/* Right side controls: Zoom, Font, Print, PDF */}
        <div className="flex items-center gap-2">
          
          {/* Font Size Selector */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
            <button
              onClick={() => setFontSize('text-sm')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                fontSize === 'text-sm' ? 'bg-white shadow-2xs text-emerald-900 font-bold' : 'text-slate-500'
              }`}
            >
              ছোট
            </button>
            <button
              onClick={() => setFontSize('text-base')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                fontSize === 'text-base' ? 'bg-white shadow-2xs text-emerald-900 font-bold' : 'text-slate-500'
              }`}
            >
              স্বাভাবিক
            </button>
            <button
              onClick={() => setFontSize('text-lg')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                fontSize === 'text-lg' ? 'bg-white shadow-2xs text-emerald-900 font-bold' : 'text-slate-500'
              }`}
            >
              বড়
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(80, prev - 10))}
              className="p-1 hover:bg-white rounded-md text-slate-600"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold text-slate-700 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
              className="p-1 hover:bg-white rounded-md text-slate-600"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>প্রিন্ট</span>
          </button>

          {/* 1-Click PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'তৈরি হচ্ছে...' : '১-ক্লিকে PDF'}</span>
          </button>

        </div>

      </div>

      {/* Ready-to-print checklist — placeholders must not reach a signed application */}
      {documentIssues.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5 no-print shadow-2xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              প্রিন্ট/PDF এর আগে {documentIssues.length}টি জায়গা পূরণ করুন
              (খালি কাগজের জন্য ইচ্ছে করে ফেলে রাখলে এটি উপেক্ষা করুন):
            </span>
          </div>
          <ul className="space-y-0.5 pl-6 list-disc text-amber-900">
            {documentIssues.slice(0, 8).map((issue) => (
              <li key={`${issue.kind}:${issue.label}`}>
                <span className="font-semibold">{issue.label}</span>
                {issue.kind === 'placeholder' ? ' — নমুনা/প্লেসহোল্ডার লেখা আছে' : ' — খালি'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Body In-Place Editor Modal / Box (When active) */}
      {isEditingBody && (
        <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2 no-print shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              দরখাস্তের মূল বক্তব্য (বডি টেক্সট) সরাসরি এডিট করুন:
            </span>
            <button
              onClick={() => {
                onBodyChange?.('');
                setIsEditingBody(false);
              }}
              className="text-[11px] text-amber-800 hover:underline"
            >
              ডিফল্ট টেক্সটে ফিরুন
            </button>
          </div>
          <textarea
            rows={6}
            value={formData.customBodyText !== undefined ? formData.customBodyText : mainBody}
            onChange={(e) => onBodyChange?.(e.target.value)}
            className="w-full p-3 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed font-sans"
          />
        </div>
      )}

      {/* Live A4 Document Sheet with Increased Side Margins (35mm) */}
      <div className="overflow-x-auto pb-6 flex justify-center">
        <div
          data-zoom-wrap="true"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150"
        >
          <div
            ref={documentRef}
            className={`w-[210mm] min-h-[297mm] pt-[22mm] pb-[22mm] px-[35mm] bg-white text-black shadow-lg rounded-sm border border-slate-200/60 leading-[1.85] font-serif-bn ${fontSize} print-only-container application-sheet`}
            style={{
              boxSizing: 'border-box',
            }}
          >
            
            {/* Top Template Title (Left-Aligned, no 'ব্যবস্থাপক') */}
            <div className="text-left font-bold text-[18px] text-black mb-8 leading-normal font-sans-bn">
              {template.title.replace(/\/?ব্যবস্থাপক/g, '')}
            </div>

            {/* 1. Date - Left Aligned in DD/MM/YYYY (e.g., ২২/১০/২০২৬) */}
            <div className="text-left font-sans-bn text-[15px] mb-5">
              তারিখ: <span className="font-semibold">{toBanglaDate(formData.date || getTodayISODate())}</span>
            </div>

            {/* 2. Recipient Information - Strictly Left Aligned, no 'ব্যবস্থাপক' */}
            <div className="text-left space-y-0.5 mb-5 font-serif-bn">
              <div>বরাবর,</div>
              <div className="font-bold text-[16px]">{getRecipientDisplay()}</div>
              {formData.organization && <div>{formData.organization}</div>}
              <div>
                {[cleanUpazila, cleanDistrict].filter(Boolean).join(', ')}।
              </div>
            </div>

            {/* 3. Through (মাধ্যম) - Left Aligned */}
            {formData.through && formData.through !== 'সরাসরি' && (
              <div className="text-left mb-5 font-semibold text-slate-900">
                {formData.through.startsWith('মাধ্যম') ? formData.through : `মাধ্যম: ${formData.through}।`}
              </div>
            )}

            {/* 4. Subject - Left Aligned */}
            <div className="text-left font-bold text-[16px] mb-5">
              বিষয়: {formData.subject || template.defaultSubject}
            </div>

            {/* 5. Salutation - Left Aligned */}
            <div className="text-left mb-3 font-semibold">
              {formData.salutation || 'মহোদয়,'}
            </div>

            {/* 6. Main Body Text - Strictly Justified Alignment */}
            <div
              className="mb-5 leading-[2] text-black font-serif-bn"
              style={{
                textAlign: 'justify',
                textJustify: 'inter-word',
                textAlignLast: 'left',
              }}
            >
              <p
                style={{
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textAlignLast: 'left',
                }}
              >
                {mainBody}
              </p>
            </div>

            {/* 7. Prayer Text (অতএব, ...) - Strictly Justified Alignment */}
            {prayerText && (
              <div
                className="mb-6 leading-[2] text-black font-serif-bn"
                style={{
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textAlignLast: 'left',
                }}
              >
                <p
                  style={{
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    textAlignLast: 'left',
                  }}
                >
                  {prayerText}
                </p>
              </div>
            )}

            {/* 8. Closing & Signoff - Strictly Left Aligned */}
            <div className="text-left pt-2 space-y-0.5 font-serif-bn">
              <div className="font-semibold mb-5">নিবেদক,</div>
              <div className="font-bold text-[16px] text-black">
                {getVal(formData.applicantName, '[নাম]')}
              </div>
              <div>{getDesignationDisplay()}</div>
              <div>{cleanWorkplace}</div>
              <div>
                {[cleanUpazila, cleanDistrict].filter(Boolean).join(', ')}
              </div>
              {/* মোবাইল নম্বর বাংলা ডিজিটে কনভার্ট করা হয়েছে */}
              <div>
                মোবাইল নম্বর: {formData.mobile ? toBanglaNumber(formData.mobile) : '[মোবাইল নম্বর:]'}
              </div>
            </div>

            {/* 9. Attachments (সংযুক্তি) if any - Left Aligned */}
            {formData.attachments && (
              <div className="mt-8 pt-4 border-t border-slate-300 text-left text-xs font-sans-bn text-slate-800 space-y-1">
                <div className="font-bold text-slate-950">সংযুক্তি:</div>
                <div className="text-left">{formData.attachments}</div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};
