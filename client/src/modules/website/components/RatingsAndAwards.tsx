import { motion } from "framer-motion";
import { Award, Star, Trophy } from "lucide-react";

const ratings = [
  {
    source: "Condé Nast Traveler",
    score: "98",
    label: "Gold List 2024",
    icon: Trophy,
  },
  {
    source: "Forbes Travel Guide",
    score: "5",
    label: "Star Rating",
    icon: Star,
  },
  {
    source: "Michelin Guide",
    score: "3",
    label: "Keys",
    icon: Award,
  },
];

export default function RatingsAndAwards() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-primary text-xs font-semibold uppercase tracking-[0.25em] mb-4"
          >
            Acclaimed Excellence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-light text-foreground mb-4 tracking-tight"
            style={{ fontFamily: 'serif' }}
          >
            Recognized Globally
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-20 h-0.5 bg-linear-to-r from-primary to-purple-500 mx-auto"
          />
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ratings.map((item, index) => (
            <motion.div
              key={item.source}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              {/* Card - Dark Surface with Gold Highlight on Hover */}
              <div className="relative bg-card border border-primary/20 p-8 text-center overflow-hidden transition-all duration-500 hover:border-primary hover:shadow-[0_0_30px_rgba(217,168,108,0.15)] group-hover:-translate-y-1">
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                  className="relative z-10 mb-6 flex justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                  className="relative z-10 mb-3"
                >
                  <div className="text-5xl font-light text-foreground mb-1" style={{ fontFamily: 'serif' }}>
                    {item.score}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold">
                    {item.label}
                  </div>
                </motion.div>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.5, duration: 0.4 }}
                  className="relative z-10 w-12 h-px bg-primary/40 mx-auto mb-4"
                />

                {/* Source */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.6 }}
                  className="relative z-10"
                >
                  <p className="text-sm text-muted-foreground font-light">
                    {item.source}
                  </p>
                </motion.div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Shadow Effect */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-purple-500/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-background/50 backdrop-blur-sm border border-primary/10 rounded-full">
            <div className="flex -space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 fill-primary text-primary"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-light ml-2">
              Rated 5.0 from 2,500+ reviews
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}