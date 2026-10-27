import React, { useState } from 'react';
import { BlogPost, BlogCategoryKey, BLOG_CATEGORIES } from '../data/blogData';
import { Sparkles, Search, Calendar, Clock, ArrowRight, ShieldCheck, BookOpen, Layers } from 'lucide-react';

interface BlogHubProps {
  posts: BlogPost[];
  onSelectPost: (slug: string) => void;
  onOpenStudio: () => void;
  onSelectTool: (slug: string) => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({
  posts,
  onSelectPost,
  onOpenStudio,
  onSelectTool
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.primaryKeyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-200">
      {/* Blog Hub Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-400/40 bg-sky-950/40 text-sky-300 text-xs font-mono font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>MatrixConvert Engineering & SEO Research Lab</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Modern Document Architecture, Vector Formats & Privacy
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          In-depth technical guides, empirical compression benchmarks, and client-side WebAssembly workflows. Updated daily for web developers, graphic designers, and security engineers.
        </p>

        {/* Daily Trending Blog Studio Callout Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenStudio}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider hover:from-sky-400 hover:to-cyan-400 transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Daily Trending SEO Blog Studio</span>
          </button>
          <a
            href="https://mimage.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-xl border border-sky-400/40 bg-[#030908] text-sky-300 font-mono text-xs font-bold hover:bg-sky-950/40 transition-colors inline-flex items-center gap-2"
          >
            <span>Live Site: mimage.netlify.app</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 6 Category Pills */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
            Explore by 6 Core Topic Categories
          </span>
          <span className="text-[11px] font-mono text-sky-400">
            {posts.length} Technical Articles Published
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer font-bold ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'bg-[#071318] border border-sky-400/20 text-slate-300 hover:border-sky-400/60'
            }`}
          >
            All Categories ({posts.length})
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                    : 'bg-[#071318] border border-sky-400/20 text-slate-300 hover:border-sky-400/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-10 max-w-xl mx-auto">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by keyword (e.g. 300 DPI, WebP, SVG, zero knowledge)..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-sky-400/30 bg-[#071318] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-xs font-mono text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Featured Article Card (if no search active and showing all) */}
      {!searchQuery && selectedCategory === 'all' && featuredPost && (
        <div className="mb-12 rounded-3xl border-2 border-sky-400/40 bg-gradient-to-br from-[#071318] via-[#040e11] to-[#020709] p-6 sm:p-10 shadow-2xl overflow-hidden relative group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500 text-slate-950">
                  Featured Master Guide
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {featuredPost.readTime}
                </span>
              </div>
              <h2
                onClick={() => onSelectPost(featuredPost.slug)}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight cursor-pointer group-hover:text-sky-300 transition-colors"
              >
                {featuredPost.title}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                {featuredPost.metaDescription}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-sky-400/40"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">{featuredPost.author.name}</span>
                    <span className="text-[11px] text-slate-400">{featuredPost.publishedDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPost(featuredPost.slug)}
                  className="px-5 py-2.5 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 text-xs font-mono font-bold hover:bg-sky-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              onClick={() => onSelectPost(featuredPost.slug)}
              className="lg:col-span-5 cursor-pointer overflow-hidden rounded-2xl border border-sky-400/30"
            >
              <img
                src={featuredPost.heroImage.url}
                alt={featuredPost.heroImage.alt}
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => {
          const cat = BLOG_CATEGORIES.find((c) => c.key === post.category) || BLOG_CATEGORIES[0];
          return (
            <article
              key={post.id}
              className="rounded-2xl border border-sky-400/25 bg-[#071318]/90 backdrop-blur-md overflow-hidden flex flex-col justify-between hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all group"
            >
              <div>
                <div
                  onClick={() => onSelectPost(post.slug)}
                  className="relative h-48 overflow-hidden cursor-pointer"
                >
                  <img
                    src={post.heroImage.url}
                    alt={post.heroImage.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase backdrop-blur-md border ${cat.badgeColor}`}>
                    {cat.icon} {cat.title}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      {post.publishedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectPost(post.slug)}
                    className="font-bold text-base text-white group-hover:text-sky-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {post.metaDescription}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-sky-400/15 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-sky-400/30"
                  />
                  <span className="text-[11px] font-mono text-slate-300">{post.author.name}</span>
                </div>

                <button
                  onClick={() => onSelectPost(post.slug)}
                  className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-slate-400 text-sm font-mono">No articles found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-mono text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
