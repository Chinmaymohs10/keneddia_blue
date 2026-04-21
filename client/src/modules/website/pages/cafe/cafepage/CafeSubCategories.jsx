import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Leaf,
  MoonStar,
  Sparkles,
  SunMedium,
  Waves,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { siteContent } from "@/data/siteContent";

const STORY_CARDS = [
  {
    id: 1,
    eyebrow: "Our Roots",
    title: "Born From A Love Of Craft Coffee",
    description:
      "Kennedia Cafe started as a single roastery counter in 2018, driven by a belief that good coffee and calm spaces could transform any ordinary day into something worth remembering.",
    benefit: "Where it all began",
    accent: "The Beginning",
    image: siteContent.images.cafes.minimalist.src,
    icon: Coffee,
    stats: ["Est. 2018", "Ghaziabad"],
  },
  {
    id: 2,
    eyebrow: "Sourcing",
    title: "Beans Traced Back To Their Origin",
    description:
      "Every bean we use is sourced directly from small-batch farms across 12 countries. We visit the farms, meet the growers, and select only what aligns with our flavour standards and ethical practices.",
    benefit: "Traceable & Ethical",
    accent: "The Source",
    image: siteContent.images.cafes.library.src,
    icon: Leaf,
    stats: ["12 Origins", "Direct Trade"],
  },
  {
    id: 3,
    eyebrow: "The Roastery",
    title: "Roasted In-House Every Morning",
    description:
      "Our in-house roasting setup allows us to control every variable from roast curve to rest time. The result is a consistently fresh cup with no compromise on flavour.",
    benefit: "Always fresh, never stale",
    accent: "The Process",
    image: siteContent.images.cafes.parisian.src,
    icon: SunMedium,
    stats: ["Daily Roast", "Small Batch"],
  },
  {
    id: 4,
    eyebrow: "The Kitchen",
    title: "Baked Fresh Before You Arrive",
    description:
      "Our bakery team starts at 5 AM every day. By the time the cafe opens, every croissant, sourdough loaf, and pastry is fresh out of the oven because we think that matters.",
    benefit: "No day-old bakes, ever",
    accent: "The Bakery",
    image: siteContent.images.cafes.bakery.src,
    icon: Sparkles,
    stats: ["5 AM Bake", "All-Natural"],
  },
  {
    id: 5,
    eyebrow: "The Spaces",
    title: "Rooms Designed For Staying",
    description:
      "From our quiet library corner to the open garden terrace and the high-tea lounge, every space is designed with a specific kind of visitor in mind. You are not rushed here.",
    benefit: "Built for long stays",
    accent: "The Atmosphere",
    image: siteContent.images.cafes.garden.src,
    icon: Waves,
    stats: ["4 Spaces", "All-Day Open"],
  },
  {
    id: 6,
    eyebrow: "The Community",
    title: "A Cafe That Grows With Its Guests",
    description:
      "We run workshops, cupping sessions, and monthly brunch pop-ups because the best cafes are not just places to drink coffee. They are places where regulars become regulars for a reason.",
    benefit: "Events every month",
    accent: "The People",
    image: siteContent.images.cafes.highTea.src,
    icon: MoonStar,
    stats: ["Monthly Events", "Open to All"],
  },
];

