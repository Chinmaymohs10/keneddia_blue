import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { getAllNews, getPropertyTypes } from "@/Api/Api";
import { buildNewsDetailPath } from "@/modules/website/utils/newsSlug";

import "swiper/css";
import "swiper/css/pagination";

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isWineType = (value = "") =>
  ["wine", "wines", "wine and dine", "wine & dine", "winedine"].includes(
    normalize(value),
  );

const mapNews = (rawNews, wineTypeId) =>
  (Array.isArray(rawNews) ? rawNews : [])
    .filter((item) => {
      const badgeName =
        item?.badgeTypeName ||
        item?.badgeType ||
        item?.badge?.typeName ||
        item?.badge?.name ||
        "";
      const byName = isWineType(badgeName);
      const byId = wineTypeId != null && Number(item?.badgeTypeId) === wineTypeId;
      return item?.active === true && (byName || byId);
    })
    .sort((a, b) => {
      const dateA = new Date(a?.newsDate || a?.dateBadge || a?.createdAt || 0);
      const dateB = new Date(b?.newsDate || b?.dateBadge || b?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 6)
    .map((item) => ({
      id: item?.id,
      category: item?.category || "NEWS",
      title: item?.title || "News",
      description: item?.description || "",
      dateBadge:
        item?.newsDate || item?.dateBadge || new Date().toISOString().split("T")[0],
      badgeType:
        item?.badgeTypeName || item?.badgeType || item?.badge?.typeName || "Wine",
      ctaText: item?.ctaText || "Read Story",
      ctaLink: buildNewsDetailPath(item),
      imageUrl: item?.imageUrl || item?.image || item?.media?.[0]?.url || "",
    }));

function NewsCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.dateBadge).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/50">
      <div className="relative w-full overflow-hidden bg-black">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="block h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
          style={{ maxHeight: "280px", minHeight: "140px" }}
        />
        <div className="absolute left-3 top-3">
          <span className="rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">{date}</span>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
          {item.category} • {item.badgeType}
        </div>

        <h3 className="mb-3 line-clamp-2 text-lg font-serif font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
          {item.title}
        </h3>

        <div className="flex-grow">
          <p className={`text-sm leading-relaxed text-muted-foreground transition-all duration-300 ${expanded ? "" : "line-clamp-2"}`}>
            {item.description}
          </p>

          {item.description.length > 100 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-3 border-t border-border/50 pt-2">
          <Link to={item.ctaLink} className="group/link inline-flex items-center gap-1.5 pt-2 text-xs font-bold text-foreground transition-colors hover:text-primary">
            {item.ctaText}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WineNewsSection({ initialNews }) {
  const swiperRef = useRef(null);
  const ssrLoaded = Array.isArray(initialNews) && initialNews.length > 0;
  const [newsItems, setNewsItems] = useState(ssrLoaded ? initialNews : []);
  const [loading, setLoading] = useState(!ssrLoaded);

  useEffect(() => {
    if (ssrLoaded) return;

    const fetchWineNews = async () => {
      try {
        setLoading(true);
        const [typesResponse, newsResponse] = await Promise.all([
          getPropertyTypes(),
          getAllNews({ category: "", page: 0, size: 50 }),
        ]);

        const propertyTypes = typesResponse?.data || typesResponse || [];
        const wineType = Array.isArray(propertyTypes)
          ? propertyTypes.find((type) => type?.isActive && isWineType(type?.typeName))
          : null;
        const wineTypeId = wineType?.id ? Number(wineType.id) : null;

        const rawNews =
          newsResponse?.data?.content ||
          newsResponse?.content ||
          newsResponse?.data ||
          newsResponse ||
          [];

        setNewsItems(mapNews(rawNews, wineTypeId));
      } catch (error) {
        console.error("Failed to load wine news", error);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWineNews();
  }, [ssrLoaded]);

  if (!loading && newsItems.length === 0) return null;

  return (
    <section id="news" className="relative overflow-hidden bg-[#ECECE8] py-12 md:py-16 dark:bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-foreground md:text-3xl">Wine News & Press</h2>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/news" className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5 sm:flex">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="hidden sm:flex gap-2">
              <button onClick={() => swiperRef.current?.slidePrev()} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => swiperRef.current?.slideNext()} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={newsItems.length > 3}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="w-full !pb-10 [--swiper-pagination-color:#8B1A2A] dark:[--swiper-pagination-color:#c9a25a] [--swiper-pagination-bullet-inactive-color:#a8a29e] dark:[--swiper-pagination-bullet-inactive-color:#ffffff] dark:[--swiper-pagination-bullet-inactive-opacity:0.3]"
          >
            {newsItems.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <NewsCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
