import React, { useEffect, useRef, useState } from 'react';

export const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, width, height);

    const colStep = 22;
    const fontSize = 14;
    let columns = Math.ceil(width / colStep);

    const chars = '0101101001ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜXYZ0123456789';
    const toolKeywords = ['MIMAGE', 'WEBP', 'AVIF', 'PDF->PNG', 'EXIF_CLR', 'SVG_OPT', 'ZIP_PACK'];

    interface ColumnState {
      y: number;
      speed: number;
      word: string | null;
      wordIdx: number;
      isBright: boolean;
    }

    let columnStates: ColumnState[] = [];
    const initColumns = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / colStep);
      columnStates = Array.from({ length: columns }, () => ({
        y: Math.random() * -80,
        speed: 0.7 + Math.random() * 1.4,
        word: Math.random() < 0.04 ? toolKeywords[Math.floor(Math.random() * toolKeywords.length)] : null,
        wordIdx: 0,
        isBright: Math.random() < 0.2
      }));
    };

    initColumns();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initColumns, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();
    const frameInterval = 1000 / 36;
    ctx.font = `${fontSize}px "JetBrains Mono", Consolas, monospace`;

    const draw = (now: number) => {
      animationFrameId = requestAnimationFrame(draw);
      if (!isTabVisible) return;
      const elapsed = now - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = now - (elapsed % frameInterval);

      // Classic Matrix dark trail fade on #050807
      ctx.fillStyle = 'rgba(5, 8, 7, 0.14)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < columnStates.length; i++) {
        const col = columnStates[i];
        const x = i * colStep;
        const y = col.y * fontSize;

        let ch = '';
        if (col.word && col.wordIdx < col.word.length) {
          ch = col.word[col.wordIdx++];
        } else {
          ch = chars[Math.floor(Math.random() * chars.length)];
          if (Math.random() < 0.002) {
            col.word = toolKeywords[Math.floor(Math.random() * toolKeywords.length)];
            col.wordIdx = 0;
          }
        }

        ctx.fillStyle = col.isBright ? '#ecfdf5' : '#00ff66';
        ctx.fillText(ch, x, y);
        col.y += col.speed;

        if (y > height && Math.random() > 0.975) {
          col.y = 0;
          col.speed = 0.7 + Math.random() * 1.4;
          col.isBright = Math.random() < 0.2;
          col.word = Math.random() < 0.04 ? toolKeywords[Math.floor(Math.random() * toolKeywords.length)] : null;
          col.wordIdx = 0;
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-35"
    />
  );
};
