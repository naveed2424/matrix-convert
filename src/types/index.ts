export type MimageCategoryId =
  | 'image-tools'
  | 'pdf-tools'
  | 'file-converters'
  | 'gif-video-tools'
  | 'privacy-tools'
  | 'design-tools'
  | 'developer-tools';

// Keep legacy union aliases compatible if referenced
export type ToolCategory = MimageCategoryId | string;

export interface SeoKeywordSet {
  shortTail: string[];
  longTail: string[];
}

export interface FormatComparisonItem {
  feature: string;
  fromVal: string;
  toVal: string;
}

export interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TroubleshootingItem {
  issue: string;
  fix: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: MimageCategoryId;
  categoryName: string;
  legacyCategories?: string[];
  fromFormat: string;
  toFormat: string;
  badge?: string;
  shortDescription: string;
  longDescription: string;
  acceptedFileTypes: string[];
  isPopular?: boolean;
  isRecentlyAdded?: boolean;
  isRecommended?: boolean;
  processingMode?: 'browser-local' | 'browser-local-plus-cdn' | 'network-fetch' | 'optional-network';
  maxRecommendedSizeMb?: number;
  limitations?: string[];
  troubleshooting?: (string | TroubleshootingItem)[];
  whoCanUse: {
    persona: string;
    useCase: string;
  }[];
  whereToUse: {
    scenario: string;
    benefit: string;
  }[];
  steps: HowToStep[];
  formatComparison: FormatComparisonItem[];
  seoKeywords: SeoKeywordSet;
  faq: FaqItem[];
  options: {
    supportsDpi?: boolean;
    supportsQuality?: boolean;
    supportsScale?: boolean;
    supportsBackground?: boolean;
    supportsMultiPage?: boolean;
    supportsIcoSizes?: boolean;
    supportsSvgVectorize?: boolean;
    supportsMatrixArt?: boolean;
  };
}

export interface ConvertedFile {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: number;
  convertedSize: number;
  dataUrl: string;
  blob: Blob;
  previewUrl: string;
  width?: number;
  height?: number;
  pageNumber?: number;
  note?: string;
  textContent?: string;
}

export interface ConversionSettings {
  dpi: number;
  quality: number;
  scale: number;
  backgroundColor: 'transparent' | 'white' | 'black';
  icoSizes: number[];
  svgMode: 'vector-trace' | 'raster-embed';
  colorThreshold: number;
  matrixDensity: number;
  matrixCharSet: 'katakana-binary' | 'ascii' | 'hex';
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
