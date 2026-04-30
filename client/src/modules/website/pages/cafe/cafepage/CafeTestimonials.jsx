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
  Volume2,
  VolumeX,
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
  if (type === "instagram") return "Instagram";
  if (type === "youtube") return "YouTube";
  if (type === "video") return "Video";
  if (type === "reel") return "Reel";
  if (type === "short") return "Short";
  return "Photo";
};

const normalizeExternalUrl = (url = "") => {
  const clean = String(url).trim();
  if (!clean) return "";
  if (/^(https?:|blob:|data:)/i.test(clean) || clean.startsWith("/")) {
    return clean;
  }
  if (/^(www\.)?(instagram\.com|youtube\.com|youtu\.be)\//i.test(clean)) {
    return `https://${clean}`;
  }
  if (/^[\w.-]+\.[a-z]{2,}\//i.test(clean)) {
    return `https://${clean}`;
  }
  return clean;
};

const isYoutubeUrl = (url = "") =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(String(url).trim());

const isInstagramUrl = (url = "") =>
  /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv)\/.+/.test(String(url).trim());

const isVideoFileUrl = (url = "") =>
  /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(String(url).trim());

const getYoutubeId = (url = "") => {
  const clean = normalizeExternalUrl(url);
  const matches = [
    /youtube\.com\/shorts\/([^"&?/\s]{11})/,
    /youtu\.be\/([^"&?/\s]{11})/,
    /[?&]v=([^"&?/\s]{11})/,
    /embed\/([^"&?/\s]{11})/,
  ];
  for (const regex of matches) {
    const match = clean.match(regex);
    if (match) return match[1];
  }
  return null;
};

const getInstagramEmbedUrl = (url = "") => {
  const clean = normalizeExternalUrl(url).split("?")[0].replace(/\/$/, "");
  return clean ? `${clean}/embed/` : "";
};

function MediaTile({ item, index, total }) {
  const [isMuted, setIsMuted] = useState(true);
  const ytRef = useRef(null);

  if (!item) return null;

  const roundedClass = total === 1 ? "rounded-[1.4rem]" : "rounded-[1rem]";
  const url = normalizeExternalUrl(item.url);
  const isInstagram = isInstagramUrl(url);
  const isYoutube = isYoutubeUrl(url);
  const isNativeVideo = item.type === "video" || isVideoFileUrl(url);
  const youtubeId = isYoutube ? getYoutubeId(url) : null;
  const instagramEmbedUrl = isInstagram ? getInstagramEmbedUrl(url) : "";

  const toggleYtMute = (event) => {
    event.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: "" }),
      "*",
    );
  };

  return (
    <div className={`group relative overflow-hidden ${roundedClass} bg-[#E7D8CA]/70 dark:bg-[#241716]`}>
      {isInstagram ? (
        instagramEmbedUrl ? (
          <iframe
            src={instagramEmbedUrl}
            className="h-full w-full bg-black"
            style={{ border: "none" }}
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            title={item.alt || "Instagram post"}
          />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full w-full items-center justify-center bg-black text-xs font-bold uppercase tracking-[0.2em] text-white underline"
          >
            View on Instagram
          </a>
        )
      ) : isYoutube && youtubeId ? (
        <div className="relative h-full w-full">
          <iframe
            ref={ytRef}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&enablejsapi=1`}
            className="h-full w-full pointer-events-none"
            style={{ border: "none" }}
            allow="autoplay; encrypted-media"
            title={item.alt || "Guest video"}
          />
          <button
            type="button"
            onClick={toggleYtMute}
            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 shadow-md pointer-events-auto cursor-pointer select-none isolate"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <span className="pointer-events-none">
              {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
            </span>
          </button>
        </div>
      ) : isNativeVideo ? (
        <div className="relative h-full w-full">
          <video
            src={url}
            className="h-full w-full object-cover pointer-events-none"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsMuted((current) => !current);
            }}
            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 shadow-md pointer-events-auto cursor-pointer select-none isolate"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <span className="pointer-events-none transition-opacity duration-150">
              {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
            </span>
          </button>
        </div>
      ) : (
        <img
          src={url}
          alt={item.alt || getMediaBadge(item.type)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#140c0a]/80 via-[#140c0a]/20 to-transparent" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
        {getMediaBadge(item.type)}
      </div>
      {item.type !== "image" && !isYoutube && !isNativeVideo && (
        <div className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#3E2723] shadow-lg transition-transform duration-500 group-hover:scale-110">
          <Play size={14} className="ml-0.5" />
        </div>
      )}
      {isInstagram && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 z-20 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          Open
        </a>
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

function StandaloneMedia({ media, alt, className }) {
  const [isMuted, setIsMuted] = useState(true);
  const ytRef = useRef(null);

  const toggleYtMute = (event) => {
    event.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: "" }),
      "*",
    );
  };

  if (!media) return null;

  const url = normalizeExternalUrl(media.url);
  const isInstagram = isInstagramUrl(url);
  const isYoutube = isYoutubeUrl(url);
  const isNativeVideo = media.type === "video" || isVideoFileUrl(url);
  const youtubeId = isYoutube ? getYoutubeId(url) : null;
  const instagramEmbedUrl = isInstagram ? getInstagramEmbedUrl(url) : "";

  if (isInstagram) {
    return (
      <div className={`${className} relative flex items-center justify-center overflow-hidden bg-black`}>
        {instagramEmbedUrl ? (
          <iframe
            src={instagramEmbedUrl}
            className="h-full w-full bg-black"
            style={{ border: "none" }}
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            title={alt || "Instagram post"}
          />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold uppercase tracking-[0.2em] text-white underline"
          >
            View on Instagram
          </a>
        )}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 z-20 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white"
        >
          Open
        </a>
      </div>
    );
  }

  if (isYoutube && youtubeId) {
    return (
      <div className={`${className} group relative overflow-hidden bg-black`}>
        <iframe
          ref={ytRef}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&enablejsapi=1`}
          className="h-full w-full pointer-events-none"
          style={{ border: "none" }}
          allow="autoplay; encrypted-media"
          title={alt || "Guest video"}
        />
        <button
          type="button"
          onClick={toggleYtMute}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 shadow-md pointer-events-auto cursor-pointer select-none isolate"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          <span className="pointer-events-none">
            {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
          </span>
        </button>
      </div>
    );
  }

  if (isNativeVideo) {
    return (
      <div className={`${className} group relative overflow-hidden bg-black`}>
        <video
          src={url}
          className="h-full w-full object-cover pointer-events-none"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsMuted((v) => !v); }}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 shadow-md pointer-events-auto cursor-pointer select-none isolate"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          <span className="pointer-events-none">
            {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
          </span>
        </button>
      </div>
    );
  }

  return <img src={url} alt={alt} className={className} />;
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
        className="relative h-56 overflow-hidden rounded-[2rem] shadow-[0_18px_45px_rgba(72,41,26,0.18)] sm:h-64"
      >
        {img ? (
          <StandaloneMedia
            media={img}
            alt={item.author}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#5F4338] to-[#A27B62]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

        <div className="pointer-events-none absolute left-4 top-4 flex items-center justify-between right-4">
          {/* <HeartsRow light /> */}
          <DateBadge date={item.date} light />
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4">
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
        <div className="relative h-40 overflow-hidden sm:h-44">
          {img ? (
            <StandaloneMedia
              media={img}
              alt={item.author}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-[#5F4338] to-[#A27B62]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <div className="pointer-events-none absolute left-3 top-3 flex items-center justify-between right-3">
            {/* <HeartsRow light /> */}
            <DateBadge date={item.date} light />
          </div>
          {img && (
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
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

function InfiniteColumn({ items, pattern, scrollYProgress, paused = false }) {
  const parallaxY = useTransform(scrollYProgress, [0, 1], pattern.parallax);
  const controls = useAnimation();
  const loopItems = [...items, ...items];

  useEffect(() => {
    if (paused) {
      controls.stop();
    } else {
      controls.start({
        ...pattern.animate,
        transition: { duration: pattern.duration, repeat: Infinity, ease: "linear" },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

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
  propertyId,
}) {
  const ssrExperiences = Array.isArray(initialExperiences) && initialExperiences.length > 0;

  const [experiences, setExperiences] = useState(ssrExperiences ? initialExperiences : []);
  const [headerData, setHeaderData] = useState(initialTestimonialHeader || {
    title: "A Sip of Guest Stories",
    sectionTag: "The Daily Grind & Glory",
    description: "",
    ratingValue: "",
    ratingLabel: "",
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
          const byPropertyId = propertyId != null ? String(item?.propertyId) === String(propertyId) : true;
          return (byTypeName || byTypeId) && byPropertyId;
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
                const cleanUrl = normalizeExternalUrl(url);
                mediaUrls.add(url);
                allMedia.push({
                  type: isInstagramUrl(cleanUrl)
                    ? "instagram"
                      : isYoutubeUrl(cleanUrl)
                        ? "youtube"
                      : m.type === "VIDEO" || isVideoFileUrl(cleanUrl)
                        ? "video"
                        : "image",
                  url: cleanUrl,
                });
              }
            });
          }
          if (item.videoUrl && !mediaUrls.has(item.videoUrl)) {
            const cleanUrl = normalizeExternalUrl(item.videoUrl);
            mediaUrls.add(item.videoUrl);
            allMedia.push({
              type: isInstagramUrl(cleanUrl)
                ? "instagram"
                : isYoutubeUrl(cleanUrl)
                  ? "youtube"
                  : isVideoFileUrl(cleanUrl)
                    ? "video"
                  : "video",
              url: cleanUrl,
            });
          }
          if (item.imageUrl && !mediaUrls.has(item.imageUrl)) {
            const cleanUrl = normalizeExternalUrl(item.imageUrl);
            mediaUrls.add(item.imageUrl);
            allMedia.push({ type: "image", url: cleanUrl });
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
        const cafeHeaders = allHeaders
          .filter(h => {
            if (!h.isActive) return false;
            if (propertyId) return String(h.propertyId) === String(propertyId);
            return cafeTypeId != null ? h.propertyTypeId === cafeTypeId : true;
          })
          .sort((a, b) => b.id - a.id);
        const latestHeader = cafeHeaders[0];

        setExperiences(mappedExp);
        if (latestHeader) {
          let ratingValue = "";
          let ratingLabel = "";
          const rawDesc = latestHeader.description || "";
          try {
            const parsed = JSON.parse(rawDesc);
            if (parsed && typeof parsed === "object" && "ratingValue" in parsed) {
              ratingValue = parsed.ratingValue || "";
              ratingLabel = parsed.ratingLabel || "";
            }
          } catch {
            // plain text, not a rating JSON
          }
          setHeaderData({
            title: latestHeader.testimonialName1 || latestHeader.header1 || "A Sip of Guest Stories",
            sectionTag: latestHeader.testimonialName2 || latestHeader.header2 || "The Daily Grind & Glory",
            description: rawDesc,
            ratingValue,
            ratingLabel,
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
  const [isColumnsPaused, setIsColumnsPaused] = useState(false);

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

  const handleSubmit = async ({ verified = isVerified } = {}) => {
    if (!verified) {
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

    const videoLink = normalizeExternalUrl(ytLink);
    if (ytLink.trim() && !isYoutubeUrl(videoLink) && !isInstagramUrl(videoLink)) {
      toast.error("Please enter a valid YouTube or Instagram link.");
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
      if (propertyId) fd.append("propertyId", String(propertyId));
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

      if (videoLink) fd.append("videoUrl", videoLink);
      mediaPreviews.forEach((m) => fd.append("files", m.file));
      fd.append(
        "mediaType",
        videoLink || mediaPreviews.some((m) => m.type === "video") ? "VIDEO" : "IMAGE"
      );

      await createGuestExperienceByGuest(fd);
      toast.success("Thank you! Your story has been submitted.");

      const submittedMedia = [
        ...(videoLink
          ? [
              {
                type: isInstagramUrl(videoLink)
                  ? "instagram"
                  : isYoutubeUrl(videoLink)
                    ? "youtube"
                    : "video",
                url: videoLink,
              },
            ]
          : []),
        ...mediaPreviews.map((m) => ({
          type: m.type,
          url: m.url,
        })),
      ];
      const hasDesc = feedbackText.trim().length > 0;
      setExperiences((prev) => [
        {
          id: `local-${Date.now()}`,
          format:
            submittedMedia.length === 0
              ? "content-only"
              : submittedMedia.length === 1 && !hasDesc
                ? "image-only"
                : "split",
          author: authorName.trim() || "Guest",
          description: feedbackText.trim(),
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          media: submittedMedia,
          title,
        },
        ...prev,
      ]);

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
  const ratingNumber = Number(headerData.ratingValue || avgRating || 0);
  const safeRating = Number.isFinite(ratingNumber) ? Math.max(0, Math.min(5, ratingNumber)) : 0;
  const filledStars = Math.floor(safeRating);

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F7F7F5] pb-12 pt-0 text-zinc-900 dark:bg-[#120D0C] dark:text-[#F7EEE8] md:pb-16 lg:pb-20"
    >
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-[-8%] top-20 h-72 w-72 rounded-full bg-[#E1E1DD]/70 blur-3xl dark:bg-[#8D5C42]/18"
      />
      <motion.div
        style={{ x: useTransform(scrollYProgress, [0, 1], [25, -25]), y: useTransform(scrollYProgress, [0, 1], [35, -20]) }}
        className="pointer-events-none absolute right-[-6%] top-1/3 h-80 w-80 rounded-full bg-[#ECECE8]/70 blur-3xl dark:bg-[#5A3426]/25"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-5">
        <motion.div
          style={{ y: headerY }}
          className="mb-8 flex flex-col justify-between gap-4 border-b border-primary/20 pb-6 md:mb-12 md:gap-6 md:pb-8 md:flex-row md:items-end dark:border-white/10"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[1px] w-8 bg-primary dark:bg-[#BEA18F]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-[#BEA18F]">
                {headerData.sectionTag}
              </p>
            </div>
            <h2 className="text-3xl font-serif font-medium leading-tight sm:text-4xl md:text-5xl">
              {titleMain}{" "}
              <span className="italic text-primary dark:text-[#DDB8A5]">
                {titleItalic}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4 rounded-[1.8rem] border border-primary/20 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:gap-6 sm:p-6 dark:border-white/10 dark:bg-white/5">
            <div className="text-center">
              <p className="text-3xl font-serif font-bold leading-none text-zinc-900 dark:text-[#F7EEE8]">
                {headerData.ratingValue || avgRating}
              </p>
              <div className="mt-2 flex gap-0.5 cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < filledStars
                        ? "fill-primary text-primary dark:fill-primary dark:text-primary"
                        : "fill-transparent text-primary/35 dark:text-primary/35"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="h-10 w-[1px] bg-primary/20 dark:bg-white/10" />
            <p className="max-w-[90px] text-[11px] font-semibold uppercase leading-tight tracking-widest text-primary dark:text-primary">
              {headerData.ratingLabel || "Average Rating"}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {loading && experiences.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <>
                <div
                  className="hidden gap-5 lg:grid lg:grid-cols-3"
                  onMouseEnter={() => setIsColumnsPaused(true)}
                  onMouseLeave={() => setIsColumnsPaused(false)}
                >
                  {testimonialColumns.map((columnItems, index) => (
                    <InfiniteColumn
                      key={`column-${index}`}
                      items={columnItems}
                      pattern={motionPatterns[index]}
                      scrollYProgress={scrollYProgress}
                      paused={isColumnsPaused}
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
            <div className="group relative overflow-hidden rounded-[2rem] bg-[#3E2723] p-5 text-[#FDFCFB] shadow-2xl sm:p-6 md:p-8 dark:bg-[#1A1210]">
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
                    handleSubmit({ verified: true });
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
