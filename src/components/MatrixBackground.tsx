import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sliders, Play, Pause, EyeOff, Zap, Palette, RefreshCw, Sparkles, Check } from 'lucide-react';

export type MatrixColorTheme =
  | 'emerald'
  | 'cyber-cyan'
  | 'neon-purple'
  | 'amber-gold'
  | 'ruby-crimson'
  | 'acid-lime'
  | 'ghost-white'
  | 'rainbow';

export interface MatrixThemeDefinition {
  id: MatrixColorTheme;
  name: string;
  dotColor: string;
  rainColor: string;
  leadColor: string;
  glowRgba: string;
  badgeBg: string;
}

export const MATRIX_THEMES: MatrixThemeDefinition[] = [
  {
    id: 'emerald',
    name: 'Classic Neo Green',
    dotColor: '#22c55e',
    rainColor: '#00ff66',
    leadColor: '#f0fdf4',
    glowRgba: 'rgba(0, 255, 102, 0.45)',
    badgeBg: 'bg-emerald-500'
  },
  {
    id: 'cyber-cyan',
    name: 'Electric Sky Cyan',
    dotColor: '#00f0ff',
    rainColor: '#38bdf8',
    leadColor: '#ffffff',
    glowRgba: 'rgba(0, 240, 255, 0.45)',
    badgeBg: 'bg-sky-400'
  },
  {
    id: 'neon-purple',
    name: 'Synthwave Purple',
    dotColor: '#c084fc',
    rainColor: '#d946ef',
    leadColor: '#fdf4ff',
    glowRgba: 'rgba(217, 70, 239, 0.45)',
    badgeBg: 'bg-purple-500'
  },
  {
    id: 'amber-gold',
    name: 'CRT Amber Phosphor',
    dotColor: '#fbbf24',
    rainColor: '#f59e0b',
    leadColor: '#fffbeb',
    glowRgba: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'bg-amber-400'
  },
  {
    id: 'ruby-crimson',
    name: 'Hacker Crimson Red',
    dotColor: '#f43f5e',
    rainColor: '#ff2a5f',
    leadColor: '#fff1f2',
    glowRgba: 'rgba(255, 42, 95, 0.45)',
    badgeBg: 'bg-rose-500'
  },
  {
    id: 'acid-lime',
    name: 'Toxic Acid Lime',
    dotColor: '#a3e635',
    rainColor: '#84cc16',
    leadColor: '#f7fee7',
    glowRgba: 'rgba(163, 230, 53, 0.45)',
    badgeBg: 'bg-lime-400'
  },
  {
    id: 'ghost-white',
    name: 'Cyber Ghost White',
    dotColor: '#e2e8f0',
    rainColor: '#94a3b8',
    leadColor: '#ffffff',
    glowRgba: 'rgba(255, 255, 255, 0.4)',
    badgeBg: 'bg-slate-200'
  },
  {
    id: 'rainbow',
    name: 'Chromatic Rainbow',
    dotColor: '#ec4899',
    rainColor: 'multi',
    leadColor: '#ffffff',
    glowRgba: 'rgba(236, 72, 153, 0.5)',
    badgeBg: 'bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400'
  }
];

