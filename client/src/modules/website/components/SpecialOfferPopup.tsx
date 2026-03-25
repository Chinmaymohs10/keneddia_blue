import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteContent } from "@/data/siteContent";
import { getDailyOffers, getPropertyTypeById } from "@/Api/Api";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function CountdownTimer({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState("--:--:--");

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const expiry = new Date(`${expiresAt}T23:59:59`);
      const diff = expiry.getTime() - Date.now();

      if (diff <= 0) {
        setLabel("Expired");
        return;
      }

      const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      setLabel(`${h}:${m}:${s}`);
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [expiresAt]);

  return <span>{label}</span>;
}

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const normalize = (value?: string) =>
  (value || "").trim().toLowerCase().replace(/\s+/g, " ");

const isOfferExpired = (expiresAt?: string) => {
  if (!expiresAt) return false;
  const expiry = new Date(`${expiresAt}T23:59:59`);
  return expiry.getTime() < Date.now();
};

export default function SpecialOfferPopup() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    const fetchQuickOffers = async () => {
      try {
        const res = await getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 });
        const rawData = res.data?.data || res.data || [];
        const list: any[] = Array.isArray(rawData) ? rawData : rawData.content || [];
        const todayName = DAYS[new Date().getDay()];

        const filtered = await Promise.all(
          list.map(async (offer: any) => {
            if (!offer?.isActive || !offer?.quickOfferActive) return null;
            if (isOfferExpired(offer?.expiresAt)) return null;

            const isDayActive =
              !offer?.activeDays?.length || offer.activeDays.includes(todayName);
            if (!isDayActive) return null;
            if (!offer?.propertyTypeId) return null;

            try {
              const propertyTypeRes = await getPropertyTypeById(offer.propertyTypeId);
              const propertyType = propertyTypeRes?.data;
              if (!propertyType?.isActive) return null;

              const typeName = normalize(propertyType?.typeName);
              if (typeName !== "hotel") return null;

              return {
                id: offer.id,
                title: offer.title || "",
                description: offer.description || "",
                couponCode: offer.couponCode,
                ctaText: offer.ctaText || "",
                ctaLink: offer.ctaUrl || offer.ctaLink || null,
                expiresAt: offer.expiresAt,
                propertyType: propertyType.typeName || "Hotel",
                image: offer.image?.url
                  ? {
                      src: offer.image.url,
                      type: offer.image.type,
                      alt: offer.title || "Special Offer",
                    }
                  : null,
              };
            } catch {
              return null;
            }
          }),
        );

        const validOffers = filtered
          .filter(Boolean)
          .sort((a: any, b: any) => b.id - a.id);

        if (!validOffers.length) return;

        setOffers(validOffers);
        const showTimer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(showTimer);
      } catch (err) {
        console.error("Quick offer fetch failed", err);
      }
    };

    fetchQuickOffers();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClaim = (offer: any) => {
    if (offer?.ctaLink && offer.ctaLink !== "#") {
      window.open(offer.ctaLink, "_blank");
      return;
    }
    navigate("/checkout");
  };

  if (!offers.length) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[59]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: "-46%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.94, y: "-46%", x: "-50%" }}
            transition={{ duration: 0.35, type: "spring" }}
            className="fixed top-1/2 left-1/2 z-[60] w-[92vw] max-w-[460px] bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {offers.length > 1 && (
              <>
                <button
                  onClick={() => swiper?.slidePrev()}
                  className="absolute left-3 top-1/2 z-30 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/55 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => swiper?.slideNext()}
                  className="absolute right-3 top-1/2 z-30 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/55 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={1}
              onSwiper={setSwiper}
              pagination={{ clickable: true }}
              allowTouchMove={offers.length > 1}
              autoplay={
                offers.length > 1
                  ? {
                      delay: 3500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
            >
              {offers.map((offer) => (
                <SwiperSlide key={offer.id}>
                  {(() => {
                    const hasTextContent = Boolean(
                      offer.title || offer.description || offer.couponCode,
                    );
                    const hasCta = Boolean(offer.ctaText && offer.ctaText.trim());
                    const hasMetaInfo = Boolean(offer.expiresAt || offer.couponCode);
                    const showFullFrameMedia = !hasTextContent && !hasCta;

                    return (
                  <div>
                    <div
                      className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${
                        showFullFrameMedia ? "h-[520px]" : "h-[320px]"
                      }`}
                    >
                      {offer.image?.src ? (
                        offer.image.type === "VIDEO" ? (
                          <video
                            src={offer.image.src}
                            className="w-full h-full object-contain"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={offer.image.src}
                            alt={offer.image.alt}
                            className="w-full h-full object-contain"
                          />
                        )
                      ) : (
                        <OptimizedImage
                          {...siteContent.images.hero.slide3}
                          className="w-full h-full object-contain"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Exclusive
                        </span>
                        {offer.propertyType && (
                          <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {offer.propertyType}
                          </span>
                        )}
                      </div>

                      {!showFullFrameMedia && hasTextContent && (
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <h3 className="font-serif text-xl font-bold leading-tight">
                            {offer.title}
                          </h3>
                          {offer.description && (
                            <p className="text-white/85 text-[11px] mt-1 line-clamp-2">
                              {offer.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {!showFullFrameMedia && (hasMetaInfo || hasCta) && (
                    <div className="p-4 md:p-5 bg-card relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />

                      {(offer.expiresAt || offer.couponCode) && (
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          {offer.expiresAt && (
                            <>
                              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                                Offer Expires In
                              </p>
                              <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-base">
                                <Clock className="w-3.5 h-3.5" />
                                <CountdownTimer expiresAt={offer.expiresAt} />
                              </div>
                            </>
                          )}
                        </div>

                        {offer.couponCode && offer.couponCode !== "N/A" && (
                          <div className="text-right">
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                              Coupon Code
                            </p>
                            <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20">
                              {offer.couponCode}
                            </code>
                          </div>
                        )}
                      </div>
                      )}

                      {hasCta && (
                        <Button
                          onClick={() => handleClaim(offer)}
                          className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                        >
                          {offer.ctaText}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}

                      {hasCta && (
                        <p className="text-center text-[10px] text-muted-foreground mt-2.5">
                          *Terms and conditions apply.
                        </p>
                      )}
                    </div>
                    )}
                  </div>
                    );
                  })()}
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
