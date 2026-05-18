'use client';

import Link from 'next/link';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  index?: number;
}

const categoryColors: Record<string, string> = {
  Technology: 'from-violet-500 to-purple-500',
  Philosophy: 'from-fuchsia-500 to-pink-500',
  'How-To': 'from-cyan-500 to-blue-500',
  News: 'from-amber-500 to-orange-500',
};

const categoryGradients: Record<string, string> = {
  Technology: 'from-violet-500/20 via-purple-600/10 to-transparent',
  Philosophy: 'from-fuchsia-500/20 via-pink-600/10 to-transparent',
  'How-To': 'from-cyan-500/20 via-blue-600/10 to-transparent',
  News: 'from-amber-500/20 via-orange-600/10 to-transparent',
};

export default function BlogCard({
  slug,
  title,
  excerpt,
  date,
  readTime,
  category,
  index = 0,
}: BlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Image placeholder with gradient */}
        <div
          className={`relative h-48 bg-gradient-to-br ${categoryGradients[category] || categoryGradients.Technology} overflow-hidden`}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute top-4 right-4 w-24 h-24 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
                animation: `orb1 ${15 + index * 2}s ease-in-out infinite`,
              }}
            />
            <div
              className="absolute bottom-4 left-4 w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)',
                animation: `orb2 ${18 + index * 2}s ease-in-out infinite`,
              }}
            />
          </div>

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${categoryColors[category] || categoryColors.Technology} text-white shadow-lg`}
            >
              {category}
            </span>
          </div>

          {/* Decorative icon */}
          <div className="absolute bottom-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            {category === 'Technology'
              ? '⚡'
              : category === 'Philosophy'
                ? '🌀'
                : category === 'How-To'
                  ? '🛠'
                  : '📰'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
            <time dateTime={date}>{formattedDate}</time>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{readTime}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white/90 mb-3 group-hover:text-white transition-colors duration-300 line-clamp-2">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-4">
            {excerpt}
          </p>

          {/* Read more */}
          <div className="flex items-center gap-2 text-sm font-medium text-violet-400 group-hover:text-violet-300 transition-colors duration-300">
            <span>Read article</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: '0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.02)',
          }}
        />
      </article>
    </Link>
  );
}
