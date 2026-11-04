export interface ClientReview {
  id: string;
  name: string;
  role: string;
  company?: string;
  country: string;
  countryCode: string;
  avatar: string;
  rating: number; // 4, 4.5, or 5
  toolUsed: string;
  toolSlug: string;
  date: string;
  title: string;
  comment: string;
  isVerified: boolean;
  upvotes: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  satisfactionRate: number; // percentage e.g. 98.6
  ratingBreakdown: {
    stars: string;
    score: number;
    count: number;
    percentage: number;
  }[];
  aspectScores: {
    category: string;
    score: number;
    label: string;
  }[];
}

export const REVIEW_STATS: ReviewStats = {
  averageRating: 4.85,
  totalReviews: 1420,
  satisfactionRate: 98.6,
  ratingBreakdown: [
    { stars: '5 Stars', score: 5, count: 1180, percentage: 83 },
    { stars: '4.5 Stars', score: 4.5, count: 172, percentage: 12 },
    { stars: '4 Stars', score: 4, count: 56, percentage: 4 },
    { stars: '3 Stars', score: 3, count: 12, percentage: 1 },
    { stars: '2 Stars', score: 2, count: 0, percentage: 0 },
    { stars: '1 Star', score: 1, count: 0, percentage: 0 }
  ],
  aspectScores: [
    { category: 'Client-Side Privacy (Zero Upload)', score: 5.0, label: '100% Secure' },
    { category: 'Conversion Speed (WebAssembly)', score: 4.9, label: 'Instant' },
    { category: 'Output Fidelity & DPI Quality', score: 4.85, label: 'Crystal Clear' },
    { category: 'Ease of Use & No Signup Wall', score: 4.95, label: 'Frictionless' }
  ]
};

export const INITIAL_CLIENT_REVIEWS: ClientReview[] = [
  {
    id: 'rev-1',
    name: 'Antoine Delacroix',
    role: 'Lead UX/UI Designer',
    company: 'Atelier Digital Paris',
    country: 'France',
    countryCode: '🇫🇷',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    toolUsed: 'PDF to PNG (300 DPI)',
    toolSlug: 'pdf-to-png',
    date: '2026-11-02',
    title: 'Absolument bluffant pour les exports Figma et les DPI d’impression',
    comment: 'J’utilise MatrixConvert quotidiennement pour extraire des maquettes de présentations PDF à 300 DPI. Zéro perte de netteté, transparence alpha parfaite et surtout aucune attente de serveur. Un service 5 étoiles sans équivalent.',
    isVerified: true,
    upvotes: 42
  },
  {
    id: 'rev-2',
    name: 'Sarah Jenkins',
    role: 'Senior Compliance Paralegal',
    company: 'Vanguard Legal Group',
    country: 'United States',
    countryCode: '🇺🇸',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    toolUsed: 'PDF Form Flattener & Metadata Editor',
    toolSlug: 'pdf-flatten',
    date: '2026-10-30',
    title: 'The only converter our law firm permits: 100% private in-browser execution',
    comment: 'Because our documents contain confidential NDAs and client depositions, uploading files to random cloud servers violates our security agreements. MatrixConvert runs 100% inside Chrome memory. The PDF flattening and Bates numbering tools are flawless.',
    isVerified: true,
    upvotes: 38
  },
  {
    id: 'rev-3',
    name: 'Tariq Mahmood',
    role: 'Full-Stack Web Architect',
    company: 'TechWave Solutions',
    country: 'Pakistan',
    countryCode: '🇵🇰',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    toolUsed: 'Smart Image Compressor & PNG to WebP',
    toolSlug: 'image-compress',
    date: '2026-10-27',
    title: 'Reduced our e-commerce LCP from 2.8s to 0.9s! Outstanding satisfaction',
    comment: 'Rated 4.5 stars because it’s ridiculously fast. Converted our whole batch of product hero images from 3.5MB PNGs to 320KB WebP files. Google PageSpeed immediately jumped into the green zone. Bravo to Naveed and the team!',
    isVerified: true,
    upvotes: 29
  },
  {
    id: 'rev-4',
    name: 'Dr. Michael Schöning',
    role: 'Bioinformatics Researcher',
    company: 'Max Planck Institute',
    country: 'Germany',
    countryCode: '🇩🇪',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    toolUsed: 'Monochrome B&W PDF & Invert Colors',
    toolSlug: 'pdf-grayscale',
    date: '2026-10-24',
    title: 'Perfect for paper publication pre-flights and dark-mode reading',
    comment: 'Converting 200-page academic monographs into high-contrast monochrome PDF took literally 2 seconds. The dark-mode color inversion is also a lifesaver for nighttime reading of scientific papers. Incredibly well engineered.',
    isVerified: true,
    upvotes: 21
  },
  {
    id: 'rev-5',
    name: 'Elena Rostova',
    role: 'Freelance E-Commerce Photographer',
    company: 'Elena Studio',
    country: 'United Kingdom',
    countryCode: '🇬🇧',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    toolUsed: 'EXIF Metadata Stripper & Aspect Ratio Padder',
    toolSlug: 'image-exif-stripper',
    date: '2026-10-20',
    title: 'Guarantees client privacy and eliminates Instagram cropping disasters',
    comment: 'I love that I can strip GPS coordinates from client photos before posting them to social media. The aspect ratio padder allows me to post landscape photography to 4:5 Instagram feeds without cutting anything. Rated 4.5/5!',
    isVerified: true,
    upvotes: 19
  },
  {
    id: 'rev-6',
    name: 'Anika Rahman',
    role: 'Digital Content Creator',
    company: 'Dhaka Media Labs',
    country: 'Bangladesh',
    countryCode: '🇧🇩',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    toolUsed: 'Transparent PNG Maker & Social Padder',
    toolSlug: 'image-transparent-png-maker',
    date: '2026-10-18',
    title: 'অসাধারণ টুল! বাংলা ভাষার সংযোজন এবং দ্রুত কাজ দারুণ লেগেছে',
    comment: 'Removing white backgrounds from logos and making transparent PNGs happens in 1 click. Love that Bengali language is supported now as well. Zero waiting, free forever, and extremely smooth on mobile!',
    isVerified: true,
    upvotes: 34
  },
  {
    id: 'rev-7',
    name: 'Marco Bellini',
    role: 'Print Production Manager',
    company: 'Stampa Veloce Milano',
    country: 'Italy',
    countryCode: '🇮🇹',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    toolUsed: 'Print DPI Density Changer (72 to 300 DPI)',
    toolSlug: 'image-dpi-density-changer',
    date: '2026-10-14',
    title: 'Saved dozens of client files from print pre-flight rejection',
    comment: 'Clients constantly submit 72 DPI web screenshots for commercial print orders. This tool lets us upscale and density-tag files to 300 DPI without quality deterioration. Solid 4.5 stars satisfaction.',
    isVerified: true,
    upvotes: 16
  },
  {
    id: 'rev-8',
    name: 'Carmen Ortiz',
    role: 'Administrative Director',
    company: 'Soluciones Madrid',
    country: 'Spain',
    countryCode: '🇪🇸',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    toolUsed: 'Merge & Split PDF Pages',
    toolSlug: 'merge-pdf',
    date: '2026-10-09',
    title: 'Muy satisfecho: rápido, sencillo y sin límites diarios molestos',
    comment: 'A great 4-star experience! Other services block you after 2 files and demand credit cards. Here I merged 15 tax forms in 10 seconds without even having to register. Very satisfied with the reliability.',
    isVerified: true,
    upvotes: 14
  }
];
