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
import { siteContent } from "@/data/siteContent";

const FILTERS = ["Hot Brews", "Cold Brews"];

const BEST_SELLERS = [
  {
    id: 1,
    title: "Signature Espresso",
    description:
      "Concentrated roast depth with a syrupy body and a polished dark chocolate finish.",
    image: siteContent.images.cafes.minimalist.src,
    tags: ["Hot Brews", "Best Seller"],
    category: "Espresso Bar",
    likes: 1180,
  },
  {
    id: 2,
    title: "Cappuccino Grande",
    description:
      "Velvet milk foam layered over a structured espresso pull for a balanced cafe classic.",
    image: siteContent.images.cafes.parisian.src,
    tags: ["Hot Brews", "Best Seller"],
    category: "Milk Coffee",
    likes: 1025,
  },
  {
    id: 3,
    title: "Hazelnut Latte",
    description:
      "Toasted nut sweetness folded into creamy milk and a warm aromatic coffee base.",
    image: siteContent.images.cafes.library.src,
    tags: ["Hot Brews", "Best Seller"],
    category: "Flavoured Latte",
    likes: 960,
  },
  {
    id: 4,
    title: "Mocha Indulgence",
    description:
      "Espresso and cocoa built into a dessert-like cup with a lingering bittersweet edge.",
    image: siteContent.images.cafes.bakery.src,
    tags: ["Hot Brews", "Best Seller"],
    category: "Cafe Signature",
    likes: 910,
  },
  {
    id: 5,
    title: "Pour Over Reserve",
    description:
      "Single-origin brewing for a cleaner cup with brighter fruit notes and longer aroma.",
    image: siteContent.images.cafes.minimalist.src,
    tags: ["Hot Brews", "Best Seller"],
    category: "Manual Brew",
    likes: 865,
  },
  {
    id: 6,
    title: "Caramel Macchiato",
    description:
      "A sweet layered profile with espresso intensity, caramel lift, and creamy texture.",
    image: siteContent.images.cafes.highTea.src,
    tags: ["Hot Brews", "Best Seller"],
    category: "House Favorite",
    likes: 890,
  },
  {
    id: 7,
    title: "Classic Cold Brew",
    description:
      "Slow-steeped overnight for a smoother, low-acid glass with cocoa and malt tones.",
    image: siteContent.images.cafes.garden.src,
    tags: ["Cold Brews", "Best Seller"],
    category: "Cold Coffee",
    likes: 980,
  },
  {
    id: 8,
    title: "Vanilla Iced Latte",
    description:
      "Soft vanilla sweetness balanced with chilled espresso and a clean milk finish.",
    image: siteContent.images.cafes.parisian.src,
    tags: ["Cold Brews", "Best Seller"],
    category: "Iced Latte",
    likes: 930,
  },
  {
    id: 9,
    title: "Affogato Glass",
    description:
      "Vanilla gelato topped with hot espresso for a cold-hot contrast that feels instantly indulgent.",
    image: siteContent.images.cafes.bakery.src,
    tags: ["Cold Brews", "Best Seller"],
    category: "Dessert Coffee",
    likes: 845,
  },
  {
    id: 10,
    title: "Iced Americano",
    description:
      "Sharp, clean, and refreshing with direct roast clarity and a crisp caffeinated finish.",
    image: siteContent.images.cafes.library.src,
    tags: ["Cold Brews", "Best Seller"],
    category: "Black Coffee",
    likes: 820,
  },
  {
    id: 11,
    title: "Salted Caramel Frappe",
    description:
      "Blended coffee, cream, and caramel in a thicker frozen profile made for long cafe hours.",
    image: siteContent.images.cafes.highTea.src,
    tags: ["Cold Brews", "Best Seller"],
    category: "Blended Coffee",
    likes: 885,
  },
  {
    id: 12,
    title: "Espresso Tonic",
    description:
      "Bitters, tonic sparkle, and espresso create a sharper modern coffee serve.",
    image: siteContent.images.cafes.garden.src,
    tags: ["Cold Brews", "Best Seller"],
    category: "Special Brew",
    likes: 775,
  },
];

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

export default function CafeBestSellers() {
  const [activeFilter, setActiveFilter] = useState("Hot Brews");
  const [expanded, setExpanded] = useState(false);
  const [menuItems, setMenuItems] = useState(BEST_SELLERS);
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

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.tags.includes(activeFilter));
  }, [activeFilter, menuItems]);

  const primaryItems = filteredItems.slice(0, 4);
  const extraItems = filteredItems.slice(4);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setExpanded(false);
  };

  const handleLikeSubmit = () => {
    if (!likeModal.item) return;

    setLikeSubmitting(true);

    window.setTimeout(() => {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === likeModal.item.id
            ? { ...item, likes: item.likes + 1 }
            : item,
        ),
      );
      setLikedItems((prev) => ({ ...prev, [likeModal.item.id]: true }));
      setLikeModal({ isOpen: false, item: null });
      setLikeForm({ name: "", phone: "", description: "" });
      setLikeSubmitting(false);
      toast.success("Thanks for liking this coffee.");
    }, 500);
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
              Best Seller <span className="italic text-primary">Coffee Menu</span>
            </h2>

            <div className="max-w-[80%]">
              <p className="text-sm font-light leading-relaxed text-zinc-500">
                The restaurant bestseller layout is reused here exactly in spirit,
                but tuned for cafe categories, coffee language, and brew-led
                highlights.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
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

        <div className="grid grid-cols-1 gap-x-6 gap-y-20 pt-16 md:grid-cols-2 lg:grid-cols-4">
          {primaryItems.map((item, index) => renderCard(item, index))}
        </div>

        {extraItems.length > 0 && (
          <div className="px-5 pb-5 pt-8 lg:px-0 lg:pb-6">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition-all hover:border-primary/40 hover:text-primary"
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
