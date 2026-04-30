import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
  MessageCircle,
  ExternalLink,
  Star,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import NewsComment from "../components/newsDetail/NewsComment";
import { getAllNews, GetAllPropertyDetails } from "@/Api/Api";
import { toast } from "react-hot-toast";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import {
  buildNewsDetailPath,
  getNewsIdFromSlug,
} from "@/modules/website/utils/newsSlug";
import { useSsrData } from "@/ssr/SsrDataContext";

const getAmenityName = (amenity: unknown) => {
  if (typeof amenity === "string") return amenity;
  if (
    amenity &&
    typeof amenity === "object" &&
    "name" in amenity &&
    typeof amenity.name === "string"
  ) {
    return amenity.name;
  }

  return null;
};
// Types
interface NewsItem {
  id: number;
  category: string;
  title: string;
  description: string;
  badgeType: string;
  imageUrl: string;
  active: boolean;
  newsDate: string | null;
  dateBadge: string;
  slug: string | null;
  longDesc: string | null;
  authorName: string | null;
  authorDescription: string | null;
  readTime: string | null;
  tags: string | null;
}

interface Property {
  id: number;
  propertyId: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  type: string;
  highlights: string[];
}

// ============================================
// PROPERTIES SLIDER COMPONENT
// ============================================
const PropertiesSlider = ({ properties }: { properties: Property[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (properties.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === properties.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [properties.length]);

  if (properties.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-2xl h-[300px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <MapPin className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-serif">Explore more properties soon.</p>
      </div>
    );
  }

  const currentProperty = properties[currentIndex];

  // Amenities or fallback tags
  const displayTags =
    currentProperty.highlights?.length > 0
      ? currentProperty.highlights.slice(0, 4)
      : ["Luxury", "Premium", "Hospitality"];

  const handleNavigate = () => {
    const citySlug = createCitySlug(currentProperty.location);
    const propertySlug = createHotelSlug(
      currentProperty.name || currentProperty.location || "property",
      currentProperty.propertyId,
    );
    navigate(`/${citySlug}/${propertySlug}`);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Image Section */}
      <div className="relative h-[210px] overflow-hidden rounded-t-2xl">
        {properties.map((property, i) => (
          <div
            key={`${property.id}-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? "opacity-100" : "opacity-0"}`}
          >
            {property.image ? (
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                <MapPin className="text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ))}

        {/* Rating + Name + Location overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(currentProperty.rating || 5)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-white/30 text-white/30"
                }`}
              />
            ))}
          </div>
          <h4 className="font-serif font-bold text-base leading-tight">
            {currentProperty.name}
          </h4>
          <p className="flex items-center gap-1 text-[11px] text-white/80 mt-0.5">
            <MapPin className="w-3 h-3" /> {currentProperty.location}
          </p>
        </div>

        {/* Prev/Next arrows */}
        {properties.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2">
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  i === 0 ? properties.length - 1 : i - 1,
                )
              }
              className="p-1.5 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  i === properties.length - 1 ? 0 : i + 1,
                )
              }
              className="p-1.5 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div className="p-4 space-y-3">
        {/* Amenity / tag pills */}
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-[10px] font-semibold rounded-full border border-border text-muted-foreground bg-secondary/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Dot indicators */}
        {properties.length > 1 && (
          <div className="flex justify-center gap-1.5">
            {properties.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all ${
                  i === currentIndex
                    ? "w-4 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleNavigate}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-[11px] font-bold uppercase tracking-wider"
        >
          Explore Property <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewsDetails() {
  const { newsSlug } = useParams();
  const ssrData = useSsrData();
  const initialNewsDetail = ssrData?.newsDetail || null;
  const hasInitialNewsDetail =
    !!initialNewsDetail &&
    String(initialNewsDetail?.newsId || "") === String(getNewsIdFromSlug(newsSlug));
  const navigate = useNavigate();
  const id = getNewsIdFromSlug(newsSlug);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(
    hasInitialNewsDetail ? initialNewsDetail.newsItem || null : null,
  );
  const [allNews, setAllNews] = useState<NewsItem[]>(
    hasInitialNewsDetail && Array.isArray(initialNewsDetail?.allNews)
      ? initialNewsDetail.allNews
      : [],
  );
  const [dynamicProperties, setDynamicProperties] = useState<Property[]>(
    hasInitialNewsDetail && Array.isArray(initialNewsDetail?.dynamicProperties)
      ? initialNewsDetail.dynamicProperties
      : [],
  );
  const [loading, setLoading] = useState(!hasInitialNewsDetail);
  const [notFound, setNotFound] = useState(
    hasInitialNewsDetail ? !!initialNewsDetail?.notFound : false,
  );

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        if (!hasInitialNewsDetail) {
          setLoading(true);
        }
        const newsRes = await getAllNews({ page: 0, size: 100 });
        const newsList = newsRes?.data?.content || newsRes?.content || [];
        const activeNews = newsList.filter((n: NewsItem) => n.active);
        setAllNews(activeNews);

        const foundNews = activeNews.find((n: NewsItem) => n.id.toString() === id);

        if (foundNews) {
          setNewsItem(foundNews);
          const propRes = await GetAllPropertyDetails();
          const rawData = propRes?.data || propRes || [];

          const formatted = (Array.isArray(rawData) ? rawData : []).flatMap(
            (item: any) => {
              const parent = item.propertyResponseDTO;
              const listings = item.propertyListingResponseDTOS || [];
              if (!parent || !parent.isActive) return [];

              return listings
                .filter((l: any) => l.isActive)
                .map((l: any) => ({
                  id: l.id,
                  propertyId: parent.id,
                  name: parent.propertyName || "Premium Property",
                  type:
                    l.propertyType ||
                    (parent.propertyTypes && parent.propertyTypes[0]) ||
                    "Hotel",
                  location: parent.locationName || "India",
                  image: l.media?.[0]?.url || "",
                  rating: l.rating || 5,
                  highlights: (l.amenities || [])
                    .map((amenity: unknown) => getAmenityName(amenity))
                    .filter(Boolean),
                }));
            },
          );

          const targetCategory = foundNews.badgeType?.toLowerCase();
          const filtered = formatted.filter((p: Property) => {
            const pType = p.type?.toLowerCase();
            if (targetCategory === "hotel")
              return pType === "hotel" || pType === "resort" || pType === "villa";
            if (targetCategory === "restaurant")
              return pType === "restaurant" || pType === "wine & dine";
            if (targetCategory === "cafe")
              return pType === "cafe";
            return pType === targetCategory;
          });

          setDynamicProperties(filtered);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        if (!hasInitialNewsDetail) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEverything();
  }, [hasInitialNewsDetail, id]);

  useEffect(() => {
    if (!newsItem || !newsSlug) return;
    const canonicalPath = buildNewsDetailPath(newsItem);
    if (canonicalPath !== `/news/${newsSlug}`) {
      navigate(canonicalPath, { replace: true });
    }
  }, [newsItem, newsSlug, navigate]);

  const pagination = useMemo(() => {
    if (!newsItem || allNews.length === 0) return { prev: null, next: null };
    const currentIndex = allNews.findIndex((n) => n.id === newsItem.id);
    return {
      prev: currentIndex > 0 ? allNews[currentIndex - 1] : null,
      next:
        currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null,
    };
  }, [newsItem, allNews]);

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
        <Footer />
      </div>
    );

  if (notFound || !newsItem)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <h1 className="text-3xl font-bold mb-4 font-serif">
            Article Not Found
          </h1>
          <Link
            to="/news"
            className="text-primary flex items-center gap-2 font-bold"
          >
            <ArrowLeft size={16} /> Back to News
          </Link>
        </div>
        <Footer />
      </div>
    );

  const relatedNews = allNews.filter((n) => n.id !== newsItem.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <li>
                <Link
                  to="/news"
                  className="text-primary hover:opacity-80 transition-opacity"
                >
                  News
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-muted-foreground truncate max-w-[200px]">
                {newsItem.title}
              </li>
            </ol>
          </nav>
          <header className="mb-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              {newsItem.title}
            </h1>

            <div className="flex items-center justify-between pb-6 border-b border-border flex-wrap gap-4">
              {/* META INFO */}
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(newsItem.newsDate || newsItem.dateBadge)}
                </span>

                {newsItem.authorName && (
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {newsItem.authorName}
                  </span>
                )}

                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {newsItem.readTime || "5 min read"}
                </span>
              </div>

              {/* SHARE ICONS */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                >
                  <MessageCircle size={16} />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Facebook size={16} />
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all"
                >
                  <Twitter size={16} />
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all"
                >
                  <Linkedin size={16} />
                </a>

                <a
                  href={`mailto:?subject=${newsItem.title}&body=${shareUrl}`}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </header>
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 items-start">
            {/* LEFT COLUMN: SCROLLABLE CONTENT */}
            <div className="space-y-12">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={newsItem.imageUrl}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 bg-primary text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {newsItem.badgeType}
                </div>
              </div>
              <article className="max-w-3xl">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-xl md:text-2xl leading-relaxed font-serif text-foreground/90 mb-8">
                    <span className="text-7xl font-bold mr-4 float-left text-primary leading-[0.7] mt-3 select-none">
                      {newsItem.description?.charAt(0)}
                    </span>
                    {newsItem.description?.slice(1)}
                  </p>

                  {newsItem.longDesc && (
                    <div
                      className="mt-8 font-sans [&_h1]:font-serif [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:text-2xl [&_h1]:mb-3 [&_h1]:mt-8 [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:font-serif [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:mb-2 [&_h3]:mt-6 [&_p]:text-muted-foreground [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-5"
                      dangerouslySetInnerHTML={{
                        __html: newsItem.longDesc.replace(/#\w+/g, "").trim(),
                      }}
                    />
                  )}
                </div>
              </article>

              {(() => {
                // Extract #hashtags from longDesc
                const longDescTags = newsItem.longDesc
                  ? [...newsItem.longDesc.matchAll(/#(\w+)/g)].map((m) => m[1])
                  : [];

                // Merge with tags field, deduplicate
                const tagFieldTags = newsItem.tags
                  ? newsItem.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  : [];

                const allTags = [
                  ...new Set([...longDescTags, ...tagFieldTags]),
                ];

                if (allTags.length === 0) return null;

                return (
                  <div className="flex flex-wrap gap-2 pt-10 pb-6 border-b border-border max-w-3xl">
                    {allTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-4 py-1.5 bg-secondary text-muted-foreground text-xs rounded-full font-bold uppercase tracking-wider"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                );
              })()}
              {/* SHARE */}
              <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-3xl">
                <h4 className="font-serif font-bold text-xl">
                  Share this article
                </h4>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}`}
                    target="_blank"
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Twitter size={20} />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a
                    href={`mailto:?subject=${newsItem.title}&body=${shareUrl}`}
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>
              {/* PAGINATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-3xl">
                {pagination.prev ? (
                  <Link
                    to={buildNewsDetailPath(pagination.prev)}
                    className="group flex items-center gap-5 p-6 border border-border rounded-3xl hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronLeft className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        Previous Article
                      </p>
                      <h5 className="font-serif font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {pagination.prev.title}
                      </h5>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {pagination.next ? (
                  <Link
                    to={buildNewsDetailPath(pagination.next)}
                    className="group flex items-center justify-between gap-5 p-6 border border-border rounded-3xl hover:border-primary/50 transition-all hover:shadow-lg text-right"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        Next Article
                      </p>
                      <h5 className="font-serif font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {pagination.next.title}
                      </h5>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY SIDEBAR */}
            <aside className="sticky top-32 space-y-12">
              {/* Properties Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-xl uppercase tracking-tighter">
                    Explore {newsItem.badgeType}s
                  </h4>
                  <div className="w-12 h-0.5 bg-primary/30" />
                </div>
                <PropertiesSlider properties={dynamicProperties} />
              </div>
              {/* About the Author */}
              {newsItem.authorName && (
                <div className="border border-border rounded-2xl p-5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    About the Author
                  </p>

                  {/* Avatar + Name Row */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-base leading-tight">
                        {newsItem.authorName}
                      </p>
                      {newsItem.authorDescription?.includes("|") && (
                        <p className="text-xs text-primary font-semibold mt-0.5">
                          {newsItem.authorDescription.split("|")[0]?.trim()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {newsItem.authorDescription && (
                    <>
                      <div className="border-t border-border" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {newsItem.authorDescription.includes("|")
                          ? newsItem.authorDescription.split("|")[1]?.trim()
                          : newsItem.authorDescription}
                      </p>
                    </>
                  )}
                </div>
              )}
              {/* Related News */}
              {relatedNews.length > 0 && (
                <div className="space-y-6">
                  <h4 className="font-serif font-bold text-xl border-l-4 border-primary pl-4 uppercase tracking-tighter">
                    Related News
                  </h4>
                  <div className="space-y-6">
                    {relatedNews.map((item) => (
                      <Link
                        key={item.id}
                        to={buildNewsDetailPath(item)}
                        className="flex gap-4 group"
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-border">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h5>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                            {formatDate(item.newsDate || item.dateBadge)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>{" "}
          {/* ← closes grid */}
          {/* Comments — full width, below the grid */}
          <div className="mt-12 max-w-3xl">
            <NewsComment newsId={newsItem.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
