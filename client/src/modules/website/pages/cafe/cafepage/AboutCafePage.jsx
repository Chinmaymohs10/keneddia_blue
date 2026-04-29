import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Phone } from "lucide-react";
import {
  getAllRestaurantAbout,
  getRestaurantImageSocialByProperty,
  getRestaurantConnectByProperty,
} from "@/Api/RestaurantApi";
import { siteContent } from "@/data/siteContent";

// --- Helpers ---
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const min = m || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, "0")}:${min} ${ampm}`;
}

// --- Fallbacks ---
const FALLBACK_ABOUT = {
  id: 1,
  subTitle: "Our Roots — Est. 2018",
  sectionTitle: "A Cafe Built On Craft & Community",
  description:
    "Kennedia Cafe was born from a simple belief — that a great cup of coffee and a welcoming space can transform an ordinary day. We source our beans directly from small-batch farms, roast in-house every morning, and bake everything fresh before you arrive.",
  openingTime: "07:00 AM",
  closingTime: "11:00 PM",
  days: "MONDAY – SUNDAY",
};

const FALLBACK_IMAGES = [siteContent.images.cafes.minimalist.src];

const FALLBACK_CONNECT = {
  sectionLabel: "Connect",
  title: "+91 98765 43210",
  subtitle: "Reservations & Private Tables",
  phoneNumber: "919876543210",
};

export default function AboutCafePage({ propertyId }) {
  const [aboutData, setAboutData] = useState(FALLBACK_ABOUT);
  const [carouselImages, setCarouselImages] = useState(FALLBACK_IMAGES);
  const [connectData, setConnectData] = useState(FALLBACK_CONNECT);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!propertyId) return;

    // 1. Fetch About Content
    getAllRestaurantAbout()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const matched = list.find((item) => item.propertyId === propertyId && item.isActive);
        if (matched) {
          setAboutData({
            subTitle: matched.badgeLabel || FALLBACK_ABOUT.subTitle,
            sectionTitle: matched.headlineLine1 || FALLBACK_ABOUT.sectionTitle,
            description: matched.description || FALLBACK_ABOUT.description,
            openingTime: matched.openingTime ? formatTime(matched.openingTime) : FALLBACK_ABOUT.openingTime,
            closingTime: matched.closingTime ? formatTime(matched.closingTime) : FALLBACK_ABOUT.closingTime,
            days: matched.days || FALLBACK_ABOUT.days,
          });
        }
      })
      .catch(console.error);

    // 2. Fetch Images
    getRestaurantImageSocialByProperty(propertyId)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data && data.isActive && data.images?.length > 0) {
          setCarouselImages(data.images.map((img) => img.url));
        }
      })
      .catch(console.error);

    // 3. Fetch Connect Info
    getRestaurantConnectByProperty(propertyId)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data && data.isActive) {
          setConnectData({
            sectionLabel: data.sectionLabel || FALLBACK_CONNECT.sectionLabel,
            title: data.title || FALLBACK_CONNECT.title,
            subtitle: data.subtitle || FALLBACK_CONNECT.subtitle,
            phoneNumber: data.phoneNumber || FALLBACK_CONNECT.phoneNumber,
          });
        }
      })
      .catch(console.error);
  }, [propertyId]);

  // Handle auto-rotate if multiple images
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages]);

  return (
    <section className="overflow-hidden bg-[#F5F5F3] px-4 py-8 transition-colors duration-500 dark:bg-[#050505] sm:px-6 lg:py-10">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-zinc-900 dark:text-white">About Us</h2>
          <div className="mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[45%_55%] lg:gap-10">
          {/* Image Section */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/10 shadow-2xl dark:border-white/10"
              >
                <img
                  src={carouselImages[currentIndex]}
                  alt="Cafe About"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute -bottom-2 -right-2 h-2/3 w-2/3 rounded-xl border-2 border-primary/20 -z-0 sm:-bottom-4 sm:-right-4" />
            <div className="absolute -left-2 -top-2 h-1/2 w-1/2 rounded-xl bg-zinc-100/80 -z-0 dark:bg-white/5 sm:-left-4 sm:-top-4" />
          </div>

          {/* Content Section */}
          <div className="relative lg:pl-4">
            <div className="space-y-4 sm:space-y-5">
              <div>
                <h3 className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <MapPin className="h-3 w-3" />
                  {aboutData.subTitle}
                </h3>
                <h2 className="mb-3 text-2xl font-serif leading-tight text-zinc-900 dark:text-white sm:text-3xl md:text-4xl">
                  {aboutData.sectionTitle}
                </h2>
              </div>

              <p className="text-sm font-light leading-relaxed text-zinc-500 dark:text-white/60 sm:text-base">
                {aboutData.description}
              </p>

              <div className="grid grid-cols-1 gap-5 border-t border-zinc-200 pt-4 dark:border-white/10 sm:grid-cols-2 sm:gap-6">
                {/* Availability */}
                <div>
                  <h4 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                    Availability
                  </h4>
                  <p className="flex items-center gap-2 font-serif text-sm italic text-zinc-900 dark:text-white sm:text-base">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {aboutData.openingTime} – {aboutData.closingTime}
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-tighter text-zinc-400 dark:text-white/30 uppercase">
                    {aboutData.days}
                  </p>
                </div>

                {/* Connect */}
                <div>
                  <h4 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                    {connectData.sectionLabel}
                  </h4>
                  <a
                    href={`tel:+${connectData.phoneNumber.replace(/\D/g, "")}`}
                    className="block cursor-pointer font-serif text-sm italic text-zinc-900 transition-colors hover:text-primary dark:text-white sm:text-base"
                  >
                    {connectData.title || connectData.phoneNumber}
                  </a>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 dark:text-white/30">
                    {connectData.subtitle}
                  </span>
                </div>
              </div>

              {/* Dot navigation (if multiple images) */}
              {carouselImages.length > 1 && (
                <div className="mt-6 flex gap-2">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1 cursor-pointer rounded-full transition-all duration-300 ${
                        idx === currentIndex
                          ? "w-6 bg-primary"
                          : "w-3 bg-zinc-200 hover:bg-primary/50 dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
