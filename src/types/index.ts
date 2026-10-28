export type ToolCategory =
  | 'popular'
  | 'edit-sign'
  | 'crop-resize'
  | 'merge-split'
  | 'convert-pdf'
  | 'convert-to-pdf'
  | 'compress'
  | 'security'
  | 'convert-png'
  | 'convert-svg'
  | 'convert-webp'
  | 'convert-jpg'
  | 'icon-tools'
  | 'optimize-edit';

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

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  categoryName: string;
  fromFormat: string;
  toFormat: string;
  badge?: string;
  shortDescription: string;
  longDescription: string;
  acceptedFileTypes: string[];
  isPopular?: boolean;
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
