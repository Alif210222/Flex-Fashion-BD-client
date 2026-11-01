
import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "8801314638760";

const INITIAL_MESSAGE =
  "Hello Flex-Fashion BD! I am interested in your products. Can you please provide more information?";

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    INITIAL_MESSAGE
  )}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Flex-Fashion BD on WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2.5 rounded-full border border-[#D5E8D7] bg-[#34eb55] px-4 py-3 text-white shadow-[0_5px_20px_rgba(37,211,102,0.25)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(37,211,102,0.35)] sm:bottom-7 sm:right-7 sm:px-5 sm:py-3.5"
    >
      {/* WhatsApp Icon */}
      <MessageCircle
        size={22}
        strokeWidth={2}
        className="shrink-0"
      />

      {/* Desktop Label */}
      <span className="hidden text-sm font-semibold tracking-wide sm:inline">
        Chat with us
      </span>

      {/* Mobile Accessibility */}
      <span className="sr-only">
        Contact us on WhatsApp
      </span>
    </motion.a>
  );
}
