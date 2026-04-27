import { useEffect, useMemo, useRef, useState } from "react";
import {
  Star,
  X,
  ImageIcon,
  Loader2,
  User,
  Edit2,
  Video,
  Youtube,
  Coffee,
  Heart,
  Send,
  Play,
} from "lucide-react";
import { AnimatePresence, motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { getPropertyTypes, getGuestExperienceSection, createGuestExperienceByGuest } from "@/Api/Api";
import { getActiveTestimonialHeaders } from "@/Api/RestaurantApi";
import { toast } from "react-hot-toast";

const motionPatterns = [
  {
    initial: { y: 0 },
    animate: { y: ["0%", "-50%"] },
    duration: 30,
    parallax: [-50, 45],
  },
  {
    initial: { y: ["-50%", "0%"] },
    animate: { y: ["-50%", "0%"] },
    duration: 34,
    parallax: [40, -35],
  },
  {
    initial: { y: 0 },
    animate: { y: ["0%", "-50%"] },
    duration: 38,
    parallax: [-25, 30],
  },
];

const duplicateToLength = (items, minLength) => {
  if (!items || items.length === 0) return [];
  const out = [];
  while (out.length < minLength) {
    out.push(...items);
  }
  return out.slice(0, minLength);
};

const getMediaBadge = (type) => {
  if (type === "video") return "Video";
  if (type === "reel") return "Reel";
  if (type === "short") return "Short";
  return "Photo";
};

function MediaTile({ item, index, total }) {
  if (!item) return null;

  const roundedClass = total === 1 ? "rounded-[1.4rem]" : "rounded-[1rem]";

  return (
    <div className={`group relative overflow-hidden ${roundedClass} bg-[#E7D8CA]/70 dark:bg-[#241716]`}>
      <img
        src={item.url}
        alt={item.alt || getMediaBadge(item.type)}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#140c0a]/80 via-[#140c0a]/20 to-transparent" />
      <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
        {getMediaBadge(item.type)}
      </div>
      {item.type !== "image" && (
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#3E2723] shadow-lg transition-transform duration-500 group-hover:scale-110">
          <Play size={14} className="ml-0.5" />
        </div>
      )}
      {index === 3 && total > 4 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#140c0a]/70 text-xl font-bold text-white">
          +{total - 4}
        </div>
      )}
    </div>
  );
}

function MediaGrid({ items }) {
  const mediaItems = items?.length ? items : [];

  if (mediaItems.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-[#5F4338] via-[#7B5A4D] to-[#A27B62] px-6 text-center text-sm italic leading-relaxed text-white dark:from-[#2C1B18] dark:via-[#3B2520] dark:to-[#4C2D26]">
        No media, just a very strong cafe memory.
      </div>
    );
  }

  if (mediaItems.length === 1) {
    return (
      <div className="grid h-40 grid-cols-1">
        <MediaTile item={mediaItems[0]} index={0} total={1} />
      </div>
    );
  }

  if (mediaItems.length === 2) {
    return (
      <div className="grid h-44 grid-cols-2 gap-2.5">
        {mediaItems.map((item, index) => (
          <MediaTile key={`${item.url}-${index}`} item={item} index={index} total={mediaItems.length} />
        ))}
      </div>
    );
  }

  if (mediaItems.length === 3) {
    return (
      <div className="grid h-48 grid-cols-[1.2fr_0.8fr] gap-2.5">
        <MediaTile item={mediaItems[0]} index={0} total={mediaItems.length} />
        <div className="grid grid-rows-2 gap-2.5">
          <MediaTile item={mediaItems[1]} index={1} total={mediaItems.length} />
          <MediaTile item={mediaItems[2]} index={2} total={mediaItems.length} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-52 grid-cols-2 grid-rows-2 gap-2.5">
      {mediaItems.slice(0, 4).map((item, index) => (
        <MediaTile key={`${item.url}-${index}`} item={item} index={index} total={mediaItems.length} />
      ))}
    </div>
  );
}

function AuthorRow({ item, light = false }) {
  return (
    <div className={`flex items-center gap-3 border-t pt-4 ${light ? "border-white/20" : "border-[#F0E6DE] dark:border-white/10"}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${light ? "bg-primary/80" : "bg-primary dark:bg-[#8D5C42]"}`}>
        {item.author[0]}
      </div>
      <div>
        <p className={`text-sm font-bold uppercase tracking-[0.18em] ${light ? "text-white" : "text-zinc-800 dark:text-[#F7EEE8]"}`}>
          {item.author}
        </p>
        <p className={`mt-0.5 text-[11px] uppercase tracking-[0.22em] ${light ? "text-white/60" : "text-primary/70 dark:text-primary/70"}`}>
          Guest Highlight
        </p>
      </div>
    </div>
  );
}

function HeartsRow({ light = false }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Heart
          key={i}
          size={12}
          className={light ? "fill-primary text-primary" : "fill-primary text-primary dark:fill-primary dark:text-primary"}
        />
      ))}
    </div>
  );
}

