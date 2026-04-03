import {
  ArrowUpRight,
  Coffee,
  Leaf,
  MoonStar,
  Sparkles,
  SunMedium,
  Waves,
} from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { siteContent } from "@/data/siteContent";

const STORY_CARDS = [
  {
    id: 1,
    eyebrow: "Morning Ritual",
    title: "Single Origin Espresso",
    description:
      "Dark cacao depth, caramel warmth, and dense crema create a sharper wake-up profile for early cafe regulars. It's the foundation of every great day.",
    benefit: "High aroma and concentrated finish",
    accent: "Best for fast starts",
    image: siteContent.images.cafes.minimalist.src,
    icon: Coffee,
    stats: ["18g dose", "25 sec pull", "Bold body"],
  },
  {
    id: 2,
    eyebrow: "Slow Brewing",
    title: "Pour Over Ritual",
    description:
      "Hand brewing opens cleaner acidity, floral lift, and a transparent bean character designed for longer sipping and deep contemplation.",
    benefit: "Nuanced tasting notes and lighter texture",
    accent: "Best for calm moments",
    image: siteContent.images.cafes.library.src,
    icon: Leaf,
    stats: ["92 C water", "3 min bloom", "Bright cup"],
  },
  {
    id: 3,
    eyebrow: "Noon Reset",
    title: "Flat White Balance",
    description:
      "A tighter milk texture keeps espresso structure intact, making the cup creamy without losing its bold roast identity or strength.",
    benefit: "Silky mouthfeel with preserved coffee edge",
    accent: "Best for mid-day focus",
    image: siteContent.images.cafes.parisian.src,
    icon: SunMedium,
    stats: ["Velvet foam", "Double shot", "Balanced sweetness"],
  },
  {
    id: 4,
    eyebrow: "Cold Extraction",
    title: "Cold Brew Reserve",
    description:
      "Overnight steeping lowers bitterness and builds a smoother, chocolate-toned drink that holds its character through the hot afternoon.",
    benefit: "Lower acidity and refreshing energy",
    accent: "Best for long conversations",
    image: siteContent.images.cafes.garden.src,
    icon: Waves,
    stats: ["14 hr steep", "Low acid", "Clean chill"],
  },
  {
    id: 5,
    eyebrow: "Comfort Pairing",
    title: "Bakery And Brew",
    description:
      "Buttery bakes and roasted coffee are paired to stretch aroma, texture, and sweetness across the entire sensory table experience.",
    benefit: "Fuller flavor contrast with richer finish",
    accent: "Best for relaxed brunches",
    image: siteContent.images.cafes.bakery.src,
    icon: Sparkles,
    stats: ["Warm pastry", "Soft sweetness", "Long finish"],
  },
  {
    id: 6,
    eyebrow: "Evening Mood",
    title: "Mocha Afterglow",
    description:
      "Cocoa bitterness, espresso warmth, and softened milk texture turn the last coffee of the day into a slower, more mindful indulgence.",
    benefit: "Dessert-like depth without losing coffee notes",
    accent: "Best for late cafe hours",
    image: siteContent.images.cafes.highTea.src,
    icon: MoonStar,
    stats: ["Cocoa layer", "Soft foam", "Night sip"],
  },
];

