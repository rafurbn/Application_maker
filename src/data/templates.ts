import { FormatTemplate, ApplicationFormData } from '../types';
import { getTodayISODate } from '../utils/banglaUtils';

// সহকারী শিক্ষক পদবী সবার শীর্ষে রাখা হয়েছে
export const TEACHER_DESIGNATIONS = [
  'সহকারী শিক্ষক',
  'প্রধান শিক্ষক',
  'প্রধান শিক্ষক (চ:দা:)',
  'প্রধান শিক্ষক (ভারপ্রাপ্ত)',
  'সহকারী উপজেলা প্রাথমিক শিক্ষা অফিসার',
  'উপজেলা প্রাথমিক শিক্ষা অফিসার',
];

export const TEACHER_RECIPIENTS = [
  'প্রধান শিক্ষক',
  'প্রধান শিক্ষক (চ:দা:)',
  'প্রধান শিক্ষক (ভারপ্রাপ্ত)',
  'সহকারী উপজেলা প্রাথমিক শিক্ষা অফিসার',
  'উপজেলা প্রাথমিক শিক্ষা অফিসার',
  'জেলা প্রাথমিক শিক্ষা অফিসার',
];

export const TEACHER_THROUGH_OPTIONS = [
  'যথাযথ কর্তৃপক্ষ',
  'মাধ্যম: যথাযথ কর্তৃপক্ষ',
  'সরাসরি',
];

export const STUDENT_RECIPIENTS = [
  'প্রধান শিক্ষক',
  'অধ্যক্ষ',
  'উপাধ্যক্ষ',
  'প্রধান শিক্ষক / প্রধান শিক্ষিকা',
  'ভারপ্রাপ্ত অধ্যক্ষ',
];

export const STUDENT_CLASSES = [
  '১ম শ্রেণি',
  '২য় শ্রেণি',
  '৩য় শ্রেণি',
  '৪র্থ শ্রেণি',
  '৫ম শ্রেণি',
  '৬ষ্ঠ শ্রেণি',
  '৭ম শ্রেণি',
  '৮ম শ্রেণি',
  '৯ম শ্রেণি',
  '১০ম শ্রেণি (এসএসসি পরীক্ষার্থী)',
  'একাদশ শ্রেণি',
  'দ্বাদশ শ্রেণি (এইচএসসি পরীক্ষার্থী)',
  'ডিগ্রি / অনার্স',
];

export const JOINING_TYPES = [
  'নৈমিত্তিক ছুটি',
  'চিকিৎসা ছুটি',
  'প্রথম মাতৃত্বকালীন ছুটি',
  'দ্বিতীয় মাতৃত্বকালীন ছুটি',
  'অর্জিত ছুটি',
  'বহিঃবাংলাদেশ ছুটি',
];

