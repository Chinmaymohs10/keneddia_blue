import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  ImageOff,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMenuItemsByTopSoldV2, addItemLike, getMenuSectionsByPropertyTypeId } from "@/Api/RestaurantApi";
import { getPropertyTypes } from "@/Api/Api";

const FILTERS = ["Veg", "Non-Veg"];

// Map API food type → filter tag
function toTag(foodType) {
  if (!foodType) return "Veg";
  const f = foodType.toUpperCase();
  if (f === "NON_VEG") return "Non-Veg";
  return "Veg"; // VEG and EGG both fall under Veg filter
}

// Normalise API item → component shape
function normalise(item) {
  return {
    id: item.id,
    title: item.itemName,
    description: item.description || "",
    image: item.image?.url || item.media?.url || "",
    tags: [toTag(item.foodType), "Best Seller"],
    category: item.type?.typeName || item.verticalCardResponseDTO?.verticalName || "",
    likes: item.likeCount || 0,
  };
}

function DishImage({ src, alt }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <ImageOff size={32} className="text-muted-foreground/40" />
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

export default function RestaurantBestSellers({ initialItems, restaurantTypeId }) {
  const ssrLoaded = Array.isArray(initialItems) && initialItems.length > 0;
  const [activeFilter, setActiveFilter] = useState("Veg");
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
    mobileNumber: "",
    description: "",
  });
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [headerData, setHeaderData] = useState(null);
  const [resolvedTypeId, setResolvedTypeId] = useState(restaurantTypeId);

  useEffect(() => {
    if (restaurantTypeId) {
      setResolvedTypeId(restaurantTypeId);
    } else {
      getPropertyTypes().then((res) => {
        const types = res.data || res;
        const restType = Array.isArray(types)
          ? types.find((t) => (t.typeName || "").toLowerCase().includes("rest"))
          : null;
        if (restType?.id) setResolvedTypeId(Number(restType.id));
      }).catch(err => console.error("Error fetching property types:", err));
    }
  }, [restaurantTypeId]);

  useEffect(() => {
    if (!resolvedTypeId) return;
    getMenuSectionsByPropertyTypeId(resolvedTypeId)
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
  }, [resolvedTypeId]);

  useEffect(() => {
    if (ssrLoaded || !resolvedTypeId) return;
    setFetchLoading(true);
    const params = { topSold: true, propertyTypeId: resolvedTypeId };
    console.log("RestaurantBestSellers: Fetching with params:", params);

    getMenuItemsByTopSoldV2(params)
      .then((res) => {
        console.log("RestaurantBestSellers: API Response:", res.data);
        const data = res.data ?? [];
        setMenuItems((Array.isArray(data) ? data : []).map(normalise));
      })
      .catch((err) => {
        console.error("RestaurantBestSellers: Fetch Error:", err);
        setMenuItems([]);
      })
      .finally(() => setFetchLoading(false));
  }, [ssrLoaded, resolvedTypeId]);

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
    const trimmedName = likeForm.name.trim();
    if (!/^[A-Za-z ]{2,50}$/.test(trimmedName)) {
      setNameError("Please enter a valid name (2-50 letters).");
      return;
    }

    const trimmedPhone = likeForm.mobileNumber.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(phoneDigits)) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }

    setNameError("");
    setPhoneError("");
    setLikeSubmitting(true);
    try {
      const res = await addItemLike(likeModal.item.id, {
        name: trimmedName,
        mobileNumber: phoneDigits,
        description: likeForm.description || "Great taste!",
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
      toast.success("Thanks for liking this dish.");
    } catch {
      // still mark as liked locally so UI doesn't feel broken
      setLikedItems((prev) => ({ ...prev, [likeModal.item.id]: true }));
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLikeModal({ isOpen: false, item: null });
      setLikeForm({ name: "", mobileNumber: "", description: "" });
      setLikeSubmitting(false);
    }
  };

  const closeLikeModal = () => {
    setLikeModal({ isOpen: false, item: null });
    setLikeForm({ name: "", mobileNumber: "", description: "" });
    setNameError("");
    setPhoneError("");
    setLikeSubmitting(false);
  };

  const renderCard = (item, index, keyPrefix = "") => (
    <motion.div
      key={`${keyPrefix}${item.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex cursor-pointer flex-col items-center rounded-[2.5rem] border border-border bg-card p-8 text-center"
    >
      <div className="relative -mt-24 mb-4 aspect-square w-full overflow-hidden rounded-[2rem] border-4 border-background shadow-xl transition-transform duration-700 group-hover:scale-105">
        <DishImage src={item.image} alt={item.title} />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setLikeModal({ isOpen: true, item });
          }}
          className="absolute right-4 top-4 rounded-full bg-background/85 p-2 text-primary shadow-md backdrop-blur-md transition-transform hover:scale-110"
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
        <h3 className="mb-2 text-2xl font-serif leading-tight text-foreground">
          {item.title}
        </h3>

        {item.description && (
          <p className="mb-3 line-clamp-2 text-[13px] italic leading-snug text-muted-foreground">
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
    <section className="bg-background pb-2 pt-16 text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 text-left md:px-12">
        <div className="mb-20 flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="min-w-0 flex-1 lg:max-w-[80%]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Menu Spotlight
            </div>

            <h2 className="mb-2 text-3xl font-serif text-foreground md:text-4xl">
              {headerData ? headerData.part1 : "Best Seller"}{" "}
              <span className="italic text-primary">{headerData ? headerData.part2 : "Dishes"}</span>
            </h2>

            <div className="max-w-[80%]">
              <p className="text-sm font-light leading-relaxed text-muted-foreground whitespace-pre-line">
                {headerData ? headerData.description : "Discover our best seller selection, then browse it by veg and\nnon-veg in the same signature menu showcase format as the\nrestaurant detail page."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${activeFilter === filter
                  ? filter === "Veg"
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : filter === "Non-Veg"
                      ? "border-rose-400 bg-background text-rose-500"
                      : "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
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
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left border border-zinc-100 dark:border-white/5"
            >
              <button
                type="button"
                onClick={closeLikeModal}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="mb-2 text-2xl font-serif dark:text-white">
                Show your love
              </h3>
              <p className="mb-6 text-xs italic text-zinc-500">
                Share your details to like {likeModal.item?.title || "this dish"}.
              </p>

              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={likeForm.name}
                  onChange={(e) => {
                    setLikeForm((prev) => ({ ...prev, name: e.target.value }));
                    if (nameError) {
                      setNameError("");
                    }
                  }}
                  className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />
                {nameError && (
                  <p className="text-xs text-red-500 px-1">{nameError}</p>
                )}
                <Input
                  placeholder="Phone Number"
                  value={likeForm.mobileNumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setLikeForm((prev) => ({ ...prev, mobileNumber: digitsOnly }));
                    if (phoneError) {
                      setPhoneError("");
                    }
                  }}
                  maxLength={10}
                  className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />
                {phoneError && (
                  <p className="text-xs text-red-500 px-1">{phoneError}</p>
                )}
                <Input
                  placeholder="Leave a comment (optional)"
                  value={likeForm.description}
                  onChange={(e) =>
                    setLikeForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />

                <Button
                  disabled={!/^[A-Za-z ]{2,50}$/.test(likeForm.name.trim()) || !/^\d{10}$/.test(likeForm.mobileNumber) || likeSubmitting}
                  onClick={handleLikeSubmit}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                >
                  {likeSubmitting ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
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
