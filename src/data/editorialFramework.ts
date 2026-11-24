/**
 * Mimage Editorial Framework & Publishing Guidelines
 */

export interface EditorialMasterFramework {
  version: string;
  registeredDate: string;
  nicheTopic: string;
  targetAudience: string[];
  supportedCategories: {
    id: string;
    name: string;
    description: string;
  }[];
  monetizationReadiness: {
    channel: string;
    status: string;
    complianceRules: string[];
  }[];
  eeatPrinciples: {
    pillar: 'Experience' | 'Expertise' | 'Authoritativeness' | 'Trustworthiness';
    description: string;
    implementation: string;
  }[];
  geoAeoRules: string[];
  distributionChannels: string[];
  rawPromptText: string;
}

export const MASTER_EDITORIAL_PROMPT_TEXT = `# MIMAGE EDITORIAL STANDARDS — PRACTICAL FILE & IMAGE GUIDES

- WEBSITE NAME: Mimage (https://fixpdf.org/)
- TARGET AUDIENCE: Everyday internet users, bloggers, web designers, developers, students, ecommerce sellers, and small businesses.
- PRINCIPLES: Practical workflows, honest disclosure of browser-local vs network processing, realistic limitations, valid structured schema markup, and clean internal links to real tools.`;

export const REGISTERED_EDITORIAL_FRAMEWORK: EditorialMasterFramework = {
  version: '2026.5.0-Mimage',
  registeredDate: '2026-11-18',
  nicheTopic: 'Client-Side File Utilities, Image Optimization & PDF Workflows',
  targetAudience: ['United States', 'United Kingdom', 'Canada', 'Australia', 'International'],
  supportedCategories: [
    {
      id: 'ai-tools',
      name: 'OCR & Intelligent Workflows',
      description: 'Client-side OCR recognition and format-aware file triage.'
    },
    {
      id: 'pdf-workflows',
      name: 'PDF Workflows & Document Utilities',
      description: 'Guides on merging, splitting, organizing, compressing, and exporting PDF pages.'
    },
    {
      id: 'privacy-security',
      name: 'Privacy & Zero-Upload Architecture',
      description: 'EXIF metadata inspection, SVG script sanitization, and honest processing disclosures.'
    },
    {
      id: 'graphic-design',
      name: 'Design, Icons & Vector Workflows',
      description: 'Favicon generation, color palette extraction, transparent backdrops, and SVG optimization.'
    },
    {
      id: 'seo-performance',
      name: 'Web Performance & Core Web Vitals',
      description: 'Reducing image payloads, checking missing ALT attributes, and adopting WebP/AVIF.'
    },
    {
      id: 'format-guides',
      name: 'Format Guides & Practical Benchmarks',
      description: 'Comparing JPG, PNG, WebP, AVIF, SVG, and HEIC across real web use cases.'
    }
  ],
  monetizationReadiness: [
    {
      channel: 'Google AdSense',
      status: 'Policy Compliant',
      complianceRules: [
        'Original first-party guides authored for Mimage',
        'Transparent ownership by Naveed Afzal with public contact, privacy center, and cookie notice',
        'Zero fake download buttons or deceptive UI patterns',
        'Valid /ads.txt publishing ID pub-8358033803354457 (ca-pub-8358033803354457)'
      ]
    }
  ],
  eeatPrinciples: [
    {
      pillar: 'Experience',
      description: 'Guides written around real client-side tool behavior and observable trade-offs.',
      implementation: 'Discloses browser format limits (e.g. AVIF fallback, HEIC OS codecs, and bicubic upscaling limits).'
    },
    {
      pillar: 'Expertise',
      description: 'Clear explanations authored by Naveed Afzal and software engineering contributors.',
      implementation: 'Actionable steps matching Mimage interactive workspaces.'
    },
    {
      pillar: 'Authoritativeness',
      description: 'References to open web and ISO specifications.',
      implementation: 'Cites W3C Canvas, ISO 32000-2 PDF standards, and CIPA EXIF specs.'
    },
    {
      pillar: 'Trustworthiness',
      description: 'Strict honesty on local vs external processing.',
      implementation: 'Dedicated Privacy Center and Diagnostics page.'
    }
  ],
  geoAeoRules: [
    'Direct answers at the start of technical sections',
    'Structured JSON-LD BlogPosting and FAQPage without hash fragments',
    'Consistent canonical links under https://fixpdf.org'
  ],
  distributionChannels: [
    'Organic Search',
    'Developer Bookmarks & Technical Docs',
    'Pinterest & Design Workflows'
  ],
  rawPromptText: MASTER_EDITORIAL_PROMPT_TEXT
};

export function generateSocialDistributionPack(post: {
  title: string;
  slug: string;
  primaryKeyword: string;
  metaDescription: string;
}) {
  const url = `https://fixpdf.org/blog/${post.slug}`;
  return {
    pinterest: {
      title: `${post.primaryKeyword}: Step-by-Step Guide | Mimage`,
      description: `${post.metaDescription} Read the full guide on Mimage.`,
      visualConcepts: [
        'Side-by-side comparison showing original vs optimized output',
        '3-step browser-local workflow diagram',
        'Format cheat sheet comparing payload, transparency, and browser support'
      ]
    },
    linkedIn: {
      post: `Practical walkthrough: "${post.title}".\n\nExplore browser-local image & document tools with honest privacy guarantees: ${url}\n\n#WebPerformance #Privacy #WebDev #Mimage`
    },
    facebook: {
      post: `Read our step-by-step guide on Mimage: "${post.title}" — free, fast, and no sign-up required: ${url}`
    },
    newsletter: {
      subject: `[Mimage Guide] ${post.title}`,
      blurb: `In this guide, we walk through ${post.primaryKeyword} and show practical workflows you can run directly in your browser.`
    }
  };
}
