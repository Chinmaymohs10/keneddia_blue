import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteContent } from "@/data/siteContent";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingType = searchParams.get("type") || "standard";
  const hotelId = searchParams.get("hotel") || "Kennedia Blu";
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-6"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-serif mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Thank you for choosing Kennedia Blu. A confirmation email has been sent
          to you with all the details.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar navItems={[]} logo={siteContent.brand.logo_hotel} />

      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 pl-0 hover:pl-2 transition-all gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
          {/* Left: Payment Form */}
          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Details
              </h2>

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="0000 0000 0000 0000" maxLength={19} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" maxLength={5} required />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" maxLength={3} required />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground h-12 text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay Now"}
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    Secure Payment by Kennedia SafePay
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="h-fit space-y-6">
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg mb-4">Order Summary</h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Booking Type</span>
                  <span className="font-medium capitalize">{bookingType.replace("-", " ")}</span>
                </div>

                {hotelId && (
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium text-right max-w-[180px]">{hotelId}</span>
                  </div>
                )}

                {checkIn && (
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Dates</span>
                    <span className="font-medium">
                      {new Date(checkIn).toLocaleDateString()} - {checkOut ? new Date(checkOut).toLocaleDateString() : '...'}
                    </span>
                  </div>
                )}

                {guests && (
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>₹12,499</span>
                </div>
                <p className="text-xs text-muted-foreground text-right">*Base price estimate</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
