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
import cafeImg from "@/assets/cafe_images/image.png";
import cafeImg1 from "@/assets/cafe_images/image1.png";
import cafeImg2 from "@/assets/cafe_images/image2.png";

const STORY_CARDS = [
  {
    id: 1,
    eyebrow: "Morning Ritual",
    title: "Single Origin Espresso",
    description:
      "Dark cacao depth and dense crema create a sharper wake-up profile for early cafe regulars.",
    benefit: "High aroma & bold body",
    accent: "Fast starts",
    image: cafeImg,
    icon: Coffee,
    stats: ["18g dose", "25s pull"],
  },
  {
    id: 2,
    eyebrow: "Slow Brewing",
    title: "Pour Over Ritual",
    description:
      "Hand brewing opens cleaner acidity and floral lift designed for longer sipping.",
    benefit: "Nuanced tasting notes",
    accent: "Calm moments",
    image: cafeImg1,
    icon: Leaf,
    stats: ["92C water", "3m bloom"],
  },
  {
    id: 3,
    eyebrow: "Noon Reset",
    title: "Flat White Balance",
    description:
      "A tighter milk texture keeps espresso structure intact, making the cup creamy without losing roast identity.",
    benefit: "Silky mouthfeel",
    accent: "Mid-day focus",
    image: cafeImg2,
    icon: SunMedium,
    stats: ["Double shot", "Velvet foam"],
  },
  {
    id: 4,
    eyebrow: "Cold Extraction",
    title: "Cold Brew Reserve",
    description:
      "Overnight steeping lowers bitterness and builds a smoother, chocolate-toned drink.",
    benefit: "Lower acidity",
    accent: "Long conversations",
    image: cafeImg,
    icon: Waves,
    stats: ["14hr steep", "Clean chill"],
  },
  {
    id: 5,
    eyebrow: "Comfort Pairing",
    title: "Bakery And Brew",
    description:
      "Buttery bakes and roasted coffee are paired to stretch aroma across the entire experience.",
    benefit: "Fuller flavor contrast",
    accent: "Relaxed brunches",
    image: cafeImg1,
    icon: Sparkles,
    stats: ["Warm pastry", "Soft sweet"],
  },
  {
    id: 6,
    eyebrow: "Evening Mood",
    title: "Mocha Afterglow",
    description:
      "Cocoa bitterness and espresso warmth turn the last coffee of the day into a slower indulgence.",
    benefit: "Dessert-like depth",
    accent: "Late hours",
    image: cafeImg2,
    icon: MoonStar,
    stats: ["Cocoa layer", "Night sip"],
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
      <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-black/10 to-transparent" />
      <div className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
        <Icon className="h-3 w-3" /> {card.eyebrow}
      </div>

      <motion.div
        animate={{ width: isHovered ? "456px" : "320px" }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="absolute inset-y-0 right-0 z-20 flex h-full flex-col border-l border-white/10 bg-[#F8F8F6]/96 backdrop-blur-md dark:border-white/5 dark:bg-zinc-950/92"
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
                Profile
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
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="w-full overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-xl dark:border-white/5 dark:bg-zinc-900"
    >
      <div className="aspect-square w-full overflow-hidden relative">
        <img
          src={card.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75"
        />
        <img
          src={card.image}
          className="relative h-full w-full object-contain"
          alt={card.title}
        />
      </div>
      <div className="space-y-4 p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
          {card.accent}
        </p>
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
              className="rounded-full border border-zinc-200 px-3 py-1 text-[9px] font-bold text-zinc-400"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function CafeCoffeeStory() {
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
    <section className="relative overflow-hidden bg-[#F7F7F5] py-24 dark:bg-[#080808]">
      <div className="hidden w-full lg:block">
        <div className="grid w-full min-h-[58vh] items-stretch grid-cols-[0.7fr_1.3fr] gap-16 px-12 xl:px-24">
          <div className="flex h-full flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">
              <Coffee className="h-3.5 w-3.5" /> Discovery
            </div>
            <h2 className="mb-8 text-6xl font-serif leading-[1.1] text-zinc-950 dark:text-white">
              The Art of <br />
              <span className="italic text-amber-800">Slow Brewing</span>
            </h2>
            <p className="mb-10 max-w-sm text-base leading-relaxed text-zinc-600 dark:text-white/60">
              Each chapter unfolds a new texture. Browse the vertical story list
              and explore the finer details without scroll-based transitions.
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
                    className={`h-px w-8 transition-all ${
                      activeIndex === index ? "bg-amber-800" : "bg-zinc-300"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                      activeIndex === index
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-white/70"
                    }`}
                  >
                    {card.title}
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
        </div>
      </div>

      <div className="w-full px-6 lg:hidden">
        <div className="mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
            <Coffee className="h-3 w-3" /> The Journey
          </div>
          <h2 className="mb-6 text-5xl font-serif text-zinc-950 dark:text-white">
            Every <span className="italic text-amber-800">Roast</span>
          </h2>
          <p className="text-sm text-zinc-500">
            Explore our coffee rituals in a simple vertical slider.
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
                className={`h-2 rounded-full transition-all ${
                  activeIndex === index
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
