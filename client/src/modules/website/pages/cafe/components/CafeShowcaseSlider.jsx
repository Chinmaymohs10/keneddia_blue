import { Calendar, ChevronLeft, ChevronRight, Coffee, Gift, Users, ExternalLink, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/data/siteContent";
import { getPropertyTypes } from "@/Api/Api";
import { getGroupBookingHeaderByPropertyType } from "@/Api/RestaurantApi";

import "swiper/css";

const normalizeHeaderRecords = (payload) => {
  const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
  return [...list].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
};

// ── Data ──────────────────────────────────────────────────────────────────────

const OFFERS = [
  {
    id: "offer-1",
    type: "Offer",
    title: "Morning Brew & Bake Combo",
    description: "Fresh croissant, house roast, and a quick breakfast format designed for early hours.",
    image: siteContent.images.cafes.bakery.src,
    date: "Daily · 7 AM – 11 AM",
    location: "All Outlets",
    slug: "morning-brew-bake",
    icon: Gift,
  },
  {
    id: "offer-2",
    type: "Offer",
    title: "High Tea For Two",
    description: "Tea tower service with petit desserts and savouries in a lounge-style format.",
    image: siteContent.images.cafes.highTea.src,
    date: "Weekends · 3 PM – 6 PM",
    location: "Lounge Only",
    slug: "high-tea-for-two",
    icon: Gift,
  },
  {
    id: "offer-3",
    type: "Offer",
    title: "Late Night Dessert Bar",
    description: "Specialty desserts, cold brews, and artisan toppings available post-dinner.",
    image: siteContent.images.cafes.minimalist.src,
    date: "Fri – Sat · 9 PM – 12 AM",
    location: "Main Cafe",
    slug: "late-night-dessert",
    icon: Coffee,
  },
];

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
    description: "Interactive cafe sessions focused on pouring techniques, beans, and tasting notes.",
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

const GROUP_BOOKINGS = [
  {
    id: 1,
    title: "Creative Team Coffee Meetups",
    description: "Pre-set tables, quick service flow, and shared platters for compact office gatherings.",
    image: siteContent.images.cafes.minimalist.src,
    slug: "team-coffee-meetups",
  },
  {
    id: 2,
    title: "Celebration Tables For Small Parties",
    description: "Birthdays, catch-ups, and cosy celebrations arranged with dessert add-ons.",
    image: siteContent.images.cafes.parisian.src,
    slug: "celebration-tables",
  },
  {
    id: 3,
    title: "Corporate Tasting Sessions",
    description: "Curated tasting menus and private seating for team outings and client meetings.",
    image: siteContent.images.cafes.library.src,
    slug: "corporate-tasting",
  },
];

// ── Shared Card ───────────────────────────────────────────────────────────────

function ShowcaseCard({ item }) {
  return (
    <div className="group relative flex h-[460px] cursor-pointer flex-col overflow-hidden rounded-xl bg-card shadow-sm">
      {/* Image */}
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      {/* Top badges */}
      <div className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {item.type}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
        <div className="flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          <span>{item.location}</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-4">
        <h3 className="font-serif text-base font-bold leading-snug text-white line-clamp-2">
          {item.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-white/70">
          <Calendar size={11} className="text-primary" />
          <span className="text-[11px] font-medium italic uppercase">{item.date}</span>
        </div>

        <p className="mt-2 line-clamp-2 text-[11px] italic text-white/65">
          {item.description}
        </p>

        <Link to={`/cafe/${item.slug}`} className="mt-4">
          <Button className="h-auto w-full rounded-lg bg-white/15 py-2.5 text-xs font-bold text-white shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-black border border-white/20">
            Explore <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Column with Swiper ─────────────────────────────────────────────────────────

function CarouselColumn({ label, title, icon: Icon, items, accentColor }) {
  const [swiper, setSwiper] = useState(null);

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => swiper?.slidePrev()}
            className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => swiper?.slideNext()}
            className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Sub-label */}
      {/* <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
        {label}
      </p> */}

      {/* Single-slide carousel */}
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={setSwiper}
        className="w-full flex-1"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <ShowcaseCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// ── Group Booking Column ───────────────────────────────────────────────────────

function GroupBookingColumn() {
  const [groupBookingHeader, setGroupBookingHeader] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroupBookingHeader = async () => {
      try {
        const typesResponse = await getPropertyTypes();
        const propertyTypes = typesResponse?.data || typesResponse || [];
        const cafeType = Array.isArray(propertyTypes)
          ? propertyTypes.find(
              (type) => type?.isActive && type?.typeName?.toLowerCase() === "cafe",
            )
          : null;

        if (!cafeType?.id) return;

        const headerResponse = await getGroupBookingHeaderByPropertyType(
          Number(cafeType.id),
        );
        const latestActiveRecord =
          normalizeHeaderRecords(headerResponse?.data).find(
            (item) => item?.active === true,
          ) || null;

        if (isMounted) {
          setGroupBookingHeader(latestActiveRecord);
        }
      } catch {
        if (isMounted) {
          setGroupBookingHeader(null);
        }
      }
    };

    fetchGroupBookingHeader();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Group Booking</h3>
      </div>

      {/* <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
        Reserve · Celebrate · Connect
      </p> */}

      {/* Booking list */}
      <div className="space-y-3">
        {GROUP_BOOKINGS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="group overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/30 bg-muted shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                  {item.title}
                </h4>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Link to={`/cafe/group/${item.slug}`}>
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Glassmorphism decorative card */}
      <div className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-[#DCDCD8] bg-linear-to-br from-[#ECECE8] via-white to-[#F7F7F5] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-white/55 via-white/20 to-[#E8E8E4]/55" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/70" />

        {/* Blobs */}
        <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-zinc-200/50 blur-3xl" />
        <div className="absolute right-[-18px] top-8 h-32 w-32 rounded-full bg-zinc-300/25 blur-3xl" />
        <div className="absolute bottom-[-16px] right-8 h-32 w-32 rounded-full bg-zinc-200/45 blur-3xl" />
        <div className="absolute bottom-8 left-6 h-20 w-20 rounded-full bg-zinc-100/70 blur-3xl" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />

        {/* CTA text inside glass card */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <Users className="h-8 w-8 text-primary/60" />
          <p className="font-serif text-sm font-semibold text-foreground/80">
            {groupBookingHeader?.header || "Planning something bigger?"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {groupBookingHeader?.description ||
              "Reach out for bespoke group experiences, private dining, and exclusive cafe takeovers."}
          </p>
          <Button
            onClick={() => document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-1 h-auto rounded-full px-5 py-2 text-xs font-bold"
          >
            {groupBookingHeader?.ctaText || "Enquire Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export default function CafeShowcaseSlider() {
  return (
    <section id="showcase" className="bg-[#F5F5F3] py-10 dark:bg-muted">
      <div className="mx-auto w-[92%] max-w-7xl">
        {/* Section heading */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl">Cafe Showcase</h2>
          <div className="mt-3 h-0.5 w-16 bg-primary" />
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left — Offers */}
          <CarouselColumn
            // label="Daily Deals · Seasonal Picks"
            title="Offers"
            icon={Gift}
            items={OFFERS}
          />

          {/* Centre — Events */}
          <CarouselColumn
            // label="Upcoming · Live · Interactive"
            title="Events"
            icon={Sparkles}
            items={EVENTS}
          />

          {/* Right — Group Booking */}
          <GroupBookingColumn />
        </div>
      </div>
    </section>
  );
}
