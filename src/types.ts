export type SummaryType = 
  | 'executive' 
  | 'bullets' 
  | 'study' 
  | 'eli5' 
  | 'deep' 
  | 'qa' 
  | 'actionable'
  | 'comparative';

export type SummaryLength = 'short' | 'medium' | 'detailed';

export type OutputLanguage = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'it' | 'auto';

export type ToneType = 'neutral' | 'academic' | 'casual' | 'executive';

export interface SummaryOptions {
  summaryType: SummaryType;
  length: SummaryLength;
  language: OutputLanguage;
  tone: ToneType;
  customInstructions: string;
  includeKeyTakeaways: boolean;
  includeActionItems: boolean;
  includeFlashcards: boolean;
  includeGlossary: boolean;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface SummaryStats {
  originalWords: number;
  summaryWords: number;
  reductionPercentage: number;
  readTimeMinutes: number;
}

export interface SummaryItem {
  id: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  actionItems: string[];
  flashcards: Flashcard[];
  glossary: GlossaryItem[];
  sentimentOrTone?: string;
  stats: SummaryStats;
  createdAt: string;
  options: SummaryOptions;
  originalTextPreview?: string;
  pinned?: boolean;
  tags?: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string; // Base64 data string
  previewUrl?: string;
}

export interface ReadingPreferences {
  font: 'sans' | 'serif' | 'mono';
  fontSize: number; // 14 to 22
  lineHeight: 'normal' | 'relaxed' | 'loose';
  focusMode: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
