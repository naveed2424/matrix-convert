import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Info, 
  Mail, 
  Map, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Code,
  Cpu,
  Globe,
  Award,
  Terminal,
  Briefcase,
  Layers,
  Lock,
  Sparkles
} from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';

export type CompanyPageType = 'about' | 'terms' | 'disclaimer' | 'privacy' | 'contact' | 'sitemap';

interface CompanyPagesProps {
  pageType: CompanyPageType;
  onBackToHome: () => void;
  onSelectTool: (slug: string) => void;
}

export const CompanyPages: React.FC<CompanyPagesProps> = ({
  pageType,
  onBackToHome,
  onSelectTool
}) => {
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Feedback',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-200">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-400/20">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>

        <a
          href="https://mimage.netlify.app/"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-slate-400 hover:text-sky-300 flex items-center gap-1"
        >
          <span>Production: https://mimage.netlify.app/</span>
          <ExternalLink className="w-3 h-3 text-sky-400" />
        </a>
      </div>

      {/* Main Page Container */}
      <div className="rounded-3xl border border-sky-400/30 bg-[#071318]/90 backdrop-blur-md p-6 sm:p-10 shadow-2xl space-y-8">
        {/* =========================================================================
            ABOUT US
           ========================================================================= */}
        {pageType === 'about' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                <Info className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">About MatrixConvert</h1>
                <p className="text-xs font-mono text-sky-400">Mission, Philosophy & Zero-Knowledge Architecture</p>
              </div>
            </div>

            <div className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm leading-relaxed space-y-5">
              <p>
                <strong>MatrixConvert (hosted at <a href="https://mimage.netlify.app/" className="text-sky-400 underline">https://mimage.netlify.app/</a>)</strong> is an independent, next-generation digital utility designed to give creative designers, software developers, researchers, and enterprise professionals high-performance document and image conversion tools with <strong>100% client-side privacy</strong>.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">Our Core Mission: Ending Cloud Data Exploitation</h2>
              <p>
                For over a decade, traditional SaaS services like Sejda, CloudConvert, and Smallpdf required users to upload confidential business contracts, medical forms, tax files, and private photos to remote cloud servers. This legacy paradigm leaves sensitive user data vulnerable to network interception, third-party server breaches, and unmonitored data retention.
              </p>
              <p>
                MatrixConvert was founded on a simple foundational premise: <strong>Your files belong to you, and your browser has all the computing horsepower required to process them locally.</strong>
              </p>

              <h2 className="text-lg font-bold text-white pt-2">The WebAssembly Advantage</h2>
              <p>
                By compiling industrial C++ and Rust graphics pipelines into client-side WebAssembly (Wasm) and pairing them with hardware-accelerated HTML5 Canvas APIs, MatrixConvert performs complex PostScript parsing, 600 DPI document rasterization, true cubic bezier vector extraction, and modern WebP/AVIF compression directly inside your device's memory. Exactly 0 bytes of your documents are ever transmitted across the internet.
              </p>

              <div className="my-6 p-4 rounded-xl border border-sky-400/30 bg-sky-950/20">
                <h3 className="text-sky-300 font-bold mb-2 text-sm font-mono">Our Editorial & Engineering Commitments</h3>
                <ul className="text-xs space-y-2 text-slate-300 font-sans">
                  <li>• <strong>Zero File Storage:</strong> We do not operate server upload endpoints or file caches.</li>
                  <li>• <strong>Universal Free Access:</strong> Unlimited conversions with zero watermarks and zero forced paywalls.</li>
                  <li>• <strong>AdSense & Web Standards:</strong> Transparent publisher policies, non-intrusive advertising, and strict user privacy compliance.</li>
                </ul>
              </div>

              {/* Dedicated Technical Founder Profile - Naveed Afzal */}
              <div className="my-10 p-6 sm:p-8 rounded-3xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-950/50 via-[#06141c] to-[#030908] shadow-2xl space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-sky-400/20">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-xl shadow-sky-400/20 bg-slate-900">
                      <img
                        src="/assets/aistudio/Portfolio_technologique_et_m_ditatif_de_Naveed_Afzal_4cd849be.png"
                        alt="Naveed Afzal - Technologist, Full-Stack Developer & SEO Specialist"
                        className="w-full h-full object-cover object-top scale-110"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold border border-emerald-400 flex items-center gap-1 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                      Verified
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Naveed Afzal</h2>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/40 font-bold">
                        Founder & Lead Systems Architect
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-mono text-sky-400 font-medium">
                      Technologist • Full-Stack Web Developer • SEO Specialist • Systems Architect
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Map className="w-3.5 h-3.5 text-sky-400" />
                        <span>Based in France (Orig. Wah Cantt, PK)</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        <span>Master's in English</span>
                      </span>
                      <span>•</span>
                      <a
                        href="mailto:Afzal460@gmail.com"
                        className="inline-flex items-center gap-1 text-sky-300 hover:underline font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span>Afzal460@gmail.com</span>
                      </a>
                      <span>•</span>
                      <a
                        href="/downloads/LinkedIn_Article_MatrixConvert_Naveed_Afzal.pdf"
                        download="LinkedIn_Article_MatrixConvert_Naveed_Afzal.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>LinkedIn Article (PDF)</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Key Technical Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl border border-sky-400/30 bg-[#071720] text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">20+</div>
                    <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1">Years Tech Exp</div>
                  </div>
                  <div className="p-4 rounded-xl border border-sky-400/30 bg-[#071720] text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">15+</div>
                    <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1">Yrs Enterprise (Codra, Webdia)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-sky-400/30 bg-[#071720] text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">100+</div>
                    <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1">Free Digital Tools</div>
                  </div>
                  <div className="p-4 rounded-xl border border-sky-400/30 bg-[#071720] text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">100%</div>
                    <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1">Client-Side Privacy</div>
                  </div>
                </div>

                {/* Technical Biography */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-sky-400" />
                    <span>Technical Background & Career Path</span>
                  </h3>
                  <p>
                    <strong>Naveed Afzal</strong> is a veteran Web Developer, WordPress Architect, and Technical SEO Specialist with over <strong>two decades (20+ years) of hands-on software and web engineering experience</strong> creating high-performance digital platforms.
                  </p>
                  <p>
                    Throughout his 15+ years collaborating with premier European technology and digital media enterprises—including <strong>Codra</strong> and <strong>Webdia</strong>—Naveed honed his mastery of scalable frontend architectures, complex database performance tuning, programmatic content pipelines, and search engine technical audits.
                  </p>
                  <p>
                    In 2026, observing that mainstream document SaaS utilities (such as Sejda, CloudConvert, and Smallpdf) force users to surrender their confidential documents, resumes, tax filings, and graphics to external cloud storage servers, Naveed designed <strong>MatrixConvert</strong>. By compiling cutting-edge graphics and PDF parsers into client-side <strong>WebAssembly (Wasm)</strong> and leveraging hardware-accelerated HTML5 Canvas, Naveed proved that modern browsers can execute heavy vectorization, 600 DPI rasterization, and next-gen compression locally on client devices—with <strong>zero bytes transferred to cloud servers</strong>.
                  </p>
                </div>

                {/* Technical Domains & Expertise Matrix */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-sky-400" />
                    <span>Core Technical Stack & Certified Competencies</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-sky-400/20 bg-[#030908] space-y-2">
                      <div className="flex items-center gap-2 text-sky-300 font-bold font-mono">
                        <Code className="w-4 h-4 text-sky-400" />
                        <span>Web Development</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        HTML5, CSS3, modern JavaScript (ES6+), TypeScript, React, PHP, WebAssembly (Wasm), responsive UI design, cross-browser compatibility.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-sky-400/20 bg-[#030908] space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>SEO & Search Analytics</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Rank Math SEO Specialist, Google Core Web Vitals optimization, schema markup (JSON-LD), crawl budget optimization, technical audits.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-sky-400/20 bg-[#030908] space-y-2">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span>WordPress Architecture</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        20+ years custom WordPress engineering, bespoke theme/plugin development, headless CMS integrations, speed & caching optimization.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-sky-400/20 bg-[#030908] space-y-2">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold font-mono">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>AI Tools & Automation</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Automated document manipulation pipelines, in-browser batch processing, script automation, and AI-assisted workflow integration.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-sky-400/20 bg-[#030908] space-y-2">
                      <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Cybersecurity & Data Privacy</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Client-side cryptographic isolation, zero-knowledge processing, secure header configurations, GDPR & CCPA privacy compliance.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-sky-400/20 bg-[#030908] space-y-2">
                      <div className="flex items-center gap-2 text-fuchsia-300 font-bold font-mono">
                        <Layers className="w-4 h-4 text-fuchsia-400" />
                        <span>E-Commerce & Digital Apps</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        High-conversion checkout architecture, fast catalog indexing, conversion rate optimization (CRO), and payment gateway integrations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured Projects by Naveed Afzal */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-sky-400" />
                    <span>Featured Platforms & Technical Projects</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl border border-sky-400/30 bg-[#030908] space-y-1.5">
                      <div className="text-sky-300 font-bold text-sm">MatrixConvert / Sejda.store</div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Collection of 30+ 100% in-browser, zero-server-upload document & image conversion utilities.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sky-400/30 bg-[#030908] space-y-1.5">
                      <div className="text-emerald-300 font-bold text-sm">FreeQRcode.fr</div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        High-speed, lightweight QR code generation platform built for simplicity, speed, and clean output.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sky-400/30 bg-[#030908] space-y-1.5">
                      <div className="text-cyan-300 font-bold text-sm">CVGratuit.shop</div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Bilingual CV and resume engineering platform helping job seekers craft ATS-friendly professional resumes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sky-400/30 bg-[#030908] space-y-1.5">
                      <div className="text-amber-300 font-bold text-sm">GiftyNest & Jié Paris</div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        High-performance e-commerce platforms engineered for speed, mobile responsiveness, and conversion.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Philosophy Quote */}
                <div className="p-5 rounded-2xl border border-sky-400/30 bg-sky-950/20 space-y-2">
                  <div className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-bold">Engineering Philosophy</div>
                  <blockquote className="text-xs sm:text-sm text-slate-200 italic font-sans leading-relaxed">
                    "Success in technology is not merely about building websites or ranking on Google. It is about architecting robust, privacy-respecting digital systems, creating authentic value, sharing knowledge, and engineering user-first tools that make a real difference."
                  </blockquote>
                  <div className="text-xs font-mono text-sky-300 font-bold text-right pt-1">
                    — Naveed Afzal, Founder
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TERMS AND CONDITIONS
           ========================================================================= */}
        {pageType === 'terms' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                <FileText className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Terms and Conditions</h1>
                <p className="text-xs font-mono text-sky-400">Effective Date: October 2026</p>
              </div>
            </div>

            <div className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <p>
                Welcome to MatrixConvert (<a href="https://mimage.netlify.app/" className="text-sky-400 underline">https://mimage.netlify.app/</a>). By accessing or using our website, services, and client-side conversion utilities, you agree to be bound by these Terms of Service.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">1. Permitted Use & In-Browser Execution</h2>
              <p>
                MatrixConvert grants you a revocable, non-exclusive, non-transferable, free license to use our tools for personal, educational, and commercial purposes. Because all file processing takes place strictly inside your client browser, you retain 100% intellectual property ownership of all uploaded and converted assets.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">2. Prohibited Conduct</h2>
              <p>
                You agree not to use MatrixConvert to knowingly process materials that violate intellectual property copyrights, defamatory content, or malicious code designed to harm client devices. Automated scraping or denial-of-service attempts against static infrastructure are strictly prohibited.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">3. Disclaimer of Warranties</h2>
              <p>
                MatrixConvert is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. While our WebAssembly engines are rigorously tested for mathematical fidelity, we make no guarantees regarding lossless translation for non-standard or corrupt input files.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">4. Limitation of Liability</h2>
              <p>
                In no event shall MatrixConvert, its founders, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or inability to convert specific files.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            DISCLAIMER
           ========================================================================= */}
        {pageType === 'disclaimer' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Legal & Compliance Disclaimer</h1>
                <p className="text-xs font-mono text-sky-400">AdSense, Cookies & Third-Party Notice</p>
              </div>
            </div>

            <div className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h2 className="text-lg font-bold text-white">Google AdSense & Advertising Disclosure</h2>
              <p>
                MatrixConvert displays advertisements served by Google AdSense and authorized third-party vendor networks to fund server hosting and continuous open-source software development. Google uses cookies (including the DoubleClick cookie) to serve ads based on prior visits to our site or other websites on the internet.
              </p>
              <p>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-sky-400 underline">Google Ads Settings</a> or through the Network Advertising Initiative opt-out page.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">Zero-Server Storage Affirmation</h2>
              <p>
                MatrixConvert disclaims all custody and liability for user-submitted files. Because files are read directly into browser random-access memory via JavaScript <code>FileReader</code> and converted via WebAssembly, MatrixConvert neither possesses, inspects, stores, nor transmits your documents.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">Third-Party Trademarks</h2>
              <p>
                Adobe, PDF, PostScript, Sejda, Figma, Canva, Google, and other brand names referenced on this site are registered trademarks of their respective owners. MatrixConvert is an independent software application and is not affiliated with, endorsed by, or sponsored by these entities.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            PRIVACY POLICY
           ========================================================================= */}
        {pageType === 'privacy' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Privacy Policy</h1>
                <p className="text-xs font-mono text-sky-400">GDPR, CCPA & Zero-Knowledge Architecture</p>
              </div>
            </div>

            <div className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <p>
                Your privacy is paramount. This Privacy Policy outlines our zero-data-retention practices across <a href="https://mimage.netlify.app/" className="text-sky-400 underline">https://mimage.netlify.app/</a>.
              </p>

              <h2 className="text-lg font-bold text-white">1. Information We Do NOT Collect</h2>
              <ul>
                <li><strong>No Document Content:</strong> Your PDFs, images, vector files, and document texts never reach our servers. All rendering executes in your local browser sandbox.</li>
                <li><strong>No User Passwords or Accounts:</strong> MatrixConvert requires no login, sign-in, or registration.</li>
                <li><strong>No PII Monetization:</strong> We do not collect, buy, or sell personal contact lists or identification numbers.</li>
              </ul>

              <h2 className="text-lg font-bold text-white pt-2">2. Analytics & Cookies</h2>
              <p>
                We use Google Analytics 4 (Measurement ID: <code>G-ZM8R2JF6WT</code>) to collect aggregated, anonymous traffic statistics (such as total pageviews, operating systems, and bounce rates). No file contents or personal identifiers are passed to analytics.
              </p>

              <h2 className="text-lg font-bold text-white pt-2">3. GDPR & CCPA Compliance</h2>
              <p>
                Under the EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), MatrixConvert acts solely as an interactive client application. Because we do not ingest personal data, users need not submit data deletion requests—data simply does not exist on our infrastructure.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONTACT US
           ========================================================================= */}
        {pageType === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                <Mail className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Contact & Support</h1>
                <p className="text-xs font-mono text-sky-400">Get in Touch with our Engineering Team</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Contact Information & Response SLA */}
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-xl border border-sky-400/40 bg-sky-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 block uppercase font-bold text-[11px]">Founder & Creator Direct</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">Priority</span>
                  </div>
                  <div className="text-white font-bold text-sm">Naveed Afzal</div>
                  <div className="text-[11px] text-sky-400 font-mono">Technologist & Lead Systems Architect</div>
                  <a href="mailto:Afzal460@gmail.com" className="text-sky-300 font-bold hover:underline text-sm block">
                    Afzal460@gmail.com
                  </a>
                  <p className="text-slate-300 text-[11px] font-sans">
                    Direct line for technical architecture consultations, developer queries, and custom tool collaborations.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-sky-400/30 bg-[#030908] space-y-2">
                  <span className="text-slate-400 block uppercase">Official Support Email</span>
                  <a href="mailto:support@mimage.netlify.app" className="text-sky-300 font-bold hover:underline text-sm block">
                    support@mimage.netlify.app
                  </a>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Guaranteed response within 24 business hours for feature requests, bug reports, and general feedback.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-sky-400/30 bg-[#030908] space-y-2">
                  <span className="text-slate-400 block uppercase">Deployment & Domain</span>
                  <p className="text-white font-bold">MatrixConvert Core Network</p>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Hosted on high-speed global Netlify Edge CDN with SSL encryption.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-400/30 bg-emerald-950/20 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AdSense & Webmaster Verified</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans">
                    Compliant with Google Search Console verification and publisher content guidelines.
                  </p>
                </div>
              </div>

              {/* Interactive Contact Form */}
              <div className="rounded-2xl border border-sky-400/30 bg-[#030908] p-6 space-y-4">
                <h2 className="text-base font-bold text-white font-sans">Send Us a Direct Message</h2>

                {formSubmitted ? (
                  <div className="p-6 rounded-xl border border-emerald-400/50 bg-emerald-950/40 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="text-white font-bold text-sm">Thank You for Your Message!</h3>
                    <p className="text-xs text-slate-300 font-sans">
                      Our engineering and support team has received your inquiry. We typically reply within 24 hours.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-4 text-xs font-mono">
                    {formError && (
                      <div className="p-2.5 rounded-lg border border-red-500/50 bg-red-950/40 text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-400 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        className="w-full rounded-lg border border-sky-400/30 bg-[#071318] px-3 py-2 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@company.com"
                        className="w-full rounded-lg border border-sky-400/30 bg-[#071318] px-3 py-2 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-lg border border-sky-400/30 bg-[#071318] px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                      >
                        <option value="General Feedback">General Feedback</option>
                        <option value="Bug Report / Tool Issue">Bug Report / Tool Issue</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Commercial / Partnership">Commercial / Partnership</option>
                        <option value="AdSense / Legal Inquiry">AdSense / Legal Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your inquiry, question, or feedback in detail..."
                        className="w-full rounded-lg border border-sky-400/30 bg-[#071318] px-3 py-2 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/25"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SITEMAP DIRECTORY VIEW
           ========================================================================= */}
        {pageType === 'sitemap' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                <Map className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Website Sitemap Directory</h1>
                <p className="text-xs font-mono text-sky-400">Index of all tools, guides, and compliance endpoints</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase text-sky-300 mb-3">
                  All Converters & Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {TOOLS_DATA.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => onSelectTool(tool.slug)}
                      className="p-3 rounded-xl border border-sky-400/20 bg-[#030908] hover:border-sky-400 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-[10px] font-mono text-sky-400 font-bold">
                        {tool.fromFormat} → {tool.toFormat}
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                        {tool.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-sky-400/20 flex flex-wrap gap-4 text-xs font-mono">
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                  XML Sitemap (/sitemap.xml)
                </a>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                  Robots.txt (/robots.txt)
                </a>
                <a href="/ads.txt" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                  Ads.txt (/ads.txt)
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
