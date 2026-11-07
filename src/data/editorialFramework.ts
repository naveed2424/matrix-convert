/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MatrixConvert Master Editorial Framework & AdSense Compliance Guidelines
 * Registered directly into the application codebase per user master prompt.
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

export const MASTER_EDITORIAL_PROMPT_TEXT = `# MASTER PROMPT — BUILD A PROFESSIONAL SEO-POWERED, GOOGLE ADSENSE-READY BLOGGING PLATFORM

## PROJECT OBJECTIVE
Act as a world-class team: Senior full-stack web developer, Professional UI/UX designer, SEO strategist, Investigative journalist and fact-checker, Google AdSense compliance specialist, Content marketing strategist, GEO specialist, AEO specialist, E-E-A-T content strategist, Technical SEO engineer.
Deploy a complete, professional, high-performance, SEO-focused blogging platform designed to build organic traffic, establish topical authority, attract international readers, and generate revenue through Google AdSense and legitimate affiliate marketing.

## PART 1 — WEBSITE CONFIGURATION
- WEBSITE TOPIC: [AI TOOLS & DOCUMENT CONVERSION ENGINES]
- WEBSITE NAME: MatrixConvert (mimage.netlify.app)
- TARGET AUDIENCE: United States, United Kingdom, Canada, Australia, and international English-speaking readers.
- MONETIZATION: Google AdSense, legitimate affiliate partnerships, developer API sponsorships.
- DESIGN DIRECTION: Premium, modern, clean, trustworthy editorial layout. High readability, clear navigation, zero intrusive popups.

## PART 2 — SIX MAIN CONTENT CATEGORIES
1. AI Tools & Document Software
2. PDF Workflows & In-Browser Processing
3. Privacy, Cybersecurity & Zero-Knowledge Architecture
4. Graphic Design & Vector Perfection
5. SEO Performance, Core Web Vitals & WebP/AVIF
6. Format Guides & Empirical Compression Benchmarks

## PART 3 — ESSENTIAL PAGES & TRUST ELEMENTS
- About Us, Contact Us, Privacy Policy, Cookie Policy, Terms of Service, Editorial Policy, Affiliate & AdSense Disclosures, Author Profiles.

## PART 4 — PROFESSIONAL ARTICLE MANAGEMENT
- Title, Slug, Category, Author, Publication Date, Featured Image, 4 In-Content Images with ALT descriptions, SEO Meta Title, Meta Description (150-160 chars), Primary Keyword, Secondary Keywords, Structured H2/H3 Headings, Internal Links, External Citations, FAQ, Reading Time, Schema.org JSON-LD.

## PART 5 & 6 — RESEARCH, E-E-A-T & SEO WRITING FRAMEWORK
- Search intent alignment, verified facts, no keyword stuffing, short paragraphs, tables, original value additions (checklists, comparisons, calculations), 3-6 verified FAQs.

## PART 7 — IMAGE GENERATION & OPTIMIZATION
- 1 Featured Image + 4 In-Content Images per major guide. Descriptive filenames, meaningful ALTs, WebP/AVIF compression.

## PART 8 — INTERNAL LINKING & EXTERNAL CITATIONS
- 3-6 relevant internal links to in-browser conversion tools.
- 2-5 high-authority external sources (W3C, ISO, EFF, NIST, PDF Association, Mozilla MDN).

## PART 9 — TECHNICAL SEO & SCHEMA
- Schema.org (BlogPosting, FAQPage, Organization, WebSite), OpenGraph, Twitter Cards, Sitemap.xml, Core Web Vitals optimization.

## PART 10 — GOOGLE ADSENSE COMPLIANCE
- 100% original editorial content, clear separation of ads, no misleading clicks, complete transparency.

## PART 11 & 12 — GEO & AEO OPTIMIZATION
- Direct answers, structured definitions, concise summaries for Google AI Overviews, Perplexity, ChatGPT search, and Bing Copilot.

## PART 13 & 14 — USER EXPERIENCE & MULTI-CHANNEL DISTRIBUTION
- Related guides, conversion CTAs, social distribution formats (Pinterest, LinkedIn, Facebook, Newsletter).`;

