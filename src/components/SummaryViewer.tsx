import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Pin, 
  PinOff, 
  Share2, 
  Eye, 
  EyeOff, 
  Type, 
  BookOpen, 
  RotateCw, 
  CheckCircle2, 
  ListChecks, 
  Layers, 
  HelpCircle, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun
} from 'lucide-react';
import { SummaryItem, ReadingPreferences, ChatMessage } from '../types';
import { exportSummaryToPdf, exportSummaryToMarkdown, exportSummaryToTxt } from '../utils/pdfExport';
import { AudioPlayer } from './AudioPlayer';

interface SummaryViewerProps {
  summary: SummaryItem;
  readingPrefs: ReadingPreferences;
  onOpenPrefs: () => void;
  onTogglePin: () => void;
  onBackToEditor: () => void;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({
  summary,
  readingPrefs,
  onOpenPrefs,
  onTogglePin,
  onBackToEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'takeaways' | 'flashcards' | 'glossary' | 'chat'>('summary');
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [masteredFlashcards, setMasteredFlashcards] = useState<number[]>([]);

  // Check if dark mode is active
  const isCurrentDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // Q&A Chat with Document State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Copy Summary text
  const handleCopy = () => {
    navigator.clipboard.writeText(`${summary.title}\n\n${summary.summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Q&A Send
  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAsking) return;

    const userQuestion = chatInput.trim();
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: userQuestion,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryContent: summary.summary,
          originalText: summary.originalTextPreview || '',
          question: userQuestion,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        content: data.answer || 'No fue posible responder en este momento.',
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          content: 'Ocurrió un error al contactar al asistente.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Flashcards navigation
  const nextFlashcard = () => {
    setIsFlashcardFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev + 1) % summary.flashcards.length);
  };

  const prevFlashcard = () => {
    setIsFlashcardFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev - 1 + summary.flashcards.length) % summary.flashcards.length);
  };

  const toggleMastered = (index: number) => {
    setMasteredFlashcards((prev) => 
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Dynamic Typography Styles based on user preferences
  const getFontFamilyClass = () => {
    if (readingPrefs.font === 'serif') return 'font-serif';
    if (readingPrefs.font === 'mono') return 'font-mono';
    return 'font-sans';
  };

  const getLineHeightClass = () => {
    if (readingPrefs.lineHeight === 'loose') return 'leading-loose';
    if (readingPrefs.lineHeight === 'relaxed') return 'leading-relaxed';
    return 'leading-normal';
  };

  return (
    <div className={`max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 transition-all duration-300 ${
      readingPrefs.focusMode ? 'max-w-3xl py-6 sm:py-10' : ''
    }`}>

      {/* Top Bar Navigation & Stats */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#D2D2D7]/80 dark:border-[#38383A]/80">
        
        {/* Back to Input & Pin */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onBackToEditor}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#E8E8ED] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#D2D2D7] dark:hover:bg-[#3A3A3C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Volver</span>
          </button>

          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-full border text-xs transition-colors ${
              summary.pinned
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600'
                : 'border-[#D2D2D7] dark:border-[#38383A] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
            }`}
            title={summary.pinned ? 'Desfijar de biblioteca' : 'Fijar en biblioteca'}
          >
            {summary.pinned ? <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <PinOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>

        {/* Right Tools: TTS, Copy, Export, Typography */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Audio TTS */}
          <div className="hidden sm:block">
            <AudioPlayer text={summary.summary} title={summary.title} />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 sm:p-2 rounded-full border border-[#D2D2D7] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] bg-white dark:bg-[#252528] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] shadow-xs transition-colors"
            title="Copiar texto del resumen"
          >
            {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#86868B]" />}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all"
              title="Exportar resumen"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Exportar</span>
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#1E1E20] rounded-2xl shadow-xl border border-[#D2D2D7] dark:border-[#38383A] py-2 z-30 animate-in fade-in"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                  Lectura Offline
                </div>

                {/* Main styled PDF respecting current dark mode */}
                <button
                  onClick={() => {
                    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                    exportSummaryToPdf(summary, { isDarkMode: isDark });
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#252528] flex items-center justify-between font-medium group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    <span>PDF Lectura Offline</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#A1A1A6] font-normal flex items-center gap-1">
                    {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? (
                      <>
                        <Moon className="w-2.5 h-2.5 text-indigo-400" />
                        <span>Oscuro</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-2.5 h-2.5 text-amber-500" />
                        <span>Claro</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Option for alternate theme PDF */}
                <button
                  onClick={() => {
                    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                    exportSummaryToPdf(summary, { isDarkMode: !isDark });
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-1.5 text-left text-[11px] text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#252528] flex items-center gap-2 transition-colors pl-9"
                >
                  <span>
                    {typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
                      ? 'Exportar en PDF Modo Claro (impresión)'
                      : 'Exportar en PDF Modo Oscuro'}
                  </span>
                </button>

                <div className="my-1.5 border-t border-[#D2D2D7]/60 dark:border-[#38383A]" />

                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                  Otros Formatos
                </div>

                <button
                  onClick={() => {
                    exportSummaryToMarkdown(summary);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#252528] flex items-center gap-2 font-medium"
                >
                  <Layers className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    exportSummaryToTxt(summary);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#252528] flex items-center gap-2 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-[#86868B]" />
                  <span>Texto Plano (.txt)</span>
                </button>
              </div>
            )}
          </div>

          {/* Reading Preferences */}
          <button
            onClick={onOpenPrefs}
            className="p-1.5 sm:p-2 rounded-full border border-[#D2D2D7] dark:border-[#38383A] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] bg-white dark:bg-[#252528] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
            title="Ajustes de texto y tipografía"
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

        </div>

      </div>

      {/* Audio player in mobile */}
      <div className="sm:hidden mb-4">
        <AudioPlayer text={summary.summary} title={summary.title} />
      </div>

      {/* Reading Document Container */}
      <div className="bg-white dark:bg-[#1E1E20] rounded-2xl sm:rounded-3xl p-4 sm:p-9 shadow-xs border border-[#D2D2D7] dark:border-[#38383A] transition-all duration-300">
        
        {/* Document Header */}
        <div className="border-b border-[#D2D2D7]/60 dark:border-[#38383A]/60 pb-4 sm:pb-6 mb-5 sm:mb-6">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-medium text-[#86868B] mb-2">
            <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] dark:bg-[#1B3B2B] dark:text-[#81C784] font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">
              Lectura ~{summary.stats?.readTimeMinutes || 2} min
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#EBF5FF] text-[#0071E3] dark:bg-[#102A45] dark:text-[#409CFF] font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">
              -{summary.stats?.reductionPercentage || 70}% reducción
            </span>
            <span className="text-[#86868B]">
              {summary.stats?.summaryWords || 0} palabras
            </span>
          </div>

          <h1 className={`text-xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight ${getFontFamilyClass()}`}>
            {summary.title}
          </h1>
        </div>

        {/* Feature Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#E8E8ED] dark:bg-[#2C2C2E] rounded-xl sm:rounded-2xl mb-6 sm:mb-8 overflow-x-auto border border-[#D2D2D7]/60 dark:border-[#38383A] select-none text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
            }`}
          >
            📄 Resumen
          </button>

          {(summary.keyTakeaways?.length > 0 || summary.actionItems?.length > 0) && (
            <button
              onClick={() => setActiveTab('takeaways')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'takeaways'
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              💡 Ideas & Acciones
            </button>
          )}

          {summary.flashcards?.length > 0 && (
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              🧠 Tarjetas ({summary.flashcards.length})
            </button>
          )}

          {summary.glossary?.length > 0 && (
            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'glossary'
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              📖 Glosario ({summary.glossary.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
            }`}
          >
            💬 Preguntar
          </button>
        </div>

        {/* Tab 1: Full Markdown Summary Reader */}
        {activeTab === 'summary' && (
          <div 
            className={`prose-apple text-[#1D1D1F] dark:text-[#F5F5F7] transition-all duration-200 ${getFontFamilyClass()} ${getLineHeightClass()}`}
            style={{ fontSize: `${readingPrefs.fontSize}px` }}
          >
            <ReactMarkdown>{summary.summary}</ReactMarkdown>
          </div>
        )}

        {/* Tab 2: Key Takeaways & Action Items */}
        {activeTab === 'takeaways' && (
          <div className="space-y-8 animate-in fade-in">
            {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0071E3]" />
                  <span>Ideas Clave Fundamentales</span>
                </h3>
                <div className="grid gap-3">
                  {summary.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.actionItems && summary.actionItems.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#0071E3]" />
                  <span>Puntos de Acción y Pasos Prácticos</span>
                </h3>
                <div className="grid gap-2.5">
                  {summary.actionItems.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] cursor-pointer hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#D2D2D7] text-[#0071E3] mt-1 focus:ring-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interactive Study Flashcards */}
        {activeTab === 'flashcards' && summary.flashcards && summary.flashcards.length > 0 && (
          <div className="max-w-lg mx-auto py-4 space-y-6 animate-in fade-in">
            
            {/* Header / Score */}
            <div className="flex items-center justify-between text-xs font-semibold text-[#86868B]">
              <span>Tarjeta {currentFlashcardIndex + 1} de {summary.flashcards.length}</span>
              <span className="text-[#0071E3] font-bold">
                {masteredFlashcards.length} aprendidas
              </span>
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
              className="relative min-h-[220px] sm:min-h-[260px] p-6 sm:p-8 rounded-3xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7] dark:border-[#38383A] cursor-pointer select-none flex flex-col justify-between shadow-xs hover:border-[#0071E3] transition-all duration-300"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-[#333336] text-[#0071E3] border border-[#D2D2D7]/60 dark:border-[#38383A]">
                  {isFlashcardFlipped ? 'Respuesta' : 'Pregunta'}
                </span>
                <p className="mt-4 text-base sm:text-lg font-medium text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                  {isFlashcardFlipped
                    ? summary.flashcards[currentFlashcardIndex].answer
                    : summary.flashcards[currentFlashcardIndex].question}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#86868B] pt-4 border-t border-[#D2D2D7]/60 dark:border-[#38383A]/60">
                <span>Toca para {isFlashcardFlipped ? 'ver pregunta' : 'revelar respuesta'}</span>
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Navigation & Mastered Controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={prevFlashcard}
                className="p-3 rounded-2xl bg-[#E8E8ED] hover:bg-[#D2D2D7] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
                title="Tarjeta anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => toggleMastered(currentFlashcardIndex)}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  masteredFlashcards.includes(currentFlashcardIndex)
                    ? 'bg-[#0071E3] text-white shadow-xs'
                    : 'bg-[#E8E8ED] hover:bg-[#D2D2D7] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{masteredFlashcards.includes(currentFlashcardIndex) ? 'Dominada' : 'Marcar como Dominada'}</span>
              </button>

              <button
                onClick={nextFlashcard}
                className="p-3 rounded-2xl bg-[#E8E8ED] hover:bg-[#D2D2D7] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
                title="Siguiente tarjeta"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}

        {/* Tab 4: Glossary */}
        {activeTab === 'glossary' && summary.glossary && summary.glossary.length > 0 && (
          <div className="grid gap-3 animate-in fade-in">
            {summary.glossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A]"
              >
                <h4 className="text-xs sm:text-sm font-bold text-[#0071E3] mb-1">
                  {item.term}
                </h4>
                <p className="text-xs sm:text-sm text-[#424245] dark:text-[#D2D2D7] leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Interactive Chat with Document */}
        {activeTab === 'chat' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-xs text-[#86868B] bg-[#F5F5F7] dark:bg-[#252528] p-3.5 rounded-2xl border border-[#D2D2D7]/70 dark:border-[#38383A]">
              💡 Pregunta cualquier duda sobre este resumen o pide explicaciones más detalladas a la IA.
            </div>

            {/* Messages Stream */}
            <div className="space-y-3 min-h-[160px] max-h-[360px] overflow-y-auto pr-1">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-[#86868B] text-xs">
                  Escribe tu primera pregunta para comenzar a chatear con el documento.
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0071E3] text-white rounded-br-sm shadow-xs'
                          : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D2D2D7]/70 dark:border-[#38383A] rounded-bl-sm prose-apple'
                      }`}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}

              {isAsking && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] text-[#86868B] text-xs flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendQuestion} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pregunta algo sobre el contenido..."
                className="flex-1 py-3 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#161617] border border-[#D2D2D7] dark:border-[#38383A] text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAsking}
                className="p-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white disabled:opacity-40 transition-opacity shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
