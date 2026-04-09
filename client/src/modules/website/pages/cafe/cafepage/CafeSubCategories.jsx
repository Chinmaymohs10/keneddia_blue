import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown, Coffee, Leaf, MoonStar, Sparkles, SunMedium, Waves } from "lucide-react";
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
      "Our in-house roasting setup allows us to control every variable — from roast curve to rest time. The result is a consistently fresh cup with no compromise on flavour.",
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
      "Our bakery team starts at 5 AM every day. By the time the cafe opens, every croissant, sourdough loaf, and pastry is fresh out of the oven — because we think that matters.",
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
      "From our quiet library corner to the open garden terrace and the high-tea lounge — every space is designed with a specific kind of visitor in mind. You are not rushed here.",
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
      "We run workshops, cupping sessions, and monthly brunch pop-ups because we believe the best cafes are not just places to drink coffee — they are places where regulars become regulars for a reason.",
    benefit: "Events every month",
    accent: "The People",
    image: siteContent.images.cafes.highTea.src,
    icon: MoonStar,
    stats: ["Monthly Events", "Open to All"],
  },
];

function DesktopStoryCard({ card, index, progress, total }) {
  const [isHovered, setIsHovered] = useState(false);
  const unit = 1 / total;
  const start = index * unit;
  const end = (index + 1) * unit;
  const range = [start - unit * 0.6, start, end, end + unit * 0.6];

  const y = useSpring(useTransform(progress, range, [80, 0, 0, -80]), { stiffness: 40, damping: 20 });
  const scale = useSpring(useTransform(progress, range, [0.96, 1, 1, 0.96]), { stiffness: 40, damping: 20 });
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);

  const Icon = card.icon;

  return (
    <motion.article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ y, scale, opacity, zIndex: total - index }}
      className="absolute inset-0 flex h-full w-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="relative flex-grow h-full overflow-hidden">
        <motion.img
          src={card.image}
          alt={card.title}
          animate={{ scale: isHovered ? 1.05 : 1.1 }}
          transition={{ duration: 1 }}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
        <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          <Icon className="h-3 w-3" /> {card.eyebrow}
        </div>
      </div>

      <motion.div
        animate={{ width: isHovered ? "420px" : "80px" }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="relative h-full flex flex-col border-l border-zinc-100 bg-[#fffaf4] dark:bg-zinc-950 dark:border-white/5"
      >
        <div className="h-full w-full overflow-hidden flex flex-col justify-between p-8 xl:p-10">
          <div className="space-y-4 min-w-[300px]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800/60">{card.accent}</p>
            <h3 className="text-3xl font-serif leading-tight text-zinc-950 dark:text-white">{card.title}</h3>
            <motion.p
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="text-sm leading-relaxed text-zinc-600 dark:text-white/50"
            >
              {card.description}
            </motion.p>
          </div>
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="space-y-4 min-w-[300px]"
          >
            <div className="rounded-3xl bg-[#2b1d14] p-5 text-white shadow-lg">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">Highlight</p>
              <p className="font-serif text-base italic">{card.benefit}</p>
            </div>
            <div className="flex gap-2">
              {card.stats.map((s) => (
                <span key={s} className="text-[9px] font-bold border border-zinc-200 px-3 py-1 rounded-full text-zinc-400">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.div
          animate={{ opacity: isHovered ? 0 : 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <p className="rotate-90 text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-300 whitespace-nowrap">
            {card.eyebrow} — STORY
          </p>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

function MobileStoryCard({ card }) {
  const Icon = card.icon;
  return (
    <article className="w-full bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-xl border border-zinc-100 dark:border-white/5 mb-8">
      <div className="aspect-video w-full overflow-hidden">
        <img src={card.image} className="h-full w-full object-cover" alt={card.title} />
      </div>
      <div className="p-6 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
          <Icon className="h-3 w-3" /> {card.eyebrow}
        </div>
        <h3 className="text-2xl font-serif text-zinc-950 dark:text-white">{card.title}</h3>
        <p className="text-sm text-zinc-600 dark:text-white/50 leading-relaxed">{card.description}</p>
        <div className="bg-[#2b1d14] p-4 rounded-2xl text-white">
          <p className="text-sm italic font-serif">{card.benefit}</p>
        </div>
        <div className="flex gap-2 pt-1">
          {card.stats.map((s) => (
            <span key={s} className="text-[10px] font-bold border border-zinc-200 dark:border-white/10 px-3 py-1 rounded-full text-zinc-400">
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

const AUTO_SKIP_DELAY = 2000;
const THRESHOLD = 1 / STORY_CARDS.length;

export default function CafeSubCategories() {
  const sectionRef = useRef(null);
  const timerRef = useRef(null);
  const showRef = useRef(false);
  const continuedRef = useRef(false);
  const [showContinue, setShowContinue] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 25, damping: 15, mass: 1 });

  const triggerAutoSkip = () => {
    timerRef.current = setTimeout(() => {
      if (sectionRef.current) {
        const bottom = sectionRef.current.offsetTop + sectionRef.current.offsetHeight;
        window.scrollTo({ top: bottom, behavior: "smooth" });
      }
    }, AUTO_SKIP_DELAY);
  };

  useMotionValueEvent(smoothProgress, "change", (v) => {
    if (v > THRESHOLD && !showRef.current && !continuedRef.current) {
      showRef.current = true;
      setShowContinue(true);
      triggerAutoSkip();
    }
    if (v < THRESHOLD * 0.3 && (showRef.current || continuedRef.current)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      showRef.current = false;
      continuedRef.current = false;
      setShowContinue(false);
    }
  });

  const handleContinue = () => {
    continuedRef.current = true;
    showRef.current = false;
    setShowContinue(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#fdfaf6] dark:bg-[#080808] h-[600vh] lg:h-[700vh]">
      {/* Desktop */}
      <div className="sticky top-0 hidden h-screen w-full items-center lg:flex overflow-hidden">
        <div className="grid h-full w-full grid-cols-[0.7fr_1.3fr] gap-16 px-12 xl:px-24">
          <div className="flex flex-col justify-center h-full max-h-[65vh]">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">
              <Coffee className="h-3.5 w-3.5" /> Our Story
            </div>
            <h2 className="mb-8 text-5xl xl:text-6xl font-serif leading-[1.1] text-zinc-950 dark:text-white">
              Six Chapters <br />
              <span className="italic text-amber-800">One Cafe</span>
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-white/60 mb-10 max-w-sm">
              Scroll to move through our story — from where we started to what makes us stay.
            </p>
            <div className="flex flex-col gap-5">
              {STORY_CARDS.map((card, i) => {
                const active = useTransform(
                  smoothProgress,
                  [i / 6, (i + 0.5) / 6, (i + 1) / 6],
                  [0.2, 1, 0.2],
                );
                return (
                  <motion.div
                    key={card.id}
                    style={{ opacity: active }}
                    className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white"
                  >
                    <span className="h-px w-8 bg-amber-800" /> {card.eyebrow}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center h-full">
            <div className="relative h-[65vh] w-full">
              {STORY_CARDS.map((card, index) => (
                <DesktopStoryCard
                  key={card.id}
                  card={card}
                  index={index}
                  progress={smoothProgress}
                  total={STORY_CARDS.length}
                />
              ))}

              {/* Transparent overlay on card area */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    key="continue-overlay"
                    onClick={handleContinue}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-[60] flex flex-col items-center justify-center cursor-pointer rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-black/15 rounded-[2.5rem]" />
                    <div className="relative z-10 flex flex-col items-center gap-3 select-none">
                      <p className="font-serif text-3xl xl:text-4xl italic text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
                        Continue Story
                      </p>
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                      >
                        <ChevronDown className="h-7 w-7 text-white/80 drop-shadow-lg" />
                      </motion.div>
                      <div className="w-20 h-px bg-white/30 rounded-full overflow-hidden mt-1">
                        <motion.div
                          key={showContinue ? "bar-on" : "bar-off"}
                          initial={{ scaleX: 1 }}
                          animate={{ scaleX: 0 }}
                          transition={{ duration: AUTO_SKIP_DELAY / 1000, ease: "linear" }}
                          className="h-full bg-white/70 origin-left"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden w-full px-6 py-20">
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
            <Coffee className="h-3 w-3" /> Our Story
          </div>
          <h2 className="text-4xl font-serif text-zinc-950 dark:text-white mb-4">
            Six Chapters, <span className="italic text-amber-800">One Cafe</span>
          </h2>
          <p className="text-zinc-500 text-sm">The story behind every cup and every corner.</p>
        </div>
        <div className="space-y-0">
          {STORY_CARDS.map((card) => (
            <MobileStoryCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Mobile — fixed full-screen overlay */}
      <AnimatePresence>
        {showContinue && (
          <motion.div
            key="mobile-overlay"
            onClick={handleContinue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer bg-black/25"
          >
            <div className="flex flex-col items-center gap-3 select-none">
              <p className="font-serif text-3xl italic text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
                Continue Story
              </p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              >
                <ChevronDown className="h-7 w-7 text-white/80" />
              </motion.div>
              <div className="w-20 h-px bg-white/30 rounded-full overflow-hidden mt-1">
                <motion.div
                  key={showContinue ? "mob-bar-on" : "mob-bar-off"}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: AUTO_SKIP_DELAY / 1000, ease: "linear" }}
                  className="h-full bg-white/70 origin-left"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
