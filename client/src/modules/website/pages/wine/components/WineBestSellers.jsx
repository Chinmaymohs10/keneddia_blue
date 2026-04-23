
// import { useMemo, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ChevronDown,
//   ChevronUp,
//   ArrowLeft,
//   Sparkles,
//   ImageOff,
//   Star,
// } from "lucide-react";
// import img from "../../../../../assets/cafe_images/wine.jpeg"

// // ─── CONFIG ───────────────────────────────────────────────────────────────────
// const WHATSAPP_NUMBER = "919999999999"; // ← Replace with your real number

// // ─── DATA ─────────────────────────────────────────────────────────────────────
// const CATEGORIES = [
//   {
//     id: "whiskey",
//     name: "Whiskey",
//     image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800&q=85",
//     tagline: "Aged to Perfection",
//     items: [
//       {
//         id: 101,
//         brand: "Glenfiddich",
//         title: "12 Year Old",
//         tag: "Single Malt",
//         origin: "Bangalore",
//         abv: "40%",
    
//         description: "Fruity, mellow with fresh pear notes and a hint of vanilla oak.",
//         image: img,
    
//         accent: "#C9922A",
//       },
//       {
//         id: 102,
//         brand: "Johnnie Walker",
//         title: "Black Label",
//         tag: "Blended Scotch",
//         origin: "Hydrabad",
//         abv: "40%",
//         rating: 4.6,
//         description: "Smooth dark fruit, vanilla sweetness, and a signature smoky finish.",
//         image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&q=80",
//         logo: "🥃",
//         accent: "#1A1A1A",
//       },
//       {
//         id: 103,
//         brand: "Maker's Mark",
//         title: "Bourbon",
//         tag: "Bourbon",
//         origin: "Kentucky, USA",
//         abv: "45%",
//         rating: 4.5,
//         description: "Soft wheat mash with rich caramel, toasted wood, and gentle spice.",
//         image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80",
//         logo: "🥃",
//         accent: "#8B1A1A",
//       },
//       {
//         id: 104,
//         brand: "Jameson",
//         title: "Irish Whiskey",
//         tag: "Irish",
//         origin: "Ireland",
//         abv: "40%",
//         rating: 4.4,
//         description: "Triple-distilled for exceptional smoothness — light, nutty, perfectly balanced.",
//         image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
//         logo: "🥃",
//         accent: "#2D5A27",
//       },
//       {
//         id: 105,
//         brand: "Laphroaig",
//         title: "10 Year Old",
//         tag: "Islay Single Malt",
//         origin: "Islay, Scotland",
//         abv: "40%",
//         rating: 4.7,
//         description: "Intensely peated with bold iodine, seaweed, and a long maritime finish.",
//         image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&q=80",
//         logo: "🥃",
//         accent: "#1E3A5F",
//       },
//       {
//         id: 106,
//         brand: "Bulleit",
//         title: "Frontier Rye",
//         tag: "Rye Whiskey",
//         origin: "Kentucky, USA",
//         abv: "45%",
//         rating: 4.3,
//         description: "High-rye boldness with warming spice, dried fruit, and a clean dry close.",
//         image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80",
//         logo: "🥃",
//         accent: "#8B6914",
//       },
//     ],
//   },
//   {
//     id: "wine",
//     name: "Wine",
//     image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=85",
//     tagline: "From Vine to Glass",
//     items: [
//       {
//         id: 201,
//         brand: "Château Margaux",
//         title: "Premier Grand Cru",
//         tag: "Red Bordeaux",
//         origin: "Bordeaux, France",
//         abv: "13.5%",
//         rating: 4.9,
//         description: "Opulent dark berry, cedar, violet, and silky polished tannins.",
//         image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
//         logo: "🍷",
//         accent: "#6B1A2A",
//       },
//       {
//         id: 202,
//         brand: "Cloudy Bay",
//         title: "Sauvignon Blanc",
//         tag: "White Wine",
//         origin: "Marlborough, NZ",
//         abv: "13%",
//         rating: 4.6,
//         description: "Zesty passionfruit, citrus, and fresh herb on a crisp mineral finish.",
//         image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&q=80",
//         logo: "🍷",
//         accent: "#C8A951",
//       },
//       {
//         id: 203,
//         brand: "Veuve Clicquot",
//         title: "Yellow Label Brut",
//         tag: "Champagne",
//         origin: "Reims, France",
//         abv: "12%",
//         rating: 4.8,
//         description: "Toasty brioche, fresh apple, and a pinpoint persistent mousse.",
//         image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
//         logo: "🥂",
//         accent: "#F5C842",
//       },
//       {
//         id: 204,
//         brand: "Antinori",
//         title: "Tignanello",
//         tag: "Super Tuscan",
//         origin: "Tuscany, Italy",
//         abv: "14%",
//         rating: 4.7,
//         description: "Iconic blend of Sangiovese with dark plum, tobacco, and earthy depth.",
//         image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
//         logo: "🍷",
//         accent: "#A0291E",
//       },
//       {
//         id: 205,
//         brand: "Whispering Angel",
//         title: "Côtes de Provence",
//         tag: "Rosé",
//         origin: "Provence, France",
//         abv: "13%",
//         rating: 4.5,
//         description: "Pale, elegant Provençal rosé with strawberry, peach, and a bone-dry finish.",
//         image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&q=80",
//         logo: "🌸",
//         accent: "#D4A0A0",
//       },
//       {
//         id: 206,
//         brand: "Caymus",
//         title: "Special Selection",
//         tag: "Napa Cabernet",
//         origin: "Napa Valley, USA",
//         abv: "14.5%",
//         rating: 4.9,
//         description: "Plush and rich — blackcurrant, mocha, cassis, and a velvety seamless finish.",
//         image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
//         logo: "🍷",
//         accent: "#3D1A0E",
//       },
//     ],
//   },
//   {
//     id: "beers",
//     name: "Beers",
//     image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=85",
//     tagline: "Brewed with Passion",
//     items: [
//       {
//         id: 301,
//         brand: "Weihenstephaner",
//         title: "Hefeweissbier",
//         tag: "Wheat Beer",
//         origin: "Bavaria, Germany",
//         abv: "5.4%",
//         rating: 4.8,
//         description: "World's oldest brewery — banana, clove, and a beautifully hazy golden body.",
//         image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
//         logo: "🍺",
//         accent: "#D4A017",
//       },
//       {
//         id: 302,
//         brand: "Guinness",
//         title: "Draught",
//         tag: "Irish Stout",
//         origin: "Dublin, Ireland",
//         abv: "4.2%",
//         rating: 4.7,
//         description: "Silky nitrogen cascade with roasted coffee, dark chocolate, and a creamy head.",
//         image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80",
//         logo: "🍺",
//         accent: "#1A1A1A",
//       },
//       {
//         id: 303,
//         brand: "Sierra Nevada",
//         title: "Pale Ale",
//         tag: "American Pale Ale",
//         origin: "California, USA",
//         abv: "5.6%",
//         rating: 4.5,
//         description: "The craft beer pioneer — resinous pine, citrus hops, and a clean bitter finish.",
//         image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
//         logo: "🍺",
//         accent: "#2E7D32",
//       },
//       {
//         id: 304,
//         brand: "Hoegaarden",
//         title: "Witbier",
//         tag: "Belgian White",
//         origin: "Hoegaarden, Belgium",
//         abv: "4.9%",
//         rating: 4.4,
//         description: "Refreshing wheat beer with orange peel, coriander, and a dreamy haze.",
//         image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80",
//         logo: "🍺",
//         accent: "#C8A951",
//       },
//       {
//         id: 305,
//         brand: "Duvel",
//         title: "Golden Strong",
//         tag: "Belgian Strong Ale",
//         origin: "Breendonk, Belgium",
//         abv: "8.5%",
//         rating: 4.6,
//         description: "Deceivingly drinkable golden ale — dry-hopped, effervescent, powerfully smooth.",
//         image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
//         logo: "🍺",
//         accent: "#E8B84B",
//       },
//       {
//         id: 306,
//         brand: "Modelo",
//         title: "Especial",
//         tag: "Mexican Lager",
//         origin: "Mexico City, Mexico",
//         abv: "4.4%",
//         rating: 4.2,
//         description: "Clean, crisp, and effortlessly refreshing with a gentle malt sweetness.",
//         image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80",
//         logo: "🍺",
//         accent: "#C8960C",
//       },
//     ],
//   },
//   {
//     id: "tasting-events",
//     name: "Tasting Events",
//     image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=800&q=85",
//     tagline: "Guided Sensory Journeys",
//     items: [
//       {
//         id: 401,
//         brand: "House Experience",
//         title: "Whiskey Master Class",
//         tag: "Monthly",
//         origin: "In-House",
//         abv: "Varies",
//         rating: 4.9,
//         description: "Five single malts, one sommelier, one hour of guided discovery.",
//         image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=400&q=80",
//         logo: "🎓",
//         accent: "#C9922A",
//       },
//       {
//         id: 402,
//         brand: "House Experience",
//         title: "New World Wine Tour",
//         tag: "Bi-Monthly",
//         origin: "In-House",
//         abv: "Varies",
//         rating: 4.8,
//         description: "Six pours exploring the bold new voices of South America and Oceania.",
//         image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
//         logo: "🌍",
//         accent: "#6B1A2A",
//       },
//       {
//         id: 403,
//         brand: "House Experience",
//         title: "Craft Beer Lab",
//         tag: "Weekly",
//         origin: "In-House",
//         abv: "Varies",
//         rating: 4.6,
//         description: "Eight blind ales, food pairings, and a deep dive into brewing heritage.",
//         image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
//         logo: "🔬",
//         accent: "#2E7D32",
//       },
//       {
//         id: 404,
//         brand: "House Experience",
//         title: "Champagne & Canapés",
//         tag: "Special",
//         origin: "In-House",
//         abv: "Varies",
//         rating: 4.9,
//         description: "Prestige cuvées paired with chef-crafted bites — an evening of pure elegance.",
//         image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
//         logo: "🥂",
//         accent: "#F5C842",
//       },
//     ],
//   },
// ];