export const REGISTERED_EDITORIAL_FRAMEWORK: EditorialMasterFramework = {
  version: '2026.4.0-AdSense-Ready',
  registeredDate: '2026-11-07',
  nicheTopic: 'AI Tools, Client-Side Document Architecture & Image Processing',
  targetAudience: ['United States', 'United Kingdom', 'Canada', 'Australia', 'International'],
  supportedCategories: [
    {
      id: 'ai-tools',
      name: 'AI Tools & Intelligent Software',
      description: 'In-depth analyses of local AI tools, WebAssembly machine learning, and document text harvesting.'
    },
    {
      id: 'pdf-workflows',
      name: 'PDF Workflows & Document Engineering',
      description: 'Advanced guides on rasterization, vector extraction, Bates numbering, and white margin cropping.'
    },
    {
      id: 'privacy-security',
      name: 'Privacy, Cybersecurity & Zero-Knowledge Systems',
      description: 'Tutorials on client-side memory safety, EXIF metadata stripping, and HIPAA/GDPR document compliance.'
    },
    {
      id: 'graphic-design',
      name: 'Graphic Design & Vector Perfection',
      description: 'Step-by-step methods for transparent PNG creation, SVG path rendering, and high-DPI print prepress.'
    },
    {
      id: 'seo-performance',
      name: 'SEO Performance & Core Web Vitals',
      description: 'Maximizing Largest Contentful Paint (LCP) and visual stability with next-gen WebP and AVIF formats.'
    },
    {
      id: 'format-guides',
      name: 'Format Guides & Compression Benchmarks',
      description: 'Empirical data comparisons between raster and vector formats for optimal bandwidth efficiency.'
    }
  ],
  monetizationReadiness: [
    {
      channel: 'Google AdSense',
      status: 'Fully Compliant & Policy Ready',
      complianceRules: [
        'Zero plagiarized or low-value scraped content',
        'Transparent ownership by Naveed Afzal with public contact and editorial pages',
        'No deceptive UI elements or fake download buttons mimicking advertisements',
        'Visible cookie consent and GDPR compliance banner',
        'Valid ads.txt configured at root /ads.txt with publisher ID pub-8358033803354457 (ca-pub-8358033803354457)'
      ]
    },
    {
      channel: 'High-Value Affiliate Marketing',
      status: 'Disclosed & Ethical',
      complianceRules: [
        'Clear FTC-compliant affiliate disclosures on every commercial review',
        'Only genuine software tools tested in-browser or verified by technical benchmarks',
        'Direct links without deceptive redirect cloaking'
      ]
    }
  ],
  eeatPrinciples: [
    {
      pillar: 'Experience',
      description: 'Hands-on technical validation and empirical benchmarks run locally in modern browsers.',
      implementation: 'Every guide includes measurable tests, memory benchmarks, and practical step-by-step screenshots.'
    },
    {
      pillar: 'Expertise',
      description: 'Content authored and reviewed by document architects, cryptographers, and senior web engineers.',
      implementation: 'Author bylines include genuine technical credentials, published research, and LinkedIn / GitHub handles.'
    },
    {
      pillar: 'Authoritativeness',
      description: 'Direct citations of international standards organizations and academic research.',
      implementation: 'All articles cite ISO 32000-2, W3C Canvas specs, CIPA DC-008 EXIF standards, or EFF privacy bulletins.'
    },
    {
      pillar: 'Trustworthiness',
      description: 'Strict editorial independence, transparent errata policies, and zero file uploads.',
      implementation: 'Dedicated Editorial Policy, Corrections Policy, and open client-side source architecture.'
    }
  ],
  geoAeoRules: [
    'Direct question-and-answer semantic structure at the beginning of each H2 section',
    'Self-contained bullet summaries easily extractable by Google AI Overviews and Perplexity',
    'JSON-LD schema declaring BlogPosting and FAQPage for immediate answer engine parsing',
    'Numerical benchmark tables comparing file sizes, processing times, and compression ratios'
  ],
  distributionChannels: [
    'Google Organic Search (SEO & Rich Results)',
    'Answer Engines (Perplexity, ChatGPT, Google AI Overviews)',
    'Pinterest (Visual infographics and step-by-step pins)',
    'LinkedIn (Enterprise document privacy and cybersecurity articles)',
    'Developer Communities & Technical Newsletters'
  ],
  rawPromptText: MASTER_EDITORIAL_PROMPT_TEXT
};

/**
 * Social and distribution pack generator for any article following Part 14
 */
export function generateSocialDistributionPack(post: {
  title: string;
  slug: string;
  primaryKeyword: string;
  metaDescription: string;
}) {
  const url = `https://mimage.netlify.app/#/blog/${post.slug}`;
  return {
    pinterest: {
      title: `${post.primaryKeyword}: Step-by-Step Guide | MatrixConvert`,
      description: `${post.metaDescription} Read the full tutorial with high-resolution visual infographics.`,
      visualConcepts: [
        `Before/After infographic showing raw input vs optimized output with 0 bytes uploaded`,
        `Step-by-step 3-stage visual diagram illustrating browser WebAssembly processing`,
        `Cheat sheet comparison table comparing resolution, file size, and privacy`
      ]
    },
    linkedIn: {
      post: `🔒 Stop uploading confidential files to unknown cloud converters.\n\nOur latest deep-dive explores "${post.title}".\n\nKey takeaway: Using client-side WebAssembly, enterprise teams can process documents with zero cloud data leaks and full compliance.\n\nRead the full technical breakdown: ${url}\n\n#CyberSecurity #DataPrivacy #WebDev #TechInnovation`
    },
    facebook: {
      post: `Looking for a fast, free, and 100% private way to handle your documents? Check out our complete guide: "${post.title}". No subscriptions, no file size limits, zero uploads: ${url}`
    },
    newsletter: {
      subject: `[Guide] ${post.title}`,
      blurb: `In this week's technical guide, we break down ${post.primaryKeyword}. Learn how in-browser processing protects your data while delivering instant results.`
    }
  };
}
