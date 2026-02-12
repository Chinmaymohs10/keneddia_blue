import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { restaurantStats } from "@/data/restaurantData";

function CountUpAnimation({ end, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const endValue = parseInt(end);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function RestaurantStats() {
  const barHeights = [75, 85, 70, 80];
  
  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-background dark:via-background dark:to-background overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Light mode: subtle gray shapes, Dark mode: primary colored */}
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-[15%] w-[350px] h-[350px] bg-gray-400 dark:bg-primary rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 left-[15%] w-[300px] h-[300px] bg-gray-300 dark:bg-primary/80 rounded-full blur-3xl"
        />

        {/* Minimal Grid */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium mb-2"
          >
            Performance Metrics
          </motion.span>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-foreground mb-1">
            Excellence by Numbers
          </h2>
          
          <p className="text-gray-600 dark:text-muted-foreground text-sm max-w-md mx-auto">
            Delivering consistent quality and service
          </p>
        </motion.div>

        {/* Sleek Chart Container */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white/80 dark:bg-card/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-border shadow-xl shadow-gray-900/5 dark:shadow-black/20 p-6 md:p-8">
            
            {/* Horizontal Grid Lines - More Professional */}
            <div className="absolute inset-x-6 md:inset-x-8 top-6 md:top-8 bottom-16 pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute left-0 right-0 border-t border-gray-200/80 dark:border-border/40"
                  style={{ top: `${i * 33.33}%` }}
                />
              ))}
            </div>

            {/* Stats Bars - Sleeker Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative">
              {restaurantStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex flex-col items-center group"
                >
                  {/* Compact Bar Container */}
                  <div className="relative w-full h-36 md:h-40 flex flex-col justify-end mb-3">
                    {/* Sleek Animated Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${barHeights[index]}%` }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 1.2, 
                        delay: index * 0.15,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="relative w-full rounded-t-xl overflow-hidden"
                    >
                      {/* Professional Gradient - Different for light/dark */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/90 to-primary/70 dark:from-primary dark:via-primary/85 dark:to-primary/60">
                        {/* Subtle Shimmer */}
                        <motion.div
                          animate={{ 
                            y: ["100%", "-100%"]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
                        />
                      </div>

                      {/* Elegant Number Display */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-gray-200/50 dark:border-primary/20 rounded-lg px-2.5 py-1.5 shadow-lg"
                      >
                        <div className="text-lg md:text-xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                          <CountUpAnimation end={stat.value} suffix={stat.suffix} />
                        </div>
                      </motion.div>

                      {/* Minimal Top Glow */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-primary/30 rounded-full blur-lg" />
                    </motion.div>

                    {/* Clean Base Line */}
                    <div className="w-full h-0.5 bg-gray-300 dark:bg-border rounded-full mt-0.5" />
                  </div>

                  {/* Compact Label */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center"
                  >
                    <h3 className="text-xs md:text-sm font-semibold text-gray-800 dark:text-foreground leading-tight">
                      {stat.label}
                    </h3>
                    
                    {/* Minimal Indicator */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-1.5 rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Sleek Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-6 pt-4 border-t border-gray-200 dark:border-border/50 flex items-center justify-center gap-2 text-gray-500 dark:text-muted-foreground text-xs"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              <span>Live Performance Dashboard</span>
            </motion.div>
          </div>

          {/* Minimal Legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="mt-4 flex items-center justify-center gap-6 text-[11px] text-gray-500 dark:text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-primary to-primary/70" />
              <span>Growth Rate</span>
            </div>
            <div className="w-px h-3 bg-gray-300 dark:bg-border" />
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-sm bg-primary/30"
              />
              <span>Target</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}