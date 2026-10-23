import { SavedApplication, ApplicationFormData, SubCategoryType } from '../types';

const STORAGE_KEY = 'bangla_app_saved_applications_v1';

export interface SaveResult {
  ok: boolean;
  reason?: 'saved' | 'quota' | 'unavailable';
}

export function getSavedApplications(): SavedApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedApplication[];
  } catch (e) {
    console.error('Failed to read from localStorage', e);
    return [];
  }
}

export function saveApplicationLocally(item: {
  formatId: SubCategoryType;
  formatTitle: string;
  category: 'employee' | 'student';
  applicantName: string;
  workplace: string;
  subject: string;
  data: ApplicationFormData;
}): SaveResult {
  try {
    const existing = getSavedApplications();
    const newEntry: SavedApplication = {
      id: Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      formatId: item.formatId,
      formatTitle: item.formatTitle,
      category: item.category,
      applicantName: item.applicantName,
      workplace: item.workplace,
      subject: item.subject,
      data: item.data,
      savedAt: new Date().toISOString(),
    };

    let updated = [newEntry, ...existing];
    let reason: 'saved' | 'quota' = 'saved';

    // Keep up to 60 applications
    if (updated.length > 60) {
      updated = updated.slice(0, 60);
      reason = 'quota';
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, reason };
  } catch (e) {
    console.error('Failed to save application', e);
    return { ok: false, reason: 'unavailable' };
  }
}

export function deleteSavedApplication(id: string): SavedApplication[] {
  try {
    const existing = getSavedApplications();
    const filtered = existing.filter((app) => app.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to delete application', e);
    return getSavedApplications();
  }
}
