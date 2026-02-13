import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

// ─── Static Fallback Data ──────────────────────────────────────────────────
const FALLBACK_OFFERS = [
  {
    id: "fallback-1",
    title: "Weekend Gourmet Buffet",
    description:
      "Enjoy a lavish spread of over 50+ delicacies with live music.",
    couponCode: "BUFFET20",
    ctaText: "Book Table",
    ctaLink: "#",
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h from now
    propertyType: "Restaurant",
    image: {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
      type: "IMAGE",
      width: 800,
      height: 600,
    },
  },
  {
    id: "fallback-2",
    title: "Happy Hours: Buy 1 Get 1",
    description: "Premium cocktails and appetizers at half the price.",
    couponCode: "HAPPYH",
    ctaText: "View Menu",
    ctaLink: "#",
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    propertyType: "Bar & Lounge",
    image: {
      url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800",
      type: "IMAGE",
      width: 800,
      height: 1200, // To trigger portrait mode logic
    },
  },
  {
    id: "fallback-3",
    title: "Candlelight Dinner Special",
    description: "A private 5-course meal for couples with complimentary wine.",
    couponCode: "ROMANCE",
    ctaText: "Inquire Now",
    ctaLink: "#",
    expiresAt: null,
    propertyType: "Fine Dining",
    image: {
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
      type: "IMAGE",
      width: 1080,
      height: 1920, // To trigger reel mode logic
    },
  },
  {
    id: "fallback-4",
    title: "Candlelight Dinner Special",
    description: "A private 5-course meal for couples with complimentary wine.",
    couponCode: "ROMANCE",
    ctaText: "Inquire Now",
    ctaLink: "#",
    expiresAt: null,
    propertyType: "Fine Dining",
    image: {
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
      type: "IMAGE",
      width: 1080,
      height: 1920, // To trigger reel mode logic
    },
  },
  {
    id: "fallback-5",
    title: "Candlelight Dinner Special",
    description: "A private 5-course meal for couples with complimentary wine.",
    couponCode: "ROMANCE",
    ctaText: "Inquire Now",
    ctaLink: "#",
    expiresAt: null,
    propertyType: "Fine Dining",
    image: {
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
      type: "IMAGE",
      width: 1080,
      height: 1920, // To trigger reel mode logic
    },
  },
];

const MEDIA_DETECTION_RULES = {
  instagramBannerReel: {
    aspectRatio: "9:16",
    minHeight: 800,
    ratioTolerance: 0.1, // Increased tolerance for better detection
  },
  instagramBannerPortrait: {
    aspectRatio: "4:5",
    minHeight: 1000,
    ratioTolerance: 0.1,
  },
};

const aspectRatioMatches = (
  width: number,
  height: number,
  targetRatio: string,
  tolerance = 0.05,
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
        setLabel(`${h}h ${m}m Remaining`);
        setIsExpired(false);
      }
    }, 1000);
    return () => clearInterval(i);
  }, [expiresAt]);

  if (!label) return null;

  return (
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

export default function ResturantpageOffers() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standardizing on fallback for this view
    setOffers(FALLBACK_OFFERS);
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  if (!offers.length) return null;

  return (
    <div className="w-full">
      {/* 1. Optimized Header for 30% width */}
      <div className="flex justify-between items-center mb-4">
        {/* <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
          Exclusive Deals
        </h3> */}
        <div className="flex gap-1.5">
          <button
            onClick={() => swiper?.slidePrev()}
            className="p-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <ChevronLeft size={14} className="dark:text-white" />
          </button>
          <button
            onClick={() => swiper?.slideNext()}
            className="p-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <ChevronRight size={14} className="dark:text-white" />
          </button>
        </div>
      </div>

      {/* 2. Single card view restricted to container width */}
      <div className="w-full max-w-full">
        <Swiper
          modules={[Navigation, Autoplay]}
          slidesPerView={1}
          spaceBetween={0}
          centeredSlides={true}
          loop={offers.length > 1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          onSwiper={setSwiper}
          className="rounded-[28px]"
        >
          {offers.map((offer, i) => {
            const isBanner = detectBanner(offer.image);

            return (
              <SwiperSlide key={offer.id || i}>
                <div className="group h-[480px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[28px] overflow-hidden flex flex-col shadow-sm relative transition-all duration-300">
                  {/* Media Section */}
                  <div
                    className={`relative overflow-hidden ${isBanner ? "flex-1" : "h-[240px]"}`}
                  >
                    {offer.image?.url ? (
                      offer.image.type === "VIDEO" ? (
                        <video
                          src={offer.image.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={offer.image.url}
                          alt={offer.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Tag className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-black/70 text-white text-[8px] px-2 py-0.5 rounded-full z-10 font-bold uppercase tracking-wider">
                      {offer.propertyType}
                    </div>

                    {offer.expiresAt && (
                      <div className="absolute top-3 right-3 z-10 scale-90 origin-right">
                        <CountdownTimer expiresAt={offer.expiresAt} />
                      </div>
                    )}

                    {isBanner && (
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/40 to-transparent pt-10 z-20 text-left">
                        <h4 className="text-white font-serif font-bold text-base mb-2">
                          {offer.title}
                        </h4>
                        <a
                          href={offer.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-primary text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
                        >
                          {offer.ctaText} <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Standard Card Info (Optimized for Small Width) */}
                  {!isBanner && (
                    <div className="p-4 flex flex-col flex-1 text-left">
                      <h4 className="text-sm font-serif font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {offer.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 italic line-clamp-2 mt-1.5 leading-relaxed">
                        {offer.description}
                      </p>

                      <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-white/5">
                        <div className="mb-3 flex flex-col gap-1.5 bg-zinc-50 dark:bg-white/5 p-2 rounded-xl border border-dashed border-primary/20">
                          <span className="text-[9px] text-zinc-400 font-bold uppercase">
                            Code:
                          </span>
                          <span className="font-mono font-black text-primary text-xs tracking-widest text-center">
                            {offer.couponCode}
                          </span>
                        </div>

                        <a
                          href={offer.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-primary text-white py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                        >
                          {offer.ctaText} <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}
