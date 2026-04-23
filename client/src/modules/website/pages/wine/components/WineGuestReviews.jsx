import { useRef, useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { AnimatePresence, motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

const sectionHeader = {
  sectionTag: "Guest Impressions",
  title: "Dining Moments Worth Returning For",
};

const ratingHeader = {
  description: "Average guest dining rating",
  rating: 5,
};

const INITIAL_REVIEWS = [
  {
    id: 1,
    author: "Ritika Sharma",
    description:
      "The tasting menu felt polished from start to finish. Every course arrived with perfect pacing and the dessert service was especially memorable.",
  },
  {
    id: 2,
    author: "Arjun Mehta",
    description:
      "We booked a family dinner here and the team handled the table setup, recommendations, and service flow exceptionally well.",
  },
  {
    id: 3,
    author: "Sneha Kapoor",
    description:
      "The live kitchen counters and beverage pairings made brunch feel premium without becoming overly formal. Strong repeat-visit energy.",
  },
  {
    id: 4,
    author: "Kabir Sethi",
    description:
      "Private dining for our celebration was executed cleanly. The ambience, plating, and staff attentiveness stood out throughout the evening.",
  },
];

const CARD_COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#1b1b2f",
  "#2d132c", "#1a1a1a", "#162447", "#0d1117",
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── REVIEW CARD ──────────────────────────────────────────────────────────────
function ReviewCard({ item, colorIndex }) {
  const bg = CARD_COLORS[colorIndex % CARD_COLORS.length];
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-white/5"
      style={{ background: bg }}
    >
      <div className="h-0.5 w-full bg-primary/50" />
      <div className="flex flex-1 flex-col p-5">
        {/* Stars */}
        <div className="mb-4 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className="fill-primary text-primary" />
          ))}
        </div>
        {/* Quote */}
        <p className="flex-1 text-sm italic leading-relaxed text-white/75">
          "{item.description}"
        </p>
        {/* Author row */}
        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {getInitials(item.author)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{item.author}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/35">
              Verified Guest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function WineGuestReviews() {
  const swiperRef = useRef(null);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 0 && comment.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    setReviews((prev) => [
      {
        id: Date.now(),
        author: name.trim(),
        description: comment.trim(),
      },
      ...prev,
    ]);

    setTimeout(() => swiperRef.current?.slideTo(0), 100);

    setName("");
    setComment("");
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="reviews" className="bg-[#ABBF9B] py-12 dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="flex min-w-0 flex-col items-stretch gap-6 lg:flex-row">

          {/* ── Left: carousel ── */}
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
                        i < ratingHeader.rating
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
              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={15}
                slidesPerView={1.2}
                breakpoints={{ 768: { slidesPerView: 3 } }}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                onSwiper={(s) => { swiperRef.current = s; }}
                onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
                onMouseLeave={() => swiperRef.current?.autoplay?.start()}
                className="h-full w-full"
              >
                {reviews.map((item, idx) => (
                  <SwiperSlide key={item.id}>
                    <ReviewCard item={item} colorIndex={idx} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="flex w-full flex-col lg:w-1/4">
            <div className="flex h-full w-full flex-col rounded-2xl border bg-card p-6 shadow-sm">

              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                Leave a Review
              </p>
              <h4 className="mb-5 text-lg font-serif font-bold italic">
                Share Your Experience
              </h4>

              {/* Name */}
              <label className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ritika Sharma"
                className="mb-4 w-full rounded-xl border border-transparent bg-secondary/20 px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 focus:bg-background"
              />

              {/* Comment */}
              <label className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your dining experience..."
                rows={6}
                className="mb-5 w-full flex-1 resize-none rounded-xl border border-transparent bg-secondary/20 px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 focus:bg-background"
              />

              {/* Submit / success */}
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-4 text-sm font-bold text-green-600"
                  >
                    <Star size={14} className="fill-green-500 text-green-500" />
                    Thank you for your review!
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    disabled={isSubmitting || !canSubmit}
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-35"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mx-auto animate-spin" size={18} />
                    ) : (
                      "Submit Review"
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}