import { motion } from "framer-motion";
import { Receipt, ArrowRight } from "lucide-react";

interface PricingBreakdownProps {
  basePrice: number;
  nights?: number;
  onProceed?: () => void;
}

export default function PricingBreakdown({
  basePrice,
  nights = 1,
  onProceed,
}: PricingBreakdownProps) {
  // Pricing calculations
  const baseAmount = basePrice * nights;
  const gst = baseAmount * 0.18; // 18% GST
  const serviceCharge = baseAmount * 0.1; // 10% service charge
  const total = baseAmount + gst + serviceCharge;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <Receipt className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-serif font-semibold text-foreground">
          Pricing Breakdown
        </h3>
      </div>

      {/* Pricing Details */}
      <div className="space-y-4 mb-6">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-foreground">Base Price</p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(basePrice)} × {nights} {nights === 1 ? "night" : "nights"}
            </p>
          </div>
          <p className="text-base font-medium text-foreground">
            {formatPrice(baseAmount)}
          </p>
        </div>

        {/* GST */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-foreground">GST</p>
            <p className="text-xs text-muted-foreground">18% of base amount</p>
          </div>
          <p className="text-base font-medium text-foreground">
            {formatPrice(gst)}
          </p>
        </div>

        {/* Service Charge */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-foreground">Service Charge</p>
            <p className="text-xs text-muted-foreground">10% of base amount</p>
          </div>
          <p className="text-base font-medium text-foreground">
            {formatPrice(serviceCharge)}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-border mb-6">
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold text-foreground uppercase tracking-wide">
            Total Amount
          </p>
          <p className="text-2xl font-serif font-bold text-primary">
            {formatPrice(total)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Including all taxes and charges
        </p>
      </div>

      {/* Proceed Button */}
      {onProceed && (
        <button
          onClick={onProceed}
          className="w-full px-6 py-4 bg-primary text-primary-foreground font-bold tracking-widest rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Free cancellation up to 24 hours before check-in
        </p>
      </div>
    </motion.div>
  );
}
