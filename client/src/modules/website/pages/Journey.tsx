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
import { useNavigate } from "react-router-dom";
import { getAllLocations, getActivePropertyTypes, GetAllPropertyDetails } from "@/Api/Api";
import { createHotelSlug, createCitySlug } from "@/lib/HotelSlug";

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
  // {
  //   index: "03",
  //   year: "2018",
  //   label: "Growing Roots",
  //   headline: "200 people.\nOne question.",
  //   body: "The team grew — but the hiring rule never changed: do you believe in the dignity of service? A second property in Bengaluru's Indiranagar opened and sold out within weeks. We stopped counting beds and started counting moments.",
  //   image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1600",
  //   accentColor: "#1a6b40",
  // },
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
    properties: [
      { name: "Kennedia Blu — Pondicherry", slug: "kennedia-blu-pondicherry", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200" },
      { name: "Kennedia Urban — Bengaluru", slug: "kennedia-urban-bengaluru", image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1200" },
      { name: "Kennedia Skyline — Mumbai", slug: "kennedia-skyline-mumbai", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1200" },
      { name: "Kennedia Heritage — Jaipur", slug: "kennedia-heritage-jaipur", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200" },
    ],
  },
  {
    no: "02",
    name: "Restaurants & Cafés",
    stat: "12 Outlets · 3 Cuisines",
    desc: "From beachside patisseries to rooftop omakase, our F&B arm tells stories through every plate — seasonal, local, obsessive.",
    properties: [
      { name: "The Napkin — Pondicherry", slug: "the-napkin-pondicherry", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200" },
      { name: "Omakase Rooftop — Mumbai", slug: "omakase-rooftop-mumbai", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200" },
      { name: "Patisserie Bleu — Goa", slug: "patisserie-bleu-goa", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200" },
    ],
  },
  {
    no: "03",
    name: "Events & MICE",
    stat: "800+ Events / Year",
    desc: "Intimate proposals to 1,200-delegate summits. Our events team treats every occasion as unrepeatable — because it is.",
    properties: [
      { name: "Grand Ballroom — Bengaluru", slug: "grand-ballroom-bengaluru", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200" },
      { name: "Pavilion — Jaipur", slug: "pavilion-jaipur", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200" },
    ],
  },
  {
    no: "04",
    name: "Wellness & Spa",
    stat: "3 Spas · Ayurvedic Roots",
    desc: "Where ancient practice meets modern precision. Guests arrive exhausted and leave, for the first time in months, genuinely present.",
    properties: [
      { name: "Ananda Spa — Pondicherry", slug: "ananda-spa-pondicherry", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200" },
      { name: "Ritual — Goa", slug: "ritual-goa", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200" },
      { name: "Praana Wellness — Jaipur", slug: "praana-wellness-jaipur", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200" },
    ],
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
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-gray-600 dark:text-white/30">
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
  // {
  //   title: "Growing Roots",
  //   subtitle: "Bengaluru & Beyond",
  //   text: "We stopped counting beds and started curating moments. Every space we build is a sentence worth reading.",
  //   image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1600",
  // },
  // {
  //   title: "The Legacy",
  //   subtitle: "A Brand Becomes a Movement",
  //   text: "A Michelin-recognized kitchen. Fifteen industry awards. A thousand small moments that became a legacy.",
  //   image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600",
  // }
];

// ─── HORIZONTAL STORY HERO ────────────────────────────────────────────────────
// Editorial split-panel: diagonal image clip + clean typographic text columns
function HorizontalStoryHero() {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });

  const totalPanels = 1 + HERO_CARDS.length;
  // x % is relative to the track's own width (totalPanels × 100vw)
  // so travelling (totalPanels-1) panels = (totalPanels-1)/totalPanels × 100 %
  const travelPct = `${((totalPanels - 1) / totalPanels) * 100}%`;

  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${travelPct}`]);
  const smoothX = useSpring(x, { stiffness: 55, damping: 20 });

  // Orange progress line at bottom
  const barW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Active panel index for the dot indicator
  const [panelIdx, setPanelIdx] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setPanelIdx(Math.min(Math.floor(v * totalPanels), totalPanels - 1));
    });
    return unsub;
  }, [scrollYProgress, totalPanels]);

  return (
    <section ref={targetRef} style={{ height: `${totalPanels * 100}vh` }} className="relative">
      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#faf9f6] dark:bg-black">

        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 z-50"
          style={{ width: barW, background: ORANGE }}
        />

        {/* Panel indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {Array.from({ length: totalPanels }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === panelIdx ? 24 : 6, opacity: i === panelIdx ? 1 : 0.3 }}
              transition={{ duration: 0.35 }}
              className="h-[2px] rounded-full bg-white"
            />
          ))}
        </div>

        {/* Horizontal track — width scales with panel count */}
        <motion.div style={{ x: smoothX, width: `${totalPanels * 100}%` }} className="flex h-full">

          {/* ── PANEL 0: Intro ── */}
          <div className="h-full relative shrink-0 flex" style={{ width: `${100 / totalPanels}%` }}>
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
                className="text-[#0A2357]/70 dark:text-white/45 text-base font-light leading-relaxed max-w-xs"
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
                  className="flex items-center gap-2 text-[#0A2357]/55 dark:text-white/30"
                >
                  <div className="h-px w-8 bg-[#0A2357]/50 dark:bg-white/25" />
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
                <div className="text-[#0A2357]/65 dark:text-white/20 text-[10px] uppercase tracking-[0.4em]">Since</div>
                <div className="text-[#0A2357] dark:text-white/60 font-serif text-3xl">2012</div>
              </div>
            </div>
          </div>

          {/* ── PANELS 1–4: Story cards ── */}
          {HERO_CARDS.map((card, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={i} className="h-full relative shrink-0 flex overflow-hidden bg-[#faf9f6] dark:bg-black" style={{ width: `${100 / totalPanels}%` }}>

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
                  {/* Grain texture */}
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
                  />
                </div>

                {/* Text side — orange accent line lives here as first child so text content renders above it */}
                <div
                  className={`absolute top-0 bottom-0 w-[45%] flex flex-col justify-center z-10 bg-[#faf9f6] dark:bg-black ${isEven ? "right-0 pl-4 pr-12 lg:pr-20" : "left-0 pr-4 pl-12 lg:pl-20"
                    }`}
                >
                  {/* Orange accent line at the inner edge — rendered first, behind all text */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] pointer-events-none"
                    style={{
                      [isEven ? "left" : "right"]: 0,
                      background: `linear-gradient(to bottom, transparent 5%, ${ORANGE} 30%, ${ORANGE} 70%, transparent 95%)`,
                    }}
                  />
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
                    <div className="text-[9px] uppercase tracking-[0.4em] text-[#0A2357]/60 dark:text-white/30 font-semibold">
                      {card.subtitle.split("·")[0]?.trim() || card.subtitle}
                    </div>
                  </div>

                  {/* Body */}
                  <p className="text-[#0A2357]/75 dark:text-white/50 font-light leading-relaxed text-sm lg:text-base max-w-[280px]">
                    {card.text}
                  </p>

                  {/* Bottom meta */}
                  <div className="mt-10 flex items-center gap-3">
                    <div className="w-6 h-px bg-[#0A2357]/45 dark:bg-white/20" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#0A2357]/50 dark:text-white/20">
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
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <div ref={ref} className="overflow-hidden bg-white dark:bg-[#111114] px-6 md:px-10 lg:px-16 py-4">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-stretch">

        {/* Left — quote + content */}
        <motion.div
          className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-14 bg-white dark:bg-[#111114] relative"
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Role tag */}
          <motion.span
            className="inline-block text-[10px] uppercase tracking-[0.4em] font-semibold border px-3 py-1.5 rounded-full mb-5 self-start"
            style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Founder's Voice
          </motion.span>

          {/* Quote mark */}
          <motion.div
            className="text-[72px] leading-none font-serif select-none -mb-2"
            style={{ color: `${ORANGE}30` }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            "
          </motion.div>

          {/* Main quote */}
          <motion.p
            className="text-2xl md:text-3xl lg:text-4xl font-serif leading-[1.25] mb-5 italic text-[#0A2357] dark:text-white"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            We don't build hotels. We build the places people come back to.
          </motion.p>

          {/* Orange rule */}
          <motion.div
            className="w-10 h-0.5 mb-5 rounded-full"
            style={{ background: ORANGE }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Thoughts */}
          <motion.p
            className="text-gray-500 dark:text-white/50 font-light leading-relaxed text-sm max-w-lg mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            From a napkin sketch on the shores of Pondicherry to five properties across India, every decision has been guided by one belief — that hospitality, at its finest, is an act of love.
          </motion.p>

          {/* Attribution */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.72 }}
          >
            <div className="w-6 h-px" style={{ background: ORANGE }} />
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-400 dark:text-white/35">
              {TEAM[0].name} · Co-Founder, 2012
            </span>
          </motion.div>
        </motion.div>

        {/* Right — portrait image */}
        <motion.div
          className="relative overflow-hidden min-h-[320px] lg:min-h-0 rounded-2xl"
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <motion.img
            src={TEAM[0].image}
            alt={TEAM[0].name}
            className="w-full h-full object-cover object-top"
            initial={{ scale: 1.1 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2357]/80 via-[#0A2357]/10 to-transparent" />

          {/* Orange left accent line */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: `linear-gradient(to bottom, transparent, ${ORANGE} 30%, ${ORANGE} 70%, transparent)`, transformOrigin: "top" }}
          />

          {/* Name / role */}
          <motion.div
            className="absolute bottom-6 left-6"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="text-white font-serif text-2xl leading-tight mb-1 drop-shadow-lg">{TEAM[0].name}</div>
            <span
              className="inline-block text-[9px] uppercase tracking-[0.3em] font-semibold border px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/10"
              style={{ color: ORANGE, borderColor: `${ORANGE}60` }}
            >
              {TEAM[0].role}
            </span>
          </motion.div>
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
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const offsets = ["md:translate-y-0", "md:translate-y-6", "md:translate-y-3", "md:-translate-y-3"];

  return (
    <section ref={ref} className="py-14 lg:py-20 px-6 bg-[#faf9f6] dark:bg-[#0d0d10] relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[28vw] font-serif text-[#0A2357]/[0.025] dark:text-white/[0.025] leading-none select-none pointer-events-none">
        K
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8 lg:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-[10px] uppercase tracking-[0.35em] font-semibold border px-4 py-2 rounded-full mb-6"
              style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}
            >
              The People
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05] text-[#0A2357] dark:text-white"
            >
              The people who<br />refused{" "}
              <span className="italic" style={{ color: ORANGE }}>ordinary.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="max-w-xs font-light leading-relaxed text-base text-gray-500 dark:text-white/45 lg:text-right"
          >
            Behind every room, every meal, every perfect moment — obsessives who turn details into memories.
          </motion.p>
        </div>

        {/* Staggered grid — all 4 visible at once */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
          {TEAM.map((member, i) => (
            <motion.div
              key={i}
              className={`${offsets[i]} relative group cursor-pointer`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <TeamCard member={member} isActive={activeIdx === i} index={i} />
            </motion.div>
          ))}
        </div>

        {/* Bottom counter strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-white/8 flex items-center justify-between"
        >
          <span className="text-[10px] uppercase tracking-[0.35em] text-gray-400 dark:text-white/30">
            {TEAM.length} Leaders · Building the Kennedia Vision
          </span>
          <div className="flex gap-2">
            {TEAM.map((_, i) => (
              <motion.div
                key={i}
                className="h-[2px] rounded-full"
                animate={{ width: activeIdx === i ? 28 : 8, background: activeIdx === i ? ORANGE : "#9ca3af" }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TeamCard({ member, isActive, index }: { member: typeof TEAM[0]; isActive: boolean; index: number }) {
  const heights = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/5]"];
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md border border-black/5 dark:border-white/5 bg-white dark:bg-[#151518]">
      <div className={`${heights[index]} relative overflow-hidden`}>
        <motion.img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top"
          animate={{ scale: isActive ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2357]/90 via-[#0A2357]/20 to-transparent" />

        {/* Orange accent line on hover */}
        <motion.div
          className="absolute left-0 bottom-0 w-[3px]"
          animate={{ height: isActive ? "100%" : "40%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: `linear-gradient(to top, ${ORANGE}, transparent)` }}
        />

        {/* Name / role — always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <motion.div
            animate={{ y: isActive ? -8 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-white font-serif text-xl md:text-2xl leading-tight mb-1 drop-shadow-md">{member.name}</div>
            <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: ORANGE }}>
              {member.role}
            </div>
          </motion.div>

          {/* Quote — slides up on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/80 font-serif italic text-sm leading-relaxed mt-3 border-t border-white/20 pt-3">
              "{member.quote}"
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── VERTICALS (ACCORDION) ───────────────────────────────────────────────────
function PropertyCarousel({ properties }: { properties: any[] }) {
  const [active, setActive] = useState(0);
  const total = properties.length;
  const navigate = useNavigate();

  const prev = () => setActive((a) => (a - 1 + total) % total);
  const next = () => setActive((a) => (a + 1) % total);

  if (total === 0) return null;

  const prop = properties[active];
  const pName = prop?.name || "";
  const city = prop?.city || "";
  const propertyPath = `${createCitySlug(city || pName)}/${createHotelSlug(pName || city, prop?.id || 0)}`;
  const pType = prop?.propertyType?.toLowerCase();
  const localPath = pType === "wine" ? `/wine-detail/${propertyPath}` : `/${propertyPath}`;

  return (
    <div className="w-full md:w-[420px] shrink-0 relative">
      {/* Card */}
      <div className="relative h-52 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={prop?.image}
            alt={prop?.name}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>

        {/* Dark gradient for label legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Property name — clickable */}
        <AnimatePresence mode="wait">
          <motion.a
            key={`label-${active}`}
            href={localPath}
            onClick={(e) => { e.preventDefault(); navigate(localPath); }}
            className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between group/link cursor-pointer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
          >
            <div>
              <div className="text-white font-serif text-lg leading-tight drop-shadow-md group-hover/link:underline decoration-[#FF8C00] underline-offset-4 transition-all">
                {prop?.name}
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] mt-1" style={{ color: ORANGE }}>
                View Property →
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/60 group-hover/link:text-[#FF8C00] transition-colors" />
          </motion.a>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#FF8C00] transition-colors duration-200"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#FF8C00] transition-colors duration-200"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators + count */}
      {total > 1 && (
        <div className="flex items-center gap-3 mt-3 px-1">
          <div className="flex gap-1.5">
            {properties.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="h-[2px] rounded-full transition-all duration-300"
                style={{ width: i === active ? 20 : 6, background: i === active ? ORANGE : "#d1d5db" }}
              />
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/30 ml-auto">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}

function VerticalsSection() {
  const [verticals, setVerticals] = useState<any[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerticals = async () => {
      try {
        const [typesRes, propsRes] = await Promise.all([
          getActivePropertyTypes(),
          GetAllPropertyDetails()
        ]);

        const types = typesRes?.data || [];
        const allProps = propsRes?.data?.data || propsRes?.data || [];

        const dynamicVerticals = types.map((t: any, index: number) => {
          const matchedListings: any[] = [];

          allProps.forEach((p: any) => {
            const parent = p.propertyResponseDTO;
            const listings = p.propertyListingResponseDTOS || [];
            if (!parent || !parent.isActive) return;

            listings.forEach((l: any) => {
              if (l.isActive && (l.propertyType === t.typeName || parent.propertyTypes?.includes(t.typeName))) {
                matchedListings.push({
                  id: parent.id,
                  name: l.propertyName || parent.propertyName,
                  image: l.media?.[0]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600",
                  city: parent.locationName,
                  propertyType: l.propertyType || parent.propertyTypes?.[0]
                });
              }
            });
          });

          return {
            no: String(index + 1).padStart(2, "0"),
            name: t.typeName,
            stat: `${matchedListings.length} Properties`,
            desc: t.description || `Explore our exquisite ${t.typeName} properties and destinations.`,
            properties: matchedListings
          };
        });

        const filtered = dynamicVerticals.filter(v => v.properties.length > 0);
        setVerticals(filtered);
        setOpen(filtered.map((_, i) => i));
      } catch (e) {
        console.error("Error fetching verticals:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVerticals();
  }, []);

  const toggle = (i: number) => {
    setOpen((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  return (
    <section className="py-16 px-6 bg-white dark:bg-[#111114]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
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
          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: ORANGE, borderTopColor: 'transparent' }} /></div>
          ) : verticals.map((v, i) => {
            const isOpen = open.includes(i);
            return (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left py-5 flex items-center gap-6 group"
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
                      <div className="pb-6 pl-14 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                          <p className="text-lg font-light leading-relaxed max-w-xl mb-3 text-gray-600 dark:text-white/55">
                            {v.desc}
                          </p>
                          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: ORANGE }}>
                            {v.stat}
                          </span>
                        </div>
                        <PropertyCarousel properties={v.properties} />
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

  const [locations, setLocations] = useState<{ id?: number; city: string; state: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getAllLocations();
        if (res?.data && Array.isArray(res.data)) {
          const active = res.data
            .filter((loc: any) => loc.isActive)
            .map((loc: any) => ({
              id: loc.id,
              city: loc.locationName,
              state: loc.state,
            }));
          setLocations(active);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  return (
    <section ref={containerRef} className="py-16 overflow-hidden bg-[#faf9f6] dark:bg-[#0d0d10]">
      {/* Section label */}
      <div className="px-6 mb-8 max-w-[1400px] mx-auto flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-[0.35em] font-semibold border px-4 py-2 rounded-full"
          style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}
        >
          Availability
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-white/30">
          {locations.length} Locations
        </span>
      </div>

      {/* Scrolling text cards */}
      <div className="overflow-visible">
        <motion.div style={{ x: smoothX }} className="flex gap-4 px-6 w-max">
          {locations.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              onClick={() => c.id && navigate(`/destination/${c.id}`)}
              className="w-[220px] md:w-[260px] shrink-0 group cursor-pointer"
            >
              {/* Card */}
              <div
                className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#151518] px-6 py-7 flex flex-col gap-4 transition-all duration-300 group-hover:border-[#FF8C00]/40 group-hover:shadow-md"
              >
                {/* Index row */}
                <span className="text-[10px] font-mono text-gray-300 dark:text-white/20">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* City name */}
                <div className="font-serif text-3xl md:text-4xl leading-none text-[#0A2357] dark:text-white group-hover:text-[#FF8C00] transition-colors duration-300">
                  {c.city}
                </div>

                {/* Divider */}
                <div className="h-px w-8" style={{ background: ORANGE }} />

                {/* Arrow */}
                <div className="flex justify-end">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: i * 0.2 }}
                    className="text-gray-300 dark:text-white/20 group-hover:text-[#FF8C00] transition-colors duration-300"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.div>
                </div>
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
      <PullQuote />
      <TeamSection />
      <StickyChapters />
      <VerticalsSection />
      <ExpansionScroll />
      <Footer />
    </div>
  );
}
