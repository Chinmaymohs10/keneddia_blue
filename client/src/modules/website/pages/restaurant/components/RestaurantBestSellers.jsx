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

const FILTERS = ["Veg", "Non-Veg"];

const BEST_SELLERS = [
  {
    id: 1,
    title: "Hyderabadi Biryani",
    description:
      "Dum-cooked rice, deep spice layers, and signature slow-cooked aroma.",
    image:
      "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?auto=format&fit=crop&w=900&q=80",
    tags: ["Non-Veg", "Best Seller"],
    category: "Main Course",
    likes: 1240,
  },
  {
    id: 2,
    title: "Kebabs",
    description:
      "Charred grills, smoky marinades, and platter-style indulgence.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    tags: ["Non-Veg", "Best Seller"],
    category: "Starter",
    likes: 980,
  },
  {
    id: 3,
    title: "Butter Chicken",
    description:
      "Tandoor-roasted chicken folded into a velvety tomato-butter gravy.",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
    tags: ["Non-Veg", "Best Seller"],
    category: "Signature Curry",
    likes: 1110,
  },
  {
    id: 4,
    title: "Mutton Rogan Josh",
    description:
      "Slow-braised lamb with Kashmiri spice depth and a rich aromatic finish.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    tags: ["Non-Veg", "Best Seller"],
    category: "Chef Special",
    likes: 930,
  },
  {
    id: 5,
    title: "Prawn Tikka",
    description:
      "Juicy prawns charred over flame with citrus, chili, and smoky masala.",
    image:
      "https://images.unsplash.com/photo-1625944525533-473f1b3d54b3?auto=format&fit=crop&w=900&q=80",
    tags: ["Non-Veg", "Best Seller"],
    category: "Seafood",
    likes: 845,
  },
  {
    id: 6,
    title: "Chicken Malai Tikka",
    description:
      "Creamy, mildly spiced chicken bites with a soft smoky tandoor finish.",
    image:
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=80",
    tags: ["Non-Veg", "Best Seller"],
    category: "Starter",
    likes: 890,
  },
  {
    id: 7,
    title: "Korma And Curries",
    description:
      "Rich gravies and comforting classics finished with polished presentation.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
    tags: ["Veg", "Best Seller"],
    category: "Signature Curry",
    likes: 860,
  },
  {
    id: 8,
    title: "Desserts",
    description:
      "Signature endings with warm textures, cream notes, and plated elegance.",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
    tags: ["Veg", "Best Seller"],
    category: "Dessert",
    likes: 710,
  },
  {
    id: 9,
    title: "Paneer Tikka",
    description:
      "Charred cottage cheese cubes with peppers, onions, and bold tandoori spice.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
    tags: ["Veg", "Best Seller"],
    category: "Starter",
    likes: 920,
  },
  {
    id: 10,
    title: "Dal Makhani",
    description:
      "Black lentils simmered overnight for a creamy, slow-cooked Punjabi classic.",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
    tags: ["Veg", "Best Seller"],
    category: "Main Course",
    likes: 875,
  },
  {
    id: 11,
    title: "Vegetable Biryani",
    description:
      "Fragrant basmati layered with garden vegetables, herbs, and saffron notes.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    tags: ["Veg", "Best Seller"],
    category: "Rice Special",
    likes: 790,
  },
  {
    id: 12,
    title: "Malai Kofta",
    description:
      "Soft paneer-potato dumplings in a silky cashew and tomato-based gravy.",
    image:
      "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=900&q=80",
    tags: ["Veg", "Best Seller"],
    category: "Chef Special",
    likes: 835,
  },
];

function DishImage({ src, alt }) {
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

export default function RestaurantBestSellers() {
  const [activeFilter, setActiveFilter] = useState("Veg");
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
      toast.success("Thanks for liking this dish.");
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
        <DishImage src={item.image} alt={item.title} />

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
    <section className="bg-white pb-2 pt-16">
      <div className="mx-auto max-w-[1400px] px-6 text-left md:px-12">
        <div className="mb-20 flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="min-w-0 flex-1 lg:max-w-[80%]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Menu Spotlight
            </div>

            <h2 className="mb-2 text-3xl font-serif md:text-4xl">
              Best Seller <span className="italic text-primary">Dishes</span>
            </h2>

            <div className="max-w-[80%]">
              <p className="text-sm font-light leading-relaxed text-zinc-500">
                Discover our best seller selection, then browse it by veg and
                non-veg in the same signature menu showcase format as the
                restaurant detail page.
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
                    ? filter === "Veg"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : filter === "Non-Veg"
                        ? "border-rose-400 bg-white text-rose-500"
                        : "border-primary bg-primary text-white"
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
                Share your details to like{" "}
                {likeModal.item?.title || "this dish"}.
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
