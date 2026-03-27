import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";

const restaurantNewsItems = [
  {
    id: 1,
    category: "Restaurant",
    title: "Kennedia Introduces A Curated Seasonal Tasting Menu",
    description:
      "The restaurant unveils a new chef-led tasting experience built around regional produce, plated courses, and elevated evening service.",
    dateBadge: "2026-02-18",
    badgeType: "Press Release",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-seasonal-tasting-menu",
    imageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant",
  },
  {
    id: 2,
    category: "Restaurant",
    title: "Weekend Brunch Program Expands With Live Kitchen Counters",
    description:
      "A refreshed brunch format brings interactive stations, dessert theatre, and family-style sharing platters to the weekend offering.",
    dateBadge: "2026-01-26",
    badgeType: "Feature",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-weekend-brunch-program",
    imageUrl:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant",
  },
  {
    id: 3,
    category: "Restaurant",
    title: "Private Dining Experiences Gain New Celebration Packages",
    description:
      "Kennedia adds compact celebration formats for anniversaries, birthdays, and executive dining with pre-set menus and decor options.",
    dateBadge: "2025-12-14",
    badgeType: "Update",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-private-dining-packages",
    imageUrl:
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant",
  },
  {
    id: 4,
    category: "Restaurant",
    title: "Signature Beverage Pairings Roll Out Across Evening Service",
    description:
      "A new pairing program highlights house beverages and chef recommendations designed to complement small plates and signature mains.",
    dateBadge: "2025-11-03",
    badgeType: "Editorial",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-signature-beverage-pairings",
    imageUrl:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant",
  },
];

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
        {/* <span className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Updates & Recognition
        </span> */}
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
      <div className="relative w-full overflow-hidden bg-black">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="block h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
          style={{ maxHeight: "280px", minHeight: "140px" }}
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

export default function RestaurantNewsSection() {
  const swiperRef = useRef(null);
  const newsItems = restaurantNewsItems.filter(
    (item) => item.type === "Restaurant",
  );

  return (
    <section
      id="restaurant-news"
      className="relative overflow-hidden bg-background py-12 md:py-16"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          title="Restaurant News & Press"
          onPrev={() => swiperRef.current?.slidePrev()}
          onNext={() => swiperRef.current?.slideNext()}
        />

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
      </div>
    </section>
  );
}
