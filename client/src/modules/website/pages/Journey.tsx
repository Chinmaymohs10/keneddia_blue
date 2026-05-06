import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { ArrowUpRight, Plus } from "lucide-react";

// ─── BRAND COLOURS (orange stays constant in both modes) ─────────────────────
const ORANGE = "#FF8C00";
const ORANGE_HOVER = "#E67E00";
const NAVY = "#0A2357";

// ─── DATA ────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    index: "01",
    year: "2012",
    label: "The Idea",
    headline: "A belief before\na building.",
    body: "Arjun Mehta and Priya Iyer stood on the Pondicherry shore and refused to accept that luxury had to mean cold. They sketched the first Kennedia floor plan on a paper napkin. The sketch is still framed in our lobby.",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1600",
    accentColor: "#FF8C00",
  },
  {
    index: "02",
    year: "2015",
    label: "First Stone",
    headline: "48 rooms.\nInfinite stories.",
    body: "Our flagship opened with 48 rooms, one restaurant, and an obsessive commitment to remembering every guest's name. Word spread not through ads but through guests who returned — again and again — to a place that felt unmistakably theirs.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600",
    accentColor: "#0A2357",
  },
  {
    index: "03",
    year: "2018",
    label: "Growing Roots",
    headline: "200 people.\nOne question.",
    body: "The team grew — but the hiring rule never changed: do you believe in the dignity of service? A second property in Bengaluru's Indiranagar opened and sold out within weeks. We stopped counting beds and started counting moments.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1600",
    accentColor: "#1a6b40",
  },
  {
    index: "04",
    year: "2022",
    label: "Legacy",
    headline: "A brand becomes\na movement.",
    body: "Five properties. A Michelin-recognized kitchen. Fifteen industry awards. But the moment that meant the most? A letter from a guest who had her first date, got engaged, and had her daughter's birthday — all at Kennedia Blu.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600",
    accentColor: "#4a2d8a",
  },
];

const TEAM = [
  {
    name: "Arjun Mehta",
    role: "Co-Founder & CEO",
    quote: "Hotels don't make people feel welcome. People do.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
    span: "col-span-12 md:col-span-7",
    aspect: "aspect-[16/9]",
  },
  {
    name: "Priya Iyer",
    role: "Chief Experience Officer",
    quote: "Every space is a sentence. Make it worth reading.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800",
    span: "col-span-12 md:col-span-5",
    aspect: "aspect-square",
  },
  {
    name: "Rohan Das",
    role: "Chief Operations Officer",
    quote: "Excellence isn't an event. It's a habit built daily.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800",
    span: "col-span-12 md:col-span-5",
    aspect: "aspect-square",
  },
  {
    name: "Meera Nair",
    role: "Head of Culinary & F&B",
    quote: "A dish is a memory before it's a meal.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800",
    span: "col-span-12 md:col-span-7",
    aspect: "aspect-[16/9]",
  },
];

const VERTICALS = [
  {
    no: "01",
    name: "Hotels & Resorts",
    stat: "5 Properties · 400+ Rooms",
    desc: "Handcrafted stays that feel personal. Every property is designed around its city's soul — not copied from a brand manual.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
  },
  {
    no: "02",
    name: "Restaurants & Cafés",
    stat: "12 Outlets · 3 Cuisines",
    desc: "From beachside patisseries to rooftop omakase, our F&B arm tells stories through every plate — seasonal, local, obsessive.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
  },
  {
    no: "03",
    name: "Events & MICE",
    stat: "800+ Events / Year",
    desc: "Intimate proposals to 1,200-delegate summits. Our events team treats every occasion as unrepeatable — because it is.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
  },
  {
    no: "04",
    name: "Wellness & Spa",
    stat: "3 Spas · Ayurvedic Roots",
    desc: "Where ancient practice meets modern precision. Guests arrive exhausted and leave, for the first time in months, genuinely present.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200",
  },
];

