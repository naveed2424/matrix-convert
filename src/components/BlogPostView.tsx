import React, { useEffect, useState } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../data/blogData';
import { generateSocialDistributionPack } from '../data/editorialFramework';
import { getBlogTranslation, getLocalizedBlogCategory } from '../data/blogI18n';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  X,
  Copy,
  Check
} from 'lucide-react';

interface BlogPostViewProps {
  post: BlogPost;
  allPosts: BlogPost[];
  currentLang?: string;
  onBackToBlog: () => void;
  onSelectPost: (slug: string) => void;
  onSelectTool: (slug: string) => void;
  onNavigatePath: (path: string) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post,
  allPosts,
  currentLang = 'en',
  onBackToBlog,
  onSelectPost,
  onSelectTool,
  onNavigatePath
}) => {
  const [showDistributionModal, setShowDistributionModal] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sharedToast, setSharedToast] = useState(false);

  const tb = (key: Parameters<typeof getBlogTranslation>[1]) => getBlogTranslation(currentLang, key);
  const categoryInfo = BLOG_CATEGORIES.find((c) => c.key === post.category) || BLOG_CATEGORIES[0];
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const distributionPack = generateSocialDistributionPack(post);

  useEffect(() => {
    const blogScriptId = 'blog-schema-jsonld';
    const faqScriptId = 'blog-faq-schema-jsonld';
    const articleUrl = `https://mimage.netlify.app/blog/${post.slug}`;
    const toolUrl = `https://mimage.netlify.app${post.ctaLink || '/'}`;

    let blogScriptEl = document.getElementById(blogScriptId) as HTMLScriptElement | null;
    if (!blogScriptEl) {
      blogScriptEl = document.createElement('script');
      blogScriptEl.id = blogScriptId;
      blogScriptEl.type = 'application/ld+json';
      document.head.appendChild(blogScriptEl);
    }

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${articleUrl}#article`,
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mimage.netlify.app/#website',
        name: 'Mimage',
        url: 'https://mimage.netlify.app/'
      },
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.publishedDate,
      dateModified: post.publishedDate,
      mainEntityOfPage: articleUrl,
      image: [post.heroImage.url, ...post.inContentImages.map((img) => img.url)],
      author: {
        '@type': 'Person',
        name: post.author.name,
        jobTitle: post.author.role,
        url: 'https://mimage.netlify.app/portfolio'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Mimage',
        url: 'https://mimage.netlify.app/'
      },
      about: {
        '@type': 'SoftwareApplication',
        name: post.ctaText,
        url: toolUrl,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All'
      },
      keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(', ')
    };
    blogScriptEl.textContent = JSON.stringify(articleSchema);

    // Standalone FAQPage JSON-LD script for reliable search engine Rich Results parsing
    const existingFaqEl = document.getElementById(faqScriptId) as HTMLScriptElement | null;
    if (post.faq && post.faq.length > 0) {
      const faqScriptEl = existingFaqEl || document.createElement('script');
      faqScriptEl.id = faqScriptId;
      faqScriptEl.type = 'application/ld+json';
      if (!existingFaqEl) {
        document.head.appendChild(faqScriptEl);
      }
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${articleUrl}#faq`,
        url: articleUrl,
        name: `${post.title} — Frequently Asked Questions`,
        mainEntity: post.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      };
      faqScriptEl.textContent = JSON.stringify(faqSchema);
    } else if (existingFaqEl) {
      existingFaqEl.remove();
    }

    // Dynamic page SEO & social meta sync
    const prevTitle = document.title;
    document.title = post.metaTitle || `${post.title} | Mimage`;

    const metaUpdates: Array<{ selector: string; attr: 'content' | 'href'; value: string; prev: string | null }> = [];
    const syncHeadTag = (selector: string, attr: 'content' | 'href', value: string) => {
      const el = document.head.querySelector(selector);
      if (el) {
        metaUpdates.push({ selector, attr, value, prev: el.getAttribute(attr) });
        el.setAttribute(attr, value);
      }
    };

    syncHeadTag('meta[name="description"]', 'content', post.metaDescription);
    syncHeadTag('meta[property="og:title"]', 'content', post.metaTitle || post.title);
    syncHeadTag('meta[property="og:description"]', 'content', post.metaDescription);
    syncHeadTag('meta[property="og:url"]', 'content', articleUrl);
    syncHeadTag('meta[name="twitter:title"]', 'content', post.metaTitle || post.title);
    syncHeadTag('meta[name="twitter:description"]', 'content', post.metaDescription);
    syncHeadTag('link[rel="canonical"]', 'href', articleUrl);

    return () => {
      const elBlog = document.getElementById(blogScriptId);
      if (elBlog) elBlog.remove();
      const elFaq = document.getElementById(faqScriptId);
      if (elFaq) elFaq.remove();
      document.title = prevTitle;
      metaUpdates.forEach(({ selector, attr, prev }) => {
        const el = document.head.querySelector(selector);
        if (el && prev !== null) {
          el.setAttribute(attr, prev);
        }
      });
    };
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.metaDescription,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-800 dark:text-slate-200">
      {/* Breadcrumb */}
      <nav className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBackToBlog}
          className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer notranslate"
          translate="no"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{tb('backToAllGuides')}</span>
        </button>

        <div className="flex items-center gap-2">
          {sharedToast && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold notranslate" translate="no">
              {tb('linkCopied')}
            </span>
          )}
          <button
            onClick={() => setShowDistributionModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-400 cursor-pointer text-xs font-mono flex items-center gap-1.5 notranslate"
            translate="no"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span className="hidden sm:inline">{tb('shareSnippetPack')}</span>
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 cursor-pointer"
            aria-label="Copy article link"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Meta Line */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono text-slate-500 dark:text-slate-400">
        <span className="text-blue-600 dark:text-sky-400 font-bold notranslate" translate="no">
          {getLocalizedBlogCategory(categoryInfo.key, currentLang)}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{post.publishedDate}</span>
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{post.readTime}</span>
        </span>
      </div>

      {/* H1 */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      {/* Author Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-8">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          referrerPolicy="no-referrer"
          className="w-12 h-12 rounded-full object-cover object-top border border-slate-200 dark:border-slate-700 shrink-0"
        />
        <div className="text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-sm">{post.author.name}</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <button
              onClick={() => onNavigatePath('/portfolio')}
              className="text-blue-600 dark:text-sky-400 hover:underline font-mono text-[11px] font-semibold cursor-pointer notranslate"
              translate="no"
            >
              {tb('founderPortfolio')}
            </button>
          </div>
          <div className="text-blue-600 dark:text-sky-400 font-mono text-[11px] mb-1">{post.author.role}</div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{post.author.bio}</p>
        </div>
      </div>

      {/* Hero Figure */}
      <figure className="mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <img
          src={post.heroImage.url}
          alt={post.heroImage.alt}
          referrerPolicy="no-referrer"
          className="w-full h-72 sm:h-96 object-cover"
        />
        <figcaption className="p-3 text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          {post.heroImage.caption}
        </figcaption>
      </figure>

      {/* Takeaways */}
      <div className="p-6 rounded-2xl border border-blue-200 dark:border-slate-800 bg-blue-50/60 dark:bg-slate-900 mb-10">
        <div className="flex items-center gap-2 text-blue-700 dark:text-sky-400 font-mono text-xs font-bold uppercase tracking-wider mb-3 notranslate" translate="no">
          <ShieldCheck className="w-4 h-4" />
          <span>{tb('keyTakeaways')}</span>
        </div>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {post.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Article Body with SPA link interception for /tool/ and /blog/ internal routes */}
      <div
        onClick={(e) => {
          const anchor = (e.target as HTMLElement).closest('a');
          if (!anchor) return;
          const rawHref = anchor.getAttribute('href') || '';
          if (rawHref.startsWith('/tool/')) {
            e.preventDefault();
            onSelectTool(rawHref.slice(6));
          } else if (rawHref.startsWith('/blog/')) {
            e.preventDefault();
            onSelectPost(rawHref.slice(6));
          } else if (rawHref.startsWith('/') && !rawHref.startsWith('//')) {
            e.preventDefault();
            onNavigatePath(rawHref);
          }
        }}
        className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-6 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:pt-6 [&>h2]:border-t [&>h2]:border-slate-200 dark:[&>h2]:border-slate-800 [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:font-bold [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-emerald-300"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* In-Content Illustrations */}
      {post.inContentImages.length > 0 && (
        <div className="my-12 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 notranslate" translate="no">
            {tb('workflowIllustrations')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {post.inContentImages.map((img, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <img src={img.url} alt={img.alt} referrerPolicy="no-referrer" className="w-full h-44 object-cover" />
                <div className="p-3 text-xs space-y-1">
                  <div className="font-mono text-[11px] text-blue-600 dark:text-sky-400 font-bold">
                    <span className="notranslate" translate="no">{tb('figureLabel')}</span> {idx + 2} · {img.placement}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Mimage Tools */}
      <div className="my-10 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 mb-4 notranslate" translate="no">
          {tb('relatedMimageTools')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {post.internalLinks.map((link, idx) => {
            const cleanUrl = link.url.replace(/^#/, '');
            return (
              <a
                key={idx}
                href={cleanUrl}
                onClick={(e) => {
                  e.preventDefault();
                  if (cleanUrl.startsWith('/tool/')) {
                    onSelectTool(cleanUrl.replace('/tool/', ''));
                  } else if (cleanUrl.startsWith('/blog/')) {
                    onSelectPost(cleanUrl.replace('/blog/', ''));
                  } else {
                    onNavigatePath(cleanUrl);
                  }
                }}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-400 transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 block mb-1">
                    {link.anchor}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{link.description}</p>
                </div>
                <span className="text-[11px] font-mono text-blue-600 dark:text-sky-400 mt-2 inline-flex items-center gap-1 notranslate" translate="no">
                  <span>{tb('open')}</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 notranslate" translate="no">
          <span>{tb('sitePages')}</span>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigatePath('/privacy-center')} className="hover:text-blue-600 underline cursor-pointer">
              {tb('privacyCenter')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigatePath('/about')} className="hover:text-blue-600 underline cursor-pointer">
              {tb('aboutMimage')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigatePath('/terms')} className="hover:text-blue-600 underline cursor-pointer">
              {tb('terms')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigatePath('/privacy')} className="hover:text-blue-600 underline cursor-pointer">
              {tb('privacyPolicy')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigatePath('/portfolio')} className="hover:text-blue-600 underline cursor-pointer">
              {tb('founderPortfolio')}
            </button>
            <span>·</span>
            <button onClick={() => onNavigatePath('/contact')} className="hover:text-blue-600 underline cursor-pointer">
              {tb('contact')}
            </button>
          </div>
        </div>
      </div>

      {/* Cite & Reference (Ready Backlink Snippets) */}
      <div className="my-10 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 notranslate" translate="no">
          <h4 className="text-slate-500 font-mono font-bold uppercase text-[11px]">
            {tb('citeGuide')}
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {tb('canonicalSnippets')}
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed notranslate" translate="no">
          {tb('citeSubtitle')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 font-mono notranslate" translate="no">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">HTML Guide + Tool</span>
              <button
                onClick={() => {
                  const html = `<a href="https://mimage.netlify.app/blog/${post.slug}">${post.title}</a> — powered by <a href="https://mimage.netlify.app${post.ctaLink || '/'}">${post.ctaText}</a>`;
                  navigator.clipboard.writeText(html);
                  setCopiedKey('html-backlink');
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="text-[11px] text-blue-600 dark:text-sky-400 inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                {copiedKey === 'html-backlink' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'html-backlink' ? tb('copied') : `${tb('copy')} HTML`}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 break-all line-clamp-2">
              &lt;a href=&quot;https://mimage.netlify.app/blog/{post.slug}&quot;&gt;{post.primaryKeyword}&lt;/a&gt;
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Markdown</span>
              <button
                onClick={() => {
                  const md = `[${post.title}](https://mimage.netlify.app/blog/${post.slug}) ([Launch Tool](https://mimage.netlify.app${post.ctaLink || '/'}))`;
                  navigator.clipboard.writeText(md);
                  setCopiedKey('md-backlink');
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="text-[11px] text-blue-600 dark:text-sky-400 inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                {copiedKey === 'md-backlink' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'md-backlink' ? tb('copied') : `${tb('copy')} MD`}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 break-all line-clamp-2">
              [{post.primaryKeyword}](https://mimage.netlify.app/blog/{post.slug})
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tool Anchor</span>
              <button
                onClick={() => {
                  const toolAnchor = `<a href="https://mimage.netlify.app${post.ctaLink || '/'}">${post.primaryKeyword} — Free Browser Tool on Mimage</a>`;
                  navigator.clipboard.writeText(toolAnchor);
                  setCopiedKey('tool-backlink');
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="text-[11px] text-blue-600 dark:text-sky-400 inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                {copiedKey === 'tool-backlink' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'tool-backlink' ? tb('copied') : tb('copy')}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 break-all line-clamp-2">
              &lt;a href=&quot;https://mimage.netlify.app{post.ctaLink || '/'}&quot;&gt;{post.primaryKeyword}&lt;/a&gt;
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      {post.externalSources.length > 0 && (
        <div className="my-10 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
          <h4 className="text-slate-500 font-bold uppercase mb-3 text-[11px] notranslate" translate="no">
            {tb('referencesSpecs')}
          </h4>
          <ul className="space-y-2">
            {post.externalSources.map((source, idx) => (
              <li key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-sky-400 underline"
                >
                  <span>{source.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-slate-400 hidden sm:inline">{source.authority}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ */}
      <div className="my-12">
        <div className="flex items-center gap-2 mb-5 notranslate" translate="no">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-sky-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tb('faqTitle')}</h3>
        </div>

        <div className="space-y-3">
          {post.faq.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>{item.question}</span>
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-sky-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="my-12 p-8 rounded-2xl border border-blue-200 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900 text-center space-y-3">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{post.ctaText}</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto notranslate" translate="no">
          {tb('ctaSub')}
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigatePath(post.ctaLink || '/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer notranslate"
            translate="no"
          >
            <span>{tb('openToolWorkspace')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Related Articles */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5 notranslate" translate="no">
          {tb('moreGuides')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {relatedPosts.map((related) => (
            <button
              key={related.id}
              onClick={() => onSelectPost(related.slug)}
              className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-blue-400 transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-blue-600 dark:text-sky-400 uppercase font-bold block mb-1 notranslate" translate="no">
                  {getLocalizedBlogCategory(related.category, currentLang)}
                </span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 line-clamp-2">
                  {related.title}
                </h5>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-4 block">{related.readTime}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Share Snippets Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto text-slate-800 dark:text-slate-200 shadow-2xl">
            <button
              onClick={() => setShowDistributionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white notranslate" translate="no">
                {tb('shareableSnippets')}
              </h3>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between notranslate" translate="no">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{tb('pinterestSummary')}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${distributionPack.pinterest.title}\n\n${distributionPack.pinterest.description}`);
                      setCopiedKey('pin');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="text-xs font-mono text-blue-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'pin' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pin' ? tb('copied') : tb('copy')}</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{distributionPack.pinterest.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{distributionPack.pinterest.description}</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between notranslate" translate="no">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{tb('newsletterExcerpt')}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${distributionPack.newsletter.subject}\n\n${distributionPack.newsletter.blurb}`);
                      setCopiedKey('newsletter');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="text-xs font-mono text-blue-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'newsletter' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'newsletter' ? tb('copied') : tb('copy')}</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{distributionPack.newsletter.subject}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{distributionPack.newsletter.blurb}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDistributionModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-semibold cursor-pointer notranslate"
                  translate="no"
                >
                  {tb('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
