import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Star,
  X,
  ImageIcon,
  Loader2,
  User,
  Edit2,
  Video,
  Youtube,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { InstagramEmbed } from "react-social-media-embed";
import {
  getGuestExperienceSection,
  createGuestExperienceByGuest,
  getGuestExperienceSectionHeader,
  getGuestExperineceRatingHeader,
  getPropertyTypes,
} from "@/Api/Api";

import "swiper/css";
import "swiper/css/navigation";

// Types & Utils
interface ExperienceItem {
  id: string | number;
  title: string;
  description: string;
  author: string;
  type: "video" | "image";
  videoUrl?: string;
  imageUrl?: string;
  mediaList?: any[];
  displayVideo?: string;
}

interface SectionHeader {
  id?: number;
  sectionTag?: string;
  title?: string;
}
interface RatingHeader {
  description?: string;
  rating?: number;
  isActive?: boolean;
}

interface HotelReviewsInitialData {
  guestExperiences?: ExperienceItem[];
  sectionHeader?: SectionHeader | null;
  ratingHeader?: RatingHeader | null;
}

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isHotelType = (value = "") => normalize(value) === "hotel";

const isYoutubeUrl = (url: string): boolean =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url.trim());
const isInstagramUrl = (url: string): boolean =>
  /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv)\/.+/.test(url.trim());

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const matches = [
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
    /youtu\.be\/([^"&?\/\s]{11})/,
    /[?&]v=([^"&?\/\s]{11})/,
    /embed\/([^"&?\/\s]{11})/,
  ];
  for (const regex of matches) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  return null;
};

const getInstagramId = (url: string): string | null => {
  if (!url) return null;
  const clean = url.trim().split("?")[0].replace(/\/$/, "");
  const match = clean.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_\-]+)/);
  return match ? match[1] : null;
};

const getYoutubeThumbnail = (url: string): string => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const buildMediaList = (
  item: any,
): { type: "image" | "video"; url: string }[] => {
  const allMedia: { type: "image" | "video"; url: string }[] = [];
  const seenUrls = new Set<string>();
  const add = (type: "image" | "video", url: any) => {
    if (
      url &&
      typeof url === "string" &&
      url.trim() !== "" &&
      !seenUrls.has(url.trim())
    ) {
      seenUrls.add(url.trim());
      allMedia.push({ type, url: url.trim() });
    }
  };
  if (item.mediaList && Array.isArray(item.mediaList)) {
    item.mediaList.forEach((m: any) => {
      const url = m.url || m.imageUrl || m.videoUrl;
      if (!url) return;
      const isVid =
        m.type === "VIDEO" ||
        isYoutubeUrl(url) ||
        isInstagramUrl(url) ||
        url.match(/\.(mp4|webm|mov|ogg)$/i);
      add(isVid ? "video" : "image", url);
    });
  }
  if (item.videoUrl) add("video", item.videoUrl);
  if (item.imageUrl) add("image", item.imageUrl);
  return allMedia;
};

export default function HotelReviewsSection({
  initialData,
  initialHotelTypeId,
}: {
  initialData?: HotelReviewsInitialData;
  initialHotelTypeId?: number | null;
}) {
  const [guestExperiences, setGuestExperiences] = useState<ExperienceItem[]>(
    Array.isArray(initialData?.guestExperiences)
      ? initialData.guestExperiences
      : [],
  );
  const [isLoading, setIsLoading] = useState(
    !Array.isArray(initialData?.guestExperiences),
  );
  const [mediaPreviews, setMediaPreviews] = useState<
    { type: string; url: string; file: File }[]
  >([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [ytError, setYtError] = useState("");
  const [sectionHeader, setSectionHeader] = useState<SectionHeader | null>(
    initialData?.sectionHeader || null,
  );
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const [ratingHeader, setRatingHeader] = useState<RatingHeader | null>(
    initialData?.ratingHeader || null,
  );
  const [hotelTypeId, setHotelTypeId] = useState<number | null>(
    initialHotelTypeId ?? null,
  );
  const swiperRef = useRef<any>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence & Effects
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchExperiences = async (resolvedHotelTypeId: number | null) => {
    try {
      const res = await getGuestExperienceSection({ size: 100 });
      const rawData = res?.data?.data || res?.data || res || [];
      const list = Array.isArray(rawData) ? rawData : rawData?.content || [];
      const filtered = list
        .filter((item) =>
          resolvedHotelTypeId != null
            ? Number(item?.propertyTypeId) === Number(resolvedHotelTypeId)
            : false,
        )
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || 0).getTime();
          const dateB = new Date(b?.createdAt || 0).getTime();
          return dateB - dateA;
        });
      setGuestExperiences(filtered);
    } catch (err) {
      console.error(err);
      setGuestExperiences([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(initialData?.guestExperiences) && initialHotelTypeId != null) {
      return;
    }

    const init = async () => {
      try {
        setIsLoading(true);
        const [typesRes, headerRes, ratingRes] = await Promise.all([
          getPropertyTypes(),
          getGuestExperienceSectionHeader(),
          getGuestExperineceRatingHeader(),
        ]);

        const types = typesRes?.data || typesRes || [];
        const hotelType = Array.isArray(types)
          ? types.find((type) => type?.isActive && isHotelType(type?.typeName))
          : null;
        const resolvedHotelTypeId = hotelType?.id ? Number(hotelType.id) : null;
        setHotelTypeId(resolvedHotelTypeId);

        setSectionHeader(
          Array.isArray(headerRes?.data) ? headerRes.data[0] : headerRes?.data,
        );
        setRatingHeader(
          Array.isArray(ratingRes?.data) ? ratingRes.data[0] : ratingRes?.data,
        );

        await fetchExperiences(resolvedHotelTypeId);
      } catch (error) {
        console.error("Failed to initialize hotel reviews section", error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews = Array.from(files).map((file) => ({
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        file,
      }));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      setShowPopup(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", feedbackText.slice(0, 20) || "Experience");
      formData.append("description", feedbackText);
      formData.append("author", authorName);
      formData.append("authorPhone", phone);
      formData.append("authorEmail", email);
      if (hotelTypeId != null) formData.append("propertyTypeId", String(hotelTypeId));
      if (ytLink.trim()) formData.append("videoUrl", ytLink.trim());
      mediaPreviews.forEach((m) => formData.append("files", m.file));
      await createGuestExperienceByGuest(formData);
      setFeedbackText("");
      setMediaPreviews([]);
      setYtLink("");
      setIsVerified(false);
      await fetchExperiences(hotelTypeId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMediaItem = (
    m: { type: "image" | "video"; url: string },
    idx: number,
  ) => {
    const videoKey = `video-${m.url}`;
    const isMuted = !mutedVideos.has(videoKey);

    if (m.type === "video") {
      // --- INSTAGRAM REELS ---
      if (isInstagramUrl(m.url)) {
        const id = getInstagramId(m.url);
        if (!id) return null;

        if (!isClient) {
          return (
            <div key={idx} className="relative flex h-full w-full items-center justify-center bg-black">
              <a href={m.url} target="_blank" rel="noreferrer" className="text-white text-xs font-bold underline">
                View on Instagram
              </a>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center group"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.6] min-w-[328px]">
              <InstagramEmbed url={`https://www.instagram.com/p/${id}/`} width={328} />
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none" />

            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
            >
              Open
            </a>
          </div>
        );
      }

      // --- YOUTUBE / SHORTS ---
      if (isYoutubeUrl(m.url)) {
        const videoId = getYoutubeId(m.url);
        return (
          <div
            key={idx}
            className="w-full h-full relative group"
            // style={{ border: "2px solid blue" }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1`}
              className="w-full h-full"
              style={{ border: "none" }}
              allow="autoplay; encrypted-media"
            />
          </div>
        );
      }

      // --- LOCAL VIDEO ---
      return (
        <div
          key={idx}
          className="relative group w-full h-full"
        >
          <video
            src={m.url}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMutedVideos((prev) => {
                const next = new Set(prev);
                next.has(videoKey) ? next.delete(videoKey) : next.add(videoKey);
                return next;
              });
            }}
            className="absolute bottom-3 right-3 z-20 bg-black/70 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isMuted ? (
              <VolumeX size={16} className="text-white" />
            ) : (
              <Volume2 size={16} className="text-white" />
            )}
          </button>
        </div>
      );
    }

    return (
      <img
        key={idx}
        src={m.url}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setMediaErrors((prev) => new Set(prev).add(m.url))}
      />
    );
  };
  const renderMediaGrid = (allMedia: any[], item: any) => {
    const hasMediaErrors = allMedia.some((m) => mediaErrors.has(m.url));
    const total = allMedia.length;
    if (total === 0 || hasMediaErrors) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
          <div className="text-center space-y-3 max-w-[90%]">
            {item.description?.trim() ? (
              <p className="text-white text-base md:text-lg italic leading-relaxed line-clamp-4">
                "{item.description}"
              </p>
            ) : (
              <p className="text-white/60 text-sm italic">
                No description provided
              </p>
            )}

            {item.author?.trim() && (
              <p className="text-white/90 font-bold text-lg md:text-xl">
                — {item.author}
              </p>
            )}
          </div>
        </div>
      );
    }
    // Using your original grid logic for 1, 2, 3, or 4+ items
    if (total === 1)
      return (
        <div className="w-full h-full">{renderMediaItem(allMedia[0], 0)}</div>
      );
    return (
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
        {allMedia.slice(0, 4).map((m, i) => (
          <div key={i} className="relative overflow-hidden">
            {renderMediaItem(m, i)}
            {i === 3 && total > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-black text-xl">
                  +{total - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasContent = feedbackText || mediaPreviews.length > 0 || ytLink.trim();
  const ytThumb =
    ytLink.trim() && isYoutubeUrl(ytLink) ? getYoutubeThumbnail(ytLink) : null;

  return (
    <section ref={sectionRef} className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch min-w-0">
          {/* LEFT: Experience Swiper */}
          <div className="lg:w-3/4 w-full min-w-0 flex flex-col bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                {sectionHeader?.sectionTag && (
                  <p className="text-xs uppercase font-bold tracking-widest text-primary mb-1">
                    {sectionHeader.sectionTag}
                  </p>
                )}
                <h2 className="text-2xl font-serif font-bold italic">
                  {sectionHeader?.title || "Moments of Excellence"}
                </h2>
              </div>
              {ratingHeader && (
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-primary mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < (ratingHeader.rating || 0)
                            ? "fill-primary text-primary"
                            : "text-primary/20"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tighter">
                    {ratingHeader.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-grow w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <Swiper
                    key={guestExperiences.length}
                    modules={[Autoplay, Navigation]}
                    spaceBetween={15}
                    slidesPerView={1.2}
                    breakpoints={{ 768: { slidesPerView: 3 } }}
                    autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    onSwiper={(s) => (swiperRef.current = s)}
                    className="h-full w-full"
                  >
                    {guestExperiences.map((item) => {
                      const allMedia = buildMediaList(item);
                      return (
                        <SwiperSlide key={item.id}>
                          <div className="bg-background border rounded-xl overflow-hidden h-full flex flex-col group">
                            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                              {renderMediaGrid(allMedia, item)}
                              {allMedia.length > 0 && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-4 flex flex-col justify-end pointer-events-none">
                                  {item.description?.trim() && (
                                    <p className="text-white italic text-base line-clamp-4">
                                      "{item.description}"
                                    </p>
                                  )}
                                  <p className="text-white font-bold text-sm">
                                    {item.author}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Submission Panel (Exactly as provided) */}
          <div className="lg:w-1/4 w-full flex flex-col">
            <div className="bg-card border rounded-2xl p-6 shadow-sm h-full flex flex-col w-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm">Share Experience</h4>
                {hasContent && (
                  <button
                    onClick={() => setShowPopup(true)}
                    className="text-primary hover:bg-primary/10 p-1 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-full text-red-400 shadow-sm">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-red-400 leading-none">
                    Posting as
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {authorName || "Guest User"}
                  </p>
                </div>
              </div>

              <div className="relative mb-3 flex flex-col grow">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, 300))}
                  placeholder="Tell us about your stay..."
                  maxLength={300}
                  className="w-full grow bg-secondary/20 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                />
                <span className={`self-end text-[10px] mt-1 font-medium ${feedbackText.length >= 300 ? "text-red-500" : "text-muted-foreground"}`}>
                  {feedbackText.length}/300
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/20 border border-transparent focus-within:border-primary/40 focus-within:bg-white transition-all">
                  <Youtube
                    size={15}
                    className={
                      ytLink && isYoutubeUrl(ytLink)
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }
                  />
                  <input
                    type="url"
                    value={ytLink}
                    onChange={(e) => setYtLink(e.target.value)}
                    placeholder="Paste YouTube or Instagram Reel link"
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                  {ytLink && (
                    <button onClick={() => setYtLink("")}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {mediaPreviews.map((m, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >
                      {m.type === "image" ? (
                        <img
                          src={m.url}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-black flex items-center justify-center">
                          <Video size={12} className="text-white" />
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setMediaPreviews((p) =>
                            p.filter((_, idx) => idx !== i),
                          )
                        }
                        className="absolute top-0 right-0 bg-black/50 text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-grow bg-secondary/40 hover:bg-secondary/60 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                >
                  {mediaUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ImageIcon size={16} />
                  )}{" "}
                  Media
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
              </div>

              <button
                disabled={
                  isSubmitting ||
                  (!feedbackText &&
                    mediaPreviews.length === 0 &&
                    !ytLink.trim())
                }
                onClick={handleSubmit}
                className="w-full bg-[#f88d8d] hover:bg-[#f67a7a] text-white py-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  "Submit Story"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card p-8 rounded-2xl border shadow-2xl w-full max-w-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold">
                  Guest Information
                </h3>
                <button onClick={() => { setShowPopup(false); setFormError(""); }}>
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  value={authorName}
                  onChange={(e) => { setAuthorName(e.target.value.replace(/[^a-zA-Z\s]/g, "")); setFormError(""); }}
                  placeholder="Full Name *"
                  className="w-full p-3 bg-muted rounded-lg outline-none"
                />
                <input
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                  placeholder="Email"
                  type="email"
                  className="w-full p-3 bg-muted rounded-lg outline-none"
                />
                <input
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setFormError(""); }}
                  placeholder="Phone (10 digits)"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full p-3 bg-muted rounded-lg outline-none"
                />
                {formError && (
                  <p className="text-xs text-red-500 font-medium">{formError}</p>
                )}
                <button
                  onClick={() => {
                    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
                    const phoneValid = /^\d{10}$/.test(phone.trim());
                    if (!authorName.trim()) { setFormError("Full name is required."); return; }
                    if (!/^[a-zA-Z\s]+$/.test(authorName.trim())) { setFormError("Name must contain only letters and spaces."); return; }
                    if (!email.trim() && !phone.trim()) { setFormError("Please provide email or phone number."); return; }
                    if (email.trim() && !emailValid) { setFormError("Please enter a valid email address."); return; }
                    if (phone.trim() && !phoneValid) { setFormError("Phone number must be exactly 10 digits."); return; }
                    setFormError("");
                    setIsVerified(true);
                    setShowPopup(false);
                    handleSubmit();
                  }}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold"
                >
                  Save & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
