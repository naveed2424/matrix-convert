import { ToolDefinition, MimageCategoryId } from '../types';

const CATEGORY_LABELS: Record<MimageCategoryId, string> = {
  'image-tools': 'Image Tools',
  'pdf-tools': 'PDF Tools',
  'file-converters': 'File Converters',
  'gif-video-tools': 'GIF & Video Tools',
  'privacy-tools': 'Privacy Tools',
  'design-tools': 'Design Tools',
  'developer-tools': 'Developer Tools'
};

interface CompactToolInput {
  id: string;
  name: string;
  category: MimageCategoryId;
  fromFormat: string;
  toFormat: string;
  badge: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  shortDescription: string;
  longDescription: string;
  acceptedFileTypes: string[];
  whoCanUse: { persona: string; useCase: string }[];
  whereToUse: { scenario: string; benefit: string }[];
  steps: { title: string; description: string }[];
  formatComparison: { feature: string; fromVal: string; toVal: string }[];
  shortTail: string[];
  longTail: string[];
  faq: { question: string; answer: string }[];
  limitations: string[];
  troubleshooting: { issue: string; fix: string }[];
  options?: ToolDefinition['options'];
}

function buildTool(cfg: CompactToolInput): ToolDefinition {
  return {
    id: cfg.id,
    name: cfg.name,
    slug: cfg.id,
    category: cfg.category,
    categoryName: CATEGORY_LABELS[cfg.category],
    fromFormat: cfg.fromFormat,
    toFormat: cfg.toFormat,
    badge: cfg.badge,
    isPopular: cfg.isPopular ?? false,
    isRecentlyAdded: true,
    isRecommended: cfg.isRecommended ?? false,
    processingMode: 'browser-local',
    maxRecommendedSizeMb: 60,
    shortDescription: cfg.shortDescription,
    longDescription: cfg.longDescription,
    acceptedFileTypes: cfg.acceptedFileTypes,
    limitations: cfg.limitations,
    troubleshooting: cfg.troubleshooting,
    whoCanUse: cfg.whoCanUse,
    whereToUse: cfg.whereToUse,
    steps: cfg.steps.map((s, idx) => ({
      step: idx + 1,
      title: s.title,
      description: s.description
    })),
    formatComparison: cfg.formatComparison,
    seoKeywords: {
      shortTail: cfg.shortTail,
      longTail: cfg.longTail
    },
    faq: cfg.faq,
    options: cfg.options ?? {}
  };
}

