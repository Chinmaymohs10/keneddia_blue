import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Calendar, Clock,
  Facebook, Twitter, Linkedin, Mail,
  ChevronLeft, ChevronRight,
  MapPin, Loader2, MessageCircle, ExternalLink, Star
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getAllNews, GetAllPropertyDetails } from "@/Api/Api";
import { toast } from "react-hot-toast";

// Types
interface NewsItem {
  id: number;
  category: string;
  title: string;
  description: string;
  badgeType: string; // This holds "Hotel" or "Restaurant"
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
      setCurrentIndex(prev => (prev === properties.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [properties.length]);

  if (properties.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-2xl h-[350px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <MapPin className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-serif">Explore more properties soon.</p>
      </div>
    );
  }

  const currentProperty = properties[currentIndex];

  const handleNavigate = () => {
    const type = currentProperty.type?.toLowerCase();
    if (type === "restaurant" || type === "cafe" || type === "wine & dine") {
      navigate(`/resturant/${currentProperty.propertyId}`);
    } else {
      navigate(`/hotels/${currentProperty.propertyId}`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-full max-h-[400px] flex flex-col">
      <div className="relative flex-1 overflow-hidden min-h-[220px]">
        {properties.map((property, i) => (
          <div 
            key={`${property.id}-${i}`} 
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {property.image ? (
                <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                    <MapPin className="text-muted-foreground/40" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ))}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold">{currentProperty.rating || "5.0"}</span>
          </div>
          <h4 className="font-serif font-bold text-lg leading-tight">{currentProperty.name}</h4>
          <p className="text-[10px] text-white/80 flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" /> {currentProperty.location}
          </p>
        </div>

        {properties.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2">
            <button onClick={() => setCurrentIndex(i => i === 0 ? properties.length - 1 : i - 1)} className="p-1 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentIndex(i => i === properties.length - 1 ? 0 : i + 1)} className="p-1 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40"><ChevronRight size={16}/></button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {currentProperty.highlights.length > 0 ? (
            currentProperty.highlights.slice(0, 2).map((h, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium uppercase">{h}</span>
            ))
          ) : (
            <span className="text-[9px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full font-medium uppercase">Premium Property</span>
          )}
        </div>
        <button 
          onClick={handleNavigate}
          className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          Explore Now <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewsDetails() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [dynamicProperties, setDynamicProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        setLoading(true);
        // 1. Fetch News
        const newsRes = await getAllNews({ page: 0, size: 100 });
        const newsList = newsRes?.data?.content || newsRes?.content || [];
        const activeNews = newsList.filter((n: NewsItem) => n.active);
        setAllNews(activeNews);

        const foundNews = activeNews.find((n: NewsItem) => n.slug === id || n.id.toString() === id);
        
        if (foundNews) {
          setNewsItem(foundNews);
          
          // 2. Fetch Properties
          const propRes = await GetAllPropertyDetails();
          const rawData = propRes?.data || propRes || [];
          
          // Data Transformation
          const formatted = (Array.isArray(rawData) ? rawData : []).flatMap((item: any) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            
            // Only process if parent exists and is active
            if (!parent || !parent.isActive) return [];

            return listings
              .filter((l: any) => l.isActive)
              .map((l: any) => ({
                id: l.id,
                propertyId: parent.id,
                name: parent.propertyName || "Premium Property",
                // Fallback: If listing propertyType is null, use parent's first propertyType
                type: l.propertyType || (parent.propertyTypes && parent.propertyTypes[0]) || "Hotel",
                location: parent.locationName || "India",
                image: l.media?.[0]?.url || "",
                rating: l.rating || 5,
                highlights: l.amenities || [],
              }));
          });

          // 3. Strict Filtering Logic based on badgeType
          const targetCategory = foundNews.badgeType?.toLowerCase(); // "hotel" or "restaurant"
          
          const filtered = formatted.filter((p: Property) => {
            const pType = p.type?.toLowerCase();
            
            if (targetCategory === "hotel") {
              return pType === "hotel" || pType === "resort" || pType === "villa";
            }
            if (targetCategory === "restaurant") {
              return pType === "restaurant" || pType === "cafe" || pType === "wine & dine";
            }
            return true; 
          });

          setDynamicProperties(filtered);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEverything();
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
        <h1 className="text-3xl font-bold mb-4 font-serif">Article Not Found</h1>
        <Link to="/news" className="text-primary flex items-center gap-2 font-bold"><ArrowLeft size={16}/> Back to News</Link>
      </div><Footer />
    </div>
  );

  const relatedNews = allNews.filter(n => n.id !== newsItem.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/news" className="text-primary hover:opacity-80 transition-opacity">News</Link></li>
              <li className="text-muted-foreground">/</li>
              <li className="text-muted-foreground truncate max-w-[200px]">{newsItem.title}</li>
            </ol>
          </nav>

          <header className="mb-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              {newsItem.title}
            </h1>
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-foreground pb-6 border-b border-border">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {formatDate(newsItem.newsDate || newsItem.dateBadge)}</span>
              {newsItem.authorName && <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {newsItem.authorName}</span>}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8 mb-12">
            {/* Main Image */}
            <div className="relative aspect-video lg:aspect-auto lg:h-[450px] rounded-3xl overflow-hidden shadow-2xl">
                <img src={newsItem.imageUrl} alt={newsItem.title} className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6 bg-primary text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {newsItem.badgeType}
                </div>
            </div>

            {/* Sidebar Slider */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="font-serif font-bold text-xl">Explore {newsItem.badgeType}s</h4>
                 <div className="w-12 h-0.5 bg-primary/30" />
              </div>
              <div className="flex-1 min-h-[400px]">
                <PropertiesSlider properties={dynamicProperties} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
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
                    className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{ __html: newsItem.longDesc }}
                  />
                )}
              </div>
            </article>

            {/* Related Sidebar */}
            <aside className="space-y-12">
               {relatedNews.length > 0 && (
                 <div className="space-y-6">
                   <h4 className="font-serif font-bold text-xl border-l-4 border-primary pl-4">Related News</h4>
                   <div className="space-y-8">
                     {relatedNews.map((item) => (
                       <Link key={item.id} to={`/news/${item.slug || item.id}`} className="flex gap-4 group">
                         <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         </div>
                         <div className="space-y-1">
                           <h5 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.title}</h5>
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{formatDate(item.newsDate || item.dateBadge)}</p>
                         </div>
                       </Link>
                     ))}
                   </div>
                 </div>
               )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}