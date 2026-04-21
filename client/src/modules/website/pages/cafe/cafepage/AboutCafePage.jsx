import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import { siteContent } from "@/data/siteContent";

const ABOUT_SECTIONS = [
  {
    id: 1,
    subTitle: "Our Roots — Est. 2018",
    sectionTitle: "A Cafe Built On Craft & Community",
    description:
      "Kennedia Cafe was born from a simple belief — that a great cup of coffee and a welcoming space can transform an ordinary day. We source our beans directly from small-batch farms, roast in-house every morning, and bake everything fresh before you arrive.",
    image: siteContent.images.cafes.minimalist.src,
  },
  {
    id: 2,
    subTitle: "The Spaces",
    sectionTitle: "Rooms Designed For Staying, Not Rushing",
    description:
      "From our quiet library corner to the open garden terrace and the high-tea lounge — every space is designed with a specific kind of visitor in mind. You are never rushed here. Stay as long as you need to.",
    image: siteContent.images.cafes.library.src,
  },
  {
    id: 3,
    subTitle: "Tea & Dessert Lounge",
    sectionTitle: "A Slower Format Built Around Warm Service",
    description:
      "From plated desserts and tea towers to low-light lounge corners, every detail is arranged to feel intimate, polished, and easy to return to. Our high-tea lounge is the highlight of every weekend.",
    image: siteContent.images.cafes.highTea.src,
  },
  {
    id: 4,
    subTitle: "Garden Terrace",
    sectionTitle: "Open-Air Brunch With a View Worth the Wait",
    description:
      "Our outdoor terrace seats 40 guests under natural shade, surrounded by greenery and morning light. It's where brunch tables run long and cold brews flow freely — perfect for catching up or starting the week right.",
    image: siteContent.images.cafes.garden.src,
  },
];

export default function AboutCafePage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ABOUT_SECTIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const section = ABOUT_SECTIONS[currentIndex];

  return (
    <section className="bg-white px-6 py-16 lg:py-28 transition-colors duration-500 dark:bg-[#050505]">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl">About Us</h2>
          <div className="mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[45%_55%]">
          {/* Image */}
          <motion.div
            key={`about-image-${currentIndex}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/10 shadow-2xl dark:border-white/10">
              <img
                src={section.image}
                alt={section.sectionTitle}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 h-2/3 w-2/3 rounded-xl border-2 border-primary/20 -z-0" />
            <div className="absolute -left-4 -top-4 h-1/2 w-1/2 rounded-xl bg-zinc-100/80 -z-0 dark:bg-white/5" />
          </motion.div>

          {/* Content */}
          <div className="relative lg:pl-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <MapPin className="h-3 w-3" />
                    {section.subTitle}
                  </h3>
                  <h2 className="mb-3 text-3xl font-serif leading-tight text-zinc-900 dark:text-white md:text-4xl">
                    {section.sectionTitle}
                  </h2>
                </div>

                <p className="text-base font-light leading-relaxed text-zinc-500 dark:text-white/60">
                  {section.description}
                </p>

                <div className="grid grid-cols-2 gap-6 border-t border-zinc-200 pt-4 dark:border-white/10">
                  <div>
                    <h4 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                      Availability
                    </h4>
                    <p className="flex items-center gap-2 font-serif text-base italic text-zinc-900 dark:text-white">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      7:00 AM – 11:00 PM
                    </p>
                    <p className="mt-1 text-[10px] font-bold tracking-tighter text-zinc-400 dark:text-white/30">
                      MONDAY – SUNDAY
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                      Connect
                    </h4>
                    <a
                      href="tel:+919876543210"
                      className="block font-serif text-base italic text-zinc-900 transition-colors hover:text-primary dark:text-white"
                    >
                      +91 98765 43210
                    </a>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 dark:text-white/30">
                      Reservations & Private Tables
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot navigation */}
            <div className="mt-6 flex gap-2">
              {ABOUT_SECTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-primary"
                      : "w-3 bg-zinc-200 hover:bg-primary/50 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