// const LOCATION_PROFILES = [
//   { state: "Karnataka", area: "Bangalore", wineShops: 12 },
//   { state: "Telangana", area: "Hyderabad", wineShops: 9 },
//   { state: "Delhi NCR", area: "Delhi", wineShops: 15 },
//   { state: "Uttar Pradesh", area: "Noida", wineShops: 7 },
//   { state: "Odisha", area: "Bhubaneswar", wineShops: 5 },
//   { state: "Maharashtra", area: "Mumbai", wineShops: 18 },
// ];

// const getLocationProfile = (item, index) => {
//   const origin = String(item.origin || "").toLowerCase();
//   const matched = LOCATION_PROFILES.find(
//     (profile) =>
//       origin.includes(profile.area.toLowerCase()) ||
//       origin.includes(profile.state.toLowerCase()),
//   );

//   return matched || LOCATION_PROFILES[index % LOCATION_PROFILES.length];
// };

// const getItemsWithLocation = (items = []) =>
//   items.map((item, index) => ({
//     ...item,
//     locationProfile: getLocationProfile(item, index),
//   }));

// // ─── HELPERS ──────────────────────────────────────────────────────────────────

// function DrinkImage({ src, alt, className = "" }) {
//   const [errored, setErrored] = useState(false);
//   if (!src || errored)
//     return (
//       <div className={`flex items-center justify-center bg-zinc-800 ${className}`}>
//         <ImageOff size={28} className="text-zinc-600" />
//       </div>
//     );
//   return (
//     <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setErrored(true)} />
//   );
// }