export const ALL_TEMPLATES: FormatTemplate[] = [
  // --- PART 1: Govt Primary School / Employee Templates (PDF হুবহু ৮টি নমুনা) ---
  {
    id: 'casual_leave',
    title: '১. নৈমিত্তিক ছুটির আবেদন (Casual Leave - CL)',
    shortTitle: 'নৈমিত্তিক ছুটি (CL)',
    category: 'employee',
    description: 'আকস্মিক অসুস্থতা, জরুরি পারিবারিক বা ব্যক্তিগত প্রয়োজনে নৈমিত্তিক ছুটির সরকারি আবেদনপত্র।',
    badge: 'চাকরিজীবী',
    iconName: 'CalendarDays',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'নৈমিত্তিক ছুটির জন্য আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'leaveReason',
        label: 'ছুটির কারণ',
        type: 'select',
        options: [
          'জরুরি পারিবারিক',
          'অসুস্থতা',
          'ব্যক্তিগত',
          'জরুরি পারিবারিক প্রয়োজনের',
          'হঠাৎ অসুস্থতা ও শারীরিক দুর্বলতার',
        ],
        defaultValue: 'জরুরি পারিবারিক',
        required: true,
      },
    ],
  },
  {
    id: 'medical_leave',
    title: '২. চিকিৎসা ছুটির আবেদন (Medical Leave)',
    shortTitle: 'চিকিৎসা ছুটি',
    category: 'employee',
    description: 'অসুস্থতার কারণে চিকিৎসকের পরামর্শ অনুযায়ী নির্দিষ্ট মেয়াদের চিকিৎসা ছুটির আবেদনপত্র।',
    badge: 'চাকরিজীবী',
    iconName: 'Activity',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'চিকিৎসা ছুটির জন্য আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'leaveReason',
        label: 'রোগের নাম বা শারীরিক অসুস্থতা',
        type: 'text',
        placeholder: 'যেমন: তীব্র শারীরিক অসুস্থতা / টাইফয়েড জ্বর',
        defaultValue: 'তীব্র শারীরিক অসুস্থতা',
        required: true,
      },
      {
        key: 'attachments',
        label: 'সংযুক্তি',
        type: 'text',
        defaultValue: 'রেজিস্টার্ড চিকিৎসকের ব্যবস্থাপত্র ও প্রত্যয়নপত্র',
      },
    ],
  },
  {
    id: 'maternity_leave',
    title: '৩. মাতৃত্বকালীন ছুটির আবেদন (Maternity Leave)',
    shortTitle: 'মাতৃত্বকালীন ছুটি',
    category: 'employee',
    description: 'নারী শিক্ষকদের জন্য সরকারি নিয়ম অনুযায়ী নির্দিষ্ট মেয়াদের পূর্ণ বেতনসহ ১ম বা ২য় মাতৃত্বকালীন ছুটির ফরম্যাট।',
    badge: 'চাকরিজীবী',
    iconName: 'HeartHandshake',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'প্রথম/দ্বিতীয় মাতৃত্বকালীন ছুটির জন্য আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'maternityStage',
        label: 'মাতৃত্বকালীন ছুটির পর্যায়',
        type: 'select',
        options: ['প্রথম', 'দ্বিতীয়'],
        defaultValue: 'প্রথম',
        required: true,
      },
      {
        key: 'expectedDeliveryDate',
        label: 'চিকিৎসক প্রদত্ত সন্তান জন্মদানের সম্ভাব্য তারিখ',
        type: 'text',
        placeholder: 'যেমন: ১৫ নভেম্বর ২০২৬',
        defaultValue: '১৫ নভেম্বর ২০২৬',
        required: true,
      },
      {
        key: 'attachments',
        label: 'সংযুক্তি',
        type: 'text',
        defaultValue: 'আল্ট্রাসনোগ্রাম রিপোর্ট ও চিকিৎসকের প্রত্যাশিত প্রসবকালীন সম্ভাব্য তারিখের প্রত্যয়নপত্র',
      },
    ],
  },
  {
    id: 'joining_letter',
    title: '৪. ছুটি শেষে কর্মস্থলে যোগদানের আবেদন (Joining Report)',
    shortTitle: 'যোগদানপত্র (Joining)',
    category: 'employee',
    description: 'চিকিৎসা ছুটি, মাতৃত্বকালীন ছুটি বা অর্জিত ছুটি শেষে কর্মস্থলে পুনঃযোগদানের আবেদনপত্র।',
    badge: 'চাকরিজীবী',
    iconName: 'FileCheck',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'চিকিৎসা ছুটি শেষে কর্মস্থলে যোগদানের আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    joiningTypeOptions: JOINING_TYPES,
    fields: [
      {
        key: 'joiningType',
        label: 'ভোগকৃত ছুটির ধরন',
        type: 'select',
        options: JOINING_TYPES,
        defaultValue: 'চিকিৎসা ছুটি',
        required: true,
      },
      {
        key: 'previousLeaveOrderNo',
        label: 'পূর্বের ছুটির স্মারক নম্বর ও তারিখ (যদি থাকে)',
        type: 'text',
        placeholder: 'যেমন: উশিঅ/বিয়ানী/২০২৬/৪৫, তারিখ: ১০-০৫-২০২৬',
      },
    ],
  },
  {
    id: 'prl_pension',
    title: '৫. পিআরএল (PRL) ও পেনশনে গমনের আবেদন',
    shortTitle: 'পিআরএল ও পেনশন',
    category: 'employee',
    description: 'সরকারি চাকুরির বয়স ৫৯ বছর পূর্ণ হওয়ায় অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুরীর আবেদন।',
    badge: 'চাকরিজীবী',
    iconName: 'Clock',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'অবসর উত্তর ছুটি (PRL) এবং এককালীন লাম্বগ্রান্ট মঞ্জুরীর আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'prlRetirementDate',
        label: 'অবসরের তারিখ (বয়স ৫৯ বছর পূর্ণ হওয়ার তারিখ)',
        type: 'text',
        placeholder: 'যেমন: ১৪ জানুয়ারি ২০২৭',
        defaultValue: '১৪ জানুয়ারি ২০২৭',
        required: true,
      },
      {
        key: 'attachments',
        label: 'সংযুক্তি',
        type: 'text',
        defaultValue: 'সার্ভিস বুক, জাতীয় পরিচয়পত্রের কপি ও প্রথম যোগদানের প্রমাণপত্র',
      },
    ],
  },
  {
    id: 'passport_noc',
    title: '৬. পাসপোর্ট তৈরির অনুমতিপত্র (NOC) পাওয়ার আবেদন',
    shortTitle: 'পাসপোর্ট এনওসি (NOC)',
    category: 'employee',
    description: 'আন্তর্জাতিক পাসপোর্ট তৈরির জন্য বিভাগীয় অনাপত্তি সনদ (NOC) পাওয়ার আবেদনপত্র।',
    badge: 'চাকরিজীবী',
    iconName: 'ShieldCheck',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'আন্তর্জাতিক পাসপোর্ট তৈরির জন্য অনাপত্তি সনদ (NOC) পাওয়ার আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'passportPurpose',
        label: 'পাসপোর্টের প্রয়োজনীয়তার বিবরণ',
        type: 'select',
        options: [
          'ব্যক্তিগত ও ধর্মীয় প্রয়োজনে পবিত্র ওমরাহ পালনের উদ্দেশ্যে',
          'চিকিৎসার জন্য বিদেশ ভ্রমণের উদ্দেশ্যে',
          'আন্তর্জাতিক ভ্রমণ ও দর্শনীয় স্থান পরিদর্শনের উদ্দেশ্যে',
          'পারিবারিক প্রয়োজনে বিদেশ ভ্রমণের উদ্দেশ্যে',
        ],
        defaultValue: 'ব্যক্তিগত ও ধর্মীয় প্রয়োজনে পবিত্র ওমরাহ পালনের উদ্দেশ্যে',
        required: true,
      },
      {
        key: 'attachments',
        label: 'সংযুক্তি',
        type: 'text',
        defaultValue: 'জাতীয় পরিচয়পত্র, প্রথম নিয়োগপত্র ও ছবি',
      },
    ],
  },
  {
    id: 'ex_bangladesh',
    title: '৭. বহিঃবাংলাদেশ ছুটির আবেদন (Ex-Bangladesh Leave)',
    shortTitle: 'বহিঃবাংলাদেশ ছুটি',
    category: 'employee',
    description: 'চিকিৎসা, হজ্জ বা আত্মীয়ের সাথে সাক্ষাতের উদ্দেশ্যে বহিঃবাংলাদেশ ছুটির আবেদনপত্র।',
    badge: 'চাকরিজীবী',
    iconName: 'Plane',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'বহিঃবাংলাদেশ ছুটি মঞ্জুরের জন্য আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'exBangladeshPurpose',
        label: 'বিদেশ গমনের উদ্দেশ্য',
        type: 'select',
        options: [
          'পবিত্র হজ্ব ও ওমরাহ পালন',
          'উন্নত চিকিৎসা গ্রহণ',
          'আত্মীয়ের সাথে সাক্ষাৎ',
          'দর্শনীয় স্থান পরিদর্শন',
        ],
        defaultValue: 'পবিত্র হজ্ব ও ওমরাহ পালন',
        required: true,
      },
      {
        key: 'destinationCountry',
        label: 'ভ্রমণকারী দেশের নাম',
        type: 'text',
        placeholder: 'যেমন: সৌদি আরব / ভারত',
        defaultValue: 'সৌদি আরব',
        required: true,
      },
      {
        key: 'attachments',
        label: 'সংযুক্তি',
        type: 'text',
        defaultValue: 'পাসপোর্টের সত্যায়িত কপি ও প্রয়োজনীয় ট্রাভেল সংক্রান্ত তথ্যাদি',
      },
    ],
  },
  {
    id: 'earned_leave',
    title: '৮. সাধারণ অর্জিত ছুটি বা বৈবাহিক ছুটির আবেদন',
    shortTitle: 'অর্জিত / বৈবাহিক ছুটি',
    category: 'employee',
    description: 'বিবাহ বন্ধনে আবদ্ধ হওয়া বা পারিবারিক কারণে অর্জিত ছুটির অফিশিয়াল আবেদনপত্র।',
    badge: 'চাকরিজীবী',
    iconName: 'Award',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'যথাযথ কর্তৃপক্ষ',
    defaultSubject: 'অর্জিত ছুটি/বৈবাহিক ছুটির জন্য আবেদন।',
    recipientOptions: TEACHER_RECIPIENTS,
    designationOptions: TEACHER_DESIGNATIONS,
    throughOptions: TEACHER_THROUGH_OPTIONS,
    fields: [
      {
        key: 'weddingDate',
        label: 'বিবাহের তারিখ',
        type: 'text',
        placeholder: 'যেমন: ২০ নভেম্বর ২০২৬',
        defaultValue: '২০ নভেম্বর ২০২৬',
        required: true,
      },
      {
        key: 'attachments',
        label: 'সংযুক্তি',
        type: 'text',
        defaultValue: 'বিবাহের আমন্ত্রণপত্র / সংশ্লিষ্ট প্রাসঙ্গিক প্রমাণপত্র',
      },
    ],
  },

  // --- PART 2: Student Templates ---
  {
    id: 'student_absence_leave',
    title: 'অনুপস্থিতির জন্য ছুটির আবেদন',
    shortTitle: 'অনুপস্থিতির ছুটি',
    category: 'student',
    description: 'অসুস্থতা বা পারিবারিক সমস্যার কারণে অতীতে ক্লাসে অনুপস্থিত থাকার পর জরিমানা ছাড়া ছুটির মঞ্জুরি আবেদন।',
    badge: 'শিক্ষার্থী',
    iconName: 'GraduationCap',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'শ্রেণি শিক্ষকের মাধ্যমে',
    defaultSubject: 'অনুপস্থিতির জন্য ছুটি মঞ্জুরের আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['শ্রেণি শিক্ষকের মাধ্যমে', 'সরাসরি'],
    fields: [
      { key: 'studentClass', label: 'শ্রেণি', type: 'select', options: STUDENT_CLASSES, defaultValue: '১০ম শ্রেণি (এসএসসি পরীক্ষার্থী)', required: true },
      { key: 'rollNumber', label: 'রোল নম্বর', type: 'text', placeholder: 'যেমন: ১২', defaultValue: '০৫', required: true },
      { key: 'leaveReason', label: 'অনুপস্থিতির কারণ', type: 'select', options: ['হঠাৎ তীব্র জ্বরে আক্রান্ত হওয়ার কারণে', 'পারিবারিক জরুরি সমস্যার কারণে', 'চিকিৎসকের পরামর্শে বিশ্রামে থাকার কারণে'], defaultValue: 'হঠাৎ তীব্র জ্বরে আক্রান্ত হওয়ার কারণে', required: true },
    ],
  },
  {
    id: 'student_advance_leave',
    title: 'অগ্রিম ছুটির আবেদন',
    shortTitle: 'অগ্রিম ছুটি',
    category: 'student',
    description: 'ভবিষ্যতে কোনো নির্দিষ্ট দিনে জরুরি পারিবারিক কাজ বা অনুষ্ঠানে উপস্থিত থাকার জন্য আগে থেকেই ছুটির আবেদন।',
    badge: 'শিক্ষার্থী',
    iconName: 'CalendarCheck',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'শ্রেণি শিক্ষকের মাধ্যমে',
    defaultSubject: 'অগ্রিম ছুটির জন্য আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['শ্রেণি শিক্ষকের মাধ্যমে', 'সরাসরি'],
    fields: [
      { key: 'studentClass', label: 'শ্রেণি', type: 'select', options: STUDENT_CLASSES, defaultValue: '৮ম শ্রেণি', required: true },
      { key: 'rollNumber', label: 'রোল নম্বর', type: 'text', placeholder: 'যেমন: ১৮', defaultValue: '০২', required: true },
      { key: 'leaveReason', label: 'অগ্রিম ছুটির কারণ', type: 'select', options: ['বড় বোনের শুভ বিবাহ অনুষ্ঠানে যোগদানের কারণে', 'পারিবারিক জরুরি কাজে গ্রামের বাড়ি যাওয়ার কারণে', 'চিকিৎসার জন্য বিশেষজ্ঞ ডাক্তারের অ্যাপয়েন্টমেন্ট থাকায়'], defaultValue: 'বড় বোনের শুভ বিবাহ অনুষ্ঠানে যোগদানের কারণে', required: true },
    ],
  },
  {
    id: 'student_fee_waiver',
    title: 'বিনা বেতনে অধ্যয়নের আবেদন (Fee Waiver)',
    shortTitle: 'বিনা বেতনে অধ্যয়ন',
    category: 'student',
    description: 'দরিদ্রতা বা অর্থনৈতিক অসচ্ছলতার কারণে মাসিক বেতন ও টিউশন ফি সম্পূর্ণ বা আংশিক মওকুফের আবেদনপত্র।',
    badge: 'শিক্ষার্থী',
    iconName: 'BookOpen',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'শ্রেণি শিক্ষকের মাধ্যমে',
    defaultSubject: 'বিনা বেতনে অধ্যয়নের সুযোগ প্রদানের জন্য আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['শ্রেণি শিক্ষকের মাধ্যমে', 'সরাসরি'],
    fields: [
      { key: 'studentClass', label: 'শ্রেণি', type: 'select', options: STUDENT_CLASSES, defaultValue: '৯ম শ্রেণি', required: true },
      { key: 'rollNumber', label: 'রোল নম্বর', type: 'text', placeholder: 'যেমন: ০৭', defaultValue: '০৩', required: true },
      { key: 'fatherOrGuardianName', label: 'পিতা/অভিভাবকের নাম', type: 'text', placeholder: 'যেমন: মোঃ আব্দুল জলিল', required: true },
      { key: 'familyMonthlyIncome', label: 'পিতার পেশা ও পরিবারের অবস্থা', type: 'text', defaultValue: 'পিতা একজন স্বল্প আয়ের দিনমজুর, পরিবারে সদস্য সংখ্যা ৬ জন', required: true },
      { key: 'gpaOrLastExamResult', label: 'পূর্ববর্তী পরীক্ষার ফলাফল', type: 'text', defaultValue: 'পূর্ববর্তী বার্ষিক পরীক্ষায় জিপিএ ৫.০০ (১ম স্থান)', required: true },
    ],
  },
  {
    id: 'student_poor_fund',
    title: 'দরিদ্র তহবিল থেকে সাহায্যের আবেদন (Poor Fund)',
    shortTitle: 'দরিদ্র তহবিল সাহায্য',
    category: 'student',
    description: 'বই-খাতা কেনা, পরীক্ষার ফরম ফিলাপ বা অন্যান্য ফি পরিশোধের জন্য বিদ্যালয়ের দরিদ্র কল্যাণ তহবিল থেকে আর্থিক অনুদানের আবেদন।',
    badge: 'শিক্ষার্থী',
    iconName: 'Gift',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'শ্রেণি শিক্ষকের মাধ্যমে',
    defaultSubject: 'বিদ্যালয়ের দরিদ্র তহবিল থেকে এককালীন আর্থিক সাহায্যের আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['শ্রেণি শিক্ষকের মাধ্যমে', 'সরাসরি'],
    fields: [
      { key: 'studentClass', label: 'শ্রেণি', type: 'select', options: STUDENT_CLASSES, defaultValue: '১০ম শ্রেণি (এসএসসি পরীক্ষার্থী)', required: true },
      { key: 'rollNumber', label: 'রোল নম্বর', type: 'text', defaultValue: '০৮', required: true },
      { key: 'fatherOrGuardianName', label: 'পিতা/অভিভাবকের নাম', type: 'text', placeholder: 'যেমন: মোঃ আব্দুল জলিল', required: true },
      { key: 'leaveReason', label: 'সাহায্যের প্রয়োজনীয়তা', type: 'select', options: ['এসএসসি পরীক্ষার ফরম ফিলাপের ফি পরিশোধের জন্য', 'নতুন শিক্ষাবর্ষের পাঠ্যবই ও সহায়ক উপকরণ ক্রয়ের জন্য', 'ত্রৈমাসিক পরীক্ষার ফি প্রদানের জন্য'], defaultValue: 'এসএসসি পরীক্ষার ফরম ফিলাপের ফি পরিশোধের জন্য', required: true },
    ],
  },
  {
    id: 'student_tc',
    title: 'ছাড়পত্র (TC) পাওয়ার আবেদন (Transfer Certificate)',
    shortTitle: 'ছাড়পত্র (TC)',
    category: 'student',
    description: 'পিতার কর্মস্থল পরিবর্তন, পরিবারের স্থানান্তর বা দূরত্বের কারণে ছাড়পত্র (টিসি) প্রাপ্তির আবেদনপত্র।',
    badge: 'শিক্ষার্থী',
    iconName: 'ArrowRightLeft',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'শ্রেণি শিক্ষকের মাধ্যমে',
    defaultSubject: 'বিদ্যালয় হতে ছাড়পত্র (TC) পাওয়ার জন্য আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['শ্রেণি শিক্ষকের মাধ্যমে', 'সরাসরি'],
    fields: [
      { key: 'studentClass', label: 'শ্রেণি', type: 'select', options: STUDENT_CLASSES, defaultValue: '৭ম শ্রেণি', required: true },
      { key: 'rollNumber', label: 'রোল নম্বর', type: 'text', defaultValue: '১১', required: true },
      { key: 'tcReason', label: 'ছাড়পত্র গ্রহণের কারণ', type: 'select', options: ['পিতার সরকারি চাকরিজনিত কারণে নতুন কর্মস্থলে বদলি', 'পারিবারিক কারণে অন্য জেলায় স্থায়ীভাবে স্থানান্তর', 'বাসা পরিবর্তনজনিত কারণে দূরত্বের সমস্যা'], defaultValue: 'পিতার সরকারি চাকরিজনিত কারণে নতুন কর্মস্থলে বদলি', required: true },
      { key: 'newSchoolName', label: 'নতুন বিদ্যালয়ের নাম ও এলাকা', type: 'text', placeholder: 'যেমন: সিলেট সরকারি পাইলট উচ্চ বিদ্যালয়', defaultValue: 'সিলেট সরকারি উচ্চ বিদ্যালয়' },
    ],
  },
  {
    id: 'student_testimonial',
    title: 'প্রশংসাপত্র (Testimonial) পাওয়ার আবেদন',
    shortTitle: 'প্রশংসাপত্র (Testimonial)',
    category: 'student',
    description: 'উত্তীর্ণ হওয়ার পর উচ্চশিক্ষায় ভর্তি বা চাকরির প্রয়োজনে প্রতিষ্ঠান প্রধানের নিকট থেকে চারিত্রিক ও শিক্ষাগত প্রশংসাপত্রের আবেদন।',
    badge: 'শিক্ষার্থী',
    iconName: 'BadgeCheck',
    defaultRecipient: 'অধ্যক্ষ',
    defaultThrough: 'সরাসরি',
    defaultSubject: 'চারিত্রিক ও শিক্ষাগত প্রশংসাপত্র প্রদানের জন্য আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['সরাসরি', 'বিভাগীয় প্রধানের মাধ্যমে'],
    fields: [
      { key: 'studentClass', label: 'উত্তীর্ণ শ্রেণি/পরীক্ষা', type: 'select', options: ['এসএসসি পরীক্ষা', 'এইচএসসি পরীক্ষা', 'ডিগ্রি (পাস) পরীক্ষা', 'স্নাতক (সম্মান) পরীক্ষা'], defaultValue: 'এসএসসি পরীক্ষা', required: true },
      { key: 'rollNumber', label: 'বোর্ড রোল ও রেজিস্ট্রেশন নম্বর', type: 'text', placeholder: 'যেমন: ২১৫৬৩৪ (রেজি: ১৮১২৩৪৫৬৭৮)', defaultValue: '২১৫৬৩৪ (রেজি: ১৮১২৩৪৫৬৭৮)', required: true },
      { key: 'passingYear', label: 'পাসের বছর ও জিপিএ', type: 'text', placeholder: 'যেমন: ২০২৫, জিপিএ: ৫.০০', defaultValue: '২০২৫, জিপিএ: ৫.০০', required: true },
    ],
  },
  {
    id: 'student_readmission',
    title: 'পুনঃভর্তির আবেদন (Re-admission)',
    shortTitle: 'পুনঃভর্তি',
    category: 'student',
    description: 'দীর্ঘ অসুস্থতা বা বিলম্বের কারণে নাম কর্তন হয়ে থাকলে পুনরায় ক্লাসে ভর্তির আনুষ্ঠানিক আবেদনপত্র।',
    badge: 'শিক্ষার্থী',
    iconName: 'UserCheck',
    defaultRecipient: 'প্রধান শিক্ষক',
    defaultThrough: 'শ্রেণি শিক্ষকের মাধ্যমে',
    defaultSubject: 'বিদ্যালয়ে পুনরায় ভর্তির অনুমতি প্রার্থনার আবেদন।',
    recipientOptions: STUDENT_RECIPIENTS,
    designationOptions: ['শিক্ষার্থী'],
    throughOptions: ['শ্রেণি শিক্ষকের মাধ্যমে', 'সরাসরি'],
    fields: [
      { key: 'studentClass', label: 'শ্রেণি', type: 'select', options: STUDENT_CLASSES, defaultValue: '৬ষ্ঠ শ্রেণি', required: true },
      { key: 'rollNumber', label: 'পূর্বের রোল নম্বর', type: 'text', defaultValue: '০৯', required: true },
      { key: 'leaveReason', label: 'নাম কর্তন বা অনুপস্থিতির কারণ', type: 'text', defaultValue: 'দীর্ঘদিন জন্ডিসে আক্রান্ত হয়ে চিকিৎসাধীন থাকার কারণে', required: true },
    ],
  },
];

