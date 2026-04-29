import { useState, useEffect } from "react";
import {
  Tag,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { siteContent } from "@/data/siteContent";
import { getDailyOffers } from "@/Api/Api";
import type { Swiper as SwiperType } from "swiper";
import OfferVideo from "./OfferVideo";
import "swiper/css";
import "swiper/css/navigation";

/* =======================
    MEDIA DETECTION RULES
======================= */
const detectBanner = (image: any) => {
  if (!image) return false;

  // 1. DIMENSION CHECK: (1080/1350 = 0.8)
  if (image.width && image.height) {
    const ratio = image.width / image.height;
    if (ratio <= 0.85) return true;
  }

  // 2. MANUAL STRING ANALYSIS:
  // Looks for "1080", "1350", or "Instagram" in the URL or FileName
  // This explicitly catches videos where width/height are null.
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

  // 3. DEFAULT TYPE CHECK:
  // Treat portrait-oriented videos as full banners by default
  if (image.type === "VIDEO") return true;

  return false;
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
      const expiry = new Date(expiresAt);
      expiry.setHours(23, 59, 59, 999);

      const diff = expiry.getTime() - Date.now();

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

/* =======================
    MAIN COMPONENT
======================= */

export default function DailyOffers({ initialOffers = [] }: { initialOffers?: any[] }) {
  const { dailyOffers } = siteContent.text;
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [offers, setOffers] = useState<any[]>(initialOffers);
  const [loading, setLoading] = useState(initialOffers.length === 0);

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
        const list = Array.isArray(rawData) ? rawData : rawData.content || [];
        const now = Date.now();

        const DAYS = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];
        const todayName = DAYS[new Date().getDay()];

        const active = list.filter((o: any) => {
          let notExpired = true;

          if (o.expiresAt) {
            const expiry = new Date(o.expiresAt);
            expiry.setHours(23, 59, 59, 999);
            notExpired = expiry.getTime() > now;
          }

          const isDayActive =
            !o.activeDays?.length || o.activeDays.includes(todayName);

          return (
            o.isActive && notExpired && o.showOnHomepage === true && isDayActive
          );
        });

        setOffers(
          active.map((o: any) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            couponCode: o.couponCode,
            ctaText: o.ctaText || "",
            ctaLink: o.ctaUrl || o.ctaLink || null,
            expiresAt: o.expiresAt,
            propertyType: o.propertyTypeName || "",
            image: o.image?.url
              ? {
                  src: o.image.url,
                  type: o.image.type,
                  width: o.image.width,
                  height: o.image.height,
                  fileName: o.image.fileName,
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
          <div>
            <h2 className="text-2xl font-serif">
              {dailyOffers?.title || "Daily Offers"}
            </h2>
            <div className="h-1 w-10 bg-primary mt-1 rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/offers"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>

            {/* NAV BUTTONS */}
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
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onSwiper={setSwiper}
        >
          {offers.map((offer, i) => {
            const isBanner = detectBanner(offer.image);
            const isClickable = !!offer.ctaLink;
            const hasContent = !!(
              offer.title ||
              offer.description ||
              offer.couponCode
            );
            const hasCtaText = !!(offer.ctaText && offer.ctaText.trim());

            // Only banner OR no content triggers full mode
            const showFullImage = isBanner || !hasContent;

            return (
              <SwiperSlide key={offer.id || i}>
                <div className="group h-[440px] sm:h-[520px] bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl cursor-pointer">
                  {/* MEDIA CONTAINER */}
                  <div
                    className={`relative overflow-hidden ${showFullImage ? "h-full" : "h-[240px] sm:h-[280px]"}`}
                  >
                    {offer.image ? (
                      offer.image.type === "VIDEO" ? (
                        <OfferVideo src={offer.image.src} />
                      ) : (
                        <img
                          src={offer.image.src}
                          alt={offer.image.alt}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Tag className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* BADGES */}
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded z-10 font-bold uppercase tracking-wider">
                      {offer.propertyType}
                    </div>
                    {offer.expiresAt && (
                      <div className="absolute top-3 right-3 z-10">
                        <CountdownTimer expiresAt={offer.expiresAt} />
                      </div>
                    )}

                    {/* BANNER/FULL IMAGE HOVER CONTENT Overlay */}
                    {showFullImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
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
                        {/* Only show button if CTA text exists */}
                        {hasCtaText &&
                          (isClickable ? (
                            <a
                              href={offer.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700"
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

                  {/* STANDARD CARD CONTENT (Hidden for full-image mode) */}
                  {!showFullImage && (
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-serif font-bold line-clamp-2 leading-tight text-foreground group-hover:text-red-600 transition-colors">
                        {offer.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground italic line-clamp-2 mt-2">
                        {offer.description}
                      </p>
                      <div className="mt-auto pt-3 border-t border-muted">
                        {offer.couponCode && (
                          <div className="text-[11px] mb-3 flex items-center justify-center gap-2 bg-muted/50 px-3 py-2 rounded-md border border-dashed border-primary/20">
                            <span className="text-muted-foreground font-medium uppercase">
                              Code
                            </span>
                            <span className="font-mono font-black text-primary text-xs tracking-widest bg-card px-2 py-0.5 rounded shadow-sm border">
                              {offer.couponCode}
                            </span>
                          </div>
                        )}
                        {/* Only show button if CTA text exists */}
                        {hasCtaText &&
                          (isClickable ? (
                            <a
                              href={offer.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md"
                            >
                              {offer.ctaText} <ExternalLink size={12} />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-muted/80 py-2.5 rounded-lg text-xs font-bold opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
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
    </section>
  );
}

