import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateReservationForm } from "@/lib/validation/reservationValidation";

const FALLBACK = {
  header1: "Reserve Your",
  header2: "Cafe Table.",
  description:
    "Set your time, confirm the details, and let the cafe experience be ready when you arrive.",
  footer: "Guaranteed Response within 24 Hours • Call +91-9211308384",
};

const EMPTY_FORM = {
  guestName: "",
  contactNumber: "",
  date: "",
  time: "",
  totalGuest: "",
};

export default function CafeReservationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const containerRef = useRef(null);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["10%", "-20%"]);
  const formY = useTransform(scrollYProgress, [0, 1], ["50px", "-100px"]);
  const smoothFormY = useSpring(formY, { stiffness: 100, damping: 30 });

  const handleNext = () => {
    const errs = validateReservationForm(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setCurrentStep(3);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setSubmitError(null);
    setCurrentStep(1);
  };

  return (
    <section
      ref={containerRef}
      id="reservation"
      className="relative py-4 bg-[#EFEFEB] dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[400px]"
    >
      <motion.div
        style={{ x: bgTextX }}
        className="absolute top-1/4 left-0 whitespace-nowrap text-[12rem] md:text-[15rem] font-black text-zinc-900/[0.03] dark:text-white/[0.02] pointer-events-none select-none italic uppercase z-0"
      >
        Cafe Reservations Table Booking Experience
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/3 lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.5em]">
                Primary Conversion
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white leading-none mb-8 transition-colors">
              {FALLBACK.header1} <br />
              <span className="italic text-zinc-400 dark:text-white/30">
                {FALLBACK.header2}
              </span>
            </h2>
            <p className="text-zinc-600 dark:text-white/50 text-lg leading-relaxed font-light mb-8 transition-colors">
              {FALLBACK.description}
            </p>
            <div className="h-1 w-20 bg-primary/30" />
          </div>

          <motion.div style={{ y: smoothFormY }} className="lg:w-2/3 w-full">
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-3xl">
              {currentStep < 3 && (
                <div className="flex gap-2 mb-12">
                  {[1, 2].map((step) => (
                    <div
                      key={step}
                      className="flex-1 h-1 bg-zinc-200 dark:bg-white/10 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-primary"
                        initial={false}
                        animate={{ x: currentStep >= step ? "0%" : "-100%" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-zinc-900 dark:text-white font-serif text-2xl mb-8 italic opacity-60">
                        Tell us about your visit
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest text-primary">
                            Guest Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={formData.guestName}
                            onChange={(e) => setField("guestName", e.target.value)}
                            className={`bg-zinc-100/50 dark:bg-white/5 rounded-xl h-14 transition-all focus:ring-primary ${errors.guestName ? "border-red-500 focus:ring-red-400" : "border-zinc-200 dark:border-white/10"}`}
                            placeholder="Full Name (letters only)"
                          />
                          {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest text-primary">
                            Contact Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="tel"
                            maxLength={10}
                            value={formData.contactNumber}
                            onChange={(e) => setField("contactNumber", e.target.value.replace(/\D/g, ""))}
                            className={`bg-zinc-100/50 dark:bg-white/5 rounded-xl h-14 transition-all focus:ring-primary ${errors.contactNumber ? "border-red-500 focus:ring-red-400" : "border-zinc-200 dark:border-white/10"}`}
                            placeholder="10-digit mobile number"
                          />
                          {errors.contactNumber && <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest text-primary">
                            Select Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={formData.date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setField("date", e.target.value)}
                            className={`bg-zinc-100/50 dark:bg-white/5 rounded-xl h-14 dark:text-white ${errors.date ? "border-red-500" : "border-zinc-200 dark:border-white/10"}`}
                          />
                          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest text-primary">
                            Select Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setField("time", e.target.value)}
                            className={`bg-zinc-100/50 dark:bg-white/5 rounded-xl h-14 dark:text-white ${errors.time ? "border-red-500" : "border-zinc-200 dark:border-white/10"}`}
                          />
                          {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest text-primary">
                            Total Guests <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="500"
                            value={formData.totalGuest}
                            onChange={(e) => setField("totalGuest", e.target.value)}
                            className={`bg-zinc-100/50 dark:bg-white/5 rounded-xl h-14 dark:text-white ${errors.totalGuest ? "border-red-500" : "border-zinc-200 dark:border-white/10"}`}
                            placeholder="1"
                          />
                          {errors.totalGuest && <p className="text-xs text-red-500 mt-1">{errors.totalGuest}</p>}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleNext}
                        className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white transition-all rounded-xl uppercase text-xs font-black"
                      >
                        Review & Confirm
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-zinc-900 dark:text-white font-serif text-2xl mb-8 italic opacity-60">
                        Confirm your details
                      </h3>

                      <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                        {[
                          { label: "Guest Name", value: formData.guestName },
                          {
                            label: "Contact",
                            value: formData.contactNumber,
                          },
                          { label: "Date", value: formData.date },
                          { label: "Time", value: formData.time },
                          {
                            label: "Total Guests",
                            value: formData.totalGuest,
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between"
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {label}
                            </span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-white">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-zinc-500 dark:text-white/40 text-xs italic">
                        By confirming, you are sending a reservation request. We
                        will contact you via phone to finalize.
                      </p>

                      {submitError && (
                        <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          {submitError}
                        </p>
                      )}

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="h-14 px-8 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-xl"
                        >
                          Modify
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 h-14 bg-primary text-white hover:bg-primary/90 transition-all rounded-xl uppercase text-xs font-black shadow-lg shadow-primary/20"
                        >
                          {isSubmitting ? "Sending..." : "Confirm My Table"}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center py-8 space-y-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.1,
                        }}
                      >
                        <CheckCircle2
                          className="w-20 h-20 text-primary"
                          strokeWidth={1.5}
                        />
                      </motion.div>

                      <div className="space-y-3">
                        <h3 className="text-zinc-900 dark:text-white font-serif text-3xl">
                          Request <span className="italic text-primary">Received!</span>
                        </h3>
                        <p className="text-zinc-500 dark:text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                          Thank you,{" "}
                          <strong className="text-zinc-700 dark:text-white">
                            {formData.guestName}
                          </strong>
                          . Your cafe reservation for{" "}
                          <strong className="text-zinc-700 dark:text-white">
                            {formData.totalGuest} guest
                            {Number(formData.totalGuest) !== 1 ? "s" : ""}
                          </strong>{" "}
                          on{" "}
                          <strong className="text-zinc-700 dark:text-white">
                            {formData.date}
                          </strong>{" "}
                          at{" "}
                          <strong className="text-zinc-700 dark:text-white">
                            {formData.time}
                          </strong>{" "}
                          has been requested. We will reach you at{" "}
                          <strong className="text-zinc-700 dark:text-white">
                            {formData.contactNumber}
                          </strong>{" "}
                          for final confirmation.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-bold text-primary underline underline-offset-4 hover:opacity-70 transition-opacity"
                      >
                        Make another reservation
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {currentStep < 3 && (
                <div className="absolute top-12 right-12 text-zinc-900/5 dark:text-white/5 text-8xl font-black italic select-none">
                  0{currentStep}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-20 flex flex-col items-center">
          <p className="text-zinc-400 dark:text-white/20 text-[9px] uppercase tracking-[0.5em] font-bold">
            {FALLBACK.footer}
          </p>
        </div>
      </div>
    </section>
  );
}
