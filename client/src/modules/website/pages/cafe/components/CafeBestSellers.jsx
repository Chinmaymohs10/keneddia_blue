import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  ImageOff,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMenuItemsByTopSold, addItemLike, getMenuSectionsByPropertyTypeId } from "@/Api/RestaurantApi";

const FILTERS = ["Hot Brews", "Cold Brews"];

const toCafeTag = (item) => {
  const name = (item.itemName || "").toLowerCase();
  const typeName = (item.type?.typeName || "").toLowerCase();
  const catName = (item.verticalCardResponseDTO?.verticalName || "").toLowerCase();
  
  if (name.includes("cold") || name.includes("ice") || name.includes("frappe") || typeName.includes("cold") || catName.includes("cold")) {
    return "Cold Brews";
  }
  return "Hot Brews";
};

const normalize = (item) => ({
  id: item.id,
  title: item.itemName,
  description: item.description || "",
  image: item.image?.url || item.media?.url || "",
  tags: [toCafeTag(item), "Best Seller"],
  category: item.type?.typeName || item.verticalCardResponseDTO?.verticalName || "Cafe Signature",
  likes: item.likeCount || 0,
});

function CoffeeImage({ src, alt }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100">
        <ImageOff size={32} className="text-zinc-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(Math.floor(target * 0.8));

  useEffect(() => {
    let current = Math.floor(target * 0.8);
    const increment = Math.max(1, Math.ceil((target - current) / 40));
    const timer = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        window.clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 20);

    return () => window.clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
}

export default function CafeBestSellers({ initialItems, cafeTypeId }) {
  const ssrLoaded = Array.isArray(initialItems) && initialItems.length > 0;
  const [activeFilter, setActiveFilter] = useState("Hot Brews");
  const [expanded, setExpanded] = useState(false);
  const [menuItems, setMenuItems] = useState(ssrLoaded ? initialItems : []);
  const [fetchLoading, setFetchLoading] = useState(!ssrLoaded);
  const [likedItems, setLikedItems] = useState({});
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const [likeModal, setLikeModal] = useState({
    isOpen: false,
    item: null,
  });
  const [likeForm, setLikeForm] = useState({
    name: "",
    phone: "",
    description: "",
  });
  const [headerData, setHeaderData] = useState(null);

  useEffect(() => {
    if (!cafeTypeId) return;
    getMenuSectionsByPropertyTypeId(cafeTypeId)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const activeHeader = data.find((h) => h.isActive);
          if (activeHeader) setHeaderData(activeHeader);
          else if (data.length > 0) setHeaderData(data[0]);
        } else if (data) {
          setHeaderData(data);
        }
      })
      .catch((err) => console.error(err));
  }, [cafeTypeId]);

  useEffect(() => {
    if (ssrLoaded) return;
    getMenuItemsByTopSold(true)
      .then((res) => {
        const data = res.data ?? [];
        setMenuItems(
          (Array.isArray(data) ? data : [])
            .filter((item) => {
              return cafeTypeId != null && Number(item?.propertyTypeId) === Number(cafeTypeId);
            })
            .map(normalize)
        );
      })
      .catch(() => setMenuItems([]))
      .finally(() => setFetchLoading(false));
  }, [ssrLoaded, cafeTypeId]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.tags.includes(activeFilter));
  }, [activeFilter, menuItems]);

  const primaryItems = filteredItems.slice(0, 4);
  const extraItems = filteredItems.slice(4);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setExpanded(false);
  };

  const handleLikeSubmit = async () => {
    if (!likeModal.item) return;
    setLikeSubmitting(true);
    try {
      const res = await addItemLike(likeModal.item.id, {
        name: likeForm.name,
        mobileNumber: likeForm.phone,
        description: likeForm.description || "Loved it!",
      });
      const updated = res?.data || res;
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === likeModal.item.id
            ? { ...item, likes: updated.totalLikeCount ?? item.likes + 1 }
            : item,
        ),
      );
      setLikedItems((prev) => ({ ...prev, [likeModal.item.id]: true }));
      toast.success("Thanks for liking this coffee.");
    } catch {
      setLikedItems((prev) => ({ ...prev, [likeModal.item.id]: true }));
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLikeModal({ isOpen: false, item: null });
      setLikeForm({ name: "", phone: "", description: "" });
      setLikeSubmitting(false);
    }
  };

  const closeLikeModal = () => {
    setLikeModal({ isOpen: false, item: null });
    setLikeForm({ name: "", phone: "", description: "" });
    setLikeSubmitting(false);
  };

  const renderCard = (item, index, keyPrefix = "") => (
    <motion.div
      key={`${keyPrefix}${item.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex cursor-pointer flex-col items-center rounded-[2.5rem] border border-zinc-100 bg-zinc-50 p-8 text-center"
    >
      <div className="relative -mt-24 mb-4 aspect-square w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-xl transition-transform duration-700 group-hover:scale-105">
        <CoffeeImage src={item.image} alt={item.title} />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setLikeModal({ isOpen: true, item });
          }}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-primary shadow-md backdrop-blur-md transition-transform hover:scale-110"
          aria-label={`Like ${item.title}`}
        >
          <Heart
            size={18}
            className={likedItems[item.id] ? "fill-primary" : ""}
          />
        </button>
      </div>

      <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
        {item.category}
      </span>

      <div className="flex w-full flex-col items-center">
        <h3 className="mb-2 text-2xl font-serif leading-tight text-zinc-900">
          {item.title}
        </h3>

        {item.description && (
          <p className="mb-3 line-clamp-2 text-[13px] italic leading-snug text-zinc-500">
            "{item.description}"
          </p>
        )}

        <div className="flex items-center justify-center gap-1.5 text-primary">
          <Heart size={14} className="fill-primary" />
          <span className="text-sm font-black">
            <AnimatedCounter target={item.likes} />+
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="bg-[#EFEFEB] pb-2 pt-16 dark:bg-[#050505]">
      <div className="mx-auto max-w-[1400px] px-6 text-left md:px-12">
        <div className="mb-20 flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="min-w-0 flex-1 lg:max-w-[80%]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Cafe Menu Spotlight
            </div>

            <h2 className="mb-2 text-3xl font-serif md:text-4xl">
              {headerData ? headerData.part1 : "Best Seller"}{" "}
              <span className="italic text-primary">{headerData ? headerData.part2 : "Coffee Menu"}</span>
            </h2>

            <div className="w-full md:max-w-[80%]">
              <p className="text-sm font-light leading-relaxed text-zinc-500 whitespace-pre-line">
                {headerData ? headerData.description : "The restaurant bestseller layout is reused here exactly in spirit,\nbut tuned for cafe categories, coffee language, and brew-led\nhighlights."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === filter
                    ? filter === "Hot Brews"
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-sky-400 bg-white text-sky-500"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p className="font-medium">No top selling items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-20 pt-16 md:grid-cols-2 lg:grid-cols-4">
            {primaryItems.map((item, index) => renderCard(item, index))}
          </div>
        )}

        {!fetchLoading && extraItems.length > 0 && (
          <div className="px-5 pb-5 pt-8 lg:px-0 lg:pb-6">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
              >
                {expanded ? "Show Less" : `Show More (${extraItems.length})`}
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-20 md:grid-cols-2 lg:grid-cols-4">
                    {extraItems.map((item, index) =>
                      renderCard(item, index, "extra-"),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {likeModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-zinc-100 bg-white p-10 text-left shadow-2xl"
            >
              <button
                type="button"
                onClick={closeLikeModal}
                className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100"
              >
                <X size={20} />
              </button>

              <h3 className="mb-2 text-2xl font-serif text-zinc-900">
                Show your love
              </h3>
              <p className="mb-6 text-xs italic text-zinc-500">
                Share your details to like {likeModal.item?.title || "this coffee"}.
              </p>

              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={likeForm.name}
                  onChange={(event) =>
                    setLikeForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="h-14 rounded-2xl border-none bg-zinc-50 shadow-sm"
                />
                <Input
                  placeholder="Phone Number"
                  value={likeForm.phone}
                  onChange={(event) =>
                    setLikeForm((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  className="h-14 rounded-2xl border-none bg-zinc-50 shadow-sm"
                />
                <Input
                  placeholder="Leave a comment"
                  value={likeForm.description}
                  onChange={(event) =>
                    setLikeForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="h-14 rounded-2xl border-none bg-zinc-50 shadow-sm"
                />

                <Button
                  disabled={!likeForm.name || !likeForm.phone || likeSubmitting}
                  onClick={handleLikeSubmit}
                  className="h-14 w-full rounded-2xl bg-primary font-black uppercase text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95"
                >
                  {likeSubmitting ? (
                    <Loader2 size={18} className="mx-auto animate-spin" />
                  ) : (
                    "Submit Like"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
