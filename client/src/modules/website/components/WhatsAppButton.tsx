import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllWhatsAppInfo } from "@/Api/utilsApi";
import { getPropertyTypes } from "@/Api/Api";

export default function WhatsAppButton() {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Do not show on superadmin pages
  const isSuperAdmin = [
    "/WineManagement", "/Utils", "/Properties", "/Location", 
    "/ManageUsers", "/Seo", "/Dashboard", "/Analytics", "/Reports",
    "/Hotel", "/Cafe", "/Restaurant", "/WineDine"
  ].some(path => pathname.startsWith(path));

  if (isSuperAdmin) return null;

  // 1. Fetch all WhatsApp Info
  const { data: whatsappInfos } = useQuery({
    queryKey: ["whatsapp-info"],
    queryFn: async () => {
      const res = await getAllWhatsAppInfo();
      const data = res?.data?.data || res?.data || res || [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch Property Types to match names with URL
  const { data: propertyTypes } = useQuery({
    queryKey: ["property-types"],
    queryFn: async () => {
      const res = await getPropertyTypes();
      const data = res?.data?.data || res?.data || res || [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // 3. Extract propertyId from URL (pattern: /city/slug-ID)
  // Matches /any-city/any-slug-123
  const propertyIdMatch = pathname.match(/\/([^/]+)\/[^/]+-(\d+)\/?$/);
  const propertyId = propertyIdMatch ? Number(propertyIdMatch[2]) : null;

  // 4. Determine propertyTypeId from URL
  let detectedPropertyTypeId = null;
  if (propertyTypes && propertyTypes.length > 0) {
    const type = propertyTypes.find((pt) => {
      const typeName = (pt.typeName || pt.name || "").toLowerCase();
      // Match homepage routes like /hotels, /cafe-homepage, etc.
      return pathname.toLowerCase().includes(typeName);
    });
    if (type) detectedPropertyTypeId = type.id;
  }

  // 5. Select WhatsApp info based strictly on current context (No Fallback)
  const allInfos = whatsappInfos || [];
  let targetInfo = null;

  // Determine the current context
  const isPropertyPage = !!propertyId;
  const isTypeHomepage = !!detectedPropertyTypeId && !isPropertyPage;
  const isMainContext = !isPropertyPage && !isTypeHomepage;

  if (isPropertyPage) {
    // Only show if there's a specific entry for this property
    const entry = allInfos.find((i: any) => Number(i.propertyId) === propertyId);
    if (entry?.active) targetInfo = entry;
  } else if (isTypeHomepage) {
    // Only show if there's a specific entry for this property type
    const entry = allInfos.find((i: any) => Number(i.propertyTypeId) === detectedPropertyTypeId && !i.propertyId);
    if (entry?.active) targetInfo = entry;
  } else if (isMainContext) {
    // Show the global/main entry on other pages (homepage, about, etc.)
    const entry = allInfos.find((i: any) => !i.propertyId && !i.propertyTypeId);
    if (entry?.active) targetInfo = entry;
  }

  if (!targetInfo) return null;

  const handleClick = () => {
    const phoneNumber = targetInfo.phoneNumber.replace(/\s+/g, "");
    const message = targetInfo.description || "Hi! I'm interested in booking a stay.";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <AnimatePresence>
      <motion.button
        key={targetInfo.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={handleClick}
        className="fixed bottom-6 left-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 group flex items-center gap-2 overflow-hidden"
        title={targetInfo.title || "Chat with us on WhatsApp"}
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100">
          {targetInfo.title || "Chat with us"}
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
