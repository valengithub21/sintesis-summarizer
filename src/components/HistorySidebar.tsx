import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  Pin, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  Clock, 
  Bookmark, 
  Download,
  Check
} from 'lucide-react';
import { SummaryItem } from '../types';
import { exportSummaryToPdf } from '../utils/pdfExport';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: SummaryItem[];
  activeSummaryId: string | null;
  onSelectSummary: (summary: SummaryItem) => void;
  onDeleteSummary: (id: string) => void;
  onTogglePinSummary: (id: string) => void;
  onClearAll: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  summaries,
  activeSummaryId,
  onSelectSummary,
  onDeleteSummary,
  onTogglePinSummary,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSummaries = summaries
    .filter((s) => {
      if (filter === 'pinned' && !s.pinned) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(query) ||
        s.summary.toLowerCase().includes(query) ||
        (s.keyTakeaways && s.keyTakeaways.some((k) => k.toLowerCase().includes(query)))
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleCopy = (summary: SummaryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${summary.title}\n\n${summary.summary}`);
    setCopiedId(summary.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end">
      <div 
        className="w-full max-w-md bg-[#FBFBFD] dark:bg-[#161617] h-full shadow-2xl border-l border-[#D2D2D7] dark:border-[#38383A] flex flex-col transition-all duration-300"
        id="sidebar-history"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#D2D2D7]/80 dark:border-[#38383A]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#0071E3]" />
            <h2 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Biblioteca de Resúmenes
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E8E8ED] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
              {summaries.length}
            </span>
          </div>

          <button
            onClick={onClose}
            id="btn-close-history"
            className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 space-y-3 border-b border-[#D2D2D7]/80 dark:border-[#38383A]/80 bg-white/60 dark:bg-[#1E1E20]/60">
          
          <div className="relative">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, concepto o contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#161617] border border-[#D2D2D7] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                    : 'text-[#86868B] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E]'
                }`}
              >
                Todos ({summaries.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pinned')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  filter === 'pinned'
                    ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                    : 'text-[#86868B] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E]'
                }`}
              >
                <Pin className="w-3 h-3" />
                Fijados ({summaries.filter((s) => s.pinned).length})
              </button>
            </div>

            {summaries.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de borrar todos los resúmenes guardados?')) {
                    onClearAll();
                  }
                }}
                className="text-[11px] text-red-500 hover:text-red-600 transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>

        </div>

        {/* List of Summaries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSummaries.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8E8ED] dark:bg-[#2C2C2E] text-[#86868B] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-[#0071E3]" />
              </div>
              <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {searchQuery ? 'No se encontraron resultados' : 'Aún no hay resúmenes guardados'}
              </p>
              <p className="text-xs text-[#86868B] mt-1 max-w-xs mx-auto">
                {searchQuery ? 'Prueba con otras palabras clave' : 'Los resúmenes que crees se guardarán automáticamente aquí.'}
              </p>
            </div>
          ) : (
            filteredSummaries.map((item) => {
              const isActive = item.id === activeSummaryId;
              const dateStr = new Date(item.createdAt).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSummary(item);
                    onClose();
                  }}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#EBF5FF]/60 dark:bg-[#102A45]/40 border-[#0071E3] shadow-xs'
                      : 'bg-white dark:bg-[#1E1E20] border-[#D2D2D7]/80 dark:border-[#38383A] hover:border-[#0071E3] hover:shadow-xs'
                  }`}
                >
                  {/* Top line: pin + title */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinSummary(item.id);
                      }}
                      title={item.pinned ? 'Desfijar' : 'Fijar al inicio'}
                      className={`p-1 rounded-lg shrink-0 transition-colors ${
                        item.pinned
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Summary snippet */}
                  <p className="text-[11px] text-[#86868B] line-clamp-2 leading-relaxed mb-3">
                    {item.summary.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '')}
                  </p>

                  {/* Footer metadata & quick actions */}
                  <div className="flex items-center justify-between text-[10px] text-[#86868B] pt-2 border-t border-[#D2D2D7]/50 dark:border-[#38383A]/60">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{item.stats?.readTimeMinutes || 2}m
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      {/* Copy */}
                      <button
                        onClick={(e) => handleCopy(item, e)}
                        title="Copiar texto"
                        className="p-1 rounded hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Bookmark className="w-3 h-3" />}
                      </button>

                      {/* PDF */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSummaryToPdf(item);
                        }}
                        title="Exportar PDF"
                        className="p-1 rounded hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
                      >
                        <Download className="w-3 h-3" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSummary(item.id);
                        }}
                        title="Eliminar"
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
