/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SummaryInput } from './components/SummaryInput';
import { SummaryViewer } from './components/SummaryViewer';
import { HistorySidebar } from './components/HistorySidebar';
import { ReadingPrefsModal } from './components/ReadingPrefsModal';
import { InstallModal } from './components/InstallModal';
import { SummaryItem, SummaryOptions, UploadedFile, ReadingPreferences } from './types';
import { 
  loadSummaries, 
  saveSummaries, 
  loadTheme, 
  saveTheme, 
  loadReadingPrefs, 
  saveReadingPrefs 
} from './utils/storage';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [summaries, setSummaries] = useState<SummaryItem[]>(() => loadSummaries());
  const [activeSummary, setActiveSummary] = useState<SummaryItem | null>(null);
  const [readingPrefs, setReadingPrefs] = useState<ReadingPreferences>(() => loadReadingPrefs());
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{ text: string; files: UploadedFile[]; options: SummaryOptions } | null>(null);

  // Modals & Drawers state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Synchronize Theme class on HTML root and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist summaries on change
  useEffect(() => {
    saveSummaries(summaries);
  }, [summaries]);

  // Persist reading preferences on change
  useEffect(() => {
    saveReadingPrefs(readingPrefs);
  }, [readingPrefs]);

  // Catch PWA beforeinstallprompt event for Android / Chrome
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Generate Summary API Call
  const handleGenerateSummary = async (
    text: string,
    files: UploadedFile[],
    options: SummaryOptions
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastRequest({ text, files, options });

    try {
      const payloadFiles = files.map((f) => ({
        name: f.name,
        mimeType: f.mimeType,
        data: f.data,
      }));

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          files: payloadFiles,
          options,
        }),
      });

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'No se pudo generar el resumen.');
      }

      const newSummary: SummaryItem = {
        ...responseData.data,
        originalTextPreview: text.slice(0, 500),
      };

      setSummaries((prev) => [newSummary, ...prev]);
      setActiveSummary(newSummary);
      setLastRequest(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.warn('Summary generation notice:', err?.message || err);
      let msg = err.message || 'Ocurrió un error inesperado al generar el resumen.';
      if (typeof msg === 'string' && (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand'))) {
        msg = 'Los servidores de IA están experimentando una alta demanda temporal. Por favor, pulsa Reintentar.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrySummary = () => {
    if (lastRequest) {
      handleGenerateSummary(lastRequest.text, lastRequest.files, lastRequest.options);
    }
  };

  const handleNewSummary = () => {
    setActiveSummary(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSummary = (id: string) => {
    setSummaries((prev) => prev.filter((s) => s.id !== id));
    if (activeSummary?.id === id) {
      setActiveSummary(null);
    }
  };

  const handleTogglePinSummary = (id: string) => {
    setSummaries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
    if (activeSummary?.id === id) {
      setActiveSummary((prev) => (prev ? { ...prev, pinned: !prev.pinned } : null));
    }
  };

  const handleClearAllSummaries = () => {
    setSummaries([]);
    setActiveSummary(null);
  };

  const handleNativeInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setIsInstallOpen(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col transition-colors duration-300 font-sans">
      
      {/* Top Apple Minimalist Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNewSummary={handleNewSummary}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenPrefs={() => setIsPrefsOpen(true)}
        historyCount={summaries.length}
        hasActiveSummary={activeSummary !== null}
        readingPrefs={readingPrefs}
      />

      {/* Error Alert Banner if any */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto px-4 mt-4 w-full animate-in fade-in">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs sm:text-sm text-red-600 dark:text-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <span className="leading-relaxed">{errorMessage}</span>
            <div className="flex items-center gap-2 shrink-0">
              {lastRequest && (
                <button
                  onClick={handleRetrySummary}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Reintentar
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen: Summary Input vs Viewer */}
      <main className="flex-1 pb-16">
        {activeSummary ? (
          <SummaryViewer
            summary={activeSummary}
            readingPrefs={readingPrefs}
            onOpenPrefs={() => setIsPrefsOpen(true)}
            onTogglePin={() => handleTogglePinSummary(activeSummary.id)}
            onBackToEditor={handleNewSummary}
          />
        ) : (
          <SummaryInput
            onGenerate={handleGenerateSummary}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Minimal Footer */}
      {!readingPrefs.focusMode && (
        <footer className="w-full border-t border-[#D2D2D7]/60 dark:border-[#38383A]/80 py-6 text-center text-xs text-[#86868B] transition-colors">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Sintaxis • Creador de Resúmenes Inteligentes</span>
            <div className="flex items-center gap-3">
              <span>Estilo Apple Minimalista</span>
              <span>•</span>
              <button
                onClick={() => setIsInstallOpen(true)}
                className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
              >
                Instalar en Celular
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Drawers & Modals */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        summaries={summaries}
        activeSummaryId={activeSummary?.id || null}
        onSelectSummary={(s) => {
          setActiveSummary(s);
          setErrorMessage(null);
        }}
        onDeleteSummary={handleDeleteSummary}
        onTogglePinSummary={handleTogglePinSummary}
        onClearAll={handleClearAllSummaries}
      />

      <ReadingPrefsModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
        prefs={readingPrefs}
        onChangePrefs={setReadingPrefs}
      />

      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallNative={handleNativeInstall}
      />

    </div>
  );
}
