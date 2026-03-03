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
import TodayOffer from "@/assets/video/Todayoffer.mp4";
import { getDailyOffers } from "@/Api/Api";
import OfferVideo from "@/modules/website/components/OfferVideo";
import "swiper/css";
import "swiper/css/navigation";

// ─── Static Fallback ──────────────────────────────────────────────────────────
const FALLBACK_OFFERS = [
  {
    id: "fallback-video",
    title: "",
    description: "",
    couponCode: "",
    ctaText: "",
    ctaLink: "",
    expiresAt: null,
    image: {
      src: TodayOffer,
      type: "VIDEO",
      width: 1080,
      height: 1920,
      fileName: "",
      alt: "",
    },
  },
];

// ─── Media Detection (extracted from DailyOffers) ────────────────────────────
// image shape expected: { src, type, width, height, fileName }
const detectBanner = (image: any) => {
  if (!image) return false;

  // 1. Dimension ratio — portrait ≤ 0.85 covers 9:16, 4:5, 3:4 etc.
  if (image.width && image.height) {
    const ratio = image.width / image.height;
    if (ratio <= 0.85) return true;
  }

  // 2. Filename / URL string hints (catches cases where dimensions are null)
  const name = (image.fileName || "").toLowerCase();
  const url = (image.src || "").toLowerCase();
  const sourceString = `${name} ${url}`;
  if (
    sourceString.includes("1080") ||
    sourceString.includes("1350") ||
    sourceString.includes("instagram_post")
  ) {
    return true;
  }

  // 3. Videos are always full-banner — they control their own aspect ratio
  if (image.type === "VIDEO") return true;

  return false;
};

// ─── Countdown Timer ─────────────────────────────────────────────────────────
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface ResturantpageOffersProps {
  propertyId: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResturantpageOffers({
  propertyId,
}: ResturantpageOffersProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) {
      setOffers(FALLBACK_OFFERS);
      setLoading(false);
      return;
    }

    getDailyOffers({ page: 0, size: 100 })
      .then((res) => {
        const raw: any[] = res?.data?.content ?? res?.data ?? [];

        const now = Date.now();

        const filtered = raw.filter((o) => {
          const notExpired =
            !o.expiresAt || new Date(o.expiresAt).getTime() > now;

          return (
            o.propertyId === propertyId &&
            o.isActive === true &&
            o.image?.url &&
            notExpired
          );
        });

        if (filtered.length > 0) {
          const mapped = filtered.map((o) => ({
            id: o.id,
            title: o.title ?? "",
            description: o.description ?? "",
            couponCode: o.couponCode ?? "",
            ctaText: o.ctaText ?? "",
            ctaLink: o.ctaUrl || o.ctaLink || null,
            expiresAt: o.expiresAt ?? null,
            // Map to the shape detectBanner expects (src + fileName)
            image: {
              src: o.image.url,
              type: o.image.type ?? "IMAGE",
              width: o.image.width ?? null,
              height: o.image.height ?? null,
              fileName: o.image.fileName ?? "",
              alt: o.title ?? "Offer",
            },
          }));
          setOffers(mapped);
        } else {
          setOffers(FALLBACK_OFFERS);
        }
      })
      .catch(() => setOffers(FALLBACK_OFFERS))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );

  if (!offers.length) return null;

  return (
    <div className="w-full">
      {/* Nav arrows */}
      <div className="flex justify-between items-center mb-4">
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

      <div className="w-full max-w-full">
        <Swiper
          modules={[Navigation, Autoplay]}
          slidesPerView={1}
          spaceBetween={0}
          centeredSlides={true}
          loop={offers.length > 1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onSwiper={setSwiper}
          className="rounded-[28px]"
        >
          {offers.map((offer, i) => {
            const isBanner = detectBanner(offer.image);
            const isVideo = offer.image?.type === "VIDEO";
            const hasContent = !!(
              offer.title ||
              offer.description ||
              offer.couponCode
            );
            const hasCtaText = !!offer.ctaText?.trim();
            const isClickable = !!offer.ctaLink;

            // Banner (portrait/video) OR offers with no text → fill the fixed frame
            // Standard (landscape image with text) → split: media top, content below
            const showFullImage = isBanner || !hasContent;

            return (
              <SwiperSlide key={offer.id ?? i}>
                {/*
                  Fixed h-[520px] frame — mirrors DailyOffers card height exactly.
                  Images/videos never blow out the container regardless of source dimensions.
                */}
                <div className="group h-[520px] bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[28px] overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl">
                  {/* ── MEDIA CONTAINER ────────────────────────────────── */}
                  <div
                    className={`relative overflow-hidden shrink-0 ${
                      showFullImage ? "h-full" : "h-[280px]"
                    }`}
                  >
                    {offer.image ? (
                      isVideo ? (
                        // OfferVideo handles its own sizing inside the container
                        <OfferVideo src={offer.image.src} />
                      ) : (
                        <img
                          src={offer.image.src}
                          alt={offer.image.alt}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Tag className="w-10 h-10 text-zinc-600" />
                      </div>
                    )}

                    {/* Timer */}
                    {offer.expiresAt && (
                      <div className="absolute top-3 right-3 z-10">
                        <CountdownTimer expiresAt={offer.expiresAt} />
                      </div>
                    )}

                    {/* Banner / full-image: hover overlay */}
                    {showFullImage && (
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                        <div className="mb-3">
                          {offer.title && (
                            <h3 className="text-white font-bold text-sm line-clamp-1">
                              {offer.title}
                            </h3>
                          )}
                          {offer.description && (
                            <p className="text-white/80 text-[10px] line-clamp-1">
                              {offer.description}
                            </p>
                          )}
                        </div>
                        {hasCtaText &&
                          (isClickable ? (
                            <a
                              href={offer.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-primary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90"
                            >
                              {offer.ctaText} <ExternalLink size={12} />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-white/20 text-white py-2.5 rounded-lg text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {offer.ctaText} <ExternalLink size={12} />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* ── STANDARD CARD CONTENT (landscape + text) ───────── */}
                  {!showFullImage && (
                    <div className="p-4 flex flex-col flex-1 bg-white dark:bg-zinc-900">
                      <h3 className="text-sm font-serif font-bold line-clamp-2 leading-tight text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                        {offer.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 italic line-clamp-2 mt-2">
                        {offer.description}
                      </p>
                      <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-white/10">
                        {offer.couponCode && (
                          <div className="text-[11px] mb-3 flex items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-md border border-dashed border-primary/20">
                            <span className="text-zinc-400 font-medium uppercase">
                              Code
                            </span>
                            <span className="font-mono font-black text-primary text-xs tracking-widest bg-white dark:bg-zinc-900 px-2 py-0.5 rounded shadow-sm border">
                              {offer.couponCode}
                            </span>
                          </div>
                        )}
                        {hasCtaText &&
                          (isClickable ? (
                            <a
                              href={offer.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-primary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                            >
                              {offer.ctaText} <ExternalLink size={12} />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-zinc-100 dark:bg-zinc-800 py-2.5 rounded-lg text-xs font-bold opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {offer.ctaText} <ExternalLink size={12} />
                            </button>
                          ))}
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