// function StarRating({ rating }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((s) => (
//         <Star
//           key={s}
//           size={11}
//           className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}
//         />
//       ))}
//       <span className="ml-1 text-[11px] font-bold text-amber-400">{rating}</span>
//     </div>
//   );
// }

// // WhatsApp SVG
// function WhatsAppIcon({ size = 20 }) {
//   return (
//     <svg viewBox="0 0 32 32" fill="white" style={{ width: size, height: size }}>
//       <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.663 4.882 1.818 6.932L2 30l7.302-1.784A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.892-1.607l-.422-.25-4.333 1.059 1.098-4.205-.275-.434A11.543 11.543 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.344-8.656c-.347-.174-2.055-1.014-2.375-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.362-.202.232-.405.26-.752.086-.347-.174-1.464-.539-2.788-1.719-1.031-.917-1.726-2.05-1.929-2.397-.202-.347-.022-.534.152-.706.156-.155.347-.405.52-.607.174-.202.232-.347.347-.579.116-.232.058-.434-.029-.607-.087-.174-.784-1.89-1.074-2.59-.283-.68-.57-.588-.784-.598-.202-.01-.434-.012-.666-.012-.232 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.174.231 2.449 3.738 5.934 5.24.83.358 1.477.572 1.982.732.832.265 1.59.228 2.188.138.667-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.231-.665-.405z" />
//     </svg>
//   );
// }

// // WhatsApp hover button — slides in label from the right
// function WhatsAppButton({ item, categoryName }) {
//   const [hovered, setHovered] = useState(false);
//   const message = encodeURIComponent(
//     `Hi! I'm interested in *${item.brand} – ${item.title}* (${categoryName}). Could you share more details?`
//   );
//   const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

//   return (
//     <div
//       className="absolute bottom-4 right-4 z-10 flex items-center justify-end"
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       <AnimatePresence>
//         {hovered && (
//           <motion.span
//             initial={{ opacity: 0, x: 12, scaleX: 0.8 }}
//             animate={{ opacity: 1, x: 0, scaleX: 1 }}
//             exit={{ opacity: 0, x: 12, scaleX: 0.8 }}
//             style={{ originX: 1 }}
//             className="mr-2 whitespace-nowrap rounded-full bg-[#25D366] px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-green-900/50"
//           >
//             Query on WhatsApp
//           </motion.span>
//         )}
//       </AnimatePresence>

//       <motion.a
//         href={href}
//         target="_blank"
//         rel="noopener noreferrer"
//         whileHover={{ scale: 1.15 }}
//         whileTap={{ scale: 0.92 }}
//         onClick={(e) => e.stopPropagation()}
//         className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-green-900/40"
//         aria-label="Query on WhatsApp"
//       >
//         <WhatsAppIcon size={20} />
//       </motion.a>
//     </div>
//   );
// }

