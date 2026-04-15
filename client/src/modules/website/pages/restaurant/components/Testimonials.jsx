import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { showSuccess,showError } from "@/lib/toasters/toastUtils";
import {
  Star,
  Sparkles,
  X,
  User,
  Upload,
  Video,
  Loader2,
  Send,
  Youtube,
  Volume2,
  VolumeX,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  getGuestExperienceSection,
  createGuestExperienceByGuest,
  getPropertyTypes,
} from "@/Api/Api";
import { getActiveTestimonialHeaders } from "@/Api/RestaurantApi";

const normalizeType = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isRestaurantType = (value = "") =>
  ["restaurant", "resturant"].includes(normalizeType(value));
// ─── YouTube helpers (from OurStoryPreview) ──────────────────────────────────
const isYoutubeUrl = (url) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url?.trim() ?? "");

const getYoutubeId = (url) => {
  if (!url) return null;
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?/\s]{11})/);
  if (shortsMatch) return shortsMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^"&?/\s]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/[?&]v=([^"&?/\s]{11})/);
  if (longMatch) return longMatch[1];
  const embedMatch = url.match(/embed\/([^"&?/\s]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
};

const getYoutubeThumbnail = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

// ─── Build unified media list (from OurStoryPreview) ─────────────────────────
const buildMediaList = (item) => {
  const allMedia = [];
  const seenUrls = new Set();

  const add = (type, url) => {
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
    item.mediaList.forEach((m) => {
      const url = m.url || m.imageUrl || m.videoUrl;
      if (!url) return;
      const isVid =
        m.type === "VIDEO" ||
        isYoutubeUrl(url) ||
        /\.(mp4|webm|mov|ogg)$/i.test(url);
      add(isVid ? "video" : "image", url);
    });
  }

  if (item.videoUrl) {
    const isVid =
      isYoutubeUrl(item.videoUrl) ||
      /\.(mp4|webm|mov|ogg)$/i.test(item.videoUrl);
    if (isVid) add("video", item.videoUrl);
  }

  if (item.imageUrl) add("image", item.imageUrl);

  return allMedia;
};

// ─── FeedbackCard adapted to use API data + media rendering ──────────────────
const FeedbackCard = ({ item }) => {
  const [mediaErrors, setMediaErrors] = useState(new Set());
  const [mutedVideos, setMutedVideos] = useState(new Set());
  const allMedia = buildMediaList(item);

  const renderMediaItem = (m, idx) => {
    const videoKey = `video-${m.url}`;
    const isMuted = !mutedVideos.has(videoKey);

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
              className="absolute bottom-2 right-2 z-20 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
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
            className="absolute bottom-2 right-2 z-20 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
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
        onError={() => setMediaErrors((prev) => new Set(prev).add(m.url))}
      />
    );
  };

  const renderMediaGrid = () => {
    const valid = allMedia.filter((m) => !mediaErrors.has(m.url));
    const total = valid.length;

    // No media — show text quote card
    if (total === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center p-5">
          <div className="text-center space-y-2">
            <p className="text-white text-xs italic leading-relaxed line-clamp-4">
              "{item.description}"
            </p>
            <p className="text-white/80 font-bold text-[11px]">
              — {item.author}
            </p>
          </div>
        </div>
      );
    }

    if (total === 1) {
      return (
        <div className="w-full h-full">{renderMediaItem(valid[0], 0)}</div>
      );
    }

    if (total === 2) {
      const mixed =
        valid.some((m) => m.type === "video") &&
        valid.some((m) => m.type === "image");
      if (mixed) {
        const sorted = [...valid].sort((a, b) => (a.type === "image" ? -1 : 1));
        return (
          <div className="grid grid-rows-2 h-full gap-px">
            {sorted.map((m, i) => (
              <div key={i} className="overflow-hidden">
                {renderMediaItem(m, i)}
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-2 h-full gap-px">
          {valid.map((m, i) => (
            <div key={i} className="overflow-hidden">
              {renderMediaItem(m, i)}
            </div>
          ))}
        </div>
      );
    }

    if (total === 3) {
      return (
        <div className="grid grid-cols-2 h-full gap-px">
          <div className="h-full overflow-hidden">
            {renderMediaItem(valid[0], 0)}
          </div>
          <div className="grid grid-rows-2 h-full gap-px">
            <div className="overflow-hidden">
              {renderMediaItem(valid[1], 1)}
            </div>
            <div className="overflow-hidden">
              {renderMediaItem(valid[2], 2)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
        {valid.slice(0, 4).map((m, i) => (
          <div key={i} className="relative overflow-hidden">
            {renderMediaItem(m, i)}
            {i === 3 && total > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-black text-lg">
                  +{total - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const cardRating = (() => {
    const match = item.title?.match(/\((\d+)\/5\)/);
    return match ? Number(match[1]) : 5;
  })();

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-100 dark:border-white/5 shadow-lg mb-6 flex flex-col gap-4 p-4 group transition-all hover:scale-[1.02] cursor-pointer">
      {/* ⭐ RATING */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < cardRating
                ? "fill-primary text-primary"
                : "text-zinc-300 dark:text-zinc-600"
            }
          />
        ))}
        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 ml-1">
          ({cardRating}/5)
        </span>
      </div>

      {/* ✍️ DESCRIPTION */}
      {item.description && (
        <p className="text-zinc-600 dark:text-zinc-400 text-[12px] italic leading-relaxed">
          "{item.description}"
        </p>
      )}

      {/* 🖼 MEDIA */}
      {allMedia.length > 0 && (
        <div className="relative h-32 w-full overflow-hidden rounded-xl">
          {renderMediaGrid()}
        </div>
      )}

      {/* 👤 USER */}
      <div className="flex items-center gap-2 pt-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] shrink-0">
          {item.author?.charAt(0)?.toUpperCase() ?? "G"}
        </div>
        <span className="text-[11px] font-bold dark:text-zinc-300 uppercase tracking-tight truncate">
          {item.author}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AutoTestimonials({ propertyId }) {
  console.log("propertyId", propertyId);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [testimonialHeader, setTestimonialHeader] = useState({
    testimonialName1: "",
    testimonialName2: "",
    description: "",
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyTypeId, setPropertyTypeId] = useState(null);

  // ── Form state — new 3-step flow ─────────────────────────────────────────
  // Step 1: Media (files + YouTube)
  // Step 2: Review content (stars + text)
  // Step 3: Personal info (name, email, phone) → submit
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rating: 5,
    text: "",
    ytLink: "",
  });
  const [ytError, setYtError] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const fetchTestimonialHeader = async () => {
    try {
      const res = await getActiveTestimonialHeaders();
      const all = res?.data || [];

      const matched = all
        .filter((h) => h.propertyId === propertyId && h.isActive)
        .sort((a, b) => b.id - a.id);

      const latest = matched[0];

      if (latest) {
        setTestimonialHeader({
          testimonialName1: latest.testimonialName1 || latest.header1 || "",
          testimonialName2: latest.testimonialName2 || latest.header2 || "",
          description: latest.description || "",
        });
      }
    } catch (err) {
      console.error("Failed to load testimonial header:", err);
    }
  };

  // Build star-prefixed title: "⭐⭐⭐⭐☆ (4/5) Amazing food..."
  const buildTitle = (rating, text) => {
    const filled = "⭐".repeat(rating);
    const empty = "☆".repeat(5 - rating);
    const stars = `${filled}${empty} (${rating}/5)`;
    const snippet = (text || "").trim().slice(0, 20);
    return snippet ? `${stars} ${snippet}` : stars;
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // ── Fetch experiences filtered by propertyId ──────────────────────────────
  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await getGuestExperienceSection({ size: 100 });
      const rawData = res?.data?.data ?? res?.data ?? res ?? [];
      const list = Array.isArray(rawData) ? rawData : (rawData.content ?? []);

      const filtered = list
        .filter((item) =>
          propertyId != null
            ? item.propertyId === propertyId
            : item.propertyId == null,
        )
        .sort((a, b) => {
          if (a.createdAt && b.createdAt)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          return Number(b.id) - Number(a.id);
        });

      setExperiences(filtered);
    } catch (err) {
      console.error("Failed to load guest experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonialHeader();
    fetchExperiences();
    getPropertyTypes()
      .then((res) => {
        const types = res?.data || res || [];
        const match = Array.isArray(types)
          ? types.find((t) => t?.isActive && isRestaurantType(t?.typeName))
          : null;
        if (match?.id) setPropertyTypeId(Number(match.id));
      })
      .catch(() => {});
  }, [propertyId]);

  // ── Media upload ──────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map((file) => ({
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        file,
      }));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleYtChange = (val) => {
    setFormData((p) => ({ ...p, ytLink: val }));
    if (val.trim() && !isYoutubeUrl(val)) {
      setYtError("Please enter a valid YouTube URL");
    } else {
      setYtError("");
    }
  };

  // ── Submit (called from Step 3) ───────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!propertyId) {
      showError("Property ID is missing. Cannot submit testimonial.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!formData.name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      setFormError("Name must contain only letters and spaces.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (!emailRegex.test(formData.email.trim())) {
      setFormError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setFormError("Phone number must be exactly 10 digits.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", buildTitle(formData.rating, formData.text));
      fd.append("description", formData.text);
      fd.append("author", formData.name);
      fd.append("authorEmail", formData.email);
      fd.append("authorPhone", formData.phone);
      fd.append("rating", String(formData.rating));
      if (propertyId != null) fd.append("propertyId", String(propertyId));
      if (propertyTypeId != null) fd.append("propertyTypeId", String(propertyTypeId));
      if (formData.ytLink.trim()) fd.append("videoUrl", formData.ytLink.trim());
      mediaPreviews.forEach((m) => fd.append("files", m.file));
      fd.append(
        "mediaType",
        mediaPreviews.some((m) => m.type === "video") ? "VIDEO" : "IMAGE",
      );

      await createGuestExperienceByGuest(fd);
      toast.success("Thank you! Your story has been submitted for review.");

      // Reset everything
      setStep(1);
      setFormData({
        name: "",
        email: "",
        phone: "",
        rating: 5,
        text: "",
        ytLink: "",
      });
      setMediaPreviews([]);
      setYtError("");
      setShowReviewModal(false);
      await fetchExperiences();
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived
  const ytThumb =
    formData.ytLink.trim() && isYoutubeUrl(formData.ytLink)
      ? getYoutubeThumbnail(formData.ytLink)
      : null;

  // Split experiences into two columns for the marquee
  const col1 = experiences.filter((_, i) => i % 2 === 0);
  const col2 = experiences.filter((_, i) => i % 2 === 1);

  const displayData = experiences;
  const displayCol1 = displayData.filter((_, i) => i % 2 === 0);
  const displayCol2 = displayData.filter((_, i) => i % 2 === 1);
  const extractRatingFromTitle = (title = "") => {
    const match = title?.match(/\((\d+)\/5\)/);
    return match ? Number(match[1]) : null;
  };

  const validRatings = experiences
    .map((e) => extractRatingFromTitle(e.title))
    .filter((r) => r !== null);

  const avgRating =
    validRatings.length > 0
      ? (
          validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
        ).toFixed(1)
      : null;

  const totalGuests = experiences.length;

  // Step labels
  const STEP_LABELS = { 1: "Your Story", 2: "Your Details" };

  return (
    <section
      ref={containerRef}
      className="relative py-24 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[750px] flex items-center"
    >
      {/* Background decor */}
      <motion.div
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[12rem] lg:text-[18rem] font-black text-zinc-900/[0.03] dark:text-white/[0.01] pointer-events-none select-none italic uppercase z-0"
      >
        Guest Stories Feedback
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT: Content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                  Testimonials
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-white leading-[1.1]">
                {testimonialHeader.testimonialName1 || ""} <br />
                <span className="italic text-zinc-400 dark:text-white/30 decoration-primary/20 underline decoration-1 underline-offset-8">
                  {testimonialHeader.testimonialName2 || " "}
                </span>
              </h2>
              <p className="text-zinc-500 dark:text-white/40 text-lg font-light leading-relaxed max-w-sm pt-4">
                {testimonialHeader.description || " "}
              </p>

              <Button
                onClick={() => setShowReviewModal(true)}
                className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group"
              >
                Share Your Story{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="pt-8 border-t border-zinc-100 dark:border-white/10 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-serif dark:text-white leading-none">
                  {avgRating ?? "—"}
                </p>
                <div className="flex gap-0.5 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(Number(avgRating))
                          ? "fill-primary text-primary"
                          : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight">
                Trusted by <br />
                <span className="text-zinc-700 dark:text-zinc-300 font-light text-sm">
                  {totalGuests.toLocaleString()}+
                </span>{" "}
                Guests
              </p>
            </div>
          </div>

          {/* RIGHT: Marquee carousel / static grid */}
          <div className="lg:col-span-7 h-[650px] relative rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] backdrop-blur-2xl">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={28} />
              </div>
            ) : (() => {
              // Only animate (and duplicate for infinite scroll) when there are
              // enough items that both copies won't be visible at the same time.
              // Threshold: > 4 total items (> 2 per column).
              const useMarquee = displayData.length > 4;

              if (useMarquee) {
                return (
                  <div className="grid grid-cols-2 gap-6 h-full p-6 overflow-hidden relative group">
                    <div className="flex flex-col gap-6 animate-marquee-up marquee-col">
                      {[...displayCol1, ...displayCol1].map((item, i) => (
                        <FeedbackCard key={`up-${item.id}-${i}`} item={item} />
                      ))}
                    </div>
                    <div className="flex flex-col gap-6 animate-marquee-down marquee-col">
                      {[...displayCol2, ...displayCol2].map((item, i) => (
                        <FeedbackCard key={`dn-${item.id}-${i}`} item={item} />
                      ))}
                    </div>
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-50/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none" />
                  </div>
                );
              }

              // Static grid — no animation, no duplication
              return (
                <div className="grid grid-cols-2 gap-6 h-full p-6 overflow-y-auto relative">
                  <div className="flex flex-col gap-6">
                    {displayCol1.map((item) => (
                      <FeedbackCard key={`s1-${item.id}`} item={item} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-6">
                    {displayCol2.map((item) => (
                      <FeedbackCard key={`s2-${item.id}`} item={item} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── REVIEW SUBMISSION MODAL (3 steps) ───────────────────────────────── */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Edit2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl dark:text-white">
                      Submit Your Story
                    </h3>
                    {/* Step progress dots */}
                    <div className="flex items-center gap-2 mt-1">
                      {[1, 2].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            s === step
                              ? "w-6 bg-primary"
                              : s < step
                                ? "w-3 bg-primary/40"
                                : "w-3 bg-zinc-200 dark:bg-zinc-700"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest ml-1">
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setStep(1);
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 max-h-[72vh] overflow-y-auto custom-scrollbar">
                {/* ── STEP 1: Story (Media + Review) — all optional ─────── */}
                {step === 1 && (
                  <div className="space-y-5">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-black uppercase text-zinc-400">
                        Rate your experience (optional)
                      </p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              setFormData({ ...formData, rating: star })
                            }
                          >
                            <Star
                              size={28}
                              className={`${formData.rating >= star ? "fill-primary text-primary" : "text-zinc-300 dark:text-zinc-600"} transition-all`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono text-center break-all">
                        {buildTitle(formData.rating, formData.text)}
                      </p>
                    </div>

                    {/* Feedback text */}
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Your Feedback{" "}
                        <span className="text-zinc-300 normal-case font-normal">
                          (optional)
                        </span>
                      </Label>
                      <textarea
                        value={formData.text}
                        onChange={(e) =>
                          setFormData({ ...formData, text: e.target.value })
                        }
                        className="w-full h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-sm dark:text-white border-none focus:ring-1 focus:ring-primary outline-none resize-none"
                        placeholder="Tell us about the flavors, service, and atmosphere..."
                      />
                    </div>

                    {/* Media upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Photos / Videos{" "}
                          <span className="text-zinc-300 normal-case font-normal">
                            (optional)
                          </span>
                        </Label>
                        {mediaPreviews.length > 0 && (
                          <span className="text-[10px] text-zinc-400">
                            {mediaPreviews.length} file(s)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {mediaPreviews.map((m, i) => (
                          <div
                            key={i}
                            className="relative aspect-square rounded-xl overflow-hidden group shadow-md"
                          >
                            {m.type === "image" ? (
                              <img
                                src={m.url}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white gap-1">
                                <Video size={16} />
                                <span className="text-[8px] font-bold uppercase">
                                  Video
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() =>
                                setMediaPreviews((p) =>
                                  p.filter((_, idx) => idx !== i),
                                )
                              }
                              className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all gap-1"
                        >
                          <Upload size={18} />
                          <span className="text-[8px] font-bold uppercase">
                            Upload
                          </span>
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* YouTube link */}
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        YouTube Link{" "}
                        <span className="text-zinc-300 normal-case font-normal">
                          (optional)
                        </span>
                      </Label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-transparent focus-within:border-primary/40 transition-all">
                        <Youtube
                          size={14}
                          className={`shrink-0 ${formData.ytLink && isYoutubeUrl(formData.ytLink) ? "text-red-500" : "text-zinc-400"}`}
                        />
                        <input
                          type="url"
                          value={formData.ytLink}
                          onChange={(e) => handleYtChange(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-400 dark:text-white"
                        />
                        {formData.ytLink && (
                          <button
                            onClick={() => {
                              setFormData({ ...formData, ytLink: "" });
                              setYtError("");
                            }}
                          >
                            <X
                              size={12}
                              className="text-zinc-400 hover:text-zinc-700"
                            />
                          </button>
                        )}
                      </div>
                      {ytError && (
                        <p className="text-red-500 text-[10px] ml-1 font-medium">
                          {ytError}
                        </p>
                      )}
                      {ytThumb && (
                        <div className="mt-1 rounded-lg overflow-hidden border relative">
                          <img
                            src={ytThumb}
                            alt="YouTube preview"
                            className="w-full h-16 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Youtube size={20} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-primary transition-all"
                    >
                      Next: Your Details{" "}
                      <ChevronRight size={14} className="ml-2" />
                    </Button>
                  </div>
                )}

                {/* ── STEP 2: Personal Info → Submit ───────────────────────── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Your contact details won't be publicly displayed.
                    </p>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") });
                            setFormError("");
                          }}
                          placeholder="How should we address you?"
                          className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            setFormError("");
                          }}
                          placeholder="email@example.com"
                          className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Phone
                        </Label>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") });
                            setFormError("");
                          }}
                          placeholder="10-digit number"
                          maxLength={10}
                          className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    {formError && (
                      <p className="text-xs text-red-500 font-medium">{formError}</p>
                    )}

                    {/* Summary preview */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 space-y-2">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                        Summary
                      </p>
                      <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 break-all">
                        {buildTitle(formData.rating, formData.text)}
                      </p>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 italic">
                        "{formData.text}"
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span>{mediaPreviews.length} file(s)</span>
                        {formData.ytLink && <span>· YouTube attached</span>}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="h-14 rounded-xl px-8 dark:text-white"
                      >
                        Back
                      </Button>
                      <Button
                        disabled={isSubmitting}
                        onClick={handleFinalSubmit}
                        className="flex-1 h-14 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            Submit Experience{" "}
                            <Send size={14} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marquee-up   { 0% { transform: translateY(0);       } 100% { transform: translateY(-50%); } }
        @keyframes marquee-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0);       } }
        .animate-marquee-up   { animation: marquee-up   40s linear infinite; }
        .animate-marquee-down { animation: marquee-down 40s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar       { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef444433; border-radius: 10px; }
      `}</style>
    </section>
  );
}

// ─── Inline SVG helpers (keep original to avoid import changes) ───────────────
const Edit2 = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const ArrowRight = ({ className, size = 18 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ChevronRight = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
