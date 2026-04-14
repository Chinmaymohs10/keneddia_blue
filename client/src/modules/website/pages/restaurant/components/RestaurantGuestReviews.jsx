import { useEffect, useRef, useState } from "react";
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
  PlayCircle,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { InstagramEmbed } from "react-social-media-embed";
import {
  createGuestExperienceByGuest,
  getGuestExperienceSection,
  getGuestExperienceSectionHeader,
  getGuestExperineceRatingHeader,
  getPropertyTypes,
} from "@/Api/Api";

import "swiper/css";
import "swiper/css/navigation";

const DEFAULT_SECTION_HEADER = {
  sectionTag: "Guest Impressions",
  title: "Dining Moments Worth Returning For",
};
const DEFAULT_RATING_HEADER = {
  description: "Average guest dining rating",
  rating: 5,
};

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isRestaurantType = (value = "") =>
  ["restaurant", "resturant"].includes(normalize(value));

const isYoutubeUrl = (url) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url.trim());
const isInstagramUrl = (url) =>
  /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv)\/.+/.test(url.trim());

const getYoutubeId = (url) => {
  if (!url) return null;
  const matches = [
    /youtube\.com\/shorts\/([^"&?/\s]{11})/,
    /youtu\.be\/([^"&?/\s]{11})/,
    /[?&]v=([^"&?/\s]{11})/,
    /embed\/([^"&?/\s]{11})/,
  ];
  for (const regex of matches) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  return null;
};

const getInstagramId = (url) => {
  if (!url) return null;
  const clean = url.trim().split("?")[0].replace(/\/$/, "");
  const match = clean.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_\-]+)/);
  return match ? match[1] : null;
};

const getYoutubeThumbnail = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const buildMediaList = (item) => {
  const allMedia = [];
  const seenUrls = new Set();
  const add = (type, url) => {
    if (!url || typeof url !== "string") return;
    const clean = url.trim();
    if (!clean || seenUrls.has(clean)) return;
    seenUrls.add(clean);
    allMedia.push({ type, url: clean });
  };

  if (Array.isArray(item?.mediaList)) {
    item.mediaList.forEach((m) => {
      const url = m?.url || m?.imageUrl || m?.videoUrl;
      if (!url) return;
      const isVid =
        m?.type === "VIDEO" ||
        isYoutubeUrl(url) ||
        isInstagramUrl(url) ||
        /\.(mp4|webm|mov|ogg)$/i.test(url);
      add(isVid ? "video" : "image", url);
    });
  }
  if (item?.videoUrl) add("video", item.videoUrl);
  if (item?.imageUrl) add("image", item.imageUrl);

  return allMedia;
};

export default function RestaurantGuestReviews({
  initialExperiences,
  initialSectionHeader,
  initialRatingHeader,
  initialRestaurantTypeId,
}) {
  const swiperRef = useRef(null);
  const fileInputRef = useRef(null);

  const ssrLoaded = Array.isArray(initialExperiences);
  const [guestExperiences, setGuestExperiences] = useState(ssrLoaded ? initialExperiences : []);
  const [isLoading, setIsLoading] = useState(!ssrLoaded);
  const [sectionHeader, setSectionHeader] = useState(
    initialSectionHeader
      ? {
          sectionTag: initialSectionHeader.sectionTag || DEFAULT_SECTION_HEADER.sectionTag,
          title: initialSectionHeader.title || DEFAULT_SECTION_HEADER.title,
        }
      : DEFAULT_SECTION_HEADER,
  );
  const [ratingHeader, setRatingHeader] = useState(
    initialRatingHeader
      ? {
          description: initialRatingHeader.description || DEFAULT_RATING_HEADER.description,
          rating: Number(initialRatingHeader.rating || DEFAULT_RATING_HEADER.rating),
        }
      : DEFAULT_RATING_HEADER,
  );
  const [restaurantTypeId, setRestaurantTypeId] = useState(initialRestaurantTypeId ?? null);

  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [ytError, setYtError] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaErrors, setMediaErrors] = useState(new Set());
  const [mutedVideos, setMutedVideos] = useState(new Set());

  const hasContent = feedbackText || mediaPreviews.length > 0 || ytLink.trim();
  const ytThumb =
    ytLink.trim() && isYoutubeUrl(ytLink) ? getYoutubeThumbnail(ytLink) : null;
  const instaId = ytLink.trim() && isInstagramUrl(ytLink) ? getInstagramId(ytLink) : null;

  const fetchExperiences = async (resolvedRestaurantTypeId) => {
    try {
      const res = await getGuestExperienceSection({ size: 100 });
      const rawData = res?.data?.data || res?.data || res || [];
      const list = Array.isArray(rawData) ? rawData : rawData?.content || [];

      const filtered = list
        .filter((item) =>
          resolvedRestaurantTypeId != null
            ? Number(item?.propertyTypeId) === Number(resolvedRestaurantTypeId)
            : false,
        )
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || 0).getTime();
          const dateB = new Date(b?.createdAt || 0).getTime();
          return dateB - dateA;
        });

      setGuestExperiences(filtered);
    } catch (error) {
      console.error("Failed to load restaurant guest experiences", error);
      setGuestExperiences([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ssrLoaded && initialRestaurantTypeId != null) return;
    const init = async () => {
      try {
        setIsLoading(true);
        const [typesRes, headerRes, ratingRes] = await Promise.all([
          getPropertyTypes(),
          getGuestExperienceSectionHeader(),
          getGuestExperineceRatingHeader(),
        ]);

        const types = typesRes?.data || typesRes || [];
        const restaurantType = Array.isArray(types)
          ? types.find(
              (type) => type?.isActive && isRestaurantType(type?.typeName),
            )
          : null;
        const resolvedRestaurantTypeId = restaurantType?.id
          ? Number(restaurantType.id)
          : null;
        setRestaurantTypeId(resolvedRestaurantTypeId);

        const sectionData = Array.isArray(headerRes?.data)
          ? headerRes.data[0]
          : headerRes?.data;
        setSectionHeader({
          sectionTag: sectionData?.sectionTag || DEFAULT_SECTION_HEADER.sectionTag,
          title: sectionData?.title || DEFAULT_SECTION_HEADER.title,
        });

        const ratingData = Array.isArray(ratingRes?.data)
          ? ratingRes.data[0]
          : ratingRes?.data;
        setRatingHeader({
          description:
            ratingData?.description || DEFAULT_RATING_HEADER.description,
          rating: Number(ratingData?.rating || DEFAULT_RATING_HEADER.rating),
        });

        await fetchExperiences(resolvedRestaurantTypeId);
      } catch (error) {
        console.error("Failed to initialize restaurant reviews section", error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleFileUpload = (e) => {
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

  const handleYtChange = (value) => {
    setYtLink(value);
    const link = value.trim();
    if (!link) {
      setYtError("");
      return;
    }
    if (!isYoutubeUrl(link) && !isInstagramUrl(link)) {
      setYtError("Please enter a valid YouTube or Instagram Reel URL");
      return;
    }
    setYtError("");
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      setShowPopup(true);
      return;
    }
    if (!restaurantTypeId) {
      setYtError("Restaurant type is unavailable. Please try again.");
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
      formData.append("propertyTypeId", String(restaurantTypeId));
      if (ytLink.trim()) formData.append("videoUrl", ytLink.trim());
      mediaPreviews.forEach((m) => formData.append("files", m.file));

      await createGuestExperienceByGuest(formData);

      setFeedbackText("");
      setMediaPreviews([]);
      setYtLink("");
      setYtError("");
      setIsVerified(false);
      setAuthorName("");
      setEmail("");
      setPhone("");

      await fetchExperiences(restaurantTypeId);
    } catch (error) {
      console.error("Failed to submit restaurant guest experience", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMediaItem = (m, idx) => {
    const videoKey = `video-${m.url}`;
    const isMuted = !mutedVideos.has(videoKey);

    if (m.type === "video") {
      if (isInstagramUrl(m.url)) {
        const id = getInstagramId(m.url);
        if (!id) return null;

        return (
          <div
            key={idx}
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black group"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.6] min-w-[328px]">
              <InstagramEmbed url={`https://www.instagram.com/p/${id}/`} width={328} />
            </div>
            
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 z-20 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Open
            </a>
          </div>
        );
      }

      if (isYoutubeUrl(m.url)) {
        const videoId = getYoutubeId(m.url);
        if (!videoId) return null;
        return (
          <div key={idx} className="relative h-full w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1`}
              className="h-full w-full"
              style={{ border: "none" }}
              allow="autoplay; encrypted-media"
            />
          </div>
        );
      }

      return (
        <div key={idx} className="relative h-full w-full group">
          <video
            src={m.url}
            className="h-full w-full object-cover"
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
            className="absolute bottom-3 right-3 z-20 rounded-full bg-black/70 p-2.5 opacity-0 transition-opacity group-hover:opacity-100"
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
        className="h-full w-full object-cover"
        onError={() => setMediaErrors((prev) => new Set(prev).add(m.url))}
      />
    );
  };

  const renderMediaGrid = (allMedia, item) => {
    const hasMediaErrors = allMedia.some((m) => mediaErrors.has(m.url));
    const total = allMedia.length;

    if (total === 0 || hasMediaErrors) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
          <div className="max-w-[90%] space-y-3 text-center">
            {item.description?.trim() ? (
              <p className="line-clamp-4 text-base italic leading-relaxed text-white md:text-lg">
                "{item.description}"
              </p>
            ) : (
              <p className="text-sm italic text-white/60">No description provided</p>
            )}
            {item.author?.trim() && (
              <p className="text-lg font-bold text-white/90 md:text-xl">- {item.author}</p>
            )}
          </div>
        </div>
      );
    }

    if (total === 1) return <div className="h-full w-full">{renderMediaItem(allMedia[0], 0)}</div>;

    return (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
        {allMedia.slice(0, 4).map((m, i) => (
          <div key={i} className="relative overflow-hidden">
            {renderMediaItem(m, i)}
            {i === 3 && total > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-xl font-black text-white">+{total - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section id="reviews" className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex min-w-0 flex-col items-stretch gap-6 lg:flex-row">
          <div className="flex w-full min-w-0 flex-col rounded-2xl border bg-card p-6 shadow-sm lg:w-3/4">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                  {sectionHeader.sectionTag}
                </p>
                <h2 className="text-2xl font-serif font-bold italic">
                  {sectionHeader.title}
                </h2>
              </div>

              <div className="text-right">
                <div className="mb-1 flex items-center justify-end gap-1 text-primary">
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
            </div>

            <div className="w-full flex-grow overflow-hidden">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="flex h-[320px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : guestExperiences.length === 0 ? (
                  <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
                    No restaurant reviews yet.
                  </div>
                ) : (
                  <Swiper
                    key={guestExperiences.length}
                    modules={[Autoplay, Navigation]}
                    spaceBetween={15}
                    slidesPerView={1.2}
                    breakpoints={{ 768: { slidesPerView: 3 } }}
                    autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    onSwiper={(s) => {
                      swiperRef.current = s;
                    }}
                    className="h-full w-full"
                  >
                    {guestExperiences.map((item) => {
                      const allMedia = buildMediaList(item);
                      return (
                        <SwiperSlide key={item.id}>
                          <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-background">
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                              {renderMediaGrid(allMedia, item)}
                              {allMedia.length > 0 && (
                                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-transparent p-4">
                                  {item.description?.trim() && (
                                    <p className="line-clamp-4 text-base italic text-white">
                                      "{item.description}"
                                    </p>
                                  )}
                                  <p className="text-sm font-bold text-white">
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

          <div className="flex w-full flex-col lg:w-1/4">
            <div className="flex h-full w-full flex-col rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-bold">Share Experience</h4>
                {hasContent && (
                  <button
                    onClick={() => setShowPopup(true)}
                    className="rounded-full p-1 text-primary hover:bg-primary/10"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
                <div className="rounded-full bg-white p-2 text-red-400 shadow-sm">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase leading-none text-red-400">
                    Posting as
                  </p>
                  <p className="truncate text-sm font-bold text-gray-800">
                    {authorName || "Guest User"}
                  </p>
                </div>
              </div>

              <div className="relative mb-3 flex flex-col grow">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, 50))}
                  placeholder="Tell us about your dining experience..."
                  maxLength={50}
                  className="w-full grow resize-none rounded-xl border-none bg-secondary/20 p-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
                <span className={`self-end text-[10px] mt-1 font-medium ${feedbackText.length >= 50 ? "text-red-500" : "text-muted-foreground"}`}>
                  {feedbackText.length}/50
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 rounded-xl border border-transparent bg-secondary/20 px-3 py-2.5 transition-all focus-within:border-primary/40 focus-within:bg-white">
                  <Youtube
                    size={15}
                    className={
                      ytLink && (isYoutubeUrl(ytLink) || isInstagramUrl(ytLink))
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }
                  />
                  <input
                    type="url"
                    value={ytLink}
                    onChange={(e) => handleYtChange(e.target.value)}
                    placeholder="Paste YouTube or Instagram Reel link"
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                  {ytLink && (
                    <button
                      onClick={() => {
                        setYtLink("");
                        setYtError("");
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                {ytError && <p className="mt-1 text-[10px] text-red-500">{ytError}</p>}
              </div>

              {ytLink.trim() && !ytError && (
                <div className="mb-3 overflow-hidden rounded-xl border bg-black">
                  {ytThumb ? (
                    <div className="group relative">
                      <img
                        src={ytThumb}
                        alt="YouTube preview"
                        className="h-28 w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <PlayCircle className="h-8 w-8 text-white drop-shadow" />
                      </div>
                    </div>
                  ) : instaId ? (
                    <div className="relative h-44 w-full overflow-hidden bg-black flex justify-center items-center">
                      <div className="absolute top-0 scale-[0.45] origin-top min-w-[328px] mt-2">
                        <InstagramEmbed url={`https://www.instagram.com/p/${instaId}/`} width={328} />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {mediaPreviews.length > 0 && (
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {mediaPreviews.map((m, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-lg border"
                    >
                      {m.type === "image" ? (
                        <img
                          src={m.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black">
                          <Video size={12} className="text-white" />
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setMediaPreviews((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="absolute right-0 top-0 bg-black/50 text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-grow rounded-xl bg-secondary/40 py-2.5 text-xs font-bold transition-colors hover:bg-secondary/60"
                >
                  <span className="flex items-center justify-center gap-2">
                    {mediaUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ImageIcon size={16} />
                    )}
                    Media
                  </span>
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
                  ytError ||
                  (!feedbackText && mediaPreviews.length === 0 && !ytLink.trim())
                }
                onClick={handleSubmit}
                className="w-full rounded-xl bg-[#f88d8d] py-4 text-sm font-bold text-white shadow-md transition-all active:scale-95 hover:bg-[#f67a7a] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="mx-auto animate-spin" size={20} />
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
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
                  onChange={(e) => { setAuthorName(e.target.value); setFormError(""); }}
                  placeholder="Full Name *"
                  className="w-full rounded-lg bg-muted p-3 outline-none"
                />
                <input
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                  placeholder="Email"
                  type="email"
                  className="w-full rounded-lg bg-muted p-3 outline-none"
                />
                <input
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setFormError(""); }}
                  placeholder="Phone (10 digits)"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full rounded-lg bg-muted p-3 outline-none"
                />
                {formError && (
                  <p className="text-xs font-medium text-red-500">{formError}</p>
                )}
                <button
                  onClick={() => {
                    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
                    const phoneValid = /^\d{10}$/.test(phone.trim());
                    if (!authorName.trim()) { setFormError("Full name is required."); return; }
                    if (!email.trim() && !phone.trim()) { setFormError("Please provide email or phone number."); return; }
                    if (email.trim() && !emailValid) { setFormError("Please enter a valid email address."); return; }
                    if (phone.trim() && !phoneValid) { setFormError("Phone number must be exactly 10 digits."); return; }
                    setFormError("");
                    setIsVerified(true);
                    setShowPopup(false);
                    handleSubmit();
                  }}
                  className="w-full rounded-lg bg-primary py-3 font-bold text-white"
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
