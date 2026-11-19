import React, { useState } from 'react';
import { UploadCloud, Copy, Check, Code2 } from 'lucide-react';
import { formatFileSize } from '../../services/advancedToolsEngine';

export const ImageToBase64Tool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'datauri' | 'raw' | 'html' | 'css'>('datauri');
  const [copied, setCopied] = useState(false);

  const handleFile = (selected: File) => {
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => {
      setDataUri((reader.result as string) || '');
    };
    reader.readAsDataURL(selected);
  };

  const rawBase64 = dataUri.includes(',') ? dataUri.split(',')[1] : '';
  const outputText =
    activeTab === 'datauri'
      ? dataUri
      : activeTab === 'raw'
      ? rawBase64
      : activeTab === 'html'
      ? `<img src="${dataUri}" alt="${file?.name || 'embedded-image'}" />`
      : `.icon-asset {\n  background-image: url("${dataUri}");\n  background-size: contain;\n  background-repeat: no-repeat;\n}`;

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className="block rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-8 text-center cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
        <UploadCloud className="w-8 h-8 text-blue-600 dark:text-sky-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatFileSize(file.size)})` : 'Drop an image or icon to encode as Base64'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports PNG, JPG, WebP, GIF, SVG, and ICO · Processed offline via FileReader
        </p>
      </label>

      {dataUri && file && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
              Binary size: <strong>{formatFileSize(file.size)}</strong> · Base64 string length:{' '}
              <strong>{dataUri.length.toLocaleString()} chars</strong> (~33% Base64 encoding overhead)
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Snippet' : 'Copy Output'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'datauri', label: 'Full Data URI' },
                { id: 'raw', label: 'Raw Base64' },
                { id: 'html', label: 'HTML <img> Tag' },
                { id: 'css', label: 'CSS background-image' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
              <img src={dataUri} alt="Encoded preview" className="max-h-28 w-auto object-contain" />
              <span className="text-[11px] font-mono text-slate-500 mt-2 inline-flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                <span>{file.type || 'image'}</span>
              </span>
            </div>
            <textarea
              readOnly
              rows={6}
              value={outputText}
              className="md:col-span-9 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};
