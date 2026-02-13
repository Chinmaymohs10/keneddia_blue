import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Clock, Phone, MapPin, Instagram, Facebook, 
  Twitter, MessageCircle, Contact2, X, MessageSquare 
} from "lucide-react";

// --- POPUP COMPONENT ---
const ContactPopup = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-8 z-[101] shadow-2xl border border-zinc-100 dark:border-white/10"
          >
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-zinc-900 dark:text-white italic">Quick Connect</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest font-bold">Choose your preferred method</p>
              </div>

              <div className="grid gap-4">
                {/* WhatsApp Option */}
                <a 
                  href="https://wa.me/919999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-all group"
                >
                  <div className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                    <MessageSquare size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-sm text-zinc-900 dark:text-white">WhatsApp</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Instant Chat</span>
                  </div>
                </a>

                {/* Mobile Option */}
                <a 
                  href="tel:+919999999999" 
                  className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary transition-all group"
                >
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Phone size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-sm text-zinc-900 dark:text-white">Direct Call</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Speak to Host</span>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function AboutResturantPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const textX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15px", "15px"]);

  return (
    <section 
      ref={containerRef}
      id="about" 
      className="relative py-16 md:py-20 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden"
    >
      <ContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

      {/* DECORATIVE BACKGROUND TEXT */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/4 left-0 whitespace-nowrap text-[8rem] md:text-[12rem] font-black text-zinc-100 dark:text-white/[0.02] pointer-events-none select-none italic uppercase z-0"
      >
        Authentic Heritage Dining
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: IMAGE */}
          <div className="lg:col-span-4 relative max-w-sm mx-auto lg:mx-0">
            <motion.div 
              style={{ y: imageY }}
              className="relative rounded-2xl overflow-hidden aspect-square shadow-xl border border-zinc-100 dark:border-white/5"
            >
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200"
                alt="Restaurant Ambience"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>

            <div className="absolute -bottom-4 left-4 flex gap-2">
              {[
                { icon: <Instagram size={14} />, link: "#" },
                { icon: <Facebook size={14} />, link: "#" },
                { icon: <Twitter size={14} />, link: "#" },
                { icon: <MessageCircle size={14} />, link: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.link}
                  className="w-9 h-9 bg-white dark:bg-zinc-900 shadow-lg rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors border border-zinc-100 dark:border-white/10"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">
                  The Destination
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white leading-tight tracking-tight">
                A Symphony of <br />
                <span className="italic text-zinc-400 dark:text-white/40">Fine Flavors.</span>
              </h2>
              
              <p className="text-zinc-600 dark:text-white/70 text-base md:text-lg leading-relaxed font-light max-w-3xl">
                We believe dining is more than just a meal; it’s a 
                <span className="text-zinc-900 dark:text-white font-medium"> curated premium experience</span>. 
                Our philosophy balances bold Indian tradition with refined global elegance, 
                all within a <span className="text-primary italic font-medium">thoughtfully designed setting</span>.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-white/10">
              <div className="group">
                <h4 className="text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" /> Availability
                </h4>
                <div className="space-y-1">
                  <p className="text-zinc-900 dark:text-white font-serif text-lg md:text-xl italic leading-tight transition-colors">
                    11:00 AM — 11:30 PM
                  </p>
                  <p className="text-zinc-400 dark:text-white/30 text-[9px] font-bold tracking-widest uppercase">
                    MONDAY — SUNDAY
                  </p>
                </div>
              </div>

              {/* CONNECT SECTION - Triggering Popup */}
              <div className="group cursor-pointer" onClick={() => setIsPopupOpen(true)}>
                <h4 className="text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-primary" /> Connect
                </h4>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 bg-primary/10 dark:bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                  >
                    <Contact2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-zinc-900 dark:text-white font-serif text-lg md:text-xl italic block leading-tight">
                      Get In Touch
                    </span>
                    <span className="text-zinc-400 dark:text-white/30 text-[9px] font-bold tracking-widest uppercase">
                      Direct Reservation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}