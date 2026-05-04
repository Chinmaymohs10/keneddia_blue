import React, { useRef, useState, useEffect } from "react";
import { useWhatsAppInfo } from "@/hooks/useWhatsAppInfo";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Clock,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Contact2,
  X,
  MessageSquare,
  Link as LinkIcon,
} from "lucide-react";
import {
  getAllRestaurantAbout,
  getRestaurantImageSocialByProperty,
  getRestaurantConnectByProperty,
} from "@/Api/RestaurantApi";

// --- Assets (fallback images) ---
import aboutimg1 from "@/assets/resturant_images/3dGallery/3dGallery3.jpeg";
import aboutimg2 from "@/assets/resturant_images/3dGallery/3dGallery4.jpeg";
import aboutimg3 from "@/assets/resturant_images/3dGallery/3dGallery5.jpeg";

// --- Markdown Parser ---
// Supports **bold** and *italic* syntax from the API description field
function parseMarkdown(text) {
  if (!text) return null;

  // Split on **bold** and *italic* tokens, preserving delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-zinc-900 dark:text-white font-medium">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic font-medium text-primary">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

// --- Static Fallbacks ---
const FALLBACK_ABOUT = {
  badgeLabel: "Authentic Heritage Dining",
  headlineLine1: "Experience elegance, taste",
  headlineLine2: "and unforgettable dining.",
  description:
    "We believe dining is more than just a meal; it's a curated premium experience. Our philosophy balances bold Indian tradition with refined global elegance, all within a thoughtfully designed setting.",
  openingTime: "11:00 AM",
  closingTime: "11:30 PM",
  days: "Monday — Sunday",
};

const FALLBACK_IMAGES = [aboutimg1, aboutimg2, aboutimg3];

const FALLBACK_SOCIALS = [
  { platformName: "Instagram", url: "#" },
  { platformName: "Facebook", url: "#" },
  { platformName: "Twitter", url: "#" },
  { platformName: "WhatsApp", url: "#" },
];

const FALLBACK_CONNECT = {
  sectionLabel: "Connect",
  title: "Get In Touch",
  subtitle: "Direct Reservation",
  whatsappContact: "919999999999",
  phoneNumber: "919999999999",
};

// --- Helpers ---
function formatTime(timeStr) {
  if (!timeStr) return "";
  // handles "09:00:00" → "09:00 AM"
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const min = m || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, "0")}:${min} ${ampm}`;
}

function getPlatformIcon(platformName) {
  const name = (platformName || "").toLowerCase();
  if (name.includes("instagram")) return <Instagram size={14} />;
  if (name.includes("facebook")) return <Facebook size={14} />;
  if (name.includes("twitter") || name.includes("x"))
    return <Twitter size={14} />;
  if (name.includes("whatsapp")) return <MessageCircle size={14} />;
  return <LinkIcon size={14} />;
}

// --- Contact Popup ---
const ContactPopup = ({ isOpen, onClose, connectData }) => {
  const whatsappHref = connectData.whatsappContact
    ? `https://wa.me/${connectData.whatsappContact.replace(/\D/g, "")}`
    : "#";
  const phoneHref = connectData.phoneNumber
    ? `tel:+${connectData.phoneNumber.replace(/\D/g, "")}`
    : "#";

  const contactOptions = [
    {
      name: "WhatsApp",
      sub: "Instant Chat",
      icon: <MessageSquare size={24} />,
      link: whatsappHref,
      bgColor: "bg-[#25D366]",
      lightBg: "bg-[#25D366]/10",
    },
    {
      name: "Direct Call",
      sub: "Speak to Host",
      icon: <Phone size={24} />,
      link: phoneHref,
      bgColor: "bg-primary",
      lightBg: "bg-primary/10",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-8 z-[101] shadow-2xl border border-zinc-100 dark:border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-zinc-900 dark:text-white italic">
                  {connectData.title || "Quick Connect"}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest font-bold">
                  {connectData.subtitle || "Choose preferred method"}
                </p>
              </div>
              <div className="grid gap-4">
                {contactOptions.map((opt, i) => (
                  <a
                    key={i}
                    href={opt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-2xl ${opt.lightBg} transition-all group`}
                  >
                    <div
                      className={`w-12 h-12 ${opt.bgColor} text-white rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm text-zinc-900 dark:text-white">
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {opt.sub}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---
export default function AboutResturantPage({ propertyId, initialAboutSections }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const containerRef = useRef(null);

  const { phoneNumber: waPhone } = useWhatsAppInfo({ propertyId, propertyTypeName: "Restaurant" });

  // --- API State ---
  const [aboutData, setAboutData] = useState(() => {
    if (!initialAboutSections?.length) return FALLBACK_ABOUT;
    const matched = initialAboutSections.find((a) => a.propertyId === propertyId && a.isActive);
    if (!matched) return FALLBACK_ABOUT;
    return {
      badgeLabel: matched.badgeLabel || FALLBACK_ABOUT.badgeLabel,
      headlineLine1: matched.headlineLine1 || FALLBACK_ABOUT.headlineLine1,
      headlineLine2: matched.headlineLine2 || FALLBACK_ABOUT.headlineLine2,
      description: matched.description || FALLBACK_ABOUT.description,
      openingTime: matched.openingTime || FALLBACK_ABOUT.openingTime,
      closingTime: matched.closingTime || FALLBACK_ABOUT.closingTime,
      days: matched.days || FALLBACK_ABOUT.days,
    };
  });
  const [carouselImages, setCarouselImages] = useState(FALLBACK_IMAGES);
  const [socials, setSocials] = useState(FALLBACK_SOCIALS);
  const [connectData, setConnectData] = useState(FALLBACK_CONNECT);

  // --- Fetch All APIs filtered by propertyId ---
  useEffect(() => {
    if (!propertyId) return;

    // 1. About content
    if (initialAboutSections?.length) {
      // SSR data already used; skip about fetch
    } else
    getAllRestaurantAbout()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data;
        if (data?.length > 0) {
          const matched = data.find(
            (item) => item.propertyId === propertyId && item.isActive,
          );
          if (matched) {
            setAboutData({
              badgeLabel: matched.badgeLabel || FALLBACK_ABOUT.badgeLabel,
              headlineLine1:
                matched.headlineLine1 || FALLBACK_ABOUT.headlineLine1,
              headlineLine2:
                matched.headlineLine2 || FALLBACK_ABOUT.headlineLine2,
              description: matched.description || FALLBACK_ABOUT.description,
              openingTime: matched.openingTime
                ? formatTime(matched.openingTime)
                : FALLBACK_ABOUT.openingTime,
              closingTime: matched.closingTime
                ? formatTime(matched.closingTime)
                : FALLBACK_ABOUT.closingTime,
              days: matched.days || FALLBACK_ABOUT.days,
            });
          }
        }
      })
      .catch(() => {
        // keep fallback
      });

    // 2. Images + Social Links
    getRestaurantImageSocialByProperty(propertyId)
      .then((res) => {
        const data = res?.data || res;
        if (data && data.propertyId === propertyId && data.isActive) {
          // Images
          if (data.images?.length > 0) {
            setCarouselImages(data.images.map((img) => img.url));
          }
          // Socials
          if (data.socialLinks?.length > 0) {
            const activeSocials = data.socialLinks
              .filter((s) => s.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder);
            if (activeSocials.length > 0) setSocials(activeSocials);
          }
        }
      })
      .catch(() => {
        // keep fallback
      });

    // 3. Connect section
    getRestaurantConnectByProperty(propertyId)
      .then((res) => {
        const data = res?.data || res;
        if (data && data.propertyId === propertyId && data.isActive) {
          setConnectData({
            sectionLabel: data.sectionLabel || FALLBACK_CONNECT.sectionLabel,
            title: data.title || FALLBACK_CONNECT.title,
            subtitle: data.subtitle || FALLBACK_CONNECT.subtitle,
            whatsappContact:
              data.whatsappContact || FALLBACK_CONNECT.whatsappContact,
            phoneNumber: data.phoneNumber || FALLBACK_CONNECT.phoneNumber,
          });
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, [propertyId]);

  // --- Auto Carousel ---
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages]);

  // --- Scroll Animations ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const textX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15px", "15px"]);

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative py-16 md:py-20 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden"
    >
      <ContactPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        connectData={{ ...connectData, whatsappContact: waPhone || connectData.whatsappContact }}
      />

      {/* DECORATIVE BACKGROUND TEXT */}
      <motion.div
        style={{ x: textX }}
        className="absolute top-1/4 left-0 whitespace-nowrap text-[8rem] md:text-[12rem] font-black text-zinc-100 dark:text-white/[0.02] pointer-events-none select-none italic uppercase z-0"
      >
        {aboutData.badgeLabel}
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* LEFT: AUTO CAROUSEL IMAGE */}
          <div className="lg:col-span-4 relative max-w-sm mx-auto lg:mx-0">
            <motion.div
              style={{ y: imageY }}
              className="relative rounded-2xl overflow-hidden aspect-square shadow-xl border border-zinc-100 dark:border-white/5"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIndex}
                  src={carouselImages[imgIndex]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  alt="Restaurant Carousel"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>

            {/* SOCIAL LINKS */}
            <div className="absolute -bottom-4 left-4 flex gap-2">
              {socials.map((social, i) => (
                <a
                  key={social.id || i}
                  href={social.url || social.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white dark:bg-zinc-900 shadow-lg rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors border border-zinc-100 dark:border-white/10"
                >
                  {getPlatformIcon(social.platformName)}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              {/* Badge */}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">
                  {aboutData.badgeLabel}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white leading-tight tracking-tight">
                {aboutData.headlineLine1} <br />
                <span className="italic text-zinc-400 dark:text-white/40">
                  {aboutData.headlineLine2}
                </span>
              </h2>

              {/* Description */}
              <p className="text-zinc-600 dark:text-white/70 text-base md:text-lg leading-relaxed font-light max-w-3xl">
                {parseMarkdown(aboutData.description)}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-white/10">
              {/* AVAILABILITY STAT */}
              <div className="group">
                <h4 className="text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" /> Availability
                </h4>
                <div className="space-y-1">
                  <p className="text-zinc-900 dark:text-white font-serif text-lg md:text-xl italic leading-tight">
                    {aboutData.openingTime} — {aboutData.closingTime}
                  </p>
                  <p className="text-zinc-400 dark:text-white/30 text-[9px] font-bold tracking-widest uppercase">
                    {aboutData.days}
                  </p>
                </div>
              </div>

              {/* CONNECT SECTION */}
              <div
                className="group cursor-pointer"
                onClick={() => setIsPopupOpen(true)}
              >
                <h4 className="text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-primary" />{" "}
                  {connectData.sectionLabel}
                </h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm active:scale-95">
                    <Contact2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-zinc-900 dark:text-white font-serif text-lg md:text-xl italic block leading-tight">
                      {connectData.title}
                    </span>
                    <span className="text-zinc-400 dark:text-white/30 text-[9px] font-bold tracking-widest uppercase">
                      {connectData.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