// // ─── BRAND CARD ───────────────────────────────────────────────────────────────

// function BrandCard({ item, categoryName, index }) {
//   const location = item.locationProfile;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//       className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/5 bg-zinc-900 transition-all duration-300 hover:border-white/10 hover:shadow-2xl"
//     >
//       {/* ── Image ── */}
//       <div className="relative h-48 w-full overflow-hidden">
//         <DrinkImage
//           src={item.image}
//           alt={item.title}
//           className="h-full w-full transition-transform duration-700 group-hover:scale-110"
//         />
//         {/* Dark gradient so bottom text pops */}
//         <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

//         {/* Tag pill – top left */}
//         <span
//           className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
//           style={{ backgroundColor: item.accent + "dd" }}
//         >
//           {item.tag}
//         </span>

//         {/* Logo badge – top right */}
//         <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-xl shadow-md backdrop-blur-md">
//           {item.logo}
//         </div>

//         {/* WhatsApp hover button */}
//         <WhatsAppButton item={item} categoryName={categoryName} />
//       </div>

//       {/* ── Content ── */}
//       <div className="flex flex-1 flex-col p-5">
//         {/* Brand row */}
//         <div className="mb-1 flex items-center justify-between gap-2">
//           <span
//             className="truncate text-[11px] font-black uppercase tracking-widest"
//             style={{ color: item.accent }}
//           >
//             {item.brand}
//           </span>
//           <span className="shrink-0 text-[10px] text-zinc-500">{item.origin}</span>
//         </div>

//         {/* Title */}
//         <h4 className="mb-2 font-serif text-[1.2rem] leading-tight text-white">
//           {item.title}
//         </h4>

     

//         {/* Description */}
//         <p className="line-clamp-2 text-[12px] italic leading-relaxed text-zinc-500">
//           "{item.description}"
//         </p>
     
//       </div>

//       {/* Accent bar */}
//       <div
//         className="h-[3px] w-full transition-all duration-500 group-hover:h-[5px]"
//         style={{ backgroundColor: item.accent, opacity: 0.75 }}
//       />
//     </motion.div>
//   );
// }

// // ─── CATEGORY DETAIL PAGE ─────────────────────────────────────────────────────

// function CategoryPage({ category, onBack }) {
//   const [selectedState, setSelectedState] = useState("all");
//   const [selectedArea, setSelectedArea] = useState("all");

//   const itemsWithLocation = useMemo(
//     () => getItemsWithLocation(category.items),
//     [category.items],
//   );

//   const stateOptions = useMemo(
//     () => ["all", ...new Set(itemsWithLocation.map((item) => item.locationProfile.state))],
//     [itemsWithLocation],
//   );

//   const areaOptions = useMemo(() => {
//     const scopedItems =
//       selectedState === "all"
//         ? itemsWithLocation
//         : itemsWithLocation.filter(
//             (item) => item.locationProfile.state === selectedState,
//           );

//     return ["all", ...new Set(scopedItems.map((item) => item.locationProfile.area))];
//   }, [itemsWithLocation, selectedState]);

//   const filteredItems = useMemo(() => {
//     return itemsWithLocation.filter((item) => {
//       const location = item.locationProfile;
//       const stateMatches = selectedState === "all" || location.state === selectedState;
//       const areaMatches = selectedArea === "all" || location.area === selectedArea;

//       return stateMatches && areaMatches;
//     });
//   }, [itemsWithLocation, selectedArea, selectedState]);

//   const handleStateChange = (value) => {
//     setSelectedState(value);
//     setSelectedArea("all");
//   };

//   return (
//     <motion.div
//       key="cat-page"
//       initial={{ opacity: 0, x: 60 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 60 }}
//       transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
//       className="min-h-screen bg-[#0a0a0a] pb-24 pt-10"
//     >
//       <div className="mx-auto max-w-[1400px] px-6 md:px-12">
//         {/* Back button */}
//         <button
//           type="button"
//           onClick={onBack}
//           className="mb-10 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 transition-all hover:border-amber-500/60 hover:text-amber-400"
//         >
//           <ArrowLeft size={15} />
//           Back
//         </button>

//         {/* Hero banner */}
//         <div className="relative mb-14 h-64 w-full overflow-hidden rounded-[2rem] md:h-80">
//           <DrinkImage src={category.image} alt={category.name} className="h-full w-full" />
//           <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
//           <div className="absolute bottom-0 left-0 p-10">
//             <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
//               <Sparkles className="h-3 w-3" />
//               {category.tagline}
//             </div>
//             <h2 className="font-serif text-5xl italic text-white md:text-6xl">{category.name}</h2>

//           </div>
//         </div>

