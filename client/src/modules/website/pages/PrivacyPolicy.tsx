import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Mail, Phone, ChevronRight } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getAllPolicyPages } from "@/Api/policypagesapi";

const PRIVACY_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "/" },
  { type: "link", label: "CONTENTS", key: "policy-content", href: "#policy-content" },
];

export default function PrivacyPolicy() {
  const [policyData, setPolicyData] = useState<any>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchPolicyPage = async () => {
      try {
        const res = await getAllPolicyPages();
        const data = res?.data;
        const allItems = Array.isArray(data) ? data : data ? [data] : [];
        const privacyItem =
          allItems
            .filter((item) => item?.showOnPrivacyPolicy === true)
            .sort((a, b) => (b?.id || 0) - (a?.id || 0))[0] || null;
        setPolicyData(privacyItem);
      } catch (error) {
        console.error("Failed to fetch privacy policy page", error);
        setPolicyData(null);
      }
    };

    fetchPolicyPage();
  }, []);

  const sourceSections = Array.isArray(policyData?.sections) ? policyData.sections : [];

  const responseSections = sourceSections
    .filter((section) => section?.active !== false)
    .sort((a, b) => (a?.sequence || 0) - (b?.sequence || 0))
    .map((section, index) => ({
      id: section?.id ? `response-${section.id}` : `response-${index + 1}`,
      num: String(index + 1).padStart(2, "0"),
      title: section?.title || `Section ${index + 1}`,
      items: [{ text: section?.description || "" }],
      callout: section?.highlightTextDescription || section?.highlightText || "",
    }));

  const titleWords = (policyData?.mainTitle || "").trim().split(/\s+/).filter(Boolean);
  const heroTitle = titleWords[0] || "--";
  const heroHighlight = policyData?.highlightTextDescription || titleWords.slice(1).join(" ") || "--";
  const heroDescription = policyData?.mainDescription || "--";
  const effectiveDate = policyData?.effectiveDate || "--";
  const lastUpdated = policyData?.lastUpdated || "--";
  const version = policyData?.version || "--";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top),
          );

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const index = sectionRefs.current.findIndex((ref) => ref === topEntry.target);
          if (index !== -1) setActiveIdx(index);
        }
      },
      { root: null, rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [responseSections.length]);

  const scrollToSection = (i: number) => {
    const target = sectionRefs.current[i];
    if (!target) return;
    const offset = 100;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = target.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Navbar navItems={PRIVACY_NAV_ITEMS} />

      <section id="policy-overview" className="relative min-h-[52vh] md:min-h-[60vh] pt-24 md:pt-32 pb-14 md:pb-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white dark:to-[#0A0A0A] z-10" />
          <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2000" alt="Data Security" className="w-full h-full object-cover" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-navy/30 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-serif text-white mb-5 md:mb-6 leading-[0.95] md:leading-[0.9]">
              {heroTitle} <br />
              <span className="text-primary italic font-light drop-shadow-lg">{heroHighlight}</span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10 drop-shadow-md px-2 sm:px-0">
              {heroDescription}
            </motion.p>
            <motion.div initial={{ width: 0 }} animate={{ width: "100px" }} transition={{ delay: 0.6, duration: 0.8 }} className="h-1 bg-primary mx-auto mb-10" />
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm text-white/90 dark:text-white font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />Effective: {effectiveDate}</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />Updated: {lastUpdated}</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />Version: {version}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="policy-content" className="py-14 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
            <div className="lg:hidden">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Table of Contents</p>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {responseSections.map((sec, i) => (
                  <button key={`mobile-${sec.id}`} onClick={() => scrollToSection(i)} className={`shrink-0 flex items-center gap-2 text-left px-3 py-2 rounded-lg transition-all duration-300 ${activeIdx === i ? "bg-primary/10 text-primary border border-primary/20" : "text-gray-500 border border-gray-200 dark:border-white/10"}`}>
                    <span className="text-[10px] font-bold">{sec.num}</span>
                    <span className="text-xs font-medium whitespace-nowrap">{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Table of Contents</p>
                {responseSections.map((sec, i) => (
                  <button key={sec.id} onClick={() => scrollToSection(i)} className={`group flex items-center gap-4 w-full text-left p-3 rounded-xl transition-all duration-300 ${activeIdx === i ? "bg-primary/5 text-primary shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                    <span className={`text-[10px] font-bold ${activeIdx === i ? "text-primary" : "text-gray-300 dark:text-gray-700"}`}>{sec.num}</span>
                    <span className="text-sm font-medium flex-1 truncate">{sec.title}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeIdx === i ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                  </button>
                ))}
              </div>
            </aside>

            <main className="lg:w-3/4 space-y-8 md:space-y-12 pb-16 md:pb-32">
              {responseSections.map((sec, i) => (
                <div key={sec.id} ref={(el) => (sectionRefs.current[i] = el)} className="scroll-mt-32">
                  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                      <span className="text-3xl md:text-4xl font-serif text-primary/30 dark:text-primary/50">{sec.num}</span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-navy dark:text-white">{sec.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:gap-4 my-6 md:my-8">
                      {sec.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="p-4 sm:p-5 md:p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/20 transition-all duration-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mb-4" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                    {sec.callout && (
                      <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-primary/5 border-l-4 border-primary mt-6 md:mt-8">
                        <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">{sec.callout}</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </main>
          </div>
        </div>
      </section>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
