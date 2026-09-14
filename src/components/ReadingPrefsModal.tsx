import React from 'react';
import { X, Type, AlignLeft, Eye } from 'lucide-react';
import { ReadingPreferences } from '../types';

interface ReadingPrefsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefs: ReadingPreferences;
  onChangePrefs: (newPrefs: ReadingPreferences) => void;
}

export const ReadingPrefsModal: React.FC<ReadingPrefsModalProps> = ({
  isOpen,
  onClose,
  prefs,
  onChangePrefs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#1E1E20] rounded-3xl p-6 shadow-2xl border border-[#D2D2D7] dark:border-[#38383A] transition-colors"
        id="modal-reading-prefs"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D2D2D7]/80 dark:border-[#38383A]/80">
          <div className="flex items-center gap-2 text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-sm">
            <Type className="w-4 h-4 text-[#0071E3]" />
            <span>Ajustes de Lectura</span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-reading-prefs"
            className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 pt-4">
          
          {/* Font Family */}
          <div>
            <label className="block text-[11px] font-bold text-[#86868B] mb-2 uppercase tracking-wider">
              Tipografía
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangePrefs({ ...prefs, font: 'sans' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all font-sans border ${
                  prefs.font === 'sans'
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#E8E8ED]'
                }`}
              >
                Sans (SF)
              </button>

              <button
                type="button"
                onClick={() => onChangePrefs({ ...prefs, font: 'serif' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all font-serif border ${
                  prefs.font === 'serif'
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#E8E8ED]'
                }`}
              >
                Serif (Editorial)
              </button>

              <button
                type="button"
                onClick={() => onChangePrefs({ ...prefs, font: 'mono' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all font-mono border ${
                  prefs.font === 'mono'
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#E8E8ED]'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#86868B] mb-2 uppercase tracking-wider">
              <span>Tamaño de Texto</span>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{prefs.fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#86868B] font-bold">A</span>
              <input
                type="range"
                min="13"
                max="22"
                step="1"
                value={prefs.fontSize}
                onChange={(e) => onChangePrefs({ ...prefs, fontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-[#E8E8ED] dark:bg-[#38383A] rounded-lg appearance-none cursor-pointer accent-[#0071E3]"
              />
              <span className="text-base text-[#1D1D1F] dark:text-[#F5F5F7] font-bold">A</span>
            </div>
          </div>

          {/* Line Height / Spacing */}
          <div>
            <label className="block text-[11px] font-bold text-[#86868B] mb-2 uppercase tracking-wider">
              Interlineado
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'relaxed', 'loose'] as const).map((spacing) => (
                <button
                  key={spacing}
                  type="button"
                  onClick={() => onChangePrefs({ ...prefs, lineHeight: spacing })}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all capitalize ${
                    prefs.lineHeight === spacing
                      ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                      : 'bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#E8E8ED]'
                  }`}
                >
                  {spacing === 'normal' ? 'Normal' : spacing === 'relaxed' ? 'Cómodo' : 'Espacioso'}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Mode Switch */}
          <div className="pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/80 dark:border-[#38383A] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-[#0071E3]" />
                <div>
                  <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                    Modo Enfoque
                  </span>
                  <span className="text-[10px] text-[#86868B]">
                    Oculta elementos secundarios para lectura inmersiva
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.focusMode}
                onChange={(e) => onChangePrefs({ ...prefs, focusMode: e.target.checked })}
                className="w-4 h-4 rounded text-[#0071E3] border-[#D2D2D7] focus:ring-0"
              />
            </label>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-6 pt-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition-opacity"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
