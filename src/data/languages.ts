export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' }
];

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    appTitle: 'MatrixConvert',
    tagline: 'Universal Free Image & Document Converter',
    subTagline: 'Convert PDF, PNG, SVG, WebP, JPG, ICO and 30+ formats directly in your browser. 100% Free, zero file uploads, instant client-side privacy.',
    allTools: 'All 35+ Tools',
    popularTools: 'Most Popular',
    convertPdf: 'PDF Tools',
    convertPng: 'PNG Converters',
    convertSvg: 'Vector & SVG',
    convertWebp: 'WebP & Next-Gen',
    optimizeEdit: 'Optimize & Edit',
    matrixArtStudio: 'Matrix Art Studio',
    searchPlaceholder: 'Search any converter (e.g. PDF to PNG, SVG, WebP, ICO)...',
    dropTitle: 'Drop your files here to convert',
    dropSubtitle: 'or click to browse from device (PDF, PNG, JPG, WebP, SVG, AVIF, ICO)',
    clientSideNotice: '100% Client-Side Privacy: Files never leave your browser',
    convertNow: 'Convert Files Now',
    converting: 'Processing Client Stream...',
    download: 'Download File',
    downloadAllZip: 'Download All (.ZIP)',
    backToAll: '← Back to All Tools',
    whoCanUse: 'Who Can Use This Tool?',
    whereToUse: 'Where & When To Use This?',
    howToConvert: 'How to Convert',
    formatComparison: 'Format Comparison & Specifications',
    faqTitle: 'Frequently Asked Questions',
    relatedTools: 'Related Conversion Tools',
    matrixControls: 'Matrix Background',
    matrixRainSpeed: 'Rain Speed',
    matrixGlow: 'Phosphor Glow',
    quality: 'Output Quality',
    dpi: 'Resolution (DPI)',
    background: 'Background Canvas',
    transparent: 'Transparent',
    white: 'Solid White',
    allFreePledge: 'Free forever for everyone. No registration, no watermarks, no daily limits.',
    languageBannerText: 'MatrixConvert is also available in your language.',
    switchLang: 'Switch language',
    openTool: 'Open Converter →',
    readyForDownload: 'Ready for Download',
    clearQueue: 'Clear Queue',
    inputQueue: 'Input Queue',
    exploreAll: 'Explore 35+ Tools',
    heroButton: 'Convert an Image or PDF – it\'s free',
    browseAllBelow: 'or browse all 35+ tools ↓',
    howToTitle: 'Step-by-Step Conversion Guides',
    howToSubtitle: 'Learn how to convert, optimize, and export documents and graphics with zero quality loss.'
  },
  es: {
    appTitle: 'MatrixConvert',
    tagline: 'Conversor Universal Gratuito de Imágenes y Documentos',
    subTagline: 'Convierte PDF, PNG, SVG, WebP, JPG, ICO y más de 30 formatos directamente en tu navegador. 100% Gratis, sin subir archivos.',
    allTools: 'Todas las 35+ Herramientas',
    popularTools: 'Más Populares',
    convertPdf: 'Herramientas PDF',
    convertPng: 'Conversores PNG',
    convertSvg: 'Vector y SVG',
    convertWebp: 'WebP y Nueva Generación',
    optimizeEdit: 'Optimizar y Editar',
    matrixArtStudio: 'Estudio de Arte Matrix',
    searchPlaceholder: 'Buscar cualquier conversor (ej. PDF a PNG, SVG, WebP)...',
    dropTitle: 'Arrastra tus archivos aquí para convertir',
    dropSubtitle: 'o haz clic para explorar tu dispositivo (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100% Privacidad: Tus archivos nunca salen de tu navegador',
    convertNow: 'Convertir Archivos Ahora',
    converting: 'Procesando en el navegador...',
    download: 'Descargar Archivo',
    downloadAllZip: 'Descargar Todo (.ZIP)',
    backToAll: '← Volver a Todas las Herramientas',
    whoCanUse: '¿Quién Puede Usar Esta Herramienta?',
    whereToUse: '¿Dónde y Cuándo Usar Esta Conversión?',
    howToConvert: 'Cómo Convertir',
    formatComparison: 'Comparativa de Formatos y Especificaciones',
    faqTitle: 'Preguntas Frecuentes',
    relatedTools: 'Herramientas Relacionadas',
    matrixControls: 'Fondo Matrix',
    matrixRainSpeed: 'Velocidad de Lluvia',
    matrixGlow: 'Brillo Fósforo',
    quality: 'Calidad de Salida',
    dpi: 'Resolución (DPI)',
    background: 'Fondo del Lienzo',
    transparent: 'Transparente',
    white: 'Blanco Sólido',
    allFreePledge: 'Gratis para siempre. Sin registro, sin marcas de agua, sin límites.',
    languageBannerText: 'MatrixConvert está disponible en español.',
    switchLang: 'Cambiar de idioma',
    openTool: 'Abrir Conversor →',
    readyForDownload: 'Listo para Descargar',
    clearQueue: 'Limpiar Cola',
    inputQueue: 'Archivos Seleccionados',
    exploreAll: 'Ver 35+ Herramientas',
    heroButton: 'Convertir Imagen o PDF – es gratis',
    browseAllBelow: 'o ver las 35+ herramientas abajo ↓',
    howToTitle: 'Guías de Conversión Paso a Paso',
    howToSubtitle: 'Aprende a convertir, optimizar y exportar documentos e imágenes sin pérdida de calidad.'
  },
  fr: {
    appTitle: 'MatrixConvert',
    tagline: 'Convertisseur Gratuit d\'Images et de Documents',
    subTagline: 'Convertissez PDF, PNG, SVG, WebP, JPG, ICO et 30+ formats dans votre navigateur. 100% Gratuit, aucun envoi de fichier sur serveur.',
    allTools: 'Tous les 35+ Outils',
    popularTools: 'Les Plus Populaires',
    convertPdf: 'Outils PDF',
    convertPng: 'Convertir PNG',
    convertSvg: 'Vectoriel & SVG',
    convertWebp: 'WebP & Nouvelle Génération',
    optimizeEdit: 'Optimiser & Éditer',
    matrixArtStudio: 'Studio d\'Art Matrix',
    searchPlaceholder: 'Rechercher un outil (ex: PDF en PNG, SVG, WebP)...',
    dropTitle: 'Déposez vos fichiers ici pour convertir',
    dropSubtitle: 'ou cliquez pour parcourir vos fichiers (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100% Confidentialité locale: aucun fichier ne quitte votre appareil',
    convertNow: 'Convertir les Fichiers',
    converting: 'Conversion locale en cours...',
    download: 'Télécharger le Fichier',
    downloadAllZip: 'Tout Télécharger (.ZIP)',
    backToAll: '← Retour à tous les outils',
    whoCanUse: 'Qui peut utiliser cet outil ?',
    whereToUse: 'Où et quand utiliser cette conversion ?',
    howToConvert: 'Comment convertir étape par étape',
    formatComparison: 'Comparaison technique des formats',
    faqTitle: 'Foire Aux Questions',
    relatedTools: 'Outils associés',
    matrixControls: 'Arrière-plan Matrix',
    matrixRainSpeed: 'Vitesse de pluie',
    matrixGlow: 'Luminescence verte',
    quality: 'Qualité de sortie',
    dpi: 'Résolution (DPI)',
    background: 'Arrière-plan',
    transparent: 'Transparent',
    white: 'Blanc uni',
    allFreePledge: 'Gratuit pour toujours. Sans inscription, sans filigrane, sans limite.',
    languageBannerText: 'MatrixConvert est disponible en français.',
    switchLang: 'Changer de langue',
    openTool: 'Ouvrir l\'Outil →',
    readyForDownload: 'Prêt pour le Téléchargement',
    clearQueue: 'Vider la liste',
    inputQueue: 'Fichiers sélectionnés',
    exploreAll: 'Explorer les 35+ Outils',
    heroButton: 'Convertir une image ou un PDF – Gratuit',
    browseAllBelow: 'ou voir les 35+ outils ci-dessous ↓',
    howToTitle: 'Tutoriels de Conversion Étape par Étape',
    howToSubtitle: 'Découvrez comment convertir, compresser et exporter sans perte de netteté.'
  },
  de: {
    appTitle: 'MatrixConvert',
    tagline: 'Kostenloser Bild- & Dokumentkonverter',
    subTagline: 'Konvertieren Sie PDF, PNG, SVG, WebP, JPG, ICO und über 30 Formate direkt im Browser. 100% Kostenlos und privat.',
    allTools: 'Alle 35+ Werkzeuge',
    popularTools: 'Beliebteste Tools',
    convertPdf: 'PDF Werkzeuge',
    convertPng: 'PNG Konverter',
    convertSvg: 'Vektor & SVG',
    convertWebp: 'WebP & Next-Gen',
    optimizeEdit: 'Optimieren & Bearbeiten',
    matrixArtStudio: 'Matrix Kunst Studio',
    searchPlaceholder: 'Konverter suchen (z. B. PDF zu PNG, SVG, WebP)...',
    dropTitle: 'Dateien hierher ziehen zum Konvertieren',
    dropSubtitle: 'oder klicken zum Durchsuchen (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100% Datenschutz: Dateien verlassen niemals Ihren Browser',
    convertNow: 'Jetzt Konvertieren',
    converting: 'Wird lokal verarbeitet...',
    download: 'Datei Herunterladen',
    downloadAllZip: 'Alle als ZIP herunterladen',
    backToAll: '← Zurück zu allen Werkzeugen',
    whoCanUse: 'Wer kann dieses Werkzeug nutzen?',
    whereToUse: 'Wo und wann ist diese Konvertierung nützlich?',
    howToConvert: 'Schritt-für-Schritt-Anleitung',
    formatComparison: 'Formatvergleich & Spezifikationen',
    faqTitle: 'Häufig gestellte Fragen',
    relatedTools: 'Verwandte Konverter',
    matrixControls: 'Matrix Hintergrund',
    matrixRainSpeed: 'Regengeschwindigkeit',
    matrixGlow: 'Matrix Leuchten',
    quality: 'Qualität',
    dpi: 'Auflösung (DPI)',
    background: 'Hintergrund',
    transparent: 'Transparent',
    white: 'Weiß',
    allFreePledge: 'Für immer kostenlos. Ohne Anmeldung, ohne Wasserzeichen.',
    languageBannerText: 'MatrixConvert ist auf Deutsch verfügbar.',
    switchLang: 'Sprache wechseln',
    openTool: 'Werkzeug öffnen →',
    readyForDownload: 'Bereit zum Download',
    clearQueue: 'Warteschlange leeren',
    inputQueue: 'Ausgewählte Dateien',
    exploreAll: '35+ Tools durchsuchen',
    heroButton: 'Bild oder PDF konvertieren – Kostenlos',
    browseAllBelow: 'oder alle 35+ Werkzeuge unten ansehen ↓',
    howToTitle: 'Schritt-für-Schritt Anleitungen',
    howToSubtitle: 'Erfahren Sie, wie Sie Grafiken und PDFs ohne Qualitätsverlust konvertieren.'
  },
  it: {
    appTitle: 'MatrixConvert',
    tagline: 'Convertitore Gratuito di Immagini e Documenti',
    subTagline: 'Converti PDF, PNG, SVG, WebP, JPG, ICO e più di 30 formati direttamente nel browser. 100% Gratuito, nessun upload sul server.',
    allTools: 'Tutti i 35+ Strumenti',
    popularTools: 'Più Popolari',
    convertPdf: 'Strumenti PDF',
    convertPng: 'Convertitori PNG',
    convertSvg: 'Vettoriale e SVG',
    convertWebp: 'WebP e Nuova Generazione',
    optimizeEdit: 'Ottimizza e Modifica',
    matrixArtStudio: 'Studio d\'Arte Matrix',
    searchPlaceholder: 'Cerca qualsiasi convertitore (es. PDF in PNG, SVG)...',
    dropTitle: 'Trascina qui i tuoi file da convertire',
    dropSubtitle: 'o clicca per sfogliare dal dispositivo (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100% Privacy: I tuoi file non lasciano mai il browser',
    convertNow: 'Converti i File Ora',
    converting: 'Elaborazione in corso...',
    download: 'Scarica File Convertito',
    downloadAllZip: 'Scarica Tutto (.ZIP)',
    backToAll: '← Torna a Tutti gli Strumenti',
    whoCanUse: 'Chi può usare questo strumento?',
    whereToUse: 'Dove e quando usare questa conversione?',
    howToConvert: 'Come Convertire Passo dopo Passo',
    formatComparison: 'Confronto Specifiche Tecniche',
    faqTitle: 'Domande Frequenti (FAQ)',
    relatedTools: 'Strumenti Correlati',
    matrixControls: 'Sfondo Matrix',
    matrixRainSpeed: 'Velocità Pioggia',
    matrixGlow: 'Luminosità Verde',
    quality: 'Qualità di Uscita',
    dpi: 'Risoluzione (DPI)',
    background: 'Sfondo',
    transparent: 'Trasparente',
    white: 'Bianco Solido',
    allFreePledge: 'Gratuito per sempre. Nessuna registrazione, senza watermark.',
    languageBannerText: 'MatrixConvert è disponibile in italiano.',
    switchLang: 'Cambia lingua',
    openTool: 'Apri Strumento →',
    readyForDownload: 'Pronto per il Download',
    clearQueue: 'Svuota Coda',
    inputQueue: 'File Selezionati',
    exploreAll: 'Esplora 35+ Strumenti',
    heroButton: 'Converti Immagine o PDF – È gratis',
    browseAllBelow: 'o sfoglia tutti i 35+ strumenti in basso ↓',
    howToTitle: 'Guide di Conversione Passo Passo',
    howToSubtitle: 'Impara a convertire e comprimere immagini e PDF senza perdere qualità.'
  },
  pt: {
    appTitle: 'MatrixConvert',
    tagline: 'Conversor Gratuito de Imagens e Documentos',
    subTagline: 'Converta PDF, PNG, SVG, WebP, JPG, ICO e mais de 30 formatos no seu navegador. 100% Gratuito, sem envio para servidores.',
    allTools: 'Todas as 35+ Ferramentas',
    popularTools: 'Mais Populares',
    convertPdf: 'Ferramentas PDF',
    convertPng: 'Conversores PNG',
    convertSvg: 'Vetores e SVG',
    convertWebp: 'WebP e Nova Geração',
    optimizeEdit: 'Otimizar e Editar',
    matrixArtStudio: 'Estúdio de Arte Matrix',
    searchPlaceholder: 'Pesquisar conversor (ex: PDF para PNG, SVG, WebP)...',
    dropTitle: 'Arraste seus arquivos aqui para converter',
    dropSubtitle: 'ou clique para navegar no seu dispositivo (PDF, PNG, JPG, WebP)',
    clientSideNotice: '100% Privacidade: Seus arquivos nunca saem do seu navegador',
    convertNow: 'Converter Arquivos Agora',
    converting: 'Processando no navegador...',
    download: 'Baixar Arquivo Convertido',
    downloadAllZip: 'Baixar Tudo (.ZIP)',
    backToAll: '← Voltar para Todas as Ferramentas',
    whoCanUse: 'Quem pode usar esta ferramenta?',
    whereToUse: 'Onde e quando usar esta conversão?',
    howToConvert: 'Como Converter Passo a Passo',
    formatComparison: 'Comparação Técnica de Formatos',
    faqTitle: 'Perguntas Frequentes',
    relatedTools: 'Ferramentas Relacionadas',
    matrixControls: 'Fundo Matrix',
    matrixRainSpeed: 'Velocidade da Chuva',
    matrixGlow: 'Brilho Fósforo',
    quality: 'Qualidade de Saída',
    dpi: 'Resolução (DPI)',
    background: 'Fundo da Imagem',
    transparent: 'Transparente',
    white: 'Branco Sólido',
    allFreePledge: 'Gratuito para sempre. Sem cadastro, sem marcas d\'água.',
    languageBannerText: 'MatrixConvert está disponível em português.',
    switchLang: 'Mudar idioma',
    openTool: 'Abrir Conversor →',
    readyForDownload: 'Pronto para Download',
    clearQueue: 'Limpar Fila',
    inputQueue: 'Arquivos Selecionados',
    exploreAll: 'Ver 35+ Ferramentas',
    heroButton: 'Converter Imagem ou PDF – Grátis',
    browseAllBelow: 'ou veja todas as 35+ ferramentas abaixo ↓',
    howToTitle: 'Guias Práticos de Conversão',
    howToSubtitle: 'Aprenda a converter e otimizar imagens e documentos com total nitidez.'
  },
  ja: {
    appTitle: 'MatrixConvert',
    tagline: '完全無料の画像・ドキュメント変換ツール',
    subTagline: 'PDF、PNG、SVG、WebP、JPG、ICOなど30種類以上の形式をブラウザ上で安全に変換。100%無料、サーバー送信なしの完全プライバシー。',
    allTools: '全35+ツール一覧',
    popularTools: '人気ツール',
    convertPdf: 'PDF変換ツール',
    convertPng: 'PNG変換',
    convertSvg: 'ベクター & SVG',
    convertWebp: 'WebP & 次世代形式',
    optimizeEdit: '最適化・編集',
    matrixArtStudio: 'マトリックスアート工房',
    searchPlaceholder: 'ツールを検索 (例: PDF to PNG, SVG, WebP)...',
    dropTitle: 'ここにファイルをドロップして変換',
    dropSubtitle: 'またはクリックしてファイルを選択 (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100%ローカル実行: ファイルが外部サーバーへ送信されることはありません',
    convertNow: '今すぐ変換する',
    converting: 'ローカル処理中...',
    download: '変換ファイルを保存',
    downloadAllZip: '一括保存 (.ZIP)',
    backToAll: '← 全ツール一覧に戻る',
    whoCanUse: 'このツールは誰におすすめ？',
    whereToUse: '活用シーンとメリット',
    howToConvert: '変換手順（3ステップ）',
    formatComparison: 'フォーマット仕様と特徴比較',
    faqTitle: 'よくある質問 (FAQ)',
    relatedTools: '関連する変換ツール',
    matrixControls: 'マトリックス背景設定',
    matrixRainSpeed: '降下速度',
    matrixGlow: 'グリーン発光',
    quality: '画質設定',
    dpi: '解像度 (DPI)',
    background: '背景モード',
    transparent: '透過背景',
    white: '白背景',
    allFreePledge: '誰でもずっと完全無料。会員登録不要・透かしなし・無制限。',
    languageBannerText: 'MatrixConvert は日本語でご利用いただけます。',
    switchLang: '言語を切り替える',
    openTool: 'ツールを開く →',
    readyForDownload: 'ダウンロードの準備完了',
    clearQueue: 'リストをクリア',
    inputQueue: '選択されたファイル',
    exploreAll: '35+全ツールを見る',
    heroButton: '画像・PDFを無料変換する',
    browseAllBelow: 'または下の35+ツールを閲覧 ↓',
    howToTitle: '実践チュートリアル & ガイド',
    howToSubtitle: '画質を落とさずに画像やPDFを変換・圧縮する方法をご紹介します。'
  },
  zh: {
    appTitle: 'MatrixConvert',
    tagline: '完全免费的图像与文档转换器',
    subTagline: '在浏览器本地直接转换 PDF、PNG、SVG、WebP、JPG、ICO 等30多种格式。100%免费，文件无需上传云端，保障个人隐私。',
    allTools: '全部 35+ 款工具',
    popularTools: '热门工具',
    convertPdf: 'PDF 转换工具',
    convertPng: 'PNG 转换',
    convertSvg: '矢量与 SVG',
    convertWebp: 'WebP 与下一代格式',
    optimizeEdit: '压缩与编辑',
    matrixArtStudio: '黑客帝国艺术工坊',
    searchPlaceholder: '搜索转换工具 (如 PDF 转 PNG, SVG, WebP)...',
    dropTitle: '拖拽文件至此处即可转换',
    dropSubtitle: '或点击浏览本地文件 (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100% 浏览器本地安全处理：文件绝不上传外部服务器',
    convertNow: '立即开始转换',
    converting: '本地矩阵代码计算中...',
    download: '下载转换文件',
    downloadAllZip: '一键打包下载 (.ZIP)',
    backToAll: '← 返回全部工具列表',
    whoCanUse: '适用人群与工作流',
    whereToUse: '使用场景与核心优势',
    howToConvert: '转换教程（三步完成）',
    formatComparison: '格式参数深度对比',
    faqTitle: '常见问题解答',
    relatedTools: '相关转换工具',
    matrixControls: '代码雨背景控制',
    matrixRainSpeed: '流动速度',
    matrixGlow: '荧光效果',
    quality: '画质参数',
    dpi: '分辨率 (DPI)',
    background: '背景设置',
    transparent: '透明背景',
    white: '纯白背景',
    allFreePledge: '永久免费供所有人使用。无须注册、无水印、无限制。',
    languageBannerText: 'MatrixConvert 现已支持简体中文。',
    switchLang: '切换语言',
    openTool: '打开工具 →',
    readyForDownload: '文件已生成，可供下载',
    clearQueue: '清空列表',
    inputQueue: '待处理文件队列',
    exploreAll: '探索全部 35+ 工具',
    heroButton: '免费转换图片或 PDF',
    browseAllBelow: '或浏览下方 35+ 款工具 ↓',
    howToTitle: '核心转换步骤指南',
    howToSubtitle: '快速掌握高质量转换、矢量导出及图片压缩技巧。'
  },
  ru: {
    appTitle: 'MatrixConvert',
    tagline: 'Бесплатный Конвертер Изображений и Документов',
    subTagline: 'Конвертируйте PDF, PNG, SVG, WebP, JPG, ICO и более 30 форматов прямо в браузере. 100% Бесплатно, без загрузки на сервер.',
    allTools: 'Все 35+ Инструментов',
    popularTools: 'Популярные',
    convertPdf: 'Инструменты PDF',
    convertPng: 'Конвертеры PNG',
    convertSvg: 'Вектор и SVG',
    convertWebp: 'WebP и Новые Форматы',
    optimizeEdit: 'Оптимизация и Редактирование',
    matrixArtStudio: 'Матрикс Арт Студия',
    searchPlaceholder: 'Поиск конвертера (например, PDF в PNG, SVG)...',
    dropTitle: 'Перетащите файлы сюда для конвертации',
    dropSubtitle: 'или нажмите для выбора с устройства (PDF, PNG, JPG, WebP)',
    clientSideNotice: '100% Конфиденциальность: файлы обрабатываются только локально',
    convertNow: 'Конвертировать Сейчас',
    converting: 'Локальная обработка...',
    download: 'Скачать Файл',
    downloadAllZip: 'Скачать Всё (.ZIP)',
    backToAll: '← Назад ко всем инструментам',
    whoCanUse: 'Кому подходит этот инструмент?',
    whereToUse: 'Где и когда применять конвертацию?',
    howToConvert: 'Пошаговая инструкция',
    formatComparison: 'Сравнение форматов и параметров',
    faqTitle: 'Часто задаваемые вопросы',
    relatedTools: 'Похожие инструменты',
    matrixControls: 'Фон Матрицы',
    matrixRainSpeed: 'Скорость дождя',
    matrixGlow: 'Зеленое свечение',
    quality: 'Качество',
    dpi: 'Разрешение (DPI)',
    background: 'Фон',
    transparent: 'Прозрачный',
    white: 'Белый',
    allFreePledge: 'Бесплатно навсегда. Без регистрации и водяных знаков.',
    languageBannerText: 'MatrixConvert доступен на русском языке.',
    switchLang: 'Переключить язык',
    openTool: 'Открыть Конвертер →',
    readyForDownload: 'Готово к Скачиванию',
    clearQueue: 'Очистить очередь',
    inputQueue: 'Выбранные файлы',
    exploreAll: 'Все 35+ Инструментов',
    heroButton: 'Конвертировать изображение или PDF',
    browseAllBelow: 'или выберите инструмент ниже ↓',
    howToTitle: 'Пошаговые Руководства',
    howToSubtitle: 'Узнайте, как конвертировать и сжимать файлы без потери качества.'
  },
  ar: {
    appTitle: 'MatrixConvert',
    tagline: 'محول صور ومستندات مجاني وشامل',
    subTagline: 'قم بتحويل PDF وPNG وSVG وWebP وJPG وICO وأكثر من 30 صيغة في متصفحك مباشرة. مجاني 100%، بدون رفع ملفات.',
    allTools: 'جميع الـ 35+ أداة',
    popularTools: 'الأكثر شعبية',
    convertPdf: 'أدوات PDF',
    convertPng: 'محولات PNG',
    convertSvg: 'متجه و SVG',
    convertWebp: 'WebP والجيل الجديد',
    optimizeEdit: 'تحسين وتعديل',
    matrixArtStudio: 'استوديو فن الماتريكس',
    searchPlaceholder: 'ابحث عن أي محول (مثلاً PDF إلى PNG, SVG)...',
    dropTitle: 'أفلت ملفاتك هنا للتحويل الفوري',
    dropSubtitle: 'أو انقر لاختيار ملف من جهازك (PDF, PNG, JPG, WebP)',
    clientSideNotice: 'خصوصية كاملة 100%: ملفاتك لا تغادر متصفحك أبداً',
    convertNow: 'تحويل الملفات الآن',
    converting: 'جاري المعالجة محلياً...',
    download: 'تحميل الملف المحول',
    downloadAllZip: 'تحميل الكل (.ZIP)',
    backToAll: '← العودة لجميع الأدوات',
    whoCanUse: 'من يمكنه استخدام هذه الأداة؟',
    whereToUse: 'أين ومتى تستخدم هذا التحويل؟',
    howToConvert: 'خطوات التحويل بالتفصيل',
    formatComparison: 'مقارنة الصيغ والمواصفات',
    faqTitle: 'الأسئلة الشائعة',
    relatedTools: 'أدوات ذات صلة',
    matrixControls: 'خلفية الماتريكس',
    matrixRainSpeed: 'سرعة المطر الرقمي',
    matrixGlow: 'توهج الفسفور',
    quality: 'الجودة',
    dpi: 'الدقة (DPI)',
    background: 'الخلفية',
    transparent: 'شفافة',
    white: 'أبيض ناصع',
    allFreePledge: 'مجاني للجميع إلى الأبد. بدون تسجيل أو علامة مائية.',
    languageBannerText: 'MatrixConvert متاح باللغة العربية.',
    switchLang: 'تغيير اللغة',
    openTool: 'فتح المحول ←',
    readyForDownload: 'الملفات جاهزة للتحميل',
    clearQueue: 'مسح القائمة',
    inputQueue: 'الملفات المحددة',
    exploreAll: 'استكشف الـ 35+ أداة',
    heroButton: 'تحويل صورة أو PDF – مجاناً',
    browseAllBelow: 'أو تصفح جميع الأدوات أدناه ↓',
    howToTitle: 'أدلة إرشادية خطوة بخطوة',
    howToSubtitle: 'تعلم كيفية تحويل وضغط المستندات والصور بأعلى دقة ممكنة.'
  },
  hi: {
    appTitle: 'MatrixConvert',
    tagline: 'मुफ़्त इमेज और डॉक्यूमेंट कन्वर्टर',
    subTagline: 'PDF, PNG, SVG, WebP, JPG, ICO और 30+ फ़ॉर्मेट्स को सीधे अपने ब्राउज़र में बदलें। 100% मुफ़्त और सुरक्षित।',
    allTools: 'सभी 35+ टूल्स',
    popularTools: 'सर्वाधिक लोकप्रिय',
    convertPdf: 'PDF टूल्स',
    convertPng: 'PNG कन्वर्टर',
    convertSvg: 'वेक्टर और SVG',
    convertWebp: 'WebP और मॉडर्न फ़ॉर्मेट',
    optimizeEdit: 'ऑप्टिमाइज़ और एडिट',
    matrixArtStudio: 'मैट्रिक्स आर्ट स्टूडियो',
    searchPlaceholder: 'कन्वर्टर खोजें (उदा. PDF to PNG, SVG, WebP)...',
    dropTitle: 'फ़ाइलें यहाँ ड्रॉप करें',
    dropSubtitle: 'या डिवाइस से चुनें (PDF, PNG, JPG, WebP, SVG)',
    clientSideNotice: '100% गोपनीयता: आपकी फ़ाइलें कभी सर्वर पर अपलोड नहीं होतीं',
    convertNow: 'अभी कन्वर्ट करें',
    converting: 'कन्वर्ट हो रहा है...',
    download: 'डाउनलोड करें',
    downloadAllZip: 'सभी डाउनलोड करें (.ZIP)',
    backToAll: '← सभी टूल्स पर वापस जाएँ',
    whoCanUse: 'यह टूल किसके लिए है?',
    whereToUse: 'इसका उपयोग कब और कहाँ करें?',
    howToConvert: 'कन्वर्ट कैसे करें',
    formatComparison: 'फ़ॉर्मेट तुलना और विवरण',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    relatedTools: 'संबंधित टूल्स',
    matrixControls: 'मैट्रिक्स बैकग्राउंड',
    matrixRainSpeed: 'स्पीड',
    matrixGlow: 'ग्लो',
    quality: 'क्वालिटी',
    dpi: 'रिज़ॉल्यूशन (DPI)',
    background: 'बैकग्राउंड',
    transparent: 'पारदर्शी (Transparent)',
    white: 'सफेद',
    allFreePledge: 'हमेशा के लिए मुफ़्त। बिना किसी रजिस्ट्रेशन के।',
    languageBannerText: 'MatrixConvert हिन्दी में भी उपलब्ध है।',
    switchLang: 'भाषा बदलें',
    openTool: 'टूल खोलें →',
    readyForDownload: 'डाउनलोड के लिए तैयार',
    clearQueue: 'क़तार साफ़ करें',
    inputQueue: 'चुनी गई फ़ाइलें',
    exploreAll: 'सभी 35+ टूल्स देखें',
    heroButton: 'इमेज या PDF मुफ़्त कन्वर्ट करें',
    browseAllBelow: 'या नीचे दिए गए सभी टूल्स देखें ↓',
    howToTitle: 'कदम-दर-कदम गाइड',
    howToSubtitle: 'बिना क्वालिटी खोए फ़ाइलें कन्वर्ट और कंप्रेस करने का आसान तरीका।'
  },
  nl: {
    appTitle: 'MatrixConvert',
    tagline: 'Gratis Afbeeldingen- en Documentconverter',
    subTagline: 'Converteer PDF, PNG, SVG, WebP, JPG, ICO en 30+ formaten direct in je browser. 100% Gratis en veilig.',
    allTools: 'Alle 35+ Gereedschappen',
    popularTools: 'Meest Populair',
    convertPdf: 'PDF Gereedschappen',
    convertPng: 'PNG Converters',
    convertSvg: 'Vector & SVG',
    convertWebp: 'WebP & Next-Gen',
    optimizeEdit: 'Optimaliseren & Bewerken',
    matrixArtStudio: 'Matrix Kunst Studio',
    searchPlaceholder: 'Zoek een converter (bijv. PDF naar PNG, SVG)...',
    dropTitle: 'Sleep je bestanden hierheen om te converteren',
    dropSubtitle: 'of klik om te bladeren vanaf je apparaat (PDF, PNG, JPG, WebP)',
    clientSideNotice: '100% Privacy: Je bestanden verlaten nooit je browser',
    convertNow: 'Bestanden Nu Converteren',
    converting: 'Bezig met converteren...',
    download: 'Bestand Downloaden',
    downloadAllZip: 'Alles Downloaden (.ZIP)',
    backToAll: '← Terug naar Alle Gereedschappen',
    whoCanUse: 'Voor wie is dit gereedschap geschikt?',
    whereToUse: 'Waar en wanneer te gebruiken?',
    howToConvert: 'Stap-voor-stap handleiding',
    formatComparison: 'Formaatvergelijking & specificaties',
    faqTitle: 'Veelgestelde Vragen',
    relatedTools: 'Gerelateerde Gereedschappen',
    matrixControls: 'Matrix Achtergrond',
    matrixRainSpeed: 'Regensnelheid',
    matrixGlow: 'Groene Gloed',
    quality: 'Uitvoerkwaliteit',
    dpi: 'Resolutie (DPI)',
    background: 'Achtergrond',
    transparent: 'Transparant',
    white: 'Wit',
    allFreePledge: 'Voor altijd gratis. Geen registratie, geen watermerken.',
    languageBannerText: 'MatrixConvert is ook beschikbaar in het Nederlands.',
    switchLang: 'Taal wisselen',
    openTool: 'Open Converter →',
    readyForDownload: 'Klaar om te Downloaden',
    clearQueue: 'Lijst wissen',
    inputQueue: 'Geselecteerde bestanden',
    exploreAll: 'Bekijk 35+ Gereedschappen',
    heroButton: 'Converteer Afbeelding of PDF – Gratis',
    browseAllBelow: 'of bekijk alle gereedschappen hieronder ↓',
    howToTitle: 'Stap-voor-stap Handleidingen',
    howToSubtitle: 'Ontdek hoe u afbeeldingen en PDF\'s converteert zonder kwaliteitsverlies.'
  }
};

