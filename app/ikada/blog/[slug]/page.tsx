"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Eye, ChevronLeft, Copy, Share2 } from "lucide-react";
import { PublicNavbar } from '@/components/public-navbar';

export default function BlogDetailPage() {
  const { slug: rawSlug } = useParams();
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    
    // Fetch post directly by slug
    fetch(`/api/news/posts?slug=${encodeURIComponent(slug)}&status=APPROVED&limit=1`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(async data => {
        const foundPost = data.posts?.[0];
        if (!foundPost) {
          setError("Artikel tidak ditemukan.");
          setPost(null);
          setLoading(false);
          return;
        }
        
        setPost(foundPost);
        setError("");
        setLoading(false);
        
        // Fetch related posts by category
        if (foundPost.category?.id) {
          fetch(`/api/news/posts?categoryId=${foundPost.category.id}&limit=4&status=APPROVED`)
            .then(r => r.ok ? r.json() : { posts: [] })
            .then(rel => {
              setRelated((rel.posts || []).filter((p: any) => p.id !== foundPost.id).slice(0, 3));
            });
        } else {
          setRelated([]);
        }
      })
      .catch(() => {
        setError("Artikel tidak ditemukan.");
        setPost(null);
        setLoading(false);
      });
  }, [slug]);

  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  const readingTime = useMemo(() => {
    if (!post?.content) return null;
    const words = post.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 200))} menit baca`;
  }, [post?.content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PublicNavbar />
      <div className="py-20 text-center animate-pulse text-lg">Memuat artikel...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PublicNavbar />
      <div className="py-20 text-center text-red-500">{error}</div>
    </div>
  );
  
  if (!post) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadein pb-20 md:pb-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex gap-2 items-center">
          <Link href="/" className="hover:underline">Beranda</Link>
          <span>/</span>
          <Link href="/ikada/blog" className="hover:underline">Blog</Link>
          <span>/</span>
          <span className="truncate max-w-[180px]" title={post.title}>{post.title}</span>
        </nav>
        {/* Featured Image */}
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full rounded-xl mb-6 object-cover max-h-[400px]" />
        )}
        {/* Meta */}
        <div className="flex flex-wrap gap-3 items-center mb-4 text-sm text-gray-600 dark:text-gray-300">
          {post.category && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{background: post.category.color || '#22c55e', color: '#fff'}}>{post.category.name}</span>
          )}
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.publishedAt || post.createdAt)}</span>
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author?.name}</span>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.viewCount}</span>
          {readingTime && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>{readingTime}</span>}
        </div>
        {/* Judul & Excerpt */}
        <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white drop-shadow-lg">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{post.excerpt}</p>}
        {/* Share */}
        <div className="flex gap-3 mb-6 items-center">
          <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900 transition"><Copy className="w-4 h-4" />{copied ? "Tersalin!" : "Copy Link"}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 transition"><Share2 className="w-4 h-4" />WA</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition"><Share2 className="w-4 h-4" />FB</a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 transition"><Share2 className="w-4 h-4" />Twitter</a>
        </div>
        {/* Konten */}
        <article className="prose dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }} />
        {/* Tag */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: any) => (
              <Link key={tag.id} href={`/ikada/blog?tag=${encodeURIComponent(tag.name)}`} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-800 transition">#{tag.name}</Link>
            ))}
          </div>
        )}
        {/* Artikel Terkait */}
        {related.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Artikel Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((p: any) => (
                <Link key={p.id} href={`/ikada/blog/${p.slug}`} className="block bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div className="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex gap-2 items-center mb-1">
                      {p.category && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background: p.category.color || '#22c55e', color: '#fff'}}>{p.category.name}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Calendar className="w-4 h-4" />{formatDate(p.publishedAt || p.createdAt)}</span>
                    </div>
                    <h3 className="text-base font-bold group-hover:text-green-700 dark:group-hover:text-green-400 transition line-clamp-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{p.excerpt || p.content?.replace(/<[^>]+>/g, '').slice(0, 100) + '...'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Tombol Kembali */}
        <Link href="/ikada/blog" className="inline-block px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition">Kembali ke Blog</Link>
        <style jsx global>{`
          .animate-fadein { animation: fadein 0.7s; }
          @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
} 