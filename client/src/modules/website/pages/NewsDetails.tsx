import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, User, Calendar, Clock,
  Facebook, Twitter, Linkedin, Mail,
  ChevronLeft, ChevronRight,
  MapPin, Loader2, Send, MessageCircle, ExternalLink, Star
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getAllNews } from "@/Api/Api";
import { toast } from "react-hot-toast";

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
  ctaLink?: string;
  ctaText?: string;
}

// ============================================
// PROPERTIES DATA
// ============================================
interface Property {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  link: string;
  highlights: string[];
}

const HOTEL_PROPERTIES: Property[] = [
  {
    id: "kennedia-blu-maldives",
    name: "Kennedia Blu Maldives",
    location: "North Malé Atoll, Maldives",
    image: "/images/hotels/maldives.jpg",
    rating: 5,
    link: "/hotels/kennedia-blu-maldives",
    highlights: ["Overwater Villas", "Private Beach", "Spa & Wellness"]
  },
  {
    id: "kennedia-grand-paris",
    name: "Kennedia Grand Paris",
    location: "8th Arrondissement, Paris",
    image: "/images/hotels/paris.jpg",
    rating: 5,
    link: "/hotels/kennedia-grand-paris",
    highlights: ["Eiffel Tower Views", "Michelin Restaurant", "Art Collection"]
  },
  {
    id: "kennedia-resort-bali",
    name: "Kennedia Resort Bali",
    location: "Ubud, Bali, Indonesia",
    image: "/images/hotels/bali.jpg",
    rating: 5,
    link: "/hotels/kennedia-resort-bali",
    highlights: ["Rice Terrace Views", "Yoga Retreat", "Infinity Pool"]
  },
  {
    id: "kennedia-palace-dubai",
    name: "Kennedia Palace Dubai",
    location: "Palm Jumeirah, Dubai",
    image: "/images/hotels/dubai.jpg",
    rating: 5,
    link: "/hotels/kennedia-palace-dubai",
    highlights: ["Private Beach", "Rooftop Bar", "Butler Service"]
  }
];