//         <div className="mb-8 grid gap-3 rounded-[1.5rem] border border-white/10 bg-zinc-900/80 p-4 shadow-2xl shadow-black/20 md:grid-cols-3">
//           <div>
//             <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
//               State
//             </label>
//             <select
//               value={selectedState}
//               onChange={(event) => handleStateChange(event.target.value)}
//               className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-amber-500"
//             >
//               {stateOptions.map((state) => (
//                 <option key={state} value={state}>
//                   {state === "all" ? "All States" : state}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
//               Area
//             </label>
//             <select
//               value={selectedArea}
//               onChange={(event) => setSelectedArea(event.target.value)}
//               className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-amber-500"
//             >
//               {areaOptions.map((area) => (
//                 <option key={area} value={area}>
//                   {area === "all" ? "All Areas" : area}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-end">
//             <div className="flex h-11 w-full items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 text-sm font-black text-amber-400">
//               {filteredItems.length} Result{filteredItems.length === 1 ? "" : "s"}
//             </div>
//           </div>
//         </div>

//         {/* Brand cards */}
//         {filteredItems.length > 0 ? (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {filteredItems.map((item, i) => (
//               <BrandCard key={item.id} item={item} categoryName={category.name} index={i} />
//             ))}
//           </div>
//         ) : (
//           <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-zinc-900/70 px-6 py-12 text-center">
//             <p className="text-sm font-semibold text-zinc-300">No wine shops found for this filter.</p>
//             <p className="mt-1 text-xs text-zinc-500">Try changing the state or area.</p>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// // ─── CATEGORY GRID CARD (main page) ──────────────────────────────────────────

// function CategoryGridCard({ category, index, onClick }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ delay: index * 0.08 }}
//       onClick={onClick}
//       className="group relative flex cursor-pointer flex-col items-center rounded-[2.5rem] border border-zinc-100 bg-zinc-50 p-8 text-center transition-shadow hover:shadow-xl"
//     >
//       <div className="relative -mt-24 mb-4 aspect-square w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-xl transition-transform duration-700 group-hover:scale-105">
//         <DrinkImage src={category.image} alt={category.name} className="h-full w-full" />
//         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
//           <span className="rounded-full border border-white/70 bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
//             Explore
//           </span>
//         </div>
//       </div>
//       <h3 className="mb-1 font-serif text-2xl leading-tight text-zinc-900">{category.name}</h3>
//       <p className="text-xs italic text-zinc-500">{category.tagline}</p>
 
//     </motion.div>
//   );
// }

// // ─── ROOT ─────────────────────────────────────────────────────────────────────

// export default function BestSellers() {
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [expanded, setExpanded] = useState(false);

//   const primaryCategories = CATEGORIES.slice(0, 4);
//   const extraCategories = CATEGORIES.slice(4);

//   return (
//     <div className="relative overflow-hidden">
//       <AnimatePresence mode="wait">
//         {activeCategory ? (
//           <CategoryPage
//             key="detail"
//             category={activeCategory}
//             onBack={() => setActiveCategory(null)}
//           />
//         ) : (
//           <motion.section
//             key="grid"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.25 }}
//             className="bg-[#E4CDB0] pb-2 pt-16 dark:bg-[#050505]"
//           >
//             <div className="mx-auto max-w-[1400px] px-6 text-left md:px-12">
//               {/* Header */}
//               <div className="mb-20 flex flex-col items-start justify-between gap-8 lg:flex-row">
//                 <div className="min-w-0 flex-1 lg:max-w-[80%]">
//                   <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-700">
//                     <Sparkles className="h-3.5 w-3.5" />
//                     Menu Spotlight
//                   </div>
//                   <h2 className="mb-2 font-serif text-3xl md:text-4xl">
//                     Best Seller{" "}
//                     <span className="italic text-amber-700">Drinks Menu</span>
//                   </h2>
//                   <div className="max-w-[80%]">
//                     <p className="text-sm font-light leading-relaxed text-zinc-500">
//                       Select a category to explore our curated selection. Hover over any item to enquire directly via WhatsApp.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Primary grid */}
//               <div className="grid grid-cols-1 gap-x-6 gap-y-20 pt-16 md:grid-cols-2 lg:grid-cols-4">
//                 {primaryCategories.map((cat, i) => (
//                   <CategoryGridCard
//                     key={cat.id}
//                     category={cat}
//                     index={i}
//                     onClick={() => setActiveCategory(cat)}
//                   />
//                 ))}
//               </div>

