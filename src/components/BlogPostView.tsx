import React, { useEffect } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../data/blogData';
import { Calendar, Clock, ArrowLeft, Share2, CheckCircle2, ChevronRight, HelpCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface BlogPostViewProps {
  post: BlogPost;
  allPosts: BlogPost[];
  onBackToBlog: () => void;
  onSelectPost: (slug: string) => void;
  onSelectTool: (slug: string) => void;
  onOpenStudio: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post,
  allPosts,
  onBackToBlog,
  onSelectPost,
  onSelectTool,
  onOpenStudio
}) => {
  const categoryInfo = BLOG_CATEGORIES.find((c) => c.key === post.category) || BLOG_CATEGORIES[0];
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Inject dynamic JSON-LD structured data for BlogPosting and FAQPage for Google SEO & rich snippets
  useEffect(() => {
    const scriptId = 'blog-schema-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `https://mimage.netlify.app/#/blog/${post.slug}#article`,
          isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://mimage.netlify.app/#website',
            name: 'MatrixConvert',
            url: 'https://mimage.netlify.app/'
          },
          headline: post.title,
          description: post.metaDescription,
          datePublished: post.publishedDate,
          dateModified: post.publishedDate,
          mainEntityOfPage: `https://mimage.netlify.app/#/blog/${post.slug}`,
          image: [post.heroImage.url, ...post.inContentImages.map((img) => img.url)],
          author: {
            '@type': 'Person',
            name: post.author.name,
            jobTitle: post.author.role
          },
          publisher: {
            '@type': 'Organization',
            name: 'MatrixConvert',
            url: 'https://mimage.netlify.app/',
            logo: {
              '@type': 'ImageObject',
              url: 'https://mimage.netlify.app/assets/icon.png'
            }
          },
          keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(', ')
        },
        {
          '@type': 'FAQPage',
          '@id': `https://mimage.netlify.app/#/blog/${post.slug}#faq`,
          mainEntity: post.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.metaDescription,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-200">
      {/* Top Breadcrumb & Navigation */}
      <nav className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6 pb-4 border-b border-sky-400/20">
        <button
          onClick={onBackToBlog}
          className="hover:text-sky-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Articles</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStudio}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-sky-400/40 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Today's Post</span>
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg border border-sky-400/30 bg-[#030908] hover:text-white transition-colors cursor-pointer"
            title="Share Article"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Category Pill & Publication Date */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${categoryInfo.badgeColor}`}>
          {categoryInfo.icon} {categoryInfo.title}
        </span>
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>{post.publishedDate}</span>
        </span>
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{post.readTime}</span>
        </span>
      </div>

      {/* Article H1 Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      {/* Author Card (EEAT Standard) */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-sky-400/20 bg-[#071318]/80 backdrop-blur-md mb-8">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-12 h-12 rounded-full object-cover border border-sky-400/40 shrink-0"
        />
        <div className="text-xs">
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <span>{post.author.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Verified EEAT Author
            </span>
          </div>
          <div className="text-sky-300 font-mono text-[11px] mb-1">{post.author.role}</div>
          <p className="text-slate-400 leading-relaxed text-[11px]">{post.author.bio}</p>
        </div>
      </div>

      {/* Featured Hero Image */}
      <figure className="mb-10 rounded-2xl overflow-hidden border border-sky-400/30 bg-[#030908]">
        <img
          src={post.heroImage.url}
          alt={post.heroImage.alt}
          className="w-full h-72 sm:h-96 object-cover"
        />
        <figcaption className="p-3 text-[11px] font-mono text-slate-400 bg-[#030908] border-t border-sky-400/20 flex items-center justify-between">
          <span>{post.heroImage.caption}</span>
          <span className="text-sky-400 text-[10px]">ALT Tag Verified</span>
        </figcaption>
      </figure>

      {/* Key Takeaways Box */}
      <div className="p-6 rounded-2xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-950/40 to-[#030908] mb-10">
        <div className="flex items-center gap-2 text-sky-300 font-mono text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Executive Summary & Key Takeaways</span>
        </div>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {post.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Formatted Article HTML */}
      <div
        className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-6 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:pt-6 [&>h2]:border-t [&>h2]:border-sky-400/20 [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-sky-200 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* In-Content Images Showcase (4 Images with ALT tags) */}
      <div className="my-12 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-sky-400/20 pb-2">
          High-Fidelity Technical Illustrations (Full ALT Text Transparency)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {post.inContentImages.map((img, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-sky-400/30 bg-[#071318] overflow-hidden"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-44 object-cover"
              />
              <div className="p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-sky-400">
                  <span className="font-bold">Figure {idx + 2}</span>
                  <span>{img.placement}</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">{img.caption}</p>
                <div className="p-2 rounded bg-[#030908] border border-sky-500/20 text-[10px] font-mono text-slate-400">
                  <strong className="text-sky-300">SEO ALT:</strong> {img.alt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Linking Widget (Connecting to MatrixConvert Tools) */}
      <div className="my-10 p-6 rounded-2xl border border-sky-400/30 bg-[#071318]">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-sky-300 mb-4">
          Recommended In-Browser Conversion Tools (Zero Server Upload)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {post.internalLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              onClick={(e) => {
                e.preventDefault();
                const toolSlug = link.url.replace('#/tool/', '');
                onSelectTool(toolSlug);
              }}
              className="p-3.5 rounded-xl border border-sky-400/20 bg-[#030908] hover:border-sky-400 hover:bg-sky-950/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors block mb-1">
                  {link.anchor}
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {link.description}
                </p>
              </div>
              <span className="text-[10px] font-mono text-sky-400 mt-2 inline-flex items-center gap-1">
                <span>Launch Tool</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* External Authoritative Sources */}
      <div className="my-10 p-5 rounded-2xl border border-sky-400/20 bg-[#030908] text-xs font-mono">
        <h4 className="text-slate-400 font-bold uppercase mb-3 text-[11px]">
          Authoritative Citations & Standards Bodies
        </h4>
        <ul className="space-y-2">
          {post.externalSources.map((source, idx) => (
            <li key={idx} className="flex items-center justify-between text-slate-300 hover:text-white">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-sky-300 underline"
              >
                <span>{source.title}</span>
                <ExternalLink className="w-3 h-3 text-sky-400" />
              </a>
              <span className="text-[10px] text-slate-500 hidden sm:inline">{source.authority}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="my-12">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {post.faq.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-sky-400/20 bg-[#071318] p-4 open:border-sky-400/50 open:bg-sky-950/20 transition-all"
            >
              <summary className="font-bold text-sm text-slate-200 cursor-pointer list-none flex items-center justify-between">
                <span>{item.question}</span>
                <ChevronRight className="w-4 h-4 text-sky-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-2 border-t border-sky-400/10">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="my-12 p-8 rounded-2xl border-2 border-sky-400 bg-gradient-to-r from-sky-950 via-[#030908] to-cyan-950 text-center space-y-4 shadow-2xl">
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/40">
          Try 100% Free • No Signup Required
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          {post.ctaText}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Zero bytes uploaded to remote cloud servers. Convert PDFs, SVGs, PNGs, and WebP images directly in your local browser sandbox at maximum hardware speeds.
        </p>
        <div className="pt-2">
          <a
            href="https://mimage.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-mono text-sm font-extrabold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-sky-400/30"
          >
            <span>Launch Live Tool on mimage.netlify.app</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Related Articles */}
      <div className="pt-10 border-t border-sky-400/20">
        <h4 className="text-base font-bold text-white mb-6">
          More In-Depth Performance & Format Guides
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedPosts.map((related) => (
            <button
              key={related.id}
              onClick={() => onSelectPost(related.slug)}
              className="text-left rounded-xl border border-sky-400/20 bg-[#071318] p-4 hover:border-sky-400 hover:bg-sky-950/30 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase font-bold block mb-1">
                  {related.category.replace('-', ' ')}
                </span>
                <h5 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                  {related.title}
                </h5>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-4 block">
                {related.readTime}
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};
