import React from 'react';
import { X, Smartphone, Share2, PlusSquare, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallNative: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallNative,
}) => {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1E1E20] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#D2D2D7] dark:border-[#38383A] transition-colors"
        id="modal-install-app"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D2D2D7]/80 dark:border-[#38383A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Instalar Sintaxis en tu Celular
              </h3>
              <p className="text-[11px] text-[#86868B]">
                Acceso directo instantáneo y lectura offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-install-modal"
            className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content depending on Platform */}
        <div className="py-5 space-y-4">
          
          {deferredPrompt ? (
            <div className="text-center py-3">
              <p className="text-xs text-[#86868B] mb-4">
                Tu navegador soporta la instalación directa con un solo toque.
              </p>
              <button
                onClick={onInstallNative}
                className="w-full py-3 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs shadow-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                Instalar Aplicación Ahora
              </button>
            </div>
          ) : (
            <>
              {isIOS ? (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                    Instrucciones para iPhone / iPad (Safari):
                  </div>
                  
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <div className="w-6 h-6 rounded-lg bg-[#EBF5FF] dark:bg-[#102A45] flex items-center justify-center shrink-0 mt-0.5">
                      <Share2 className="w-3.5 h-3.5 text-[#0071E3]" />
                    </div>
                    <div>
                      <strong className="block text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">1. Toca el botón Compartir</strong>
                      Toca el icono de Compartir en la barra inferior de Safari.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <div className="w-6 h-6 rounded-lg bg-[#E8E8ED] dark:bg-[#3A3A3C] flex items-center justify-center shrink-0 mt-0.5">
                      <PlusSquare className="w-3.5 h-3.5 text-[#1D1D1F] dark:text-[#F5F5F7]" />
                    </div>
                    <div>
                      <strong className="block text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">2. "Agregar a inicio"</strong>
                      Desplázate hacia abajo y selecciona <span className="font-semibold text-[#0071E3]">"Agregar a inicio" (Add to Home Screen)</span>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] dark:bg-[#1B3B2B] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <strong className="block text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">3. Toca "Agregar"</strong>
                      ¡Listo! Tendrás el icono en tu pantalla como una app nativa de iOS sin barras de navegación.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                    Instrucciones para Android / Chrome:
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <div className="w-6 h-6 rounded-lg bg-[#E8E8ED] dark:bg-[#3A3A3C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      ⋮
                    </div>
                    <div>
                      <strong className="block text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">1. Menú del Navegador</strong>
                      Toca los tres puntos en la esquina superior derecha de Chrome o tu navegador.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7]/70 dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <div className="w-6 h-6 rounded-lg bg-[#EBF5FF] dark:bg-[#102A45] flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowDownToLine className="w-3.5 h-3.5 text-[#0071E3]" />
                    </div>
                    <div>
                      <strong className="block text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">2. "Instalar aplicación" o "Añadir a pantalla de inicio"</strong>
                      Selecciona la opción para instalar la Web App en tu dispositivo.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* GitHub Repo friendly notice */}
          <div className="p-3.5 rounded-2xl bg-[#E8E8ED]/60 dark:bg-[#2C2C2E]/60 border border-[#D2D2D7]/60 dark:border-[#38383A] text-[11px] text-[#86868B]">
            💡 <strong>Alojamiento en GitHub:</strong> Esta app incluye el archivo <code className="text-[#0071E3] font-mono">manifest.json</code> y soporte completo PWA para ser alojada en GitHub Pages, Vercel o Cloud Run.
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#E8E8ED] hover:bg-[#D2D2D7] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
