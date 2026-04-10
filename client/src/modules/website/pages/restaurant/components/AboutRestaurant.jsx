import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import {
  getAboutUsByPropertyType,
  getPropertyTypes,
  getPublicRecognitionsByAboutUsId,
} from "@/Api/Api";

const FALLBACK_SECTIONS = [
  {
    id: 1,
    subTitle: "Ghaziabad Destination",
    sectionTitle: "A Symphony of Fine Flavors",
    description:
      "We believe dining is more than just a meal. It is a curated premium experience designed to ground you in the moment. Our philosophy balances bold Indian tradition with refined global favorites in a thoughtfully designed setting.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
    recognitions: [
      {
        id: 1,
        value: "11 AM",
        title: "Opens Daily",
        subTitle: "Serving guests every day from morning to night",
        isActive: true,
      },
      {
        id: 2,
        value: "INR899",
        title: "Lunch Buffet",
        subTitle: "Grand spread served daily from 12 PM to 4 PM",
        isActive: true,
      },
      {
        id: 3,
        value: "BYOB",
        title: "Premium Setting",
        subTitle: "Bring your own bottle with a curated dining ambience",
        isActive: true,
      },
    ],
  },
  {
    id: 2,
    subTitle: "Signature Experience",
    sectionTitle: "Where Heritage Meets Modern Craft",
    description:
      "Our chefs blend age-old recipes with contemporary presentation. Each visit becomes a story written with seasonal produce, refined technique, and signature hospitality.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
    recognitions: [
      {
        id: 4,
        value: "50+",
        title: "Menu Items",
        subTitle: "Rotating seasonal specials added regularly",
        isActive: true,
      },
      {
        id: 5,
        value: "4.8",
        title: "Guest Rating",
        subTitle: "Consistently rated highly across platforms",
        isActive: true,
      },
      {
        id: 6,
        value: "15yr",
        title: "Legacy",
        subTitle: "Serving guests with established culinary expertise",
        isActive: true,
      },
    ],
  },
];

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const mapSection = (section, recognitions = []) => ({
  id: section?.id,
  subTitle: section?.subTitle || "Restaurant Experience",
  sectionTitle: section?.sectionTitle || "Dining With Signature Hospitality",
  description:
    section?.description ||
    "Curated dining experience with signature hospitality and thoughtfully designed spaces.",
  image:
    section?.media?.find((item) => item?.type === "IMAGE")?.url ||
    FALLBACK_SECTIONS[0].image,
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

export default function AboutRestaurant({ initialSections }) {
  const ssrLoaded = Array.isArray(initialSections) && initialSections.length > 0;
  const [sections, setSections] = useState(ssrLoaded ? initialSections : FALLBACK_SECTIONS);
  const [loading, setLoading] = useState(!ssrLoaded);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);

  const fetchRestaurantAboutSections = useCallback(async () => {
    if (ssrLoaded) return;
    try {
      setLoading(true);

      const propertyTypesResponse = await getPropertyTypes();
      const propertyTypes = propertyTypesResponse?.data || propertyTypesResponse;
      const restaurantType = Array.isArray(propertyTypes)
        ? propertyTypes.find(
            (type) => type?.isActive && normalize(type?.typeName) === "restaurant",
          )
        : null;

      if (!restaurantType?.id) {
        setSections(FALLBACK_SECTIONS);
        return;
      }

      const aboutResponse = await getAboutUsByPropertyType(restaurantType.id);
      const aboutData = aboutResponse?.data || aboutResponse;
      const activeSections = Array.isArray(aboutData)
        ? aboutData
            .filter((item) => item?.isActive === true && item?.showOnPropertyPage === true)
            .sort((a, b) => b.id - a.id)
            .slice(0, 3)
        : [];

      if (activeSections.length === 0) {
        setSections(FALLBACK_SECTIONS);
        return;
      }

      const recognitionGroups = await Promise.all(
        activeSections.map(async (section) => {
          if (Array.isArray(section?.recognitions) && section.recognitions.length > 0) {
            return section.recognitions;
          }

          try {
            const recognitionResponse = await getPublicRecognitionsByAboutUsId(
              section.id,
            );
            return recognitionResponse?.data || [];
          } catch (error) {
            console.error(
              `Failed to load recognitions for about section ${section.id}`,
              error,
            );
            return [];
          }
        }),
      );

      const mappedSections = activeSections.map((section, index) =>
        mapSection(section, recognitionGroups[index] || []),
      );

      setSections(mappedSections.length > 0 ? mappedSections : FALLBACK_SECTIONS);
    } catch (error) {
      console.error("Failed to load restaurant about sections", error);
      setSections(FALLBACK_SECTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurantAboutSections();
  }, [fetchRestaurantAboutSections]);

  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentIndex]);

  useEffect(() => {
    if (sections.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sections.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [sections]);

  useEffect(() => {
    const recognitions = sections[currentIndex]?.recognitions || [];
    if (recognitions.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [currentIndex, sections]);

  const activeSection = sections[currentIndex] || FALLBACK_SECTIONS[0];
  const recognitions =
    activeSection?.recognitions?.filter((item) => item?.isActive) || [];

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
              key={`about-image-${activeSection.id}`}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/10 shadow-2xl dark:border-white/10">
                <img
                  src={activeSection.image}
                  alt={activeSection.sectionTitle}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 h-2/3 w-2/3 rounded-xl border-2 border-primary/20 -z-0" />
              <div className="absolute -left-4 -top-4 h-1/2 w-1/2 rounded-xl bg-zinc-100/80 -z-0 dark:bg-white/5" />
            </motion.div>

            <div className="relative lg:pl-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                      <MapPin className="h-3 w-3" />
                      {activeSection.subTitle}
                    </h3>
                    <h2 className="mb-3 text-3xl font-serif leading-tight text-zinc-900 dark:text-white md:text-4xl">
                      {activeSection.sectionTitle}
                    </h2>
                  </div>

                  <p className="text-base font-light leading-relaxed text-zinc-500 dark:text-white/60">
                    {activeSection.description}
                  </p>

                  {recognitions.length > 0 && (
                    <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-white/10">
                      <div className="flex flex-wrap gap-x-10 gap-y-3">
                        {recognitions.map((item, index) => (
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

                      {recognitions[currentRecognitionIndex]?.subTitle && (
                        <motion.p
                          key={`recognition-copy-${recognitions[currentRecognitionIndex]?.id}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm leading-relaxed text-zinc-500 dark:text-white/60"
                        >
                          {recognitions[currentRecognitionIndex].subTitle}
                        </motion.p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {sections.length > 1 && (
                <div className="mt-6 flex gap-2">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-6 bg-primary"
                          : "w-3 bg-zinc-200 hover:bg-primary/50 dark:bg-white/10"
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
