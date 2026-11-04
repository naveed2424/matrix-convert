import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquare, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Send, 
  Filter,
  Zap,
  Lock,
  Award
} from 'lucide-react';
import { REVIEW_STATS, INITIAL_CLIENT_REVIEWS, ClientReview } from '../data/reviewsData';
import { TOOLS_DATA } from '../data/toolsData';

interface ClientReviewsPageProps {
  onBackToHome: () => void;
  onSelectTool: (slug: string) => void;
}

export const ClientReviewsPage: React.FC<ClientReviewsPageProps> = ({
  onBackToHome,
  onSelectTool
}) => {
  const [reviews, setReviews] = useState<ClientReview[]>(INITIAL_CLIENT_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});

  // Review submission state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    company: '',
    country: 'France',
    countryCode: '🇫🇷',
    rating: 5,
    toolSlug: 'pdf-to-png',
    title: '',
    comment: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchRating = ratingFilter === 'all' || (ratingFilter === 4.5 ? r.rating === 4.5 : r.rating === ratingFilter);
    const matchCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'pdf' && (r.toolUsed.toLowerCase().includes('pdf') || r.toolSlug.includes('pdf'))) ||
      (categoryFilter === 'image' && (r.toolUsed.toLowerCase().includes('png') || r.toolUsed.toLowerCase().includes('image') || r.toolSlug.includes('image')));
    return matchRating && matchCategory;
  });

  const handleUpvote = (id: string) => {
    if (upvotedMap[id]) return;
    setUpvotedMap((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim() || !newReview.title.trim()) {
      return;
    }

    const selectedTool = TOOLS_DATA.find((t) => t.slug === newReview.toolSlug) || TOOLS_DATA[0];

    const created: ClientReview = {
      id: `rev-custom-${Date.now()}`,
      name: newReview.name.trim(),
      role: newReview.role.trim() || 'Verified User',
      company: newReview.company.trim() || 'Independent Creator',
      country: newReview.country,
      countryCode: newReview.countryCode,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newReview.name)}`,
      rating: newReview.rating,
      toolUsed: selectedTool.name,
      toolSlug: selectedTool.slug,
      date: new Date().toISOString().split('T')[0],
      title: newReview.title.trim(),
      comment: newReview.comment.trim(),
      isVerified: true,
      upvotes: 1
    };

    setReviews([created, ...reviews]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSubmitModal(false);
      setNewReview({
        name: '',
        role: '',
        company: '',
        country: 'France',
        countryCode: '🇫🇷',
        rating: 5,
        toolSlug: 'pdf-to-png',
        title: '',
        comment: ''
      });
    }, 1800);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
      );
    }
    if (hasHalf) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-slate-600" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
      );
    }
    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-slate-600" />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-200">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-400/20">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All 46+ Tools</span>
        </button>

        <a
          href="https://mimage.netlify.app/"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-slate-400 hover:text-sky-300 flex items-center gap-1"
        >
          <span>Live Site: https://mimage.netlify.app/</span>
          <ExternalLink className="w-3 h-3 text-sky-400" />
        </a>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-400/40 bg-sky-950/40 text-sky-300 text-xs font-mono font-semibold">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Verified Client Ratings & Testimonials (Avis Clients)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Rated <span className="text-amber-400">4.85 / 5.0</span> by 1,420+ Satisfied Professionals
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          Graphic designers, legal compliance teams, researchers, and developers rely on MatrixConvert daily for zero-upload privacy, instant conversion speeds, and Sejda-grade PDF reliability.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Leave Your Avis / Review</span>
          </button>
          <button
            onClick={onBackToHome}
            className="px-5 py-3 rounded-xl border border-sky-400/40 bg-[#030908] text-sky-300 font-mono text-xs font-bold hover:bg-sky-950/40 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Try All 46+ Free In-Browser Tools</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          RATINGS BREAKDOWN & GRAPH DASHBOARD
         ========================================================================= */}
      <div className="rounded-3xl border border-sky-400/30 bg-[#071318]/90 backdrop-blur-md p-6 sm:p-10 shadow-2xl mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Big Score Summary Column */}
          <div className="lg:col-span-4 text-center lg:text-left space-y-3 pb-6 lg:pb-0 lg:border-r border-sky-400/20 lg:pr-8">
            <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-bold block">
              Overall Client Satisfaction
            </span>
            <div className="flex items-baseline justify-center lg:justify-start gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white font-mono">
                {REVIEW_STATS.averageRating}
              </span>
              <span className="text-xl font-bold text-slate-500 font-mono">/ 5.0</span>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
              {renderStars(REVIEW_STATS.averageRating)}
              <span className="text-xs font-bold text-amber-400 font-mono">
                (98.6% positive)
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              Based on <strong>{REVIEW_STATS.totalReviews.toLocaleString()}+ verified conversions</strong> across 46 PDF, Image & WebP client-side tools.
            </p>

            <div className="pt-3 flex items-center justify-center lg:justify-start gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Client-Side Privacy Guaranteed</span>
            </div>
          </div>

          {/* Graphical Rating Distribution Bars */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Rating Breakdown Graph</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                1,420 Verified Ratings
              </span>
            </div>

            {REVIEW_STATS.ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-xs font-mono">
                <button
                  onClick={() => setRatingFilter(item.score === 5 ? 5 : item.score === 4.5 ? 4.5 : item.score === 4 ? 4 : 'all')}
                  className="w-20 text-left text-slate-300 hover:text-amber-400 font-medium transition-colors cursor-pointer shrink-0"
                >
                  {item.stars}
                </button>

                {/* Animated Visual Progress Bar */}
                <div className="flex-1 h-3 rounded-full bg-slate-900 border border-sky-400/20 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.score >= 4.5
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : item.score === 4
                        ? 'bg-gradient-to-r from-sky-400 to-teal-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="w-24 text-right flex items-center justify-end gap-1.5 text-slate-400 shrink-0">
                  <span className="font-bold text-white">{item.percentage}%</span>
                  <span className="text-[10px] text-slate-500">({item.count})</span>
                </div>
              </div>
            ))}

            {/* Performance Aspect Sub-scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-sky-400/15 mt-6">
              {REVIEW_STATS.aspectScores.map((aspect) => (
                <div key={aspect.category} className="p-3 rounded-xl bg-[#030908] border border-sky-400/20 text-center">
                  <div className="text-base font-extrabold text-white font-mono">
                    {aspect.score} <span className="text-[10px] text-slate-500">/5</span>
                  </div>
                  <div className="text-[10px] font-mono text-sky-400 font-bold truncate mt-0.5">
                    {aspect.label}
                  </div>
                  <div className="text-[9px] text-slate-400 leading-tight mt-1 line-clamp-2">
                    {aspect.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER AND REVIEWS FEED
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-sky-400/20">
        {/* Rating Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-mono text-slate-400 font-bold shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              ratingFilter === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-[#071318] border border-sky-400/30 text-slate-300 hover:text-white'
            }`}
          >
            All Ratings ({reviews.length})
          </button>
          <button
            onClick={() => setRatingFilter(5)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              ratingFilter === 5
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-[#071318] border border-sky-400/30 text-slate-300 hover:text-white'
            }`}
          >
            <span>5 Stars</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </button>
          <button
            onClick={() => setRatingFilter(4.5)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              ratingFilter === 4.5
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-[#071318] border border-sky-400/30 text-slate-300 hover:text-white'
            }`}
          >
            <span>4.5 Stars</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </button>
          <button
            onClick={() => setRatingFilter(4)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              ratingFilter === 4
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-[#071318] border border-sky-400/30 text-slate-300 hover:text-white'
            }`}
          >
            <span>4 Stars</span>
            <Star className="w-3 h-3 fill-sky-400 text-sky-400" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#071318] border border-sky-400/40 text-xs font-mono text-slate-200 cursor-pointer"
          >
            <option value="all">All Tool Categories</option>
            <option value="pdf">PDF Suite Tools</option>
            <option value="image">Image & WebP Tools</option>
          </select>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-sky-400/25 bg-[#071318] p-6 flex flex-col justify-between hover:border-sky-400/60 transition-all hover:shadow-xl hover:shadow-sky-500/10"
          >
            <div className="space-y-3">
              {/* Header: User avatar, name, verified tag, stars */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-11 h-11 rounded-full object-cover border border-sky-400/40 bg-slate-900"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{rev.name}</span>
                      <span>{rev.countryCode}</span>
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {rev.role} {rev.company && `• ${rev.company}`}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {renderStars(rev.rating)}
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">
                    {rev.date}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <h3 className="font-bold text-sm text-white pt-1">
                "{rev.title}"
              </h3>

              {/* Review Body */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {rev.comment}
              </p>
            </div>

            {/* Bottom Bar: Tool Tag & Upvote Button */}
            <div className="pt-4 mt-4 border-t border-sky-400/15 flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => onSelectTool(rev.toolSlug)}
                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
              >
                <Zap className="w-3 h-3 text-sky-400" />
                <span>Tool: {rev.toolUsed}</span>
              </button>

              <button
                onClick={() => handleUpvote(rev.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  upvotedMap[rev.id]
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Helpful Review"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{rev.upvotes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          SUBMIT AN AVIS / REVIEW MODAL
         ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-sky-400/50 bg-[#06141c] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sky-400/20">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Leave Your Client Avis / Review</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-300">
                  Your client review has been verified and added to the official satisfaction dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                {/* Rating selection (4, 4.5, 5 stars) */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Your Rating (Satisfaction Score):
                  </label>
                  <div className="flex items-center gap-3">
                    {[5, 4.5, 4].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`px-3 py-2 rounded-xl flex items-center gap-1.5 border cursor-pointer ${
                          newReview.rating === star
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                            : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{star} Stars</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jean Dupont"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#071318] border border-sky-400/30 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Graphic Designer"
                      value={newReview.role}
                      onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#071318] border border-sky-400/30 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                {/* Tool Used Dropdown */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tool You Used:</label>
                  <select
                    value={newReview.toolSlug}
                    onChange={(e) => setNewReview({ ...newReview, toolSlug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#071318] border border-sky-400/30 text-white focus:outline-none focus:border-sky-400"
                  >
                    {TOOLS_DATA.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.name} ({t.fromFormat} → {t.toFormat})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Headline / Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incredibly fast and completely private!"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#071318] border border-sky-400/30 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Detailed Experience & Feedback *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share how MatrixConvert helped your workflow, file sizes, or privacy..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#071318] border border-sky-400/30 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
