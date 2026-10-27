import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Smartphone, Monitor, ExternalLink, Copy, CheckCircle2, Sparkles, ShieldCheck, Zap, ArrowRight, Share2, Heart, MessageSquare } from 'lucide-react';

interface UgcPromoVideoProps {
  onBackToApp: () => void;
}

interface UgcScene {
  id: number;
  duration: number; // in seconds
  title: string;
  hook: string;
  narration: string;
  caption: string;
  tagline: string;
  badge: string;
  bgGradient: string;
  visualType: 'security-alert' | 'matrix-terminal' | 'pdf-rasterizer' | 'vector-compression' | 'cta-final';
}

const UGC_SCENES: UgcScene[] = [
  {
    id: 1,
    duration: 6,
    title: 'The Viral Hook',
    hook: 'STOP UPLOADING YOUR PRIVATE PDFs TO CLOUD SERVERS!',
    narration: 'Wait! Are you still uploading your confidential bank receipts, medical PDFs, and private photos to random cloud converter websites? Stop right now!',
    caption: '🚨 Stop uploading your private PDFs and files to sketchy cloud websites!',
    tagline: 'Did you know 68% of cloud converters store your documents on unencrypted servers?',
    badge: 'SECURITY ALERT',
    bgGradient: 'from-rose-950 via-[#070b09] to-red-950',
    visualType: 'security-alert'
  },
  {
    id: 2,
    duration: 7,
    title: 'Introducing MatrixConvert',
    hook: '100% IN-BROWSER CONVERSIONS WITH ZERO SERVER UPLOADS',
    narration: 'Meet MatrixConvert. It runs 100% locally inside your web browser using WebAssembly. Exactly 0 bytes leave your computer!',
    caption: '⚡ Meet MatrixConvert: 100% In-Browser & Zero Cloud Leaks!',
    tagline: 'Hardware-accelerated WebAssembly • Works 100% Offline • Matrix Code Rain Theme',
    badge: 'ZERO-KNOWLEDGE PRIVACY',
    bgGradient: 'from-emerald-950 via-[#04120e] to-sky-950',
    visualType: 'matrix-terminal'
  },
  {
    id: 3,
    duration: 7,
    title: 'Master Tool: PDF to 600 DPI PNG',
    hook: 'RAZOR-SHARP 300 & 600 DPI WITH TRANSPARENT BACKGROUNDS',
    narration: 'Need to extract illustrations or pages from a PDF? Convert multi-page documents into ultra-crisp 300 or 600 DPI PNGs with transparent alpha channels in seconds!',
    caption: '📄 Convert PDF to Lossless 600 DPI PNG with Transparent Fills!',
    tagline: 'No blurry fonts • Instant page previews • Batch ZIP download',
    badge: 'HIGH-DPI RASTERIZER',
    bgGradient: 'from-sky-950 via-[#051119] to-cyan-950',
    visualType: 'pdf-rasterizer'
  },
  {
    id: 4,
    duration: 7,
    title: 'True Vector SVG & Next-Gen WebP',
    hook: 'INFINITE VECTOR SCALING & 85% IMAGE COMPRESSION',
    narration: 'Extract true mathematical vector SVGs for Figma and Illustrator, or compress heavy photos to next-gen WebP to boost your Google Core Web Vitals!',
    caption: '🎨 Extract Infinite-Resolution SVGs & Compress to WebP (-85%)!',
    tagline: 'Perfect cubic bezier curves • LCP score 100/100 • WebAssembly SIMD speed',
    badge: 'VECTOR & PERFORMANCE',
    bgGradient: 'from-purple-950 via-[#0c0817] to-sky-950',
    visualType: 'vector-compression'
  },
  {
    id: 5,
    duration: 8,
    title: 'The Call to Action',
    hook: 'TRY IT 100% FREE NOW AT MIMAGE.NETLIFY.APP!',
    narration: 'No signup, no subscriptions, no file size caps! Click the link right now to try MatrixConvert free at mimage.netlify.app!',
    caption: '👉 Tap the link below: https://mimage.netlify.app/ — 100% Free Forever!',
    tagline: 'Unlimited Conversions • Zero Watermarks • Try Free Right Now',
    badge: 'VISIT LIVE SITE',
    bgGradient: 'from-sky-950 via-[#030908] to-cyan-900',
    visualType: 'cta-final'
  }
];

