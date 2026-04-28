import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WHATSAPP_NUMBER = "919999999999";

export default function WineWhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="fixed bottom-8 right-8 z-[999] flex items-center justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 14, scaleX: 0.88 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            exit={{ opacity: 0, x: 14, scaleX: 0.88 }}
            style={{ originX: 1 }}
            className="mr-3 overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-2xl dark:border-white/10 dark:bg-[#1A0C12]"
          >
            <p className="text-[12px] font-black text-stone-900 dark:text-stone-100">
              Ask about our wines
            </p>
            <p className="mt-0.5 text-[10px] text-stone-400 dark:text-stone-500">
              Tap to chat on WhatsApp
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to enquire about your wine collection. Could you share more details and availability?")}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-2xl shadow-green-900/40"
        aria-label="Ask about wines on WhatsApp"
      >
        <svg viewBox="0 0 32 32" fill="white" className="h-7 w-7">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.663 4.882 1.818 6.932L2 30l7.302-1.784A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.892-1.607l-.422-.25-4.333 1.059 1.098-4.205-.275-.434A11.543 11.543 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 27.6zm6.344-8.656c-.347-.174-2.055-1.014-2.375-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.362-.202.232-.405.26-.752.086-.347-.174-1.464-.539-2.788-1.719-1.031-.917-1.726-2.05-1.929-2.397-.202-.347-.022-.534.152-.706.156-.155.347-.405.52-.607.174-.202.232-.347.347-.579.116-.232.058-.434-.029-.607-.087-.174-.784-1.89-1.074-2.59-.283-.68-.57-.588-.784-.598-.202-.01-.434-.012-.666-.012-.232 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.174.231 2.449 3.738 5.934 5.24.83.358 1.477.572 1.982.732.832.265 1.59.228 2.188.138.667-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.231-.665-.405z" />
        </svg>
      </motion.a>
    </div>
  );
}
