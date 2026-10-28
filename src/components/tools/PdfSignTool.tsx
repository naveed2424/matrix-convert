import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Download,
  PenTool,
  Type,
  Image as ImageIcon,
  CheckCircle,
  X,
  Calendar,
  Move,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { stampPdfSignature, renderPdfThumbnails } from '../../services/pdfAdvancedEngine';

interface PdfSignToolProps {
  onBack: () => void;
}

export const PdfSignTool: React.FC<PdfSignToolProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; dataUrl: string; width: number; height: number }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Signature creation modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw' | 'image'>('type');
  const [typedName, setTypedName] = useState('Jane Appleseed');
  const [selectedFontStyle, setSelectedFontStyle] = useState<number>(0);
  const [signatureColor, setSignatureColor] = useState('#0f172a'); // Black/navy

  // Active placed signature stamp on document
  const [placedStamp, setPlacedStamp] = useState<{
    pageNumber: number;
    dataUrl: string;
    xPercent: number; // 0 - 100
    yPercent: number; // 0 - 100
    widthPercent: number; // 0 - 100
    heightPercent: number; // 0 - 100
  } | null>(null);

  const [dateStamp, setDateStamp] = useState<string>(new Date().toISOString().split('T')[0]);
  const [includeDateStamp, setIncludeDateStamp] = useState(false);

  // State for dragging signature on the page preview
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [exportCompleteUrl, setExportCompleteUrl] = useState<string | null>(null);

  // Drawing canvas refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  // Cursive handwriting fonts for "Type signature"
  const HANDWRITING_STYLES = [
    { name: 'Cursive Elegant', font: 'font-[Dancing_Script,cursive]', style: 'italic' },
    { name: 'Executive Script', font: 'font-[Caveat,cursive]', style: 'normal' },
    { name: 'Fluid Fountain', font: 'font-[Pacifico,cursive]', style: 'normal' },
    { name: 'Signature Casual', font: 'font-[Shadows_Into_Light,cursive]', style: 'italic' },
    { name: 'Legal Standard', font: 'font-[Great_Vibes,cursive]', style: 'normal' }
  ];

  // Handle PDF file select
  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setPlacedStamp(null);
    setExportCompleteUrl(null);
    try {
      const rendered = await renderPdfThumbnails(selectedFile, 30, 1.2);
      setPages(rendered);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      alert('Could not render PDF. Please ensure file is a valid PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert typed cursive name to PNG data URL
  const generateTypedSignaturePng = (text: string, fontIndex: number, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fonts = [
      'italic 56px "Brush Script MT", "Caveat", "Dancing Script", cursive',
      '52px "Caveat", "Segoe Script", cursive',
      '48px "Pacifico", "Comic Sans MS", cursive',
      'italic 46px "Lucida Handwriting", cursive',
      '54px "Snell Roundhand", "Apple Chancery", cursive'
    ];

    ctx.font = fonts[fontIndex] || fonts[0];
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'Jane Appleseed', canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  // Setup drawing canvas
  useEffect(() => {
    if (isSignatureModalOpen && signatureMode === 'draw' && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = signatureColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isSignatureModalOpen, signatureMode, signatureColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Upload custom signature image
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          placeSignatureOnPage(event.target.result as string);
          setIsSignatureModalOpen(false);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Save signature from modal and place on document
  const handleSaveSignature = () => {
    let signatureDataUrl = '';
    if (signatureMode === 'type') {
      signatureDataUrl = generateTypedSignaturePng(typedName, selectedFontStyle, signatureColor);
    } else if (signatureMode === 'draw') {
      const canvas = drawCanvasRef.current;
      if (canvas) {
        signatureDataUrl = canvas.toDataURL('image/png');
      }
    }

    if (signatureDataUrl) {
      placeSignatureOnPage(signatureDataUrl);
    }
    setIsSignatureModalOpen(false);
  };

  const placeSignatureOnPage = (dataUrl: string) => {
    setPlacedStamp({
      pageNumber: currentPage,
      dataUrl,
      xPercent: 35,
      yPercent: 75,
      widthPercent: 30,
      heightPercent: 12
    });
  };

  // Mouse drag handler for moving signature on preview
  const handleMouseDownOnStamp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMoveOnPage = (e: React.MouseEvent) => {
    if (!isDragging || !placedStamp || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    setPlacedStamp((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        xPercent: Math.max(0, Math.min(100 - prev.widthPercent, prev.xPercent + deltaX)),
        yPercent: Math.max(0, Math.min(100 - prev.heightPercent, prev.yPercent + deltaY))
      };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Execute export: Stamping signature onto PDF with pdf-lib
  const handleExportSignedPdf = async () => {
    if (!file || !placedStamp) return;
    setIsExporting(true);
    try {
      const extraText = includeDateStamp
        ? [
            {
              pageNumber: placedStamp.pageNumber,
              text: `Signed on: ${dateStamp}`,
              xPercent: placedStamp.xPercent,
              yPercent: placedStamp.yPercent + placedStamp.heightPercent + 2,
              fontSize: 10
            }
          ]
        : undefined;

      const signedBlob = await stampPdfSignature(file, [placedStamp], extraText);
      const downloadUrl = URL.createObjectURL(signedBlob);
      setExportCompleteUrl(downloadUrl);

      // Trigger instant download
      const link = document.createElement('a');
      link.href = downloadUrl;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-signed.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Signing failed:', err);
      alert(`Could not sign PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const activePageData = pages.find((p) => p.pageNumber === currentPage);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" onMouseMove={handleMouseMoveOnPage} onMouseUp={handleMouseUp}>
      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-mono text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 border border-sky-400/30 text-sky-300">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>100% Client-Side Private E-Signature</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-sky-400/30 bg-[#06141c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>Fill & Sign PDF</span>
            <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Free & Secure
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Add a legally formatted cursive, drawn, or uploaded signature directly onto any PDF page. No account, no
            cloud uploads, 100% browser-based.
          </p>
        </div>

        {/* Step 1: Upload file if none */}
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-sky-400/40 hover:border-sky-300 rounded-2xl p-12 text-center bg-sky-950/20 transition-all cursor-pointer group"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/pdf';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files?.[0]) handleFile(target.files[0]);
              };
              input.click();
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Choose PDF file to sign</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">or drag and drop your PDF here</p>
            <button className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-mono text-sm font-bold text-white transition-all shadow-lg cursor-pointer">
              Select PDF Document
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-sky-300">Rendering PDF pages in browser sandbox...</p>
          </div>
        )}

        {/* Step 2: Interactive PDF Sign Workspace */}
        {file && !isLoading && pages.length > 0 && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{placedStamp ? 'Change / Add Signature' : '+ Create Signature'}</span>
                </button>

                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-400/30 bg-sky-950/40 text-xs font-mono text-sky-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDateStamp}
                    onChange={(e) => setIncludeDateStamp(e.target.checked)}
                    className="accent-sky-400"
                  />
                  <Calendar className="w-3 h-3 text-sky-400" />
                  <span>Include Date ({dateStamp})</span>
                </label>
              </div>

              {/* Page Selector & Navigation */}
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <span>Page</span>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-sky-400/30 disabled:opacity-40 hover:bg-sky-500/20 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-white px-1">
                  {currentPage} of {pages.length}
                </span>
                <button
                  disabled={currentPage >= pages.length}
                  onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                  className="p-1.5 rounded-lg border border-sky-400/30 disabled:opacity-40 hover:bg-sky-500/20 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Export Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  Change File
                </button>
                <button
                  disabled={!placedStamp || isExporting}
                  onClick={handleExportSignedPdf}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Embedding Signature...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document Canvas Preview Area */}
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
              {/* Main Active Page View */}
              <div className="w-full flex justify-center overflow-x-auto p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div
                  ref={pageContainerRef}
                  className="relative select-none shadow-2xl border border-slate-700 bg-white"
                  style={{
                    maxWidth: '100%',
                    width: activePageData ? `${activePageData.width}px` : '600px'
                  }}
                >
                  {activePageData && (
                    <img
                      src={activePageData.dataUrl}
                      alt={`Page ${currentPage}`}
                      className="w-full h-auto block pointer-events-none"
                    />
                  )}

                  {/* Render Placed Signature Overlay if on current page */}
                  {placedStamp && placedStamp.pageNumber === currentPage && (
                    <div
                      onMouseDown={handleMouseDownOnStamp}
                      style={{
                        position: 'absolute',
                        left: `${placedStamp.xPercent}%`,
                        top: `${placedStamp.yPercent}%`,
                        width: `${placedStamp.widthPercent}%`,
                        height: `${placedStamp.heightPercent}%`
                      }}
                      className={`cursor-move border-2 border-dashed border-sky-400 bg-sky-500/10 p-1 flex items-center justify-center group ${
                        isDragging ? 'opacity-80 scale-105' : ''
                      }`}
                    >
                      <img
                        src={placedStamp.dataUrl}
                        alt="Signature Stamp"
                        className="w-full h-full object-contain pointer-events-none"
                      />

                      {/* Signature Controls Badge */}
                      <div className="absolute -top-7 left-0 flex items-center gap-1 bg-[#06141c] border border-sky-400 px-2 py-0.5 rounded text-[10px] font-mono text-sky-300">
                        <Move className="w-2.5 h-2.5" />
                        <span>Drag to Place</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlacedStamp(null);
                          }}
                          className="text-red-400 hover:text-red-300 ml-1.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Resize width handle */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const initialW = placedStamp.widthPercent;
                          const onMove = (mvEvt: MouseEvent) => {
                            if (!pageContainerRef.current) return;
                            const rect = pageContainerRef.current.getBoundingClientRect();
                            const deltaW = ((mvEvt.clientX - startX) / rect.width) * 100;
                            setPlacedStamp((prev) =>
                              prev ? { ...prev, widthPercent: Math.max(10, Math.min(80, initialW + deltaW)) } : null
                            );
                          };
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-sky-400 border border-white rounded-full cursor-se-resize shadow"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Thumbnails & Instructions */}
              <div className="w-full lg:w-72 shrink-0 space-y-4">
                <div className="p-4 rounded-xl border border-sky-400/20 bg-sky-950/20 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>How to Sign</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1.5 leading-relaxed">
                    <li>Click <strong>+ Create Signature</strong></li>
                    <li>Type, draw, or upload your autograph</li>
                    <li>Drag the signature box to your desired spot</li>
                    <li>Click <strong>Download Signed PDF</strong></li>
                  </ol>
                </div>

                {/* Page Navigation Thumbnails */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 max-h-96 overflow-y-auto space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block px-1">Pages Overview</span>
                  <div className="grid grid-cols-2 gap-2">
                    {pages.map((p) => (
                      <button
                        key={p.pageNumber}
                        onClick={() => setCurrentPage(p.pageNumber)}
                        className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                          currentPage === p.pageNumber
                            ? 'border-sky-400 bg-sky-500/20 shadow-md'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                        }`}
                      >
                        <img src={p.dataUrl} alt={`Thumbnail ${p.pageNumber}`} className="w-full h-auto rounded mb-1" />
                        <span className="text-[10px] font-mono text-slate-400 block text-center">Page {p.pageNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Creation Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-sky-400/40 bg-[#06141c] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-sky-400/20 mb-4">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Create Signature</h3>
              </div>
              <button
                onClick={() => setIsSignatureModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs: Type, Draw, Image (Matches Sejda exactly) */}
            <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setSignatureMode('type')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  signatureMode === 'type' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Type</span>
              </button>
              <button
                onClick={() => setSignatureMode('draw')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  signatureMode === 'draw' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw</span>
              </button>
              <button
                onClick={() => setSignatureMode('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  signatureMode === 'image' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>
            </div>

            {/* Color Chooser */}
            <div className="flex items-center gap-3 mb-4 text-xs font-mono text-slate-300">
              <span>Ink Color:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Black', hex: '#0f172a' },
                  { label: 'Navy Blue', hex: '#1e3a8a' },
                  { label: 'Royal Blue', hex: '#2563eb' }
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSignatureColor(c.hex)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      signatureColor === c.hex ? 'scale-110 border-sky-400 shadow' : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Mode 1: TYPE SIGNATURE */}
            {signatureMode === 'type' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your name or initials..."
                  className="w-full px-4 py-2.5 rounded-xl border border-sky-400/40 bg-slate-900 text-white text-sm focus:outline-none focus:border-sky-400"
                />

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Select Handwriting Style</span>
                  {HANDWRITING_STYLES.map((style, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFontStyle(idx)}
                      className={`w-full p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedFontStyle === idx
                          ? 'border-sky-400 bg-sky-500/10 shadow-md'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span
                        className="text-2xl block"
                        style={{
                          color: signatureColor,
                          fontFamily: idx === 0 ? 'Dancing Script, cursive' : idx === 1 ? 'Caveat, cursive' : idx === 2 ? 'Pacifico, cursive' : idx === 3 ? 'Brush Script MT, cursive' : 'Great Vibes, cursive',
                          fontStyle: style.style as any
                        }}
                      >
                        {typedName || 'Jane Appleseed'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: DRAW SIGNATURE */}
            {signatureMode === 'draw' && (
              <div className="space-y-3">
                <div className="border border-slate-700 rounded-xl bg-white p-2">
                  <canvas
                    ref={drawCanvasRef}
                    width={520}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-44 cursor-crosshair touch-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Draw with your mouse, trackpad, or finger.</span>
                  <button
                    onClick={clearDrawing}
                    className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-300 cursor-pointer"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: UPLOAD SIGNATURE IMAGE */}
            {signatureMode === 'image' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-sky-400/40 rounded-xl p-8 text-center bg-slate-900/50">
                  <ImageIcon className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 mb-3">Upload a photo of your signature (PNG or JPG)</p>
                  <label className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold transition-all cursor-pointer inline-block">
                    Browse Signature Image
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleSignatureImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            {signatureMode !== 'image' && (
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800 mt-5">
                <button
                  onClick={() => setIsSignatureModalOpen(false)}
                  className="px-4 py-2 font-mono text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSignature}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  Save & Place on Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
