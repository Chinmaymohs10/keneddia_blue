import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <motion.div
      key="page-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div
            className="absolute inset-[6px] rounded-full border border-transparent border-t-primary/50 animate-spin"
            style={{ animationDuration: "0.75s", animationDirection: "reverse" }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
            Please wait
          </p>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-primary/50 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
