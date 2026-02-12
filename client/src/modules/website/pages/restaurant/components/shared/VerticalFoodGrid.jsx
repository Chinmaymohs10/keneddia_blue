import { signatureDishes } from "@/data/restaurantData";
import { motion } from "framer-motion";
import { ChefHat, Sparkles, Clock, Star, Flame, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const VerticalDishCard = ({ dish, index }) => {
  const [imgSrc, setImgSrc] = useState(dish.image || `https://source.unsplash.com/600x450/?${encodeURIComponent(dish.name)},food`);
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const handleImageError = () => {
    const errorCount = imgErrorCount + 1;
    setImgErrorCount(errorCount);
    if (errorCount === 1) {
       setImgSrc(`https://source.unsplash.com/600x450/?${dish.category},food`);
    } else if (errorCount === 2) {
       setImgSrc("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group bg-card rounded-lg overflow-hidden border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Image - Much Smaller Height */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img 
          src={imgSrc}
          alt={dish.name}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Price Badge - Top Right */}
        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold shadow-md">
          {dish.price || "₹349"}
        </div>
      </div>
      
      {/* Content - Very Compact */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Title & Description Combined */}
        <div className="mb-2 flex-grow">
          <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors leading-tight line-clamp-1">
            {dish.name}
          </h3>
          <p className="text-muted-foreground/60 text-[11px] leading-snug line-clamp-1">
            {dish.description || "Crafted with finest ingredients"}
          </p>
        </div>
        
        {/* Quick Info - Single Line */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> 
              <span>20m</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-500" /> 
              <span>Spicy</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> 
            <span>4.8</span>
          </div>
        </div>

        {/* Button - Very Compact */}
        <Button 
          size="sm"
          className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-[11px] py-1.5 h-auto group/btn font-medium"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Order Now
        </Button>
      </div>
    </motion.div>
  );
};

export default function VerticalFoodGrid({ categoryId, title }) {
  const dishes = signatureDishes.filter(d => d.category === categoryId);

  if (dishes.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-sm">Menu items coming soon for this category.</p>
      </div>
    );
  }

  return (
    <section id="vertical-menu" className="py-10 md:py-14 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header - Compact */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium mb-3"
          >
            <ChefHat className="w-3 h-3" />
            <span>Our Menu</span>
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {title} Delicacies
          </h2>
        </div>

        {/* Grid - Optimized Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dishes.map((dish, index) => (
            <VerticalDishCard key={index} dish={dish} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}