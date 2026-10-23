import { describe, expect, it } from 'vitest';
import { parseApplicationText } from '../TextImportPanel';

const oldApplication = [
  'বরাবর',
  'উপজেলা শিক্ষা অফিসার',
  'গোপালগঞ্জ উপজেলা, ঢাকা।',
  'বিষয়: ৪ (চার) দিনের নৈমিত্তিক ছুটি মঞ্জুর প্রসঙ্গে।',
  'সবিনয় নিবেদন এই যে, আমি উক্ত বিদ্যালয়ে সহকারী শিক্ষক হিসেবে কর্মরত আছি।',
  'আগামী ০১/১১/২০২ তারিখ হতে ০৪/১১/২০২৬ তারিখ পর্যন্ত আমার কাজের অবসর ছুটি প্রয়োজন।',
  'অতএব, মহোদয় সমীপে বিনীত প্রার্থনা এই যে, উল্লিখিত সময়ের ছুটি মঞ্জুর করিয়া বাধিত করিবেন।',
  'তারিখ: ২২/১০/২০২৬',
  'নিবেদক',
  'মোঃ রফিকুল ইসলাম',
  'সহকারী শিক্ষক',
].join('\n');

describe('parseApplicationText', () => {
  it('pulls the subject line out of a pasted application', () => {
    expect(parseApplicationText(oldApplication).subject).toBe(
      '৪ (চার) দিনের নৈমিত্তিক ছুটি মঞ্জুর প্রসঙ্গে।',
    );
  });

  it('keeps the body and the prayer, drops recipient/date/signature blocks', () => {
    const { body } = parseApplicationText(oldApplication);
    expect(body).toContain('সহকারী শিক্ষক হিসেবে কর্মরত আছি');
    expect(body).toContain('অতএব, মহোদয় সমীপে বিনীত প্রার্থনা');
    expect(body).not.toContain('উপজেলা শিক্ষা অফিসার');
    expect(body).not.toContain('তারিখ:');
    expect(body).not.toContain('বরাবর');
  });

  it('returns an empty body for junk so the UI can warn instead of filling nonsense', () => {
    const result = parseApplicationText('হ্যালো\nটিস্ট');
    expect(result.body).toBe('');
    expect(result.subject).toBe('');
  });
});
