import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = rgb(15 / 255, 23 / 255, 42 / 255); // Slate 900
  const emeraldColor = rgb(5 / 255, 150 / 255, 105 / 255); // Emerald 600
  const cyanColor = rgb(14 / 255, 116 / 255, 144 / 255); // Cyan 700
  const grayText = rgb(71 / 255, 85 / 255, 105 / 255); // Slate 600
  const lightBg = rgb(248 / 255, 250 / 255, 252 / 255); // Slate 50
  const borderCol = rgb(226 / 255, 232 / 255, 240 / 255); // Slate 200

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function checkPageBreak(requiredSpace = 40) {
    if (y - requiredSpace < margin) {
      drawFooter(currentPage);
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      drawHeader(currentPage);
    }
  }

  function drawHeader(page) {
    page.drawRectangle({
      x: margin,
      y: pageHeight - 32,
      width: contentWidth,
      height: 1,
      color: borderCol,
    });
    page.drawText('MatrixConvert | LinkedIn Authority Article & Viral Campaign', {
      x: margin,
      y: pageHeight - 26,
      size: 8,
      font: fontRegular,
      color: grayText,
    });
    page.drawText('https://mimage.netlify.app', {
      x: pageWidth - margin - 120,
      y: pageHeight - 26,
      size: 8,
      font: fontBold,
      color: emeraldColor,
    });
  }

  function drawFooter(page) {
    page.drawRectangle({
      x: margin,
      y: margin - 10,
      width: contentWidth,
      height: 1,
      color: borderCol,
    });
    page.drawText('Author: Naveed Afzal (20+ Years Exp) | Email: Afzal460@gmail.com', {
      x: margin,
      y: margin - 22,
      size: 8,
      font: fontRegular,
      color: grayText,
    });
    page.drawText('100% Client-Side Privacy Guaranteed', {
      x: pageWidth - margin - 150,
      y: margin - 22,
      size: 8,
      font: fontBold,
      color: emeraldColor,
    });
  }

  function drawWrappedText(text, size, font, color, lineSpacing = 14) {
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width < contentWidth) {
        currentLine = testLine;
      } else {
        checkPageBreak(lineSpacing);
        currentPage.drawText(currentLine, { x: margin, y, size, font, color });
        y -= lineSpacing;
        currentLine = word;
      }
    }
    if (currentLine.length > 0) {
      checkPageBreak(lineSpacing);
      currentPage.drawText(currentLine, { x: margin, y, size, font, color });
      y -= lineSpacing;
    }
  }

  // --- PAGE 1: HERO HEADER ---
  currentPage.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 60,
    color: lightBg,
    borderColor: borderCol,
    borderWidth: 1,
  });

  currentPage.drawText('EXCLUSIVE LINKEDIN THOUGHT LEADERSHIP ARTICLE', {
    x: margin + 14,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: emeraldColor,
  });

  currentPage.drawText('High-Impact Post & In-Depth Article Ready for LinkedIn Publishing', {
    x: margin + 14,
    y: y - 36,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });

  y -= 75;

  // Title
  currentPage.drawText('Stop Uploading Confidential Files to Random Converters:', {
    x: margin,
    y,
    size: 15,
    font: fontBold,
    color: primaryColor,
  });
  y -= 20;

  currentPage.drawText('How Zero-Knowledge WebAssembly is Disrupting Digital Document Processing', {
    x: margin,
    y,
    size: 13,
    font: fontBold,
    color: cyanColor,
  });
  y -= 25;

  // Meta block
  currentPage.drawText('Author: Naveed Afzal (Web Architect & SEO Specialist, 20+ Yrs Exp)', {
    x: margin,
    y,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });
  y -= 14;
  currentPage.drawText('Target Platform: LinkedIn Articles / Newsletter | Live Platform: https://mimage.netlify.app/', {
    x: margin,
    y,
    size: 9,
    font: fontRegular,
    color: emeraldColor,
  });
  y -= 20;

  // Divider
  currentPage.drawRectangle({ x: margin, y, width: contentWidth, height: 1, color: borderCol });
  y -= 15;

  // Section 1: The Hook
  currentPage.drawText('1. The Billion-Dollar Blind Spot: Why Cloud File Converters Are a Security Nightmare', {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });
  y -= 16;

  drawWrappedText(
    'Every day, millions of executives, recruiters, healthcare professionals, and government applicants perform an innocent-looking routine: converting a confidential resume, an ID scan, or an intellectual property blueprint using free online tools.',
    9.5,
    fontRegular,
    primaryColor,
    14
  );
  y -= 6;
  drawWrappedText(
    'What most users fail to realize is that traditional online converters upload their sensitive data to remote cloud servers, storing documents on third-party buckets where data retention policies are opaque and breaches are rampant.',
    9.5,
    fontRegular,
    primaryColor,
    14
  );

  y -= 15;

  // Section 2: The Solution
  currentPage.drawText('2. The Architectural Paradigm Shift: Zero-Server WebAssembly & In-Browser Processing', {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });
  y -= 16;

  drawWrappedText(
    'As an engineer with two decades in software architecture, I built MatrixConvert (https://mimage.netlify.app/) to solve this exact vulnerability. Modern browsers now possess multi-threaded SIMD WebAssembly capabilities and HTML5 Canvas pipelines capable of crunching megabytes in milliseconds.',
    9.5,
    fontRegular,
    primaryColor,
    14
  );
  y -= 6;
  drawWrappedText(
    'Key Architectural Advantages:',
    9.5,
    fontBold,
    primaryColor,
    14
  );
  y -= 2;

  const points = [
    '[+] 100% Client-Side Execution: Zero bytes leave the client machine. Zero server uploads, zero tracking.',
    '[+] Megabytes to Kilobytes in Seconds: Advanced lossy/lossless WebP, AVIF, and JPEG compression algorithms.',
    '[+] Government Portal Compliance: Easily downscale files below 100KB/500KB limits for ANTS, campus, or visa portals.',
    '[+] Instant Multi-Format Conversion: Seamlessly convert between PDF, PNG, JPG, WebP, SVG, and TIFF in one click.',
    '[+] Unlimited & Free Forever: No credit cards, no login walls, and no throttled quotas.'
  ];

  for (const pt of points) {
    checkPageBreak(16);
    currentPage.drawText(pt, { x: margin + 10, y, size: 8.5, font: fontRegular, color: primaryColor });
    y -= 14;
  }

  y -= 15;

  // Section 3: Industry Use Cases
  currentPage.drawText('3. Real-World Benchmarks & Practical Workflow Applications', {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });
  y -= 16;

  drawWrappedText(
    '- Web Developers & E-Commerce Owners: Reduce Next-Gen image payloads by up to 88% using AVIF/WebP, spiking Google Core Web Vitals (LCP < 1.2s) and organic rankings.',
    9,
    fontRegular,
    primaryColor,
    13
  );
  y -= 4;
  drawWrappedText(
    '- HR Leaders & Job Seekers: Convert high-resolution 15MB Canva/Figma exports into crisp, compliant 200KB PDF resumes without pixelation.',
    9,
    fontRegular,
    primaryColor,
    13
  );
  y -= 4;
  drawWrappedText(
    '- Legal & Corporate Teams: Merge NDAs, split multi-page scanned contracts, and convert records with total regulatory peace of mind (GDPR, HIPAA & CCPA compliant by design).',
    9,
    fontRegular,
    primaryColor,
    13
  );

  y -= 15;

  // Section 4: Call to action with live link
  checkPageBreak(80);
  currentPage.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 60,
    color: rgb(236 / 255, 253 / 255, 245 / 255),
    borderColor: emeraldColor,
    borderWidth: 1,
  });

  currentPage.drawText('EXPERIENCE THE FUTURE OF PRIVATE DOCUMENT TOOLS', {
    x: margin + 14,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: emeraldColor,
  });
  currentPage.drawText('Test MatrixConvert live now: https://mimage.netlify.app/', {
    x: margin + 14,
    y: y - 34,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });
  currentPage.drawText('Free, instant, client-side image compression, conversion, and PDF management.', {
    x: margin + 14,
    y: y - 48,
    size: 8.5,
    font: fontRegular,
    color: grayText,
  });

  y -= 75;

  // --- PAGE BREAK FOR PART 2: VIRAL SHORT-FORM LINKEDIN POST ---
  checkPageBreak(250);

  currentPage.drawText('PART 2: READY-TO-PUBLISH VIRAL LINKEDIN FEED POST', {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: cyanColor,
  });
  y -= 16;
  currentPage.drawText('Copy, paste, and publish directly to your personal LinkedIn profile feed:', {
    x: margin,
    y,
    size: 9,
    font: fontOblique,
    color: grayText,
  });
  y -= 18;

  // Box for copy-paste
  const postBoxY = y;
  const postLines = [
    'Most people don\'t realize this:',
    '',
    'When you use typical "free online image and PDF converters", you are uploading your confidential files to a stranger\'s server.',
    '',
    'Your resumes. Your tax slips. Your passport scans. Your client pitch decks.',
    '',
    'Why take that risk when modern browsers can do 100% of the work right on your machine?',
    '',
    'Over the past months, I engineered MatrixConvert (https://mimage.netlify.app/) - a next-gen web app powered entirely by client-side WebAssembly.',
    '',
    'What it does in 1 click:',
    '-> Compress MBs to KBs (perfect for restrictive job and visa portals)',
    '-> Convert between PNG, JPG, WebP, AVIF, PDF, and SVG',
    '-> Merge and split multi-page PDF documents',
    '-> 0% cloud storage. 100% privacy. Nothing ever touches an external server.',
    '',
    'Give it a test drive here: https://mimage.netlify.app/',
    '',
    'Curious: what tool do you currently use when a website rejects your file for being "too big"? Let me know in the comments!',
    '',
    '#WebDevelopment #Privacy #CyberSecurity #TechInnovation #SaaS #Productivity #OpenSource'
  ];

  for (const line of postLines) {
    checkPageBreak(14);
    if (line.startsWith('->') || line.startsWith('Curious') || line.startsWith('Give it')) {
      currentPage.drawText(line, { x: margin + 12, y, size: 8.5, font: fontBold, color: primaryColor });
    } else if (line.startsWith('#')) {
      currentPage.drawText(line, { x: margin + 12, y, size: 8, font: fontBold, color: cyanColor });
    } else {
      currentPage.drawText(line, { x: margin + 12, y, size: 8.5, font: fontRegular, color: primaryColor });
    }
    y -= 12.5;
  }

  y -= 20;

  // --- PART 3: AUTHOR BIO & FOOTER ---
  checkPageBreak(120);
  currentPage.drawRectangle({
    x: margin,
    y: y - 80,
    width: contentWidth,
    height: 80,
    color: lightBg,
    borderColor: borderCol,
    borderWidth: 1,
  });

  currentPage.drawText('ABOUT THE CREATOR: NAVEED AFZAL', {
    x: margin + 14,
    y: y - 18,
    size: 9.5,
    font: fontBold,
    color: primaryColor,
  });
  currentPage.drawText('Web Developer | WordPress Expert | SEO Architect | Mindful Practitioner', {
    x: margin + 14,
    y: y - 32,
    size: 8.5,
    font: fontBold,
    color: emeraldColor,
  });
  currentPage.drawText('20+ years building high-traffic platforms (Codra, Webdia), Sejda.store, FreeQRcode.fr, CVGratuit.shop, and MatrixConvert.', {
    x: margin + 14,
    y: y - 46,
    size: 8,
    font: fontRegular,
    color: grayText,
  });
  currentPage.drawText('Portfolio & Connect: Afzal460@gmail.com | Website: https://mimage.netlify.app/', {
    x: margin + 14,
    y: y - 62,
    size: 8,
    font: fontBold,
    color: cyanColor,
  });

  drawFooter(currentPage);

  // Ensure first page also has footer
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(`Page ${i + 1} of ${pages.length}`, {
      x: pageWidth / 2 - 25,
      y: margin - 22,
      size: 8,
      font: fontRegular,
      color: grayText,
    });
  }

  const pdfBytes = await pdfDoc.save();

  const outDir = path.resolve('public/downloads');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const filePath = path.join(outDir, 'LinkedIn_Article_MatrixConvert_Naveed_Afzal.pdf');
  fs.writeFileSync(filePath, pdfBytes);
  console.log(`PDF successfully created at: ${filePath} (${pdfBytes.length} bytes)`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
