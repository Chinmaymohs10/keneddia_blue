import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function VerticalAbout({ title, description, features = [] }) {
  return (
    <section className="py-10 md:py-14 bg-muted/20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium"
            >
              <Sparkles className="w-3 h-3" />
              <span>Our Story</span>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              About Our {title}
            </h2>

            {/* Description */}
            <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed">
              {description}
            </p>
            
            {/* Features List - Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-2 group"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs md:text-sm text-foreground/70 font-medium leading-tight">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            {/* Main Image Container */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <img 
                src={`https://source.unsplash.com/800x600/?${encodeURIComponent(title)},interior,restaurant`} 
                alt={`${title} Ambiance`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Decorative Border - Subtle */}
            <div className="absolute -bottom-3 -right-3 z-[-1] w-full h-full border border-primary/10 rounded-xl transition-all duration-300 group-hover:border-primary/20 group-hover:-bottom-4 group-hover:-right-4" />
            
            {/* Floating Badge */}
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-md">
              <span className="text-xs font-semibold text-foreground">Premium Experience</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}