function DateBadge({ date, light = false }) {
  return (
    <div className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] backdrop-blur-md ${light ? "border-white/20 bg-black/35 text-white" : "border-primary/20 bg-primary/5 text-primary dark:border-white/10 dark:bg-white/5 dark:text-primary"}`}>
      {date}
    </div>
  );
}

function TestimonialCard({ item }) {
  const format = item.format ?? "multi";

  if (format === "image-only") {
    const img = item.media?.[0];
    return (
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative h-64 overflow-hidden rounded-[2rem] shadow-[0_18px_45px_rgba(72,41,26,0.18)]"
      >
        {img ? (
          <img
            src={img.url}
            alt={item.author}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#5F4338] to-[#A27B62]" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center justify-between right-4">
          {/* <HeartsRow light /> */}
          <DateBadge date={item.date} light />
        </div>

        <div className="absolute inset-x-4 bottom-4">
          <AuthorRow item={item} light />
        </div>
      </motion.article>
    );
  }

  if (format === "content-only") {
    return (
      <motion.article
        whileHover={{ y: -8, rotateX: -2, rotateY: 2 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-[#EADFD4] bg-white/90 p-6 shadow-[0_18px_45px_rgba(72,41,26,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[#1A1210]/88"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-x-6 top-0 h-20 rounded-b-full bg-linear-to-b from-[#D8B08C]/20 to-transparent blur-2xl dark:from-[#A06F54]/15" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* <HeartsRow /> */}
          <DateBadge date={item.date} />
        </div>

        {item.description?.trim() && (
          <div className="relative z-10 mt-4">
            <p className="font-serif text-6xl leading-none text-primary/20 select-none dark:text-primary/20">&ldquo;</p>
            <p className="mt-1 font-serif text-base italic leading-7 text-zinc-700 dark:text-[#D8C7BB]">
              {item.description}
            </p>
            <p className="mt-2 font-serif text-6xl leading-none text-primary/20 select-none text-right dark:text-primary/20">&rdquo;</p>
          </div>
        )}

        <div className="relative z-10 mt-3">
          <AuthorRow item={item} />
        </div>
      </motion.article>
    );
  }

  if (format === "split") {
    const img = item.media?.[0];
    return (
      <motion.article
        whileHover={{ y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="overflow-hidden rounded-[2rem] border border-[#EADFD4] bg-white/90 shadow-[0_18px_45px_rgba(72,41,26,0.12)] dark:border-white/10 dark:bg-[#1A1210]/88"
      >
        <div className="relative h-44 overflow-hidden">
          {img ? (
            <img
              src={img.url}
              alt={item.author}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-[#5F4338] to-[#A27B62]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex items-center justify-between right-3">
            {/* <HeartsRow light /> */}
            <DateBadge date={item.date} light />
          </div>
          {img && (
            <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {getMediaBadge(img.type)}
            </div>
          )}
        </div>

        <div className="p-5">
          {item.description?.trim() && (
            <p className="line-clamp-3 text-sm leading-7 text-zinc-700 dark:text-[#D8C7BB]">
              &ldquo;{item.description}&rdquo;
            </p>
          )}
          <div className="mt-4">
            <AuthorRow item={item} />
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -8, rotateX: -2, rotateY: 2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-[#EADFD4] bg-white/90 p-5 shadow-[0_18px_45px_rgba(72,41,26,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[#1A1210]/88 dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-x-6 top-0 h-24 rounded-b-full bg-linear-to-b from-[#D8B08C]/20 to-transparent blur-2xl dark:from-[#A06F54]/15" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* <HeartsRow /> */}
        <DateBadge date={item.date} />
      </div>

      <div className="relative z-10 mt-4">
        <MediaGrid items={item.media} />
      </div>

      {item.description?.trim() && (
        <div className="relative z-10 mt-5">
          <p className="line-clamp-4 text-sm leading-7 text-zinc-700 dark:text-[#D8C7BB]">
            &ldquo;{item.description}&rdquo;
          </p>
        </div>
      )}

      <div className="relative z-10 mt-5">
        <AuthorRow item={item} />
      </div>
    </motion.article>
  );
}

function InfiniteColumn({ items, pattern, scrollYProgress }) {
  const parallaxY = useTransform(scrollYProgress, [0, 1], pattern.parallax);
  const controls = useAnimation();
  const loopItems = [...items, ...items];

  useEffect(() => {
    controls.start({
      ...pattern.animate,
      transition: { duration: pattern.duration, repeat: Infinity, ease: "linear" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseEnter = () => controls.stop();
  const handleMouseLeave = () =>
    controls.start({
      ...pattern.animate,
      transition: { duration: pattern.duration, repeat: Infinity, ease: "linear" },
    });

  return (
    <motion.div
      style={{ y: parallaxY }}
      className="relative h-[34rem] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-[#F7F7F5] via-[#F7F7F5]/85 to-transparent dark:from-[#120D0C] dark:via-[#120D0C]/85" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-[#F7F7F5] via-[#F7F7F5]/85 to-transparent dark:from-[#120D0C] dark:via-[#120D0C]/85" />

      <motion.div
        initial={pattern.initial}
        animate={controls}
        className="flex flex-col gap-5"
      >
        {loopItems.map((item, index) => (
          <TestimonialCard key={`${item.id}-${index}`} item={item} />
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function CafeTestimonials({
  initialExperiences = [],
  initialTestimonialHeader = null,
  initialCafeTypeId,
}) {
  const ssrExperiences = Array.isArray(initialExperiences) && initialExperiences.length > 0;

  const [experiences, setExperiences] = useState(ssrExperiences ? initialExperiences : []);
  const [headerData, setHeaderData] = useState(initialTestimonialHeader || {
    title: "A Sip of Guest Stories",
    sectionTag: "The Daily Grind & Glory",
    description: "",
  });
  const [loading, setLoading] = useState(!ssrExperiences);

  useEffect(() => {
    if (ssrExperiences && initialTestimonialHeader) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        let cafeTypeId = initialCafeTypeId;
        if (!cafeTypeId) {
          const typesRes = await getPropertyTypes();
          const propertyTypes = typesRes?.data || typesRes || [];
          const cafeType = Array.isArray(propertyTypes)
            ? propertyTypes.find((t) => t?.isActive && t?.typeName?.toLowerCase().trim() === "cafe")
            : null;
          cafeTypeId = cafeType?.id ? Number(cafeType.id) : null;
        }

        const [expRes, headersRes] = await Promise.all([
          getGuestExperienceSection({ size: 100 }),
          getActiveTestimonialHeaders(),
        ]);

        const rawData = expRes?.data?.data ?? expRes?.data ?? expRes ?? [];
        const list = Array.isArray(rawData) ? rawData : (rawData.content ?? []);

        const mappedExp = list.filter(item => {
          const byTypeName = (item?.propertyTypeName || "").toLowerCase().trim() === "cafe";
          const byTypeId = cafeTypeId != null && Number(item?.propertyTypeId) === cafeTypeId;
          return byTypeName || byTypeId;
        }).sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return Number(b.id) - Number(a.id);
        }).map(item => {
          const mediaUrls = new Set();
          const allMedia = [];
          if (item.mediaList && Array.isArray(item.mediaList)) {
            item.mediaList.forEach(m => {
              const url = m.url || m.imageUrl || m.videoUrl;
              if (url && !mediaUrls.has(url)) {
                mediaUrls.add(url);
                allMedia.push({ type: m.type === "VIDEO" ? "video" : "image", url });
              }
            });
          }
          if (item.videoUrl && !mediaUrls.has(item.videoUrl)) {
            mediaUrls.add(item.videoUrl);
            allMedia.push({ type: "video", url: item.videoUrl });
          }
          if (item.imageUrl && !mediaUrls.has(item.imageUrl)) {
            mediaUrls.add(item.imageUrl);
            allMedia.push({ type: "image", url: item.imageUrl });
          }

          let format = "multi";
          const hasDesc = item.description && item.description.trim().length > 0;
          if (allMedia.length === 0) format = "content-only";
          else if (allMedia.length === 1 && !hasDesc) format = "image-only";
          else if (allMedia.length > 0 && hasDesc) format = "split";

          return {
            id: item.id,
            format: format,
            author: item.author || "Guest",
            description: item.description || "",
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
            media: allMedia,
            title: item.title,
          };
        });

        const allHeaders = headersRes?.data || [];
        const cafeHeaders = allHeaders.filter(h => h.isActive && (cafeTypeId != null ? h.propertyTypeId === cafeTypeId : true)).sort((a, b) => b.id - a.id);
        const latestHeader = cafeHeaders[0];

        setExperiences(mappedExp);
        if (latestHeader) {
          setHeaderData({
            title: latestHeader.testimonialName1 || latestHeader.header1 || "A Sip of Guest Stories",
            sectionTag: latestHeader.testimonialName2 || latestHeader.header2 || "The Daily Grind & Glory",
            description: latestHeader.description || "",
          });
        }
      } catch (err) {
        console.error("Failed fetching cafe testimonials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ssrExperiences, initialTestimonialHeader, initialCafeTypeId]);

  const extractRatingFromTitle = (title = "") => {
    const match = title?.match(/\((\d+)\/5\)/);
    return match ? Number(match[1]) : null;
  };
  const validRatings = experiences.map((e) => extractRatingFromTitle(e.title)).filter((r) => r !== null);
  const avgRating = validRatings.length > 0 ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1) : "5.0";

  const sectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUploading] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const glowY = useTransform(scrollYProgress, [0, 1], [-40, 55]);
  const glowX = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const testimonialColumns = useMemo(() => {
    const repeated = duplicateToLength(experiences, 9);
    return [0, 1, 2].map((columnIndex) =>
      repeated.filter((_, itemIndex) => itemIndex % 3 === columnIndex)
    );
  }, [experiences]);

  const mobileFeed = useMemo(() => duplicateToLength(experiences, 8), [experiences]);

  const handleFileUpload = (e) => {
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

    if (!authorName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all your details to post a review.");
      setShowPopup(true);
      return;
    }

    const phoneTrimmed = phone.trim();
    if (!/^[0-9]{10}$/.test(phoneTrimmed)) {
      toast.error("Please enter a valid 10-digit phone number.");
      setShowPopup(true);
      return;
    }

    if (!feedbackText.trim() && mediaPreviews.length === 0 && !ytLink.trim()) {
      toast.error("Please provide a comment, image, or video link.");
      return;
    }



    setIsSubmitting(true);
    try {
      const fd = new FormData();
      const rating = 5;
      const filled = "⭐".repeat(rating);
      const empty = "☆".repeat(5 - rating);
      const stars = `${filled}${empty} (${rating}/5)`;
      const snippet = (feedbackText || "").trim().slice(0, 20);
      const title = snippet ? `${stars} ${snippet}` : stars;

      fd.append("title", title);
      fd.append("description", feedbackText.trim());
      fd.append("author", authorName.trim());
      fd.append("authorEmail", email.trim());
      fd.append("authorPhone", phone.trim());
      fd.append("rating", String(rating));
      if (initialCafeTypeId != null) {
        fd.append("propertyTypeId", String(initialCafeTypeId));
      } else {
        const typesRes = await getPropertyTypes();
        const propertyTypes = typesRes?.data || typesRes || [];
        const cafeType = Array.isArray(propertyTypes)
          ? propertyTypes.find((t) => t?.isActive && t?.typeName?.toLowerCase().trim() === "cafe")
          : null;
        if (cafeType?.id) fd.append("propertyTypeId", String(cafeType.id));
      }

      if (ytLink.trim()) fd.append("videoUrl", ytLink.trim());
      mediaPreviews.forEach((m) => fd.append("files", m.file));
      fd.append(
        "mediaType",
        mediaPreviews.some((m) => m.type === "video") ? "VIDEO" : "IMAGE"
      );

      await createGuestExperienceByGuest(fd);
      toast.success("Thank you! Your story has been submitted.");

      setFeedbackText("");
      setMediaPreviews([]);
      setYtLink("");
      setIsVerified(false);
      setAuthorName("");
      setEmail("");
      setPhone("");
      setShowPopup(false);

    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleParts = headerData.title ? headerData.title.split(" ") : ["A", "Sip", "of", "Guest", "Stories"];
  const titleMain = titleParts.length > 1 ? titleParts.slice(0, -1).join(" ") : titleParts[0] || "";
  const titleItalic = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "";

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F7F7F5] py-20 text-zinc-900 dark:bg-[#120D0C] dark:text-[#F7EEE8]"
    >
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-[-8%] top-20 h-72 w-72 rounded-full bg-[#E1E1DD]/70 blur-3xl dark:bg-[#8D5C42]/18"
      />
      <motion.div
        style={{ x: useTransform(scrollYProgress, [0, 1], [25, -25]), y: useTransform(scrollYProgress, [0, 1], [35, -20]) }}
        className="pointer-events-none absolute right-[-6%] top-1/3 h-80 w-80 rounded-full bg-[#ECECE8]/70 blur-3xl dark:bg-[#5A3426]/25"
      />

      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          style={{ y: headerY }}
          className="mb-16 flex flex-col justify-between gap-6 border-b border-primary/20 pb-8 md:flex-row md:items-end dark:border-white/10"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[1px] w-8 bg-primary dark:bg-[#BEA18F]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-[#BEA18F]">
                {headerData.sectionTag}
              </p>
            </div>
            <h2 className="text-4xl font-serif font-medium leading-tight md:text-5xl">
              {titleMain}{" "}
              <span className="italic text-primary dark:text-[#DDB8A5]">
                {titleItalic}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-6 rounded-[1.8rem] border border-primary/20 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <div className="text-center">
              <p className="text-3xl font-serif font-bold leading-none text-zinc-900 dark:text-[#F7EEE8]">
                {avgRating}
              </p>
              <div className="mt-2 flex gap-0.5 cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary dark:fill-primary dark:text-primary" />
                ))}
              </div>
            </div>
            <div className="h-10 w-[1px] bg-primary/20 dark:bg-white/10" />
            <p className="max-w-[90px] text-[11px] font-semibold uppercase leading-tight tracking-widest text-primary dark:text-primary">
              Average Rating
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {loading && experiences.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <>
                <div className="hidden gap-5 lg:grid lg:grid-cols-3">
                  {testimonialColumns.map((columnItems, index) => (
                    <InfiniteColumn
                      key={`column-${index}`}
                      items={columnItems}
                      pattern={motionPatterns[index]}
                      scrollYProgress={scrollYProgress}
                    />
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
                  {mobileFeed.map((item, index) => (
                    <motion.div
                      key={`${item.id}-mobile-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                    >
                      <TestimonialCard item={item} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="group relative overflow-hidden rounded-[2rem] bg-[#3E2723] p-8 text-[#FDFCFB] shadow-2xl dark:bg-[#1A1210]">
              <Coffee className="absolute -bottom-4 -right-4 opacity-5 transition-transform duration-700 group-hover:rotate-12" size={160} />

              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <h4 className="text-xl font-serif">Sign our Guestbook</h4>
                  <Edit2 size={18} className="text-primary-foreground/70" />
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-tighter text-white/40">Brewing stories as</p>
                      <p className="text-sm font-medium">{authorName || "Anonymous Adventurer"}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your cafe moment..."
                      className="h-32 w-full resize-none border-b border-white/20 bg-transparent py-2 text-sm leading-relaxed outline-none transition-all placeholder:text-white/20 focus:border-white/40"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="group/input flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <Youtube size={16} className={ytLink ? "text-[#E57373]" : "text-white/20"} />
                      <input
                        type="url"
                        value={ytLink}
                        onChange={(e) => setYtLink(e.target.value)}
                        placeholder="Link a reel, short, or video"
                        className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold transition-all hover:bg-white/10 cursor-pointer"
                      >
                        {mediaUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                        Add Media
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                    </div>
                  </div>

                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {mediaPreviews.map((m, i) => (
                        <div key={i} className="relative h-14 overflow-hidden rounded-lg border border-white/20">
                          {m.type === "image" ? (
                            <img src={m.url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-black">
                              <Video size={12} />
                            </div>
                          )}
                          <button
                            onClick={() => setMediaPreviews((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white cursor-pointer"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    disabled={isSubmitting || (!feedbackText.trim() && mediaPreviews.length === 0 && !ytLink.trim())}
                    onClick={handleSubmit}
                    className="group/btn relative w-full overflow-hidden rounded-2xl bg-primary py-4 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:grayscale disabled:opacity-50 cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          Leave a Review
                          <Send size={16} className="transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3E2723]/60 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-10 text-zinc-900 shadow-2xl dark:bg-[#1A1210] dark:text-[#F7EEE8]"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-serif">Guest Details</h3>
                <button onClick={() => setShowPopup(false)} className="transition-transform hover:rotate-90 cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  ["Full Name", authorName, setAuthorName],
                  ["Email Address", email, setEmail],
                  ["Phone Number", phone, setPhone],
                ].map(([label, val, set], i) => (
                  <div key={i}>
                    <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-widest text-primary/80 dark:text-[#BEA18F]">
                      {label}
                    </label>
                    <input
                      type={label === "Email Address" ? "email" : label === "Phone Number" ? "tel" : "text"}
                      maxLength={label === "Phone Number" ? 10 : undefined}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className="w-full rounded-xl border border-primary/20 bg-[#FAF9F6] p-4 outline-none transition-colors focus:border-primary dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                ))}

                <button
                  onClick={() => {
                    if (!authorName.trim() || !email.trim() || !phone.trim()) {
                      toast.error("Please fill in all details.");
                      return;
                    }
                    if (!/^\d{10}$/.test(phone.trim())) {
                      toast.error("Phone number must be exactly 10 digits.");
                      return;
                    }
                    if (!authorName.trim() || !email.trim() || !phone.trim()) {
                      toast.error("Please fill in all details.");
                      return;
                    }
                    if (!/^\d{10}$/.test(phone.trim())) {
                      toast.error("Phone number must be exactly 10 digits.");
                      return;
                    }
                    if (!feedbackText.trim() && mediaPreviews.length === 0 && !ytLink.trim()) {
                      toast.error("Please provide at least a comment or media.");
                      setShowPopup(false);
                      return;
                    }
                    setIsVerified(true);
                    setShowPopup(false);
                    handleSubmit();
                  }}
                  className="mt-4 w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg transition-all hover:bg-primary/90"
                >
                  Verify & Post Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