// ============================================
// PROPERTIES SLIDER COMPONENT
// ============================================
const PropertiesSlider = ({ properties }: { properties: Property[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev === properties.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [properties.length]);

  const currentProperty = properties[currentIndex];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-full max-h-[400px] flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        {properties.map((property, i) => (
          <div 
            key={property.id} 
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ))}
        
        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(currentProperty.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h4 className="font-serif font-bold text-lg">{currentProperty.name}</h4>
          <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {currentProperty.location}
          </p>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentIndex(i => i === 0 ? properties.length - 1 : i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button 
          onClick={() => setCurrentIndex(i => i === properties.length - 1 ? 0 : i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Highlights */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {currentProperty.highlights.map((highlight, i) => (
            <span key={i} className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full">
              {highlight}
            </span>
          ))}
        </div>
        <Link 
          to={currentProperty.link}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Explore Property <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {properties.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const Breadcrumb = ({ items }: { items: { name: string; url: string }[] }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <li key={item.url} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">/</span>}
          {index === items.length - 1 ? (
            <span className="text-muted-foreground truncate max-w-[200px]">{item.name}</span>
          ) : (
            <Link to={item.url} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              {index === 0 && <ArrowLeft className="w-4 h-4" />} {item.name}
            </Link>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const SocialShareButtons = ({ title, compact = false }: { title: string; compact?: boolean }) => {
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (platform === 'email') window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
    else window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex ${compact ? 'items-center gap-1' : 'flex-col sm:flex-row sm:items-center justify-between gap-4'}`}>
      {!compact && <span className="font-serif font-bold text-lg">Share this article</span>}
      <div className="flex gap-2">
        {['facebook', 'twitter', 'linkedin', 'email'].map((p) => (
          <button 
            key={p} 
            onClick={() => handleShare(p)} 
            className={`${compact ? 'p-1.5' : 'p-2.5 border border-border'} rounded-full hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground`}
          >
            {p === 'facebook' && <Facebook className="w-4 h-4" />}
            {p === 'twitter' && <Twitter className="w-4 h-4" />}
            {p === 'linkedin' && <Linkedin className="w-4 h-4" />}
            {p === 'email' && <Mail className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};

// Disabled Comment Section
const CommentsSection = ({ count = 0 }: { count?: number }) => (
  <div className="mt-12 pt-8 border-t border-border opacity-60">
    <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-2">
      <MessageCircle className="w-6 h-6 text-primary" />
      Comments ({count})
    </h3>
    <div className="bg-secondary/20 p-6 rounded-xl border border-dashed border-border text-center">
      <p className="text-sm text-muted-foreground italic">Comments are temporarily disabled for this article.</p>
      <div className="mt-4 flex gap-4 max-w-xl mx-auto">
         <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
         <div className="flex-1 bg-muted/30 h-12 rounded-lg" />
      </div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewsDetails() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        setLoading(true);
        const response = await getAllNews({ page: 0, size: 100 });
        const source = response?.data?.content || response?.content || response || [];
        const activeNews = source.filter((n: NewsItem) => n.active);
        setAllNews(activeNews);

        const found = activeNews.find((n: NewsItem) => n.slug === id || n.id.toString() === id);
        if (found) setNewsItem(found);
        else setNotFound(true);
      } catch (error) {
        toast.error("Failed to load article");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetails();
  }, [id]);

  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A";

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div><Footer />
    </div>
  );

  if (notFound || !newsItem) return (
    <div className="min-h-screen flex flex-col">
      <Navbar /><div className="flex-1 flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <Link to="/news" className="text-primary flex items-center gap-2"><ArrowLeft size={16}/> Back to News</Link>
      </div><Footer />
    </div>
  );

  const relatedNews = allNews.filter(n => n.id !== newsItem.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <Breadcrumb items={[{ name: "News", url: "/news" }, { name: newsItem.title, url: "#" }]} />

          <header className="mb-8 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-[1.15]">
              {newsItem.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              <div className="flex items-center gap-4 md:gap-6">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {formatDate(newsItem.newsDate || newsItem.dateBadge)}</span>
                {newsItem.authorName && <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {newsItem.authorName}</span>}
                {newsItem.readTime && <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {newsItem.readTime}</span>}
              </div>
              <SocialShareButtons title={newsItem.title} compact />
            </div>
          </header>

          {/* NEW LAYOUT: Image (70% width) + Properties Slider (30% width) */}
          <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 mb-10">
            {/* Left: Article Image */}
            <div className="h-full">
              <div className="relative w-full max-h-[400px] h-full rounded-2xl overflow-hidden shadow-xl group">
                <img src={newsItem.imageUrl} alt={newsItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase">{newsItem.badgeType}</div>
              </div>
            </div>

            {/* Right: Properties Slider */}
            <div className="lg:pl-2 h-full flex flex-col">
              <h4 className="font-serif font-bold text-lg mb-4 px-1">Explore Our Properties</h4>
              <div className="flex-1">
                <PropertiesSlider properties={HOTEL_PROPERTIES} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
            <article className="max-w-3xl overflow-hidden"> 
              {/* Added overflow-hidden to contain floated dropcap */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-xl md:text-2xl leading-relaxed font-serif text-foreground/90 mb-8 
                  after:content-[''] after:table after:clear-both">
                  {/* Dropcap logic with better spacing to prevent overlap */}
                  <span className="text-6xl md:text-7xl font-bold mr-3 float-left text-primary leading-[0.8] mt-2 select-none">
                    {newsItem.description.charAt(0)}
                  </span>
                  {newsItem.description.slice(1)}
                </p>

                {newsItem.longDesc && (
                  <div 
                    className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: newsItem.longDesc }}
                  />
                )}
              </div>

              {/* Tags and Navigation */}
              <div className="mt-12 pt-8 border-t border-border">
                {newsItem.tags && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {newsItem.tags.split(',').map(tag => (
                      <span key={tag} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer">#{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <SocialShareButtons title={newsItem.title} />
              </div>

              <CommentsSection />
            </article>

            <aside className="space-y-10 lg:sticky lg:top-28 h-fit">
               {relatedNews.length > 0 && (
                 <div className="space-y-6">
                   <h4 className="font-serif font-bold text-xl border-l-4 border-primary pl-3">Related Stories</h4>
                   <div className="space-y-6">
                     {relatedNews.map((item) => (
                       <Link key={item.id} to={`/news/${item.slug || item.id}`} className="flex gap-4 group items-start">
                         <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         </div>
                         <div className="space-y-1">
                           <h5 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h5>
                           <p className="text-[10px] text-muted-foreground uppercase">{formatDate(item.newsDate)}</p>
                         </div>
                       </Link>
                     ))}
                   </div>
                 </div>
               )}

               <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                 <h4 className="font-serif font-bold text-lg mb-2">Newsletter</h4>
                 <p className="text-xs text-muted-foreground mb-4">Subscribe for the latest hospitality insights.</p>
                 <div className="flex gap-2">
                   <input type="email" placeholder="Email" className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                   <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90"><Mail size={18} /></button>
                 </div>
               </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}