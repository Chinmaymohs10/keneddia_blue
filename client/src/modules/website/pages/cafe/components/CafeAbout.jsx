import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Loader2, MapPin } from "lucide-react";
import {
  getAboutUsByPropertyType,
  getPropertyTypes,
  getPublicRecognitionsByAboutUsId,
} from "@/Api/Api";

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const mapSection = (section, recognitions = []) => ({
  id: section?.id,
  subTitle: section?.subTitle || "Neighbourhood Cafe",
  sectionTitle: section?.sectionTitle || "Coffee First. Atmosphere Always.",
  description:
    section?.description ||
    "Our cafe concept blends specialty coffee, bakery-led comfort, and softer hospitality.",
  image: section?.media?.find((item) => item?.type === "IMAGE")?.url || "",
  recognitions: recognitions
    .filter((item) => item?.isActive)
    .map((item) => ({
      id: item.id,
      value: item.value,
      title: item.title,
      subTitle: item.subTitle,
      isActive: item.isActive,
    })),
});

export default function CafeAbout({ initialSections }) {
  const ssrLoaded = Array.isArray(initialSections) && initialSections.length > 0;
  const [sections, setSections] = useState(ssrLoaded ? initialSections : []);
  const [loading, setLoading] = useState(!ssrLoaded);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);

  const fetchCafeAboutSections = useCallback(async () => {
    if (ssrLoaded) return;

    try {
      setLoading(true);

      const propertyTypesResponse = await getPropertyTypes();
      const propertyTypes = propertyTypesResponse?.data || propertyTypesResponse;
      const cafeType = Array.isArray(propertyTypes)
        ? propertyTypes.find(
            (type) => type?.isActive && normalize(type?.typeName) === "cafe",
          )
        : null;

      if (!cafeType?.id) {
        setSections([]);
        return;
      }

      const aboutResponse = await getAboutUsByPropertyType(cafeType.id);
      const aboutData = aboutResponse?.data || aboutResponse;
      const activeSections = Array.isArray(aboutData)
        ? aboutData
            .filter((item) => item?.isActive === true && item?.showOnPropertyPage === true)
            .sort((a, b) => b.id - a.id)
            .slice(0, 3)
        : [];

      if (activeSections.length === 0) {
        setSections([]);
        return;
      }

      const recognitionGroups = await Promise.all(
        activeSections.map(async (section) => {
          if (Array.isArray(section?.recognitions) && section.recognitions.length > 0) {
            return section.recognitions;
          }
          try {
            const recognitionResponse = await getPublicRecognitionsByAboutUsId(section.id);
            return recognitionResponse?.data || [];
          } catch {
            return [];
          }
        }),
      );

      const mappedSections = activeSections.map((section, index) =>
        mapSection(section, recognitionGroups[index] || []),
      );

      setSections(mappedSections);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [ssrLoaded]);

  useEffect(() => {
    fetchCafeAboutSections();
  }, [fetchCafeAboutSections]);

  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentIndex]);

  useEffect(() => {
    if (sections.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sections.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [sections.length]);

  useEffect(() => {
    const recognitions = sections[currentIndex]?.recognitions || [];
    if (recognitions.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [currentIndex, sections]);

  const section = sections[currentIndex] || null;
  if (!loading && !section) return null;

  const recognitions = section?.recognitions?.filter((item) => item?.isActive) || [];

  return (
    <section id="about" className="bg-white px-6 py-8 transition-colors duration-500 dark:bg-[#050505]">
      <div className="container mx-auto max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[45%_55%]">
            <motion.div
              key={`about-image-${section.id}`}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/10 shadow-2xl dark:border-white/10">
                {section.image ? (
                  <img src={section.image} alt={section.sectionTitle} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-white/20">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-4 -right-4 h-2/3 w-2/3 rounded-xl border-2 border-primary/20 -z-0" />
              <div className="absolute -left-4 -top-4 h-1/2 w-1/2 rounded-xl bg-zinc-100/80 -z-0 dark:bg-white/5" />
            </motion.div>

            <div className="relative lg:pl-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                      <MapPin className="h-3 w-3" />
                      {section.subTitle}
                    </h3>
                    <h2 className="mb-3 text-3xl font-serif leading-tight text-zinc-900 dark:text-white md:text-4xl">
                      {section.sectionTitle}
                    </h2>
                  </div>

                  <p className="text-base font-light leading-relaxed text-zinc-500 dark:text-white/60">{section.description}</p>

                  {recognitions.length > 0 && (() => {
                    const availabilityItem = recognitions.find((r) =>
                      normalize(r.value).includes("availability"),
                    );
                    const contactItem = recognitions.find((r) =>
                      normalize(r.value).includes("connect") ||
                      normalize(r.value).includes("contact"),
                    );
                    const standardItems = recognitions.filter(
                      (r) =>
                        !normalize(r.value).includes("availability") &&
                        !normalize(r.value).includes("connect") &&
                        !normalize(r.value).includes("contact"),
                    );
                    const hasSpecial = availabilityItem || contactItem;

                    return (
                      <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-white/10">
                        {hasSpecial && (
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                            {availabilityItem && (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-white/40">
                                    {availabilityItem.value}
                                  </span>
                                </div>
                                <p className="flex items-center gap-2 font-serif italic text-lg leading-snug text-[#a6a2b0]">
                                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                                  {availabilityItem.title}
                                </p>
                                {availabilityItem.subTitle && (
                                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/40">
                                    {availabilityItem.subTitle}
                                  </p>
                                )}
                              </div>
                            )}
                            {contactItem && (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-white/40">
                                    {contactItem.value}
                                  </span>
                                </div>
                                <p className="font-serif text-lg leading-snug text-[#a6a2b0]">
                                  {contactItem.title}
                                </p>
                                {contactItem.subTitle && (
                                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/40">
                                    {contactItem.subTitle}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {standardItems.length > 0 && (
                          <>
                            <div className="flex flex-wrap gap-x-10 gap-y-3">
                              {standardItems.map((item, index) => (
                                <button
                                  key={item.id}
                                  onClick={() => setCurrentRecognitionIndex(index)}
                                  className="group flex flex-col gap-0.5 text-left"
                                >
                                  <AnimatePresence mode="wait">
                                    {index === currentRecognitionIndex ? (
                                      <motion.span
                                        key={`active-${item.id}`}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.35 }}
                                        className="text-2xl font-serif font-bold leading-none text-primary md:text-3xl"
                                      >
                                        {item.value}
                                      </motion.span>
                                    ) : (
                                      <motion.span
                                        key={`inactive-${item.id}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-2xl font-serif font-bold leading-none text-zinc-900/40 transition-colors group-hover:text-zinc-900/60 dark:text-white/40 dark:group-hover:text-white/60 md:text-3xl"
                                      >
                                        {item.value}
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                      index === currentRecognitionIndex
                                        ? "text-zinc-500 dark:text-white/60"
                                        : "text-zinc-400 group-hover:text-zinc-500 dark:text-white/30 dark:group-hover:text-white/50"
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                            {standardItems[currentRecognitionIndex]?.subTitle && (
                              <motion.p
                                key={`recognition-copy-${standardItems[currentRecognitionIndex]?.id}`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm leading-relaxed text-zinc-500 dark:text-white/60"
                              >
                                {standardItems[currentRecognitionIndex].subTitle}
                              </motion.p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>

              {sections.length > 1 && (
                <div className="mt-6 flex gap-2">
                  {sections.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? "w-6 bg-primary" : "w-3 bg-zinc-200 hover:bg-primary/50 dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
