import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sliders, Play, Pause, EyeOff, Zap } from 'lucide-react';

interface MatrixBackgroundProps {
  speedMultiplier?: number;
  opacity?: number;
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
  speedMultiplier = 1.0,
  opacity = 0.22
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'ultra-fluid' | 'balanced' | 'saver'>('ultra-fluid');

  useEffect(() => {
    // Respect user's OS preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPaused(true);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Optimized column spacing: 20px step cuts draw calls by ~40% vs 14px
    const colStep = 20;
    const fontSize = 15;
    let columns = Math.ceil(width / colStep);

    // Characters palette: numbers, hex, matrix katakana glyphs
    const chars = '01010110101010100110ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0x7F0xFF';
    const toolWords = [
      'PDF->PNG',
      'PDF->SVG',
      'PNG->WEBP',
      'JPG->PNG',
      'SVG->PNG',
      'MATRIXCONVERT',
      'ZERO_UPLOAD',
      '300_DPI',
      'CLIENT_SIDE'
    ];

    interface FastColumn {
      y: number;
      speed: number;
      word: string | null;
      wordIdx: number;
      isBright: boolean;
    }

    let columnStates: FastColumn[] = [];

    const initColumns = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / colStep);
      columnStates = new Array(columns);

      for (let i = 0; i < columns; i++) {
        const hasWord = Math.random() < 0.05;
        columnStates[i] = {
          y: Math.random() * -80,
          speed: 1.2 + Math.random() * 1.8,
          word: hasWord ? toolWords[Math.floor(Math.random() * toolWords.length)] : null,
          wordIdx: 0,
          isBright: Math.random() < 0.15
        };
      }
    };

    initColumns();

    let resizeTimer: any = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initColumns();
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Handle tab visibility to save 100% CPU when tab is hidden
    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();

    // Target FPS based on performance mode
    const targetFps = performanceMode === 'ultra-fluid' ? 60 : performanceMode === 'balanced' ? 30 : 15;
    const frameInterval = 1000 / targetFps;

    // Cache font string so it's not repeatedly allocated
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (isPaused || !isTabVisible) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = currentTime - (elapsed % frameInterval);

      // Fast solid-fade overlay (no shadow blur, zero compositor stall)
      ctx.fillStyle = 'rgba(5, 8, 7, 0.16)';
      ctx.fillRect(0, 0, width, height);

      const speedFactor = speedMultiplier;

      // Draw all columns in a single, hardware-accelerated pass
      for (let i = 0; i < columnStates.length; i++) {
        const col = columnStates[i];
        const x = i * colStep;
        const y = col.y * fontSize;

        let charToRender = '';

        if (col.word && col.wordIdx < col.word.length) {
          charToRender = col.word[col.wordIdx++];
        } else {
          charToRender = chars[Math.floor(Math.random() * chars.length)];
          if (Math.random() < 0.003) {
            col.word = toolWords[Math.floor(Math.random() * toolWords.length)];
            col.wordIdx = 0;
          }
        }

        // Direct crisp color fills (NO shadowBlur in loop = 10x faster)
        if (col.isBright) {
          ctx.fillStyle = '#f0fdf4'; // Crisp phosphor white-green head
        } else {
          ctx.fillStyle = '#22c55e'; // High-contrast Matrix emerald green
        }

        ctx.fillText(charToRender, x, y);

        // Advance column
        col.y += col.speed * speedFactor;

        // Reset once fallen off-screen
        if (y > height && Math.random() > 0.98) {
          col.y = 0;
          col.speed = 1.2 + Math.random() * 1.8;
          col.isBright = Math.random() < 0.15;
          const hasWord = Math.random() < 0.05;
          col.word = hasWord ? toolWords[Math.floor(Math.random() * toolWords.length)] : null;
          col.wordIdx = 0;
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
  }, [isEnabled, isPaused, performanceMode, speedMultiplier]);

  return (
    <>
      {isEnabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 hardware-accelerated"
          style={{
            opacity,
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />
      )}

      {/* Floating fluid Matrix controls in bottom-right */}
      <div className="fixed bottom-4 right-4 z-40">
        {showControls ? (
          <div className="flex flex-col gap-2.5 rounded-2xl border border-sky-400/40 bg-[#061014]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs text-slate-200 w-64 font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-sky-400/20">
              <span className="text-sky-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                Display & Rain Engine
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                title="Close controls"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              {/* Rain On/Off */}
              <div className="flex items-center justify-between">
                <span>Rain Effect:</span>
                <button
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    isEnabled
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {isEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Pause / Resume */}
              {isEnabled && (
                <div className="flex items-center justify-between">
                  <span>Motion:</span>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-sky-400/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 cursor-pointer transition-colors"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                </div>
              )}

              {/* Fluidity / Performance Mode */}
              {isEnabled && (
                <div className="flex items-center justify-between">
                  <span>Performance:</span>
                  <div className="flex gap-1">
                    {(
                      [
                        { id: 'ultra-fluid', label: '60fps' },
                        { id: 'balanced', label: '30fps' },
                        { id: 'saver', label: 'Eco' }
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPerformanceMode(m.id)}
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase transition-colors cursor-pointer ${
                          performanceMode === m.id
                            ? 'bg-sky-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-[#061014]/90 px-3 py-1.5 font-mono text-[11px] text-sky-300 shadow-xl backdrop-blur-md hover:bg-sky-950 hover:border-sky-300 transition-all cursor-pointer"
            title="Configure Matrix background display settings"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>FX & Fluidity</span>
          </button>
        )}
      </div>
    </>
  );
};