function DesktopStoryCard({ card, onHoverChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = card.icon;

  const handleHover = (value) => {
    setIsHovered(value);
    onHoverChange?.(value);
  };

  return (
    <motion.article
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
    >
      {/* Blurred glass background to fill any letterbox space */}
      <img
        src={card.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75"
      />
      <motion.img
        src={card.image}
        alt={card.title}
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 h-full w-full object-contain object-left"
      />
      <div className="absolute inset-0 bg-linear-to-tr from-black/45 via-black/10 to-transparent" />
      <div className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
        <Icon className="h-3 w-3" /> {card.eyebrow}
      </div>

      {/* Overlay panel — always open at ~30% (320px), expands to 456px on hover */}
      <motion.div
        animate={{ width: isHovered ? "456px" : "320px" }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="absolute inset-y-0 right-0 z-20 flex h-full flex-col border-l border-white/10 bg-[#fffaf4]/96 backdrop-blur-md dark:border-white/5 dark:bg-zinc-950/92"
      >
        <div className="flex h-full w-full flex-col justify-center gap-6 overflow-hidden p-8 xl:p-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800/60">
              {card.accent}
            </p>
            <h3 className="text-3xl font-serif leading-tight text-zinc-950 dark:text-white">
              {card.title}
            </h3>
            <p
              className={`text-sm leading-relaxed text-zinc-600 dark:text-white/50 ${
                isHovered ? "" : "line-clamp-3"
              }`}
            >
              {card.description}
            </p>
          </div>

          <motion.div
            animate={{ opacity: isHovered ? 1 : 0.82, y: isHovered ? 0 : 8 }}
            className="space-y-4"
          >
            <div className="rounded-3xl bg-[#2b1d14] p-5 text-white shadow-lg">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                Highlight
              </p>
              <p className="font-serif text-base italic">{card.benefit}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.stats.map((stat) => (
                <span
                  key={stat}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-[9px] font-bold text-zinc-400"
                >
                  {stat}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function MobileStoryCard({ card }) {
  const Icon = card.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="w-full overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-xl dark:border-white/5 dark:bg-zinc-900"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={card.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75"
        />
        <img
          src={card.image}
          className="relative h-full w-full object-contain object-left"
          alt={card.title}
        />
      </div>
      <div className="space-y-4 p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
          <Icon className="h-3 w-3" /> {card.eyebrow}
        </div>
        <h3 className="text-3xl font-serif text-zinc-950 dark:text-white">
          {card.title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-white/50">
          {card.description}
        </p>
        <div className="rounded-2xl bg-[#2b1d14] p-5 text-white">
          <p className="text-sm italic font-serif">{card.benefit}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {card.stats.map((stat) => (
            <span
              key={stat}
              className="rounded-full border border-zinc-200 px-3 py-1 text-[9px] font-bold text-zinc-400 dark:border-white/10"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function CafeSubCategories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STORY_CARDS.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const activeCard = STORY_CARDS[activeIndex];

  const handlePrev = () =>
    setActiveIndex((prev) =>
      prev === 0 ? STORY_CARDS.length - 1 : prev - 1,
    );

  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % STORY_CARDS.length);

  return (
    <section
      className="relative overflow-hidden py-24 bg-[#f6f6f4] dark:bg-[#0f0f0f]"
    >
      {/* ── Sparkle background animation ─────────────────────────────────── */}
      <style>{`
        @keyframes floatSparkle {
          0%   { transform: translateY(0px) scale(1);   opacity: 0.18; }
          50%  { transform: translateY(-22px) scale(1.3); opacity: 0.55; }
          100% { transform: translateY(0px) scale(1);   opacity: 0.18; }
        }
        .sparkle-dot { animation: floatSparkle var(--dur, 4s) ease-in-out infinite; }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { size: 6, top: "8%", left: "6%", dur: "3.8s", delay: "0s" },
          { size: 10, top: "18%", left: "22%", dur: "5.2s", delay: "0.7s" },
          { size: 5, top: "55%", left: "10%", dur: "4.4s", delay: "1.2s" },
          { size: 8, top: "72%", left: "30%", dur: "6.0s", delay: "0.3s" },
          { size: 7, top: "12%", left: "75%", dur: "4.9s", delay: "1.8s" },
          { size: 11, top: "38%", left: "88%", dur: "5.6s", delay: "0.9s" },
          { size: 5, top: "80%", left: "68%", dur: "3.5s", delay: "2.1s" },
          { size: 9, top: "62%", left: "50%", dur: "4.2s", delay: "0.5s" },
        ].map((s, i) => (
          <div
            key={i}
            className="sparkle-dot absolute rounded-full bg-amber-400"
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              "--dur": s.dur,
              animationDelay: s.delay,
              boxShadow: `0 0 ${s.size * 2}px ${s.size}px rgba(251,191,36,0.35)`,
            }}
          />
        ))}
      </div>
      <div className="hidden w-full lg:block">
        <div className="grid w-full min-h-[58vh] items-stretch grid-cols-[1.3fr_0.7fr] gap-16 px-12 xl:px-24">
          {/* Story card — now on the LEFT */}
          <div className="relative flex items-center justify-center self-center h-[70%]">
            <div className="relative h-full w-full">
              <AnimatePresence mode="wait">
                <DesktopStoryCard
                  key={activeCard.id}
                  card={activeCard}
                  onHoverChange={setIsPaused}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Nav / controls — now on the RIGHT */}
          <div className="flex h-full flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">
              <Coffee className="h-3.5 w-3.5" /> Our Story
            </div>
            <h2 className="mb-8 text-5xl xl:text-6xl font-serif leading-[1.1] text-zinc-950 dark:text-white">
              Six Chapters <br />
              <span className="italic text-amber-800">One Cafe</span>
            </h2>
            <p className="mb-10 max-w-sm text-base leading-relaxed text-zinc-600 dark:text-white/60">
              Discover the story behind every cup and every corner through a
              simple vertical slider instead of the old scroll-driven flow.
            </p>

            <div className="flex flex-col gap-4">
              {STORY_CARDS.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group flex items-center gap-4 text-left"
                >
                  <span
                    className={`h-px w-8 transition-all ${activeIndex === index ? "bg-amber-800" : "bg-zinc-300"
                      }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeIndex === index
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-white/70"
                      }`}
                  >
                    {card.eyebrow}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-amber-800 hover:text-amber-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-amber-800 hover:text-amber-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(STORY_CARDS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 lg:hidden">
        <div className="mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
            <Coffee className="h-3 w-3" /> Our Story
          </div>
          <h2 className="mb-6 text-4xl font-serif text-zinc-950 dark:text-white">
            Six Chapters, <span className="italic text-amber-800">One Cafe</span>
          </h2>
          <p className="text-sm text-zinc-500">
            The story behind every cup and every corner.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <MobileStoryCard key={activeCard.id} card={activeCard} />
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-amber-800 hover:text-amber-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-2">
            {STORY_CARDS.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${activeIndex === index
                  ? "w-8 bg-amber-800"
                  : "w-2 bg-zinc-300 dark:bg-white/20"
                  }`}
                aria-label={`Go to ${card.title}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-amber-800 hover:text-amber-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
