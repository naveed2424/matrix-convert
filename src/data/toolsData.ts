import { ToolDefinition } from '../types';

export const TOOLS_DATA: ToolDefinition[] = [
  // 1. PDF to PNG (Featured / Dedicated Deep Dive)
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG Converter',
    slug: 'pdf-to-png',
    category: 'popular',
    categoryName: 'Convert from PDF',
    fromFormat: 'PDF',
    toFormat: 'PNG',
    badge: 'High DPI & Transparent',
    isPopular: true,
    shortDescription: 'Convert PDF pages into high-resolution, lossless PNG images with custom DPI and transparent background support.',
    longDescription: 'Extract every page of your PDF documents into crystal-clear, lossless PNG images right in your web browser. Perfect for presentations, graphic design, social media assets, and vector-accurate document archiving without uploading sensitive files to third-party servers.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      {
        persona: 'Graphic Designers & Illustrators',
        useCase: 'Extract raster illustrations and design proofs from client PDFs at 300 DPI for editing in Figma, Photoshop, or Canva.'
      },
      {
        persona: 'Web & Mobile Developers',
        useCase: 'Convert multi-page UI specs, wireframes, and brand guidelines into lightweight assets for web mockups and documentation.'
      },
      {
        persona: 'Educators & Researchers',
        useCase: 'Extract charts, scientific diagrams, and figures from academic publications to embed directly into keynote slides.'
      },
      {
        persona: 'Legal & Accounting Professionals',
        useCase: 'Convert confidential PDF receipts, contracts, and filings into immutable image evidence while ensuring zero external data leaks.'
      }
    ],
    whereToUse: [
      {
        scenario: 'High-Resolution Print Production',
        benefit: 'Export pages at 300 DPI to preserve razor-sharp typography and crisp linework ready for print reproduction.'
      },
      {
        scenario: 'Web Asset & Social Media Publishing',
        benefit: 'Export at 72 or 150 DPI with transparent margins to seamlessly overlay documents on colored backgrounds.'
      },
      {
        scenario: 'Digital Asset Management & Archiving',
        benefit: 'Convert non-editable PDF reports into universally viewable PNG thumbnails for intranet databases.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Select or Drag Your PDF Document',
        description: 'Drop your PDF file into the secure Matrix processing matrix. No files are uploaded to any server.'
      },
      {
        step: 2,
        title: 'Choose Resolution DPI & Background',
        description: 'Set your preferred rendering density (72 DPI for web, 150 DPI for screens, or 300 DPI for publication) and pick transparent or white background.'
      },
      {
        step: 3,
        title: 'Execute & Download Instant PNGs',
        description: 'Click Convert to render each page in real-time. Download single PNG frames or export the entire batch in a single convenient ZIP archive.'
      }
    ],
    formatComparison: [
      { feature: 'Format Type', fromVal: 'Fixed-layout document (Vector + Raster + Fonts)', toVal: 'Lossless raster bitmap graphic' },
      { feature: 'Alpha Transparency', fromVal: 'Simulated / Page canvas boundary', toVal: 'Full 8-bit alpha channel support' },
      { feature: 'Browser Display', fromVal: 'Requires dedicated PDF plugin or viewer', toVal: 'Native HTML5 <img> element compatibility' },
      { feature: 'Editing Compatibility', fromVal: 'Requires Adobe Acrobat or vector editor', toVal: 'Compatible with all image editors and canvas tools' },
      { feature: 'Compression Model', fromVal: 'Flate / Deflate / JPEG stream encapsulation', toVal: 'Lossless DEFLATE algorithm (zero artifacting)' }
    ],
    seoKeywords: {
      shortTail: ['pdf to png', 'convert pdf to png', 'free pdf to png', 'pdf to png high resolution', 'pdf png online'],
      longTail: [
        'how to convert pdf to transparent png online free',
        'convert multi page pdf to png zip download',
        'free high dpi pdf to png converter no email',
        'client side private pdf to png converter browser',
        'extract high quality images from pdf without losing resolution'
      ]
    },
    faq: [
      {
        question: 'Are my confidential documents uploaded to your servers?',
        answer: 'Never. MatrixConvert operates entirely client-side using WebAssembly and HTML5 Canvas technology within your browser sandboxed memory. Your files never touch an external server or database.'
      },
      {
        question: 'Can I extract multi-page PDFs at once?',
        answer: 'Yes! When you upload a multi-page PDF, MatrixConvert renders all individual pages and allows you to download them individually or as a single neatly organized ZIP archive.'
      },
      {
        question: 'What is the best DPI setting for printing?',
        answer: 'For professional print output, select 300 DPI. For standard monitor viewing and web publication, 72 DPI or 150 DPI produces smaller file sizes with exceptional sharpness.'
      }
    ],
    options: {
      supportsDpi: true,
      supportsBackground: true,
      supportsMultiPage: true
    }
  },

  // 2. PDF to SVG (Featured / Dedicated Deep Dive)
  {
    id: 'pdf-to-svg',
    name: 'PDF to SVG Vector Converter',
    slug: 'pdf-to-svg',
    category: 'popular',
    categoryName: 'Convert from PDF',
    fromFormat: 'PDF',
    toFormat: 'SVG',
    badge: 'Infinite Scaling Vector',
    isPopular: true,
    shortDescription: 'Transform PDF pages and vector assets into clean, infinitely scalable SVG graphics ready for web animation and CAD editing.',
    longDescription: 'Convert complex PDF pages, schematics, vector diagrams, and typographic layouts into clean XML-based Scalable Vector Graphics (SVG). Retain crisp vector paths, responsive aspect ratios, and crystal-clear geometry that scales from mobile screens to billboard displays without pixelation.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      {
        persona: 'Frontend Engineers & UI/UX Architects',
        useCase: 'Embed interactive vector diagrams into React, Vue, or Webflow applications with CSS styling and SVG path manipulation.'
      },
      {
        persona: 'CAD Drafters & Architects',
        useCase: 'Convert PDF architectural floorplans, blueprints, and engineering schematics into editable SVG paths for Inkscape and Illustrator.'
      },
      {
        persona: 'Brand Identity Designers',
        useCase: 'Recover lost vector logo assets from vector-based corporate PDF brand guides.'
      },
      {
        persona: 'Motion Designers & Animators',
        useCase: 'Prepare vector paths for GSAP or Lottie animations without manual path tracing.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Responsive Web Vector Visualizations',
        benefit: 'SVGs adjust to any viewport dynamically without consuming large bandwidth or triggering blurry raster artifacting.'
      },
      {
        scenario: 'Laser Cutting, CNC & Plotter Manufacturing',
        benefit: 'Export precise mathematical vector outlines that digital cutting machines and plotters can follow natively.'
      },
      {
        scenario: 'Interactive Data Charts & Technical Manuals',
        benefit: 'Enable DOM styling, tooltips, and hover states directly on individual SVG path nodes.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Upload PDF Schematic or Document',
        description: 'Drop any PDF containing vector paths, typography, or illustrations into the converter.'
      },
      {
        step: 2,
        title: 'Configure Vector Packaging & Dimensions',
        description: 'Select vector preservation mode, scale multiplier, and viewBox coordinate system.'
      },
      {
        step: 3,
        title: 'Export Scalable SVG Files',
        description: 'Download the synthesized SVG code or preview the responsive vector rendering directly in the browser.'
      }
    ],
    formatComparison: [
      { feature: 'Scalability', fromVal: 'Scalable internally, but locked in fixed page canvas', toVal: 'Infinite mathematical vector scalability (resolution-independent)' },
      { feature: 'Markup / DOM Integration', fromVal: 'Binary PDF container requiring canvas rendering', toVal: 'Direct XML / SVG elements inspectable via standard browser DOM' },
      { feature: 'CSS / JS Scriptability', fromVal: 'Not possible without specialized PDF engine', toVal: 'Full CSS fill, stroke, and JavaScript animation compatibility' },
      { feature: 'File Size for Graphics', fromVal: 'Heavy container with embedded metadata dictionaries', toVal: 'Compact text-based XML easily compressed via Gzip / Brotli' }
    ],
    seoKeywords: {
      shortTail: ['pdf to svg', 'convert pdf to svg', 'free pdf to svg converter', 'pdf vector to svg', 'pdf to svg online'],
      longTail: [
        'convert pdf blueprint to editable svg vector online',
        'free batch pdf to svg converter without registration',
        'extract vector paths from pdf to svg illustrator compatible',
        'client side pdf to svg converter secure privacy',
        'best tool to convert pdf diagrams to scalable vector graphics'
      ]
    },
    faq: [
      {
        question: 'Does the converted SVG remain resolution-independent?',
        answer: 'Yes! Vector paths, shapes, and curves embedded inside the PDF are preserved in the SVG output, meaning you can zoom in infinitely without seeing pixel blur.'
      },
      {
        question: 'Can I open the resulting SVG in Adobe Illustrator, Figma, or Inkscape?',
        answer: 'Absolutely. The output is compliant with standard SVG 1.1 / 2.0 specifications and imports seamlessly into Figma, Illustrator, Affinity Designer, Inkscape, and web browsers.'
      },
      {
        question: 'Is there a file size limit?',
        answer: 'Because processing occurs inside your device memory rather than an overloaded shared server, you can process documents up to hundreds of megabytes depending on your local RAM.'
      }
    ],
    options: {
      supportsScale: true,
      supportsBackground: true,
      supportsMultiPage: true,
      supportsSvgVectorize: true
    }
  },

  // 3. PNG to WebP (Popular Web Optimizer)
  {
    id: 'png-to-webp',
    name: 'PNG to WebP Converter',
    slug: 'png-to-webp',
    category: 'convert-webp',
    categoryName: 'Convert to WebP',
    fromFormat: 'PNG',
    toFormat: 'WEBP',
    badge: 'Cut File Size by 70%',
    isPopular: true,
    shortDescription: 'Compress heavy PNG images into next-gen WebP format with full alpha transparency and massive file size savings.',
    longDescription: 'Dramatically improve your Google Core Web Vitals (LCP & CLS) by converting uncompressed PNG photos and UI graphics into Google WebP format. Retain crystal-clear transparency while cutting file sizes by up to 75% compared to PNG.',
    acceptedFileTypes: ['.png', 'image/png'],
    whoCanUse: [
      {
        persona: 'Web Developers & Performance Engineers',
        useCase: 'Achieve 95+ PageSpeed scores by converting hero banners, sprites, and media assets to next-gen formats.'
      },
      {
        persona: 'E-Commerce Store Owners (Shopify, WooCommerce)',
        useCase: 'Accelerate product catalog page load times to reduce bounce rates and boost checkout conversions.'
      },
      {
        persona: 'Content Marketers & Bloggers',
        useCase: 'Optimize featured blog images for fast mobile loading without visual quality degradation.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Mobile-First Web Design',
        benefit: 'Cut mobile cellular data consumption and render content instantaneously on 4G/5G networks.'
      },
      {
        scenario: 'SaaS App UI Assets',
        benefit: 'Keep transparent dashboard icons and illustrations light and responsive.'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Upload PNG Graphic',
        description: 'Select one or multiple PNG files with or without transparency.'
      },
      {
        step: 2,
        title: 'Tune Compression Ratio',
        description: 'Choose between lossless WebP (100% exact fidelity) or lossy high-efficiency compression (80-90% quality).'
      },
      {
        step: 3,
        title: 'Download Optimized WebP',
        description: 'Save the optimized WebP asset and verify the reduced byte footprint.'
      }
    ],
    formatComparison: [
      { feature: 'File Size', fromVal: 'Heavy uncompressed bitmap data (often 1MB - 5MB)', toVal: '25% - 70% smaller than equivalent PNG' },
      { feature: 'Transparency', fromVal: 'Full 8-bit alpha channel', toVal: 'Full 8-bit alpha channel supported in both lossy and lossless modes' },
      { feature: 'Browser Support', fromVal: 'Universal legacy support', toVal: '97%+ modern global browser support (Chrome, Safari, Firefox, Edge)' }
    ],
    seoKeywords: {
      shortTail: ['png to webp', 'convert png to webp', 'png to webp free', 'webp converter online'],
      longTail: [
        'how to convert transparent png to webp without losing transparency',
        'batch convert png to webp for shopify and wordpress',
        'free online png to webp high quality compression tool'
      ]
    },
    faq: [
      {
        question: 'Does WebP support transparent backgrounds like PNG?',
        answer: 'Yes! WebP provides full support for alpha transparency in both lossy and lossless modes, often producing files 3x smaller than PNG with identical visual transparency.'
      },
      {
        question: 'Will converting to WebP degrade image quality?',
        answer: 'Not noticeably. At 85-90% quality setting, WebP is perceptually indistinguishable from original PNGs to the human eye while slashing the byte payload.'
      }
    ],
    options: {
      supportsQuality: true,
      supportsScale: true
    }
  },

  // 4. JPG to PNG (Format Converter)
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    slug: 'jpg-to-png',
    category: 'popular',
    categoryName: 'Convert to PNG',
    fromFormat: 'JPG',
    toFormat: 'PNG',
    badge: 'Lossless & Artifact-Free',
    isPopular: true,
    shortDescription: 'Convert lossy JPG and JPEG images to clean, uncompressed PNG format for further editing and transparency preservation.',
    longDescription: 'Eliminate compounding compression artifacts by converting JPG photographs, scans, and graphics into lossless 24-bit PNG files. Ideal for graphic preparation, clean digital archiving, and overlay workflows.',
    acceptedFileTypes: ['.jpg', '.jpeg', 'image/jpeg'],
    whoCanUse: [
      {
        persona: 'Digital Artists & Illustrators',
        useCase: 'Prepare reference photos and sketches for multi-layer digital painting without JPG compression blocking.'
      },
      {
        persona: 'Document Archivers',
        useCase: 'Convert photographed documents into clean PNGs that will not degrade across future saves.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Multi-Generation Image Editing',
        benefit: 'Editing and saving PNGs repeatedly never introduces compression degradation unlike re-saving JPGs.'
      }
    ],
    steps: [
      { step: 1, title: 'Upload JPG File', description: 'Select the JPG or JPEG image from your device.' },
      { step: 2, title: 'Optional Color & Scale Tuning', description: 'Adjust dimension scaling or retain original dimensions.' },
      { step: 3, title: 'Download Clean PNG', description: 'Download your pristine lossless PNG.' }
    ],
    formatComparison: [
      { feature: 'Compression Type', fromVal: 'Lossy DCT (discrete cosine transform) with block artifacts', toVal: 'Lossless DEFLATE algorithm preserving every pixel' },
      { feature: 'Alpha Transparency', fromVal: 'No alpha channel support (always solid)', toVal: 'Full 8-bit alpha channel support' }
    ],
    seoKeywords: {
      shortTail: ['jpg to png', 'convert jpg to png', 'jpeg to png', 'convert jpeg to png free'],
      longTail: ['convert high resolution jpg to png without losing quality', 'free batch jpg to png converter no download']
    },
    faq: [
      { question: 'Does converting JPG to PNG make the image transparent automatically?', answer: 'Converting changes the container format to support transparency. If you want to remove the solid background color, use our built-in Remove Background tool!' }
    ],
    options: {
      supportsScale: true
    }
  },

  // 5. SVG to PNG (Vector to Raster)
  {
    id: 'svg-to-png',
    name: 'SVG to PNG Converter',
    slug: 'svg-to-png',
    category: 'convert-png',
    categoryName: 'Convert from SVG',
    fromFormat: 'SVG',
    toFormat: 'PNG',
    badge: 'Render Up to 8K Resolution',
    isPopular: true,
    shortDescription: 'Rasterize SVG vector code into ultra-crisp PNG images at any desired scale (1x, 2x, 4x, 8K) with transparent backgrounds.',
    longDescription: 'Turn Scalable Vector Graphics (SVG) into crisp, anti-aliased PNG images with transparent backgrounds at any resolution imaginable. Perfect for exporting app icons, favicon sets, social media banners, and email newsletter assets where SVG support is limited.',
    acceptedFileTypes: ['.svg', 'image/svg+xml'],
    whoCanUse: [
      {
        persona: 'UI & App Developers',
        useCase: 'Export vector UI icons at exact pixel densities (@1x, @2x, @3x) for iOS and Android app bundles.'
      },
      {
        persona: 'Email Marketing Specialists',
        useCase: 'Convert vector logos into universally supported PNGs for Outlook, Gmail, and Apple Mail templates.'
      }
    ],
    whereToUse: [
      {
        scenario: 'High-Density Display Rendering (Retina / 4K)',
        benefit: 'Render crisp 4x and 8x resolutions without jagged raster edges.'
      }
    ],
    steps: [
      { step: 1, title: 'Select SVG File', description: 'Upload your vector SVG artwork.' },
      { step: 2, title: 'Set Scale Multiplier', description: 'Choose 1x, 2x, 4x, or custom pixel width for ultra high resolution.' },
      { step: 3, title: 'Download Anti-Aliased PNG', description: 'Download your transparent PNG asset instantly.' }
    ],
    formatComparison: [
      { feature: 'Representation', fromVal: 'XML vector math coordinates', toVal: 'Pixel bitmap raster grid' },
      { feature: 'Software Compatibility', fromVal: 'Requires vector renderer', toVal: '100% universal across all legacy software, email clients, and apps' }
    ],
    seoKeywords: {
      shortTail: ['svg to png', 'convert svg to png', 'svg to high res png', 'svg to transparent png'],
      longTail: ['how to convert svg to high resolution png 300 dpi', 'batch svg to png converter transparent background free']
    },
    faq: [
      { question: 'Will the PNG have a transparent background?', answer: 'Yes! Unless you explicitly specify a solid background color in options, the rasterized PNG retains full transparency.' }
    ],
    options: {
      supportsScale: true,
      supportsBackground: true
    }
  },

  // 6. PNG to ICO (Favicon Generator)
  {
    id: 'png-to-ico',
    name: 'PNG to ICO Favicon Generator',
    slug: 'png-to-ico',
    category: 'icon-tools',
    categoryName: 'Icon Tools',
    fromFormat: 'PNG',
    toFormat: 'ICO',
    badge: 'Multi-Resolution 16-256px',
    isPopular: true,
    shortDescription: 'Generate standard Microsoft Windows ICO icon files and multi-resolution web browser favicons with ease.',
    longDescription: 'Create multi-resolution ICO files compatible with Windows desktop applications, web browsers (favicon.ico), and taskbars. Packages standard icon layers (16x16, 32x32, 48x48, 64x64, 128x128, 256x256) into a single optimized binary file.',
    acceptedFileTypes: ['.png', 'image/png'],
    whoCanUse: [
      {
        persona: 'Web Developers & Site Administrators',
        useCase: 'Generate compliant favicon.ico files for web root directories to display in browser tabs and bookmark bars.'
      },
      {
        persona: 'Desktop Software Developers (C#, Electron, C++)',
        useCase: 'Package executable application icons for Windows installer and taskbar display.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Website Root Favicon Deployment',
        benefit: 'Ensures older legacy browsers and desktop shortcuts display your brand mark sharply without missing icon errors.'
      }
    ],
    steps: [
      { step: 1, title: 'Upload Square PNG Logo', description: 'For best results, use a 512x512 transparent PNG logo.' },
      { step: 2, title: 'Select Target Icon Dimensions', description: 'Choose which resolutions to include (16, 32, 48, 64, 128, 256).' },
      { step: 3, title: 'Download Multi-Layer ICO', description: 'Download your compiled favicon.ico file.' }
    ],
    formatComparison: [
      { feature: 'Layering', fromVal: 'Single raster image layer', toVal: 'Multi-layer container holding multiple resolutions in one file' },
      { feature: 'Windows & Favicon Support', fromVal: 'Modern browser tab only', toVal: 'Native Windows desktop & legacy root favicon.ico standard' }
    ],
    seoKeywords: {
      shortTail: ['png to ico', 'convert png to ico', 'favicon generator', 'make ico file'],
      longTail: ['convert transparent png to multi resolution ico favicon', 'free online png to favicon ico converter for windows']
    },
    faq: [
      { question: 'What is the ideal upload size for an ICO converter?', answer: 'A 512x512 or 256x256 pixel square transparent PNG provides the optimal source detail for downscaling into all icon resolutions.' }
    ],
    options: {
      supportsIcoSizes: true
    }
  },

  // 7. Image to PDF (Multi-Page Document Builder)
  {
    id: 'image-to-pdf',
    name: 'Images to PDF Document Converter',
    slug: 'image-to-pdf',
    category: 'popular',
    categoryName: 'Convert to PDF',
    fromFormat: 'IMG',
    toFormat: 'PDF',
    badge: 'Merge Multiple Photos',
    isPopular: true,
    shortDescription: 'Combine multiple JPG, PNG, and WebP images into a single professional, printable PDF document.',
    longDescription: 'Merge receipts, homework assignments, scanned documents, and portfolio artwork into a clean, paginated PDF file. Reorder pages with drag and drop, adjust orientation (portrait/landscape), and export an encrypted or uncompressed standard PDF.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', 'image/*'],
    whoCanUse: [
      {
        persona: 'Students & Educators',
        useCase: 'Combine handwritten lecture notes and whiteboard photos into one structured PDF submission.'
      },
      {
        persona: 'Remote Workers & Freelancers',
        useCase: 'Package multiple expense receipts and invoice screenshots into an organized monthly expense report.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Formal Document Submission',
        benefit: 'Government, academic, and corporate portals often require single PDF files rather than multiple loose JPGs.'
      }
    ],
    steps: [
      { step: 1, title: 'Upload Image Files', description: 'Select one or dozens of image files simultaneously.' },
      { step: 2, title: 'Arrange Order & Orientation', description: 'Review page previews and configure paper size (A4 / US Letter).' },
      { step: 3, title: 'Build and Download PDF', description: 'Generate a single merged PDF instantly in your browser.' }
    ],
    formatComparison: [
      { feature: 'Document Structure', fromVal: 'Separate loose raster files', toVal: 'Unified multi-page paginated document with page index' },
      { feature: 'Print Ready', fromVal: 'Variable print layouts and sizes', toVal: 'Standardized paper dimensions (A4, Letter) with consistent margins' }
    ],
    seoKeywords: {
      shortTail: ['jpg to pdf', 'images to pdf', 'convert photo to pdf', 'combine images to pdf'],
      longTail: ['how to combine multiple jpg into one pdf file free online', 'batch convert pictures to pdf without losing quality']
    },
    faq: [
      { question: 'Can I reorder the images before generating the PDF?', answer: 'Yes, you can easily organize and manage image order before compiling the final document.' }
    ],
    options: {
      supportsMultiPage: true
    }
  },

  // 8. Image Compress (Smart Optimizer)
  {
    id: 'image-compress',
    name: 'Smart Image Compressor',
    slug: 'image-compress',
    category: 'popular',
    categoryName: 'Optimize & Edit',
    fromFormat: 'ANY',
    toFormat: 'ANY',
    badge: 'Reduce MB to KB',
    isPopular: true,
    shortDescription: 'Reduce file size of JPG, PNG, and WebP images by up to 85% with intelligent visual optimization.',
    longDescription: 'Drastically compress image payloads while preserving sharp visual quality. Perfect for meeting upload file size limits on government portals, email attachments, and web platforms.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    whoCanUse: [
      {
        persona: 'Job Applicants & Students',
        useCase: 'Compress passport photos, diplomas, and ID scans under strict 200KB portal upload limits.'
      },
      {
        persona: 'Email Professionals',
        useCase: 'Keep email attachments well under 10MB limits without sending blurry photos.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Meeting Strict Portal File Size Limits',
        benefit: 'Compress files precisely to the target kilobyte limit required by job applications and visa forms.'
      }
    ],
    steps: [
      { step: 1, title: 'Select Heavy Images', description: 'Upload high-resolution photos or bulky PNG files.' },
      { step: 2, title: 'Choose Compression Level', description: 'Pick Balanced (recommended), Maximum Compression, or Lossless.' },
      { step: 3, title: 'Download Compressed Media', description: 'Inspect the percentage saved and download your lightweight files.' }
    ],
    formatComparison: [
      { feature: 'File Size', fromVal: 'Original unoptimized footprint (e.g. 8.4 MB)', toVal: 'Optimized footprint (e.g. 1.2 MB, -85% reduction)' },
      { feature: 'Visual Quality', fromVal: '100% raw encoding', toVal: 'Perceptually lossless with optimized chroma subsampling' }
    ],
    seoKeywords: {
      shortTail: ['image compressor', 'compress jpg', 'compress png', 'reduce image size free'],
      longTail: ['compress image to 200kb online free without losing clarity', 'best batch photo compressor for email attachments']
    },
    faq: [
      { question: 'Will compression make my image blurry?', answer: 'No. Our intelligent optimization algorithms selectively strip redundant metadata and imperceptible color frequencies, keeping edges and details crisp.' }
    ],
    options: {
      supportsQuality: true,
      supportsScale: true
    }
  },

  // 9. Matrix Code / ASCII Art Generator (Matrix Film Special)
  {
    id: 'image-matrix-art',
    name: 'Matrix Code & ASCII Art Generator',
    slug: 'image-matrix-art',
    category: 'icon-tools',
    categoryName: 'Creative Cyber Tools',
    fromFormat: 'IMG',
    toFormat: 'ASCII / PNG',
    badge: 'Matrix Film Style',
    isPopular: true,
    shortDescription: 'Transform any photo into iconic falling Matrix digital rain code art, green glowing phosphor glyphs, and retro ASCII text.',
    longDescription: 'Turn your portraits, logos, and screenshots into authentic Matrix film style digital art. Renders source image luminance into green phosphor Katakana glyphs, binary code, and hexadecimal characters with customizable glow, density, and CRT scanline effects.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', '.svg', 'image/*'],
    whoCanUse: [
      {
        persona: 'Cyberpunk & Sci-Fi Enthusiasts',
        useCase: 'Generate awesome Matrix-themed avatars, Discord profile pictures, and retro hacker wallpaper art.'
      },
      {
        persona: 'Coders & Terminal Geeks',
        useCase: 'Create ASCII art banners for GitHub READMEs, terminal CLI MOTDs, and code documentation.'
      }
    ],
    whereToUse: [
      {
        scenario: 'Social Profiles & Cyberpunk Wallpapers',
        benefit: 'Instantly stand out with green glowing digital rain portraits and terminal aesthetics.'
      }
    ],
    steps: [
      { step: 1, title: 'Upload Any Photo or Logo', description: 'Choose any portrait, pet picture, car, or brand mark.' },
      { step: 2, title: 'Select Matrix Character Matrix & Phosphor Glow', description: 'Pick Matrix Katakana/Binary, classic ASCII, or Hexadecimal.' },
      { step: 3, title: 'Export Cyber Art as PNG or Text', description: 'Download your glowing Matrix wallpaper or copy the raw ASCII text string.' }
    ],
    formatComparison: [
      { feature: 'Visual Aesthetic', fromVal: 'Standard photographic color pixels', toVal: 'Matrix green phosphor character matrix on obsidian background' },
      { feature: 'Output Types', fromVal: 'Standard static image', toVal: 'High-res glowing PNG wallpaper + Raw copyable ASCII text' }
    ],
    seoKeywords: {
      shortTail: ['matrix image converter', 'image to ascii', 'matrix photo generator', 'cyberpunk photo effect'],
      longTail: ['convert picture into green matrix rain code text', 'free online matrix film style ascii art generator']
    },
    faq: [
      { question: 'Can I copy the generated ASCII text directly?', answer: 'Yes! You can either download the high-resolution green glowing PNG wallpaper or copy the raw text representation with one click.' }
    ],
    options: {
      supportsMatrixArt: true
    }
  },

  // 10. PDF to JPG
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    slug: 'pdf-to-jpg',
    category: 'convert-pdf',
    categoryName: 'Convert from PDF',
    fromFormat: 'PDF',
    toFormat: 'JPG',
    badge: 'Fast & Lightweight',
    shortDescription: 'Convert PDF document pages into universally compatible JPEG photos with adjustable compression.',
    longDescription: 'Transform multi-page PDF files into compact, universally compatible JPG images. Ideal for social sharing, messaging apps, and embedding into presentations.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [{ persona: 'Content Creators', useCase: 'Post slide deck previews on LinkedIn and Twitter.' }],
    whereToUse: [{ scenario: 'Social Media Carousels', benefit: 'Directly upload converted PDF slides as JPG carousel slides.' }],
    steps: [
      { step: 1, title: 'Select PDF', description: 'Drop your PDF document.' },
      { step: 2, title: 'Set Quality', description: 'Choose JPEG compression quality.' },
      { step: 3, title: 'Download JPGs', description: 'Download all page images in seconds.' }
    ],
    formatComparison: [
      { feature: 'Format', fromVal: 'PDF Document', toVal: 'Universal JPEG Image' }
    ],
    seoKeywords: {
      shortTail: ['pdf to jpg', 'convert pdf to jpg', 'pdf to jpeg online'],
      longTail: ['free batch pdf to jpg converter high resolution']
    },
    faq: [{ question: 'Is PDF to JPG free?', answer: 'Yes, 100% free with unlimited conversions in your browser.' }],
    options: { supportsQuality: true, supportsMultiPage: true }
  },

  // 11. PNG to SVG (Vector Tracing)
  {
    id: 'png-to-svg',
    name: 'PNG to SVG Vectorizer',
    slug: 'png-to-svg',
    category: 'convert-svg',
    categoryName: 'Convert to SVG',
    fromFormat: 'PNG',
    toFormat: 'SVG',
    badge: 'Vectorize Raster Shapes',
    shortDescription: 'Convert raster PNG logos and sketches into clean, scalable SVG vector paths with smart thresholding.',
    longDescription: 'Vectorize raster PNG logos, icons, and black-and-white line art into clean scalable SVG paths that scale infinitely without pixelation.',
    acceptedFileTypes: ['.png', 'image/png'],
    whoCanUse: [{ persona: 'Logo Designers', useCase: 'Convert low-res client PNG logos into vector paths.' }],
    whereToUse: [{ scenario: 'T-Shirt & Merch Printing', benefit: 'Print shops require vector SVG or EPS files for screen printing.' }],
    steps: [
      { step: 1, title: 'Upload PNG Logo', description: 'Upload a high-contrast PNG image.' },
      { step: 2, title: 'Adjust Vectorization Sensitivity', description: 'Fine-tune color threshold and edge smoothness.' },
      { step: 3, title: 'Download SVG Path', description: 'Export your scalable vector SVG file.' }
    ],
    formatComparison: [{ feature: 'Type', fromVal: 'Pixel Grid (Blurry on zoom)', toVal: 'Infinitely Scalable Vectors' }],
    seoKeywords: {
      shortTail: ['png to svg', 'vectorize png', 'convert png to vector svg free'],
      longTail: ['how to vectorize png logo into clean svg paths free']
    },
    faq: [{ question: 'Does it work best with high-contrast logos?', answer: 'Yes! High-contrast logos, line art, and typography produce the cleanest vector outlines.' }],
    options: { supportsSvgVectorize: true }
  },

  // 12. WebP to PNG
  {
    id: 'webp-to-png',
    name: 'WebP to PNG Converter',
    slug: 'webp-to-png',
    category: 'convert-png',
    categoryName: 'Convert from WebP',
    fromFormat: 'WEBP',
    toFormat: 'PNG',
    badge: 'Full Transparency Preserved',
    shortDescription: 'Convert Google WebP images back into widely supported lossless PNG files with preserved alpha channels.',
    longDescription: 'WebP is great for the web, but many older desktop tools and video editors still do not support it. Convert any WebP image back into standard PNG format effortlessly.',
    acceptedFileTypes: ['.webp', 'image/webp'],
    whoCanUse: [{ persona: 'Video Editors', useCase: 'Import web graphics into Premiere Pro or After Effects without plugin errors.' }],
    whereToUse: [{ scenario: 'Legacy App Compatibility', benefit: 'Load assets into design tools that lack native WebP decoding.' }],
    steps: [
      { step: 1, title: 'Upload WebP Image', description: 'Select any .webp file.' },
      { step: 2, title: 'Instant Processing', description: 'Processed in browser memory instantly.' },
      { step: 3, title: 'Download Lossless PNG', description: 'Get your full-compatibility PNG.' }
    ],
    formatComparison: [{ feature: 'Compatibility', fromVal: 'Web-first format', toVal: '100% universal desktop & editor compatibility' }],
    seoKeywords: { shortTail: ['webp to png', 'convert webp to png', 'save webp as png'], longTail: ['how to convert webp to png on mac and windows free'] },
    faq: [{ question: 'Does it preserve transparency?', answer: 'Yes, full alpha transparency is preserved in the resulting PNG.' }],
    options: {}
  },

  // 13. JPG to WebP
  {
    id: 'jpg-to-webp',
    name: 'JPG to WebP Converter',
    slug: 'jpg-to-webp',
    category: 'convert-webp',
    categoryName: 'Convert to WebP',
    fromFormat: 'JPG',
    toFormat: 'WEBP',
    badge: 'Shrink Photos 40%',
    shortDescription: 'Compress heavy JPG and JPEG photos into modern WebP format for faster website loading speeds.',
    longDescription: 'Convert high-resolution JPEG photos to modern WebP with superior predictive compression algorithms. Cut website weight and pass Core Web Vitals with flying colors.',
    acceptedFileTypes: ['.jpg', '.jpeg', 'image/jpeg'],
    whoCanUse: [{ persona: 'Website Owners', useCase: 'Speed up website load times.' }],
    whereToUse: [{ scenario: 'Hero Banners & Galleries', benefit: 'Load high-definition imagery with half the bandwidth.' }],
    steps: [
      { step: 1, title: 'Upload JPG', description: 'Select any JPEG image.' },
      { step: 2, title: 'Set Quality', description: 'Tune compression balance.' },
      { step: 3, title: 'Download WebP', description: 'Save your modern web asset.' }
    ],
    formatComparison: [{ feature: 'Payload Size', fromVal: 'Standard JPEG size', toVal: '35% to 50% smaller at equal visual quality' }],
    seoKeywords: { shortTail: ['jpg to webp', 'convert jpg to webp', 'jpeg to webp online'], longTail: ['batch convert jpeg to webp for wordpress free'] },
    faq: [{ question: 'Is WebP supported on iPhones?', answer: 'Yes, all modern versions of iOS (Safari) fully support WebP.' }],
    options: { supportsQuality: true }
  },

  // 14. Image Resize & Scale
  {
    id: 'image-resize',
    name: 'Image Resizer & Dimensions Scaler',
    slug: 'image-resize',
    category: 'optimize-edit',
    categoryName: 'Optimize & Edit',
    fromFormat: 'IMG',
    toFormat: 'IMG',
    badge: 'Exact Pixels & Aspect Lock',
    shortDescription: 'Resize photos and graphics by exact pixel width and height, or scale by percentage with aspect ratio lock.',
    longDescription: 'Scale pictures up or down with high-quality bicubic interpolation. Maintain exact proportions or stretch to fit specific dimension guidelines.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', 'image/*'],
    whoCanUse: [{ persona: 'Social Media Managers', useCase: 'Resize images to exact YouTube thumbnail (1280x720) or Instagram (1080x1080) specs.' }],
    whereToUse: [{ scenario: 'Banner & Header Standardization', benefit: 'Ensure uniform image dimensions across entire websites.' }],
    steps: [
      { step: 1, title: 'Upload Image', description: 'Select your photo.' },
      { step: 2, title: 'Enter Width & Height', description: 'Set pixel dimensions or scale percentage.' },
      { step: 3, title: 'Download Resized Image', description: 'Save the resized image.' }
    ],
    formatComparison: [{ feature: 'Pixel Grid', fromVal: 'Original dimensions', toVal: 'Exact target resolution with smooth resampling' }],
    seoKeywords: { shortTail: ['resize image', 'image resizer online', 'scale photo pixels'], longTail: ['resize image to exact pixels free online no watermarks'] },
    faq: [{ question: 'Can I lock the aspect ratio?', answer: 'Yes, aspect ratio lock is enabled by default to prevent distortion.' }],
    options: { supportsScale: true }
  },

  // 15. Image Crop
  {
    id: 'image-crop',
    name: 'Image Crop Tool',
    slug: 'image-crop',
    category: 'optimize-edit',
    categoryName: 'Optimize & Edit',
    fromFormat: 'IMG',
    toFormat: 'IMG',
    badge: '16:9, 1:1, 4:3 Presets',
    shortDescription: 'Crop unwanted margins, focus on key subjects, and trim photos to standard aspect ratios.',
    longDescription: 'Easily crop photos to popular aspect ratios (Square 1:1, Cinema 16:9, Classic 4:3, Portrait 9:16) with instant visual previews and pixel-accurate bounds.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    whoCanUse: [{ persona: 'Photographers', useCase: 'Frame compositions perfectly for print or portfolio display.' }],
    whereToUse: [{ scenario: 'Profile Avatars', benefit: 'Crop rectangular photos into clean 1:1 squares.' }],
    steps: [
      { step: 1, title: 'Upload Photo', description: 'Choose your picture.' },
      { step: 2, title: 'Select Aspect Ratio', description: 'Pick 1:1, 16:9, 4:3 or freeform.' },
      { step: 3, title: 'Export Cropped Image', description: 'Download your trimmed image.' }
    ],
    formatComparison: [{ feature: 'Canvas Bounds', fromVal: 'Full uncropped frame', toVal: 'Tightened, focused subject canvas' }],
    seoKeywords: { shortTail: ['crop image', 'crop photo online', 'image cropper free'], longTail: ['crop picture to square 1:1 online without software'] },
    faq: [{ question: 'Does cropping reduce resolution?', answer: 'Cropping removes outside pixels while keeping 100% of the original resolution of the cropped area.' }],
    options: {}
  },

  // 16. Grayscale & Monochrome Filter
  {
    id: 'image-grayscale',
    name: 'Grayscale & Black/White Filter',
    slug: 'image-grayscale',
    category: 'optimize-edit',
    categoryName: 'Optimize & Edit',
    fromFormat: 'IMG',
    toFormat: 'IMG',
    badge: 'Save Ink & Vintage Look',
    shortDescription: 'Convert color images and scanned documents into pure grayscale or high-contrast black and white.',
    longDescription: 'Remove distracting color casts from scanned documents and give photos a dramatic monochrome aesthetic while saving expensive printer ink.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    whoCanUse: [{ persona: 'Office Workers & Students', useCase: 'Prepare color documents for economical black and white laser printing.' }],
    whereToUse: [{ scenario: 'Document Printing', benefit: 'Prevent color toner waste when printing text and diagrams.' }],
    steps: [
      { step: 1, title: 'Upload Photo or Document', description: 'Select any color file.' },
      { step: 2, title: 'Adjust Contrast / Luminance', description: 'Preview pure grayscale or stark monochrome.' },
      { step: 3, title: 'Download Black & White Asset', description: 'Save your print-ready monochrome file.' }
    ],
    formatComparison: [{ feature: 'Color Channels', fromVal: 'RGB 3-channel 24-bit color', toVal: 'Single channel 8-bit luminance' }],
    seoKeywords: { shortTail: ['convert image to black and white', 'grayscale photo', 'black and white converter'], longTail: ['make photo grayscale online free save printer ink'] },
    faq: [{ question: 'Does grayscale reduce file size?', answer: 'Yes! Removing color channels often reduces uncompressed bitmap memory requirements by 66%.' }],
    options: {}
  },

  // 17. Image Rotate & Flip
  {
    id: 'image-rotate',
    name: 'Image Rotate & Flip Tool',
    slug: 'image-rotate',
    category: 'optimize-edit',
    categoryName: 'Optimize & Edit',
    fromFormat: 'IMG',
    toFormat: 'IMG',
    badge: '90° / 180° & Mirror',
    shortDescription: 'Rotate upside-down scans and smartphone photos 90° clockwise, counterclockwise, or flip horizontally.',
    longDescription: 'Fix incorrect smartphone orientation tags and mirror images horizontally or vertically in a single click with zero loss in resolution.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    whoCanUse: [{ persona: 'Everyone', useCase: 'Quickly straighten sideways photos taken on phones.' }],
    whereToUse: [{ scenario: 'Scan Corrections', benefit: 'Straighten upside-down receipts and contracts.' }],
    steps: [
      { step: 1, title: 'Upload Sideways Picture', description: 'Upload your file.' },
      { step: 2, title: 'Click Rotate 90° or Flip', description: 'Orient correctly in the live viewer.' },
      { step: 3, title: 'Download Straightened File', description: 'Save your corrected image.' }
    ],
    formatComparison: [{ feature: 'Orientation', fromVal: 'Wrong angle / upside-down', toVal: 'Correct upright orientation' }],
    seoKeywords: { shortTail: ['rotate image', 'flip photo', 'rotate picture 90 degrees'], longTail: ['rotate sideways photo online free without quality loss'] },
    faq: [{ question: 'Does rotating reduce quality?', answer: 'No, rotation maintains original pixel clarity.' }],
    options: {}
  },

  // 18. Image to BMP
  {
    id: 'image-to-bmp',
    name: 'Image to BMP Converter',
    slug: 'image-to-bmp',
    category: 'icon-tools',
    categoryName: 'Icon Tools',
    fromFormat: 'IMG',
    toFormat: 'BMP',
    badge: 'Uncompressed Windows Bitmap',
    shortDescription: 'Convert PNG, JPG, and WebP images to standard Windows Bitmap (BMP) format for legacy hardware and microcontroller screens.',
    longDescription: 'Generate raw, uncompressed 24-bit BMP image files ideal for embedded systems (Arduino, Raspberry Pi, e-paper displays) and legacy industrial software.',
    acceptedFileTypes: ['.png', '.jpg', '.jpeg', '.webp', 'image/*'],
    whoCanUse: [{ persona: 'Hardware Engineers & Makers', useCase: 'Load bitmaps onto SPI TFT and OLED microcontrollers.' }],
    whereToUse: [{ scenario: 'Embedded Displays', benefit: 'Many microcontrollers only have drivers to decode raw BMP files.' }],
    steps: [
      { step: 1, title: 'Upload Image', description: 'Choose your graphic.' },
      { step: 2, title: 'Set Target Dimensions', description: 'Resize to match hardware screen.' },
      { step: 3, title: 'Download BMP', description: 'Export your raw bitmap.' }
    ],
    formatComparison: [{ feature: 'Encoding', fromVal: 'Compressed container', toVal: 'Raw uncompressed raster bitmap headers' }],
    seoKeywords: { shortTail: ['image to bmp', 'png to bmp', 'jpg to bmp converter'], longTail: ['convert image to 24 bit bmp for arduino e-paper display'] },
    faq: [{ question: 'Why use BMP today?', answer: 'BMP is uncompressed, making it exceptionally easy for simple microcontrollers without JPEG/PNG decoders to render.' }],
    options: { supportsScale: true }
  }
];

export const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', count: TOOLS_DATA.length },
  { id: 'popular', name: 'Most Popular', count: TOOLS_DATA.filter(t => t.isPopular).length },
  { id: 'convert-pdf', name: 'Convert from PDF', count: TOOLS_DATA.filter(t => t.categoryName === 'Convert from PDF').length },
  { id: 'convert-svg', name: 'Vector & SVG Tools', count: TOOLS_DATA.filter(t => t.categoryName.includes('SVG')).length },
  { id: 'convert-webp', name: 'Modern WebP & AVIF', count: TOOLS_DATA.filter(t => t.categoryName.includes('WebP')).length },
  { id: 'icon-tools', name: 'Icons & Creative Cyber', count: TOOLS_DATA.filter(t => t.category === 'icon-tools').length },
  { id: 'optimize-edit', name: 'Optimize & Edit', count: TOOLS_DATA.filter(t => t.category === 'optimize-edit').length }
];