const CITIES = [
  { city: "Pondicherry", year: "2015", tag: "Flagship", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1600" },
  { city: "Bengaluru", year: "2018", tag: "Urban", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600" },
  { city: "Mumbai", year: "2020", tag: "Skyline", image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1600" },
  { city: "Jaipur", year: "2022", tag: "Heritage", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1600" },
  { city: "Goa", year: "2023", tag: "Coastal", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600" },
  { city: "Dubai", year: "2025", tag: "Global", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600" },
];

const MARQUEE_ITEMS = [
  "+ Team", "5 Hotels", "12 Outlets", "10+ Years",
  "25,000+ Events", "1M+ Guests", "15 Awards", "6 Cities",
];

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
  const x = useMotionValue(0);
  const ITEM_W = 220;
  const total = MARQUEE_ITEMS.length * ITEM_W;

  useAnimationFrame(() => {
    const next = x.get() - 0.65;
    x.set(next <= -total ? 0 : next);
  });

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="overflow-hidden py-4 border-y border-gray-200 bg-white dark:border-white/10 dark:bg-[#111114]">
      <motion.div style={{ x }} className="flex whitespace-nowrap w-max">
        {items.map((item, i) => (
          <span key={i} style={{ width: ITEM_W }} className="inline-flex items-center gap-4 px-8">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-gray-400 dark:text-white/30">
              {item}
            </span>
            <span className="text-base leading-none" style={{ color: ORANGE }}>·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const HERO_CARDS = [
  {
    title: "The Idea",
    subtitle: "2012 · Pondicherry",
    text: "Before the bricks, there was a belief. A sketch on a napkin that would redefine luxury by making it personal.",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1600",
  },
  {
    title: "First Stone",
    subtitle: "48 Rooms. Infinite Stories.",
    text: "We opened our doors with an obsessive commitment to remembering every guest's name. The rest followed.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600",
  },
  {
    title: "Growing Roots",
    subtitle: "Bengaluru & Beyond",
    text: "We stopped counting beds and started curating moments. Every space we build is a sentence worth reading.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1600",
  },
  {
    title: "The Legacy",
    subtitle: "A Brand Becomes a Movement",
    text: "A Michelin-recognized kitchen. Fifteen industry awards. A thousand small moments that became a legacy.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600",
  }
];

// ─── HORIZONTAL STORY HERO ────────────────────────────────────────────────────
// Editorial split-panel: diagonal image clip + clean typographic text columns
function HorizontalStoryHero() {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });

  // 5 panels (1 intro + 4 cards) → travel 80% of total width
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
  const smoothX = useSpring(x, { stiffness: 55, damping: 20 });

  // Orange progress line at bottom
  const barW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Active panel index for the dot indicator
  const [panelIdx, setPanelIdx] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setPanelIdx(Math.min(Math.floor(v * 5), 4));
    });
    return unsub;
  }, [scrollYProgress]);

  return (
    <section ref={targetRef} className="relative h-[500vh]">
      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#faf9f6] dark:bg-black">

        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 z-50"
          style={{ width: barW, background: ORANGE }}
        />

        {/* Panel indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === panelIdx ? 24 : 6, opacity: i === panelIdx ? 1 : 0.3 }}
              transition={{ duration: 0.35 }}
              className="h-[2px] rounded-full bg-white"
            />
          ))}
        </div>

        {/* Horizontal track */}
        <motion.div style={{ x: smoothX }} className="flex w-[500%] h-full">

          {/* ── PANEL 0: Intro ── */}
          <div className="w-[20%] h-full relative shrink-0 flex">
            {/* Left column — pure dark, typographic */}
            <div className="w-1/2 h-full flex flex-col justify-center px-16 lg:px-24 relative z-10 bg-[#faf9f6] dark:bg-black">
              {/* Ghosted "01" watermark */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[22vw] font-serif text-[#0A2357]/[0.03] dark:text-white/[0.03] leading-none select-none pointer-events-none">
                K
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-[10px] uppercase font-semibold tracking-[0.5em] mb-10"
                style={{ color: ORANGE }}
              >
                Est. 2012 · Kennedia Blu
              </motion.p>

              {/* Stacked title */}
              <div className="overflow-hidden mb-3">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="text-[7vw] font-serif text-[#0A2357] dark:text-white leading-none"
                >
                  Our
                </motion.div>
              </div>
              <div className="overflow-hidden mb-8">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                  className="text-[7vw] font-serif italic leading-none"
                  style={{ color: ORANGE }}
                >
                  Journey.
                </motion.div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-px bg-[#0A2357]/15 dark:bg-white/15 mb-8 origin-left"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.9 }}
                className="text-[#0A2357]/45 dark:text-white/45 text-base font-light leading-relaxed max-w-xs"
              >
                A decade of stories. Scroll right to unfold each chapter.
              </motion.p>

              {/* Animated scroll cue */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="flex items-center gap-3 mt-12"
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  className="flex items-center gap-2 text-[#0A2357]/30 dark:text-white/30"
                >
                  <div className="h-px w-8 bg-[#0A2357]/25 dark:bg-white/25" />
                  <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M0 6h14M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>

            {/* Right column — image with diagonal clip */}
            <div className="w-1/2 h-full relative overflow-hidden">
              <div
                className="absolute inset-0 z-0"
                style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600"
                  alt="Kennedia"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f6] dark:from-black via-[#faf9f6]/30 dark:via-black/30 to-transparent" />
              </div>
              {/* Year tag */}
              <div className="absolute top-12 right-12 text-right z-10">
                <div className="text-[#0A2357]/40 dark:text-white/20 text-[10px] uppercase tracking-[0.4em]">Since</div>
                <div className="text-[#0A2357]/80 dark:text-white/60 font-serif text-3xl">2012</div>
              </div>
            </div>
          </div>

          {/* ── PANELS 1–4: Story cards ── */}
          {HERO_CARDS.map((card, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={i} className="w-[20%] h-full relative shrink-0 flex overflow-hidden bg-[#faf9f6] dark:bg-black">

                {/* Image side */}
                <div
                  className={`absolute top-0 bottom-0 w-[58%] overflow-hidden ${isEven ? "left-0" : "right-0"}`}
                  style={{
                    clipPath: isEven
                      ? "polygon(0 0, 92% 0, 100% 100%, 0% 100%)"
                      : "polygon(0 0, 100% 0, 100% 100%, 8% 100%)",
                  }}
                >
                  <motion.img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {/* Subtle dark edge fade toward text */}
                  <div
                    className={`absolute inset-0 ${isEven
                      ? "bg-gradient-to-r from-transparent via-transparent to-[#faf9f6] dark:to-black"
                      : "bg-gradient-to-l from-transparent via-transparent to-[#faf9f6] dark:to-black"
                      }`}
                  />
                  {/* Grain texture */}
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
                  />
                </div>

                {/* Vertical orange accent line at diagonal edge */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] z-20"
                  style={{
                    left: isEven ? "calc(58% - 1px)" : undefined,
                    right: isEven ? undefined : "calc(58% - 1px)",
                    background: `linear-gradient(to bottom, transparent 5%, ${ORANGE} 30%, ${ORANGE} 70%, transparent 95%)`,
                  }}
                />

                {/* Text side */}
                <div
                  className={`absolute top-0 bottom-0 w-[45%] flex flex-col justify-center z-10 ${isEven ? "right-0 pl-4 pr-12 lg:pr-20" : "left-0 pr-4 pl-12 lg:pl-20"
                    }`}
                >
                  {/* Ghost chapter number */}
                  <div
                    className="absolute text-[18vw] font-serif text-[#0A2357]/[0.04] dark:text-white/[0.04] leading-none select-none pointer-events-none"
                    style={{ top: "50%", transform: "translateY(-50%)", [isEven ? "right" : "left"]: "-2vw" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Chapter tag */}
                  <div className="flex items-center gap-3 mb-8">
                    <span
                      className="text-[9px] uppercase tracking-[0.5em] font-semibold px-3 py-1 rounded-full border"
                      style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}0d` }}
                    >
                      {card.subtitle}
                    </span>
                  </div>

                  {/* Headline — staggered lines */}
                  <h2 className="font-serif text-[#0A2357] dark:text-white leading-[1.0] mb-6 text-4xl lg:text-5xl xl:text-6xl">
                    {card.title.split(" ").slice(0, 2).join(" ")}
                    {card.title.split(" ").length > 2 && (
                      <>
                        <br />
                        <span className="italic" style={{ color: ORANGE }}>
                          {card.title.split(" ").slice(2).join(" ")}
                        </span>
                      </>
                    )}
                  </h2>

                  {/* Rule */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 max-w-[40px]" style={{ background: ORANGE }} />
                    <div className="text-[9px] uppercase tracking-[0.4em] text-[#0A2357]/30 dark:text-white/30 font-semibold">
                      {card.subtitle.split("·")[0]?.trim() || card.subtitle}
                    </div>
                  </div>

                  {/* Body */}
                  <p className="text-[#0A2357]/50 dark:text-white/50 font-light leading-relaxed text-sm lg:text-base max-w-[280px]">
                    {card.text}
                  </p>

                  {/* Bottom meta */}
                  <div className="mt-10 flex items-center gap-3">
                    <div className="w-6 h-px bg-[#0A2357]/20 dark:bg-white/20" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#0A2357]/20 dark:text-white/20">
                      {i + 1} of {HERO_CARDS.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

        </motion.div>
      </div>
    </section>
  );
}

// ─── STICKY CHAPTERS ─────────────────────────────────────────────────────────
// Exactly 100vh — no dead scroll space. Chapters advance via wheel + auto-timer.
function StickyChapters() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wheelCooldown = useRef(false);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIdx((p) => (p + 1) % CHAPTERS.length);
    }, 5000);
  };

  const goTo = (idx: number) => {
    setActiveIdx(idx);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Lock / unlock page scroll based on section visibility
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([e]) => setLocked(e.intersectionRatio >= 0.85),
      { threshold: 0.85 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!locked || wheelCooldown.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = activeIdx + dir;
      if (next >= 0 && next < CHAPTERS.length) {
        e.preventDefault();
        wheelCooldown.current = true;
        setTimeout(() => { wheelCooldown.current = false; }, 700);
        goTo(next);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [locked, activeIdx]);

  const ch = CHAPTERS[activeIdx];

  return (
    <section ref={sectionRef} className="relative h-screen flex overflow-hidden">

      {/* LEFT — crossfading image, desktop only */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden bg-black shrink-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={ch.image}
            alt={ch.label}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Colour wash */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`w-${activeIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 mix-blend-multiply"
            style={{ background: ch.accentColor }}
          />
        </AnimatePresence>

        {/* Ghost year */}
        <div className="absolute bottom-10 left-10 text-[100px] font-serif leading-none select-none pointer-events-none text-white/[0.07]">
          {ch.year}
        </div>

        {/* Clickable dots */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-3 z-10">
          {CHAPTERS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="group flex items-center justify-end gap-2">
              <span className="text-[9px] uppercase tracking-widest text-white/0 group-hover:text-white/60 transition-all duration-300">
                {CHAPTERS[i].year}
              </span>
              <motion.div
                animate={{ height: i === activeIdx ? 28 : 6, opacity: i === activeIdx ? 1 : 0.3 }}
                transition={{ duration: 0.35 }}
                className="w-[2px] rounded-full bg-white"
              />
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT — text panel */}
      {/*
        Light: bg-[#f5f4f0]   Dark: dark:bg-[#0d0d10]
        Text:  text-[#0A2357] Dark: dark:text-white
        Muted: text-gray-500  Dark: dark:text-white/45
      */}
      <div className="relative flex-1 overflow-hidden bg-[#f5f4f0] dark:bg-[#0d0d10]">

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-0.5 z-10"
          style={{ background: ORANGE }}
          animate={{ width: `${((activeIdx + 1) / CHAPTERS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 lg:px-20"
          >
            {/* Chapter tag */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-4xl font-serif leading-none text-[#0A2357]/10 dark:text-white/10">
                {ch.index}
              </span>
              <span className="h-px w-8" style={{ background: ORANGE }} />
              <span className="text-[10px] uppercase tracking-[0.35em] font-semibold" style={{ color: ORANGE }}>
                {ch.label}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl md:text-6xl font-serif leading-[1.05] mb-8 whitespace-pre-line text-[#0A2357] dark:text-white">
              {ch.headline}
            </h2>

            {/* Accent bar */}
            <div className="w-14 h-0.5 mb-8 rounded-full" style={{ background: ch.accentColor }} />

            {/* Body */}
            <p className="text-lg md:text-xl font-light leading-relaxed max-w-lg text-gray-600 dark:text-white/50">
              {ch.body}
            </p>

            {/* Mobile dots */}
            <div className="flex gap-2 mt-10 lg:hidden">
              {CHAPTERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? 28 : 8,
                    background: i === activeIdx ? ORANGE : "currentColor",
                    opacity: i === activeIdx ? 1 : 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        <div className="absolute bottom-8 right-10 flex gap-3 z-10">
          {[
            { dir: -1, path: "M9 2L4 7l5 5" },
            { dir: 1, path: "M5 2l5 5-5 5" },
          ].map(({ dir, path }) => (
            <button
              key={dir}
              onClick={() => goTo(Math.max(0, Math.min(CHAPTERS.length - 1, activeIdx + dir)))}
              disabled={dir === -1 ? activeIdx === 0 : activeIdx === CHAPTERS.length - 1}
              className="w-10 h-10 rounded-full border border-[#0A2357]/20 dark:border-white/20 text-[#0A2357] dark:text-white flex items-center justify-center transition-all duration-300 disabled:opacity-20 hover:border-[#FF8C00] hover:text-[#FF8C00]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="absolute bottom-8 left-10 text-xs font-mono tracking-widest text-[#0A2357]/30 dark:text-white/25">
          {String(activeIdx + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
        </div>
      </div>
    </section>
  );
}

// ─── PULL QUOTE ───────────────────────────────────────────────────────────────
function PullQuote() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  return (
    <div ref={ref} className="py-32 px-6 overflow-hidden bg-white dark:bg-[#111114]">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-[100px] leading-none font-serif select-none -mb-6" style={{ color: `${ORANGE}22` }}>
            "
          </div>
          <p className="text-3xl md:text-5xl font-serif leading-[1.2] mb-8 italic text-[#0A2357] dark:text-white">
            We don't build hotels. We build the places people come back to.
          </p>
          <div className="w-10 h-0.5 mx-auto mb-6 rounded-full" style={{ background: ORANGE }} />
          <p className="text-sm uppercase tracking-[0.3em] font-semibold text-gray-400 dark:text-white/35">
            Arjun Mehta · Co-Founder
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function useCountUp(target: number, active: boolean, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(Math.floor(cur));
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [active, target, duration]);
  return count;
}

function StatItem({ target, suffix, label, active }: { target: number; suffix: string; label: string; active: boolean }) {
  const raw = useCountUp(target, active);
  const display =
    target >= 1_000_000 ? `${(raw / 1_000_000).toFixed(0)}`
      : target >= 1_000 ? `${(raw / 1_000).toFixed(0)}k`
        : raw;

  return (
    <div className="text-center px-6 flex flex-col items-center justify-center">
      <div className="text-5xl md:text-7xl font-serif mb-4 font-light tracking-tight text-white drop-shadow-md">
        {display}<span style={{ color: ORANGE }}>{suffix}</span>
      </div>
      <div className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-semibold text-white/50">
        {label}
      </div>
    </div>
  );
}

function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const stats = [
    { target: 10, suffix: "+", label: "Years of Legacy" },
    { target: 25_000, suffix: "+", label: "Events Hosted" },
    { target: 1_000_000, suffix: "M+", label: "Happy Guests" },
    { target: 15, suffix: "", label: "Global Awards" },
  ];

  return (
    <div ref={ref} className="py-24 px-6 bg-[#0A2357] dark:bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-10 md:divide-x md:divide-white/10 relative z-10">
        {stats.map((s, i) => <StatItem key={i} {...s} active={inView} />)}
      </div>
    </div>
  );
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────
function TeamSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const col1 = [...TEAM, ...TEAM, ...TEAM];
  const col2 = [...TEAM].reverse().concat([...TEAM].reverse()).concat([...TEAM].reverse());

  return (
    <section className="py-24 lg:py-40 px-6 bg-[#faf9f6] dark:bg-[#0d0d10] relative">
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scrollUp 15s linear infinite;
        }
        .animate-scroll-down {
          animation: scrollDown 15s linear infinite;
        }
        .pause-on-hover:hover .animate-scroll-up,
        .pause-on-hover:hover .animate-scroll-down {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

        {/* Left: Sticky Context */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-1/3 flex flex-col items-start">
            <span
              className="text-[10px] uppercase tracking-[0.35em] font-semibold border px-4 py-2 rounded-full mb-8"
              style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}
            >
              The Team
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05] text-[#0A2357] dark:text-white mb-8">
              The people who<br />refused{" "}
              <span className="italic" style={{ color: ORANGE }}>ordinary.</span>
            </h2>
            <p className="max-w-sm font-light leading-relaxed text-lg text-gray-500 dark:text-white/45">
              Behind every room, every meal, every perfect moment — there are people who obsess over details so guests never have to. Their contributions transform simple stays into legendary experiences.
            </p>
          </div>
        </div>

        {/* Right: Dual Auto-Scroll Marquee */}
        <div ref={ref} className="lg:col-span-7 h-[70vh] min-h-[600px] md:h-[80vh] relative overflow-hidden flex gap-4 md:gap-6 pause-on-hover [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">

          {/* Column 1: Up */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6 animate-scroll-up pt-[50%]">
            {col1.map((member, i) => (
              <TeamCard key={`up-${i}`} member={member} />
            ))}
          </div>

          {/* Column 2: Down */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6 animate-scroll-down pb-[50%]">
            {col2.map((member, i) => (
              <TeamCard key={`down-${i}`} member={member} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: typeof TEAM[0] }) {
  return (
    <div className="relative group bg-white dark:bg-[#151518] rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 flex flex-col shrink-0">
      <div className="aspect-[4/5] md:aspect-[3/4] relative overflow-hidden">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0A2357]/90 dark:from-black/90 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="text-white font-serif text-2xl md:text-3xl leading-tight mb-2 drop-shadow-md">{member.name}</div>
          <div className="text-[10px] md:text-xs uppercase tracking-widest font-semibold" style={{ color: ORANGE }}>
            {member.role}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 border-t border-gray-100 dark:border-white/5">
        <p className="text-[#0A2357]/70 dark:text-white/60 font-serif italic text-base md:text-lg leading-relaxed">
          "{member.quote}"
        </p>
      </div>
    </div>
  );
}

// ─── VERTICALS (ACCORDION) ───────────────────────────────────────────────────
function VerticalsSection() {
  const [open, setOpen] = useState<number[]>(VERTICALS.map((_, i) => i));

  const toggle = (i: number) => {
    setOpen((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  return (
    <section className="py-32 px-6 bg-white dark:bg-[#111114]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16">
          <span
            className="text-[10px] uppercase tracking-[0.35em] font-semibold border px-3 py-1 rounded-full"
            style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}
          >
            Our Verticals
          </span>
          <h2 className="text-5xl md:text-6xl font-serif mt-4 leading-tight text-[#0A2357] dark:text-white">
            One vision,{" "}
            <span className="italic" style={{ color: ORANGE }}>many expressions.</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-white/8 border-y border-gray-200 dark:border-white/8">
          {VERTICALS.map((v, i) => {
            const isOpen = open.includes(i);
            return (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left py-7 flex items-center gap-6 group"
                >
                  <span className="text-sm font-mono w-8 shrink-0 text-gray-400 dark:text-white/35">{v.no}</span>
                  <span
                    className="text-3xl md:text-4xl font-serif flex-1 transition-colors duration-300 text-[#0A2357] dark:text-white"
                    style={{ color: isOpen ? ORANGE : undefined }}
                  >
                    {v.name}
                  </span>
                  <span className="text-xs uppercase tracking-widest hidden md:block shrink-0 text-gray-400 dark:text-white/35">
                    {v.stat}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      borderColor: isOpen ? ORANGE : undefined,
                      background: isOpen ? ORANGE : "transparent",
                      color: isOpen ? "#fff" : undefined,
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-10 pl-14 flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex-1">
                          <p className="text-lg font-light leading-relaxed max-w-xl mb-3 text-gray-600 dark:text-white/55">
                            {v.desc}
                          </p>
                          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: ORANGE }}>
                            {v.stat}
                          </span>
                        </div>
                        <div className="w-full md:w-[380px] h-52 rounded-2xl overflow-hidden shrink-0">
                          <motion.img
                            initial={{ scale: 1.08 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.6 }}
                            src={v.image}
                            alt={v.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── EXPANSION HORIZONTAL SCROLL ─────────────────────────────────────────────
function ExpansionScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-35%"]);
  const smoothX = useSpring(x, { stiffness: 55, damping: 18 });
  const imageParallax = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={containerRef} className="py-32 overflow-hidden bg-[#faf9f6] dark:bg-[#0d0d10]">
      <div className="px-6 mb-16 max-w-[1400px] mx-auto">
        <span
          className="text-[10px] uppercase tracking-[0.35em] font-semibold border px-4 py-2 rounded-full mb-8 inline-block"
          style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}
        >
          Expansion
        </span>
        <h2 className="text-5xl md:text-6xl font-serif mt-4 leading-tight text-[#0A2357] dark:text-white">
          Six cities.{" "}
          <span className="italic" style={{ color: ORANGE }}>One soul.</span>
        </h2>
      </div>

      <div className="overflow-visible mt-16">
        <motion.div style={{ x: smoothX }} className="flex gap-6 px-6 w-max">
          {CITIES.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative w-[300px] md:w-[380px] h-[460px] rounded-3xl overflow-hidden shrink-0 group shadow-lg border border-black/5 dark:border-white/5"
            >
              {/* Parallax Image */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.img
                  style={{ x: imageParallax }}
                  src={c.image}
                  alt={c.city}
                  className="absolute inset-0 w-[130%] h-full max-w-none object-cover origin-center transition-transform duration-1000 group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute top-6 right-8 text-[90px] font-serif text-white/[0.12] leading-none select-none drop-shadow-md">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-white/50 text-xs uppercase tracking-[0.3em] mb-2 font-semibold">{c.year}</div>
                <div className="text-white font-serif text-4xl mb-4 drop-shadow-lg">{c.city}</div>
                <span
                  className="inline-block text-[10px] uppercase tracking-widest font-semibold border px-3 py-1 rounded-full bg-white/10 backdrop-blur-md"
                  style={{ color: ORANGE, borderColor: `${ORANGE}50` }}
                >
                  {c.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CLOSING CTA ─────────────────────────────────────────────────────────────
function ClosingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <div
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#faf9f6] dark:bg-[#0d0d10]"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2400"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <motion.div style={{ scale, opacity }} className="relative z-10 text-center max-w-4xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.4em] font-semibold mb-8" style={{ color: ORANGE }}>
          The Next Chapter
        </p>
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-[0.95] mb-10 text-[#0A2357] dark:text-white">
          The story<br />isn't<br />
          <span className="italic" style={{ color: ORANGE }}>over yet.</span>
        </h2>
        <p className="text-lg font-light mb-12 max-w-md mx-auto leading-relaxed text-gray-400 dark:text-white/35">
          New cities, new flavours, new people — and a thousand more moments waiting to become memories.
        </p>
        <motion.a
          href="/contact"
          whileHover={{ scale: 1.04, backgroundColor: ORANGE_HOVER }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 text-white px-10 py-5 rounded-full text-sm font-semibold tracking-[0.15em] uppercase transition-colors duration-300"
          style={{ backgroundColor: ORANGE, boxShadow: `0 20px 60px ${ORANGE}40` }}
        >
          Be Part of It
          <ArrowUpRight className="w-4 h-4" />
        </motion.a>
      </motion.div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Journey() {
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0d10] text-[#0A2357] dark:text-white transition-colors duration-500 overflow-clip">
      <Navbar />
      <HorizontalStoryHero />
      <Marquee />
      <TeamSection />
      <StickyChapters />
      <PullQuote />
      {/* <StatsStrip /> */}
      <VerticalsSection />
      <ExpansionScroll />
      {/* <Marquee /> */}
      {/* <ClosingCTA /> */}
      <Footer />
    </div>
  );
}
