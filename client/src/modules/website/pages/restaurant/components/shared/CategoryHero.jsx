import React from "react";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function CategoryHero({ content, propertyId }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  // Fallback images for carousel if content.images doesn't exist
  const carouselImages = content.carouselImages || [
    content.heroImage,
    "https://images.unsplash.com/photo-1550966841-3ee5ad0110d3?q=80&w=1200",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
  ];

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-zinc-900">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {carouselImages.map((img, index) => (
            <SwiperSlide key={index}>
              <motion.div style={{ y }} className="relative h-full w-full">
                <img
                  src={img}
                  className="h-full w-full object-cover"
                  alt={`${content.title} ${index + 1}`}
                />
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center pt-24">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md md:p-12"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Sparkles size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                  Premium Experience • ID: {propertyId}
                </span>
              </div>

              <h1 className="mb-6 font-serif text-5xl leading-[1.1] text-white md:text-7xl lg:text-8xl tracking-tighter">
                {content.title.split(" ")[0]}{" "}
                <span className="italic text-primary">
                  {content.title.split(" ").slice(1).join(" ")}
                </span>
              </h1>

              <p className="max-w-2xl text-lg font-light leading-relaxed text-zinc-200 opacity-90 md:text-xl">
                {content.description}
              </p>
              
              <div className="mt-8">
                <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group">
                  Explore Menu <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-primary" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Custom Pagination Style Overrides */}
        <style>{`
          .swiper-pagination-bullet { background: white; opacity: 0.5; }
          .swiper-pagination-bullet-active { background: #ef4444; opacity: 1; width: 24px; border-radius: 4px; transition: all 0.3s; }
        `}</style>
      </section>

      {/* ── POST-HERO BREADCRUMBS (SEO & Navigation) ── */}
      <div className="sticky top-[70px] z-30 w-full border-b border-zinc-100 bg-white/80 py-4 backdrop-blur-md dark:border-white/5 dark:bg-[#080808]/80">
        <div className="container mx-auto px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <ChevronRight size={10} />
            <a href="/restaurants" className="hover:text-primary transition-colors">Restaurants</a>
            <ChevronRight size={10} />
            <span className="text-zinc-900 dark:text-zinc-100">{content.title}</span>
          </nav>
        </div>
      </div>
    </>
  );
}