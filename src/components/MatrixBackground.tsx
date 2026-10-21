import React, { useEffect, useRef, useState } from 'react';
import { Sliders, Play, Pause, Eye } from 'lucide-react';

interface MatrixBackgroundProps {
  speedMultiplier?: number;
  opacity?: number;
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
  speedMultiplier = 1.0,
  opacity = 0.28
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [intensity, setIntensity] = useState<'subtle' | 'vibrant'>('subtle');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initColumns();
    };

    window.addEventListener('resize', handleResize);

    // Characters palette: numbers, hex, katakana glyphs
    const chars = '01234567890101100101010111010010101ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0x7F0xFF0x1A';
    // Tool and page names falling down as requested by the user
    const toolWords = [
      'PDF->PNG',
      'PDF->SVG',
      'PNG->WEBP',
      'JPG->PNG',
      'SVG->PNG',
      'MATRIXCONVERT',
      '0x89PNG',
      'VECTOR_SVG',
      'PDF_RASTER',
      'FAVICON_ICO',
      'LOSSLESS_300DPI',
      'CLIENT_SIDE',
      'ZERO_UPLOAD',
      'WEBP_NEXTGEN',
      'EXIF_STRIP'
    ];

    const fontSize = 14;
    let columns = Math.floor(width / fontSize);

    interface ColumnState {
      y: number;
      speed: number;
      word: string | null;
      wordIndex: number;
      charsLeftInWord: number;
      glowIntensity: number;
    }

    let columnStates: ColumnState[] = [];

    const initColumns = () => {
      columns = Math.floor(width / fontSize);
      columnStates = [];
      for (let i = 0; i < columns; i++) {
        const hasWord = Math.random() < 0.08;
        const randomWord = hasWord ? toolWords[Math.floor(Math.random() * toolWords.length)] : null;
        columnStates.push({
          y: Math.random() * -100,
          speed: 1 + Math.random() * 2,
          word: randomWord,
          wordIndex: 0,
          charsLeftInWord: randomWord ? randomWord.length : 0,
          glowIntensity: Math.random() > 0.85 ? 1.0 : 0.6
        });
      }
    };

    initColumns();

    let lastTime = performance.now();

    const speedFactors = {
      slow: 0.6,
      normal: 1.0,
      fast: 1.8
    };

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (isPaused) return;

      const elapsed = currentTime - lastTime;
      const targetFps = 30; // Smooth 30-40 fps to maintain minimal CPU usage
      const interval = 1000 / targetFps;

      if (elapsed < interval) return;
      lastTime = currentTime - (elapsed % interval);

      // Semi-transparent fade to leave glowing trail
      ctx.fillStyle = intensity === 'vibrant' ? 'rgba(5, 8, 7, 0.12)' : 'rgba(5, 8, 7, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      const currentSpeedFactor = speedFactors[speed] * speedMultiplier;

      for (let i = 0; i < columnStates.length; i++) {
        const col = columnStates[i];
        const x = i * fontSize;
        const y = col.y * fontSize;

        let charToRender = '';

        // If currently outputting a tool/page name vertically
        if (col.word && col.wordIndex < col.word.length) {
          charToRender = col.word[col.wordIndex];
          col.wordIndex++;
        } else {
          charToRender = chars[Math.floor(Math.random() * chars.length)];
          // Occasionally trigger a new falling tool name
          if (Math.random() < 0.005) {
            col.word = toolWords[Math.floor(Math.random() * toolWords.length)];
            col.wordIndex = 0;
          }
        }

        // Head glyph glows bright phosphor white/cyan
        const isHead = true;
        if (isHead) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = intensity === 'vibrant' ? 12 : 6;
        } else {
          ctx.fillStyle = '#00ff66';
          ctx.shadowBlur = 0;
        }

        ctx.fillText(charToRender, x, y);

        // Reset shadow
        ctx.shadowBlur = 0;

        // Advance column
        col.y += col.speed * currentSpeedFactor;

        // Reset to top once off-screen
        if (col.y * fontSize > height && Math.random() > 0.975) {
          col.y = 0;
          col.speed = 1 + Math.random() * 2;
          const hasWord = Math.random() < 0.08;
          col.word = hasWord ? toolWords[Math.floor(Math.random() * toolWords.length)] : null;
          col.wordIndex = 0;
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPaused, speed, intensity, speedMultiplier]);

  const effectiveOpacity = intensity === 'vibrant' ? Math.min(1, opacity * 1.5) : opacity;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
        style={{ opacity: effectiveOpacity }}
      />

      {/* Floating subtle Matrix controls in bottom-right */}
      <div className="fixed bottom-4 right-4 z-40">
        {showControls ? (
          <div className="flex flex-col gap-2 rounded-lg border border-[#00ff66]/30 bg-[#060b08]/90 p-3 shadow-xl backdrop-blur-md text-xs text-[#a3c2b2] w-56">
            <div className="flex items-center justify-between pb-1 border-b border-[#00ff66]/20">
              <span className="font-mono text-[#00ff66] font-semibold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00ff66]" />
                Matrix Rain Engine
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-neutral-400 hover:text-white px-1"
                title="Close controls"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 pt-1 font-mono">
              <div className="flex items-center justify-between">
                <span>Motion:</span>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66] hover:bg-[#00ff66]/20 transition-colors"
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Speed:</span>
                <div className="flex gap-1">
                  {(['slow', 'normal', 'fast'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase transition-colors ${
                        speed === s
                          ? 'bg-[#00ff66] text-black font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Vibe:</span>
                <div className="flex gap-1">
                  {(['subtle', 'vibrant'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setIntensity(v)}
                      className={`px-1.5 py-0.5 rounded text-[10px] capitalize transition-colors ${
                        intensity === v
                          ? 'bg-[#00ff66] text-black font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1.5 rounded-full border border-[#00ff66]/30 bg-[#060b08]/80 px-3 py-1.5 font-mono text-[11px] text-[#00ff66] shadow-lg backdrop-blur-md hover:bg-[#00ff66]/10 hover:border-[#00ff66]/60 transition-all cursor-pointer"
            title="Configure Matrix digital rain effect"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>Matrix FX</span>
          </button>
        )}
      </div>
    </>
  );
};
