import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  FileText, 
  Sparkles, 
  Sliders, 
  X, 
  UploadCloud, 
  Mic, 
  MicOff, 
  Clipboard, 
  Check, 
  HelpCircle,
  Layers,
  Languages,
  Clock,
  BookOpen,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Plus
} from 'lucide-react';
import { SummaryOptions, SummaryType, SummaryLength, OutputLanguage, ToneType, UploadedFile } from '../types';

interface SummaryInputProps {
  onGenerate: (text: string, files: UploadedFile[], options: SummaryOptions) => void;
  isLoading: boolean;
}

export const SummaryInput: React.FC<SummaryInputProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedPaste, setCopiedPaste] = useState(false);

  // Summary Options State
  const [summaryType, setSummaryType] = useState<SummaryType>('executive');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [language, setLanguage] = useState<OutputLanguage>('es');
  const [tone, setTone] = useState<ToneType>('neutral');
  const [customInstructions, setCustomInstructions] = useState('');
  const [includeKeyTakeaways, setIncludeKeyTakeaways] = useState(true);
  const [includeActionItems, setIncludeActionItems] = useState(false);
  const [includeFlashcards, setIncludeFlashcards] = useState(false);
  const [includeGlossary, setIncludeGlossary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newUploadedFile: UploadedFile = {
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? base64Data : undefined,
        };

        setFiles((prev) => [...prev, newUploadedFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText((prev) => (prev ? prev + '\n\n' + clipText : clipText));
        setCopiedPaste(true);
        setTimeout(() => setCopiedPaste(false), 1500);
      }
    } catch (err) {
      console.warn('Could not read clipboard', err);
    }
  };

  // Speech to text voice dictation
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('El reconocimiento de voz no está soportado en este navegador.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setText((prev) => prev + ' ' + currentTranscript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    onGenerate(text, files, {
      summaryType,
      length,
      language,
      tone,
      customInstructions,
      includeKeyTakeaways,
      includeActionItems,
      includeFlashcards,
      includeGlossary,
    });
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isFormValid = text.trim().length > 0 || files.length > 0;

  const getFileBadge = (name: string, mime: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
    if (ext === 'PDF') return <span className="w-8 h-9 bg-red-50 dark:bg-red-950/60 rounded-lg border border-red-200 dark:border-red-800 text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">PDF</span>;
    if (ext === 'DOC' || ext === 'DOCX') return <span className="w-8 h-9 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">DOC</span>;
    if (mime.startsWith('image/')) return <span className="w-8 h-9 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">IMG</span>;
    return <span className="w-8 h-9 bg-gray-100 dark:bg-neutral-800 rounded-lg border border-[#D2D2D7] dark:border-[#38383A] text-[10px] font-bold text-[#86868B] flex items-center justify-center shrink-0">{ext.slice(0, 3)}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10 animate-in fade-in duration-300">
      
      {/* Sleek Interface Section Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 sm:mb-2">
          Configuración del Resumen
        </h2>
        <p className="text-[#86868B] text-xs sm:text-sm">
          Personaliza el tono, la estructura y las especificaciones de tu resumen inteligente.
        </p>
      </div>

      {/* Main Creation Card Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        
        {/* Card 1: Input & Files Area */}
        <div className="bg-white dark:bg-[#1E1E20] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs border border-[#D2D2D7] dark:border-[#38383A] transition-all duration-300">
          
          <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider">
                Texto o Contenido a Resumir
              </label>
              <span className="text-[10px] sm:text-[11px] text-[#86868B]">
                {wordCount} palabras
              </span>
            </div>

            {/* Direct Text Input & Dictation Area */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Pega aquí tu texto, apuntes, transcripciones, contratos o fragmentos de libro..."
                rows={6}
                className="w-full bg-[#F5F5F7]/70 dark:bg-[#161617]/70 border border-[#D2D2D7] dark:border-[#38383A] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 pb-16 sm:pb-16 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3] focus:border-transparent outline-none resize-none transition-all"
              />

              {/* Action Buttons inside Textarea */}
              <div className="absolute bottom-5 right-4 sm:bottom-5 sm:right-5 flex items-center gap-1 sm:gap-1.5 bg-white/95 dark:bg-[#252528]/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#D2D2D7]/80 dark:border-[#38383A] shadow-xs text-xs">
                
                {/* Paste Button */}
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="p-1.5 rounded-lg text-[#424245] dark:text-[#D2D2D7] hover:bg-[#F5F5F7] dark:hover:bg-[#333336] transition-colors flex items-center gap-1 text-[11px] font-medium"
                  title="Pegar del portapapeles"
                >
                  {copiedPaste ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span className="hidden xs:inline">Pegar</span>
                </button>

                {/* Dictation Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium ${
                    isRecording
                      ? 'text-red-500 bg-red-50 dark:bg-red-950/50 animate-pulse font-semibold'
                      : 'text-[#424245] dark:text-[#D2D2D7] hover:bg-[#F5F5F7] dark:hover:bg-[#333336]'
                  }`}
                  title={isRecording ? 'Detener dictado' : 'Dictar por voz'}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span className="hidden xs:inline">{isRecording ? 'Grabando...' : 'Voz'}</span>
                </button>

                {/* Clear */}
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
                    title="Borrar texto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded / Attached Files Section */}
          <div className="space-y-2.5 sm:space-y-3">
            <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider">
              Archivos Cargados {files.length > 0 && `(${files.length})`}
            </label>

            {/* Uploaded items */}
            {files.length > 0 && (
              <div className="grid gap-2 mb-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-[#F5F5F7] dark:bg-[#252528] p-2.5 sm:p-3 rounded-xl border border-dashed border-[#D2D2D7] dark:border-[#38383A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {getFileBadge(file.name, file.mimeType)}
                      <div className="truncate">
                        <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate block">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-[#86868B]">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-[#86868B] hover:text-red-500 p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1E1E20] transition-colors shrink-0"
                      title="Eliminar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-3.5 px-3.5 sm:py-4 sm:px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors select-none ${
                isDragOver
                  ? 'border-[#0071E3] bg-[#EBF5FF]/50 dark:bg-[#102A45]/30'
                  : 'border-[#D2D2D7] dark:border-[#38383A] text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#252528]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.csv"
                className="hidden"
              />
              
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-[#0071E3]" />
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {files.length === 0 ? 'Subir documentos o imágenes' : 'Subir más archivos'}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#86868B] text-center">
                Arrastra aquí PDF, Word, imágenes o notas de texto
              </span>
            </div>

          </div>

        </div>

        {/* Card 2: Sleek Specifications Panel */}
        <div className="bg-white dark:bg-[#1E1E20] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs border border-[#D2D2D7] dark:border-[#38383A] transition-all duration-300 space-y-5 sm:space-y-6">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-[#D2D2D7]/60 dark:border-[#38383A]/60">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0071E3]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Estructura y Parámetros
              </h3>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#86868B]">
              Personalización
            </span>
          </div>

          {/* 1. Summary Type (Sleek Buttons) */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider mb-2">
              Tipo de Resumen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'executive', label: 'Ejecutivo', desc: 'Conclusiones y decisiones' },
                { id: 'bullets', label: 'Puntos Clave', desc: 'Viñetas estructuradas' },
                { id: 'study', label: 'Guía de Estudio', desc: 'Conceptos y repaso' },
                { id: 'eli5', label: 'Explicación Fácil', desc: 'Analogías simples (ELI5)' },
                { id: 'deep', label: 'Exhaustivo', desc: 'Análisis detallado' },
                { id: 'qa', label: 'Q&A Preguntas', desc: 'Preguntas y respuestas' },
                { id: 'actionable', label: 'Plan de Acción', desc: 'Pasos a seguir' },
                { id: 'comparative', label: 'Comparativo', desc: 'Tablas y contrastes' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSummaryType(item.id as SummaryType)}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all duration-200 ${
                    summaryType === item.id
                      ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs font-semibold'
                      : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#D2D2D7]/80 dark:border-[#38383A] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E]'
                  }`}
                >
                  <div className="text-[11px] sm:text-xs font-bold block">{item.label}</div>
                  <div className={`text-[9px] sm:text-[10px] mt-0.5 line-clamp-1 ${
                    summaryType === item.id ? 'text-white/85' : 'text-[#86868B]'
                  }`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Custom Instructions Specifics (From Sleek Interface spec) */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider mb-1.5">
              Instrucciones Específicas
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Ej: Enfócate en el periodo helenístico, destaca fórmulas y conclusiones..."
              rows={2}
              className="w-full bg-[#F5F5F7]/70 dark:bg-[#161617]/70 border border-[#D2D2D7] dark:border-[#38383A] rounded-xl sm:rounded-2xl p-3 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:ring-2 focus:ring-[#0071E3] focus:border-transparent outline-none resize-none transition-all"
            />
          </div>

          {/* 3. Length and Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Length */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider mb-1.5">
                Extensión
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#E8E8ED] dark:bg-[#2C2C2E] rounded-xl sm:rounded-2xl border border-[#D2D2D7]/60 dark:border-[#38383A]">
                {[
                  { id: 'short', label: 'Conciso' },
                  { id: 'medium', label: 'Equilibrado' },
                  { id: 'detailed', label: 'Detallado' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLength(item.id as SummaryLength)}
                    className={`py-1.5 sm:py-2 text-[11px] sm:text-xs rounded-lg sm:rounded-xl transition-all ${
                      length === item.id
                        ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs font-bold'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider mb-1.5">
                Idioma de Salida
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as OutputLanguage)}
                className="w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7] dark:border-[#38383A] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                <option value="es">Español (Nativo)</option>
                <option value="en">Inglés (English)</option>
                <option value="auto">Mismo idioma del documento</option>
                <option value="fr">Francés (Français)</option>
                <option value="de">Alemán (Deutsch)</option>
                <option value="pt">Portugués (Português)</option>
                <option value="it">Italiano (Italiano)</option>
              </select>
            </div>

          </div>

          {/* 4. Complementary Module Toggles */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-[#86868B] uppercase tracking-wider mb-2">
              Módulos Complementarios
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <button
                type="button"
                onClick={() => setIncludeKeyTakeaways(!includeKeyTakeaways)}
                className={`p-2 sm:p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  includeKeyTakeaways
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#424245] dark:text-[#D2D2D7] border-[#D2D2D7] dark:border-[#38383A]'
                }`}
              >
                <span className="truncate">💡 Ideas Clave</span>
                <span className="text-[9px] font-bold ml-1">{includeKeyTakeaways ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeFlashcards(!includeFlashcards)}
                className={`p-2 sm:p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  includeFlashcards
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#424245] dark:text-[#D2D2D7] border-[#D2D2D7] dark:border-[#38383A]'
                }`}
              >
                <span className="truncate">🧠 Tarjetas</span>
                <span className="text-[9px] font-bold ml-1">{includeFlashcards ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeGlossary(!includeGlossary)}
                className={`p-2 sm:p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  includeGlossary
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#424245] dark:text-[#D2D2D7] border-[#D2D2D7] dark:border-[#38383A]'
                }`}
              >
                <span className="truncate">📖 Glosario</span>
                <span className="text-[9px] font-bold ml-1">{includeGlossary ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeActionItems(!includeActionItems)}
                className={`p-2 sm:p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  includeActionItems
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#424245] dark:text-[#D2D2D7] border-[#D2D2D7] dark:border-[#38383A]'
                }`}
              >
                <span className="truncate">🎯 Acciones</span>
                <span className="text-[9px] font-bold ml-1">{includeActionItems ? 'ON' : 'OFF'}</span>
              </button>

            </div>
          </div>

        </div>

        {/* Generate Primary CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            id="btn-generate-summary"
            className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-full font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-xs ${
              !isFormValid || isLoading
                ? 'bg-[#D2D2D7] dark:bg-[#2C2C2E] text-[#86868B] cursor-not-allowed shadow-none'
                : 'bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.99] text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Sintetizando con IA...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Generar Resumen Inteligente</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
