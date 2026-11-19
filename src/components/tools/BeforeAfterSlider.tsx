import React, { useState } from 'react';
import { formatFileSize } from '../../services/advancedToolsEngine';

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalSize?: number;
  processedSize?: number;
  originalLabel?: string;
  processedLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  originalLabel = 'Original',
  processedLabel = 'Processed'
}) => {
  const [position, setPosition] = useState(50);

  const deltaPercent =
    originalSize && processedSize !== undefined && originalSize > 0
      ? Math.round(((originalSize - processedSize) / originalSize) * 100)
      : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-3 tabular-nums">
          <span>
            <strong className="text-slate-900 dark:text-white">{originalLabel}:</strong>{' '}
            {originalSize ? formatFileSize(originalSize) : 'Loaded'}
          </span>
          <span className="text-slate-400">·</span>
          <span>
            <strong className="text-blue-600 dark:text-sky-400">{processedLabel}:</strong>{' '}
            {processedSize ? formatFileSize(processedSize) : 'Ready'}
          </span>
          {deltaPercent !== null && (
            <>
              <span className="text-slate-400">·</span>
              <span
                className={`font-semibold ${
                  deltaPercent >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {deltaPercent >= 0 ? `-${deltaPercent}% smaller` : `+${Math.abs(deltaPercent)}% larger`}
              </span>
            </>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          Split: {position}%
        </span>
      </div>

      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] dark:bg-slate-950 bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] select-none">
        <img
          src={processedUrl}
          alt={processedLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={originalUrl}
            alt={originalLabel}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Vertical divider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-sky-400 shadow-sm pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-sky-400 flex items-center justify-center shadow text-[10px] font-bold text-blue-600 dark:text-sky-300">
            ↔
          </div>
        </div>

        {/* Corner labels */}
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[11px] font-medium pointer-events-none">
          {originalLabel}
        </span>
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-blue-600/90 text-white text-[11px] font-medium pointer-events-none">
          {processedLabel}
        </span>

        {/* Interactive accessible range overlay */}
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Before and after image comparison slider"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
};