/**
 * A ready-to-read demo application: every template field carries its own official
 * wording, with sample data derived from government primary schools and students.
 */
export function getSampleFormData(template: FormatTemplate): ApplicationFormData {
  const isEmployee = template.category === 'employee';
  const today = getTodayISODate();

  const sample: ApplicationFormData = {
    ...getDefaultFormData(template),
    date: today,
    applicantName: isEmployee ? 'মোছাঃ ফাতেমা আক্তার' : 'তাহমিদ আহমেদ',
    designation: isEmployee ? 'সহকারী শিক্ষক' : 'শিক্ষার্থী', // সহকারী শিক্ষক ডিফল্ট
    organization: isEmployee
      ? template.defaultRecipient.startsWith('জেলা')
        ? 'জেলা প্রাথমিক শিক্ষা অফিস'
        : template.defaultRecipient.includes('শিক্ষা অফিসার')
          ? 'উপজেলা শিক্ষা অফিস'
          : 'কালাইউরা সরকারি প্রাথমিক বিদ্যালয়'
      : 'মডেল উচ্চ বিদ্যালয়',
    workplace: isEmployee
      ? 'কালাইউরা সরকারি প্রাথমিক বিদ্যালয়'
      : 'বিয়ানীবাজার সরকারি পাইলট মডেল উচ্চ বিদ্যালয়',
    upazilaOrArea: 'বিয়ানীবাজার',
    district: 'সিলেট',
    mobile: '০১৭১১-XXXXXX',
    fatherOrGuardianName: 'মোঃ আব্দুল জলিল',
    leaveStartDate: today,
    leaveEndDate: today,
    totalDays: '৩ (তিন) দিন',
    previousLeaveOrderNo: 'উশিঅ/বিয়ানী/২০২৬/১১৮, তারিখ: ১৫-০৪-২০২৬',
    joiningDate: today,
    joiningType: 'চিকিৎসা ছুটি',
    maternityStage: 'প্রথম',
    expectedDeliveryDate: '১৫ নভেম্বর ২০২৬',
    prlRetirementDate: '১৪ জানুয়ারি ২০২৭',
    passportPurpose: 'ব্যক্তিগত ও ধর্মীয় প্রয়োজনে পবিত্র ওমরাহ পালনের উদ্দেশ্যে',
    destinationCountry: 'সৌদি আরব',
    exBangladeshPurpose: 'পবিত্র হজ্ব ও ওমরাহ পালন',
    weddingDate: '২০ নভেম্বর ২০২৬',
  };

  for (const field of template.fields) {
    if (!field.defaultValue) continue;
    if (field.key === 'attachments') {
      sample.attachments = field.defaultValue;
      continue;
    }
    (sample as unknown as Record<string, string>)[field.key] = field.defaultValue;
  }

  return sample;
}

