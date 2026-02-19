import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Star,
  X,
  Image as ImageIcon,
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
import {
  getGuestExperienceSection,
  createGuestExperienceByGuest,
  getGuestExperienceSectionHeader,
} from "@/Api/Api";

import "swiper/css";
import "swiper/css/navigation";

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

const isYoutubeUrl = (url: string): boolean =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url.trim());

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/);
  if (shortsMatch) return shortsMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^"&?\/\s]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/[?&]v=([^"&?\/\s]{11})/);
  if (longMatch) return longMatch[1];
  const embedMatch = url.match(/embed\/([^"&?\/\s]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
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
      !seenUrls.has(url)
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
        url.match(/\.(mp4|webm|mov|ogg)$/i);
      add(isVid ? "video" : "image", url);
    });
  }

  if (item.videoUrl) {
    const isVid =
      isYoutubeUrl(item.videoUrl) ||
      item.videoUrl.match(/\.(mp4|webm|mov|ogg)$/i);
    if (isVid) add("video", item.videoUrl);
  }

  if (item.imageUrl) {
    add("image", item.imageUrl);
  }

  return allMedia;
};

export default function OurStoryPreview() {
  const [guestExperiences, setGuestExperiences] = useState<ExperienceItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [mediaPreviews, setMediaPreviews] = useState<
    { type: string; url: string; file: File }[]
  >([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [ytError, setYtError] = useState("");
  const [sectionHeader, setSectionHeader] = useState<SectionHeader | null>(
    null,
  );
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());

  const swiperRef = useRef<any>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
        if (!swiperRef.current?.autoplay) return;
        if (isMobile) {
          entry.isIntersecting
            ? swiperRef.current.autoplay.start()
            : swiperRef.current.autoplay.stop();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!swiperRef.current?.autoplay) return;
    if (isMobile && !isSectionVisible) {
      swiperRef.current.autoplay.stop();
    } else {
      swiperRef.current.autoplay.start();
    }
  }, [isMobile, isSectionVisible]);

  const fetchHeader = async () => {
    try {
      const res = await getGuestExperienceSectionHeader();
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (data) setSectionHeader(data);
    } catch (err) {
      console.warn("Header fetch failed:", err);
    }
  };

  const fetchExperiences = async () => {
    try {
      const res = await getGuestExperienceSection({ size: 20 });
      const rawData = res?.data?.data || res?.data || res;
      const mappedData = (rawData || [])
        .sort((a: any, b: any) => {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return Number(b.id) - Number(a.id);
        })
        .map((item: any) => ({ ...item }));

      setGuestExperiences(mappedData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeader();
    fetchExperiences();
  }, []);

  const handleFileTrigger = (type: "image" | "video" | "all") => {
    if (fileInputRef.current) {
      if (type === "video") fileInputRef.current.accept = "video/*";
      else if (type === "image") fileInputRef.current.accept = "image/*";
      else fileInputRef.current.accept = "image/*,video/*";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setMediaUploading(true);
      const newPreviews = Array.from(files).map((file) => ({
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        file,
      }));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
      setMediaUploading(false);
    }
  };

  const handleYtLinkChange = (val: string) => {
    setYtLink(val);
    if (val.trim() && !isYoutubeUrl(val)) {
      setYtError("Please enter a valid YouTube URL");
    } else {
      setYtError("");
    }
  };

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    if (!authorName.trim()) return "Please enter your name.";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (!phoneRegex.test(phone))
      return "Please enter a 10-digit mobile number.";
    return null;
  };

  const handleSaveInfo = () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setIsVerified(true);
    setShowPopup(false);
    // ❌ Remove the setTimeout block entirely
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      if (!mediaUploading) setShowPopup(true);
      return;
    }
    if (ytLink.trim() && !isYoutubeUrl(ytLink)) {
      setYtError("Please enter a valid YouTube URL before submitting");
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
      if (ytLink.trim()) formData.append("videoUrl", ytLink.trim());
      mediaPreviews.forEach((m) => formData.append("files", m.file));
      formData.append(
        "mediaType",
        mediaPreviews.some((m) => m.type === "video") ? "VIDEO" : "IMAGE",
      );
      await createGuestExperienceByGuest(formData);
      setFeedbackText("");
      setMediaPreviews([]);
      setYtLink("");
      setYtError("");
      setAuthorName("");
      setEmail("");
      setPhone("");
      setIsVerified(false);
      await fetchExperiences();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (isVerified) {
      handleSubmit();
    }
  }, [isVerified]);

  const renderMediaItem = (
    m: { type: "image" | "video"; url: string },
    idx: number,
  ) => {
    const videoKey = `video-${m.url}`;
    const isMuted = !mutedVideos.has(videoKey); // Inverted: default muted

    if (m.type === "video") {
      if (isYoutubeUrl(m.url)) {
        const videoId = getYoutubeId(m.url);
        if (!videoId) return null;
        return (
          <div key={idx} className="w-full h-full relative group">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&modestbranding=1`}
              className="w-full h-full"
              style={{ border: "none" }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMutedVideos((prev) => {
                  const next = new Set(prev);
                  next.has(videoKey)
                    ? next.delete(videoKey)
                    : next.add(videoKey);
                  return next;
                });
              }}
              className="absolute bottom-3 right-3 z-20 bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        );
      }

      return (
        <div key={idx} className="relative group w-full h-full">
          <video
            src={m.url}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            controls={!isMuted}
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
            className="absolute bottom-3 right-3 z-20 bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
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
        loading="lazy"
        onError={() => {
          setMediaErrors((prev) => new Set(prev).add(m.url));
        }}
      />
    );
  };

  const renderMediaGrid = (
    allMedia: { type: "image" | "video"; url: string }[],
    item: any,
  ) => {
    const total = allMedia.length;
    const hasMediaErrors = allMedia.some((m) => mediaErrors.has(m.url));

    if (total === 0 || hasMediaErrors) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <p
              className="text-white text-base md:text-lg italic leading-relaxed line-clamp-4"
              style={{ fontSize: "120%" }}
            >
              "{item.description}"
            </p>
            <p
              className="text-white/90 font-bold text-lg md:text-xl"
              style={{ fontSize: "120%" }}
            >
              — {item.author}
            </p>
          </div>
        </div>
      );
    }

    if (total === 1) {
      return (
        <div className="w-full h-full">{renderMediaItem(allMedia[0], 0)}</div>
      );
    }

    if (total === 2) {
      const hasVideo = allMedia.some((m) => m.type === "video");
      const hasImage = allMedia.some((m) => m.type === "image");
      const isMixed = hasVideo && hasImage;

      if (isMixed) {
        const sorted = [...allMedia].sort((a, b) =>
          a.type === "image" ? -1 : 1,
        );
        return (
          <div className="grid grid-rows-2 h-full gap-0.5">
            {sorted.map((m, i) => (
              <div key={i} className="relative overflow-hidden">
                {renderMediaItem(m, i)}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 h-full gap-0.5">
          {allMedia.map((m, i) => (
            <div key={i} className="overflow-hidden">
              {renderMediaItem(m, i)}
            </div>
          ))}
        </div>
      );
    }

    if (total === 3) {
      return (
        <div className="grid grid-cols-2 h-full gap-0.5">
          <div className="h-full overflow-hidden">
            {renderMediaItem(allMedia[0], 0)}
          </div>
          <div className="grid grid-rows-2 h-full gap-0.5">
            <div className="overflow-hidden">
              {renderMediaItem(allMedia[1], 1)}
            </div>
            <div className="overflow-hidden">
              {renderMediaItem(allMedia[2], 2)}
            </div>
          </div>
        </div>
      );
    }

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
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-primary mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">
                  5.0★ from 2500+ reviews
                </p>
              </div>
            </div>

            <div
              className="flex-grow w-full overflow-hidden"
              onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
              onMouseLeave={() => swiperRef.current?.autoplay?.start()}
            >
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
                    autoplay={{ delay: 6000, disableOnInteraction: false }}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    className="h-full w-full"
                  >
                    {guestExperiences.map((item: any) => {
                      const allMedia = buildMediaList(item);

                      return (
                        <SwiperSlide key={item.id}>
                          <div className="bg-background border rounded-xl overflow-hidden h-full flex flex-col group">
                            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                              {renderMediaGrid(allMedia, item)}

                              {allMedia.length > 0 &&
                                !allMedia.some((m) =>
                                  mediaErrors.has(m.url),
                                ) && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-4 flex flex-col justify-end pointer-events-none">
                                    <p className="text-white text-xs italic mb-2 line-clamp-2">
                                      "{item.description}"
                                    </p>
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

          {/* RIGHT: Submission Panel - keeping original code */}
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

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your stay..."
                className="w-full flex-grow bg-secondary/20 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none mb-3"
              />

              <div className="mb-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/20 border border-transparent focus-within:border-primary/40 focus-within:bg-white transition-all">
                  <Youtube
                    size={15}
                    className={`shrink-0 ${ytLink && isYoutubeUrl(ytLink) ? "text-red-500" : "text-muted-foreground"}`}
                  />
                  <input
                    type="url"
                    value={ytLink}
                    onChange={(e) => handleYtLinkChange(e.target.value)}
                    placeholder="Paste YouTube link (optional)"
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                  {ytLink && (
                    <button
                      onClick={() => {
                        setYtLink("");
                        setYtError("");
                      }}
                    >
                      <X
                        size={12}
                        className="text-muted-foreground hover:text-foreground"
                      />
                    </button>
                  )}
                </div>
                {ytError && (
                  <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">
                    {ytError}
                  </p>
                )}
                {ytThumb && (
                  <div className="mt-2 rounded-lg overflow-hidden border relative">
                    <img
                      src={ytThumb}
                      alt="YouTube preview"
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Youtube size={24} className="text-white" />
                    </div>
                  </div>
                )}
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
                          alt=""
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
                        className="absolute top-0 right-0 bg-black/50 text-white rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleFileTrigger("image")}
                  className="flex-grow bg-secondary/40 hover:bg-secondary/60 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                >
                  {mediaUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                  Media
                </button>
                <button
                  onClick={() => handleFileTrigger("video")}
                  className="bg-secondary/40 hover:bg-secondary/60 p-2.5 rounded-xl transition-colors"
                >
                  <Video size={16} />
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
                  mediaUploading ||
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
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-3 bg-muted rounded-lg outline-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full p-3 bg-muted rounded-lg outline-none"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number (10 digits)"
                  className="w-full p-3 bg-muted rounded-lg outline-none"
                  maxLength={10}
                />
                {error && (
                  <p className="text-red-500 text-xs font-bold">{error}</p>
                )}
                <button
                  onClick={handleSaveInfo}
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
