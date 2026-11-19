import React, { useState, useEffect } from 'react';
import { QrCode, Download } from 'lucide-react';
import { generateQrCodeAssets } from '../../services/advancedToolsEngine';

type QrMode = 'url' | 'wifi' | 'vcard' | 'text';

export const QrCodeTool: React.FC = () => {
  const [mode, setMode] = useState<QrMode>('url');
  const [urlValue, setUrlValue] = useState('https://mimage.netlify.app');
  const [textValue, setTextValue] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiSec, setWifiSec] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vName, setVName] = useState('');
  const [vOrg, setVOrg] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [darkColor, setDarkColor] = useState('#0f172a');
  const [lightColor, setLightColor] = useState('#ffffff');

  const [assets, setAssets] = useState<{ pngDataUrl: string; svgText: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buildPayload = (): string => {
    if (mode === 'url') return urlValue.trim();
    if (mode === 'text') return textValue;
    if (mode === 'wifi') {
      return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiSec === 'nopass' ? '' : wifiPass};;`;
    }
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${vName}`,
      vOrg ? `ORG:${vOrg}` : '',
      vPhone ? `TEL:${vPhone}` : '',
      vEmail ? `EMAIL:${vEmail}` : '',
      'END:VCARD'
    ]
      .filter(Boolean)
      .join('\n');
  };

  useEffect(() => {
    let active = true;
    const payload = buildPayload();
    if (!payload.trim()) {
      setAssets(null);
      return;
    }

    generateQrCodeAssets(payload, { width: 512, darkColor, lightColor, errorCorrectionLevel: 'M' })
      .then((res) => {
        if (active) {
          setAssets(res);
          setErrorMsg(null);
        }
      })
      .catch((err) => {
        if (active) setErrorMsg(err?.message || 'Could not encode QR payload.');
      });

    return () => {
      active = false;
    };
  }, [mode, urlValue, textValue, wifiSsid, wifiPass, wifiSec, vName, vOrg, vPhone, vEmail, darkColor, lightColor]);

  const downloadSvg = () => {
    if (!assets) return;
    const blob = new Blob([assets.svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimage-qr-${mode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-5">
        {/* Payload Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'url', label: 'Website URL' },
              { id: 'wifi', label: 'Wi-Fi Login' },
              { id: 'vcard', label: 'Contact Card (vCard)' },
              { id: 'text', label: 'Plain Text' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMode(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                mode === t.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 text-xs">
          {mode === 'url' && (
            <div>
              <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">Destination URL</label>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
          )}

          {mode === 'wifi' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="GuestWiFi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Security</label>
                <select
                  value={wifiSec}
                  onChange={(e) => setWifiSec(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open (No Password)</option>
                </select>
              </div>
              {wifiSec !== 'nopass' && (
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="Wi-Fi password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'vcard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Company / Org</label>
                <input
                  type="text"
                  value={vOrg}
                  onChange={(e) => setVOrg(e.target.value)}
                  placeholder="Mimage Studio"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone</label>
                <input
                  type="tel"
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                  placeholder="+1 555 0100"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>
          )}

          {mode === 'text' && (
            <div>
              <label className="font-semibold block mb-1.5">Plain Text Content</label>
              <textarea
                rows={4}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter note, serial code, or message..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2">
              <span className="font-semibold">Foreground:</span>
              <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            </label>
            <label className="flex items-center gap-2">
              <span className="font-semibold">Background:</span>
              <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            </label>
          </div>
        </div>
      </div>

      {/* Live QR Output */}
      <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center space-y-4">
        {errorMsg ? (
          <p className="text-xs text-rose-600">{errorMsg}</p>
        ) : assets ? (
          <>
            <img
              src={assets.pngDataUrl}
              alt="Generated QR code"
              className="w-56 h-56 rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-white"
            />
            <div className="flex flex-wrap justify-center gap-2.5">
              <a
                href={assets.pngDataUrl}
                download={`mimage-qr-${mode}.png`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </a>
              <button
                type="button"
                onClick={downloadSvg}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector SVG</span>
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 text-slate-400 space-y-2">
            <QrCode className="w-10 h-10 mx-auto" />
            <p className="text-xs">Enter details on the left to generate a crisp QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};