//               {/* Show more */}
//               {extraCategories.length > 0 && (
//                 <div className="px-5 pb-5 pt-8 lg:px-0 lg:pb-6">
//                   <div className="flex justify-center">
//                     <button
//                       type="button"
//                       onClick={() => setExpanded((c) => !c)}
//                       className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition-all hover:border-amber-500/40 hover:text-amber-700"
//                     >
//                       {expanded ? "Show Less" : `Show More (${extraCategories.length})`}
//                       {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//                     </button>
//                   </div>
//                   <AnimatePresence initial={false}>
//                     {expanded && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0, y: 10 }}
//                         animate={{ opacity: 1, height: "auto", y: 0 }}
//                         exit={{ opacity: 0, height: 0, y: 10 }}
//                         transition={{ duration: 0.25 }}
//                         className="overflow-hidden"
//                       >
//                         <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-20 md:grid-cols-2 lg:grid-cols-4">
//                           {extraCategories.map((cat, i) => (
//                             <CategoryGridCard
//                               key={cat.id}
//                               category={cat}
//                               index={i}
//                               onClick={() => setActiveCategory(cat)}
//                             />
//                           ))}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               )}
//             </div>
//           </motion.section>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X, MapPin, Percent, ChevronRight } from "lucide-react";

// ─── FONTS (injected once) ────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Mono:wght@300;400;500&display=swap";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "919999999999";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "whiskey",
    name: "Whiskey",
    subtitle: "Single Malts & Blends",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1200&q=90",
    accentColor: "#C9922A",
    number: "01",
    items: [
      { id: 101, brand: "Glenfiddich", title: "12 Year Old", tag: "Single Malt", origin: "Speyside, Scotland", abv: "40%", description: "Fresh pear, vanilla oak and a long clean finish.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", accent: "#C9922A" },
      { id: 102, brand: "Johnnie Walker", title: "Black Label", tag: "Blended Scotch", origin: "Scotland", abv: "40%", description: "Dark fruit and vanilla with a rich signature smokiness.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", accent: "#8B7355" },
      { id: 103, brand: "Maker's Mark", title: "Bourbon", tag: "Bourbon", origin: "Kentucky, USA", abv: "45%", description: "Caramel, red winter wheat softness and toasted oak.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", accent: "#8B1A1A" },
      { id: 104, brand: "Jameson", title: "Irish Whiskey", tag: "Irish", origin: "Dublin, Ireland", abv: "40%", description: "Triple-distilled, silky light body with a gentle nutty finish.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", accent: "#2D5A27" },
      { id: 105, brand: "Laphroaig", title: "10 Year Old", tag: "Islay Single Malt", origin: "Islay, Scotland", abv: "40%", description: "Intense peat smoke, iodine, and a long maritime finish.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", accent: "#1E3A5F" },
      { id: 106, brand: "Bulleit", title: "Frontier Rye", tag: "Rye Whiskey", origin: "Kentucky, USA", abv: "45%", description: "Bold rye spice, dried fruit, and a clean dry close.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", accent: "#8B6914" },
    ],
  },
  {
    id: "wine",
    name: "Wine",
    subtitle: "Reds, Whites & Champagne",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=90",
    accentColor: "#7B2D3E",
    number: "02",
    items: [
      { id: 201, brand: "Château Margaux", title: "Premier Grand Cru", tag: "Red Bordeaux", origin: "Bordeaux, France", abv: "13.5%", description: "Dark berry, cedar, violet and perfectly polished tannins.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#6B1A2A" },
      { id: 202, brand: "Cloudy Bay", title: "Sauvignon Blanc", tag: "White Wine", origin: "Marlborough, NZ", abv: "13%", description: "Zesty passionfruit, citrus and crisp mineral finish.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", accent: "#C8A951" },
      { id: 203, brand: "Veuve Clicquot", title: "Yellow Label Brut", tag: "Champagne", origin: "Reims, France", abv: "12%", description: "Toasty brioche, fresh apple and a persistent mousse.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", accent: "#E8B84B" },
      { id: 204, brand: "Antinori", title: "Tignanello", tag: "Super Tuscan", origin: "Tuscany, Italy", abv: "14%", description: "Dark plum, tobacco and earthy Sangiovese depth.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#A0291E" },
      { id: 205, brand: "Whispering Angel", title: "Côtes de Provence", tag: "Rosé", origin: "Provence, France", abv: "13%", description: "Pale, elegant rosé with strawberry, peach, bone-dry.", image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&q=85", accent: "#C47A8A" },
      { id: 206, brand: "Caymus", title: "Special Selection", tag: "Napa Cabernet", origin: "Napa Valley, USA", abv: "14.5%", description: "Plush blackcurrant, mocha and a seamless velvet finish.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#3D1A0E" },
    ],
  },
  {
    id: "beers",
    name: "Beers",
    subtitle: "Craft, Stout & Lager",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&q=90",
    accentColor: "#B8860B",
    number: "03",
    items: [
      { id: 301, brand: "Weihenstephaner", title: "Hefeweissbier", tag: "Wheat Beer", origin: "Bavaria, Germany", abv: "5.4%", description: "Banana, clove and a beautifully hazy golden body.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#D4A017" },
      { id: 302, brand: "Guinness", title: "Draught", tag: "Irish Stout", origin: "Dublin, Ireland", abv: "4.2%", description: "Silky nitrogen cascade with roasted coffee and chocolate.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", accent: "#3A3A3A" },
      { id: 303, brand: "Sierra Nevada", title: "Pale Ale", tag: "American Pale Ale", origin: "California, USA", abv: "5.6%", description: "Resinous pine, citrus hops and a clean bitter finish.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#2E7D32" },
      { id: 304, brand: "Hoegaarden", title: "Witbier", tag: "Belgian White", origin: "Belgium", abv: "4.9%", description: "Orange peel, coriander and a dreamy hazy glow.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", accent: "#C8A951" },
      { id: 305, brand: "Duvel", title: "Golden Strong", tag: "Belgian Strong Ale", origin: "Breendonk, Belgium", abv: "8.5%", description: "Dry-hopped, effervescent and powerfully smooth.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#E8B84B" },
      { id: 306, brand: "Modelo", title: "Especial", tag: "Mexican Lager", origin: "Mexico City, Mexico", abv: "4.4%", description: "Clean, crisp with a gentle malt sweetness.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", accent: "#C8960C" },
    ],
  },
  {
    id: "tasting-events",
    name: "Tastings",
    subtitle: "Guided Sensory Journeys",
    image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=1200&q=90",
    accentColor: "#556B5E",
    number: "04",
    items: [
      { id: 401, brand: "House Experience", title: "Whiskey Master Class", tag: "Monthly", origin: "In-House", abv: "Varies", description: "Five single malts, one sommelier, one hour of discovery.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", accent: "#C9922A" },
      { id: 402, brand: "House Experience", title: "New World Wine Tour", tag: "Bi-Monthly", origin: "In-House", abv: "Varies", description: "Six pours across South America and Oceania.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#7B2D3E" },
      { id: 403, brand: "House Experience", title: "Craft Beer Lab", tag: "Weekly", origin: "In-House", abv: "Varies", description: "Eight blind ales with food pairings and brewing history.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#2E7D32" },
      { id: 404, brand: "House Experience", title: "Champagne & Canapés", tag: "Special", origin: "In-House", abv: "Varies", description: "Prestige cuvées with chef-crafted bites — pure elegance.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", accent: "#E8B84B" },
    ],
  },
];