export const EXTRA_CONVERTER_TOOLS: ToolDefinition[] = [
  // 1. PDF to Markdown (High LLM / RAG Demand)
  buildTool({
    id: 'pdf-to-markdown',
    name: 'PDF to Markdown Converter',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'MD',
    badge: 'LLM & RAG Ready',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Convert PDF documents into structured Markdown (.md) with inferred headings and lists for ChatGPT, Claude, Notion, and Obsidian.',
    longDescription: 'Parse multi-page PDF documents locally into clean Markdown markup. Automatically promotes larger heading fonts into ## and ### sections, preserves bullet points, and outputs copyable or downloadable .md files ready for LLM context windows and RAG vector databases.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'AI Engineers & Prompt Builders', useCase: 'Feed clean, low-token Markdown chunks into Claude, ChatGPT, or LlamaIndex pipelines instead of messy raw text dumps.' },
      { persona: 'Technical Writers & Obsidian Users', useCase: 'Import PDF whitepapers and manuals directly into Markdown note vaults cleanly.' }
    ],
    whereToUse: [
      { scenario: 'RAG Knowledge Base Ingestion', benefit: 'Structured Markdown headings improve chunk splitting and retrieval accuracy.' },
      { scenario: 'Private Legal & Research Prompts', benefit: 'Zero cloud upload keeps confidential contracts inside your own browser memory.' }
    ],
    steps: [
      { title: 'Drop Your PDF Document', description: 'Select one or multiple PDF files with selectable text layers.' },
      { title: 'Analyze Font Hierarchy Locally', description: 'Mimage inspects text item bounding boxes and font sizes to reconstruct headings and lists.' },
      { title: 'Copy or Download .MD File', description: 'Copy Markdown directly into your LLM prompt or save the .md file.' }
    ],
    formatComparison: [
      { feature: 'AI Token Efficiency', fromVal: 'Raw binary streams / noisy PDF layout', toVal: 'Clean plain-text Markdown syntax' },
      { feature: 'Heading Hierarchy', fromVal: 'Visual font sizes only', toVal: 'Semantic # / ## / ### headings' }
    ],
    shortTail: ['pdf to markdown', 'convert pdf to md', 'pdf to markdown llm', 'pdf to md online free'],
    longTail: ['convert confidential pdf to markdown locally for chatgpt and obsidian', 'client side pdf to markdown rag parser'],
    faq: [
      { question: 'Does PDF to Markdown work on scanned image PDFs?', answer: 'Only PDFs with an embedded text layer can be parsed directly into Markdown. For camera scans, use our OCR Text Extractor first.' },
      { question: 'Can I copy the Markdown output without downloading?', answer: 'Yes. A live copyable Markdown preview opens right beneath your converted file card.' }
    ],
    limitations: [
      'Scanned PDFs without a text layer require running OCR Text Extractor first.',
      'Complex multi-column magazines or dense math formulas may linearize slightly out of visual column order.'
    ],
    troubleshooting: [
      { issue: 'Output says no selectable text layer found', fix: 'Your PDF is composed of flat images; open OCR Text Extractor to recognize text.' }
    ]
  }),

  // 2. PDF to JSON
  buildTool({
    id: 'pdf-to-json',
    name: 'PDF to JSON Structured Extractor',
    category: 'developer-tools',
    fromFormat: 'PDF',
    toFormat: 'JSON',
    badge: 'Structured Schema',
    isRecommended: true,
    shortDescription: 'Extract PDF pages, dimensions, word counts, and font-tagged text lines into machine-readable JSON.',
    longDescription: 'Convert PDF documents into clean JSON objects organized by page number, PDF point dimensions, character metrics, and extracted line arrays with font sizes for programmatic ingestion.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Backend & LLM Pipeline Developers', useCase: 'Inspect PDF text structure, word metrics, and coordinates without installing server-side Python libraries.' },
      { persona: 'QA & Data Automation Engineers', useCase: 'Validate invoice or report PDF outputs against automated JSON assertions.' }
    ],
    whereToUse: [
      { scenario: 'Document Parsing Prototyping', benefit: 'Quickly inspect page geometry and font metrics directly in a readable JSON payload.' }
    ],
    steps: [
      { title: 'Upload PDF', description: 'Select any text-based PDF file.' },
      { title: 'Extract Per-Page JSON Tree', description: 'Browser WebAssembly parses text items, font heights, and dimensions.' },
      { title: 'Copy or Save .JSON', description: 'Copy formatted JSON directly or download the .json file.' }
    ],
    formatComparison: [
      { feature: 'Programmatic Parsing', fromVal: 'Requires binary PDF parser', toVal: 'Native JSON.parse() ready across every language' }
    ],
    shortTail: ['pdf to json', 'convert pdf to json', 'extract pdf text as json'],
    longTail: ['convert pdf pages and metadata to structured json locally in browser'],
    faq: [
      { question: 'What fields are included in the output JSON?', answer: 'Each page object includes pageNumber, dimensions (width/height in pt), wordCount, characterCount, font-tagged lines, and joined page text.' }
    ],
    limitations: [
      'Raster-only scanned PDFs do not expose embedded text runs.',
      'Does not export embedded bitmap images as base64 inside the JSON object.'
    ],
    troubleshooting: [
      { issue: 'Pages show empty line arrays', fix: 'Verify the PDF contains selectable text by highlighting a word in a PDF viewer.' }
    ]
  }),

  // 3. PDF to HTML
  buildTool({
    id: 'pdf-to-html',
    name: 'PDF to HTML Webpage Converter',
    category: 'developer-tools',
    fromFormat: 'PDF',
    toFormat: 'HTML',
    badge: 'Semantic HTML5',
    shortDescription: 'Transform text-based PDF documents into clean, standalone responsive HTML5 files with built-in typography CSS.',
    longDescription: 'Convert PDF handbooks, whitepapers, and manuals into lightweight, browser-accessible HTML5 documents with semantic headings, readable paragraphs, and zero third-party server dependencies.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Web Publishers & Documentation Teams', useCase: 'Move static PDF brochures and manuals into mobile-friendly responsive web pages.' }
    ],
    whereToUse: [
      { scenario: 'Accessible Web Publishing', benefit: 'HTML reflows gracefully on smartphone viewports unlike fixed-width PDFs.' }
    ],
    steps: [
      { title: 'Drop PDF Document', description: 'Load your PDF in the browser workspace.' },
      { title: 'Reconstruct Semantic Markup', description: 'Headings and paragraphs are mapped cleanly to HTML5 sections.' },
      { title: 'Download or Copy .HTML', description: 'Save a complete self-contained HTML5 document.' }
    ],
    formatComparison: [
      { feature: 'Mobile Reflow', fromVal: 'Requires pinch-to-zoom on fixed pages', toVal: 'Fluid responsive viewport typography' }
    ],
    shortTail: ['pdf to html', 'convert pdf to html', 'pdf to webpage online free'],
    longTail: ['convert pdf document to clean responsive html5 without server upload'],
    faq: [
      { question: 'Does the HTML output require external CSS files?', answer: 'No. Clean embedded system-font CSS is included directly in the HTML head so it opens cleanly offline.' }
    ],
    limitations: [
      'Focuses on clean semantic text structure rather than absolute pixel-positioned CSS clones or embedded PDF illustrations.'
    ],
    troubleshooting: [
      { issue: 'Complex brochures lose floating sidebar graphics', fix: 'Use PDF to PNG or PDF to SVG when exact visual fidelity matters more than reflowable HTML text.' }
    ]
  }),

  // 4. PDF to WebP
  buildTool({
    id: 'pdf-to-webp',
    name: 'PDF to WebP Image Converter',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'WEBP',
    badge: 'Smallest Web Image Size',
    isPopular: true,
    shortDescription: 'Render every PDF page as ultra-lightweight WebP images with selectable DPI (72/150/300) and bulk ZIP export.',
    longDescription: 'Convert PDF slides, reports, and posters directly into Google WebP format—cutting image file sizes dramatically compared to PNG and JPG while retaining sharp text clarity and optional transparency.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Web Developers & SEO Publishers', useCase: 'Publish document previews and slide carousels with blazing fast Core Web Vitals.' }
    ],
    whereToUse: [
      { scenario: 'Blog Previews & Documentation Thumbnails', benefit: 'Serve high-DPI page renders at a fraction of PNG bandwidth.' }
    ],
    steps: [
      { title: 'Upload PDF', description: 'Select single or multi-page PDF documents.' },
      { title: 'Choose DPI & Quality', description: 'Pick 72, 150, or 300 DPI and tune WebP compression quality.' },
      { title: 'Download WebP or ZIP', description: 'Download individual WebP page renders or export every page in one ZIP.' }
    ],
    formatComparison: [
      { feature: 'Payload Weight', fromVal: 'Heavy PDF download or large PNG export', toVal: '35%–70% smaller next-gen WebP images' }
    ],
    shortTail: ['pdf to webp', 'convert pdf to webp', 'pdf pages to webp zip'],
    longTail: ['convert multi page pdf to compressed webp images online free'],
    faq: [
      { question: 'Can I keep transparent margins on PDF to WebP?', answer: 'Yes! Leave Background set to Transparent to preserve alpha transparency around vector artwork.' }
    ],
    limitations: [
      'Very large multi-page PDFs rendered at 300 DPI consume significant browser RAM; use 150 DPI for long documents.'
    ],
    troubleshooting: [
      { issue: 'Browser slows down on 50+ page PDFs', fix: 'Lower DPI to 72 or 150 DPI, or split the PDF into smaller ranges first.' }
    ],
    options: { supportsDpi: true, supportsBackground: true, supportsQuality: true, supportsMultiPage: true }
  }),

  // 5. PDF to Word-Compatible RTF
  buildTool({
    id: 'pdf-to-word-rtf',
    name: 'PDF to Word (RTF Document) Converter',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'RTF',
    badge: 'Opens in MS Word & Docs',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Convert PDF text documents into editable Rich Text Format (.rtf) files that open natively in Microsoft Word, LibreOffice, and Google Docs.',
    longDescription: 'Turn read-only PDF contracts, essays, and reports into editable word-processor documents locally in your browser. Outputs standards-compliant .rtf with Unicode escaping, heading sizing, and page breaks ready for immediate editing in Word.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Students, Lawyers & Office Teams', useCase: 'Recover editable text and heading structure from PDF handouts or drafts without paying for desktop PDF suites.' }
    ],
    whereToUse: [
      { scenario: 'Editing Locked Contracts or Legacy Drafts', benefit: 'Open the .rtf file directly in Microsoft Word and save as .docx if needed.' }
    ],
    steps: [
      { title: 'Select PDF Document', description: 'Drop your text-based PDF into the local workspace.' },
      { title: 'Build Rich Text Flow', description: 'Font weights, headings, and page breaks convert into Word-compatible RTF.' },
      { title: 'Download .RTF & Open in Word', description: 'Double-click the downloaded .rtf file to edit inside Word or LibreOffice.' }
    ],
    formatComparison: [
      { feature: 'Editability', fromVal: 'Fixed uneditable page layout', toVal: 'Directly editable paragraphs and headings in Word' }
    ],
    shortTail: ['pdf to word', 'pdf to rtf', 'convert pdf to editable word document free'],
    longTail: ['convert confidential pdf to editable microsoft word rtf locally no upload'],
    faq: [
      { question: 'Why does Mimage export RTF instead of complex binary DOCX?', answer: 'Rich Text Format (.rtf) opens natively inside every version of Microsoft Word, Google Docs, Apple Pages, and LibreOffice without relying on closed cloud conversion servers, keeping confidential contracts 100% on your device.' }
    ],
    limitations: [
      'Converts embedded text and heading flow; complex multi-column tables, floating logos, and embedded charts simplify into sequential paragraphs.',
      'Scanned image-only PDFs cannot be converted directly without running OCR first.'
    ],
    troubleshooting: [
      { issue: 'Notice says no selectable text layer found', fix: 'The PDF contains flat scanned page images; use our OCR Text Extractor tool.' }
    ]
  }),

  // 6. PDF to CSV
  buildTool({
    id: 'pdf-to-csv',
    name: 'PDF to CSV Table Extractor',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'CSV',
    badge: 'Spreadsheet Table Export',
    isPopular: true,
    shortDescription: 'Extract tabular rows and spaced columns from PDF bank statements, invoices, and reports into Excel-ready CSV.',
    longDescription: 'Cluster horizontal X/Y text runs from PDF tables into clean comma-separated values (.csv) ready to open inside Excel, Google Sheets, or pandas scripts—completely offline in your browser.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Accountants & Financial Analysts', useCase: 'Pull line items out of PDF invoices, price sheets, and statements into Excel without manual retyping.' }
    ],
    whereToUse: [
      { scenario: 'Spreadsheet Cleanup & BI Imports', benefit: 'RFC 4180 CSV quoting protects commas inside numbers and descriptions.' }
    ],
    steps: [
      { title: 'Drop Tabular PDF', description: 'Upload your invoice, statement, or table report.' },
      { title: 'Cluster Column Gaps', description: 'Coordinates group aligned text runs into distinct spreadsheet columns.' },
      { title: 'Download or Copy .CSV', description: 'Open cleanly in Microsoft Excel or Google Sheets.' }
    ],
    formatComparison: [
      { feature: 'Spreadsheet Utility', fromVal: 'Locked visual columns inside PDF', toVal: 'Sortable, formula-ready CSV cells' }
    ],
    shortTail: ['pdf to csv', 'extract table from pdf to excel csv', 'convert pdf statement to csv'],
    longTail: ['privacy safe pdf bank statement to csv converter in browser'],
    faq: [
      { question: 'How does Mimage split columns without border lines?', answer: 'It measures the horizontal PDF coordinate gap between text tokens on each baseline row and separates cells whenever horizontal spacing exceeds standard word gaps.' }
    ],
    limitations: [
      'Heavily merged cells, wrapped multi-line cells inside one table row, or scanned PDFs may require minor cleanup in Excel after export.'
    ],
    troubleshooting: [
      { issue: 'Columns merged together into one cell', fix: 'Narrowly spaced tables with minimal whitespace between columns may require manual Text-to-Columns tuning in Excel.' }
    ]
  }),

  // 7. Markdown to PDF
  buildTool({
    id: 'markdown-to-pdf',
    name: 'Markdown to PDF Converter',
    category: 'pdf-tools',
    fromFormat: 'MD',
    toFormat: 'PDF',
    badge: 'Clean Typography PDF',
    isPopular: true,
    shortDescription: 'Compile READMEs, LLM answers, and Markdown (.md) notes into cleanly paginated A4 PDF documents.',
    longDescription: 'Convert technical Markdown documents into polished printable PDFs right inside your browser. Parses # headings, bold styling, bullet and numbered lists, blockquotes, and monospace fenced code blocks automatically.',
    acceptedFileTypes: ['.md', '.markdown', '.txt', 'text/markdown', 'text/plain'],
    whoCanUse: [
      { persona: 'Developers & Researchers', useCase: 'Turn GitHub README files, ChatGPT Markdown drafts, and Obsidian notes into shareable client PDFs.' }
    ],
    whereToUse: [
      { scenario: 'Client Proposal & Documentation Handoff', benefit: 'Consistent paginated typography without needing Pandoc or LaTeX installed.' }
    ],
    steps: [
      { title: 'Upload Markdown File', description: 'Select any .md or .markdown text file.' },
      { title: 'Parse Headings & Code Blocks', description: 'Headings scale hierarchically and code blocks format in monospace.' },
      { title: 'Download Paginated PDF', description: 'Save a ready-to-print A4 PDF immediately.' }
    ],
    formatComparison: [
      { feature: 'Recipient Viewing', fromVal: 'Raw plain-text # asterisks', toVal: 'Formatted typographic A4 pages' }
    ],
    shortTail: ['markdown to pdf', 'md to pdf', 'convert md file to pdf online'],
    longTail: ['convert github readme markdown file to formatted pdf free'],
    faq: [
      { question: 'Are fenced code blocks preserved?', answer: 'Yes! Text inside triple-backtick fences renders in clean monospace Courier font with indentation.' }
    ],
    limitations: [
      'Uses built-in PDF Helvetica and Courier fonts; external remote images linked via URL inside Markdown are referenced as captions rather than fetched over network.'
    ],
    troubleshooting: [
      { issue: 'Special emoji symbols appear blank', fix: 'Standard PDF Type-1 fonts support ASCII and Latin characters cleanly; avoid rare bitmap emojis in source Markdown.' }
    ]
  }),

  // 8. HTML to PDF
  buildTool({
    id: 'html-to-pdf',
    name: 'HTML to PDF Converter',
    category: 'pdf-tools',
    fromFormat: 'HTML',
    toFormat: 'PDF',
    badge: 'Sanitized Safe Export',
    shortDescription: 'Convert local HTML files into clean, script-stripped paginated PDF documents locally in your browser.',
    longDescription: 'Parse HTML pages securely through DOMParser—stripping all executable scripts and trackers—and convert semantic headings, paragraphs, lists, and code blocks into a crisp paginated A4 PDF.',
    acceptedFileTypes: ['.html', '.htm', 'text/html'],
    whoCanUse: [
      { persona: 'Compliance Auditors & Web Teams', useCase: 'Archive local HTML reports, email templates, and static docs into clean printable PDFs.' }
    ],
    whereToUse: [
      { scenario: 'Offline Report Archiving', benefit: 'Sanitizes script tags completely while creating immutable document records.' }
    ],
    steps: [
      { title: 'Drop HTML File', description: 'Select a .html or .htm file from disk.' },
      { title: 'Sanitize & Paginate', description: 'DOMParser strips scripts and formats readable document blocks.' },
      { title: 'Download PDF', description: 'Export clean paginated A4 PDF.' }
    ],
    formatComparison: [
      { feature: 'Execution Safety', fromVal: 'Active DOM markup with scripts', toVal: 'Static sanitized printable PDF' }
    ],
    shortTail: ['html to pdf', 'convert html file to pdf', 'htm to pdf online'],
    longTail: ['convert local html file to pdf securely without uploading'],
    faq: [
      { question: 'Does it execute JavaScript inside uploaded HTML?', answer: 'Never. HTML is parsed strictly inside an inert DOMParser tree and script/iframe elements are removed before PDF generation.' }
    ],
    limitations: [
      'Extracts semantic document flow rather than complex external CSS grid layouts or remote stylesheets.'
    ],
    troubleshooting: [
      { issue: 'Client-side SPA shells (empty <div id="root">) export blank', fix: 'Save the rendered DOM or print from the browser when converting JavaScript-hydrated SPAs.' }
    ]
  }),

  // 9. TXT to PDF
  buildTool({
    id: 'txt-to-pdf',
    name: 'Plain Text (TXT) to PDF Converter',
    category: 'pdf-tools',
    fromFormat: 'TXT',
    toFormat: 'PDF',
    badge: 'Clean A4 Pagination',
    shortDescription: 'Wrap plain .txt notes, transcripts, and log files into clean, paginated A4 PDF documents.',
    longDescription: 'Turn raw notepad drafts, meeting transcripts, and UTF-8 text logs into well-spaced, auto-wrapped A4 PDF documents with clean margins and zero character clipping.',
    acceptedFileTypes: ['.txt', '.log', 'text/plain'],
    whoCanUse: [
      { persona: 'Students, Writers & Sysadmins', useCase: 'Submit plain-text transcripts or diagnostic logs to portals that only accept PDFs.' }
    ],
    whereToUse: [
      { scenario: 'Formal Submissions', benefit: 'Automatic line wrapping prevents long paragraphs from clipping off the right edge.' }
    ],
    steps: [
      { title: 'Upload TXT File', description: 'Select one or multiple .txt files.' },
      { title: 'Auto-Wrap Lines & Paginate', description: 'Paragraphs wrap cleanly within A4 margins across pages.' },
      { title: 'Download PDF', description: 'Save your printable PDF.' }
    ],
    formatComparison: [
      { feature: 'Word Wrapping', fromVal: 'Raw unpaginated character stream', toVal: 'Cleanly wrapped A4 pages' }
    ],
    shortTail: ['txt to pdf', 'convert txt to pdf', 'text file to pdf converter'],
    longTail: ['convert plain text notepad file to clean pdf free online'],
    faq: [
      { question: 'Do long lines wrap automatically?', answer: 'Yes. Lines wider than the printable A4 area are split cleanly at word boundaries.' }
    ],
    limitations: [
      'Built-in PDF Helvetica font handles English/Latin scripts accurately; CJK or Arabic Unicode scripts require OS system Print-to-PDF for full glyph coverage.'
    ],
    troubleshooting: [
      { issue: 'Uploaded empty file error', fix: 'Verify your .txt file contains non-whitespace text.' }
    ]
  }),

  // 10. CSV to PDF Table
  buildTool({
    id: 'csv-to-pdf',
    name: 'CSV to PDF Table Converter',
    category: 'pdf-tools',
    fromFormat: 'CSV',
    toFormat: 'PDF',
    badge: 'Grid Borders & Header Bar',
    shortDescription: 'Format comma-separated spreadsheets (.csv) into neat bordered PDF tables with dark header bars and auto orientation.',
    longDescription: 'Turn raw CSV exports into readable boardroom tables in seconds. Parses RFC 4180 quoted commas, automatically switches wide datasets to landscape orientation, wraps overflowing text inside grid borders, and paginates multi-page tables.',
    acceptedFileTypes: ['.csv', 'text/csv', 'application/vnd.ms-excel'],
    whoCanUse: [
      { persona: 'Operations, Finance & Sales Teams', useCase: 'Turn CRM/Stripe/Shopify CSV exports into clean PDF handouts before meetings.' }
    ],
    whereToUse: [
      { scenario: 'Quick Tabular Reports', benefit: 'Automatic landscape flip fits up to 12 columns cleanly on A4 paper.' }
    ],
    steps: [
      { title: 'Select CSV File', description: 'Drop any comma-separated .csv file.' },
      { title: 'Render Bordered Table', description: 'Header rows highlight cleanly while cells wrap automatically.' },
      { title: 'Download Table PDF', description: 'Export ready-to-share PDF.' }
    ],
    formatComparison: [
      { feature: 'Presentation', fromVal: 'Unstyled raw comma rows', toVal: 'Styled header row with clean cell borders' }
    ],
    shortTail: ['csv to pdf', 'convert csv to pdf table', 'spreadsheet csv to pdf free'],
    longTail: ['convert large csv spreadsheet into formatted landscape pdf table'],
    faq: [
      { question: 'What happens if a CSV has more than 5 columns?', answer: 'Mimage automatically switches the PDF layout to Landscape A4 orientation to give columns generous breathing room.' }
    ],
    limitations: [
      'Capped at the first 12 columns to preserve legibility on A4 landscape sheets.'
    ],
    troubleshooting: [
      { issue: 'Too many columns clipped', fix: 'Trim unused columns before exporting to keep PDF typography readable.' }
    ]
  }),

  // 11. JSON to PDF
  buildTool({
    id: 'json-to-pdf',
    name: 'JSON to PDF Pretty Printer',
    category: 'pdf-tools',
    fromFormat: 'JSON',
    toFormat: 'PDF',
    badge: 'Syntax Indented Courier',
    shortDescription: 'Validate, pretty-print, and convert .json payloads and API responses into cleanly indented monospace PDF documents.',
    longDescription: 'Turn minified single-line JSON files into properly indented 2-space monospace code across paginated A4 PDF pages—great for API audits, security sign-offs, and compliance archiving.',
    acceptedFileTypes: ['.json', 'application/json'],
    whoCanUse: [
      { persona: 'API Developers & Security Auditors', useCase: 'Attach formatted API configuration snapshots or webhook logs to audit packets.' }
    ],
    whereToUse: [
      { scenario: 'Technical Documentation & Audits', benefit: 'Re-indents minified JSON cleanly before paginating.' }
    ],
    steps: [
      { title: 'Upload JSON File', description: 'Select any valid .json payload.' },
      { title: 'Validate & Pretty-Print', description: 'Minified JSON is validated and formatted cleanly in Courier font.' },
      { title: 'Download Paginated PDF', description: 'Save your documented payload.' }
    ],
    formatComparison: [
      { feature: 'Readability', fromVal: 'Minified raw JSON text', toVal: '2-space indented monospace pages' }
    ],
    shortTail: ['json to pdf', 'convert json to pdf', 'pretty print json pdf'],
    longTail: ['format and convert json file to paginated pdf online free'],
    faq: [
      { question: 'Does it validate JSON syntax?', answer: 'Yes! If your JSON has missing quotes or trailing commas, Mimage alerts you clearly before export.' }
    ],
    limitations: [
      'Very large multi-megabyte JSON files generate hundreds of pages and may exceed browser memory.'
    ],
    troubleshooting: [
      { issue: 'Invalid JSON syntax error', fix: 'Check for trailing commas or single quotes; standard JSON requires double-quoted keys.' }
    ]
  }),

  // 12. WebP to PDF
  buildTool({
    id: 'webp-to-pdf',
    name: 'WebP to PDF Converter',
    category: 'pdf-tools',
    fromFormat: 'WEBP',
    toFormat: 'PDF',
    badge: 'Single or Multi-Page',
    isPopular: true,
    shortDescription: 'Convert single or multiple Google WebP images cleanly into a unified printable PDF document locally.',
    longDescription: 'Many legacy PDF portals and office tools reject .webp downloads. Upload one or multiple WebP files and compile them seamlessly onto crisp white-matted PDF pages.',
    acceptedFileTypes: ['.webp', 'image/webp'],
    whoCanUse: [
      { persona: 'Everyday Users & Researchers', useCase: 'Turn web-saved .webp figures, infographics, and screenshots into printable PDFs.' }
    ],
    whereToUse: [
      { scenario: 'Web Image Printing & Sharing', benefit: 'Batch multiple WebP screenshots into one organized PDF.' }
    ],
    steps: [
      { title: 'Select WebP Images', description: 'Drop one or many .webp files.' },
      { title: 'Compile Pages Locally', description: 'Each WebP renders sharply onto its matching page.' },
      { title: 'Download PDF', description: 'Save the compiled PDF document.' }
    ],
    formatComparison: [
      { feature: 'Office Acceptance', fromVal: 'Rejected by legacy printers & portals', toVal: '100% universal PDF compatibility' }
    ],
    shortTail: ['webp to pdf', 'convert webp to pdf', 'combine webp into pdf'],
    longTail: ['convert multiple webp images into one pdf document free'],
    faq: [
      { question: 'Can I convert several WebP images into one PDF at once?', answer: 'Yes! Upload multiple WebP files in the queue and Mimage merges all of them sequentially into one PDF.' }
    ],
    limitations: [
      'Animated WebP files embed their first static frame inside the generated PDF page.'
    ],
    troubleshooting: [
      { issue: 'Transparent areas turn white', fix: 'PDF pages default to a solid white backdrop so dark ink and borders remain legible on paper.' }
    ],
    options: { supportsMultiPage: true }
  }),

  // 13. SVG to PDF
  buildTool({
    id: 'svg-to-pdf',
    name: 'SVG to PDF Converter',
    category: 'pdf-tools',
    fromFormat: 'SVG',
    toFormat: 'PDF',
    badge: 'High-Res Sanitized Render',
    shortDescription: 'Convert Scalable Vector Graphics (.svg) into crisp high-resolution PDF pages with automatic script sanitization.',
    longDescription: 'Sanitize SVG markup (stripping unsafe scripts or foreignObject tags), render at crisp 2x scale onto a clean page canvas, and package directly into a portable PDF document.',
    acceptedFileTypes: ['.svg', 'image/svg+xml'],
    whoCanUse: [
      { persona: 'Designers & Students', useCase: 'Package Figma SVG exports, diagrams, and charts into PDF portfolios.' }
    ],
    whereToUse: [
      { scenario: 'Diagram Sharing', benefit: 'Recipients open PDFs natively without SVG font or rendering quirks.' }
    ],
    steps: [
      { title: 'Upload SVG Graphic', description: 'Drop one or multiple .svg files.' },
      { title: 'Sanitize & High-Res Render', description: 'Scripts are stripped safely and artwork renders cleanly at 2x density.' },
      { title: 'Download PDF', description: 'Save a portable PDF page.' }
    ],
    formatComparison: [
      { feature: 'Viewer Reliability', fromVal: 'Depends on SVG viewer fonts', toVal: 'Identical layout across all PDF readers' }
    ],
    shortTail: ['svg to pdf', 'convert svg to pdf', 'svg diagram to pdf online'],
    longTail: ['convert safe sanitized svg graphic into high quality pdf free'],
    faq: [
      { question: 'Can I bundle multiple SVGs into one multi-page PDF?', answer: 'Yes! Drop multiple SVG files together to produce one paginated PDF document.' }
    ],
    limitations: [
      'External web fonts referenced inside SVGs via @import may fall back to browser system fonts during sandboxed rendering.'
    ],
    troubleshooting: [
      { issue: 'SVG dimensions appear very small', fix: 'Ensure the root <svg> tag declares explicit width/height or viewBox attributes.' }
    ]
  }),

  // 14. PDF to Base64
  buildTool({
    id: 'pdf-to-base64',
    name: 'PDF to Base64 Data URI Encoder',
    category: 'developer-tools',
    fromFormat: 'PDF',
    toFormat: 'BASE64',
    badge: 'Data URI & API Payload',
    shortDescription: 'Encode binary PDF files into inline Base64 Data URI strings (`data:application/pdf;base64,...`) for embeds and APIs.',
    longDescription: 'Convert local PDF files into ready-to-paste Base64 strings for JSON API payloads, HTML `<object>` embeds, and test fixtures with a live copy box and `.txt` download.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Full-Stack & API Developers', useCase: 'Build JSON payloads and inline PDF previews without uploading test PDFs to remote encoders.' }
    ],
    whereToUse: [
      { scenario: 'Webhook & Email API Testing', benefit: 'Encode PDF attachments into Base64 cleanly in one click.' }
    ],
    steps: [
      { title: 'Upload PDF File', description: 'Select the PDF file you need encoded.' },
      { title: 'Encode Binary Bytes', description: 'Chunks binary bytes safely in memory without stack overflow.' },
      { title: 'Copy or Download TXT', description: 'Copy the Base64 Data URI directly or save as .txt.' }
    ],
    formatComparison: [
      { feature: 'Size Overhead', fromVal: 'Raw binary bytes (1.0x)', toVal: 'Base64 ASCII text (~1.33x)' }
    ],
    shortTail: ['pdf to base64', 'convert pdf to base64 string', 'pdf data uri generator'],
    longTail: ['encode pdf to base64 data uri client side without size limits'],
    faq: [
      { question: 'Is the data:application/pdf;base64, prefix included?', answer: 'Yes, the Data URI prefix is prepended cleanly, ready for iframe or JSON attachment testing.' }
    ],
    limitations: [
      'Large multi-megabyte PDFs produce very long Base64 strings; the live preview box displays up to the first 120 KB while the download file contains the complete string.'
    ],
    troubleshooting: [
      { issue: 'Clipboard feels slow on large PDFs', fix: 'Use the Download TXT button instead of copying multi-megabyte strings to the OS clipboard.' }
    ]
  }),

  // 15. PDF to BMP
  buildTool({
    id: 'pdf-to-bmp',
    name: 'PDF to BMP Uncompressed Converter',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'BMP',
    badge: 'Raw 24-Bit Bitmap',
    shortDescription: 'Render PDF document pages into uncompressed 24-bit Windows BMP bitmaps at 72, 150, or 300 DPI.',
    longDescription: 'Convert PDF schematics, labels, and layouts directly into raw uncompressed 24-bit Windows Bitmap (.bmp) files required by legacy manufacturing tools, thermal printers, and embedded displays.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Industrial & Embedded Technicians', useCase: 'Generate raw pixel bitmaps from PDF CAD schematics for legacy hardware software.' }
    ],
    whereToUse: [
      { scenario: 'Legacy Software Ingestion', benefit: 'Outputs true 24-bit Windows DIB BMP headers on solid white paper backgrounds.' }
    ],
    steps: [
      { title: 'Drop PDF Document', description: 'Select any single or multi-page PDF.' },
      { title: 'Pick Target DPI', description: 'Choose 72, 150, or 300 DPI resolution.' },
      { title: 'Download BMP or ZIP', description: 'Save uncompressed .bmp pages individually or zipped.' }
    ],
    formatComparison: [
      { feature: 'Compression', fromVal: 'Vector/compressed container', toVal: 'Raw uncompressed RGB pixel matrix' }
    ],
    shortTail: ['pdf to bmp', 'convert pdf to bitmap bmp', 'pdf to windows bmp free'],
    longTail: ['convert multi page pdf into 24 bit uncompressed bmp files'],
    faq: [
      { question: 'Why are BMP files larger than PNG?', answer: 'BMP stores every RGB pixel uncompressed, making files larger but instantly decodable by simple legacy software.' }
    ],
    limitations: [
      '300 DPI uncompressed 24-bit BMP pages can easily exceed 25 MB per page.'
    ],
    troubleshooting: [
      { issue: 'Files are huge at 300 DPI', fix: 'Switch DPI preset to 72 or 150 DPI unless 300 DPI print precision is strictly needed.' }
    ],
    options: { supportsDpi: true, supportsMultiPage: true }
  }),

  // 16. PDF 2-Up Handout Booklet
  buildTool({
    id: 'pdf-2-up-handout',
    name: 'PDF 2-Up Handout & Slide Combiner',
    category: 'pdf-tools',
    fromFormat: 'PDF',
    toFormat: 'PDF',
    badge: '2 Pages Per Sheet',
    isPopular: true,
    shortDescription: 'Arrange pairs of PDF pages side-by-side onto landscape sheets to cut printing paper usage in half.',
    longDescription: 'Convert portrait lecture notes, slide decks, and reading packets into compact 2-up landscape handouts using vector `embedPage` composition—preserving razor-sharp vector text and halving sheet count.',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    whoCanUse: [
      { persona: 'Teachers, Students & Workshop Hosts', useCase: 'Print double-sided 2-up slide handouts using half as much paper.' }
    ],
    whereToUse: [
      { scenario: 'Lecture Handouts & E-Reader Spreads', benefit: 'Preserves original PDF vector clarity while halving page count.' }
    ],
    steps: [
      { title: 'Upload Multi-Page PDF', description: 'Select a PDF document with 2 or more pages.' },
      { title: 'Side-by-Side Landscape Scaling', description: 'Pairs of pages embed side-by-side onto US Letter landscape sheets.' },
      { title: 'Download 2-Up PDF', description: 'Save your compact printable PDF.' }
    ],
    formatComparison: [
      { feature: 'Paper Sheet Usage', fromVal: '1 PDF page per printed sheet', toVal: '2 PDF pages side-by-side per landscape sheet' }
    ],
    shortTail: ['pdf 2 up converter', '2 pages per sheet pdf', 'pdf handout maker'],
    longTail: ['put 2 pdf pages side by side on one landscape page free'],
    faq: [
      { question: 'Does 2-up formatting rasterize vector text?', answer: 'No! It uses pdf-lib vector page embedding so all fonts and graphics scale sharply without blur.' }
    ],
    limitations: [
      'Combines sequential page pairs (1+2, 3+4) rather than saddle-stitch magazine signatures (1+N).'
    ],
    troubleshooting: [
      { issue: 'Odd number of pages leaves half-blank final sheet', fix: 'The final odd page naturally sits cleanly on the left slot of the last sheet.' }
    ]
  }),

  // 17. WebP to JPG
  buildTool({
    id: 'webp-to-jpg',
    name: 'WebP to JPG Converter',
    category: 'file-converters',
    fromFormat: 'WEBP',
    toFormat: 'JPG',
    badge: 'Universal JPEG Export',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Convert Google WebP images into universally supported JPG photos with a clean white backdrop for transparency.',
    longDescription: 'Many desktop apps, social platforms, and document portals still fail on .webp images. Batch convert WebP downloads into standard compressed JPGs with adjustable quality right inside your browser.',
    acceptedFileTypes: ['.webp', 'image/webp'],
    whoCanUse: [
      { persona: 'Everyone & Ecommerce Sellers', useCase: 'Convert product photos downloaded as WebP into JPG for Etsy, eBay, PowerPoint, and email.' }
    ],
    whereToUse: [
      { scenario: 'PowerPoint, Word & Portal Uploads', benefit: 'Flattens transparent WebP backgrounds cleanly onto white and saves universal JPG.' }
    ],
    steps: [
      { title: 'Drop WebP Files', description: 'Select one or multiple .webp images.' },
      { title: 'Tune Quality Slider', description: 'Select 85%–95% JPEG quality balance.' },
      { title: 'Download JPG or ZIP', description: 'Save individual JPGs or export every image in a ZIP.' }
    ],
    formatComparison: [
      { feature: 'App Acceptance', fromVal: 'Blocked by older office & store portals', toVal: '100% universal across every device and app' }
    ],
    shortTail: ['webp to jpg', 'convert webp to jpg', 'save webp as jpeg free'],
    longTail: ['batch convert webp images to jpg with white background free'],
    faq: [
      { question: 'What happens to transparent areas in WebP when converted to JPG?', answer: 'JPG does not support transparency, so transparent pixels flatten onto a crisp white background instead of turning black.' }
    ],
    limitations: [
      'Animated WebP files export their first visible frame as a still JPG.'
    ],
    troubleshooting: [
      { issue: 'Need to keep transparent background', fix: 'Use WebP to PNG instead so alpha transparency stays intact.' }
    ],
    options: { supportsQuality: true, supportsScale: true }
  }),

  // 18. PNG to AVIF
  buildTool({
    id: 'png-to-avif',
    name: 'PNG to AVIF Next-Gen Converter',
    category: 'image-tools',
    fromFormat: 'PNG',
    toFormat: 'AVIF',
    badge: 'Ultra Compression',
    shortDescription: 'Compress heavy PNG screenshots and UI graphics into next-gen AVIF format where supported by your browser.',
    longDescription: 'Encode crisp PNG images into modern AV1 Image File Format (AVIF) with alpha transparency support for top-tier Google PageSpeed scores. Includes strict MIME verification so unsupported browsers never disguise PNG bytes as `.avif`.',
    acceptedFileTypes: ['.png', 'image/png'],
    whoCanUse: [
      { persona: 'Web Performance Engineers', useCase: 'Cut hero banners and documentation screenshots smaller than WebP on supported desktop browsers.' }
    ],
    whereToUse: [
      { scenario: 'Modern <picture> Fallbacks', benefit: 'Deliver cutting-edge AVIF bytes to modern browsers while reducing CDN egress.' }
    ],
    steps: [
      { title: 'Upload PNG File', description: 'Select heavy UI screenshots or graphics.' },
      { title: 'Verify & Encode AVIF', description: 'Browser checks real image/avif encoder support before encoding.' },
      { title: 'Download Verified .AVIF', description: 'Save genuine AVIF binary files.' }
    ],
    formatComparison: [
      { feature: 'Compression Efficiency', fromVal: 'Lossless PNG baseline', toVal: 'Often 60%–85% smaller than PNG' }
    ],
    shortTail: ['png to avif', 'convert png to avif', 'avif compressor online'],
    longTail: ['convert transparent png to avif browser client side'],
    faq: [
      { question: 'Why might my browser say AVIF encoding is unsupported?', answer: 'Safari and certain mobile browsers decode AVIF well but only expose PNG/JPEG/WebP on canvas.toBlob(). Mimage strictly verifies genuine AVIF output instead of silently giving you a misnamed PNG.' }
    ],
    limitations: [
      'Requires a browser that supports native Canvas `image/avif` encoding (modern Chromium desktop or Firefox).'
    ],
    troubleshooting: [
      { issue: 'Browser lacks native AVIF encoder error', fix: 'Use PNG to WebP instead—WebP encoding works reliably in virtually all modern browsers.' }
    ],
    options: { supportsQuality: true, supportsScale: true }
  }),

  // 19. JPG to AVIF
  buildTool({
    id: 'jpg-to-avif',
    name: 'JPG to AVIF Converter',
    category: 'image-tools',
    fromFormat: 'JPG',
    toFormat: 'AVIF',
    badge: 'Next-Gen Photography',
    shortDescription: 'Re-encode heavy JPEG photographs into space-saving AVIF format on Chromium & Firefox desktop browsers.',
    longDescription: 'Reduce photographic bandwidth footprints beyond standard JPEG by encoding directly to AVIF inside browser memory, complete with explicit output MIME validation.',
    acceptedFileTypes: ['.jpg', '.jpeg', 'image/jpeg'],
    whoCanUse: [
      { persona: 'Photographers & Web Builders', useCase: 'Shrink high-res photography galleries for faster Core Web Vitals.' }
    ],
    whereToUse: [
      { scenario: 'Portfolio Galleries & CDNs', benefit: 'Lower storage and faster LCP loading times.' }
    ],
    steps: [
      { title: 'Upload JPG Photo', description: 'Select one or multiple .jpg files.' },
      { title: 'Set AVIF Quality', description: 'Dial quality between 65% and 90%.' },
      { title: 'Download Genuine AVIF', description: 'Save verified .avif images.' }
    ],
    formatComparison: [
      { feature: 'Bitrate Efficiency', fromVal: 'Standard JPEG baseline', toVal: 'Significantly smaller bytes at comparable sharpness' }
    ],
    shortTail: ['jpg to avif', 'jpeg to avif', 'convert jpg to avif online'],
    longTail: ['convert jpeg photos to verified avif client side free'],
    faq: [
      { question: 'What quality setting works best for JPG to AVIF?', answer: '75%–85% AVIF typically matches or outperforms 90% JPEG visual sharpness at roughly half the file size.' }
    ],
    limitations: [
      'Depends on native browser Canvas `image/avif` encoding support; fails gracefully on Safari iOS/macOS rather than faking output.'
    ],
    troubleshooting: [
      { issue: 'AVIF encoding unavailable on current browser', fix: 'Run in Chrome/Edge/Firefox desktop, or use JPG to WebP for universal browser support.' }
    ],
    options: { supportsQuality: true, supportsScale: true }
  }),

  // 20. AVIF to PNG
  buildTool({
    id: 'avif-to-png',
    name: 'AVIF to PNG Converter',
    category: 'file-converters',
    fromFormat: 'AVIF',
    toFormat: 'PNG',
    badge: 'Lossless Compatibility',
    isPopular: true,
    shortDescription: 'Convert modern .avif web downloads back into lossless PNG format with preserved transparency for Photoshop, Figma, and PowerPoint.',
    longDescription: 'Open and convert downloaded AVIF graphics into universally supported uncompressed PNG images with 8-bit transparency preserved.',
    acceptedFileTypes: ['.avif', 'image/avif'],
    whoCanUse: [
      { persona: 'Designers & Content Creators', useCase: 'Import web-saved AVIF images smoothly into older desktop editing software.' }
    ],
    whereToUse: [
      { scenario: 'Desktop Editor Compatibility', benefit: 'Preserves full transparency without AVIF plugin errors.' }
    ],
    steps: [
      { title: 'Upload AVIF Image', description: 'Drop one or multiple .avif files.' },
      { title: 'Decode Locally', description: 'Browser decodes pixels losslessly into 24/32-bit PNG.' },
      { title: 'Download PNG', description: 'Save universal PNG files.' }
    ],
    formatComparison: [
      { feature: 'Desktop Support', fromVal: 'Missing on older software', toVal: 'Supported by 100% of editors' }
    ],
    shortTail: ['avif to png', 'convert avif to png', 'open avif as png free'],
    longTail: ['batch convert avif images to transparent png locally in browser'],
    faq: [
      { question: 'Does AVIF to PNG preserve transparent backgrounds?', answer: 'Yes, transparent AVIF pixels convert straight into alpha-transparent PNG pixels.' }
    ],
    limitations: [
      'Requires a browser that can decode AVIF images (all modern Chrome, Firefox, Edge, and Safari 16.4+ releases).'
    ],
    troubleshooting: [
      { issue: 'Animated AVIS sequences export frame 1', fix: 'Standard PNG captures the first rendered frame cleanly.' }
    ],
    options: { supportsScale: true }
  }),

  // 21. AVIF to JPG
  buildTool({
    id: 'avif-to-jpg',
    name: 'AVIF to JPG Converter',
    category: 'file-converters',
    fromFormat: 'AVIF',
    toFormat: 'JPG',
    badge: 'Instant Universal Photo',
    isPopular: true,
    shortDescription: 'Convert .avif web photos into lightweight, universally accepted JPG files for printing, uploads, and messaging.',
    longDescription: 'Decode AVIF downloads cleanly inside your browser and export standard compressed JPEG photos flattened on crisp white paper backgrounds.',
    acceptedFileTypes: ['.avif', 'image/avif'],
    whoCanUse: [
      { persona: 'Shoppers, Students & Creators', useCase: 'Upload web-saved AVIF images to job portals, print shops, and older messaging apps.' }
    ],
    whereToUse: [
      { scenario: 'Portal & Print Shop Uploads', benefit: 'JPG works on every photo kiosk and government portal worldwide.' }
    ],
    steps: [
      { title: 'Select AVIF Photos', description: 'Drop your .avif image files.' },
      { title: 'Tune Quality Slider', description: 'Select 90% JPEG quality (default).' },
      { title: 'Download JPGs', description: 'Save individual JPGs or bundled ZIP.' }
    ],
    formatComparison: [
      { feature: 'Ecosystem Reach', fromVal: 'Modern browsers only', toVal: 'Every phone, OS, printer, and portal' }
    ],
    shortTail: ['avif to jpg', 'convert avif to jpeg', 'change avif to jpg free'],
    longTail: ['convert multiple avif files to universal jpg images free'],
    faq: [
      { question: 'Does converting AVIF to JPG send my photos online?', answer: 'No! All decoding and re-encoding stays inside your local browser tab.' }
    ],
    limitations: [
      'Transparency flattens onto solid white since JPG has no alpha channel.'
    ],
    troubleshooting: [
      { issue: 'Very old browser cannot decode AVIF', fix: 'Update Chrome, Edge, Firefox, or Safari to enable native AVIF decoding.' }
    ],
    options: { supportsQuality: true, supportsScale: true }
  }),

  // 22. HEIC to PNG
  buildTool({
    id: 'heic-to-png',
    name: 'HEIC to PNG Lossless Converter',
    category: 'file-converters',
    fromFormat: 'HEIC',
    toFormat: 'PNG',
    badge: 'Safari & macOS Codec Ready',
    shortDescription: 'Convert Apple iPhone HEIC/HEIF photos into lossless PNG files directly in Safari and macOS/iOS browsers.',
    longDescription: 'Decode Apple High Efficiency Image Format (.heic / .heif) photos locally where browser/OS codec support exists, exporting uncompressed lossless PNG graphics with zero external photo uploads.',
    acceptedFileTypes: ['.heic', '.heif', 'image/heic', 'image/heif'],
    whoCanUse: [
      { persona: 'iPhone & Mac Creators', useCase: 'Convert private iPhone snapshots to lossless PNG graphics right on Safari without cloud converters.' }
    ],
    whereToUse: [
      { scenario: 'Design Editing & Archiving', benefit: 'Zero iCloud/third-party storage exposure for personal family or ID photos.' }
    ],
    steps: [
      { title: 'Drop HEIC Photo', description: 'Upload .heic or .heif photos from iPhone or Mac.' },
      { title: 'Decode Native Container', description: 'Browser decodes Apple HEVC frames locally where supported.' },
      { title: 'Download PNG', description: 'Save uncompressed lossless PNG.' }
    ],
    formatComparison: [
      { feature: 'Platform Support', fromVal: 'Apple ecosystem & newer viewers', toVal: 'Universal across Windows, Linux, Android & Web' }
    ],
    shortTail: ['heic to png', 'convert iphone heic to png', 'heic png converter'],
    longTail: ['convert apple heic photos to lossless png locally in safari'],
    faq: [
      { question: 'Why might Chrome on Windows not decode a HEIC file?', answer: 'Browser-local decoding relies on native OS HEVC codecs (built into Safari on macOS/iOS). On non-Apple systems without OS codecs, export directly as Most Compatible JPG/PNG from iPhone Settings -> Camera -> Formats.' }
    ],
    limitations: [
      'Pure browser-local HEIC decoding works reliably in Safari (macOS/iOS) or browsers with OS HEVC codecs installed; Chrome on Windows/Linux typically lacks native HEIC decoding.'
    ],
    troubleshooting: [
      { issue: 'Browser failed to decode HEIC', fix: 'Open this tool in Safari on iOS/macOS, or enable "Most Compatible" JPG on your iPhone.' }
    ],
    options: { supportsScale: true }
  }),

  // 23. BMP to PNG
  buildTool({
    id: 'bmp-to-png',
    name: 'BMP to PNG Shrinker & Converter',
    category: 'file-converters',
    fromFormat: 'BMP',
    toFormat: 'PNG',
    badge: 'Lossless 70%+ Shrink',
    shortDescription: 'Compress giant uncompressed Windows Bitmap (.bmp) files into identical-pixel lossless PNGs with massive byte savings.',
    longDescription: 'Convert bulky 24-bit raw Windows BMP screenshots and scanner bitmaps into compact DEFLATE-compressed PNG images while preserving every single pixel mathematically intact.',
    acceptedFileTypes: ['.bmp', 'image/bmp'],
    whoCanUse: [
      { persona: 'Engineers, Gamers & Archivists', useCase: 'Shrink multi-megabyte legacy BMP captures by 70–90% with zero quality loss.' }
    ],
    whereToUse: [
      { scenario: 'Web Publishing & Email', benefit: 'Replace massive BMP email attachments with fast lossless PNGs.' }
    ],
    steps: [
      { title: 'Select BMP Files', description: 'Upload .bmp bitmap images.' },
      { title: 'Lossless DEFLATE Pack', description: 'Compresses raw pixels mathematically identically.' },
      { title: 'Download Compact PNG', description: 'Enjoy huge file size savings immediately.' }
    ],
    formatComparison: [
      { feature: 'Byte Weight', fromVal: 'Raw uncompressed DIB pixels', toVal: 'Lossless compressed PNG (often 5x smaller)' }
    ],
    shortTail: ['bmp to png', 'convert bmp to png', 'shrink bmp image size'],
    longTail: ['convert uncompressed windows bitmap bmp to lossless png free'],
    faq: [
      { question: 'Does converting BMP to PNG lose any sharpness?', answer: 'Zero quality loss! Both BMP and PNG store pixel RGB values losslessly; PNG simply compresses redundant runs cleanly.' }
    ],
    limitations: [
      'Rare OS/2 or proprietary 1-bit monochrome BMP variants depend on native browser decoder support.'
    ],
    troubleshooting: [
      { issue: 'Output looks identical but smaller', fix: 'That is lossless DEFLATE compression working at 100% fidelity!' }
    ],
    options: { supportsScale: true }
  }),

  // 24. BMP to JPG
  buildTool({
    id: 'bmp-to-jpg',
    name: 'BMP to JPG Converter',
    category: 'file-converters',
    fromFormat: 'BMP',
    toFormat: 'JPG',
    badge: 'Shrink 90% File Size',
    shortDescription: 'Convert heavy uncompressed Windows BMP photographs and scans into lightweight shareable JPG files.',
    longDescription: 'Slash multi-megabyte BMP bitmap footprints by up to 90%+ using adjustable JPEG compression so large desktop bitmaps upload rapidly to websites, emails, and forms.',
    acceptedFileTypes: ['.bmp', 'image/bmp'],
    whoCanUse: [
      { persona: 'Office & Scanner Users', useCase: 'Convert raw BMP flatbed scans into compact JPG uploads.' }
    ],
    whereToUse: [
      { scenario: 'Fast Web & Email Sharing', benefit: 'Shrinks multi-MB bitmaps down to kilobytes instantly.' }
    ],
    steps: [
      { title: 'Drop BMP Files', description: 'Upload raw .bmp captures.' },
      { title: 'Pick JPEG Quality', description: 'Choose 80%–95% quality level.' },
      { title: 'Download JPG', description: 'Export fast compact JPGs.' }
    ],
    formatComparison: [
      { feature: 'Transmission Speed', fromVal: 'Slow raw bitmap bytes', toVal: 'Fast compressed JPEG payload' }
    ],
    shortTail: ['bmp to jpg', 'convert bmp to jpeg', 'bitmap to jpg online'],
    longTail: ['batch convert windows bmp files to lightweight jpg free'],
    faq: [
      { question: 'How much smaller will my file become?', answer: 'Uncompressed BMP photos frequently drop from 10 MB+ down to under 500 KB as 90% JPG.' }
    ],
    limitations: [
      'JPEG uses lossy compression; use BMP to PNG if exact pixel equality is required.'
    ],
    troubleshooting: [
      { issue: 'Small UI text looks slightly soft around edges', fix: 'Raise Quality to 95% or switch to BMP to PNG for pixel-sharp text.' }
    ],
    options: { supportsQuality: true, supportsScale: true }
  }),

  // 25. ICO to PNG
  buildTool({
    id: 'ico-to-png',
    name: 'ICO Favicon to PNG Converter',
    category: 'file-converters',
    fromFormat: 'ICO',
    toFormat: 'PNG',
    badge: 'Extract Web Favicon',
    shortDescription: 'Convert Microsoft Windows .ico icon files and website `favicon.ico` assets back into editable transparent PNGs.',
    longDescription: 'Extract usable transparent PNG graphics from Windows `.ico` icons and website favicons so you can inspect, resize, or import them inside Figma, Canva, and web designs.',
    acceptedFileTypes: ['.ico', 'image/x-icon', 'image/vnd.microsoft.icon'],
    whoCanUse: [
      { persona: 'UI Designers & Frontend Devs', useCase: 'Convert legacy favicon.ico graphics into crisp PNG images for slide decks or documentation.' }
    ],
    whereToUse: [
      { scenario: 'Icon Recovery & UI Documentation', benefit: 'Preserves full alpha transparency cleanly.' }
    ],
    steps: [
      { title: 'Upload .ICO Icon', description: 'Drop any .ico icon file.' },
      { title: 'Decode Icon Canvas', description: 'Browser decodes icon frame while preserving transparency.' },
      { title: 'Download PNG', description: 'Save standard editable PNG.' }
    ],
    formatComparison: [
      { feature: 'Design Tool Support', fromVal: 'Blocked by Figma, Canva & mobile OS', toVal: 'Works everywhere cleanly' }
    ],
    shortTail: ['ico to png', 'convert ico to png', 'favicon ico to png'],
    longTail: ['convert windows favicon ico file to transparent png free'],
    faq: [
      { question: 'Will transparency around the icon remain transparent?', answer: 'Yes! Alpha transparency renders straight onto the exported PNG unless White Background is selected.' }
    ],
    limitations: [
      'Browsers pick their preferred default icon layer inside multi-size ICO bundles when decoding via standard image loading.'
    ],
    troubleshooting: [
      { issue: 'Icon appears small (16x16 or 32x32)', fix: 'Older favicons only embed low-res bitmap frames; use PNG to ICO from a 512px source when creating new favicons.' }
    ],
    options: { supportsBackground: true, supportsScale: true }
  }),

  // 26. SVG to WebP
  buildTool({
    id: 'svg-to-webp',
    name: 'SVG to WebP Rasterizer',
    category: 'file-converters',
    fromFormat: 'SVG',
    toFormat: 'WEBP',
    badge: 'Retina WebP Export',
    shortDescription: 'Rasterize vector SVG illustrations into transparent high-density WebP images for ultra-fast websites.',
    longDescription: 'Combine razor-sharp 1x–4x vector scaling with compact Google WebP compression. Sanitizes SVGs and exports transparent or background-filled WebP images ready for production storefronts.',
    acceptedFileTypes: ['.svg', 'image/svg+xml'],
    whoCanUse: [
      { persona: 'Ecommerce & SaaS Teams', useCase: 'Convert complex multi-path SVG illustrations (that lag on mobile browsers) into tiny crisp WebP graphics.' }
    ],
    whereToUse: [
      { scenario: 'Storefronts & Blog Thumbnails', benefit: 'Faster render speeds than heavy thousands-of-node vector illustrations.' }
    ],
    steps: [
      { title: 'Drop SVG Graphic', description: 'Upload any .svg file.' },
      { title: 'Set Compression Quality & Background', description: 'Keep transparent backdrop or pick solid white.' },
      { title: 'Download WebP', description: 'Export fast WebP asset.' }
    ],
    formatComparison: [
      { feature: 'Social & CMS Compatibility', fromVal: 'SVG often blocked for security on blogs/CMS', toVal: 'Accepted everywhere with tiny byte footprint' }
    ],
    shortTail: ['svg to webp', 'convert svg to webp', 'svg vector to webp free'],
    longTail: ['convert vector svg logo to transparent webp online free'],
    faq: [
      { question: 'Does SVG to WebP preserve transparency?', answer: 'Yes! Leave Background on Transparent to export alpha-transparent WebP graphics.' }
    ],
    limitations: [
      'External web fonts referenced inside SVG via URL may default to system fonts unless outlined as SVG paths.'
    ],
    troubleshooting: [
      { issue: 'Sharp gradients look compressed', fix: 'Raise the Quality slider to 95%–100%.' }
    ],
    options: { supportsQuality: true, supportsBackground: true, supportsScale: true }
  }),

  // 27. SVG to JPG
  buildTool({
    id: 'svg-to-jpg',
    name: 'SVG to JPG Converter',
    category: 'file-converters',
    fromFormat: 'SVG',
    toFormat: 'JPG',
    badge: 'Social & Marketplace Ready',
    shortDescription: 'Convert SVG logos and vector graphics cleanly into JPG photos flattened onto a crisp white background.',
    longDescription: 'Rasterize SVG vector graphics directly onto solid white backdrops and export adjustable-quality JPEG images compatible with every CMS, printer, and social upload field.',
    acceptedFileTypes: ['.svg', 'image/svg+xml'],
    whoCanUse: [
      { persona: 'Social & Marketplace Sellers', useCase: 'Upload vector designs to platforms that strictly require JPEG uploads.' }
    ],
    whereToUse: [
      { scenario: 'Thumbnails & Email Headers', benefit: 'Flattens transparent vectors cleanly onto solid white automatically.' }
    ],
    steps: [
      { title: 'Upload SVG Graphic', description: 'Select your vector .svg file.' },
      { title: 'Adjust Quality & Scale', description: 'Select JPEG compression ratio.' },
      { title: 'Download Clean JPG', description: 'Export ready-to-share JPEG.' }
    ],
    formatComparison: [
      { feature: 'Portal Compatibility', fromVal: 'Blocked by JPG-only upload fields', toVal: 'Accepted everywhere cleanly' }
    ],
    shortTail: ['svg to jpg', 'convert svg to jpeg', 'vector svg to jpg'],
    longTail: ['convert svg graphic to white background jpg online free'],
    faq: [
      { question: 'Will transparent SVG backgrounds turn black?', answer: 'No—Mimage automatically paints a clean white canvas behind transparent SVG artwork before encoding JPG.' }
    ],
    limitations: [
      'Rasterizing removes infinite vector zoom after conversion; set a higher scale or edit source SVG if print banners are needed.'
    ],
    troubleshooting: [
      { issue: 'Fine dark typography blurs slightly', fix: 'Bump Quality slider to 95% or export SVG to PNG for razor-sharp edge contrast.' }
    ],
    options: { supportsQuality: true, supportsScale: true }
  }),

  // 28. JSON to CSV
  buildTool({
    id: 'json-to-csv',
    name: 'JSON to CSV Flattener Converter',
    category: 'developer-tools',
    fromFormat: 'JSON',
    toFormat: 'CSV',
    badge: 'Nested Object Flattening',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Convert API JSON arrays and nested objects into clean Excel/Google Sheets compatible CSV tables with dot-notation flattening.',
    longDescription: 'Transform nested JSON payloads locally into neat spreadsheet rows. Collects the union of keys across uneven objects, flattens nested sub-objects using dot notation (`user.email`), and escapes quotes safely per RFC 4180.',
    acceptedFileTypes: ['.json', 'application/json'],
    whoCanUse: [
      { persona: 'Data Engineers, PMs & Marketers', useCase: 'Export Stripe, MongoDB, or REST API JSON responses cleanly into Excel without Python scripts.' }
    ],
    whereToUse: [
      { scenario: 'Analytics & Spreadsheet Audits', benefit: 'Handles confidential customer JSON payloads offline inside your browser.' }
    ],
    steps: [
      { title: 'Drop JSON File', description: 'Select an array of JSON objects or wrapped dataset object.' },
      { title: 'Flatten Keys & Normalize Rows', description: 'Nested properties expand cleanly into union header columns.' },
      { title: 'Copy or Download .CSV', description: 'Open directly in Excel or Google Sheets.' }
    ],
    formatComparison: [
      { feature: 'Analyst Accessibility', fromVal: 'Developer nested brackets', toVal: 'Spreadsheet columns ready for pivot tables' }
    ],
    shortTail: ['json to csv', 'convert json to csv', 'nested json to csv online'],
    longTail: ['flatten nested json objects to excel csv locally without upload'],
    faq: [
      { question: 'What if my JSON rows have slightly different keys?', answer: 'Mimage inspects all objects to build a complete union header list, leaving missing values cleanly blank in those rows.' }
    ],
    limitations: [
      'Deeply nested arrays inside objects serialize as compact JSON strings within their cell.'
    ],
    troubleshooting: [
      { issue: 'JSON root error', fix: 'Ensure root is either `[...]` or `{ "data": [...] }` / single JSON object.' }
    ]
  }),

  // 29. CSV to JSON
  buildTool({
    id: 'csv-to-json',
    name: 'CSV to JSON Parser Converter',
    category: 'developer-tools',
    fromFormat: 'CSV',
    toFormat: 'JSON',
    badge: 'RFC 4180 Quotes Safe',
    isPopular: true,
    shortDescription: 'Convert spreadsheets and RFC 4180 CSV files cleanly into structured JSON object arrays with auto number/boolean typing.',
    longDescription: 'Parse CSV tables using a strict RFC 4180 state machine—properly handling commas inside quotes, escaped double quotes (`""`), and multi-line cells—and emit formatted JSON arrays locally.',
    acceptedFileTypes: ['.csv', 'text/csv'],
    whoCanUse: [
      { persona: 'Frontend & Full-Stack Developers', useCase: 'Turn spreadsheet lookup tables into typed JSON seed data or mock fixtures.' }
    ],
    whereToUse: [
      { scenario: 'Database Seeding & App Configs', benefit: 'Preserves numeric & boolean primitives alongside clean UTF-8 strings.' }
    ],
    steps: [
      { title: 'Upload CSV File', description: 'Drop a header-row .csv spreadsheet.' },
      { title: 'Parse Quoted Fields & Types', description: 'RFC 4180 parser builds object arrays using header column keys.' },
      { title: 'Copy or Save .JSON', description: 'Copy straight into code or download the .json file.' }
    ],
    formatComparison: [
      { feature: 'Code Integration', fromVal: 'Flat comma text requiring parser setup', toVal: 'Ready-to-import JSON object array' }
    ],
    shortTail: ['csv to json', 'convert csv to json', 'csv json converter online'],
    longTail: ['convert quoted excel csv file to structured json array free'],
    faq: [
      { question: 'Does it break if a cell contains a comma inside quotes like "Austin, TX"?', answer: 'No! Our RFC 4180 state-machine parser honors quoted strings and escaped double quotes accurately.' }
    ],
    limitations: [
      'Assumes the first non-empty row contains column header names.'
    ],
    troubleshooting: [
      { issue: 'Semicolon-delimited European CSV displays 1 field', fix: 'Ensure fields are comma-delimited standard CSV before conversion.' }
    ]
  }),

  // 30. HTML to Markdown (Huge LLM/RAG Demand)
  buildTool({
    id: 'html-to-markdown',
    name: 'HTML to Markdown Converter (LLM Prep)',
    category: 'developer-tools',
    fromFormat: 'HTML',
    toFormat: 'MD',
    badge: 'Cut AI Prompt Tokens 80%',
    isPopular: true,
    isRecommended: true,
    shortDescription: 'Strip scripts, bloated div wrappers, and inline styles from HTML files and convert clean headings, tables, links, and code into Markdown.',
    longDescription: 'Prepare saved webpages and CMS exports for LLMs, RAG pipelines, Obsidian, or static site generators. Safely parses HTML via inert DOMParser—ignoring `<script>`, `<style>`, `<svg>`, and `<iframe>`—and outputs clean headings, GFM tables, lists, links, blockquotes, and fenced code blocks.',
    acceptedFileTypes: ['.html', '.htm', 'text/html'],
    whoCanUse: [
      { persona: 'AI Engineers & Prompt Designers', useCase: 'Slash token waste up to 80% when feeding saved web articles or docs into LLMs.' },
      { persona: 'Documentation & JAMstack Teams', useCase: 'Migrate legacy HTML help articles cleanly into Markdown static sites.' }
    ],
    whereToUse: [
      { scenario: 'RAG Preprocessing & CMS Migration', benefit: 'Outputs crisp GitHub-Flavored Markdown tables, code blocks, and links.' }
    ],
    steps: [
      { title: 'Upload HTML Document', description: 'Drop any saved .html or .htm webpage.' },
      { title: 'Strip Bloat & Walk Semantic Tree', description: 'Removes scripts/styles while converting headings, links, lists, and tables.' },
      { title: 'Copy Markdown or Save .MD', description: 'Paste straight into AI chat or download the clean .md file.' }
    ],
    formatComparison: [
      { feature: 'LLM Token Cost', fromVal: 'Bloated <div> class attributes & CSS overhead', toVal: 'Minimalist clean Markdown tokens' }
    ],
    shortTail: ['html to markdown', 'convert html to md', 'html to markdown llm'],
    longTail: ['clean convert saved webpage html to markdown for chatgpt rag'],
    faq: [
      { question: 'Does HTML to Markdown convert HTML tables cleanly?', answer: 'Yes! `<table>` rows convert directly into GitHub-Flavored Markdown pipe tables (`| col | col |`).' }
    ],
    limitations: [
      'Pure visual layout containers lacking semantic `<p>`, `<h1-h6>`, `<ul>`, or `<table>` tags condense into flowing body text.'
    ],
    troubleshooting: [
      { issue: 'Uploaded HTML came from a JS app shell', fix: 'Use browser Save Page As -> Webpage, HTML Complete or copy rendered DOM outerHTML so actual article nodes exist inside the file.' }
    ]
  })
];
