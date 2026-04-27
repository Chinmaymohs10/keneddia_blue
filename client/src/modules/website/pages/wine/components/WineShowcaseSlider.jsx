import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coffee,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/data/siteContent";
import img from '../../../../../assets/wine_images/news.jpeg'
import "swiper/css";

const EVENTS = [
  {
    id: "event-1",
    type: "Event",
    title: "Acoustic Evenings & Slow Sips",
    description: "Intimate live sessions paired with curated brews and dessert tastings.",
    image: siteContent.images.cafes.garden.src,
    date: "Every Friday · 7 PM",
    location: "Garden Terrace",
    slug: "acoustic-evenings",
    icon: Calendar,
  },
  {
    id: "event-2",
    type: "Event",
    title: "Latte Art Workshops",
    description: "Interactive Wine sessions focused on pouring techniques, beans, and tasting notes.",
    image: siteContent.images.cafes.library.src,
    date: "2nd Saturday · 11 AM",
    location: "Brew Lab",
    slug: "latte-art-workshops",
    icon: Coffee,
  },
  {
    id: "event-3",
    type: "Event",
    title: "Sunday Jazz Brunch",
    description: "Live jazz quartet, bottomless cold brews, and a rotating brunch menu every week.",
    image: siteContent.images.cafes.parisian.src,
    date: "Every Sunday · 10 AM",
    location: "Main Hall",
    slug: "sunday-jazz-brunch",
    icon: Calendar,
  },
];

const WINE_NEWS_ITEMS = [
  {
    id: 1,
    category: "Wine",
    title: "Kennedia Expands Its Premium Labels And Cellar Selection",
    description:
      "The wine program adds new premium pours, reserve bottles, and sommelier-led recommendations across the dining experience.",
    dateBadge: "2026-02-21",
    badgeType: "Press Release",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-wine-cellar-selection",
    imageUrl: img,
  },
  {
    id: 2,
    category: "Wine",
    title: "Weekend Wine Pairing Menus Introduced For Curated Dining",
    description:
      "Guests can now explore chef-led pairing menus with selected reds, whites, and sparkling labels through the weekend service.",
    dateBadge: "2026-01-18",
    badgeType: "Feature",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-weekend-wine-pairings",
    imageUrl: siteContent.images.cafes.highTea.src,
  },
  {
    id: 3,
    category: "Wine",
    title: "Private Tasting Calendar Launches With Seasonal Highlights",
    description:
      "A new tasting calendar brings guided sessions, limited-label showcases, and intimate hosted evenings to the wine floor.",
    dateBadge: "2025-12-09",
    badgeType: "Update",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-private-wine-tastings",
    imageUrl: siteContent.images.cafes.garden.src,
  },
];

// ─── Original full ShowcaseCard (unchanged) ────────────────────────────────────
function ShowcaseCard({ item }) {
  return (
    <div className="group relative flex h-[460px] cursor-pointer flex-col overflow-hidden rounded-xl bg-card shadow-sm dark:border dark:border-white/10 dark:bg-[#14090d]">
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      <div className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {item.type}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
        <div className="flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          <span>{item.location}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-4">
        <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-white">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-white/70">
          <Calendar size={11} className="text-primary" />
          <span className="text-[11px] font-medium italic uppercase">{item.date}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] italic text-white/65">
          {item.description}
        </p>
        <Link to={`/Wine/${item.slug}`} className="mt-4">
          <Button className="h-auto w-full rounded-lg border border-white/20 bg-white/15 py-2.5 text-xs font-bold text-white shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-black">
            Explore <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Original EventsColumn (unchanged) ────────────────────────────────────────
function EventsColumn({ title, icon: Icon, items }) {
  const [swiper, setSwiper] = useState(null);

  // return (
  //   <div className="flex h-full flex-col rounded-2xl border bg-card p-5 dark:border-white/10 dark:bg-[#14090d]">
  //     <div className="mb-5 flex items-center justify-between">
  //       <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
  //         <Icon className="h-5 w-5 text-primary" />
  //         {title}
  //       </h3>
  //       <div className="flex gap-2">
  //         <button
  //           onClick={() => swiper?.slidePrev()}
  //           className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted dark:border-white/10 dark:bg-[#1a0c11] dark:hover:bg-[#241116]"
  //         >
  //           <ChevronLeft size={16} />
  //         </button>
  //         <button
  //           onClick={() => swiper?.slideNext()}
  //           className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted dark:border-white/10 dark:bg-[#1a0c11] dark:hover:bg-[#241116]"
  //         >
  //           <ChevronRight size={16} />
  //         </button>
  //       </div>
  //     </div>

  //     <Swiper
  //       modules={[Navigation, Autoplay]}
  //       slidesPerView={1}
  //       spaceBetween={0}
  //       autoplay={{
  //         delay: 4500,
  //         disableOnInteraction: false,
  //         pauseOnMouseEnter: true,
  //       }}
  //       onSwiper={setSwiper}
  //       className="w-full flex-1"
  //     >
  //       {items.map((item) => (
  //         <SwiperSlide key={item.id}>
  //           <ShowcaseCard item={item} />
  //         </SwiperSlide>
  //       ))}
  //     </Swiper>
  //   </div>
  // );
}

// ─── Single news card — 2-up layout ───────────────────────────────────────────
function NewsCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.dateBadge).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/50 dark:border-white/10 dark:bg-[#1a0c11]">
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-black">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="block h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
          style={{ maxHeight: "280px", minHeight: "140px" }}
        />
        <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          {date}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
          {item.category} · {item.badgeType}
        </div>

        <h3 className="mb-3 line-clamp-2 text-lg font-serif font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
          {item.title}
        </h3>

        <p
          className={`text-sm leading-relaxed text-muted-foreground transition-all duration-300 ${expanded ? "" : "line-clamp-2"
            }`}
        >
          {item.description}
        </p>

        {item.description.length > 100 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((p) => !p);
            }}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            {expanded ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Show more <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}

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

// ─── News column — 2 cards side by side inside one box ────────────────────────
function NewsColumn({ className = "" }) {
  const swiperRef = useRef(null);

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        {/* <h3 className="text-2xl font-serif text-foreground md:text-3xl">Wine News & Press</h3> */}
        <div className="flex items-center gap-4">
          <Link
            to="/news"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5 md:flex"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2-up Swiper — both cards visible at once on md+ */}
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 2 },
        }}
        loop={false}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        className="w-full pb-4"
      >
        {WINE_NEWS_ITEMS.map((item) => (
          <SwiperSlide key={item.id} className="!h-auto">
            <NewsCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// ─── Root section ──────────────────────────────────────────────────────────────
export default function WineShowcaseSlider() {
  return (
    <section id="showcase" className="relative overflow-hidden bg-[#F5F5F3] py-10 dark:bg-[#311a1f]">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_28%)] dark:block" />
      <div className="mx-auto w-[92%] max-w-7xl">
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl">Wine Showcase</h2>
          <div className="mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <EventsColumn title="Events" icon={Sparkles} items={EVENTS} />
          <NewsColumn className="lg:col-span-2" />
        </div>
      </div>
    </section>
  );
}
