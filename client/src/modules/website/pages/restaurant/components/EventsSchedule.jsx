import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Calendar, Clock, Sparkles, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EVENTS = [
  {
    id: 1,
    type: "Grand Opening",
    title: "The Grand Unveiling",
    date: "March 15, 2026",
    time: "07:00 PM",
    desc: "Experience the dawn of a new BYOB era in Ghaziabad.",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600"
  },
  {
    id: 2,
    type: "Special Nights",
    title: "Acoustic Sunset Sessions",
    date: "March 22, 2026",
    time: "06:00 PM",
    desc: "Live unplugged music paired with our signature appetizers.",
    img: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1600"
  },
  {
    id: 3,
    type: "Festive Events",
    title: "Flavors of Holi Brunch",
    date: "March 29, 2026",
    time: "12:00 PM",
    desc: "A vibrant multi-cuisine celebration of color and taste.",
    img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1600"
  }
];

const EventLayer = ({ event, index, scrollYProgress }) => {
  const start = index * 0.33;
  const end = (index + 1) * 0.33;

  const y = useTransform(scrollYProgress, [start, end], ["100%", "0%"]);
  const opacity = useTransform(scrollYProgress, [start, start + 0.05], [0, 1]);
  const imgScale = useTransform(scrollYProgress, [start, end], [1.2, 1]);

  return (
    <motion.div
      style={{ y, opacity, zIndex: index + 10 }}
      className="absolute inset-0 w-full h-full bg-[#050505] flex items-center overflow-hidden"
    >
      <motion.div style={{ scale: imgScale }} className="absolute inset-0 z-0">
        <img src={event.img} className="w-full h-full object-cover opacity-40 grayscale-[0.6]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </motion.div>

      <div className="container mx-auto px-6 md:px-20 relative z-10">
        <div className="max-w-3xl space-y-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary text-xs font-black uppercase tracking-[0.5em]">{event.type}</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-serif text-white leading-none tracking-tighter">
            {event.title.split(' ').map((word, i) => (
              <span key={i} className={i % 2 !== 0 ? "italic text-white/20 block md:inline" : "block md:inline"}>{word} </span>
            ))}
          </h1>

          <div className="flex flex-wrap gap-8 py-4 border-y border-white/10 w-fit">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-white font-serif italic text-xl">{event.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-white font-serif italic text-xl">{event.time}</span>
            </div>
          </div>

          <p className="text-white/40 text-lg max-w-md font-light leading-relaxed italic">
            {event.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function EventsSchedule() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const scrollToEvent = (index) => {
    const sectionHeight = targetRef.current.offsetHeight;
    const targetScroll = targetRef.current.offsetTop + (sectionHeight * (index * 0.33));
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#050505]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* REVERSE PARALLAX BACKGROUND */}
        <motion.div 
          style={{ x: bgX }}
          className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[25rem] font-black text-white/[0.01] pointer-events-none select-none italic"
        >
          MOMENTS MOMENTS MOMENTS
        </motion.div>

        {/* STACKED CONTENT */}
        <div className="relative w-full h-full">
          {EVENTS.map((event, index) => (
            <EventLayer key={event.id} event={event} index={index} scrollYProgress={smoothProgress} />
          ))}
        </div>

        {/* BOTTOM UI CONTROLS (DOCK & ENQUIRE) */}
        <div className="absolute bottom-[10%] w-full z-[100] px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* NAVIGATION DOCK (Center on Mobile, Left on Desktop) */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-full border border-white/10">
            {EVENTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToEvent(idx)}
                className="group relative px-4 py-2"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-white/20 group-hover:text-primary transition-colors">0{idx + 1}</span>
                  <div className="w-12 h-[2px] bg-white/10 relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-primary origin-left"
                      style={{ 
                        scaleX: useTransform(scrollYProgress, 
                          [idx * 0.33, (idx + 1) * 0.33], 
                          [0, 1]
                        ) 
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ENQUIRE BUTTON - Positioned 20% lower than original top placement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Button 
              variant="outline"
              className="rounded-full border-primary/30 bg-black/50 text-primary hover:bg-primary hover:text-white transition-all gap-2 h-14 px-8 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MousePointer2 className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Enquire for Events</span>
            </Button>
          </motion.div>
        </div>

      </div>
    </section>
  );
}