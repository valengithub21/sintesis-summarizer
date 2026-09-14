import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Check, ChevronDown, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  title: string;
}

// Helper to determine if voice is feminine and prioritize natural/neural Spanish voices
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  // Spanish detection (standard codes, country codes, or name containing spanish)
  const isSpanish = lang.startsWith('es') || lang.includes('es-') || lang.includes('es_') || name.includes('spanish') || name.includes('español');
  
  if (isSpanish) {
    score += 500;
  }

  // Feminine voice indicators
  const femaleKeywords = [
    'female', 'mujer', 'monica', 'mónica', 'lucia', 'lucía', 'helena', 
    'elena', 'laura', 'sofia', 'sofía', 'sabina', 'paloma', 'jimena', 
    'clara', 'carmen', 'alva', 'paulina', 'maria', 'maría', 'rosa', 
    'victoria', 'zira', 'samantha', 'karen', 'tessa', 'siri', 'dalia', 'mia', 'soledad',
    'francisca', 'catalina', 'camila', 'angelica', 'angélica', 'conchita'
  ];
  const isExplicitFemale = femaleKeywords.some(kw => name.includes(kw));
  const isExplicitMale = name.includes('male') || name.includes('david') || name.includes('pablo') || name.includes('jorge') || name.includes('raul') || name.includes('alvaro') || name.includes('enrique') || name.includes('carlos');

  if (isExplicitFemale) {
    score += 150;
  } else if (!isExplicitMale) {
    score += 40;
  }

  // Neural / Natural / Premium voice quality
  if (name.includes('natural') || name.includes('neural') || name.includes('online') || name.includes('premium')) {
    score += 80;
  }

  // Major engines
  if (name.includes('google') || name.includes('apple') || name.includes('microsoft')) {
    score += 30;
  }

  return score;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState<number>(0.95);
  const [isSupported, setIsSupported] = useState(true);
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<any>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Clean raw markdown text for smooth speech flow in Spanish
  const cleanSpeechText = text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*\*(.*?)\*/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[-*•]\s+/g, '. ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .slice(0, 10000);

  // Robust voice fetcher with deduplication
  const fetchVoices = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Deduplicate voices that have identical name or voiceURI to avoid key collisions
    const seen = new Set<string>();
    const uniqueVoices: SpeechSynthesisVoice[] = [];
    for (const v of voices) {
      const identifier = `${v.name}|${v.lang}`;
      if (!seen.has(identifier) && !seen.has(v.voiceURI)) {
        seen.add(identifier);
        seen.add(v.voiceURI);
        uniqueVoices.push(v);
      }
    }

    // Sort all voices: Spanish & female first
    const sorted = [...uniqueVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
    setAllVoices(sorted);

    // Default selection: highest scored Spanish female voice
    setSelectedVoiceURI(prev => {
      if (prev && sorted.some(v => v.voiceURI === prev)) return prev;
      return sorted[0]?.voiceURI || '';
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      fetchVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = fetchVoices;
      }

      const t1 = setTimeout(fetchVoices, 150);
      const t2 = setTimeout(fetchVoices, 600);
      const t3 = setTimeout(fetchVoices, 1500);

      const handleOutsideClick = (e: MouseEvent) => {
        if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
          setShowVoiceMenu(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        stopAudio();
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const togglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
        startProgressTracker();
      } else {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
        
        // Find user-selected voice or best Spanish candidate
        const chosenVoice = allVoices.find(v => v.voiceURI === selectedVoiceURI) 
          || allVoices.find(v => v.lang.toLowerCase().startsWith('es'))
          || allVoices[0];

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang.toLowerCase().startsWith('es') ? chosenVoice.lang : 'es-ES';
        } else {
          utterance.lang = 'es-ES';
        }

        utterance.rate = rate;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        };

        utterance.onerror = () => {
          setIsPlaying(false);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
        setIsPlaying(true);
        startProgressTracker();
      }
    }
  };

  const startProgressTracker = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const totalWords = cleanSpeechText.split(/\s+/).length;
    const totalSeconds = (totalWords / (145 * rate)) * 60;
    let elapsed = (progress / 100) * totalSeconds;

    progressIntervalRef.current = setInterval(() => {
      elapsed += 0.5;
      const pct = Math.min(99, Math.round((elapsed / totalSeconds) * 100));
      setProgress(pct);
    }, 500);
  };

  const handleRateChange = () => {
    const rates = [0.95, 1.1, 1.25, 1.4, 0.85];
    const currentIndex = rates.indexOf(rate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setRate(nextRate);

    if (isPlaying && synthRef.current) {
      stopAudio();
      setTimeout(togglePlay, 100);
    }
  };

  const handleReset = () => {
    stopAudio();
    setTimeout(togglePlay, 100);
  };

  if (!isSupported) return null;

  // Separate voices: Spanish prioritized, and general voices as backup
  const spanishList = allVoices.filter(v => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    return l.startsWith('es') || l.includes('es-') || l.includes('es_') || n.includes('spanish') || n.includes('español');
  });

  const displayList = spanishList.length > 0 ? spanishList : allVoices.slice(0, 8);

  // Active voice name
  const currentVoice = allVoices.find(v => v.voiceURI === selectedVoiceURI);
  let cleanVoiceName = 'Voz Femenina (ES)';
  if (currentVoice) {
    cleanVoiceName = currentVoice.name
      .replace(/Google|Microsoft|Apple|es-ES|es-MX|es-US|Natural|Online/gi, '')
      .trim() || currentVoice.name;
  }

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 p-2.5 sm:px-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#D2D2D7] dark:border-[#38383A] shadow-xs">
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        id="btn-tts-play-pause"
        className="w-8 h-8 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xs shrink-0 cursor-pointer"
        title={isPlaying ? 'Pausar audio' : 'Escuchar resumen'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Progress & Title */}
      <div className="flex-1 min-w-[110px]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#86868B] mb-1">
          <span className="truncate max-w-[130px] sm:max-w-[190px] text-[#1D1D1F] dark:text-[#F5F5F7]">
            {isPlaying ? 'Leyendo en español...' : 'Audio lectura'}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E8E8ED] dark:bg-[#38383A] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0071E3] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Voice Switcher Dropdown */}
      <div className="relative" ref={menuContainerRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fetchVoices();
            setShowVoiceMenu(prev => !prev);
          }}
          id="btn-tts-voice"
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#E8E8ED] dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#D2D2D7] dark:hover:bg-[#48484A] transition-colors cursor-pointer"
          title="Cambiar voz en español"
        >
          <Sparkles className="w-3 h-3 text-[#0071E3] dark:text-[#38BDF8]" />
          <span className="max-w-[75px] sm:max-w-[105px] truncate">{cleanVoiceName}</span>
          <ChevronDown className={`w-3 h-3 text-[#86868B] transition-transform ${showVoiceMenu ? 'rotate-180' : ''}`} />
        </button>

        {showVoiceMenu && (
          <div 
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1E1E20] rounded-xl shadow-2xl border border-[#D2D2D7] dark:border-[#38383A] p-2 z-50 animate-in fade-in"
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86868B] border-b border-[#D2D2D7]/50 dark:border-[#38383A] mb-1">
              {spanishList.length > 0 ? `Voces en Español (${spanishList.length})` : 'Voces del Sistema'}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1">
              {displayList.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-[#86868B]">
                  <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">Cargando voces...</p>
                  <p className="text-[11px]">El sintetizador usará la voz en español predeterminada de tu equipo.</p>
                </div>
              ) : (
                displayList.map((v, index) => {
                  const isSelected = v.voiceURI === selectedVoiceURI;
                  const display = v.name.replace(/Google|Microsoft|Apple|es-ES|es-MX|Natural|Online/gi, '').trim() || v.name;
                  const region = v.lang.replace(/^(es|en)[-_]/i, '').toUpperCase() || v.lang.slice(0, 2).toUpperCase();

                  return (
                    <button
                      key={`${v.voiceURI}-${v.lang}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedVoiceURI(v.voiceURI);
                        setShowVoiceMenu(false);
                        if (isPlaying) {
                          stopAudio();
                          setTimeout(togglePlay, 100);
                        }
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-[#0071E3]/15 text-[#0071E3] dark:text-[#38BDF8] font-bold' 
                          : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2A2A2D]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate mr-2">
                        {isSelected && <Check className="w-3 h-3 shrink-0 text-[#0071E3] dark:text-[#38BDF8]" />}
                        <span className="truncate">{display}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#86868B] shrink-0">
                        {region}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Speed Rate Button */}
      <button
        type="button"
        onClick={handleRateChange}
        id="btn-tts-speed"
        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-[#E8E8ED] dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#D2D2D7] dark:hover:bg-[#48484A] transition-colors cursor-pointer"
        title="Velocidad de reproducción"
      >
        {rate}x
      </button>

      {/* Replay */}
      <button
        type="button"
        onClick={handleReset}
        id="btn-tts-reset"
        className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] transition-colors cursor-pointer"
        title="Reiniciar audio"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

    </div>
  );
};
