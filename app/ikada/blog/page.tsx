"use client"
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Calendar, User, Eye, ChevronLeft, ChevronRight, Tag as TagIcon, Layers } from "lucide-react";
import { useLayoutEffect } from "react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPage() {
  // State
  const [featured, setFeatured] = useState<any[]>([]);
  const [highlighted, setHighlighted] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const highlightTimeout = useRef<NodeJS.Timeout | null>(null);
  const [highlightedAnim, setHighlightedAnim] = useState("fade-in");
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [featuredAnim, setFeaturedAnim] = useState("fade-in");
  const [prevFeaturedIdx, setPrevFeaturedIdx] = useState<number | null>(null);
  const [prevHighlightedIdx, setPrevHighlightedIdx] = useState<number | null>(null);
  const [featuredDirection, setFeaturedDirection] = useState<'left'|'right'>('right');
  const [highlightedDirection, setHighlightedDirection] = useState<'left'|'right'>('right');

  // Fetch all data on mount & page change & search
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/news/featured?limit=5").then(res => res.json()),
      fetch("/api/news/highlighted").then(res => res.json()),
      fetch("/api/news/categories?withPostCount=true").then(res => res.json()),
      fetch(`/api/news/posts?status=APPROVED&page=${pagination.page}&limit=9&search=${encodeURIComponent(search)}`).then(res => res.json()),
    ]).then(([featuredRes, highlightedRes, catRes, postRes]) => {
      setFeatured(featuredRes.featuredPosts || []);
      setHighlighted(highlightedRes.highlightedPosts || []);
      setCategories(catRes.categories || []);
      setPosts(postRes.posts || []);
      setPagination(p => ({ ...p, totalPages: postRes.pagination?.totalPages || 1 }));
      // Kumpulkan tags unik dari semua post
      const tagMap: Record<string, any> = {};
      (postRes.posts || []).forEach((post: any) => {
        (post.tags || []).forEach((tag: any) => { tagMap[tag.slug] = tag; });
      });
      setTags(Object.values(tagMap));
    }).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pagination.page, search]);

  // Handler search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    setSearch(searchInput);
  };

  // Handler hero slider
  const nextFeatured = () => {
    setPrevFeaturedIdx(featuredIdx);
    setFeaturedDirection('right');
    setTimeout(() => {
      setFeaturedIdx(i => (i + 1) % featured.length);
      setTimeout(() => setPrevFeaturedIdx(null), 500);
    }, 10);
  };
  const prevFeatured = () => {
    setPrevFeaturedIdx(featuredIdx);
    setFeaturedDirection('left');
    setTimeout(() => {
      setFeaturedIdx(i => (i - 1 + featured.length) % featured.length);
      setTimeout(() => setPrevFeaturedIdx(null), 500);
    }, 10);
  };
  const gotoFeatured = (idx: number) => {
    if (idx === featuredIdx) return;
    setPrevFeaturedIdx(featuredIdx);
    setFeaturedDirection(idx > featuredIdx ? 'right' : 'left');
    setTimeout(() => {
      setFeaturedIdx(idx);
      setTimeout(() => setPrevFeaturedIdx(null), 500);
    }, 10);
  };

  // Handler highlighted carousel
  const nextHighlighted = () => {
    setPrevHighlightedIdx(highlightedIdx);
    setHighlightedDirection('right');
    setTimeout(() => {
      setHighlightedIdx(i => (i + 1) % highlighted.length);
      setTimeout(() => setPrevHighlightedIdx(null), 400);
    }, 10);
  };
  const prevHighlighted = () => {
    setPrevHighlightedIdx(highlightedIdx);
    setHighlightedDirection('left');
    setTimeout(() => {
      setHighlightedIdx(i => (i - 1 + highlighted.length) % highlighted.length);
      setTimeout(() => setPrevHighlightedIdx(null), 400);
    }, 10);
  };

  // Handler pagination
  const gotoPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(p => ({ ...p, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (loading) {
    return <div className="py-24 text-center text-gray-400 dark:text-gray-500 text-xl">Memuat artikel...</div>;
  }

  // Sidebar kategori/tag
  const Sidebar = (
    <aside className="w-full md:w-64 md:sticky md:top-24 flex-shrink-0 mb-8 md:mb-0">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-2 font-semibold text-green-700 dark:text-green-300"><Layers className="w-4 h-4" />Kategori</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat: any) => (
            <span key={cat.id} className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-800 text-green-700 dark:text-green-200 border border-green-100 dark:border-green-700 cursor-pointer hover:bg-green-100 dark:hover:bg-green-700 transition">
              {cat.name} <span className="ml-1 text-gray-400">({cat.postCount})</span>
            </span>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
        <div className="flex items-center gap-2 mb-2 font-semibold text-green-700 dark:text-green-300"><TagIcon className="w-4 h-4" />Tag</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: any) => (
            <span key={tag.id || tag.slug} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-700 dark:hover:text-green-200 transition">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <style jsx global>{`
        .swipe-in-right {
          animation: swipeInRight 0.5s cubic-bezier(.4,0,.2,1);
        }
        .swipe-out-right {
          animation: swipeOutRight 0.5s cubic-bezier(.4,0,.2,1);
        }
        .swipe-in-left {
          animation: swipeInLeft 0.5s cubic-bezier(.4,0,.2,1);
        }
        .swipe-out-left {
          animation: swipeOutLeft 0.5s cubic-bezier(.4,0,.2,1);
        }
        @keyframes swipeInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes swipeOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-60px); }
        }
        @keyframes swipeInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes swipeOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(60px); }
        }
      `}</style>
      <div className="py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar (desktop only) */}
        <div className="hidden md:block w-64">{Sidebar}</div>
        <div className="flex-1 min-w-0">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Berita & Artikel Terbaru</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Temukan informasi terbaru dan artikel menarik dari komunitas IKADA</p>
          </div>

          {/* Sidebar toggle (mobile only) */}
          <button className="md:hidden mb-4 px-4 py-2 bg-green-600 text-white rounded font-semibold" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? "Tutup Kategori & Tag" : "Lihat Kategori & Tag"}
          </button>
          {/* Sidebar (mobile only, collapsible) */}
          {sidebarOpen && (
            <div className="mb-6 md:hidden">{Sidebar}</div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-4 py-2 focus:ring-2 focus:ring-green-400 dark:bg-gray-900 dark:text-white"
              placeholder="Cari artikel, judul, atau penulis..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition">Cari</button>
          </form>

          {/* Hero Slider */}
          {featured.length > 0 && (
            <div className="mb-8 relative w-full aspect-square md:aspect-[16/7] rounded-xl overflow-hidden shadow-lg">
              {/* Current */}
              <div className={`absolute inset-0 z-10 ${featuredDirection === 'right' ? 'swipe-in-right' : 'swipe-in-left'}`} key={featuredIdx}>
                <Link href={`/ikada/blog/${featured[featuredIdx].slug}`} className="block w-full h-full">
                  <img src={featured[featuredIdx].imageUrl} alt={featured[featuredIdx].title} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                      {featured[featuredIdx].category && (
                        <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold" style={{background: featured[featuredIdx].category.color || '#22c55e', color: '#fff'}}>{featured[featuredIdx].category.name}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs opacity-80"><Calendar className="w-3 h-3 md:w-4 md:h-4" />{formatDate(featured[featuredIdx].publishedAt || featured[featuredIdx].createdAt)}</span>
                      <span className="flex items-center gap-1 text-xs opacity-80"><User className="w-3 h-3 md:w-4 md:h-4" />{featured[featuredIdx].author?.name}</span>
                      <span className="flex items-center gap-1 text-xs opacity-80"><Eye className="w-3 h-3 md:w-4 md:h-4" />{featured[featuredIdx].viewCount}</span>
                    </div>
                    <h1 className="text-lg md:text-2xl lg:text-4xl font-bold mb-2 drop-shadow-lg line-clamp-2 md:line-clamp-none">{featured[featuredIdx].title}</h1>
                    <p className="text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 drop-shadow-lg hidden md:block">{featured[featuredIdx].excerpt || featured[featuredIdx].content?.replace(/<[^>]+>/g, '').slice(0, 120) + '...'}</p>
                    <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                      {featured[featuredIdx].tags?.slice(0, 2).map((tag: any) => (
                        <span key={tag.id} className="bg-white/20 border border-white/30 text-xs px-2 py-1 rounded-full">#{tag.name}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
              {/* Previous (for swipe out) */}
              {prevFeaturedIdx !== null && prevFeaturedIdx !== featuredIdx && (
                <div className={`absolute inset-0 z-0 ${featuredDirection === 'right' ? 'swipe-out-left' : 'swipe-out-right'}`} key={prevFeaturedIdx}>
                  <Link href={`/ikada/blog/${featured[prevFeaturedIdx].slug}`} className="block w-full h-full">
                    <img src={featured[prevFeaturedIdx].imageUrl} alt={featured[prevFeaturedIdx].title} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" />
                    <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                      <div className="flex flex-wrap gap-2 mb-2 items-center">
                        {featured[prevFeaturedIdx].category && (
                          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold" style={{background: featured[prevFeaturedIdx].category.color || '#22c55e', color: '#fff'}}>{featured[prevFeaturedIdx].category.name}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs opacity-80"><Calendar className="w-3 h-3 md:w-4 md:h-4" />{formatDate(featured[prevFeaturedIdx].publishedAt || featured[prevFeaturedIdx].createdAt)}</span>
                        <span className="flex items-center gap-1 text-xs opacity-80"><User className="w-3 h-3 md:w-4 md:h-4" />{featured[prevFeaturedIdx].author?.name}</span>
                        <span className="flex items-center gap-1 text-xs opacity-80"><Eye className="w-3 h-3 md:w-4 md:h-4" />{featured[prevFeaturedIdx].viewCount}</span>
                      </div>
                      <h1 className="text-lg md:text-2xl lg:text-4xl font-bold mb-2 drop-shadow-lg line-clamp-2 md:line-clamp-none">{featured[prevFeaturedIdx].title}</h1>
                      <p className="text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 drop-shadow-lg hidden md:block">{featured[prevFeaturedIdx].excerpt || featured[prevFeaturedIdx].content?.replace(/<[^>]+>/g, '').slice(0, 120) + '...'}</p>
                      <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                        {featured[prevFeaturedIdx].tags?.slice(0, 2).map((tag: any) => (
                          <span key={tag.id} className="bg-white/20 border border-white/30 text-xs px-2 py-1 rounded-full">#{tag.name}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              {/* Slider controls & dots */}
              {featured.length > 1 && (
                <>
                  <button onClick={prevFeatured} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/70 dark:bg-gray-900/70 rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-800 transition"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={nextFeatured} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/70 dark:bg-gray-900/70 rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-800 transition"><ChevronRight className="w-6 h-6" /></button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {featured.map((_, idx) => (
                      <button key={idx} onClick={() => gotoFeatured(idx)} className={`w-3 h-3 rounded-full border-2 ${idx === featuredIdx ? 'bg-green-500 border-green-700' : 'bg-white/60 border-white/80 dark:bg-gray-700 dark:border-gray-400'} transition`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Highlighted Bar */}
          {highlighted.length > 0 && (
            <div className="mb-8 flex items-center gap-2 bg-green-50 dark:bg-green-900 rounded-xl px-4 py-3 shadow relative">
              <button onClick={prevHighlighted} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-green-100 dark:hover:bg-green-800 transition"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide relative" style={{minHeight:56}}>
                {/* Current */}
                <Link href={`/ikada/blog/${highlighted[highlightedIdx].slug}`} className={`flex items-center gap-3 min-w-0 ${highlightedDirection === 'right' ? 'swipe-in-right' : 'swipe-in-left'} absolute left-0 right-0`} key={highlightedIdx} style={{position:'absolute'}}>
                  <img src={highlighted[highlightedIdx].imageUrl || '/placeholder.jpg'} alt={highlighted[highlightedIdx].title} className="w-14 h-14 object-cover rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <span className="font-semibold text-green-900 dark:text-green-200 truncate">{highlighted[highlightedIdx].title}</span>
                </Link>
                {/* Previous (for swipe out) */}
                {prevHighlightedIdx !== null && prevHighlightedIdx !== highlightedIdx && (
                  <Link href={`/ikada/blog/${highlighted[prevHighlightedIdx].slug}`} className={`flex items-center gap-3 min-w-0 ${highlightedDirection === 'right' ? 'swipe-out-left' : 'swipe-out-right'} absolute left-0 right-0`} key={prevHighlightedIdx} style={{position:'absolute'}}>
                    <img src={highlighted[prevHighlightedIdx].imageUrl || '/placeholder.jpg'} alt={highlighted[prevHighlightedIdx].title} className="w-14 h-14 object-cover rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <span className="font-semibold text-green-900 dark:text-green-200 truncate">{highlighted[prevHighlightedIdx].title}</span>
                  </Link>
                )}
              </div>
              <button onClick={nextHighlighted} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-green-100 dark:hover:bg-green-800 transition"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}

          {/* Grid Articles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/ikada/blog/${post.slug}`} className="group block bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex gap-2 items-center mb-1">
                    {post.category && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background: post.category.color || '#22c55e', color: '#fff'}}>{post.category.name}</span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Calendar className="w-4 h-4" />{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  <h2 className="text-lg font-bold group-hover:text-green-700 dark:group-hover:text-green-400 transition line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 100) + '...'}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {post.tags?.map((tag: any) => (
                      <span key={tag.id} className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs px-2 py-0.5 rounded-full">#{tag.name}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />{post.author?.name}
                    <Eye className="w-4 h-4 ml-2" />{post.viewCount}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => gotoPage(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold disabled:opacity-50">Sebelumnya</button>
              <span className="font-semibold text-green-700 dark:text-green-300">Halaman {pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => gotoPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold disabled:opacity-50">Berikutnya</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 