/**
 * Empty starting state.
 */
export function getDefaultFormData(template: FormatTemplate): ApplicationFormData {
  const isEmployee = template.category === 'employee';
  const today = getTodayISODate();

  const base: ApplicationFormData = {
    date: today,
    recipient: template.defaultRecipient,
    customRecipient: '',
    organization: '',
    through: template.defaultThrough || (isEmployee ? 'যথাযথ কর্তৃপক্ষ' : 'শ্রেণি শিক্ষকের মাধ্যমে'),
    subject: template.defaultSubject,
    salutation: 'মহোদয়,',
    applicantName: '',
    designation: isEmployee ? 'সহকারী শিক্ষক' : 'শিক্ষার্থী',
    customDesignation: '',
    workplace: '',
    upazilaOrArea: '',
    district: '',
    mobile: '',

    leaveStartDate: '',
    leaveEndDate: '',
    totalDays: '',
    leaveReason: '',

    joiningType: template.joiningTypeOptions ? template.joiningTypeOptions[0] : 'চিকিৎসা ছুটি',
    joiningTimeSession: 'পূর্বাহ্ণে',
    previousLeaveOrderNo: '',
    joiningDate: '',

    maternityStage: 'প্রথম',
    expectedDeliveryDate: '',
    prlRetirementDate: '',
    passportPurpose: '',
    destinationCountry: '',
    exBangladeshPurpose: '',
    weddingDate: '',

    studentClass: '',
    rollNumber: '',
    fatherOrGuardianName: '',
    familyMonthlyIncome: '',
    gpaOrLastExamResult: '',
    tcReason: '',
    newSchoolName: '',
    passingYear: '',

    attachments: '',
    customBodyText: '',
  };

  for (const field of template.fields) {
    if (field.type !== 'select' || !field.defaultValue) continue;
    (base as unknown as Record<string, string>)[field.key] = field.defaultValue;
  }

  return base;
}