// ─── WHATSAPP ──────────────────────────────────────────────────────────────────
function WhatsAppBtn({ item, catName }) {
  const [hover, setHover] = useState(false);
  const msg = encodeURIComponent(`Hi! Interested in *${item.brand} – ${item.title}* (${catName}). Could you share details?`);
  return (
    <div className="flex items-center gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <AnimatePresence>
        {hover && (
          <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
            className="text-[11px] font-mono font-semibold text-[#25D366] tracking-wide whitespace-nowrap">
            Query on WhatsApp
          </motion.span>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
        target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-green-900/50"
        aria-label="WhatsApp Query"
      >
        <svg viewBox="0 0 32 32" fill="white" className="h-[18px] w-[18px]">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.663 4.882 1.818 6.932L2 30l7.302-1.784A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.892-1.607l-.422-.25-4.333 1.059 1.098-4.205-.275-.434A11.543 11.543 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.344-8.656c-.347-.174-2.055-1.014-2.375-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.362-.202.232-.405.26-.752.086-.347-.174-1.464-.539-2.788-1.719-1.031-.917-1.726-2.05-1.929-2.397-.202-.347-.022-.534.152-.706.156-.155.347-.405.52-.607.174-.202.232-.347.347-.579.116-.232.058-.434-.029-.607-.087-.174-.784-1.89-1.074-2.59-.283-.68-.57-.588-.784-.598-.202-.01-.434-.012-.666-.012-.232 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.174.231 2.449 3.738 5.934 5.24.83.358 1.477.572 1.982.732.832.265 1.59.228 2.188.138.667-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.231-.665-.405z" />
        </svg>
      </motion.a>
    </div>
  );
}

// ─── PRODUCT DRAWER ───────────────────────────────────────────────────────────
function ProductDrawer({ category, onClose }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const tags = useMemo(() => ["all", ...new Set(category.items.map(i => i.tag))], [category]);
  const filtered = useMemo(() => activeFilter === "all" ? category.items : category.items.filter(i => i.tag === activeFilter), [category, activeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="relative ml-auto flex h-full w-full max-w-[780px] flex-col overflow-hidden bg-[#111008]"
      >
        {/* Drawer header */}
        <div className="relative h-48 shrink-0 overflow-hidden">
          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#111008]" />
          <div className="absolute inset-0 flex items-end p-8">
            <div>
              {/* <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400/80">{category.subtitle}</p> */}
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-5xl font-light italic text-white">
                {category.name}
              </h2>
            </div>
          </div>
          <button onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20">
            <X size={16} />
          </button>
        </div>

        {/* Tag filters */}
        <div className="shrink-0 px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <button key={t} onClick={() => setActiveFilter(t)}
                className="rounded-full border px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest transition-all"
                style={activeFilter === t
                  ? { borderColor: category.accentColor, backgroundColor: category.accentColor + "22", color: category.accentColor }
                  : { borderColor: "#333", color: "#666", backgroundColor: "transparent" }
                }
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 h-px shrink-0" style={{ background: `linear-gradient(to right, ${category.accentColor}44, transparent)` }} />

        {/* Scrollable product list */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex gap-4 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]"
              >
                {/* Left: image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  <img src={item.image} alt={item.brand} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-xl" style={{ boxShadow: `inset 0 0 0 1px ${item.accent}33` }} />
                </div>

                {/* Center: info */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: item.accent }}>{item.brand}</span>
                      <span className="rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider" style={{ borderColor: item.accent + "44", color: item.accent + "cc" }}>{item.tag}</span>
                    </div>
                    <h4 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl font-semibold leading-tight text-white">{item.title}</h4>
                    <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 italic">{item.description}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1"><MapPin size={10} />{item.origin}</span>

                  </div>
                </div>

                {/* Right: WhatsApp */}
                <div className="flex shrink-0 items-center">
                  <WhatsAppBtn item={item} catName={category.name} />
                </div>

                {/* Accent left border */}
                <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: item.accent }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CATEGORY TILE ────────────────────────────────────────────────────────────
function CategoryTile({ category, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-pointer overflow-hidden"
      style={{ borderRadius: 24 }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ borderRadius: 24 }}>
        <motion.img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {/* Accent overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: hovered ? 0.18 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: `radial-gradient(ellipse at bottom left, ${category.accentColor}, transparent 70%)` }}
        />

        {/* Issue number — top left */}
        <div className="absolute left-5 top-5">
          <span style={{ fontFamily: "'DM Mono', monospace", color: category.accentColor + "cc" }}
            className="text-[11px] font-semibold tracking-[0.3em]">№ {category.number}</span>
        </div>

        {/* Top-right arrow */}
        <motion.div
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: category.accentColor + "55", backgroundColor: category.accentColor + "11" }}
          animate={{ rotate: hovered ? 45 : 0, opacity: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowUpRight size={16} style={{ color: category.accentColor }} />
        </motion.div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Thin accent rule */}
          <motion.div
            className="mb-3 h-[1px]"
            style={{ backgroundColor: category.accentColor }}
            animate={{ width: hovered ? "100%" : "32px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* <p style={{ fontFamily: "'DM Mono', monospace" }} className="mb-1 text-[9px] uppercase tracking-[0.3em] text-white/50">{category.subtitle}</p> */}
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl font-light italic leading-none text-white">{category.name}</h3>
          {/* <motion.div
            className="mt-3 flex items-center gap-1.5"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", color: category.accentColor }} className="text-[10px] font-semibold tracking-widest uppercase">{category.items.length} Selections</span>
            <ChevronRight size={12} style={{ color: category.accentColor }} />
          </motion.div> */}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function BestSellers() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <>
      {/* Google Fonts */}
      <link href={FONT_LINK} rel="stylesheet" />

      <section
        className="relative min-h-screen overflow-hidden bg-[#0C0B08] py-20"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {/* Subtle noise texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "128px" }} />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9922A 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />

        <div className="relative mx-auto max-w-[1400px] px-8 md:px-16">

          {/* ── Header ── */}
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {/* Eyebrow */}
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px w-12 bg-amber-500/60" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-amber-500/80">Curated Collection</span>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-5xl font-light leading-[1.1] text-white md:text-3xl">
                Crafted for Every Taste<br /><em className="text-amber-400/90">Explore our curated selection of premium spirits and beverages, designed to suit every mood and occasion.</em>
              </h1>
            </div>
            <p className="max-w-xs text-[12px] leading-relaxed text-zinc-500 md:text-right">
              Premium spirits, wines and craft beers. Click any category to explore — hover an item to enquire via WhatsApp.
            </p>
          </div>

   

          {/* ── Category grid ── */}
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => (
              <CategoryTile key={cat.id} category={cat} index={i} onClick={() => setActiveCategory(cat)} />
            ))}
          </div>

          {/* ── Footer line ── */}
          <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-8">
            <span className="text-[10px] tracking-[0.25em] text-zinc-700 uppercase">Menu Spotlight</span>
            <span className="text-[10px] tracking-[0.25em] text-zinc-700 uppercase">{CATEGORIES.reduce((s, c) => s + c.items.length, 0)} total offerings</span>
          </div>
        </div>
      </section>

      {/* ── Drawer overlay ── */}
      <AnimatePresence>
        {activeCategory && (
          <ProductDrawer
            key={activeCategory.id}
            category={activeCategory}
            onClose={() => setActiveCategory(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}