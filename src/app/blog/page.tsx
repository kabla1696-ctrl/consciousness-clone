'use client';

import { useState, useMemo } from 'react';
import { blogPosts, categories, searchPosts, getPostsByCategory } from '@/lib/blog-data';
import BlogCard from '@/components/BlogCard';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (searchQuery.trim()) {
      return searchPosts(searchQuery);
    }
    return getPostsByCategory(activeCategory);
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#050510]">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a2e] to-[#050510]" />
        <div
          className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            animation: 'orb1 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(217,70,239,0.4) 0%, transparent 70%)',
            animation: 'orb2 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <span className="text-sm">📝</span>
            <span className="text-sm font-medium text-violet-400">Our Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Insights on Digital
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Consciousness
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Explore the frontier of digital immortality — technology, philosophy, and practical
            guides for preserving your essence forever.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat && !searchQuery
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20'
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={
                activeCategory !== cat || searchQuery
                  ? {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
                  : undefined
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                readTime={post.readTime}
                category={post.category}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white/70 mb-2">No articles found</h3>
            <p className="text-white/40">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
