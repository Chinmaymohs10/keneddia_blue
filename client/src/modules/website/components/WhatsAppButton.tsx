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
    "/Hotel", "/Cafe", "/Restaurant", "/WineDine", "/Homepage-Dashboard"
  ].some(path => pathname.toLowerCase().startsWith(path.toLowerCase()))
    || /^\/[A-Z]/.test(pathname); // Convention: Admin routes start with Capital letter

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
        <svg viewBox="0 0 32 32" fill="currentColor" className="w-6 h-6">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.663 4.882 1.818 6.932L2 30l7.302-1.784A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.892-1.607l-.422-.25-4.333 1.059 1.098-4.205-.275-.434A11.543 11.543 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 27.6zm6.344-8.656c-.347-.174-2.055-1.014-2.375-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.362-.202.232-.405.26-.752.086-.347-.174-1.464-.539-2.788-1.719-1.031-.917-1.726-2.05-1.929-2.397-.202-.347-.022-.534.152-.706.156-.155.347-.405.52-.607.174-.202.232-.347.347-.579.116-.232.058-.434-.029-.607-.087-.174-.784-1.89-1.074-2.59-.283-.68-.57-.588-.784-.598-.202-.01-.434-.012-.666-.012-.232 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.174.231 2.449 3.738 5.934 5.24.83.358 1.477.572 1.982.732.832.265 1.59.228 2.188.138.667-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.231-.665-.405z" />
        </svg>
        <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100">
          {targetInfo.title || "Chat with us"}
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
