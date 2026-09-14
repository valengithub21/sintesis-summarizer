import React from 'react';
import { 
  Sun, 
  Moon, 
  BookOpen, 
  Plus, 
  Download, 
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Share2
} from 'lucide-react';
import { ReadingPreferences } from '../types';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNewSummary: () => void;
  onOpenHistory: () => void;
  onOpenInstall: () => void;
  onOpenPrefs: () => void;
  historyCount: number;
  hasActiveSummary: boolean;
  readingPrefs: ReadingPreferences;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onNewSummary,
  onOpenHistory,
  onOpenInstall,
  onOpenPrefs,
  historyCount,
  hasActiveSummary,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FBFBFD]/85 dark:bg-[#161617]/85 border-b border-[#D2D2D7]/80 dark:border-[#38383A]/80 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={onNewSummary}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
          id="nav-brand-logo"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
            <div className="w-3.5 sm:w-4 h-1 bg-white dark:bg-black rounded-full"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Síntesis
            </h1>
            <span className="hidden xs:inline text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-[#E8E8ED] dark:bg-[#2C2C2E] text-[#86868B] dark:text-[#A1A1A6]">
              AI
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* New Summary CTA */}
          <button
            onClick={onNewSummary}
            id="btn-new-summary-nav"
            className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
              hasActiveSummary
                ? 'bg-white dark:bg-[#252528] border border-[#D2D2D7] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                : 'text-[#0071E3] hover:bg-[#EBF5FF] dark:hover:bg-[#102A45]/40'
            }`}
            title="Crear nuevo resumen"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0071E3]" />
            <span className="hidden xs:inline">Nuevo</span>
          </button>

          {/* History / Saved Summaries Button */}
          <button
            onClick={onOpenHistory}
            id="btn-history-nav"
            className="relative p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#252528] transition-colors"
            title="Biblioteca de Resúmenes"
          >
            <Bookmark className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#0071E3] text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Reader typography settings */}
          <button
            onClick={onOpenPrefs}
            id="btn-reading-prefs"
            className="p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#252528] transition-colors"
            title="Ajustes de Lectura"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Install on Mobile App button */}
          <button
            onClick={onOpenInstall}
            id="btn-install-pwa-nav"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#D2D2D7] dark:border-[#38383A] text-[#424245] dark:text-[#D2D2D7] hover:bg-[#F5F5F7] dark:hover:bg-[#252528] transition-colors"
            title="Instalar en celular"
          >
            <Download className="w-3.5 h-3.5 text-[#86868B]" />
            <span>Instalar</span>
          </button>

          {/* Sleek Segmented Theme Switcher */}
          <div 
            className="flex items-center p-0.5 bg-[#E8E8ED] dark:bg-[#2C2C2E] rounded-full border border-[#D2D2D7]/60 dark:border-[#38383A]/60 cursor-pointer"
            id="theme-switcher-container"
          >
            <button
              type="button"
              onClick={() => theme !== 'light' && onToggleTheme()}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs transition-all ${
                theme === 'light'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-bold'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Activar Modo Claro"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline text-[11px]">Claro</span>
            </button>
            <button
              type="button"
              onClick={() => theme !== 'dark' && onToggleTheme()}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-[#1E1E20] text-[#F5F5F7] shadow-xs font-bold'
                  : 'text-[#86868B] hover:text-[#F5F5F7]'
              }`}
              title="Activar Modo Oscuro"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden md:inline text-[11px]">Oscuro</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
