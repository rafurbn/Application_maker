import { FormatTemplate, ApplicationFormData } from '../types';

export function showsLeaveDateRange(template: FormatTemplate): boolean {
  const dateRangeTemplates = [
    'casual_leave',
    'medical_leave',
    'maternity_leave',
    'joining_letter',
    'prl_pension',
    'ex_bangladesh',
    'earned_leave',
    'student_absence_leave',
    'student_advance_leave',
  ];
  return dateRangeTemplates.includes(template.id);
}

/**
 * Anything the generator could not fill in still shows up in the printed sheet
 * as a square-bracket hint ( [নাম] ) or an XXXX run — those must never leave the
 * device inside a signed government application, so they get flagged.
 */
const PLACEHOLDER_RE = /\[[^\]\n]{2,}\]|X{4,}/;

export function hasPlaceholder(value?: string): boolean {
  return Boolean(value && PLACEHOLDER_RE.test(value));
}

export interface DocumentIssue {
  label: string;
  kind: 'missing' | 'placeholder';
}

const CORE_LABELS: Record<string, string> = {
  applicantName: 'আবেদনকারীর নাম',
  designation: 'পদবী',
  workplace: 'বিদ্যালয় / কর্মস্থলের নাম',
  district: 'জেলা',
  upazilaOrArea: 'উপজেলা / থানা',
  mobile: 'মোবাইল নম্বর',
  organization: 'কার্যালয় / অফিস',
  subject: 'বিষয়',
  studentClass: 'শ্রেণি',
  rollNumber: 'রোল নম্বর',
  fatherOrGuardianName: 'পিতা / অভিভাবকের নাম',
  totalDays: 'মোট দিন',
  leaveStartDate: 'ছুটি শুরুর তারিখ',
  leaveEndDate: 'ছুটি শেষের তারিখ',
};

/** Required-but-empty fields, and fields whose value is still a placeholder. */
export function collectDocumentIssues(
  template: FormatTemplate,
  formData: ApplicationFormData,
  bodyText: string,
): DocumentIssue[] {
  const issues: DocumentIssue[] = [];

  const keys: string[] = [
    'applicantName',
    'designation',
    'workplace',
    'district',
    'subject',
  ];
  if (template.category === 'student') keys.push('studentClass', 'rollNumber');
  else keys.push('mobile', 'upazilaOrArea');

  for (const key of keys) {
    const value = (formData as Record<string, unknown>)[key];
    const text = typeof value === 'string' ? value : '';
    const label = CORE_LABELS[key] || key;
    if (!text.trim()) issues.push({ label, kind: 'missing' });
    else if (hasPlaceholder(text)) issues.push({ label, kind: 'placeholder' });
  }

  for (const field of template.fields) {
    if (!field.required) continue;
    const value = (formData as unknown as Record<string, unknown>)[field.key];
    const text = typeof value === 'string' ? value : '';
    if (!text.trim()) issues.push({ label: field.label, kind: 'missing' });
    else if (hasPlaceholder(text)) issues.push({ label: field.label, kind: 'placeholder' });
  }

  if (hasPlaceholder(bodyText)) issues.push({ label: 'মূল বক্তব্য', kind: 'placeholder' });

  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.kind}:${issue.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
