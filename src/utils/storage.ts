import { SummaryItem, ReadingPreferences } from '../types';

const STORAGE_KEY_SUMMARIES = 'sintaxis_summaries_v1';
const STORAGE_KEY_THEME = 'sintaxis_theme_mode';
const STORAGE_KEY_READING_PREFS = 'sintaxis_reading_prefs';

export function loadSummaries(): SummaryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUMMARIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading summaries from storage:', e);
    return [];
  }
}

export function saveSummaries(summaries: SummaryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUMMARIES, JSON.stringify(summaries));
  } catch (e) {
    console.error('Error saving summaries to storage:', e);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to 'light' as requested: "que venga por default en modo dia pero que tenga el modo oscuro"
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (e) {
    console.error('Error saving theme to storage:', e);
  }
}

export function loadReadingPrefs(): ReadingPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READING_PREFS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    font: 'sans',
    fontSize: 16,
    lineHeight: 'relaxed',
    focusMode: false,
  };
}

export function saveReadingPrefs(prefs: ReadingPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY_READING_PREFS, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving reading prefs:', e);
  }
}