interface MatrixBackgroundProps {
  speedMultiplier?: number;
  opacity?: number;
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
  speedMultiplier = 1.0,
  opacity: initialOpacity = 0.42
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistent settings from localStorage
  const [currentTheme, setCurrentTheme] = useState<MatrixColorTheme>(() => {
    return (localStorage.getItem('matrix_rain_theme') as MatrixColorTheme) || 'emerald';
  });
  const [opacity, setOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('matrix_rain_opacity');
    return saved ? parseFloat(saved) : initialOpacity;
  });
  const [speed, setSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('matrix_rain_speed');
    return saved ? parseFloat(saved) : speedMultiplier;
  });

  const [isEnabled, setIsEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'ultra-fluid' | 'balanced' | 'saver'>('ultra-fluid');

  const activeThemeDef = MATRIX_THEMES.find((t) => t.id === currentTheme) || MATRIX_THEMES[0];

  const handleSelectTheme = (themeId: MatrixColorTheme) => {
    setCurrentTheme(themeId);
    localStorage.setItem('matrix_rain_theme', themeId);
  };

  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    localStorage.setItem('matrix_rain_opacity', val.toString());
  };

  const handleSpeedChange = (val: number) => {
    setSpeed(val);
    localStorage.setItem('matrix_rain_speed', val.toString());
  };

  useEffect(() => {
    // Respect OS reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPaused(true);
    }

    // Global event listener so any UI button can trigger theme change
    const onExternalTheme = (e: any) => {
      if (e.detail && e.detail.theme) {
        handleSelectTheme(e.detail.theme);
      }
    };
    window.addEventListener('matrix-theme-switch', onExternalTheme);
    return () => window.removeEventListener('matrix-theme-switch', onExternalTheme);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: true for seamless compositing over CSS backgrounds
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initial fill to avoid flash
    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, width, height);

    // Dynamic column step: 18px delivers dense, authentic digital rain
    const colStep = 18;
    const fontSize = 14;
    let columns = Math.ceil(width / colStep);

    // Authentic Katakana + binary + hex glyph sequence
    const chars = '0101101001ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜXYZ0123456789Δλπ';
    const toolKeywords = [
      'PDF->TEXT',
      'PDF->PNG',
      'EXIF_STRIP',
      'ALPHA_PNG',
      'CROP_PDF',
      'ZERO_UPLOAD',
      'MATRIXCONVERT',
      '300_DPI',
      'WASM_LOCAL'
    ];

    interface FastColumn {
      y: number;
      speed: number;
      word: string | null;
      wordIdx: number;
      isBright: boolean;
      hue: number; // For chromatic rainbow mode
    }

    let columnStates: FastColumn[] = [];

    const initColumns = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / colStep);
      columnStates = new Array(columns);

      for (let i = 0; i < columns; i++) {
        const hasWord = Math.random() < 0.04;
        columnStates[i] = {
          y: Math.random() * -100,
          speed: 1.0 + Math.random() * 2.0,
          word: hasWord ? toolKeywords[Math.floor(Math.random() * toolKeywords.length)] : null,
          wordIdx: 0,
          isBright: Math.random() < 0.18,
          hue: Math.floor((i / columns) * 360)
        };
      }
    };

    initColumns();

    let resizeTimer: any = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initColumns();
      }, 120);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();
    const targetFps = performanceMode === 'ultra-fluid' ? 60 : performanceMode === 'balanced' ? 30 : 15;
    const frameInterval = 1000 / targetFps;

    ctx.font = `${fontSize}px "JetBrains Mono", Consolas, monospace`;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (isPaused || !isTabVisible) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = currentTime - (elapsed % frameInterval);

      // Smooth trailing fade
      ctx.fillStyle = 'rgba(5, 8, 7, 0.13)';
      ctx.fillRect(0, 0, width, height);

      const effectiveSpeed = speed;

      for (let i = 0; i < columnStates.length; i++) {
        const col = columnStates[i];
        const x = i * colStep;
        const y = col.y * fontSize;

        let charToRender = '';

        if (col.word && col.wordIdx < col.word.length) {
          charToRender = col.word[col.wordIdx++];
        } else {
          charToRender = chars[Math.floor(Math.random() * chars.length)];
          if (Math.random() < 0.002) {
            col.word = toolKeywords[Math.floor(Math.random() * toolKeywords.length)];
            col.wordIdx = 0;
          }
        }

        // Color selection based on selected theme
        if (activeThemeDef.id === 'rainbow') {
          if (col.isBright) {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = `hsl(${col.hue}, 90%, 60%)`;
          }
        } else {
          if (col.isBright) {
            ctx.fillStyle = activeThemeDef.leadColor;
          } else {
            ctx.fillStyle = activeThemeDef.rainColor;
          }
        }

        ctx.fillText(charToRender, x, y);

        // Advance column
        col.y += col.speed * effectiveSpeed;

        // Reset once fallen off-screen
        if (y > height && Math.random() > 0.975) {
          col.y = 0;
          col.speed = 1.0 + Math.random() * 2.0;
          col.isBright = Math.random() < 0.18;
          const hasWord = Math.random() < 0.04;
          col.word = hasWord ? toolKeywords[Math.floor(Math.random() * toolKeywords.length)] : null;
          col.wordIdx = 0;
          col.hue = (col.hue + 25) % 360;
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(resizeTimer);
    };
  }, [isEnabled, isPaused, performanceMode, speed, currentTheme]);

  return (
    <>
      {isEnabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 hardware-accelerated"
          style={{
            opacity: opacity,
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />
      )}

      {/* Floating Matrix Theme Switcher & Fluidity Controls in Bottom-Right */}
      <div className="fixed bottom-4 right-4 z-40 font-sans">
        {showControls ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-400/40 bg-[#061014]/95 p-4 shadow-2xl backdrop-blur-xl text-xs text-slate-200 w-72 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-sky-400/20">
              <span className="text-white font-bold flex items-center gap-2 text-xs">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Matrix Theme & FX Engine</span>
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
                title="Close controls"
              >
                ✕
              </button>
            </div>

            {/* 8 Color Themes Palette Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-bold">Rain Color Theme:</span>
                <span className="text-[10px] text-sky-400 font-bold">{activeThemeDef.name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {MATRIX_THEMES.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-white ring-2 ring-sky-400/80 scale-105 shadow-md'
                          : 'border-slate-700/60 hover:border-slate-400 opacity-80 hover:opacity-100'
                      } ${theme.badgeBg}`}
                      title={theme.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-slate-950 font-black stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opacity / Brightness Slider */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Rain Visibility / Glow:</span>
                <span className="text-sky-400 font-bold">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.85"
                step="0.05"
                value={opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rain Speed Slider */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Fall Speed:</span>
                <span className="text-sky-400 font-bold">{speed.toFixed(1)}x</span>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: '0.6x Slow', val: 0.6 },
                  { label: '1.0x Normal', val: 1.0 },
                  { label: '1.6x Fast', val: 1.6 },
                  { label: '2.4x Hyper', val: 2.4 }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSpeedChange(s.val)}
                    className={`flex-1 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                      speed === s.val
                        ? 'bg-sky-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions (Pause, Enable, Performance) */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-400/30 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 cursor-pointer transition-colors"
              >
                {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                  isEnabled ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isEnabled ? 'Rain: ON' : 'Rain: OFF'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-2 rounded-full border border-sky-400/50 bg-[#061014]/90 px-3.5 py-2 font-mono text-[11px] text-sky-200 shadow-xl backdrop-blur-md hover:bg-sky-950 hover:border-sky-300 hover:text-white transition-all cursor-pointer group"
            title="Configure Matrix background theme and colors"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${activeThemeDef.badgeBg} animate-pulse shadow-sm`}
            />
            <span className="font-bold">Matrix Theme: {activeThemeDef.name.split(' ')[0]}</span>
            <Palette className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-45 transition-transform" />
          </button>
        )}
      </div>
    </>
  );
};
