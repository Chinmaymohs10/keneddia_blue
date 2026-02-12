import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { restaurantStats } from "@/data/restaurantData";
import { TrendingUp, Users, Star, Award, Clock, Sparkles } from "lucide-react";

const ICON_MAP = {
  "Growth": TrendingUp,
  "Guests": Users,
  "Rating": Star,
  "Awards": Award,
  "Years": Clock
};

const GRADIENT_COLORS = [
  { accent: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-200/30" },
  { accent: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-200/30" },
  { accent: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-200/30" },
  { accent: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-200/30" },
];

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

export default function PerformanceMetricsCarousel() {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Create infinite loop by duplicating stats
  const infiniteStats = [...restaurantStats, ...restaurantStats, ...restaurantStats];

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        // Reset when first set of duplicates is fully scrolled
        if (Math.abs(newOffset) >= (restaurantStats.length * 320)) {
          return 0;
        }
        return newOffset;
      });
    }, 30); // Smooth 30ms interval

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-4 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Minimal Header */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary/70" />
          <div>
            <h2 className="text-base md:text-lg font-medium text-foreground/80">
              Our Impact
            </h2>
            <p className="text-[10px] text-muted-foreground/60">
              Live performance metrics
            </p>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient Overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Scrolling Container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-3"
              animate={{ x: offset }}
              transition={{ ease: "linear", duration: 0 }}
            >
              {infiniteStats.map((stat, index) => {
                const IconComponent = Object.entries(ICON_MAP).find(([key]) => 
                  stat.label.includes(key)
                )?.[1] || Star;

                const colors = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                const trendValue = Math.floor(Math.random() * 30) + 5;

                return (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[300px]"
                  >
                    <div className={`bg-card/50 backdrop-blur-sm rounded-lg p-4 border ${colors.border} hover:border-primary/30 transition-all duration-300`}>
                      {/* Content Layout - Horizontal */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Icon & Content */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Icon Badge */}
                          <div className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg ${colors.accent} ${colors.text}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>

                          {/* Value & Label */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xl md:text-2xl font-semibold text-foreground/90 tracking-tight leading-none mb-1">
                              <CountUpAnimation end={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-[11px] font-normal text-muted-foreground/70 truncate">
                              {stat.label}
                            </p>
                          </div>
                        </div>

                        {/* Right: Trend Badge */}
                        <div className="flex-shrink-0">
                          <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-green-500/10 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium">
                            <span className="text-base leading-none">↑</span>
                            <span className="text-[10px] leading-none mt-0.5">{trendValue}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Pause Indicator */}
          {isPaused && (
            <div className="absolute top-2 right-2 z-20">
              <div className="px-2 py-1 rounded bg-background/80 backdrop-blur-sm border border-border text-[10px] text-muted-foreground">
                ⏸ Paused
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}