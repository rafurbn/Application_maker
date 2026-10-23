import { describe, expect, it } from 'vitest';
import { ALL_TEMPLATES, getDefaultFormData } from '../../data/templates';
import { collectDocumentIssues, hasPlaceholder, showsLeaveDateRange } from '../validation';

const casualLeave = ALL_TEMPLATES.find((t) => t.id === 'casual_leave')!;
const studentTc = ALL_TEMPLATES.find((t) => t.id === 'student_tc')!;

describe('showsLeaveDateRange', () => {
  it('is true for leave formats and false for a TC application', () => {
    expect(showsLeaveDateRange(casualLeave)).toBe(true);
    expect(showsLeaveDateRange(studentTc)).toBe(false);
  });
});

describe('hasPlaceholder', () => {
  it('detects square-bracket hints and XXXX runs', () => {
    expect(hasPlaceholder('[আপনার নাম]')).toBe(true);
    expect(hasPlaceholder('XXXX')).toBe(true);
  });

  it('accepts real values', () => {
    expect(hasPlaceholder('মোঃ রফিকুল ইসলাম')).toBe(false);
    expect(hasPlaceholder('সহকারী শিক্ষক')).toBe(false);
    expect(hasPlaceholder(undefined)).toBe(false);
  });
});

describe('collectDocumentIssues', () => {
  it('flags an untouched form as missing its core fields', () => {
    const issues = collectDocumentIssues(casualLeave, getDefaultFormData(casualLeave), '');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i) => i.kind === 'missing')).toBe(true);
    expect(issues.map((i) => i.label)).toContain('আবেদনকারীর নাম');
  });

  it('flags a left-over placeholder in a filled field', () => {
    const data = { ...getDefaultFormData(casualLeave), applicantName: '[আপনার নাম]' };
    const issues = collectDocumentIssues(casualLeave, data, 'সবিনয় নিবেদন এই যে...');
    const nameIssue = issues.find((i) => i.label === 'আবেদনকারীর নাম');
    expect(nameIssue?.kind).toBe('placeholder');
  });

  it('reports the same label only once even if two rules catch it', () => {
    const data = { ...getDefaultFormData(casualLeave), applicantName: '[আপনার নাম]' };
    const issues = collectDocumentIssues(casualLeave, data, '');
    expect(issues.filter((i) => i.label === 'আবেদনকারীর নাম')).toHaveLength(1);
  });

  it('flags placeholder text left in the body', () => {
    const data = { ...getDefaultFormData(casualLeave), applicantName: 'রফিকুল ইসলাম' };
    const issues = collectDocumentIssues(casualLeave, data, 'আমি XXXX দিন ছুটি পেতে চাই');
    expect(issues.some((i) => i.kind === 'placeholder')).toBe(true);
  });

  it('asks students for their roll number, not for a teacher mobile', () => {
    const labels = collectDocumentIssues(studentTc, getDefaultFormData(studentTc), '').map((i) => i.label);
    expect(labels).toContain('রোল নম্বর');
    expect(labels).not.toContain('মোবাইল নম্বর');
  });

  it('asks teachers for designation and upazila', () => {
    const labels = collectDocumentIssues(casualLeave, getDefaultFormData(casualLeave), '').map((i) => i.label);
    expect(labels).toContain('উপজেলা / থানা');
    expect(labels).not.toContain('শ্রেণি');
  });
});
