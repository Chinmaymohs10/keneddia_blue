import { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { restaurantEventShowcase } from "@/data/siteContent";

import "swiper/css";
import "swiper/css/pagination";

const groupBookingItems = [
  {
    id: 1,
    title: "Private Dining Celebrations",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Corporate Lunch Packages",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Festive Group Reservations",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
];

function EventCard({ event, index }) {
  const media = event.media;
  const isVideo = media?.type === "VIDEO";
  const isReel = !!media?.width && !!media?.height && media.width / media.height <= 0.85;
  const showFullMedia = isVideo || isReel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <div
        className={`relative overflow-hidden bg-card ${showFullMedia ? "h-full" : "h-[280px]"}`}
      >
        {isVideo ? (
          <video
            src={media?.src}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
              isReel ? "object-cover" : "object-cover"
            }`}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={media?.src}
            alt={media?.alt || event.title}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
              showFullMedia ? "object-cover" : "object-cover object-center"
            }`}
          />
        )}

        <div className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {isVideo ? "Reel" : "Event"}
        </div>

        <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {showFullMedia ? (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-3">
            <h3 className="line-clamp-2 text-sm font-bold text-white">
              {event.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[10px] text-white/80">
              {event.description}
            </p>
          </div>
          <Link to={`/events/${event.slug}`}>
            <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary/90">
              View Event <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-serif text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {event.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={12} className="text-primary" />
            <span className="text-[11px] font-medium italic uppercase">
              {event.date}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-[11px] italic text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-auto border-t border-muted pt-4">
            <Link to={`/events/${event.slug}`}>
              <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary/90">
                View Event <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function EventsSchedule() {
  const [swiper, setSwiper] = useState(null);
  const events = restaurantEventShowcase?.items || [];

  return (
    <section id="events" className="bg-muted py-10">
      <div className="mx-auto w-[92%] max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-serif md:text-3xl">
            Events & Group Bookings
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-serif font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                {restaurantEventShowcase?.title || "Upcoming Events"}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => swiper?.slidePrev()}
                  className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => swiper?.slideNext()}
                  className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              spaceBetween={16}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 2.2 },
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              onSwiper={setSwiper}
              className="!pb-2"
            >
              {events.map((event, index) => (
                <SwiperSlide key={event.slug || event.title}>
                  <EventCard event={event} index={index} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-serif font-semibold">
                Group Booking
              </h3>
            </div>

            <div className="space-y-3">
              {groupBookingItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
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
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-full"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900/10 via-white/55 to-amber-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-slate-900/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
              <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-rose-200/35 blur-3xl" />
              <div className="absolute right-[-20px] top-10 h-36 w-36 rounded-full bg-slate-400/20 blur-3xl" />
              <div className="absolute bottom-[-18px] right-8 h-36 w-36 rounded-full bg-amber-200/35 blur-3xl" />
              <div className="absolute bottom-10 left-8 h-24 w-24 rounded-full bg-sky-200/25 blur-3xl" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
