import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Hotel,
  UtensilsCrossed,
  Coffee,
  Wine,
  Loader2,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  getAboutUsAdmin,
  getVenturesByAboutUsId,
  getPublicRecognitionsByAboutUsId,
} from "@/Api/Api";

/* --- Interfaces --- */
interface Venture {
  id: number;
  ventureName: string;
  logoUrl: string;
  isActive: boolean;
}

interface Recognition {
  id: number;
  value: string;
  title: string;
  subTitle: string;
  isActive: boolean;
}

interface MediaItem {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
}

interface AboutUsData {
  id: number;
  sectionTitle: string;
  subTitle: string;
  description: string;
  videoUrl: string;
  videoTitle: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  isActive: boolean;
  media?: MediaItem[];
  ventures?: Venture[];
  recognitions?: Recognition[];
}

/* --- Helper --- */
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^"&?\/\s]{11})/,
  );

  const videoId = match?.[1];
  if (!videoId) return url;

  // Added mute=1 (required for autoplay) and enablejsapi=1
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&enablejsapi=1`.replace(/\s+/g, "");
};

export default function AboutUsSection() {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAboutUs = async () => {
    try {
      setIsLoading(true);
      const response = await getAboutUsAdmin();
      const data = response?.data || response;

      if (Array.isArray(data) && data.length > 0) {
        const latestData = [...data].sort((a, b) => b.id - a.id)[0];
        setAboutUsData(latestData);
      }
    } catch (error) {
      console.error("Error fetching About Us:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedData = async (id: number) => {
    try {
      const [venturesRes, recognitionsRes] = await Promise.all([
        getVenturesByAboutUsId(id),
        getPublicRecognitionsByAboutUsId(id),
      ]);

      if (venturesRes?.data) setVentures(venturesRes.data);
      if (recognitionsRes?.data) setRecognitions(recognitionsRes.data);
    } catch (error) {
      console.error("Error fetching related data:", error);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  useEffect(() => {
    if (aboutUsData?.id) {
      if (aboutUsData.ventures && aboutUsData.ventures.length > 0) {
        setVentures(aboutUsData.ventures);
      } else {
        fetchRelatedData(aboutUsData.id);
      }
      if (aboutUsData.recognitions && aboutUsData.recognitions.length > 0) {
        setRecognitions(aboutUsData.recognitions);
      }
    }
  }, [aboutUsData]);

  // Construct dynamic carousel items
  const mediaItems: { type: string; src: string }[] = [];
  if (aboutUsData?.videoUrl) {
    mediaItems.push({
      type: "video",
      src: getYouTubeEmbedUrl(aboutUsData.videoUrl),
    });
  }
  if (aboutUsData?.media && aboutUsData.media.length > 0) {
    aboutUsData.media.forEach((m) => {
      mediaItems.push({
        type: m.type === "VIDEO" ? "video" : "image",
        src: m.type === "VIDEO" ? getYouTubeEmbedUrl(m.url) : m.url,
      });
    });
  }
  if (mediaItems.length === 0) {
    mediaItems.push({ type: "image", src: siteContent.images.about.main.src });
  }

  // --- NEW: Auto Carousel Scroll Logic ---
  useEffect(() => {
    if (mediaItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
    }, 5000); // Scrolls every 5 seconds

    return () => clearInterval(interval);
  }, [mediaItems.length]);

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <section className="py-10 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-muted" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-stretch">
          {/* Left Column: Media Showcase Carousel */}
          <div className="relative group flex flex-col">
            {/* FIX: Use aspect-video to maintain a fixed frame size */}
            <div className="relative flex-1 aspect-video md:aspect-auto md:min-h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-card border border-border/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMediaIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full absolute inset-0"
                >
                  {mediaItems[currentMediaIndex].type === "video" ? (
                    <iframe
                      key={`video-player-${currentMediaIndex}`}
                      src={mediaItems[currentMediaIndex].src}
                      title={aboutUsData?.videoTitle || "Brand Video"}
                      className="w-full h-full object-cover"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      loading="eager"
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{ border: 0 }}
                    />
                  ) : (
                    <img
                      src={mediaItems[currentMediaIndex].src}
                      alt="Showcase"
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Overlay Indicators */}
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 text-white">
                  {mediaItems[currentMediaIndex].type === "video" ? (
                    <Video size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </div>
              </div>
            </div>

            {/* Carousel Navigation Dots */}
            {mediaItems.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentMediaIndex === index
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30 w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-3 text-muted-foreground">
                {aboutUsData?.sectionTitle || "ABOUT US"}
              </h2>
              <h3 className="text-4xl md:text-5xl font-serif leading-tight mb-4 text-foreground">
                {aboutUsData?.subTitle || "Our Story"}
              </h3>
              <p className="text-lg font-light leading-relaxed text-muted-foreground whitespace-pre-line">
                {aboutUsData?.description}
              </p>
            </div>

            {/* Dynamic Ventures Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-70 text-muted-foreground">
                Our Ventures
              </h4>
              <div className="flex flex-wrap gap-8">
                {ventures.map((venture) => (
                  <div
                    key={venture.id}
                    className="flex flex-col items-center space-y-3 group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-900/90 border border-white/10 transition-transform group-hover:-translate-y-1 overflow-hidden">
                      <img
                        src={venture.logoUrl}
                        alt={venture.ventureName}
                        className="w-10 h-10 object-contain rounded-full"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                      {venture.ventureName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Recognitions Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70 text-muted-foreground">
                Globally Recognized
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {recognitions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-secondary/20 border border-border/50 rounded-lg p-4 text-center group hover:border-primary/30 transition-all shadow-sm"
                  >
                    <div className="text-xl font-serif font-bold text-primary mb-1">
                      {item.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-tighter font-bold text-foreground mb-1 leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground font-medium opacity-60">
                      {item.subTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}