/**
 * Localized Tool Names & Short Descriptions for All Languages
 */
export const TOOL_TRANSLATIONS: Record<string, Record<string, { name: string; desc: string }>> = {
  es: {
    'pdf-to-png': {
      name: 'Conversor de PDF a PNG',
      desc: 'Convierte páginas PDF en imágenes PNG de alta resolución con DPI personalizado y fondos transparentes.'
    },
    'pdf-to-svg': {
      name: 'Conversor de PDF a SVG Vectorial',
      desc: 'Transforma páginas PDF y planos en gráficos vectoriales SVG escalables infinitamente.'
    },
    'png-to-webp': {
      name: 'Conversor de PNG a WebP',
      desc: 'Comprime imágenes PNG pesadas al formato WebP de última generación ahorrando hasta un 70% de tamaño.'
    },
    'jpg-to-png': {
      name: 'Conversor de JPG a PNG',
      desc: 'Convierte imágenes JPG y JPEG a formato PNG sin compresión con soporte de transparencia.'
    },
    'svg-to-png': {
      name: 'Conversor de SVG a PNG',
      desc: 'Renderiza código vectorial SVG en imágenes PNG ultra nítidas hasta en resolución 8K.'
    },
    'png-to-ico': {
      name: 'Generador de Favicon PNG a ICO',
      desc: 'Genera iconos ICO estándar para Windows y favicons web multirresolución (16px a 256px).'
    },
    'image-to-pdf': {
      name: 'Imágenes a Documento PDF',
      desc: 'Combina múltiples fotos JPG, PNG y WebP en un solo documento PDF profesional y paginado.'
    },
    'image-compress': {
      name: 'Compresor Inteligente de Imágenes',
      desc: 'Reduce el tamaño de imágenes JPG, PNG y WebP hasta un 85% manteniendo una gran nitidez.'
    },
    'image-matrix-art': {
      name: 'Generador de Arte Matrix & ASCII',
      desc: 'Convierte fotos en lluvia digital verde estilo Matrix con glifos Katakana y código binario.'
    },
    'pdf-to-jpg': {
      name: 'Conversor de PDF a JPG',
      desc: 'Convierte páginas de documentos PDF en fotos JPEG ligeras y universalmente compatibles.'
    },
    'png-to-svg': {
      name: 'Vectorizador de PNG a SVG',
      desc: 'Vectoriza logotipos e iconos PNG en trazos limpios de SVG escalables.'
    },
    'webp-to-png': {
      name: 'Conversor de WebP a PNG',
      desc: 'Convierte imágenes WebP a formato PNG universal conservando la transparencia.'
    },
    'jpg-to-webp': {
      name: 'Conversor de JPG a WebP',
      desc: 'Comprime fotografías JPEG a WebP para acelerar la carga de tu sitio web.'
    },
    'image-resize': {
      name: 'Redimensionador de Imágenes',
      desc: 'Cambia el tamaño de fotos por píxeles exactos o porcentaje con bloqueo de proporción.'
    },
    'image-crop': {
      name: 'Recortador de Imágenes',
      desc: 'Recorta márgenes y ajusta fotos a proporciones estándar (16:9, 1:1, 4:3).'
    },
    'image-grayscale': {
      name: 'Filtro Blanco y Negro / Escala de Grises',
      desc: 'Convierte imágenes a escala de grises para ahorrar tinta de impresora y dar un toque clásico.'
    },
    'image-rotate': {
      name: 'Rotar y Voltear Imagen',
      desc: 'Gira fotos de lado 90°, 180° o voltéalas horizontalmente sin perder resolución.'
    },
    'image-to-bmp': {
      name: 'Conversor de Imagen a BMP',
      desc: 'Genera archivos BMP sin compresión ideales para microcontroladores y pantallas e-paper.'
    }
  },
  fr: {
    'pdf-to-png': {
      name: 'Convertisseur PDF en PNG',
      desc: 'Convertissez les pages PDF en images PNG haute résolution avec DPI personnalisé et transparence.'
    },
    'pdf-to-svg': {
      name: 'Convertisseur PDF en SVG Vectoriel',
      desc: 'Transformez vos documents et schémas PDF en vecteurs SVG évolutifs à l\'infini.'
    },
    'png-to-webp': {
      name: 'Convertisseur PNG en WebP',
      desc: 'Réduisez le poids de vos PNG jusqu\'à 70% grâce au format WebP nouvelle génération.'
    },
    'jpg-to-png': {
      name: 'Convertisseur JPG en PNG',
      desc: 'Convertissez vos photos JPG en fichiers PNG sans perte avec prise en charge de la transparence.'
    },
    'svg-to-png': {
      name: 'Convertisseur SVG en PNG',
      desc: 'Rastérisez vos fichiers vectoriels SVG en PNG ultra-nets jusqu\'en résolution 8K.'
    },
    'png-to-ico': {
      name: 'Générateur de Favicon PNG en ICO',
      desc: 'Créez des fichiers d\'icônes ICO multi-résolutions (16px à 256px) pour Windows et le web.'
    },
    'image-to-pdf': {
      name: 'Images en Document PDF',
      desc: 'Fusionnez plusieurs images JPG, PNG et WebP dans un document PDF paginé prêt à imprimer.'
    },
    'image-compress': {
      name: 'Compresseur d\'Image Intelligent',
      desc: 'Diminuez le poids de vos images jusqu\'à 85% tout en préservant une netteté remarquable.'
    },
    'image-matrix-art': {
      name: 'Générateur d\'Art Matrix & ASCII',
      desc: 'Transformez vos photos en pluie de code Matrix verte luminescente avec glyphes Katakana.'
    },
    'pdf-to-jpg': {
      name: 'Convertisseur PDF en JPG',
      desc: 'Convertissez les pages d\'un PDF en images JPEG légères et universellement lisibles.'
    },
    'png-to-svg': {
      name: 'Vectorisation PNG en SVG',
      desc: 'Transformez logos et croquis PNG en tracés vectoriels SVG éditables.'
    },
    'webp-to-png': {
      name: 'Convertisseur WebP en PNG',
      desc: 'Rendez vos images WebP compatibles partout en les convertissant en PNG sans perte.'
    },
    'jpg-to-webp': {
      name: 'Convertisseur JPG en WebP',
      desc: 'Accélérez votre site en convertissant vos photos JPEG en WebP ultra-rapide.'
    },
    'image-resize': {
      name: 'Redimensionner et Mettre à l\'Échelle',
      desc: 'Ajustez la largeur et la hauteur en pixels avec verrouillage des proportions.'
    },
    'image-crop': {
      name: 'Outil de Recadrage d\'Image',
      desc: 'Recadrez vos photos aux formats 16:9, 1:1, 4:3 en toute simplicité.'
    },
    'image-grayscale': {
      name: 'Filtre Niveaux de Gris / Noir & Blanc',
      desc: 'Supprimez la couleur pour économiser l\'encre de votre imprimante.'
    },
    'image-rotate': {
      name: 'Faire Pivoter et Miroir',
      desc: 'Redressez vos photos à 90°, 180° ou retournez-les horizontalement.'
    },
    'image-to-bmp': {
      name: 'Convertisseur Image en BMP',
      desc: 'Convertissez vers le format bitmap brut BMP pour microcontrôleurs et écrans Arduino.'
    }
  },
  de: {
    'pdf-to-png': {
      name: 'PDF zu PNG Konverter',
      desc: 'Konvertieren Sie PDF-Seiten in hochauflösende, verlustfreie PNG-Bilder mit benutzerdefinierter DPI.'
    },
    'pdf-to-svg': {
      name: 'PDF zu SVG Vektor-Konverter',
      desc: 'Wandeln Sie PDF-Dokumente und Skizzen in stufenlos skalierbare SVG-Vektorgrafiken um.'
    },
    'png-to-webp': {
      name: 'PNG zu WebP Konverter',
      desc: 'Reduzieren Sie die Dateigröße um bis zu 70% mit modernem WebP bei voller Transparenz.'
    },
    'jpg-to-png': {
      name: 'JPG zu PNG Konverter',
      desc: 'Konvertieren Sie komprimierte JPG-Fotos in verlustfreies PNG-Format.'
    },
    'svg-to-png': {
      name: 'SVG zu PNG Konverter',
      desc: 'Rendern Sie SVG-Vektoren in gestochen scharfe PNG-Bilder bis zu 8K Auflösung.'
    },
    'png-to-ico': {
      name: 'PNG zu ICO Favicon Generator',
      desc: 'Erstellen Sie Windows-Icon-Dateien und Multi-Resolution Favicons von 16px bis 256px.'
    },
    'image-to-pdf': {
      name: 'Bilder zu PDF Dokument',
      desc: 'Fügen Sie mehrere JPG-, PNG- und WebP-Bilder zu einem einheitlichen PDF zusammen.'
    },
    'image-compress': {
      name: 'Intelligenter Bildkompressor',
      desc: 'Reduzieren Sie die Dateigröße um bis zu 85% bei gestochen scharfer visueller Qualität.'
    },
    'image-matrix-art': {
      name: 'Matrix Code & ASCII Kunst Generator',
      desc: 'Verwandeln Sie jedes Bild in leuchtenden Matrix-Regen mit Katakana- und Binärcode.'
    },
    'pdf-to-jpg': {
      name: 'PDF zu JPG Konverter',
      desc: 'Wandeln Sie PDF-Seiten in kompakte, universell kompatible JPEG-Bilder um.'
    },
    'png-to-svg': {
      name: 'PNG zu SVG Vektorisierer',
      desc: 'Vektorisieren Sie Rasterlogos in saubere, unendlich skalierbare SVG-Pfade.'
    },
    'webp-to-png': {
      name: 'WebP zu PNG Konverter',
      desc: 'Konvertieren Sie WebP-Bilder in universell lesbare PNGs mit Alphakanal.'
    },
    'jpg-to-webp': {
      name: 'JPG zu WebP Konverter',
      desc: 'Komprimieren Sie JPEG-Fotos zu modernem WebP für schnellere Ladezeiten.'
    },
    'image-resize': {
      name: 'Bildgröße Ändern & Skalieren',
      desc: 'Skalieren Sie Pixel oder Prozent mit automatischer Seitenverhältnis-Sperre.'
    },
    'image-crop': {
      name: 'Bild Zuschneiden',
      desc: 'Schneiden Sie Fotos auf Standardformate wie 16:9, 1:1 oder 4:3 zu.'
    },
    'image-grayscale': {
      name: 'Graustufen & Schwarz-Weiß Filter',
      desc: 'Sparen Sie Druckertinte durch Umwandlung in reines Schwarz-Weiß.'
    },
    'image-rotate': {
      name: 'Bild Drehen & Spiegeln',
      desc: 'Drehen Sie Fotos um 90° oder spiegeln Sie sie horizontal ohne Qualitätsverlust.'
    },
    'image-to-bmp': {
      name: 'Bild zu BMP Konverter',
      desc: 'Erstellen Sie unkomprimierte BMP-Dateien für Mikrocontroller und Displays.'
    }
  },
  ja: {
    'pdf-to-png': {
      name: 'PDF から PNG 変換',
      desc: 'PDFページを高解像度・透明背景の高品質PNG画像に高速変換します。'
    },
    'pdf-to-svg': {
      name: 'PDF から SVG ベクター変換',
      desc: 'PDFの図面や文字を拡大しても劣化しない無限拡大ベクターSVGに変換します。'
    },
    'png-to-webp': {
      name: 'PNG から WebP 変換',
      desc: '透過度を保ったまま画像ファイルサイズを最大70%削減します。'
    },
    'jpg-to-png': {
      name: 'JPG から PNG 変換',
      desc: '劣化のない可逆圧縮PNG形式へ変換し、編集に適した画像にします。'
    },
    'svg-to-png': {
      name: 'SVG から PNG 変換',
      desc: 'SVGベクターを最大8K相当の極めて高精細なPNGへレンダリングします。'
    },
    'png-to-ico': {
      name: 'PNG から ICO ファビコン生成',
      desc: '16px〜256pxまでの各解像度を1つにまとめたWindows/Web用ICOを作成します。'
    },
    'image-to-pdf': {
      name: '画像を1つの PDF に結合',
      desc: '複数のJPG、PNG、WebP画像を1冊のきれいなPDF文書にまとめます。'
    },
    'image-compress': {
      name: '高画質スマート画像圧縮',
      desc: '見た目の美しさを保ちながら画像容量を最大85%軽量化します。'
    },
    'image-matrix-art': {
      name: 'マトリックス・ASCIIアート変換',
      desc: '写真やロゴを緑色に光るマトリックスコード雨やアスキーアートに変換します。'
    },
    'pdf-to-jpg': {
      name: 'PDF から JPG 変換',
      desc: 'PDFページを共有しやすい軽量なJPEG写真に変換します。'
    },
    'png-to-svg': {
      name: 'PNG から SVG ベクター化',
      desc: 'ロゴやイラストをトレースし、拡大しても綺麗なSVGパスを生成します。'
    },
    'webp-to-png': {
      name: 'WebP から PNG 変換',
      desc: 'WebP画像を互換性の高いPNG形式へ変換します。'
    },
    'jpg-to-webp': {
      name: 'JPG から WebP 変換',
      desc: 'WEBサイトの表示速度向上のためJPEGをWebPに変換します。'
    },
    'image-resize': {
      name: '画像リサイズ・寸法変更',
      desc: '縦横比を固定したまま指定ピクセル数に拡大縮小します。'
    },
    'image-crop': {
      name: '画像トリミング・切り抜き',
      desc: '16:9、1:1、4:3など主要な比率で画像をトリミングします。'
    },
    'image-grayscale': {
      name: 'グレースケール・白黒フィルター',
      desc: '印刷インクを節約し、落ち着いたモノクロ写真に変換します。'
    },
    'image-rotate': {
      name: '画像回転・反転ツール',
      desc: 'スマホ写真の向きを90度回転したり左右反転します。'
    },
    'image-to-bmp': {
      name: '画像から BMP 変換',
      desc: 'マイコンや電子ペーパー表示用の非圧縮BMPを生成します。'
    }
  },
  zh: {
    'pdf-to-png': {
      name: 'PDF 转 PNG 转换器',
      desc: '将 PDF 页面转换为支持自定义 DPI 和透明背景的超高清无损 PNG 图片。'
    },
    'pdf-to-svg': {
      name: 'PDF 转 SVG 矢量转换器',
      desc: '将 PDF 设计稿和工程图纸转换为可无限缩放不模糊的 SVG 矢量图形。'
    },
    'png-to-webp': {
      name: 'PNG 转 WebP 转换器',
      desc: '在完美保留透明通道的同时，将重体积 PNG 压缩高达 70%。'
    },
    'jpg-to-png': {
      name: 'JPG 转 PNG 转换器',
      desc: '将有损压缩的 JPG/JPEG 转为无损 PNG 格式，便于多次编辑。'
    },
    'svg-to-png': {
      name: 'SVG 转 PNG 转换器',
      desc: '将 SVG 矢量代码栅格化为高达 8K 分辨率的高清透明 PNG。'
    },
    'png-to-ico': {
      name: 'PNG 转 ICO 网站图标生成器',
      desc: '一键生成包含 16px 至 256px 多尺寸的 Windows 和 Web Favicon 图标。'
    },
    'image-to-pdf': {
      name: '多张图片合并转 PDF',
      desc: '将多张 JPG、PNG、WebP 图片按顺序整合成一份排版精美的 PDF 文档。'
    },
    'image-compress': {
      name: '智能图片压缩工具',
      desc: '在保持肉眼高清晰度的前提下，将图片体积减少高达 85%。'
    },
    'image-matrix-art': {
      name: '黑客帝国代码雨与 ASCII 艺术生成器',
      desc: '将头像或任意照片转换成电影质感的绿色荧光字符流与 ASCII 艺术画。'
    },
    'pdf-to-jpg': {
      name: 'PDF 转 JPG 转换器',
      desc: '将 PDF 各页转换为兼容性最好的轻量化 JPEG 照片。'
    },
    'png-to-svg': {
      name: 'PNG 转 SVG 矢量描摹',
      desc: '将位图 Logo 和简笔画智能提取为无限放大的 SVG 矢量路径。'
    },
    'webp-to-png': {
      name: 'WebP 转 PNG 转换器',
      desc: '将 WebP 图片转换回通用 PNG 格式，保留透明图层。'
    },
    'jpg-to-webp': {
      name: 'JPG 转 WebP 转换器',
      desc: '将大图转换为体积更小的 WebP 格式，大幅提升网页加载速度。'
    },
    'image-resize': {
      name: '图片尺寸调整与缩放',
      desc: '按精确像素或百分比缩放图片，支持锁定宽高比。'
    },
    'image-crop': {
      name: '图片裁剪工具',
      desc: '预设 16:9、1:1、4:3 等常用比例，轻松裁去边缘多余部分。'
    },
    'image-grayscale': {
      name: '黑白与灰度滤镜',
      desc: '将彩色图像转为黑白灰度，节省打印耗材。'
    },
    'image-rotate': {
      name: '图片顺时针旋转与水平翻转',
      desc: '轻松修正手机拍摄横竖颠倒的照片，90度旋转零失真。'
    },
    'image-to-bmp': {
      name: '图片转 BMP 格式',
      desc: '生成适用于单片机与墨水屏硬件的无压缩 BMP 位图。'
    }
  },
  ar: {
    'pdf-to-png': {
      name: 'محول PDF إلى PNG عالي الدقة',
      desc: 'تحويل صفحات PDF إلى صور PNG عالية الدقة بخلفية شفافة ودقة DPI مخصصة.'
    },
    'pdf-to-svg': {
      name: 'محول PDF إلى SVG المتجهي',
      desc: 'تحويل المستندات والرسوم الهندسية إلى رسومات متجهة قابلة للتكبير اللانهائي.'
    },
    'png-to-webp': {
      name: 'محول PNG إلى WebP',
      desc: 'تقليل حجم الصور بنسبة تصل إلى 70% مع الحفاظ على شفافية الخلفية.'
    },
    'jpg-to-png': {
      name: 'محول JPG إلى PNG',
      desc: 'تحويل صور JPG إلى صيغة PNG بدون فقدان للجودة مع دعم الشفافية.'
    },
    'svg-to-png': {
      name: 'محول SVG إلى PNG',
      desc: 'تحويل الرسوم المتجهة إلى صور PNG فائقة الوضوح حتى دقة 8K.'
    },
    'png-to-ico': {
      name: 'مولد أيقونات PNG إلى ICO',
      desc: 'إنشاء أيقونات Favicon بمقاسات متعددة (من 16 إلى 256 بكسل) لنظام ويندوز والمواقع.'
    },
    'image-to-pdf': {
      name: 'دمج الصور في مستند PDF',
      desc: 'دمج عدة صور JPG وPNG وWebP في ملف PDF منظم وجاهز للطباعة.'
    },
    'image-compress': {
      name: 'ضغط الصور الذكي',
      desc: 'تقليص حجم الصور بنسبة تصل إلى 85% مع الحفاظ على نقاء التفاصيل.'
    },
    'image-matrix-art': {
      name: 'مولد فن الماتريكس و ASCII',
      desc: 'تحويل أي صورة إلى شلال شفرات الماتريكس الخضراء المتوهجة وأحرف ASCII.'
    },
    'pdf-to-jpg': {
      name: 'محول PDF إلى JPG',
      desc: 'تحويل صفحات PDF إلى صور JPEG خفيفة وسهلة المشاركة.'
    },
    'png-to-svg': {
      name: 'تحويل PNG إلى مسارات SVG',
      desc: 'تحويل الشعارات والرسومات إلى مسارات متجهة لا تفقد وضوحها.'
    },
    'webp-to-png': {
      name: 'محول WebP إلى PNG',
      desc: 'تحويل صور WebP إلى PNG واسع التوافق مع الحفاظ على الشفافية.'
    },
    'jpg-to-webp': {
      name: 'محول JPG إلى WebP',
      desc: 'تسريع تحميل المواقع بتحويل صور JPEG إلى صيغة WebP فائقة الكفاءة.'
    },
    'image-resize': {
      name: 'تغيير أبعاد وحجم الصور',
      desc: 'تكبير وتصغير الصور بدقة بكسل محددة مع قفل نسبة العرض للارتفاع.'
    },
    'image-crop': {
      name: 'قص وتشذيب الصور',
      desc: 'قص الحواف والتركيز على أبعاد محددة مثل 1:1 و 16:9.'
    },
    'image-grayscale': {
      name: 'فلتر أبيض وأسود / تدرج الرمادي',
      desc: 'إزالة الألوان لتوفير حبر الطباعة وإعطاء مظهر كلاسيكي.'
    },
    'image-rotate': {
      name: 'تدوير وعكس الصور',
      desc: 'تدوير الصور المقلوبة 90 أو 180 درجة بدون فقدان الدقة.'
    },
    'image-to-bmp': {
      name: 'محول الصور إلى BMP',
      desc: 'توليد ملفات BMP غير مضغوطة مناسبة للوحات الإلكترونية والشاشات.'
    }
  }
};

export function getTranslation(lang: string, key: string): string {
  const translations = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'];
  return translations[key] || UI_TRANSLATIONS['en'][key] || key;
}

export function getLocalizedTool(
  tool: { id: string; name: string; shortDescription: string },
  lang: string
): { name: string; shortDescription: string } {
  if (lang === 'en') return { name: tool.name, shortDescription: tool.shortDescription };
  const langData = TOOL_TRANSLATIONS[lang];
  if (langData && langData[tool.id]) {
    return {
      name: langData[tool.id].name,
      shortDescription: langData[tool.id].desc
    };
  }
  return { name: tool.name, shortDescription: tool.shortDescription };
}
