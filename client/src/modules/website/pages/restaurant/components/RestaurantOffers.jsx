import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Tag,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/data/siteContent";

import "swiper/css";

function OfferCard({ offer, index }) {
  const media = offer.image;
  const isVideo = media?.type === "VIDEO";
  const isReel =
    !!media?.width && !!media?.height && media.width / media.height <= 0.85;
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
        className={`relative overflow-hidden bg-card ${
          showFullMedia ? "h-full" : "h-[280px]"
        }`}
      >
        {isVideo ? (
          <video
            src={media?.src}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={media?.src}
            alt={media?.alt || offer.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Offer
        </div>

        <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>{offer.location}</span>
          </div>
        </div>
      </div>

      {showFullMedia ? (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-3">
            <h3 className="line-clamp-2 text-sm font-bold text-white">
              {offer.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[10px] text-white/80">
              {offer.description}
            </p>
          </div>
          <a href={offer.link || "#"} target="_blank" rel="noopener noreferrer">
            <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary/90">
              {offer.ctaText || "View Offer"}
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-serif text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {offer.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <Tag size={12} className="text-primary" />
            <span className="text-[11px] font-medium italic uppercase">
              {offer.couponCode || "Exclusive Offer"}
            </span>
          </div>

          {offer.availableHours && (
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <Clock size={12} className="text-primary" />
              <span className="text-[11px] font-medium italic uppercase">
                {offer.availableHours}
              </span>
            </div>
          )}

          <p className="mt-3 line-clamp-3 text-[11px] italic text-muted-foreground">
            {offer.description}
          </p>

          <div className="mt-auto border-t border-muted pt-4">
            <a href={offer.link || "#"} target="_blank" rel="noopener noreferrer">
              <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary/90">
                {offer.ctaText || "View Offer"}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function RestaurantOffers() {
  const [swiper, setSwiper] = useState(null);
  const offers = siteContent?.text?.dailyOffers?.offers || [];

  if (!offers.length) return null;

  return (
    <section id="offers" className="bg-muted py-10">
      <div className="container mx-auto px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif">
            {siteContent?.text?.dailyOffers?.title || "Restaurant Offers"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => swiper?.slidePrev()}
              className="rounded-full p-2 transition-colors hover:bg-white/50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => swiper?.slideNext()}
              className="rounded-full p-2 transition-colors hover:bg-white/50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onSwiper={setSwiper}
        >
          {offers.map((offer, index) => (
            <SwiperSlide key={`${offer.title}-${index}`}>
              <OfferCard offer={offer} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
