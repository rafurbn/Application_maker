import React from 'react';
import { OfficialApplication } from '../types';
import { Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { DesignationSelector } from './DesignationSelector';

interface ApplicationEditorProps {
  application: OfficialApplication;
  onChange: (updated: OfficialApplication) => void;
}

export const ApplicationEditor: React.FC<ApplicationEditorProps> = ({
  application,
  onChange,
}) => {
  const updateField = <K extends keyof OfficialApplication>(field: K, value: OfficialApplication[K]) => {
    onChange({
      ...application,
      [field]: value,
    });
  };

  const updateRecipient = (key: keyof OfficialApplication['recipient'], value: string) => {
    onChange({
      ...application,
      recipient: {
        ...application.recipient,
        [key]: value,
      },
    });
  };

  const updateApplicant = (key: keyof OfficialApplication['applicant'], value: string) => {
    onChange({
      ...application,
      applicant: {
        ...application.applicant,
        [key]: value,
      },
    });
  };

  const updateParagraph = (index: number, text: string) => {
    const updated = [...application.bodyParagraphs];
    updated[index] = text;
    updateField('bodyParagraphs', updated);
  };

  const addParagraph = () => {
    updateField('bodyParagraphs', [...application.bodyParagraphs, '']);
  };

  const removeParagraph = (index: number) => {
    const updated = application.bodyParagraphs.filter((_, i) => i !== index);
    updateField('bodyParagraphs', updated);
  };

  const updateAttachment = (index: number, text: string) => {
    const updated = [...(application.attachments || [])];
    updated[index] = text;
    updateField('attachments', updated);
  };

  const addAttachment = () => {
    updateField('attachments', [...(application.attachments || []), '']);
  };

  const removeAttachment = (index: number) => {
    const updated = (application.attachments || []).filter((_, i) => i !== index);
    updateField('attachments', updated);
  };

  const updateCc = (index: number, text: string) => {
    const updated = [...(application.ccList || [])];
    updated[index] = text;
    updateField('ccList', updated);
  };

  const addCc = () => {
    updateField('ccList', [...(application.ccList || []), '']);
  };

  const removeCc = (index: number) => {
    const updated = (application.ccList || []).filter((_, i) => i !== index);
    updateField('ccList', updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-700" />
          <div>
            <h2 className="text-base font-bold text-slate-800">আবেদনপত্র সম্পাদনা (Editor)</h2>
            <p className="text-[11px] text-slate-500">পিডিএফ টেমপ্লেট অনুযায়ী প্রতিটি ঘর পরিবর্তন করুন</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/assets/aistudio/application_18e2efad.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-700 hover:underline font-medium bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
          >
            মূল ৮-পৃষ্ঠা PDF দেখুন
          </a>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Left-Aligned & Justified সক্রিয়</span>
          </div>
        </div>
      </div>

      {/* Date & Ref */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ</label>
          <input
            type="text"
            value={application.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="যেমন: ২৫ অক্টোবর ২০২৬"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">স্মারক নং (ঐচ্ছিক)</label>
          <input
            type="text"
            value={application.refNo || ''}
            onChange={(e) => updateField('refNo', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="যেমন: উশিঅ/বিয়ানী/২০২৬/৪৫২"
          />
        </div>
      </div>

      {/* Recipient Details */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">প্রাপক / বরাবর (Recipient)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">পদবী</label>
            <input
              type="text"
              value={application.recipient.designation}
              onChange={(e) => updateRecipient('designation', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="উপজেলা শিক্ষা অফিসার"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">দপ্তর / প্রতিষ্ঠান</label>
            <input
              type="text"
              value={application.recipient.office}
              onChange={(e) => updateRecipient('office', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="উপজেলা শিক্ষা অফিস"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">ঠিকানা / এলাকা</label>
            <input
              type="text"
              value={application.recipient.address}
              onChange={(e) => updateRecipient('address', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="বিয়ানীবাজার, সিলেট"
            />
          </div>
        </div>
      </div>

      {/* Through & Subject */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">মাধ্যম (Through - ঐচ্ছিক)</label>
          <input
            type="text"
            value={application.through || ''}
            onChange={(e) => updateField('through', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="যেমন: যথাযথ কর্তৃপক্ষের মাধ্যমে (প্রধান শিক্ষক...)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">বিষয় (Subject)</label>
          <input
            type="text"
            value={application.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="আবেদনের বিষয়..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">সম্ভাষণ (Salutation)</label>
          <input
            type="text"
            value={application.salutation}
            onChange={(e) => updateField('salutation', e.target.value)}
            className="w-48 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="জনাব / মহোদয়,"
          />
        </div>
      </div>

      {/* Body Paragraphs - Justified in preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-700">আবেদনের মূল বক্তব্য (Body Paragraphs)</label>
            <span className="text-[11px] text-blue-600 font-medium">প্রিন্ট প্রিভিউতে এই অংশটি সম্পূর্ণ জাস্টিফাইড (উভয় প্রান্ত সমান) হবে।</span>
          </div>
          <button
            type="button"
            onClick={addParagraph}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            প্যারাগ্রাফ যোগ করুন
          </button>
        </div>

        {application.bodyParagraphs.map((paragraph, index) => (
          <div key={index} className="flex gap-2 items-start">
            <span className="text-xs font-mono text-slate-400 mt-2">{index + 1}.</span>
            <textarea
              rows={3}
              value={paragraph}
              onChange={(e) => updateParagraph(index, e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              placeholder={`অনুচ্ছেদ ${index + 1} লিখুন...`}
            />
            {application.bodyParagraphs.length > 1 && (
              <button
                type="button"
                onClick={() => removeParagraph(index)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            বিনীত প্রার্থনা অনুচ্ছেদ (Prayer Text)
          </label>
          <textarea
            rows={2}
            value={application.prayerText}
            onChange={(e) => updateField('prayerText', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            placeholder="অতএব, বিনীত প্রার্থনা এই যে..."
          />
        </div>
      </div>

      {/* Applicant Information */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">আবেদনকারী ও স্বাক্ষরকারী তথ্য</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">উপসংহার সম্ভাষণ</label>
            <input
              type="text"
              value={application.closing}
              onChange={(e) => updateField('closing', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="বিনীত নিবেদক,"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">আবেদনকারীর নাম</label>
            <input
              type="text"
              value={application.applicant.name}
              onChange={(e) => updateApplicant('name', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              placeholder="নাম লিখুন"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              আবেদনকারীর পদবী (Designation)
            </label>
            <DesignationSelector
              value={application.applicant.designation}
              onChange={(val) => updateApplicant('designation', val)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">বিদ্যালয় / প্রতিষ্ঠান ও কর্মস্থল</label>
            <input
              type="text"
              value={application.applicant.institute}
              onChange={(e) => updateApplicant('institute', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="বিদ্যালয়ের নাম, উপজেলা, জেলা"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
            <input
              type="text"
              value={application.applicant.phone || ''}
              onChange={(e) => updateApplicant('phone', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="০১৭১১-XXXXXX"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">ইমেইল (ঐচ্ছিক)</label>
            <input
              type="text"
              value={application.applicant.email || ''}
              onChange={(e) => updateApplicant('email', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="applicant@gmail.com"
            />
          </div>
        </div>
      </div>

      {/* Attachments & CC List Accordions / Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attachments */}
        <div className="p-3 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">সংযুক্তি (Attachments)</span>
            <button
              type="button"
              onClick={addAttachment}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              + সংযুক্তি যোগ
            </button>
          </div>
          <div className="space-y-1.5">
            {(application.attachments || []).map((att, idx) => (
              <div key={idx} className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={att}
                  onChange={(e) => updateAttachment(idx, e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded"
                  placeholder="যেমন: ১. ছুটির ফরম..."
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(!application.attachments || application.attachments.length === 0) && (
              <p className="text-xs text-slate-400 italic">কোনো সংযুক্তি নেই</p>
            )}
          </div>
        </div>

        {/* CC List */}
        <div className="p-3 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">অনুলিপি (CC List)</span>
            <button
              type="button"
              onClick={addCc}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              + অনুলিপি যোগ
            </button>
          </div>
          <div className="space-y-1.5">
            {(application.ccList || []).map((cc, idx) => (
              <div key={idx} className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => updateCc(idx, e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded"
                  placeholder="যেমন: ১. প্রধান শিক্ষক..."
                />
                <button
                  type="button"
                  onClick={() => removeCc(idx)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(!application.ccList || application.ccList.length === 0) && (
              <p className="text-xs text-slate-400 italic">কোনো অনুলিপি নেই</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
