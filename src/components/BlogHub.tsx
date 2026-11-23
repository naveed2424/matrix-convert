import React, { useState, useEffect } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../data/blogData';
import { REGISTERED_EDITORIAL_FRAMEWORK } from '../data/editorialFramework';
import { getBlogTranslation, getLocalizedBlogCategory } from '../data/blogI18n';
import { rescanDomTranslation } from '../services/autoTranslation';
import { Search, Calendar, Clock, ArrowRight, ShieldCheck, BookOpen, X, CheckCircle2 } from 'lucide-react';

interface BlogHubProps {
  posts: BlogPost[];
  currentLang?: string;
  onSelectPost: (slug: string) => void;
  onNavigateHome: () => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({
  posts,
  currentLang = 'en',
  onSelectPost,
  onNavigateHome
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFrameworkModal, setShowFrameworkModal] = useState<boolean>(false);

  const tb = (key: Parameters<typeof getBlogTranslation>[1]) => getBlogTranslation(currentLang, key);

  useEffect(() => {
    if (currentLang !== 'en') {
      rescanDomTranslation(currentLang, 260);
    }
  }, [selectedCategory, searchQuery, currentLang]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-blue-200 dark:border-slate-800 bg-blue-50 dark:bg-slate-900 text-blue-700 dark:text-sky-400 text-xs font-mono font-semibold notranslate" translate="no">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{tb('libraryBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight notranslate" translate="no">
          {tb('hubTitle')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed notranslate" translate="no">
          {tb('hubSubtitle')}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 notranslate" translate="no">
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{tb('exploreAllTools')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFrameworkModal(true)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-blue-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{tb('editorialStandards')}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-8 notranslate" translate="no">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
            {tb('filterByTopic')}
          </span>
          <span className="text-xs font-mono text-blue-600 dark:text-sky-400 tabular-nums">
            {posts.length} {tb('guidesAvailable')}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {tb('allGuides')} ({posts.length})
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{getLocalizedBlogCategory(cat.key, currentLang)}</span>
                <span className="text-[11px] opacity-75 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-10 max-w-xl mx-auto">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tb('searchPlaceholder')}
          className="w-full pl-11 pr-16 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer notranslate"
            translate="no"
          >
            {tb('clear')}
          </button>
        )}
      </div>

      {/* Featured Guide */}
      {!searchQuery && selectedCategory === 'all' && featuredPost && (
        <div className="mb-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-blue-600 dark:text-sky-400 font-bold uppercase tracking-wider notranslate" translate="no">
                  {tb('featuredGuide')}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{featuredPost.readTime}</span>
              </div>
              <h2
                onClick={() => onSelectPost(featuredPost.slug)}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight cursor-pointer group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors"
              >
                {featuredPost.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                {featuredPost.metaDescription}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover object-top border border-slate-200 dark:border-slate-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">{featuredPost.author.name}</span>
                    <span className="text-[11px] text-slate-500">{featuredPost.publishedDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPost(featuredPost.slug)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer notranslate"
                  translate="no"
                >
                  <span>{tb('readGuide')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              onClick={() => onSelectPost(featuredPost.slug)}
              className="lg:col-span-5 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <img
                src={featuredPost.heroImage.url}
                alt={featuredPost.heroImage.alt}
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => {
          const cat = BLOG_CATEGORIES.find((c) => c.key === post.category) || BLOG_CATEGORIES[0];
          return (
            <article
              key={post.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between hover:border-blue-400 transition-colors group shadow-xs"
            >
              <div>
                <div onClick={() => onSelectPost(post.slug)} className="relative h-48 overflow-hidden cursor-pointer">
                  <img
                    src={post.heroImage.url}
                    alt={post.heroImage.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="text-blue-600 dark:text-sky-400 font-semibold notranslate" translate="no">
                      {getLocalizedBlogCategory(cat.key, currentLang)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectPost(post.slug)}
                    className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {post.metaDescription}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>{post.publishedDate}</span>
                </div>

                <button
                  onClick={() => onSelectPost(post.slug)}
                  className="font-mono font-semibold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer notranslate"
                  translate="no"
                >
                  <span>{tb('read')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-14 space-y-3">
          <p className="text-slate-500 text-sm font-mono">
            <span className="notranslate" translate="no">{tb('noMatches')}</span> &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-semibold cursor-pointer notranslate"
            translate="no"
          >
            {tb('resetFilters')}
          </button>
        </div>
      )}

      {/* Editorial Standards Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 overflow-y-auto text-slate-800 dark:text-slate-200 shadow-2xl">
            <button
              onClick={() => setShowFrameworkModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Mimage Editorial Standards · v{REGISTERED_EDITORIAL_FRAMEWORK.version}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Quality, Accuracy &amp; Disclosure Rules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REGISTERED_EDITORIAL_FRAMEWORK.eeatPrinciples.map((principle) => (
                  <div
                    key={principle.pillar}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-xs block mb-1">
                      {principle.pillar}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                      {principle.description}
                    </p>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 block border-t border-slate-200 dark:border-slate-800 pt-1.5">
                      {principle.implementation}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {REGISTERED_EDITORIAL_FRAMEWORK.monetizationReadiness[0].complianceRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowFrameworkModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
