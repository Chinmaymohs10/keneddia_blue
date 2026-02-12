import { motion } from "framer-motion";
import { Star, Shield, Award, Clock, CheckCircle2 } from "lucide-react";

export default function TrustSection() {
  const rating = 4.8;
  const totalReviews = 2847;

  const testimonials = [
    {
      text: "Exceptional service and beautiful rooms. The staff went above and beyond!",
      author: "Priya S.",
      rating: 5,
    },
    {
      text: "Best hotel experience in years. Clean, comfortable, and great location.",
      author: "Rajesh K.",
      rating: 5,
    },
  ];

  const whyChooseUs = [
    { icon: Shield, text: "100% Secure Booking" },
    { icon: Award, text: "Award-Winning Service" },
    { icon: Clock, text: "24/7 Customer Support" },
    { icon: CheckCircle2, text: "Best Price Guarantee" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Overall Rating */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-serif font-semibold text-foreground">
            Guest Rating
          </h3>
          <div className="text-right">
            <p className="text-2xl font-serif font-bold text-primary">{rating}</p>
            <p className="text-xs text-muted-foreground">out of 5</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${star <= Math.floor(rating)
                  ? "fill-yellow-500 text-yellow-500"
                  : star - 0.5 <= rating
                    ? "fill-yellow-500/50 text-yellow-500"
                    : "text-muted"
                }`}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Based on {totalReviews.toLocaleString()} verified reviews
        </p>
      </div>

      {/* Testimonials */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-serif font-semibold text-foreground mb-3">
          What Guests Say
        </h3>
        <div className="space-y-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="pb-3 last:pb-0 border-b last:border-b-0 border-border"
            >
              <div className="flex items-center gap-1 mb-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= testimonial.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">
                "{testimonial.text}"
              </p>
              <p className="text-xs font-medium text-foreground">
                — {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-serif font-semibold text-foreground mb-3">
          Why Choose Us
        </h3>
        <div className="space-y-2.5">
          {whyChooseUs.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 text-center">
        <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
          Safe & Secure
        </p>
        <p className="text-xs text-muted-foreground">
          Your booking is protected with industry-leading security
        </p>
      </div>
    </motion.div>
  );
}
