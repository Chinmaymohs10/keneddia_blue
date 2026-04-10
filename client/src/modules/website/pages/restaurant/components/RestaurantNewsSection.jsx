import { useRef, useState, useEffect } from "react";
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
import { Autoplay, Navigation } from "swiper/modules";

import { getAllNews, getPropertyTypes } from "@/Api/Api";
import { buildNewsDetailPath } from "@/modules/website/utils/newsSlug";
import "swiper/css";

const FALLBACK_NEWS_ITEMS = [
  {
    id: "fallback-news-1",
    category: "PRESS",
    title: "Kennedia Introduces A Curated Seasonal Tasting Menu",
    description:
      "The restaurant unveils a new chef-led tasting experience built around regional produce and elevated evening service.",
    dateBadge: "2026-02-18",
    badgeType: "Restaurant",
    ctaText: "Read Story",
    ctaLink: "/news",
    imageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fallback-news-2",
    category: "NEWS",
    title: "Weekend Brunch Program Expands With Live Kitchen Counters",
    description:
      "A refreshed brunch format brings interactive stations and family-style sharing platters.",
    dateBadge: "2026-01-26",
    badgeType: "Restaurant",
    ctaText: "Read Story",
    ctaLink: "/news",
    imageUrl:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  },
];

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isRestaurantType = (value = "") =>
  ["restaurant", "resturant"].includes(normalize(value));

const STYLE_CONFIG = {
  navigation: {
    buttonSize: "w-8 h-8",
    iconSize: "w-4 h-4",
  },
};

function NavBtn({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`${STYLE_CONFIG.navigation.buttonSize} flex items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function SectionHeader({ title, onPrev, onNext }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-serif text-foreground md:text-3xl">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/news"
          className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5 md:flex"
        >
          View All <ArrowUpRight className="h-4 w-4" />
        </Link>
        <div className="flex gap-2">
          <NavBtn
            onClick={onPrev}
            icon={<ChevronLeft className={STYLE_CONFIG.navigation.iconSize} />}
            label="Previous"
          />
          <NavBtn
            onClick={onNext}
            icon={<ChevronRight className={STYLE_CONFIG.navigation.iconSize} />}
            label="Next"
          />
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.dateBadge).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/50">
      <div className="relative h-[220px] w-full overflow-hidden bg-black md:h-[240px]">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {date}
          </span>
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
          <p
            className={`text-sm leading-relaxed text-muted-foreground transition-all duration-300 ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {item.description}
          </p>

          {item.description && item.description.length > 100 && (
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
          <Link
            to={item.ctaLink}
            className="group/link inline-flex items-center gap-1.5 pt-2 text-xs font-bold text-foreground transition-colors hover:text-primary"
          >
            {item.ctaText}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantNewsSection({ initialNews }) {
  const swiperRef = useRef(null);
  const ssrLoaded = Array.isArray(initialNews) && initialNews.length > 0;
  const [newsItems, setNewsItems] = useState(ssrLoaded ? initialNews : FALLBACK_NEWS_ITEMS);
  const [loading, setLoading] = useState(!ssrLoaded);

  useEffect(() => {
    if (ssrLoaded) return;
    const fetchRestaurantNews = async () => {
      try {
        setLoading(true);

        const [typesResponse, newsResponse] = await Promise.all([
          getPropertyTypes(),
          getAllNews({ category: "", page: 0, size: 50 }),
        ]);

        const propertyTypes = typesResponse?.data || typesResponse || [];
        const restaurantType = Array.isArray(propertyTypes)
          ? propertyTypes.find(
              (type) => type?.isActive && isRestaurantType(type?.typeName),
            )
          : null;
        const restaurantTypeId = restaurantType?.id
          ? Number(restaurantType.id)
          : null;

        const rawNews =
          newsResponse?.data?.content ||
          newsResponse?.content ||
          newsResponse?.data ||
          newsResponse ||
          [];

        const mappedNews = (Array.isArray(rawNews) ? rawNews : [])
          .filter((item) => {
            const badgeName =
              item?.badgeTypeName ||
              item?.badgeType ||
              item?.badge?.typeName ||
              item?.badge?.name ||
              "";
            const byName = isRestaurantType(badgeName);
            const byId =
              restaurantTypeId !== null &&
              Number(item?.badgeTypeId) === restaurantTypeId;

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
              item?.newsDate ||
              item?.dateBadge ||
              new Date().toISOString().split("T")[0],
            badgeType:
              item?.badgeTypeName ||
              item?.badgeType ||
              item?.badge?.typeName ||
              "Restaurant",
            ctaText: item?.ctaText || "Read Story",
            ctaLink: buildNewsDetailPath(item),
            imageUrl:
              item?.imageUrl ||
              item?.image ||
              item?.media?.[0]?.url ||
              FALLBACK_NEWS_ITEMS[0].imageUrl,
          }));

        setNewsItems(mappedNews.length > 0 ? mappedNews : FALLBACK_NEWS_ITEMS);
      } catch (error) {
        console.error("Failed to load restaurant news", error);
        setNewsItems(FALLBACK_NEWS_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantNews();
  }, [ssrLoaded]);

  return (
    <section
      id="news"
      className="relative overflow-hidden bg-background py-12 md:py-16"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          title="Restaurant News & Press"
          onPrev={() => swiperRef.current?.slidePrev()}
          onNext={() => swiperRef.current?.slideNext()}
        />

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            loop={newsItems.length > 3}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="w-full pb-4"
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
