import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import { siteContent } from "@/data/siteContent";

const ABOUT_SECTIONS = [
  {
    id: 1,
    subTitle: "Neighbourhood Cafe",
    sectionTitle: "Coffee First. Atmosphere Always.",
    description:
      "Our cafe concept blends specialty coffee, bakery-led comfort, and softer hospitality. The experience is shaped for morning regulars, casual meetings, and guests who want time to stay rather than rush.",
    image: siteContent.images.cafes.library.src,
  },
  {
    id: 2,
    subTitle: "Tea & Dessert Lounge",
    sectionTitle: "A Slower Format Built Around Warm Service",
    description:
      "From plated desserts and tea towers to low-light lounge corners, every detail is arranged to feel intimate, polished, and easy to return to throughout the week.",
    image: siteContent.images.cafes.highTea.src,
  },
];

export default function CafeAbout() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ABOUT_SECTIONS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const section = ABOUT_SECTIONS[currentIndex];

  return (
    <section id="about" className="bg-white px-6 py-8 transition-colors duration-500 dark:bg-[#050505]">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl">About Us</h2>
          <div className="mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[45%_55%]">
          <motion.div
            key={`about-image-${currentIndex}`}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/10 shadow-2xl dark:border-white/10">
              <img src={section.image} alt={section.sectionTitle} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-4 -right-4 h-2/3 w-2/3 rounded-xl border-2 border-primary/20 -z-0" />
            <div className="absolute -left-4 -top-4 h-1/2 w-1/2 rounded-xl bg-zinc-100/80 -z-0 dark:bg-white/5" />
          </motion.div>

          <div className="relative lg:pl-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
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

                <p className="text-base font-light leading-relaxed text-zinc-500 dark:text-white/60">{section.description}</p>

                <div className="grid grid-cols-2 gap-6 border-t border-zinc-200 pt-2 dark:border-white/10">
                  <div>
                    <h4 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">Availability</h4>
                    <p className="flex items-center gap-2 font-serif text-base italic text-zinc-900 dark:text-white">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      8:00 AM - 11:00 PM
                    </p>
                    <p className="mt-1 text-[10px] font-bold tracking-tighter text-zinc-400 dark:text-white/30">MONDAY - SUNDAY</p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">Connect</h4>
                    <a href="tel:+919999999999" className="block font-serif text-base italic text-zinc-900 transition-colors hover:text-primary dark:text-white">
                      +91 999 999 9999
                    </a>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 dark:text-white/30">Reservations & Private Tables</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex gap-2">
              {ABOUT_SECTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-6 bg-primary" : "w-3 bg-zinc-200 hover:bg-primary/50 dark:bg-white/10"
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
