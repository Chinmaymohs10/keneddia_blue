import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import { siteContent } from "@/data/siteContent";
import { getDailyOffers, getPropertyTypeById } from "@/Api/Api";

import "swiper/css";

function OfferCard({ offer, index }) {
  const accentStyles = [
    "from-[#9e003f] via-[#b10046] to-[#7f0033] text-white",
    "from-[#ffb400] via-[#ffcb45] to-[#ffab00] text-[#2f1f00]",
    "from-[#b0004b] via-[#cb0055] to-[#8a003b] text-white",
    "from-[#ffb000] via-[#ffc73a] to-[#f59e0b] text-[#2f1f00]",
  ];
  const accentClass = accentStyles[index % accentStyles.length];
  const hasCta =
    Boolean(offer?.ctaText?.trim()) && Boolean(offer?.link?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`group relative flex h-[148px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-r p-4 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.55)] ${accentClass}`}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
      </div>

      {hasCta && (
        <a
          href={offer.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-4 z-20"
          aria-label={offer.ctaText}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-current backdrop-blur-md transition-colors hover:bg-white hover:text-black">
            <ExternalLink className="h-4 w-4" />
          </div>
        </a>
      )}

      <div className="relative z-10 min-w-0">
        {offer.location && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/16 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-md ring-1 ring-white/20">
            <MapPin className="h-3 w-3" />
            {offer.location}
          </div>
        )}

        <h3 className="line-clamp-2 text-lg font-black leading-[1.1] tracking-tight">
          {offer.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-[13px] leading-snug opacity-90">
          {offer.description}
        </p>
      </div>

      <div className="relative z-10 mt-4 border-t border-white/20 pt-3" />
    </motion.div>
  );
}

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export default function RestaurantOffers({ initialOffers }) {
  const [swiper, setSwiper] = useState(null);
  const [offers, setOffers] = useState(
    Array.isArray(initialOffers) && initialOffers.length > 0 ? initialOffers : [],
  );
  const [loading, setLoading] = useState(
    !(Array.isArray(initialOffers) && initialOffers.length > 0),
  );

  useEffect(() => {
    if (Array.isArray(initialOffers) && initialOffers.length > 0) return;
    const fetchOffers = async () => {
      try {
        setLoading(true);

        const res = await getDailyOffers({
          targetType: "GLOBAL",
          page: 0,
          size: 100,
        });

        const rawData = res?.data?.data || res?.data || [];
        const list = Array.isArray(rawData) ? rawData : rawData.content || [];
        const now = Date.now();
        const days = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];
        const todayName = days[new Date().getDay()];

        const filtered = await Promise.all(
          list.map(async (offer) => {
            if (!offer?.isActive || offer?.showOnHomepage !== true) return null;

            let notExpired = true;
            if (offer.expiresAt) {
              const expiry = new Date(`${offer.expiresAt}T23:59:59`);
              notExpired = expiry.getTime() >= now;
            }
            if (!notExpired) return null;

            const isDayActive =
              !offer.activeDays?.length || offer.activeDays.includes(todayName);
            if (!isDayActive) return null;

            if (!offer.propertyTypeId) return null;

            try {
              const propertyTypeRes = await getPropertyTypeById(
                offer.propertyTypeId,
              );
              const propertyType = propertyTypeRes?.data;

              if (!propertyType?.isActive) return null;
              if (normalize(propertyType.typeName) !== "restaurant") return null;

              return {
                id: offer.id,
                title: offer.title || "",
                description: offer.description || "",
                ctaText: offer.ctaText || "",
                link: offer.ctaUrl || offer.ctaLink || null,
                location:
                  offer.location ||
                  offer.locationName ||
                  offer.propertyName ||
                  "",
              };
            } catch (error) {
              console.error(
                `Failed to resolve property type for offer ${offer?.id}`,
                error,
              );
              return null;
            }
          }),
        );

        setOffers(filtered.filter(Boolean));
      } catch (error) {
        console.error("Restaurant offers fetch failed", error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [initialOffers]);

  if (loading) {
    return (
      <section id="offers" className="bg-muted py-10">
        <div className="container mx-auto flex justify-center px-6">
          <Loader2 className="animate-spin" />
        </div>
      </section>
    );
  }

  if (!offers.length) return null;

  return (
    <section id="offers" className="bg-muted py-10">
      <div className="container mx-auto px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Curated Savings
            </span>
            <h2 className="text-2xl font-serif md:text-3xl">
              {siteContent?.text?.dailyOffers?.title || "Restaurant Offers"}
            </h2>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <button
              onClick={() => swiper?.slidePrev()}
              className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-white/50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => swiper?.slideNext()}
              className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-white/50"
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
            768: { slidesPerView: 2.2 },
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
            <SwiperSlide key={offer.id || index}>
              <OfferCard offer={offer} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
