import { useState, useEffect } from "react";
import {
  Tag,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { siteContent } from "@/data/siteContent";
import { getDailyOffers } from "@/Api/Api";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

/* =======================
    MEDIA DETECTION RULES
======================= */
const MEDIA_DETECTION_RULES = {
  instagramBannerReel: {
    aspectRatio: "9:16",
    minHeight: 800,
    ratioTolerance: 0.01,
  },
  instagramBannerPortrait: {
    aspectRatio: "4:5",
    minHeight: 1000,
    ratioTolerance: 0.01,
  },
};

const aspectRatioMatches = (
  width: number,
  height: number,
  targetRatio: string,
  tolerance = 0.01,
) => {
  const [tw, th] = targetRatio.split(":").map(Number);
  return Math.abs(width / height - tw / th) <= tolerance;
};

const detectBanner = (image: any) => {
  if (!image?.width || !image?.height) return false;

  const isReel =
    aspectRatioMatches(
      image.width,
      image.height,
      MEDIA_DETECTION_RULES.instagramBannerReel.aspectRatio,
      MEDIA_DETECTION_RULES.instagramBannerReel.ratioTolerance,
    ) && image.height >= MEDIA_DETECTION_RULES.instagramBannerReel.minHeight;

  const isPortrait =
    aspectRatioMatches(
      image.width,
      image.height,
      MEDIA_DETECTION_RULES.instagramBannerPortrait.aspectRatio,
      MEDIA_DETECTION_RULES.instagramBannerPortrait.ratioTolerance,
    ) &&
    image.height >= MEDIA_DETECTION_RULES.instagramBannerPortrait.minHeight;

  return isReel || isPortrait;
};

/* =======================
    TIMER COMPONENT
======================= */
function CountdownTimer({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const i = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Expired");
        setIsExpired(true);
        clearInterval(i);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        // Change: Clearer visibility for offers about to expire
        setLabel(`${h}h ${m}m Remaining`);
        setIsExpired(false);
      }
    }, 1000);
    return () => clearInterval(i);
  }, [expiresAt]);

  if (!label) return null;

  return (
    // Change: Expired card shows in red background
    <div
      className={`flex items-center gap-1 px-2.5 py-1 text-white text-[10px] font-bold rounded-full shadow-md ${
        isExpired ? "bg-red-600" : "bg-black/70"
      }`}
    >
      <Clock className="w-3 h-3" />
      {label}
    </div>
  );
}

/* =======================
    MAIN COMPONENT
======================= */
export default function DailyOffers() {
  const { dailyOffers } = siteContent.text;
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await getDailyOffers({
          targetType: "GLOBAL",
          page: 0,
          size: 100,
        });

        const rawData = res.data?.data || res.data || [];
        const list = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData.content)
            ? rawData.content
            : [];

        const now = Date.now();

        const active = list.filter((o: any) => {
          const notExpired =
            !o.expiresAt || new Date(o.expiresAt).getTime() > now;

          return (
            o.isActive &&
            notExpired &&
            ["HOME_PAGE", "BOTH", "PROPERTY_PAGE"].includes(o.displayLocation)
          );
        });

        setOffers(
          active.map((o: any) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            couponCode: o.couponCode,
            ctaText: o.ctaText || "View Offer",
            ctaLink: o.ctaUrl || o.ctaLink || null,
            expiresAt: o.expiresAt,
            propertyType: o.propertyTypeName || "Hotel",
            image: o.image?.url
              ? {
                  src: o.image.url,
                  type: o.image.type, // "IMAGE" | "VIDEO"
                  width: o.image.width,
                  height: o.image.height,
                  alt: o.title,
                }
              : null,
          })),
        );
      } catch (err) {
        console.error("Offer fetch failed", err);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!offers.length) return null;

  return (
    <section className="bg-muted py-10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif">
            {dailyOffers?.title || "Daily Offers"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => swiper?.slidePrev()}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => swiper?.slideNext()}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
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
          autoplay={{ delay: 5000 }}
          onSwiper={setSwiper}
        >
          {offers.map((offer, i) => {
            const isBanner = detectBanner(offer.image);
            const isClickable = !!offer.ctaLink;

            return (
              <SwiperSlide key={offer.id || i}>
                <div className="group h-[520px] bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl">
                  {/* IMAGE SECTION */}
                  <div
                    className={`relative overflow-hidden ${
                      isBanner ? "flex-1" : "h-[280px]"
                    }`}
                  >
                    {offer.image ? (
                      offer.image.type === "VIDEO" ? (
                        <video
                          src={offer.image.src}
                          className="w-full h-full object-cover object-top"
                          muted
                          playsInline
                          autoPlay
                          loop
                        />
                      ) : (
                        <img
                          src={offer.image.src}
                          alt={offer.image.alt}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Tag className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded z-10 font-bold uppercase tracking-wider">
                      {offer.propertyType}
                    </div>

                    {offer.expiresAt && (
                      <div className="absolute top-3 right-3 z-10">
                        <CountdownTimer expiresAt={offer.expiresAt} />
                      </div>
                    )}

                    {/* BANNER HOVER CTA */}
                    {isBanner && (
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 z-20">
                        {isClickable ? (
                          <a
                            href={offer.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-colors"
                          >
                            {offer.ctaText}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-muted text-muted-foreground py-2.5 rounded-lg text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {offer.ctaText}
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CONTENT SECTION (Standard format) */}
                  {!isBanner && (
                    <div className="p-4 flex flex-col flex-1">
                      {/* Change: Theme-based hover colors for title */}
                      <h3
                        className="text-sm font-serif font-bold line-clamp-2 leading-tight transition-colors duration-300 
                        text-foreground group-hover:text-red-600 dark:group-hover:text-yellow-400"
                      >
                        {offer.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground italic line-clamp-2 mt-2">
                        {offer.description}
                      </p>

                      <div className="mt-auto pt-3 border-t border-muted">
                        {/* Change: High-visibility code line */}
                        <div className="text-[11px] mb-3 flex items-center justify-center gap-2 bg-muted/50 px-3 py-2 rounded-md border border-dashed border-primary/20">
                          <span className="text-muted-foreground font-medium uppercase whitespace-nowrap">
                            Promo Code
                          </span>

                          <span className="text-muted-foreground">:</span>

                          <span className="font-mono font-black text-primary text-xs tracking-widest bg-card px-2 py-0.5 rounded shadow-sm border">
                            {offer.couponCode}
                          </span>
                        </div>

                        {/* Change: Red Claim Now button */}
                        {isClickable ? (
                          <a
                            href={offer.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md active:scale-95"
                          >
                            {offer.ctaText}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-muted/80 py-2.5 rounded-lg text-xs font-bold opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {offer.ctaText}
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
