import { useRef, useState } from "react";
import {
  Star,
  X,
  ImageIcon,
  Loader2,
  User,
  Edit2,
  Video,
  Youtube,
} from "lucide-react";
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

const guestReviews = [
  {
    id: 1,
    author: "Ritika Sharma",
    description:
      "The tasting menu felt polished from start to finish. Every course arrived with perfect pacing and the dessert service was especially memorable.",
    imageUrl:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    author: "Arjun Mehta",
    description:
      "We booked a family dinner here and the team handled the table setup, recommendations, and service flow exceptionally well.",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    author: "Sneha Kapoor",
    description:
      "The live kitchen counters and beverage pairings made brunch feel premium without becoming overly formal. Strong repeat-visit energy.",
    imageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    author: "Kabir Sethi",
    description:
      "Private dining for our celebration was executed cleanly. The ambience, plating, and staff attentiveness stood out throughout the evening.",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function CafeGuestReviews() {
  const swiperRef = useRef(null);
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

  const hasContent = feedbackText || mediaPreviews.length > 0 || ytLink.trim();

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

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setFeedbackText("");
    setMediaPreviews([]);
    setYtLink("");
    setIsVerified(false);
    setAuthorName("");
    setEmail("");
    setPhone("");
  };

  return (
    <section id="reviews" className="bg-[#F8F8F6] py-12 dark:bg-background">
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
              <AnimatePresence mode="wait">
                <Swiper
                  modules={[Autoplay, Navigation]}
                  spaceBetween={15}
                  slidesPerView={1.2}
                  breakpoints={{ 768: { slidesPerView: 3 } }}
                  autoplay={{ delay: 6000, disableOnInteraction: false }}
                  onSwiper={(s) => {
                    swiperRef.current = s;
                  }}
                  onMouseEnter={() => {
                    swiperRef.current?.autoplay?.stop();
                  }}
                  onMouseLeave={() => {
                    swiperRef.current?.autoplay?.start();
                  }}
                  className="h-full w-full"
                >
                  {guestReviews.map((item) => (
                    <SwiperSlide key={item.id}>
                      <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-background">
                        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                          <img
                            src={item.imageUrl}
                            alt={item.author}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/25 to-transparent p-4">
                            <p className="line-clamp-4 text-base italic text-white">
                              "{item.description}"
                            </p>
                            <p className="text-sm font-bold text-white">
                              {item.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
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

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your dining experience..."
                className="mb-3 w-full flex-grow resize-none rounded-xl border-none bg-secondary/20 p-4 text-sm outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="mb-3">
                <div className="flex items-center gap-2 rounded-xl border border-transparent bg-secondary/20 px-3 py-2.5 transition-all focus-within:border-primary/40 focus-within:bg-white">
                  <Youtube
                    size={15}
                    className={ytLink ? "text-red-500" : "text-muted-foreground"}
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
                <button onClick={() => setShowPopup(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-lg bg-muted p-3 outline-none"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg bg-muted p-3 outline-none"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  maxLength={10}
                  className="w-full rounded-lg bg-muted p-3 outline-none"
                />
                <button
                  onClick={() => {
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