function StoryCard({ card, index, progress, total }) {
  const unit = 1 / total;
  const start = index * unit;
  const end = (index + 1) * unit;
  const combinedRange = [start - unit * 0.8, start, end, end + unit * 0.8];

  const softSpring = { stiffness: 45, damping: 22, mass: 0.6 };

  const y = useSpring(
    useTransform(progress, combinedRange, [120, 0, 0, -120]),
    softSpring,
  );
  const scale = useSpring(
    useTransform(progress, combinedRange, [0.94, 1, 1, 0.94]),
    softSpring,
  );
  const opacity = useTransform(progress, combinedRange, [0, 1, 1, 0]);

  const Icon = card.icon;

  return (
    <motion.article
      style={{ y, scale, opacity, zIndex: total - index }}
      className="absolute inset-0 grid h-full grid-cols-[1fr_1.1fr] overflow-hidden rounded-[3rem] border border-white/60 bg-white shadow-[0_40px_100px_rgba(39,24,12,0.1)]"
    >
      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent" />
        <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-lg">
          <Icon className="h-3 w-3" /> {card.eyebrow}
        </div>
      </div>

      <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#fffaf4_0%,#fff_100%)] p-10 xl:p-12">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            {card.accent}
          </p>
          <h3 className="text-3xl font-serif leading-tight text-zinc-950 xl:text-4xl">
            {card.title}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-600 line-clamp-4">
            {card.description}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {card.stats.map((s) => (
              <span
                key={s}
                className="rounded-full bg-zinc-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="rounded-[2rem] bg-[#2b1d14] p-5 text-white">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
              Benefit Profile
            </p>
            <p className="font-serif text-lg italic">{card.benefit}</p>
          </div>
          <button className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-900">
            Learn More{" "}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function CafeCoffeeStory() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 15,
    mass: 1,
  });

  const marqueeY = useTransform(smoothProgress, [0, 1], ["0%", "-40%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-clip bg-[#fdfaf6] lg:h-[750vh]"
    >
      <div className="sticky top-0 hidden h-screen w-full overflow-hidden lg:block">
        {/* Large Decorative Text */}
        <motion.div
          style={{ y: marqueeY }}
          className="pointer-events-none absolute -right-20 top-0 text-[18rem] font-serif italic text-zinc-200/40 opacity-50"
        >
          STORY
        </motion.div>

        <div className="grid h-full grid-cols-[0.7fr_1.3fr] gap-12 px-12 xl:px-20">
          {/* Left Side: Deep Content */}
          <div className="flex flex-col justify-center py-20">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">
              <Coffee className="h-3.5 w-3.5" /> Discovery
            </div>
            <h2 className="mb-6 text-6xl font-serif leading-[1.1] text-zinc-950">
              A Journey Through <br />
              <span className="italic text-amber-800">Every Roast</span>
            </h2>
            <div className="mb-10 max-w-sm space-y-4 border-l-2 border-amber-800/20 pl-6">
              <p className="text-sm font-medium leading-relaxed text-zinc-500 uppercase tracking-tighter">
                Our Philosophy
              </p>
              <p className="text-base leading-relaxed text-zinc-600">
                From the first light of dawn to the quiet of the evening, coffee
                marks the tempo of our lives. We believe every cup tells a story
                of origin, craft, and the intentional moments in between.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {STORY_CARDS.map((card, i) => {
                const isActive = useTransform(
                  smoothProgress,
                  [i / 6, (i + 0.5) / 6, (i + 1) / 6],
                  [0.3, 1, 0.3],
                );
                return (
                  <motion.div
                    key={card.id}
                    style={{ opacity: isActive }}
                    className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-800"
                  >
                    <span className="h-px w-6 bg-amber-800" /> {card.title}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Larger Showcase Section */}
          <div className="relative flex items-center justify-start pr-10">
            <div className="relative h-[72vh] w-full max-w-[1000px]">
              {STORY_CARDS.map((card, index) => (
                <StoryCard
                  key={card.id}
                  card={card}
                  index={index}
                  progress={smoothProgress}
                  total={6}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Placeholder */}
      <div className="px-6 py-20 lg:hidden">
        <h2 className="text-4xl font-serif mb-10">The Coffee Story</h2>
        <div className="space-y-10">
          {STORY_CARDS.map((card) => (
            <div key={card.id} className="rounded-3xl bg-white p-6 shadow-lg">
              <img
                src={card.image}
                className="rounded-2xl mb-4 h-64 w-full object-cover"
              />
              <h3 className="text-xl font-serif mb-2">{card.title}</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
