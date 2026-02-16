import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteContent } from "@/data/siteContent";
import { getDailyOffers, getPropertyTypeById } from "@/Api/Api";

// ── Inline countdown (HH:MM:SS plain text for popup) ─────────────────────────
function CountdownTimer({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState("--:--:--");

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setLabel("Expired"); return; }
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

// ─────────────────────────────────────────────────────────────────────────────

export default function SpecialOfferPopup() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [offer, setOffer] = useState<any>(null);

  // ── Fetch latest quickOfferActive offer (mirrors HotelOffersCarousel logic) ──
  useEffect(() => {
    const fetchQuickOffer = async () => {
      try {
        const res = await getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 });
        const rawData = res.data?.data || res.data || [];
        const list: any[] = Array.isArray(rawData) ? rawData : rawData.content || [];

        // Filter: isActive + quickOfferActive, then validate propertyTypeId via API
        const candidates = await Promise.all(
          list.map(async (o: any) => {
            if (!o.isActive || !o.quickOfferActive) return null;

            // Validate propertyType is still active (same guard as HotelOffersCarousel)
            if (o.propertyTypeId) {
              try {
                const ptRes = await getPropertyTypeById(o.propertyTypeId);
                if (!ptRes.data?.isActive) return null;
              } catch {
                return null;
              }
            }

            return o;
          }),
        );

        // Pick the single latest one (highest id = most recently created)
        const valid = candidates
          .filter(Boolean)
          .sort((a: any, b: any) => b.id - a.id);

        if (!valid.length) return;
        setOffer(valid[0]);

        // Show popup after 3 s, only once per session
        const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
        if (!hasSeenPopup) {
          const showTimer  = setTimeout(() => setIsVisible(true), 3000);
          const hideTimer  = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem("hasSeenPopup", "true");
          }, 18000); // 3 s delay + 15 s display
          return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
        }
      } catch (err) {
        console.error("Quick offer fetch failed", err);
      }
    };

    fetchQuickOffer();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  const handleClaim = () => {
    sessionStorage.setItem("hasSeenPopup", "true");
    if (offer?.ctaLink && offer.ctaLink !== "#") {
      window.open(offer.ctaLink, "_blank");
    } else {
      navigate("/checkout");
    }
  };

  // No quick offer found — render nothing
  if (!offer) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[59]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1,  y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9,   y: "-40%", x: "-50%" }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed top-1/2 left-1/2 z-[60] w-[95vw] md:w-[520px] bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image Banner */}
            <div className="relative h-64 w-full bg-muted">
              {offer.image?.url ? (
                offer.image.type === "VIDEO" ? (
                  <video
                    src={offer.image.url}
                    className="w-full h-full object-cover"
                    autoPlay loop muted playsInline
                  />
                ) : (
                  <img
                    src={offer.image.url}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                // Fallback to static hero image if offer has no media
                <OptimizedImage
                  {...siteContent.images.hero.slide3}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 text-white">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3" /> Exclusive
                </span>
                <h3 className="font-serif text-2xl font-bold leading-tight">
                  {offer.title || "Special Offer"}
                </h3>
                {offer.description && (
                  <p className="text-white/80 text-xs mt-0.5">
                    {offer.description}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />

              <div className="flex items-center justify-between mb-4">
                {/* Live countdown */}
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                    Offer Expires In
                  </p>
                  <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-lg">
                    <Clock className="w-4 h-4" />
                    <CountdownTimer expiresAt={offer.expiresAt} />
                  </div>
                </div>

                {/* Coupon code — hidden when absent */}
                {offer.couponCode && offer.couponCode !== "N/A" && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                      Coupon Code
                    </p>
                    <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-bold border border-primary/20">
                      {offer.couponCode}
                    </code>
                  </div>
                )}
              </div>

               <Button
                onClick={handleClaim}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow animate-pulse-slow"
              >
                Book Now & Save <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-[10px] text-muted-foreground mt-3">
                *Terms and conditions apply.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}