export const UgcPromoVideo: React.FC<UgcPromoVideoProps> = ({ onBackToApp }) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(24180);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [sceneProgress, setSceneProgress] = useState<number>(0);

  const activeScene = UGC_SCENES[currentSceneIndex];
  const timerRef = useRef<number | null>(null);

  // Auto-play timer for scene progression
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 100;
    const totalTicks = (activeScene.duration * 1000) / (intervalMs * playbackSpeed);

    timerRef.current = window.setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          setCurrentSceneIndex((prevIndex) => (prevIndex + 1) % UGC_SCENES.length);
          return 0;
        }
        return prev + 100 / totalTicks;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex, playbackSpeed, activeScene.duration]);

  // Voice narration using native Web Speech Synthesis if unmuted
  useEffect(() => {
    if (!isPlaying || isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeScene.narration);
    utterance.rate = 1.1 * playbackSpeed;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [currentSceneIndex, isPlaying, isMuted, playbackSpeed]);

  const handleNext = () => {
    setSceneProgress(0);
    setCurrentSceneIndex((prev) => (prev + 1) % UGC_SCENES.length);
  };

  const handlePrev = () => {
    setSceneProgress(0);
    setCurrentSceneIndex((prev) => (prev - 1 + UGC_SCENES.length) % UGC_SCENES.length);
  };

  const handleRestart = () => {
    setSceneProgress(0);
    setCurrentSceneIndex(0);
    setIsPlaying(true);
  };

  const handleToggleLike = () => {
    if (!isLiked) {
      setLikeCount((c) => c + 1);
      setIsLiked(true);
    } else {
      setLikeCount((c) => c - 1);
      setIsLiked(false);
    }
  };

  const fullUgcScript = `# High-Converting UGC Video Script for MatrixConvert
Target Destination URL: https://mimage.netlify.app/
Format: 9:16 Vertical (TikTok / Instagram Reels / YouTube Shorts) & 16:9 Landscape
Tone: Energetic, urgent, educational, tech-savvy

---

[SCENE 1: 0:00 - 0:06 | The Urgent Hook]
Visual Cue: Creator waving hands looking shocked, split screen with a giant warning shield and cloud leakage animation.
Voiceover:
"Wait! Are you still uploading your confidential bank receipts, medical PDFs, and private photos to random cloud converter websites? Stop right now!"
On-Screen Text: 🚨 STOP uploading your PDFs to cloud servers!
Sound Effect: Record scratch & siren ding.

[SCENE 2: 0:06 - 0:13 | The Solution]
Visual Cue: Creator turns phone screen to camera showing MatrixConvert with falling digital green matrix code rain.
Voiceover:
"Meet MatrixConvert. It runs 100% locally inside your web browser using WebAssembly. Exactly 0 bytes leave your computer!"
On-Screen Text: ⚡ MatrixConvert • 100% In-Browser • Zero Cloud Leaks!

[SCENE 3: 0:13 - 0:20 | Feature 1: PDF to 600 DPI PNG]
Visual Cue: Dragging a multi-page PDF into the dropzone, toggling resolution slider to 600 DPI and transparent background.
Voiceover:
"Need to extract illustrations or pages from a PDF? Convert multi-page documents into ultra-crisp 300 or 600 DPI PNGs with transparent alpha channels in seconds!"
On-Screen Text: 📄 PDF to 600 DPI PNG (Lossless & Transparent!)

[SCENE 4: 0:20 - 0:27 | Feature 2: Vector SVG & Fast WebP]
Visual Cue: Infinite zoom into a vector SVG logo in Figma without pixelation, then showing WebP file size drop from 4.2MB to 340KB.
Voiceover:
"Extract true mathematical vector SVGs for Figma and Illustrator, or compress heavy photos to next-gen WebP to boost your Google Core Web Vitals!"
On-Screen Text: 🎨 Infinite Vector SVGs + 85% WebP Compression!

[SCENE 5: 0:27 - 0:35 | The High-Converting CTA]
Visual Cue: Creator pointing enthusiastically down at the live link badge.
Voiceover:
"No signup, no subscriptions, no file size caps! Click the link right now to try MatrixConvert free at mimage.netlify.app!"
On-Screen Text: 👉 Tap the link: https://mimage.netlify.app/ (100% Free Forever)
Hashtags: #techtok #productivityhacks #pdftools #graphicdesign #matrixconvert #cybersecurity #freewebsite
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullUgcScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-200">
      {/* Top Banner & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-sky-400/20">
        <div>
          <button
            onClick={onBackToApp}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors mb-2 inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back to MatrixConvert App
          </button>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Modern UGC Promotional Video Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                Dedicated Video Campaign Showcase Driving Organic Traffic to{' '}
                <a
                  href="https://mimage.netlify.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-300 underline font-bold"
                >
                  https://mimage.netlify.app/
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Live Site Direct Link */}
        <div className="flex items-center gap-3">
          <a
            href="https://mimage.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-sky-400/30 flex items-center gap-2"
          >
            <span>👉 Visit Live Site: mimage.netlify.app</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Video Arena & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Video Mockup Screen Player */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Format Selector (9:16 Vertical Shorts vs 16:9 Landscape) */}
          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-[#071318] border border-sky-400/30 mb-4 font-mono text-xs">
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Vertical (TikTok / Reels / Shorts)</span>
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                aspectRatio === '16:9'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 Landscape (YouTube)</span>
            </button>
          </div>

          {/* Interactive Screen Device Mockup */}
          <div
            className={`relative rounded-3xl border-4 border-slate-700 bg-black shadow-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
              aspectRatio === '9:16'
                ? 'w-[320px] sm:w-[360px] h-[640px]'
                : 'w-full max-w-[680px] h-[382px]'
            }`}
          >
            {/* Top Scene Progress Bars */}
            <div className="absolute top-2 left-0 right-0 z-30 px-3 flex gap-1.5">
              {UGC_SCENES.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => {
                    setCurrentSceneIndex(idx);
                    setSceneProgress(0);
                  }}
                  className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer"
                >
                  <div
                    className="h-full bg-sky-400 transition-all duration-100"
                    style={{
                      width:
                        idx === currentSceneIndex
                          ? `${sceneProgress}%`
                          : idx < currentSceneIndex
                          ? '100%'
                          : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Video Canvas Scene Container */}
            <div
              className={`relative z-10 w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br ${activeScene.bgGradient} transition-all duration-700`}
            >
              {/* Scene Header Badge */}
              <div className="pt-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-black/60 border border-sky-400/40 text-sky-300 backdrop-blur-md">
                  {activeScene.badge}
                </span>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>UGC PREVIEW</span>
                </div>
              </div>

              {/* Dynamic Animated Visual Core per Scene */}
              <div className="my-auto text-center space-y-4">
                {activeScene.visualType === 'security-alert' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30 animate-bounce">
                      ⚠️
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono font-bold inline-block">
                      DANGER: CLOUD SERVER UPLOADS
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight uppercase">
                      {activeScene.hook}
                    </h3>
                  </div>
                )}

                {activeScene.visualType === 'matrix-terminal' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl text-emerald-300 shadow-lg shadow-emerald-500/30">
                      ⚡
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold inline-block">
                      100% CLIENT-SIDE WEBASSEMBLY
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight uppercase font-mono">
                      MATRIXCONVERT
                    </h3>
                    <p className="text-xs font-mono text-slate-300">
                      0 Bytes Uploaded • Infinite Privacy
                    </p>
                  </div>
                )}

                {activeScene.visualType === 'pdf-rasterizer' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-3xl text-sky-300 shadow-lg shadow-sky-500/30">
                      📄
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-sky-950/80 border border-sky-400/50 text-sky-300 text-xs font-mono font-bold inline-block">
                      300 & 600 DPI RASTERIZATION
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                      PDF → Transparent PNG
                    </h3>
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-300 bg-sky-950/60 px-3 py-1 rounded-lg border border-sky-400/30">
                      <span>Lossless</span> • <span>Multi-Page</span> • <span>Zero Blur</span>
                    </div>
                  </div>
                )}

                {activeScene.visualType === 'vector-compression' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl text-purple-300 shadow-lg shadow-purple-500/30">
                      🎨
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-400/50 text-purple-300 text-xs font-mono font-bold inline-block">
                      VECTOR SVG & WEBP COMPRESSION
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                      Infinite Scale • -85% Weight
                    </h3>
                  </div>
                )}

                {activeScene.visualType === 'cta-final' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center justify-center text-3xl shadow-xl shadow-sky-400/40 animate-pulse">
                      🚀
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        TRY MATRIXCONVERT NOW
                      </div>
                      <div className="text-xs font-mono text-sky-300 font-bold">
                        100% Free Forever • No Signup
                      </div>
                    </div>

                    {/* Unmissable Pulsing CTA Button inside Video Screen */}
                    <a
                      href="https://mimage.netlify.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-mono text-xs sm:text-sm font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl shadow-sky-400/50"
                    >
                      <span>👉 mimage.netlify.app</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Subtitles & Captions Overlay (UGC Style) */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-center shadow-lg">
                  <p className="text-xs sm:text-sm font-bold text-yellow-300 leading-snug drop-shadow-md">
                    {activeScene.caption}
                  </p>
                </div>

                {/* Simulated Audio Waveform */}
                <div className="flex items-center justify-center gap-1 h-4">
                  {[40, 80, 60, 100, 30, 90, 70, 50, 85, 45, 95, 65].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-sky-400/80 transition-all duration-150"
                      style={{
                        height: isPlaying ? `${(h * Math.random()).toFixed(0)}%` : '20%'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right Floating Social Engagement Overlay (TikTok Style) */}
              {aspectRatio === '9:16' && (
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-20">
                  <button
                    onClick={handleToggleLike}
                    className="flex flex-col items-center text-white cursor-pointer group"
                  >
                    <div
                      className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                        isLiked ? 'bg-rose-500 text-white' : 'bg-black/50 text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                    </div>
                    <span className="text-[10px] font-mono mt-1 font-bold">
                      {(likeCount / 1000).toFixed(1)}k
                    </span>
                  </button>

                  <div className="flex flex-col items-center text-white">
                    <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono mt-1 font-bold">842</span>
                  </div>

                  <a
                    href="https://mimage.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center text-sky-400 group"
                    title="Visit Site"
                  >
                    <div className="p-2.5 rounded-full bg-sky-500/30 border border-sky-400 backdrop-blur-md animate-pulse">
                      <ExternalLink className="w-5 h-5 text-sky-300" />
                    </div>
                    <span className="text-[9px] font-mono mt-1 font-bold">Visit</span>
                  </a>
                </div>
              )}
            </div>

            {/* Bottom In-Video Direct Link Bar */}
            <div className="relative z-30 p-2.5 bg-black/90 border-t border-sky-500/30 flex items-center justify-between text-xs font-mono">
              <a
                href="https://mimage.netlify.app/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 hover:underline font-bold flex items-center gap-1.5 truncate max-w-[220px]"
              >
                <span>🔗 https://mimage.netlify.app/</span>
              </a>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-500/30 font-bold">
                Free
              </span>
            </div>
          </div>

          {/* Player Media Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-[#071318] border border-sky-400/30 font-mono text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-sky-400/30 hover:bg-sky-950/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Scene"
            >
              ⏮️
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-sky-400/30 hover:bg-sky-950/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next Scene"
            >
              ⏭️
            </button>

            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl border border-sky-400/30 hover:bg-sky-950/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl border border-sky-400/30 hover:bg-sky-950/40 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Toggle Speech Narration"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Voice Muted' : 'Voice Narration'}</span>
            </button>

            <div className="flex items-center gap-1 pl-2 border-l border-sky-400/20">
              <span className="text-[10px] text-slate-400">SPEED:</span>
              {[1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2 py-1 rounded text-[10px] cursor-pointer ${
                    playbackSpeed === s ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: UGC Campaign Toolkit & Script Exporter */}
        <div className="lg:col-span-5 space-y-6">
          {/* High-Impact Direct Traffic Card */}
          <div className="p-6 rounded-2xl border-2 border-sky-400/50 bg-gradient-to-br from-sky-950/40 via-[#071318] to-[#030908] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sky-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>Target Website Destination</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Drive High-Intent Users to MatrixConvert
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              This promotional video is engineered to highlight the exact competitive flaws of cloud services like Sejda while championing MatrixConvert's 100% private in-browser WebAssembly architecture.
            </p>

            <div className="p-4 rounded-xl border border-sky-400/30 bg-[#030908] space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Official Production Web Link
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-sky-300 font-bold truncate">
                  https://mimage.netlify.app/
                </code>
                <a
                  href="https://mimage.netlify.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-mono text-xs font-bold hover:bg-sky-400 transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Full Creator Script & Voiceover Toolkit */}
          <div className="p-6 rounded-2xl border border-sky-400/30 bg-[#071318] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>UGC Creator Production Kit</span>
              </div>
              <button
                onClick={handleCopyScript}
                className="px-3 py-1.5 rounded-lg border border-sky-400/40 bg-[#030908] text-sky-300 font-mono text-xs font-bold hover:bg-sky-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedScript ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Script</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use this word-for-word voiceover script, B-roll timestamps, and trending hashtags to post your promotional video across TikTok, Instagram Reels, YouTube Shorts, and X:
            </p>

            {/* Script Viewer Container */}
            <div className="max-h-72 overflow-y-auto p-4 rounded-xl border border-sky-400/20 bg-[#030908] text-xs font-mono text-slate-300 space-y-3">
              <div>
                <strong className="text-sky-300">0:00 - 0:06 (Hook):</strong>
                <p className="text-slate-400 mt-0.5">
                  "Wait! Are you still uploading your confidential bank receipts, medical PDFs, and private photos to random cloud converter websites? Stop right now!"
                </p>
              </div>
              <div>
                <strong className="text-emerald-300">0:06 - 0:13 (The Solution):</strong>
                <p className="text-slate-400 mt-0.5">
                  "Meet MatrixConvert. It runs 100% locally inside your web browser using WebAssembly. Exactly 0 bytes leave your computer!"
                </p>
              </div>
              <div>
                <strong className="text-sky-300">0:13 - 0:20 (PDF to 600 DPI):</strong>
                <p className="text-slate-400 mt-0.5">
                  "Need to extract illustrations or pages from a PDF? Convert multi-page documents into ultra-crisp 300 or 600 DPI PNGs with transparent alpha channels in seconds!"
                </p>
              </div>
              <div>
                <strong className="text-purple-300">0:20 - 0:27 (Vector & WebP):</strong>
                <p className="text-slate-400 mt-0.5">
                  "Extract true mathematical vector SVGs for Figma and Illustrator, or compress heavy photos to next-gen WebP to boost your Google Core Web Vitals!"
                </p>
              </div>
              <div>
                <strong className="text-yellow-300">0:27 - 0:35 (Call To Action):</strong>
                <p className="text-slate-400 mt-0.5">
                  "No signup, no subscriptions, no file size caps! Click the link right now to try MatrixConvert free at mimage.netlify.app!"
                </p>
              </div>
            </div>

            {/* Viral Hashtags */}
            <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
              {['#techtok', '#productivity', '#pdftools', '#matrixconvert', '#freewebsite', '#graphicdesign', '#cybersecurity'].map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/30 text-sky-300 font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
