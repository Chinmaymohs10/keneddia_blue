import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useScroll, useTransform, useSpring, motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight as ChevronRight$1, CheckCircle2, Star, Loader2, X, Video, Upload, Youtube, User, Send, VolumeX, Volume2, ChevronLeft, Users, ArrowRight as ArrowRight$1, MapPin, PartyPopper, Briefcase, Calendar } from "lucide-react";
import { aa as getPrimaryConversionsHeader, S as Label, I as Input, B as Button, a4 as createJoiningUs, ab as getActiveTestimonialHeaders, i as getGuestExperienceSection, ac as showError, j as createGuestExperienceByGuest, r as getEventsUpdated, t as getGroupBookings, ad as getEventsHeaderByProperty, u as createGroupBookingEnquiry, v as buildEventDetailPath } from "../entry-server.js";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const FALLBACK = {
  header1: "Secure Your",
  header2: "Table.",
  description: "A curated dining experience awaits. Reserve your space in our premier destination.",
  footer: "Guaranteed Response within 24 Hours • Call +91-9211308384"
};
const EMPTY_FORM$1 = {
  guestName: "",
  contactNumber: "",
  date: "",
  time: "",
  totalGuest: ""
};
function ReservationForm({ propertyId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM$1);
  const containerRef = useRef(null);
  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));
  const [header, setHeader] = useState(FALLBACK);
  useEffect(() => {
    if (!propertyId) return;
    getPrimaryConversionsHeader().then((res) => {
      const all = res?.data || [];
      const matched = all.filter((h) => h.propertyId === propertyId).sort((a, b) => b.id - a.id);
      const latest = matched[0] || null;
      if (latest) {
        setHeader({
          header1: latest.header1 || FALLBACK.header1,
          header2: latest.header2 || FALLBACK.header2,
          description: latest.description || FALLBACK.description,
          footer: latest.footer || FALLBACK.footer
        });
      }
    }).catch(() => {
    });
  }, [propertyId]);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["10%", "-20%"]);
  const formY = useTransform(scrollYProgress, [0, 1], ["50px", "-100px"]);
  const smoothFormY = useSpring(formY, { stiffness: 100, damping: 30 });
  const handleNext = () => {
    const { guestName, contactNumber, date, time, totalGuest } = formData;
    if (!guestName.trim() || !contactNumber.trim() || !date || !time || !totalGuest)
      return;
    setSubmitError(null);
    setCurrentStep(2);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createJoiningUs({
        guestName: formData.guestName.trim(),
        contactNumber: formData.contactNumber.trim(),
        date: formData.date,
        time: formData.time,
        totalGuest: Number(formData.totalGuest),
        propertyId
      });
      setCurrentStep(3);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleReset = () => {
    setFormData(EMPTY_FORM$1);
    setSubmitError(null);
    setCurrentStep(1);
  };
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: containerRef,
      id: "reservation",
      className: "relative py-4 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[400px]",
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            style: { x: bgTextX },
            className: "absolute top-1/4 left-0 whitespace-nowrap text-[12rem] md:text-[15rem] font-black text-zinc-900/[0.03] dark:text-white/[0.02] pointer-events-none select-none italic uppercase z-0",
            children: "Reservations Table Booking Experience"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-16 items-start", children: [
            /* @__PURE__ */ jsxs("div", { className: "lg:w-1/3 lg:sticky lg:top-32", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary animate-pulse" }),
                /* @__PURE__ */ jsx("span", { className: "text-primary text-[10px] font-bold uppercase tracking-[0.5em]", children: "Primary Conversion" })
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white leading-none mb-8 transition-colors", children: [
                header.header1,
                " ",
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsx("span", { className: "italic text-zinc-400 dark:text-white/30", children: header.header2 })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-600 dark:text-white/50 text-lg leading-relaxed font-light mb-8 transition-colors", children: header.description }),
              /* @__PURE__ */ jsx("div", { className: "h-1 w-20 bg-primary/30" })
            ] }),
            /* @__PURE__ */ jsx(motion.div, { style: { y: smoothFormY }, className: "lg:w-2/3 w-full", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-3xl", children: [
              currentStep < 3 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-12", children: [1, 2].map((step) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: "flex-1 h-1 bg-zinc-200 dark:bg-white/10 relative overflow-hidden",
                  children: /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "absolute inset-0 bg-primary",
                      initial: false,
                      animate: { x: currentStep >= step ? "0%" : "-100%" }
                    }
                  )
                },
                step
              )) }),
              /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs(AnimatePresence, { mode: "wait", children: [
                currentStep === 1 && /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -20 },
                    className: "space-y-6",
                    children: [
                      /* @__PURE__ */ jsx("h3", { className: "text-zinc-900 dark:text-white font-serif text-2xl mb-8 italic opacity-60", children: "Tell us about your visit" }),
                      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
                        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                          /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-widest text-primary", children: "Guest Name" }),
                          /* @__PURE__ */ jsx(
                            Input,
                            {
                              required: true,
                              value: formData.guestName,
                              onChange: (e) => setField("guestName", e.target.value),
                              className: "bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl h-14 transition-all focus:ring-primary",
                              placeholder: "Full Name"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                          /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-widest text-primary", children: "Contact Number" }),
                          /* @__PURE__ */ jsx(
                            Input,
                            {
                              required: true,
                              value: formData.contactNumber,
                              onChange: (e) => setField("contactNumber", e.target.value),
                              className: "bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl h-14 transition-all focus:ring-primary",
                              placeholder: "+91"
                            }
                          )
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [
                        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                          /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-widest text-primary", children: "Select Date" }),
                          /* @__PURE__ */ jsx(
                            Input,
                            {
                              required: true,
                              type: "date",
                              value: formData.date,
                              onChange: (e) => setField("date", e.target.value),
                              className: "bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl h-14 dark:text-white"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                          /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-widest text-primary", children: "Select Time" }),
                          /* @__PURE__ */ jsx(
                            Input,
                            {
                              required: true,
                              type: "time",
                              value: formData.time,
                              onChange: (e) => setField("time", e.target.value),
                              className: "bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl h-14 dark:text-white"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                          /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-widest text-primary", children: "Total Guests" }),
                          /* @__PURE__ */ jsx(
                            Input,
                            {
                              required: true,
                              type: "number",
                              min: "1",
                              value: formData.totalGuest,
                              onChange: (e) => setField("totalGuest", e.target.value),
                              className: "bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl h-14 dark:text-white"
                            }
                          )
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs(
                        Button,
                        {
                          type: "button",
                          onClick: handleNext,
                          className: "w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white transition-all rounded-xl uppercase text-xs font-black",
                          children: [
                            "Review & Confirm",
                            " ",
                            /* @__PURE__ */ jsx(ChevronRight$1, { className: "ml-2 w-4 h-4" })
                          ]
                        }
                      )
                    ]
                  },
                  "step1"
                ),
                currentStep === 2 && /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -20 },
                    className: "space-y-6",
                    children: [
                      /* @__PURE__ */ jsx("h3", { className: "text-zinc-900 dark:text-white font-serif text-2xl mb-8 italic opacity-60", children: "Confirm your details" }),
                      /* @__PURE__ */ jsx("div", { className: "p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-3", children: [
                        { label: "Guest Name", value: formData.guestName },
                        { label: "Contact", value: formData.contactNumber },
                        { label: "Date", value: formData.date },
                        { label: "Time", value: formData.time },
                        { label: "Total Guests", value: formData.totalGuest }
                      ].map(({ label, value }) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "flex items-center justify-between",
                          children: [
                            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400", children: label }),
                            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-zinc-800 dark:text-white", children: value })
                          ]
                        },
                        label
                      )) }),
                      /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-white/40 text-xs italic", children: "By confirming, you are sending a reservation request. We will contact you via phone to finalize." }),
                      submitError && /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2", children: submitError }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                        /* @__PURE__ */ jsx(
                          Button,
                          {
                            type: "button",
                            variant: "outline",
                            onClick: () => setCurrentStep(1),
                            className: "h-14 px-8 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-xl",
                            children: "Modify"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Button,
                          {
                            type: "submit",
                            disabled: isSubmitting,
                            className: "flex-1 h-14 bg-primary text-white hover:bg-primary/90 transition-all rounded-xl uppercase text-xs font-black shadow-lg shadow-primary/20",
                            children: isSubmitting ? "Sending…" : "Confirm My Table"
                          }
                        )
                      ] })
                    ]
                  },
                  "step2"
                ),
                currentStep === 3 && /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    className: "flex flex-col items-center text-center py-8 space-y-6",
                    children: [
                      /* @__PURE__ */ jsx(
                        motion.div,
                        {
                          initial: { scale: 0 },
                          animate: { scale: 1 },
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.1
                          },
                          children: /* @__PURE__ */ jsx(
                            CheckCircle2,
                            {
                              className: "w-20 h-20 text-primary",
                              strokeWidth: 1.5
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                        /* @__PURE__ */ jsxs("h3", { className: "text-zinc-900 dark:text-white font-serif text-3xl", children: [
                          "Request",
                          " ",
                          /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: "Received!" })
                        ] }),
                        /* @__PURE__ */ jsxs("p", { className: "text-zinc-500 dark:text-white/50 text-sm leading-relaxed max-w-sm mx-auto", children: [
                          "Thank you,",
                          " ",
                          /* @__PURE__ */ jsx("strong", { className: "text-zinc-700 dark:text-white", children: formData.guestName }),
                          ". Your table for",
                          " ",
                          /* @__PURE__ */ jsxs("strong", { className: "text-zinc-700 dark:text-white", children: [
                            formData.totalGuest,
                            " guest",
                            Number(formData.totalGuest) !== 1 ? "s" : ""
                          ] }),
                          " ",
                          "on",
                          " ",
                          /* @__PURE__ */ jsx("strong", { className: "text-zinc-700 dark:text-white", children: formData.date }),
                          " ",
                          "at",
                          " ",
                          /* @__PURE__ */ jsx("strong", { className: "text-zinc-700 dark:text-white", children: formData.time }),
                          " ",
                          "has been requested. We will reach you at",
                          " ",
                          /* @__PURE__ */ jsx("strong", { className: "text-zinc-700 dark:text-white", children: formData.contactNumber }),
                          " ",
                          "for final confirmation."
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: handleReset,
                          className: "text-xs font-bold text-primary underline underline-offset-4 hover:opacity-70 transition-opacity",
                          children: "Make another reservation"
                        }
                      )
                    ]
                  },
                  "step3"
                )
              ] }) }),
              currentStep < 3 && /* @__PURE__ */ jsxs("div", { className: "absolute top-12 right-12 text-zinc-900/5 dark:text-white/5 text-8xl font-black italic select-none", children: [
                "0",
                currentStep
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-20 flex flex-col items-center", children: /* @__PURE__ */ jsx("p", { className: "text-zinc-400 dark:text-white/20 text-[9px] uppercase tracking-[0.5em] font-bold", children: header.footer }) })
        ] })
      ]
    }
  );
}
const isYoutubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url?.trim() ?? "");
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
const buildMediaList = (item) => {
  const allMedia = [];
  const seenUrls = /* @__PURE__ */ new Set();
  const add = (type, url) => {
    if (url && typeof url === "string" && url.trim() !== "" && !seenUrls.has(url)) {
      seenUrls.add(url.trim());
      allMedia.push({ type, url: url.trim() });
    }
  };
  if (item.mediaList && Array.isArray(item.mediaList)) {
    item.mediaList.forEach((m) => {
      const url = m.url || m.imageUrl || m.videoUrl;
      if (!url) return;
      const isVid = m.type === "VIDEO" || isYoutubeUrl(url) || /\.(mp4|webm|mov|ogg)$/i.test(url);
      add(isVid ? "video" : "image", url);
    });
  }
  if (item.videoUrl) {
    const isVid = isYoutubeUrl(item.videoUrl) || /\.(mp4|webm|mov|ogg)$/i.test(item.videoUrl);
    if (isVid) add("video", item.videoUrl);
  }
  if (item.imageUrl) add("image", item.imageUrl);
  return allMedia;
};
const FeedbackCard = ({ item }) => {
  const [mediaErrors, setMediaErrors] = useState(/* @__PURE__ */ new Set());
  const [mutedVideos, setMutedVideos] = useState(/* @__PURE__ */ new Set());
  const allMedia = buildMediaList(item);
  const renderMediaItem = (m, idx) => {
    const videoKey = `video-${m.url}`;
    const isMuted = !mutedVideos.has(videoKey);
    if (m.type === "video") {
      if (isYoutubeUrl(m.url)) {
        const videoId = getYoutubeId(m.url);
        if (!videoId) return null;
        return /* @__PURE__ */ jsxs("div", { className: "w-full h-full relative group", children: [
          /* @__PURE__ */ jsx(
            "iframe",
            {
              src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&modestbranding=1`,
              className: "w-full h-full",
              style: { border: "none" },
              allow: "autoplay; encrypted-media",
              allowFullScreen: true
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                setMutedVideos((prev) => {
                  const next = new Set(prev);
                  next.has(videoKey) ? next.delete(videoKey) : next.add(videoKey);
                  return next;
                });
              },
              className: "absolute bottom-2 right-2 z-20 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-3 h-3" })
            }
          )
        ] }, idx);
      }
      return /* @__PURE__ */ jsxs("div", { className: "relative group w-full h-full", children: [
        /* @__PURE__ */ jsx(
          "video",
          {
            src: m.url,
            className: "w-full h-full object-cover",
            autoPlay: true,
            muted: isMuted,
            loop: true,
            playsInline: true
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setMutedVideos((prev) => {
                const next = new Set(prev);
                next.has(videoKey) ? next.delete(videoKey) : next.add(videoKey);
                return next;
              });
            },
            className: "absolute bottom-2 right-2 z-20 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-3 h-3" })
          }
        )
      ] }, idx);
    }
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: m.url,
        alt: "",
        className: "w-full h-full object-cover",
        loading: "lazy",
        onError: () => setMediaErrors((prev) => new Set(prev).add(m.url))
      },
      idx
    );
  };
  const renderMediaGrid = () => {
    const valid = allMedia.filter((m) => !mediaErrors.has(m.url));
    const total = valid.length;
    if (total === 0) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center p-5", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-white text-xs italic leading-relaxed line-clamp-4", children: [
          '"',
          item.description,
          '"'
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-white/80 font-bold text-[11px]", children: [
          "— ",
          item.author
        ] })
      ] }) });
    }
    if (total === 1) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: renderMediaItem(valid[0], 0) });
    }
    if (total === 2) {
      const mixed = valid.some((m) => m.type === "video") && valid.some((m) => m.type === "image");
      if (mixed) {
        const sorted = [...valid].sort((a, b) => a.type === "image" ? -1 : 1);
        return /* @__PURE__ */ jsx("div", { className: "grid grid-rows-2 h-full gap-px", children: sorted.map((m, i) => /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: renderMediaItem(m, i) }, i)) });
      }
      return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 h-full gap-px", children: valid.map((m, i) => /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: renderMediaItem(m, i) }, i)) });
    }
    if (total === 3) {
      return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 h-full gap-px", children: [
        /* @__PURE__ */ jsx("div", { className: "h-full overflow-hidden", children: renderMediaItem(valid[0], 0) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-rows-2 h-full gap-px", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: renderMediaItem(valid[1], 1) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: renderMediaItem(valid[2], 2) })
        ] })
      ] });
    }
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 grid-rows-2 h-full gap-px", children: valid.slice(0, 4).map((m, i) => /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
      renderMediaItem(m, i),
      i === 3 && total > 4 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center", children: /* @__PURE__ */ jsxs("span", { className: "text-white font-black text-lg", children: [
        "+",
        total - 4
      ] }) })
    ] }, i)) });
  };
  const cardRating = (() => {
    const match = item.title?.match(/\((\d+)\/5\)/);
    return match ? Number(match[1]) : 5;
  })();
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-100 dark:border-white/5 shadow-lg mb-6 flex flex-col gap-4 p-4 group transition-all hover:scale-[1.02] cursor-pointer", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(
        Star,
        {
          size: 14,
          className: i < cardRating ? "fill-primary text-primary" : "text-zinc-300 dark:text-zinc-600"
        },
        i
      )),
      /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-bold text-zinc-600 dark:text-zinc-300 ml-1", children: [
        "(",
        cardRating,
        "/5)"
      ] })
    ] }),
    item.description && /* @__PURE__ */ jsxs("p", { className: "text-zinc-600 dark:text-zinc-400 text-[12px] italic leading-relaxed", children: [
      '"',
      item.description,
      '"'
    ] }),
    allMedia.length > 0 && /* @__PURE__ */ jsx("div", { className: "relative h-32 w-full overflow-hidden rounded-xl", children: renderMediaGrid() }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
      /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] shrink-0", children: item.author?.charAt(0)?.toUpperCase() ?? "G" }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold dark:text-zinc-300 uppercase tracking-tight truncate", children: item.author })
    ] })
  ] });
};
function AutoTestimonials({ propertyId }) {
  console.log("propertyId", propertyId);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [testimonialHeader, setTestimonialHeader] = useState({
    testimonialName1: "",
    testimonialName2: "",
    description: ""
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rating: 5,
    text: "",
    ytLink: ""
  });
  const [ytError, setYtError] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const fetchTestimonialHeader = async () => {
    try {
      const res = await getActiveTestimonialHeaders();
      const all = res?.data || [];
      const matched = all.filter((h) => h.propertyId === propertyId && h.isActive).sort((a, b) => b.id - a.id);
      const latest = matched[0];
      if (latest) {
        setTestimonialHeader({
          testimonialName1: latest.testimonialName1 || latest.header1 || "",
          testimonialName2: latest.testimonialName2 || latest.header2 || "",
          description: latest.description || ""
        });
      }
    } catch (err) {
      console.error("Failed to load testimonial header:", err);
    }
  };
  const buildTitle = (rating, text) => {
    const filled = "⭐".repeat(rating);
    const empty = "☆".repeat(5 - rating);
    const stars = `${filled}${empty} (${rating}/5)`;
    const snippet = (text || "").trim().slice(0, 20);
    return snippet ? `${stars} ${snippet}` : stars;
  };
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await getGuestExperienceSection({ size: 100 });
      const rawData = res?.data?.data ?? res?.data ?? res ?? [];
      const list = Array.isArray(rawData) ? rawData : rawData.content ?? [];
      const filtered = list.filter(
        (item) => propertyId != null ? item.propertyId === propertyId : item.propertyId == null
      ).sort((a, b) => {
        if (a.createdAt && b.createdAt)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
  }, [propertyId]);
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map((file) => ({
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        file
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
  const handleFinalSubmit = async () => {
    if (!propertyId) {
      showError("Property ID is missing. Cannot submit testimonial.");
      return;
    }
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
      if (formData.ytLink.trim()) fd.append("videoUrl", formData.ytLink.trim());
      mediaPreviews.forEach((m) => fd.append("files", m.file));
      fd.append(
        "mediaType",
        mediaPreviews.some((m) => m.type === "video") ? "VIDEO" : "IMAGE"
      );
      await createGuestExperienceByGuest(fd);
      toast.success("Thank you! Your story has been submitted for review.");
      setStep(1);
      setFormData({
        name: "",
        email: "",
        phone: "",
        rating: 5,
        text: "",
        ytLink: ""
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
  const ytThumb = formData.ytLink.trim() && isYoutubeUrl(formData.ytLink) ? getYoutubeThumbnail(formData.ytLink) : null;
  experiences.filter((_, i) => i % 2 === 0);
  experiences.filter((_, i) => i % 2 === 1);
  const FALLBACK2 = [
    {
      id: "f1",
      author: "Arjun Mehta",
      description: "The Signature Butter Chicken is easily the best in town. Incredible atmosphere!",
      rating: 5,
      mediaList: [],
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400"
    },
    {
      id: "f2",
      author: "Sarah Khan",
      description: "A perfect spot for family gatherings. The staff is exceptionally polite.",
      rating: 5,
      mediaList: [],
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=400"
    },
    {
      id: "f3",
      author: "Priya Das",
      description: "Love the Dim Sum platter. Flavors are authentic and presentation top-notch.",
      rating: 4,
      mediaList: [],
      imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400"
    },
    {
      id: "f4",
      author: "Rohan V.",
      description: "The live music on weekends pairs perfectly with their Tandoori Jhinga.",
      rating: 5,
      mediaList: [],
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400"
    },
    {
      id: "f5",
      author: "Elena G.",
      description: "Sophisticated settings and very clean. Highly recommend for corporate dinners.",
      rating: 5,
      mediaList: [],
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400"
    }
  ];
  const displayData = experiences.length > 0 ? experiences : FALLBACK2;
  const displayCol1 = displayData.filter((_, i) => i % 2 === 0);
  const displayCol2 = displayData.filter((_, i) => i % 2 === 1);
  const extractRatingFromTitle = (title = "") => {
    const match = title?.match(/\((\d+)\/5\)/);
    return match ? Number(match[1]) : null;
  };
  const validRatings = experiences.map((e) => extractRatingFromTitle(e.title)).filter((r) => r !== null);
  const avgRating = validRatings.length > 0 ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1) : null;
  const totalGuests = experiences.length;
  const STEP_LABELS = { 1: "Your Story", 2: "Your Details" };
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: containerRef,
      className: "relative py-24 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[750px] flex items-center",
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            style: { x: bgTextX },
            className: "absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[12rem] lg:text-[18rem] font-black text-zinc-900/[0.03] dark:text-white/[0.01] pointer-events-none select-none italic uppercase z-0",
            children: "Guest Stories Feedback"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-12 gap-12 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary animate-pulse" }),
                /* @__PURE__ */ jsx("span", { className: "text-primary text-[10px] font-black uppercase tracking-[0.4em]", children: "Testimonials" })
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-6xl font-serif text-zinc-900 dark:text-white leading-[1.1]", children: [
                testimonialHeader.testimonialName1 || "",
                " ",
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsx("span", { className: "italic text-zinc-400 dark:text-white/30 decoration-primary/20 underline decoration-1 underline-offset-8", children: testimonialHeader.testimonialName2 || " " })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-white/40 text-lg font-light leading-relaxed max-w-sm pt-4", children: testimonialHeader.description || " " }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: () => setShowReviewModal(true),
                  className: "rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group",
                  children: [
                    "Share Your Story",
                    " ",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-8 border-t border-zinc-100 dark:border-white/10 flex items-center gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("p", { className: "text-4xl font-serif dark:text-white leading-none", children: avgRating ?? "—" }),
                /* @__PURE__ */ jsx("div", { className: "flex gap-0.5 mt-2 justify-center", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(
                  Star,
                  {
                    className: `w-3 h-3 ${i < Math.round(Number(avgRating)) ? "fill-primary text-primary" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"}`
                  },
                  i
                )) })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight", children: [
                "Trusted by ",
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsxs("span", { className: "text-zinc-700 dark:text-zinc-300 font-light text-sm", children: [
                  totalGuests.toLocaleString(),
                  "+"
                ] }),
                " ",
                "Guests"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-7 h-[650px] relative rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] backdrop-blur-2xl", children: loading ? /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin text-primary", size: 28 }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 h-full p-6 overflow-hidden relative group", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6 animate-marquee-up marquee-col", children: [...displayCol1, ...displayCol1].map((item, i) => /* @__PURE__ */ jsx(FeedbackCard, { item }, `up-${item.id}-${i}`)) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6 animate-marquee-down marquee-col", children: [...displayCol2, ...displayCol2].map((item, i) => /* @__PURE__ */ jsx(FeedbackCard, { item }, `dn-${item.id}-${i}`)) }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-50/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none" })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: showReviewModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            className: "bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: /* @__PURE__ */ jsx(Edit2, { size: 18 }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl dark:text-white", children: "Submit Your Story" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                      [1, 2].map((s) => /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: `h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-6 bg-primary" : s < step ? "w-3 bg-primary/40" : "w-3 bg-zinc-200 dark:bg-zinc-700"}`
                        },
                        s
                      )),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase font-bold text-zinc-400 tracking-widest ml-1", children: STEP_LABELS[step] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      setShowReviewModal(false);
                      setStep(1);
                    },
                    className: "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400",
                    children: /* @__PURE__ */ jsx(X, { size: 20 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-8 max-h-[72vh] overflow-y-auto custom-scrollbar", children: [
                step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-zinc-400", children: "Rate your experience (optional)" }),
                    /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setFormData({ ...formData, rating: star }),
                        children: /* @__PURE__ */ jsx(
                          Star,
                          {
                            size: 28,
                            className: `${formData.rating >= star ? "fill-primary text-primary" : "text-zinc-300 dark:text-zinc-600"} transition-all`
                          }
                        )
                      },
                      star
                    )) }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-zinc-400 font-mono text-center break-all", children: buildTitle(formData.rating, formData.text) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxs(Label, { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: [
                      "Your Feedback",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-zinc-300 normal-case font-normal", children: "(optional)" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        value: formData.text,
                        onChange: (e) => setFormData({ ...formData, text: e.target.value }),
                        className: "w-full h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-sm dark:text-white border-none focus:ring-1 focus:ring-primary outline-none resize-none",
                        placeholder: "Tell us about the flavors, service, and atmosphere..."
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs(Label, { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: [
                        "Photos / Videos",
                        " ",
                        /* @__PURE__ */ jsx("span", { className: "text-zinc-300 normal-case font-normal", children: "(optional)" })
                      ] }),
                      mediaPreviews.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-zinc-400", children: [
                        mediaPreviews.length,
                        " file(s)"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
                      mediaPreviews.map((m, i) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "relative aspect-square rounded-xl overflow-hidden group shadow-md",
                          children: [
                            m.type === "image" ? /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: m.url,
                                className: "w-full h-full object-cover",
                                alt: ""
                              }
                            ) : /* @__PURE__ */ jsxs("div", { className: "w-full h-full bg-black flex flex-col items-center justify-center text-white gap-1", children: [
                              /* @__PURE__ */ jsx(Video, { size: 16 }),
                              /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase", children: "Video" })
                            ] }),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: () => setMediaPreviews(
                                  (p) => p.filter((_, idx) => idx !== i)
                                ),
                                className: "absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                                children: /* @__PURE__ */ jsx(X, { size: 10 })
                              }
                            )
                          ]
                        },
                        i
                      )),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: () => fileInputRef.current?.click(),
                          className: "aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all gap-1",
                          children: [
                            /* @__PURE__ */ jsx(Upload, { size: 18 }),
                            /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase", children: "Upload" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        ref: fileInputRef,
                        multiple: true,
                        accept: "image/*,video/*",
                        className: "hidden",
                        onChange: handleFileUpload
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxs(Label, { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: [
                      "YouTube Link",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-zinc-300 normal-case font-normal", children: "(optional)" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-transparent focus-within:border-primary/40 transition-all", children: [
                      /* @__PURE__ */ jsx(
                        Youtube,
                        {
                          size: 14,
                          className: `shrink-0 ${formData.ytLink && isYoutubeUrl(formData.ytLink) ? "text-red-500" : "text-zinc-400"}`
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "url",
                          value: formData.ytLink,
                          onChange: (e) => handleYtChange(e.target.value),
                          placeholder: "https://youtube.com/...",
                          className: "flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-400 dark:text-white"
                        }
                      ),
                      formData.ytLink && /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => {
                            setFormData({ ...formData, ytLink: "" });
                            setYtError("");
                          },
                          children: /* @__PURE__ */ jsx(
                            X,
                            {
                              size: 12,
                              className: "text-zinc-400 hover:text-zinc-700"
                            }
                          )
                        }
                      )
                    ] }),
                    ytError && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-[10px] ml-1 font-medium", children: ytError }),
                    ytThumb && /* @__PURE__ */ jsxs("div", { className: "mt-1 rounded-lg overflow-hidden border relative", children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: ytThumb,
                          alt: "YouTube preview",
                          className: "w-full h-16 object-cover"
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/30", children: /* @__PURE__ */ jsx(Youtube, { size: 20, className: "text-white" }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      onClick: () => setStep(2),
                      className: "w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-primary transition-all",
                      children: [
                        "Next: Your Details",
                        " ",
                        /* @__PURE__ */ jsx(ChevronRight, { size: 14, className: "ml-2" })
                      ]
                    }
                  )
                ] }),
                step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 dark:text-zinc-500", children: "Your contact details won't be publicly displayed." }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Full Name" }),
                    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx(User, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          value: formData.name,
                          onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                          placeholder: "How should we address you?",
                          className: "pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-primary"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Email" }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "email",
                          value: formData.email,
                          onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                          placeholder: "email@example.com",
                          className: "h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-primary"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Phone" }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "tel",
                          value: formData.phone,
                          onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                          placeholder: "10-digit number",
                          maxLength: 10,
                          className: "h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-primary"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 space-y-2", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-zinc-400 tracking-widest", children: "Summary" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-mono text-zinc-600 dark:text-zinc-300 break-all", children: buildTitle(formData.rating, formData.text) }),
                    /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-zinc-500 line-clamp-2 italic", children: [
                      '"',
                      formData.text,
                      '"'
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] text-zinc-400", children: [
                      /* @__PURE__ */ jsxs("span", { children: [
                        mediaPreviews.length,
                        " file(s)"
                      ] }),
                      formData.ytLink && /* @__PURE__ */ jsx("span", { children: "· YouTube attached" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "outline",
                        onClick: () => setStep(1),
                        className: "h-14 rounded-xl px-8 dark:text-white",
                        children: "Back"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        disabled: isSubmitting,
                        onClick: handleFinalSubmit,
                        className: "flex-1 h-14 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20",
                        children: isSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 18 }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                          "Submit Experience",
                          " ",
                          /* @__PURE__ */ jsx(Send, { size: 14, className: "ml-2" })
                        ] })
                      }
                    )
                  ] })
                ] })
              ] })
            ]
          }
        ) }) }),
        /* @__PURE__ */ jsx("style", { children: `
        @keyframes marquee-up   { 0% { transform: translateY(0);       } 100% { transform: translateY(-50%); } }
        @keyframes marquee-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0);       } }
        .animate-marquee-up   { animation: marquee-up   40s linear infinite; }
        .animate-marquee-down { animation: marquee-down 40s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar       { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef444433; border-radius: 10px; }
      ` })
      ]
    }
  );
}
const Edit2 = ({ size }) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: /* @__PURE__ */ jsx("path", { d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" })
  }
);
const ArrowRight = ({ className, size = 18 }) => /* @__PURE__ */ jsxs(
  "svg",
  {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
      /* @__PURE__ */ jsx("polyline", { points: "12 5 19 12 12 19" })
    ]
  }
);
const ChevronRight = ({ size }) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: /* @__PURE__ */ jsx("polyline", { points: "9 18 15 12 9 6" })
  }
);
const COLOR_PALETTE = [
  { color: "bg-[#F5E6FF] text-[#8E44AD]", border: "border-[#D7BDE2]" },
  { color: "bg-[#E3F2FD] text-[#1976D2]", border: "border-[#BBDEFB]" },
  { color: "bg-[#FFF3E0] text-[#E67E22]", border: "border-[#FFE0B2]" },
  { color: "bg-[#E8F5E9] text-[#2E7D32]", border: "border-[#C8E6C9]" }
];
const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  persons: "",
  customQuery: ""
};
const isVideoUrl = (url = "") => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
const getBookingIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("birthday") || t.includes("party"))
    return /* @__PURE__ */ jsx(PartyPopper, { size: 18 });
  if (t.includes("corporate") || t.includes("meeting") || t.includes("office"))
    return /* @__PURE__ */ jsx(Briefcase, { size: 18 });
  if (t.includes("wedding") || t.includes("reception"))
    return /* @__PURE__ */ jsx(Sparkles, { size: 18 });
  return /* @__PURE__ */ jsx(Calendar, { size: 18 });
};
const normalizeEvent = (apiEvent) => {
  const rawImage = apiEvent.image ?? {};
  const resolvedType = rawImage.type === "VIDEO" || isVideoUrl(rawImage.url) ? "VIDEO" : "IMAGE";
  return { ...apiEvent, image: { ...rawImage, type: resolvedType } };
};
function ResturantpageEvents({ propertyId }) {
  const [events, setEvents] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [eventsHeader, setEventsHeader] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const [showModal, setShowModal] = useState(false);
  const [bookingType, setBookingType] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(
    null
  );
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const nextEvent = () => {
    setCurrentIndex((prev) => {
      const nextIdx = prev + 2;
      return nextIdx >= events.length ? 0 : nextIdx;
    });
  };
  const prevEvent = () => {
    setCurrentIndex((prev) => {
      const prevIdx = prev - 2;
      if (prevIdx < 0) {
        return Math.max(0, events.length - (events.length % 2 || 2));
      }
      return prevIdx;
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, bookingRes, headerRes] = await Promise.all([
          getEventsUpdated(),
          getGroupBookings(),
          getEventsHeaderByProperty(propertyId)
        ]);
        const allEvents = Array.isArray(eventRes) ? eventRes : eventRes?.data ?? [];
        const now = /* @__PURE__ */ new Date();
        setEvents(
          allEvents.filter((ev) => {
            const eventDate = new Date(ev.eventDate);
            return ev.active && ev.status === "ACTIVE" && eventDate >= now && // ✅ remove expired events
            (propertyId ? ev.propertyId === propertyId : true);
          }).map(normalizeEvent)
        );
        const allBookings = Array.isArray(bookingRes) ? bookingRes : bookingRes?.data ?? [];
        setGroupBookings(
          allBookings.filter((b) => propertyId ? b.propertyId === propertyId : true).sort((a, b) => b.id - a.id)
        );
        const headerData = headerRes?.data;
        const header = Array.isArray(headerData) ? headerData[0] : headerData;
        if (header?.isActive) setEventsHeader(header);
      } catch {
        toast.error("Error loading events data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);
  useEffect(() => {
    if (events.length <= 2 || isPaused) return;
    const timer = setInterval(() => {
      nextEvent();
    }, 5e3);
    return () => clearInterval(timer);
  }, [events, isPaused]);
  const openInquiry = (type, id) => {
    setBookingType(type);
    setSelectedBookingId(id ?? null);
    setStep(1);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const queriesText = [
        `Booking Type: ${bookingType}`,
        formData.persons ? `No. of Persons: ${formData.persons}` : null,
        formData.customQuery ? `Additional Info: ${formData.customQuery}` : null
      ].filter(Boolean).join(" | ");
      await createGroupBookingEnquiry({
        name: formData.name,
        phoneNumber: formData.phone,
        emailAddress: formData.email,
        queries: queriesText,
        enquiryDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        propertyId: Number(propertyId),
        ...selectedBookingId ? { groupBookingId: selectedBookingId } : {}
      });
      setStep(3);
    } catch {
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const totalPages = Math.ceil(groupBookings.length / itemsPerPage);
  const paginatedBookings = groupBookings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  if (loading)
    return /* @__PURE__ */ jsx("div", { className: "h-96 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin text-primary", size: 32 }) });
  const displayedEvents = events.slice(currentIndex, currentIndex + 2);
  return /* @__PURE__ */ jsxs("section", { id: "events", className: "py-12 bg-muted/30 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 lg:px-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-end justify-between mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-serif dark:text-white mb-2", children: [
            eventsHeader?.header1 || "Events",
            " ",
            /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: eventsHeader?.header2 ? ` ${eventsHeader.header2}` : " Celebrations" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-light tracking-wide", children: eventsHeader?.description || "Explore international delicacies curated for every event." })
        ] }),
        events.length > 2 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-white/50 dark:bg-white/5 p-1.5 rounded-full border border-border/40 backdrop-blur-sm shadow-sm", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: prevEvent,
              className: "p-2 rounded-full transition-all hover:bg-primary hover:text-white active:scale-90 text-zinc-600 dark:text-zinc-400",
              children: /* @__PURE__ */ jsx(ChevronLeft, { size: 22, strokeWidth: 2.5 })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "w-[1px] h-4 bg-border/50" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: nextEvent,
              className: "p-2 rounded-full transition-all hover:bg-primary hover:text-white active:scale-90 text-zinc-600 dark:text-zinc-400",
              children: /* @__PURE__ */ jsx(ChevronRight$1, { size: 22, strokeWidth: 2.5 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-8", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-6",
            onMouseEnter: () => setIsPaused(true),
            onMouseLeave: () => setIsPaused(false),
            children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: displayedEvents.map((event) => /* @__PURE__ */ jsx(EventCard, { event }, event.id)) })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "lg:w-[40%]", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: 20 },
            whileInView: { opacity: 1, x: 0 },
            className: "h-full bg-background border border-border/50 rounded-3xl p-8 shadow-sm flex flex-col",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-2 bg-primary/10 rounded-xl text-primary", children: /* @__PURE__ */ jsx(Users, { size: 22 }) }),
                  /* @__PURE__ */ jsx("h3", { className: "text-2xl font-serif font-bold text-foreground", children: "Group Booking" })
                ] }),
                totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      disabled: currentPage === 0,
                      onClick: () => setCurrentPage((p) => p - 1),
                      className: "p-1 rounded-md hover:bg-muted disabled:opacity-30",
                      children: /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      disabled: currentPage >= totalPages - 1,
                      onClick: () => setCurrentPage((p) => p + 1),
                      className: "p-1 rounded-md hover:bg-muted disabled:opacity-30",
                      children: /* @__PURE__ */ jsx(ChevronRight$1, { size: 18 })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-4 flex-grow", children: paginatedBookings.map((item, index) => {
                const style = COLOR_PALETTE[index % COLOR_PALETTE.length];
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => openInquiry(item.title, item.id),
                    className: `w-full flex items-center gap-4 p-5 rounded-2xl border ${style.border} ${style.color} transition-transform hover:scale-[1.02] text-left group`,
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl overflow-hidden bg-white/40 shrink-0", children: item.media?.[0]?.url ? /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: item.media[0].url,
                          alt: item.title,
                          className: "w-full h-full object-cover"
                        }
                      ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: getBookingIcon(item.title) }) }),
                      /* @__PURE__ */ jsx("span", { className: "font-bold text-sm md:text-base tracking-tight", children: item.title }),
                      /* @__PURE__ */ jsx(
                        ArrowRight$1,
                        {
                          size: 16,
                          className: "ml-auto opacity-40 group-hover:opacity-100 transition-opacity"
                        }
                      )
                    ]
                  },
                  item.id
                );
              }) }),
              /* @__PURE__ */ jsx("div", { className: "mt-8 pt-8 border-t border-dashed border-border text-center", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openInquiry("General Celebration"),
                  className: "w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all",
                  children: "Inquire Now"
                }
              ) })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        className: "bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: /* @__PURE__ */ jsx(Users, { size: 18 }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl dark:text-white", children: step === 3 ? "Inquiry Submitted" : `Inquiry: ${bookingType}` }),
                step !== 3 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase font-bold text-zinc-400 tracking-widest", children: [
                  "Step ",
                  step,
                  " of 2"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowModal(false),
                className: "p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors",
                children: /* @__PURE__ */ jsx(X, { size: 20 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-8", children: step === 3 ? /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              className: "flex flex-col items-center text-center py-4 space-y-5",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(Send, { size: 28, className: "text-green-500" }) }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxs("h3", { className: "font-serif text-2xl text-zinc-800 dark:text-white", children: [
                    "Thank You, ",
                    formData.name || "there",
                    "!"
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed", children: [
                    "Your inquiry for",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-primary", children: bookingType }),
                    " ",
                    "has been received."
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: () => setShowModal(false),
                    className: "w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px]",
                    children: "Close"
                  }
                )
              ]
            }
          ) : step === 1 ? /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Full Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: formData.name,
                  onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                  placeholder: "Your Name",
                  className: "h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Phone Number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: formData.phone,
                  onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                  placeholder: "+91",
                  className: "h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "No. of Persons" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  min: 1,
                  value: formData.persons,
                  onChange: (e) => setFormData({ ...formData, persons: e.target.value }),
                  placeholder: "e.g. 10",
                  className: "h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                disabled: !formData.name || !formData.phone,
                onClick: () => setStep(2),
                className: "w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px]",
                children: [
                  "Next Step ",
                  /* @__PURE__ */ jsx(ChevronRight$1, { size: 14, className: "ml-2" })
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Email Address" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: formData.email,
                  onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                  placeholder: "email@example.com",
                  className: "h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Additional Notes" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: formData.customQuery,
                  onChange: (e) => setFormData({
                    ...formData,
                    customQuery: e.target.value
                  }),
                  placeholder: "Special requirements...",
                  rows: 3,
                  className: "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl text-sm outline-none resize-none"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setStep(1),
                  className: "h-14 rounded-xl px-8",
                  children: "Back"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  disabled: isSubmitting || !formData.email,
                  onClick: handleFinalSubmit,
                  className: "flex-1 h-14 bg-primary text-white rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-primary/20",
                  children: isSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 18 }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    "Submit Inquiry ",
                    /* @__PURE__ */ jsx(Send, { size: 14, className: "ml-2" })
                  ] })
                }
              )
            ] })
          ] }) })
        ]
      }
    ) }) })
  ] });
}
function EventCard({ event }) {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const isVideo = event.image?.type === "VIDEO" || Boolean(event.image?.url?.match(/\.(mp4|webm|ogg|mov)$/i));
  const analyzeMediaSize = (w, h) => {
    if (!w || !h) return;
    setIsBanner(w / h <= 0.85);
  };
  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };
  const dateObj = new Date(event.eventDate);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      onClick: () => navigate(buildEventDetailPath(event)),
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.5 },
      className: "group h-[520px] bg-card border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative overflow-hidden transition-all duration-500 ${isBanner ? "h-full" : "h-[280px]"}`,
            children: [
              event.image?.url ? isVideo ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "video",
                  {
                    ref: videoRef,
                    src: event.image.url,
                    autoPlay: true,
                    muted: true,
                    loop: true,
                    playsInline: true,
                    className: "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110",
                    onLoadedMetadata: (e) => analyzeMediaSize(
                      e.currentTarget.videoWidth,
                      e.currentTarget.videoHeight
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: toggleMute,
                    className: "absolute bottom-4 right-4 z-30 bg-black/60 text-white rounded-full p-2 backdrop-blur-sm",
                    children: isMuted ? "🔇" : "🔊"
                  }
                )
              ] }) : /* @__PURE__ */ jsx(
                "img",
                {
                  src: event.image.url,
                  alt: event.title,
                  className: "w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110",
                  onLoad: (e) => analyzeMediaSize(
                    e.currentTarget.naturalWidth,
                    e.currentTarget.naturalHeight
                  )
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted" }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-5 left-5 z-30 flex flex-col items-center bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-white/10", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl font-black leading-none", children: day }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-tighter opacity-80", children: month })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-5 right-5 z-30 bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(MapPin, { size: 10 }),
                " ",
                event.locationName
              ] }),
              isBanner && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-white font-serif font-bold text-2xl", children: event.title }),
                /* @__PURE__ */ jsx("p", { className: "text-white/70 text-xs italic line-clamp-2 mt-1", children: event.description }),
                event.ctaText && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      if (event.ctaLink) {
                        window.open(event.ctaLink, "_blank");
                      } else {
                        navigate(buildEventDetailPath(event));
                      }
                    },
                    className: "mt-4 py-3 rounded-xl text-[10px] font-bold uppercase bg-primary text-white",
                    children: event.ctaText
                  }
                )
              ] })
            ]
          }
        ),
        !isBanner && /* @__PURE__ */ jsxs("div", { className: "p-6 flex flex-col flex-1 bg-card text-left", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold group-hover:text-primary transition-colors", children: event.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-3 mt-2", children: event.description }),
          event.ctaText && /* @__PURE__ */ jsx("div", { className: "mt-auto pt-4 border-t border-dashed border-border", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => window.open(event.ctaLink, "_blank"),
              className: "w-full py-3 rounded-xl text-[10px] font-bold uppercase bg-primary text-white",
              children: event.ctaText
            }
          ) })
        ] })
      ]
    }
  );
}
export {
  AutoTestimonials as A,
  ResturantpageEvents as R,
  ReservationForm as a
};
