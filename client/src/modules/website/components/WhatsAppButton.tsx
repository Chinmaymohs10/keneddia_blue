import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppButton() {
  const phoneNumber = "1234567890"; // Replace with actual number
  const message = "Hi! I'm interested in booking a stay.";

  const handleClick = () => {
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 group flex items-center gap-2 overflow-hidden"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100">
        Chat with us
      </span>
    </motion.button>
  );
}
