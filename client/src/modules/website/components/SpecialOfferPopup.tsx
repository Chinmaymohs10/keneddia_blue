import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteContent } from "@/data/siteContent";

export default function SpecialOfferPopup() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check session storage
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
    if (!hasSeenPopup) {
      // Show after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      // Auto-hide after 15 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("hasSeenPopup", "true");
      }, 18000); // 3s delay + 15s display

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  const handleClaim = () => {
    sessionStorage.setItem("hasSeenPopup", "true");
    navigate("/checkout?offer=limited-time-special&discount=20");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[59]"
            onClick={handleClose}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed top-1/2 left-1/2 z-[60] w-[95vw] md:w-[520px] h-auto bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image Banner - Increased Height */}
            <div className="relative h-64 w-full">
              <OptimizedImage
                {...siteContent.images.hero.slide3} // Using a nice hero image
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Exclusive
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold leading-tight">
                  Unlock 20% Off
                </h3>
                <p className="text-white/80 text-xs">On your first luxury stay with us</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-card relative overflow-hidden">
              {/* Decorative shine */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                    Offer Expires In
                  </p>
                  <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-lg">
                    <Clock className="w-4 h-4" />
                    <span>04:59:59</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                    Coupon Code
                  </p>
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-bold border border-primary/20">
                    WELCOME20
                  </code>
                </div>
              </div>

              <Button
                onClick={handleClaim}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow animate-pulse-slow"
              >
                Book Now & Save <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-[10px] text-muted-foreground mt-3">
                *Terms and conditions apply. Valid for next 24 hours.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}