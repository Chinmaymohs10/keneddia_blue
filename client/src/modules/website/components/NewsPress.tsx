import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getAllNews } from "@/Api/Api";
import "swiper/css";

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROUTES = {
  newsDetail: (id: number | string) => `/news/${id}`,
} as const;

const STYLE_CONFIG = {
  aspectRatio: "4/3" as const,
  navigation: {
    buttonSize: "w-8 h-8",
    iconSize: "w-4 h-4",
  },
} as const;

const TEXT_CONTENT = {
  header: {
    badge: "Updates & Recognition",
    category: "Press",
  },
  aria: {
    previous: "Previous",
    next: "Next",
  },
} as const;

interface NewsItem {
  id: number;
  category: string;
  title: string;
  description: string;
  dateBadge: string;
  badgeType: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  active: boolean;
}

export default function NewsPress() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Call API with required params
        const res = await getAllNews({ category: "", page: 0, size: 10 });
        
        // 1. Extract data from response
        const data = res?.data?.content || res?.content || [];
        
        // 2. Sort by date (descending) and Slice to latest 6
        const processedData = Array.isArray(data) 
          ? [...data]
              .sort((a, b) => new Date(b.dateBadge).getTime() - new Date(a.dateBadge).getTime())
              .slice(0, 6) 
          : [];

        setNewsItems(processedData);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (newsItems.length === 0) return null;

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  return (
    <section id="news" className="py-12 md:py-16 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          title="News & Press"
          onPrev={handlePrev}
          onNext={handleNext}
        />

        <NewsCarousel items={newsItems} swiperRef={swiperRef} />
      </div>
    </section>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SectionHeader({ title, onPrev, onNext }: { title: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <span className="text-xs font-bold text-primary tracking-[0.25em] uppercase block mb-2">
          {TEXT_CONTENT.header.badge}
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="#" 
          className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
          View All <ArrowUpRight className="w-4 h-4" />
        </Link>
        <div className="flex gap-2">
          <NavBtn onClick={onPrev} icon={<ChevronLeft className={STYLE_CONFIG.navigation.iconSize} />} label={TEXT_CONTENT.aria.previous} />
          <NavBtn onClick={onNext} icon={<ChevronRight className={STYLE_CONFIG.navigation.iconSize} />} label={TEXT_CONTENT.aria.next} />
        </div>
      </div>
    </div>
  );
}

function NavBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`${STYLE_CONFIG.navigation.buttonSize} rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function NewsCarousel({ items, swiperRef }: { items: NewsItem[]; swiperRef: any }) {
  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      spaceBetween={24}
      slidesPerView={1}
      // Loop only if we have more items than shown slides
      loop={items.length > 3}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      className="w-full pb-4"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id} className="!h-auto">
          <NewsCard item={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const date = new Date(item.dateBadge).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors duration-300">
      <div className={`relative aspect-[${STYLE_CONFIG.aspectRatio}] overflow-hidden`}>
        <OptimizedImage
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded">
            {date}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2 text-xs font-bold text-primary tracking-wider uppercase">
          {item.category} • {item.badgeType}
        </div>

        <h3 className="text-lg font-serif font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-grow">
          {item.description}
        </p>

        <div className="mt-auto pt-2 border-t border-border/50">
          <Link
            to={`#`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors group/link pt-3"
          >
            {item.ctaText}
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}