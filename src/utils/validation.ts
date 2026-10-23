import { FormatTemplate } from '../types';

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
