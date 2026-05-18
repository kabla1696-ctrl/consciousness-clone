import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { blogPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog-data';
import ReadingProgress from '@/components/ReadingProgress';

const APP_URL = 'https://consciousness-clone.vercel.app';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      post.category.toLowerCase(),
      'digital consciousness',
      'AI immortality',
      'consciousness clone',
      ...post.title.toLowerCase().split(' '),
    ],
    authors: [{ name: post.author.name }],
    openGraph: {
      title: `${post.title} | Consciousness Clone`,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      url: `${APP_URL}/blog/${post.slug}`,
      siteName: 'Consciousness Clone',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${APP_URL}/blog/${post.slug}`,
    },
  };
}

function TableOfContents({ content }: { content: string }) {
  const headings = content
    .split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const level = line.match(/^(#{2,3})/)?.[1].length ?? 2;
      const text = line.replace(/^#{2,3}\s+/, '');
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      return { level, text, id };
    });

  if (headings.length === 0) return null;

  return (
    <nav
      className="rounded-2xl p-6 sticky top-28"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
        Table of Contents
      </h4>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-sm transition-colors duration-200 hover:text-violet-400 ${
                h.level === 3 ? 'pl-4 text-white/40' : 'text-white/60'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = `${APP_URL}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/40">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        aria-label="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        aria-label="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=Check%20out%20this%20article:%20${encodedUrl}`}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        aria-label="Share via Email"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </a>
    </div>
  );
}

function AuthorCard({ author }: { author: { name: string; role: string; avatar: string } }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-2xl">
        {author.avatar}
      </div>
      <div>
        <h4 className="font-semibold text-white/90">{author.name}</h4>
        <p className="text-sm text-white/40">{author.role}</p>
      </div>
    </div>
  );
}

function RelatedPostCard({
  slug,
  title,
  excerpt,
  category,
}: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
}) {
  const categoryColors: Record<string, string> = {
    Technology: 'from-violet-500 to-purple-500',
    Philosophy: 'from-fuchsia-500 to-pink-500',
    'How-To': 'from-cyan-500 to-blue-500',
    News: 'from-amber-500 to-orange-500',
  };

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article
        className="rounded-2xl p-6 h-full transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${categoryColors[category] || categoryColors.Technology} text-white mb-3`}
        >
          {category}
        </span>
        <h3 className="text-base font-semibold text-white/90 mb-2 group-hover:text-white transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-white/40 line-clamp-2">{excerpt}</p>
      </article>
    </Link>
  );
}

function renderMarkdown(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      // Headings
      if (/^### /.test(line)) {
        const text = line.replace(/^### /, '');
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        return `<h3 id="${id}" class="text-xl font-semibold text-white/90 mt-10 mb-4">${text}</h3>`;
      }
      if (/^## /.test(line)) {
        const text = line.replace(/^## /, '');
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        return `<h2 id="${id}" class="text-2xl font-bold text-white mt-14 mb-6 pb-3" style="border-bottom: 1px solid rgba(255,255,255,0.06)">${text}</h2>`;
      }
      // Bold
      if (/^- \*\*/.test(line)) {
        const match = line.match(/^- \*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
        if (match) {
          return `<li class="flex gap-3 mb-3 text-white/60 leading-relaxed"><span class="text-violet-400 mt-1.5">•</span><span><strong class="text-white/80">${match[1]}</strong> — ${match[2]}</span></li>`;
        }
      }
      // List items
      if (/^- /.test(line)) {
        const text = line.replace(/^- /, '');
        return `<li class="flex gap-3 mb-2 text-white/60 leading-relaxed"><span class="text-violet-400 mt-1">•</span><span>${text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80">$1</strong>')}</span></li>`;
      }
      // Numbered list
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        return `<li class="flex gap-3 mb-3 text-white/60 leading-relaxed"><span class="text-violet-400 font-semibold min-w-[1.5rem]">${numberedMatch[1]}.</span><span>${numberedMatch[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80">$1</strong>')}</span></li>`;
      }
      // Empty line
      if (line.trim() === '') return '';
      // Paragraph
      const processed = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded text-sm" style="background:rgba(139,92,246,0.15);color:#a78bfa">$1</code>');
      return `<p class="text-white/60 leading-relaxed mb-4">${processed}</p>`;
    })
    .join('\n');
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryColors: Record<string, string> = {
    Technology: 'from-violet-500 to-purple-500',
    Philosophy: 'from-fuchsia-500 to-pink-500',
    'How-To': 'from-cyan-500 to-blue-500',
    News: 'from-amber-500 to-orange-500',
  };

  const htmlContent = renderMarkdown(post.content);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Consciousness Clone',
      url: APP_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_URL}/blog/${post.slug}`,
    },
    keywords: [post.category, 'digital consciousness', 'AI immortality'],
  };

  return (
    <>
      <ReadingProgress />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-[#050510]">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a2e] to-[#050510]" />
          <div
            className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
              animation: 'orb1 15s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(217,70,239,0.4) 0%, transparent 70%)',
              animation: 'orb2 20s ease-in-out infinite',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/30 mb-10">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white/60 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-white/50 truncate max-w-[200px]">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            {/* Main Article */}
            <article>
              {/* Header */}
              <header className="mb-12">
                <span
                  className={`inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r ${categoryColors[post.category] || categoryColors.Technology} text-white mb-6`}
                >
                  {post.category}
                </span>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>

                <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-3xl">
                  {post.excerpt}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-6">
                  <AuthorCard author={post.author} />
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <time dateTime={post.date}>{formattedDate}</time>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </header>

              {/* Article Body */}
              <div
                className="rounded-2xl p-8 md:p-12 mb-12"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="prose-custom"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  style={{
                    listStyleType: 'none',
                  }}
                />
              </div>

              {/* Share & Author footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
                <ShareButtons title={post.title} slug={post.slug} />
                <Link
                  href="/blog"
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to all articles
                </Link>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-8">
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Related Articles
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((rp) => (
                      <RelatedPostCard
                        key={rp.slug}
                        slug={rp.slug}
                        title={rp.title}
                        excerpt={rp.excerpt}
                        category={rp.category}
                      />
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <TableOfContents content={post.content} />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
