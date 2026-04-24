import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { siteContent } from "@/data/siteContent";

import "swiper/css";

const cafeNewsItems = [
  {
    id: 1,
    category: "Cafe",
    title: "Kennedia Launches A New Single-Origin Coffee Program",
    description: "The cafe introduces rotating beans, guided tasting notes, and brew options designed around a slower specialty format.",
    dateBadge: "2026-02-21",
    badgeType: "Press Release",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-single-origin-coffee-program",
    imageUrl: siteContent.images.cafes.minimalist.src,
  },
  {
    id: 2,
    category: "Cafe",
    title: "High Tea Lounge Format Expands With Weekend Dessert Service",
    description: "New tea towers, plated patisserie, and lounge sets extend the cafe into a more elevated afternoon experience.",
    dateBadge: "2026-01-18",
    badgeType: "Feature",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-high-tea-lounge-expansion",
    imageUrl: siteContent.images.cafes.highTea.src,
  },
  {
    id: 3,
    category: "Cafe",
    title: "Neighbourhood Events Calendar Adds Acoustic Nights And Workshops",
    description: "Kennedia builds a lighter events rhythm around live sessions, tasting tables, and intimate community gatherings.",
    dateBadge: "2025-12-09",
    badgeType: "Update",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-cafe-events-calendar",
    imageUrl: siteContent.images.cafes.garden.src,
  },
];

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
        <img src={item.imageUrl} alt={item.title} className="block h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105" style={{ maxHeight: "280px", minHeight: "140px" }} />
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

export default function CafeNewsSection() {
  const swiperRef = useRef(null);

  return (
    <section id="news" className="relative overflow-hidden bg-[#ECECE8] py-12 md:py-16 dark:bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-foreground md:text-3xl">Cafe News & Press</h2>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/news" className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5 md:flex">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="flex gap-2">
              <button onClick={() => swiperRef.current?.slidePrev()} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => swiperRef.current?.slideNext()} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          loop={false}
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
          {cafeNewsItems.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              <NewsCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
