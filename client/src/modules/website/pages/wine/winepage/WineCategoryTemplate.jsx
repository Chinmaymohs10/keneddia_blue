import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  ImageOff,
  ArrowLeft,
  Sparkles,
  Wine,
  ChevronDown,
  Search,
  Filter,
  X,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import WineWhatsAppButton from "../components/WineWhatsAppButton";
import { siteContent } from "@/data/siteContent";

// ─── NAV ─────────────────────────────────────────────────────────────────────
const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "#hero" },
  { type: "link", label: "COLLECTION", href: "#collection" },
  { type: "link", label: "BRANDS", href: "/wine-homepage" },
];

// ─── TYPE ACCENTS ─────────────────────────────────────────────────────────────
const TYPE_ACCENTS = {
  Whiskey: { color: "#C9922A", light: "#FDF9F2", dark: "#3D2B08", dot: "#D4A017", bg: "#FDF9F2" },
  Wine: { color: "#8B1A2A", light: "#FDF2F4", dark: "#3D0A10", dot: "#C4485A", bg: "#FDF2F4" },
  Beers: { color: "#B8860B", light: "#FBF7ED", dark: "#3A2C08", dot: "#D4B035", bg: "#FBF7ED" },
  Tastings: { color: "#556B5E", light: "#F2F7F4", dark: "#1A241F", dot: "#7AA088", bg: "#F2F7F4" },
};

// ─── TYPE METADATA ────────────────────────────────────────────────────────────
const TYPE_META = {
  whiskey: {
    label: "Whiskey Collection",
    tag: "Single Malts · Blends · Bourbons",
    description:
      "Explore our curated selection of world-class whiskeys — from peaty Scottish single malts to smooth Kentucky bourbons. Each expression is a journey through grain, cask, and time.",
    heroImage: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1600&q=80",
    heroAlt: "Whiskey collection",
    accent: TYPE_ACCENTS.Whiskey,
    typeKey: "Whiskey",
  },
  wine: {
    label: "Wine Collection",
    tag: "Reds · Whites · Champagnes",
    description:
      "From old-world Bordeaux to new-world Sauvignon Blancs, our wine cellar is a celebration of terroir, vintage, and craft. Every bottle tells a story of land and season.",
    heroImage: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80",
    heroAlt: "Fine wine collection",
    accent: TYPE_ACCENTS.Wine,
    typeKey: "Wine",
  },
  beers: {
    label: "Craft Beer Collection",
    tag: "Ales · Stouts · Wheat Beers",
    description:
      "Celebrate the art of the brewer. From creamy Irish stouts to hazy Bavarian wheat beers, our tap and bottle selection brings the world's finest breweries to your table.",
    heroImage: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1600&q=80",
    heroAlt: "Craft beer collection",
    accent: TYPE_ACCENTS.Beers,
    typeKey: "Beers",
  },
  tastings: {
    label: "Tasting Experiences",
    tag: "Master Classes · Flights · Events",
    description:
      "Go beyond the glass. Our curated tasting experiences are guided by sommeliers and brand ambassadors, offering immersive sensory journeys through the world's finest expressions.",
    heroImage: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=1600&q=80",
    heroAlt: "Wine tasting experience",
    accent: TYPE_ACCENTS.Tastings,
    typeKey: "Tastings",
  },
};

const DRINK_TYPE_SLUGS = Object.keys(TYPE_META);

// ─── BRANDS ───────────────────────────────────────────────────────────────────
const BRANDS = [
  {
    id: "hibiki",
    name: "HIBIKI",
    subLabel: "Suntory Whisky",
    accent: "#d7d3cc",
    detail: "Harmony",
    heroImage: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1600&q=80",
    description:
      "HIBIKI, the Japanese word for 'resonance', reflects the harmony between master blenders and nature. Suntory's flagship blended whisky is a symphony of malt and grain whiskeys, aged in five different types of casks.",
    origin: "Osaka, Japan",
    established: "1989",
    tagline: "Where tradition meets harmony",
  },
  {
    id: "beluga",
    name: "BELUGA",
    subLabel: "Gold Line",
    accent: "#e5d4ab",
    detail: "Reserve",
    heroImage: "https://images.unsplash.com/photo-1574437912979-56b96e6b2f40?w=1600&q=80",
    description:
      "Beluga Noble Russian Vodka, produced at the Mariinsk Distillery, is crafted from premium malt spirit with artesian water. The vodka rests for 30 days before filtering through quartz sand, birch charcoal, and cotton.",
    origin: "Siberia, Russia",
    established: "1998",
    tagline: "The purest expression of Siberian craft",
  },
  {
    id: "glenmorangie",
    name: "GLENM",
    subLabel: "Single Malt Scotch Whisky",
    accent: "#c6a76d",
    detail: "Highland",
    heroImage: "https://images.unsplash.com/photo-1534361960057-19f4434a5d91?w=1600&q=80",
    description:
      "Glenmorangie, meaning 'glen of tranquillity', has been crafting exceptional single malt Scotch whisky in the Scottish Highlands since 1843. Their stills — the tallest in Scotland — produce a uniquely delicate spirit.",
    origin: "Tain, Scottish Highlands",
    established: "1843",
    tagline: "Unnecessarily well made",
  },
  {
    id: "guinness",
    name: "GUINNESS",
    subLabel: "Est. 1759",
    accent: "#b48a35",
    detail: "Dublin",
    heroImage: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=1600&q=80",
    description:
      "Since Arthur Guinness signed a 9,000-year lease on the St. James's Gate Brewery in 1759, Guinness has become the world's most iconic stout. Its creamy nitrogen cascade and rich roasted character are instantly recognisable.",
    origin: "Dublin, Ireland",
    established: "1759",
    tagline: "Good things come to those who wait",
  },
  {
    id: "johnnie-walker",
    name: "JOHNNIE WALKER",
    subLabel: "Blended Scotch Whisky",
    accent: "#f0c15b",
    detail: "Black Label",
    heroImage: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=1600&q=80",
    description:
      "Johnnie Walker is the world's best-selling Scotch whisky, crafted from a blend of the finest single malts and grain whiskeys. The Black Label, aged for 12 years, is the pinnacle of blending artistry.",
    origin: "Kilmarnock, Scotland",
    established: "1820",
    tagline: "Keep walking",
  },
];

// ─── DRINKS DATA ──────────────────────────────────────────────────────────────
const DRINKS_DATA = [
  // --- WHISKEY (12+ ITEMS) ---
  { id: 101, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Glenfiddich", subtitle: "12 Year Old Single Malt", type: "Whiskey", tag: "Single Malt", origin: "Speyside, Scotland", abv: "40%", rating: 4.8, tasting: "Fresh pear, vanilla oak and a long clean finish with hints of spice.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", pairing: "Dark Chocolate", body: "Medium Body" },
  { id: 102, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Johnnie Walker Black", subtitle: "Blended Scotch", type: "Whiskey", tag: "Blended Scotch", origin: "Scotland", abv: "40%", rating: 4.7, tasting: "Dark fruit and vanilla with a rich signature smokiness and malty depth.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", pairing: "Smoked Meat", body: "Full Body" },
  { id: 103, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Maker's Mark", subtitle: "Bourbon Whiskey", type: "Whiskey", tag: "Bourbon", origin: "Kentucky, USA", abv: "45%", rating: 4.6, tasting: "Caramel, red winter wheat softness and toasted oak with sweet notes.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", pairing: "BBQ, Pork", body: "Full Body" },
  { id: 104, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Glenmorangie", subtitle: "The Original 10 Year", type: "Whiskey", tag: "Single Malt", origin: "Scottish Highlands", abv: "40%", rating: 4.7, tasting: "Floral, citrus blossom and sweet vanilla with a delicate, silky finish.", image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d91?w=600&q=85", pairing: "Cheesecake", body: "Light Body" },
  { id: 105, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Hibiki Harmony", subtitle: "Japanese Blended", type: "Whiskey", tag: "Japanese Blend", origin: "Osaka, Japan", abv: "43%", rating: 4.9, tasting: "Honey, candied orange peel, white chocolate and a gentle herbal smoke.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", pairing: "Wagyu, Mochi", body: "Medium Body" },
  { id: 106, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Johnnie Walker Blue", subtitle: "Premium Blended Scotch", type: "Whiskey", tag: "Blended Scotch", origin: "Scotland", abv: "40%", rating: 4.9, tasting: "Hazelnuts, honey, sherry and oranges with a perfectly balanced smoke.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", pairing: "Dark Chocolate", body: "Full Body" },
  { id: 107, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Glenmorangie Lasanta", subtitle: "Sherry Cask Finish", type: "Whiskey", tag: "Single Malt", origin: "Scottish Highlands", abv: "43%", rating: 4.8, tasting: "Spiced orange and walnuts with warming sherry notes and caramel.", image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d91?w=600&q=85", pairing: "Stilton Cheese", body: "Medium Body" },
  { id: 108, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Yamazaki 12", subtitle: "Japanese Single Malt", type: "Whiskey", tag: "Japanese Malt", origin: "Osaka, Japan", abv: "43%", rating: 4.9, tasting: "Succulent with soft fruit and Mizunara (Japanese oak) aroma.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", pairing: "Sashimi", body: "Light Body" },
  { id: 109, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Johnnie Walker Gold", subtitle: "Reserve Blended", type: "Whiskey", tag: "Blended Scotch", origin: "Scotland", abv: "40%", rating: 4.7, tasting: "Luscious fruit and vanilla with a gentle hint of smoldering embers.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", pairing: "Apple Tart", body: "Medium Body" },
  { id: 110, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Macallan 12", subtitle: "Double Cask", type: "Whiskey", tag: "Single Malt", origin: "Speyside, Scotland", abv: "40%", rating: 4.8, tasting: "Classic Macallan style with sweet apple, vanilla and gentle spice.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", pairing: "Roasted Nuts", body: "Full Body" },
  { id: 111, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Glenmorangie Signet", subtitle: "High-Roasted Malt", type: "Whiskey", tag: "Single Malt", origin: "Scottish Highlands", abv: "46%", rating: 5.0, tasting: "Rich espresso, plum pudding and dark chocolate with spiced orange.", image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d91?w=600&q=85", pairing: "Truffles", body: "Full Body" },
  { id: 112, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Woodford Reserve", subtitle: "Kentucky Straight", type: "Whiskey", tag: "Bourbon", origin: "Kentucky, USA", abv: "43.2%", rating: 4.7, tasting: "Rich, chewy, rounded and smooth with complex citrus, cinnamon and cocoa.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", pairing: "Steak", body: "Medium Body" },

  // --- WINE (12+ ITEMS) ---
  { id: 201, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Château Margaux", subtitle: "Premier Grand Cru Classé", type: "Wine", tag: "Red Bordeaux", origin: "Bordeaux, France", abv: "13.5%", rating: 4.9, tasting: "Dark berry, cedar, violet and perfectly polished tannins with long finish.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Lamb, Steak", body: "Full Body" },
  { id: 202, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Cloudy Bay", subtitle: "Sauvignon Blanc", type: "Wine", tag: "White Wine", origin: "Marlborough, NZ", abv: "13%", rating: 4.5, tasting: "Zesty passionfruit, citrus and crisp mineral finish with lingering freshness.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", pairing: "Seafood, Salads", body: "Light Body" },
  { id: 203, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Veuve Clicquot", subtitle: "Yellow Label Brut", type: "Wine", tag: "Champagne", origin: "Reims, France", abv: "12%", rating: 4.8, tasting: "Toasty brioche, fresh apple and a persistent mousse with refined elegance.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", pairing: "Oysters, Sushi", body: "Medium Body" },
  { id: 204, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Sassicaia", subtitle: "Tenuta San Guido", type: "Wine", tag: "Super Tuscan", origin: "Tuscany, Italy", abv: "14%", rating: 4.9, tasting: "Intense dark fruit, savory herbs, and elegant structure with firm tannins.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Filet Mignon", body: "Full Body" },
  { id: 205, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Dom Pérignon", subtitle: "Vintage Champagne", type: "Wine", tag: "Champagne", origin: "Champagne, France", abv: "12.5%", rating: 5.0, tasting: "Complex roasted almonds, brioche, and white fruit with creamy bubbles.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", pairing: "Caviar", body: "Medium Body" },
  { id: 206, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Oyster Bay", subtitle: "Marlborough Pinot Noir", type: "Wine", tag: "Red Wine", origin: "Marlborough, NZ", abv: "13.5%", rating: 4.4, tasting: "Fragrant red cherry, dark plum and sweet spice with a silky finish.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Roasted Duck", body: "Light Body" },
  { id: 207, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Opus One", subtitle: "Napa Valley Red Blend", type: "Wine", tag: "Red Blend", origin: "California, USA", abv: "14.5%", rating: 4.9, tasting: "Blackberry, cassis, and dark chocolate intertwined with velvety tannins.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Prime Rib", body: "Full Body" },
  { id: 208, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Santa Margherita", subtitle: "Pinot Grigio", type: "Wine", tag: "White Wine", origin: "Alto Adige, Italy", abv: "12.5%", rating: 4.5, tasting: "Clean, crisp, with refreshing green apple and subtle minerality.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", pairing: "Light Pasta", body: "Light Body" },
  { id: 209, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Penfolds Grange", subtitle: "Bin 95 Shiraz", type: "Wine", tag: "Red Wine", origin: "South Australia", abv: "14.5%", rating: 5.0, tasting: "Deep, intense plum, dark chocolate and robust tannins that linger.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Aged Beef", body: "Full Body" },
  { id: 210, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Whispering Angel", subtitle: "Côtes de Provence", type: "Wine", tag: "Rosé", origin: "Provence, France", abv: "13%", rating: 4.6, tasting: "Delicate grapefruit, white peach and subtle floral notes.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", pairing: "Grilled Fish", body: "Light Body" },
  { id: 211, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Louis Latour", subtitle: "Chablis", type: "Wine", tag: "White Wine", origin: "Burgundy, France", abv: "12.5%", rating: 4.7, tasting: "Crisp acidity with flinty minerality and notes of green apple.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", pairing: "Oysters", body: "Light Body" },
  { id: 212, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Caymus", subtitle: "Napa Valley Cabernet", type: "Wine", tag: "Red Wine", origin: "California, USA", abv: "14.8%", rating: 4.8, tasting: "Lush ripe cherry, cocoa and silky, refined tannins throughout.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Ribeye Steak", body: "Full Body" },

  // --- BEERS (12+ ITEMS) ---
  { id: 301, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Weihenstephaner", subtitle: "Hefeweissbier", type: "Beers", tag: "Wheat Beer", origin: "Bavaria, Germany", abv: "5.4%", rating: 4.7, tasting: "Banana, clove and a beautifully hazy golden body with creamy head.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Pretzels", body: "Medium Body" },
  { id: 302, brandId: "guinness", property: "Kennedia Blu", location: "Ghaziabad", name: "Guinness Draught", subtitle: "Irish Stout", type: "Beers", tag: "Irish Stout", origin: "Dublin, Ireland", abv: "4.2%", rating: 4.9, tasting: "Silky nitrogen cascade with roasted coffee and chocolate undertones.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", pairing: "Oysters, Pot Pie", body: "Full Body" },
  { id: 303, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Brooklyn Lager", subtitle: "American Amber", type: "Beers", tag: "Lager", origin: "New York, USA", abv: "5.2%", rating: 4.4, tasting: "Toasty malt, floral hops and a clean, crisp finish with caramel notes.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Burgers, Pizza", body: "Medium Body" },
  { id: 304, brandId: "guinness", property: "Kennedia Blu", location: "Ghaziabad", name: "Guinness Extra", subtitle: "Foreign Extra Stout", type: "Beers", tag: "Stout", origin: "Dublin, Ireland", abv: "7.5%", rating: 4.6, tasting: "Rich and robust with a sharp bite, dark chocolate, and roasted barley.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", pairing: "Beef Stew", body: "Full Body" },
  { id: 305, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Bira 91 White", subtitle: "Wheat Beer", type: "Beers", tag: "Wheat Beer", origin: "New Delhi, India", abv: "4.7%", rating: 4.3, tasting: "Citrusy with a hint of coriander and a smooth, refreshing finish.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Spicy Curry", body: "Light Body" },
  { id: 306, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Sierra Nevada", subtitle: "Pale Ale", type: "Beers", tag: "Pale Ale", origin: "California, USA", abv: "5.6%", rating: 4.5, tasting: "Piney and grapefruit hop aromas intertwined with caramelized malt.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Spicy Tacos", body: "Medium Body" },
  { id: 307, brandId: "guinness", property: "Kennedia Blu", location: "Ghaziabad", name: "Hop House 13", subtitle: "Lager", type: "Beers", tag: "Lager", origin: "Dublin, Ireland", abv: "5.0%", rating: 4.4, tasting: "Crisp flavor with notes of apricot and peach on the nose.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", pairing: "Fried Chicken", body: "Medium Body" },
  { id: 308, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Hoegaarden", subtitle: "Belgian Witbier", type: "Beers", tag: "Wheat Beer", origin: "Hoegaarden, BE", abv: "4.9%", rating: 4.6, tasting: "Unfiltered with a soft structure, notes of coriander and orange peel.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Mussels", body: "Light Body" },
  { id: 309, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Lagunitas IPA", subtitle: "India Pale Ale", type: "Beers", tag: "IPA", origin: "California, USA", abv: "6.2%", rating: 4.7, tasting: "Well-rounded, highly drinkable IPA. A bit of Caramel Malt barley.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Sharp Cheddar", body: "Medium Body" },
  { id: 310, brandId: "guinness", property: "Kennedia Blu", location: "Ghaziabad", name: "Smithwick's", subtitle: "Irish Ale", type: "Beers", tag: "Red Ale", origin: "Kilkenny, Ireland", abv: "4.5%", rating: 4.4, tasting: "Gentle hop bitterness, sweet malty notes with a ruby red hue.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", pairing: "Pork Chops", body: "Medium Body" },
  { id: 311, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Chimay Blue", subtitle: "Trappist Ale", type: "Beers", tag: "Dark Ale", origin: "Chimay, Belgium", abv: "9.0%", rating: 4.8, tasting: "Dark, complex, with a touch of rosy sweetness and peppery finish.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Strong Cheese", body: "Full Body" },
  { id: 312, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Blue Moon", subtitle: "Belgian White", type: "Beers", tag: "Wheat Beer", origin: "Colorado, USA", abv: "5.4%", rating: 4.3, tasting: "Crisp and tangy with subtle citrus sweetness from Valencia orange peel.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Fish Tacos", body: "Light Body" },

  // --- TASTINGS (12+ ITEMS) ---
  { id: 401, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Whiskey Master Class", subtitle: "House Experience", type: "Tastings", tag: "Event", origin: "In-House", abv: "Varies", rating: 5.0, tasting: "Five single malts, one sommelier, one hour of sensory discovery.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Matched Bites", body: "Educational" },
  { id: 402, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Wine & Terroir Flight", subtitle: "Bordeaux vs New World", type: "Tastings", tag: "Flight", origin: "In-House", abv: "Varies", rating: 4.9, tasting: "Six wines, blind tasting format, guided by our resident sommelier.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Artisan Cheese", body: "Educational" },
  { id: 403, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Scotch Blends 101", subtitle: "Guided Tasting", type: "Tastings", tag: "Flight", origin: "In-House", abv: "Varies", rating: 4.8, tasting: "Discover the art of blending with four premium Johnnie Walker expressions.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Cured Meats", body: "Educational" },
  { id: 404, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Vodka Caviar Evening", subtitle: "Premium Pairing", type: "Tastings", tag: "Event", origin: "In-House", abv: "Varies", rating: 4.9, tasting: "Three Beluga expressions paired with oscietra and beluga caviar.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Caviar Blinis", body: "Luxury" },
  { id: 405, brandId: "guinness", property: "Kennedia Blu", location: "Ghaziabad", name: "Stout & Oysters", subtitle: "Irish Tradition", type: "Tastings", tag: "Pairing", origin: "In-House", abv: "Varies", rating: 4.7, tasting: "Three different stout varieties paired with fresh native oysters.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", pairing: "Fresh Oysters", body: "Traditional" },
  { id: 406, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Japanese Whisky Flight", subtitle: "The Harmonious Journey", type: "Tastings", tag: "Flight", origin: "In-House", abv: "Varies", rating: 5.0, tasting: "Explore the delicate craft of Japanese whisky with three rare pours.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Wagyu Skewers", body: "Exclusive" },
  { id: 407, brandId: "glenmorangie", property: "Kennedia Blu", location: "Ghaziabad", name: "Champagne Celebration", subtitle: "Vintage Tasting", type: "Tastings", tag: "Event", origin: "In-House", abv: "Varies", rating: 4.9, tasting: "A guided journey through three prestigious Champagne houses.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Canapés", body: "Luxury" },
  { id: 408, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Craft Beer Discovery", subtitle: "Local & Global", type: "Tastings", tag: "Flight", origin: "In-House", abv: "Varies", rating: 4.6, tasting: "Five distinct beer styles from around the world to expand your palate.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Sliders", body: "Casual" },
  { id: 409, brandId: "beluga", property: "Kennedia Blu", location: "Ghaziabad", name: "Aged Rum Masterclass", subtitle: "Caribbean Secrets", type: "Tastings", tag: "Event", origin: "In-House", abv: "Varies", rating: 4.8, tasting: "Taste the history of the Caribbean through four exceptionally aged rums.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Dark Chocolate", body: "Educational" },
  { id: 410, brandId: "guinness", property: "Kennedia Blu", location: "Ghaziabad", name: "Tequila & Mezcal", subtitle: "Agave Exploration", type: "Tastings", tag: "Flight", origin: "In-House", abv: "Varies", rating: 4.7, tasting: "Discover the smoky and earthy profiles of premium agave spirits.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Ceviche", body: "Educational" },
  { id: 411, brandId: "hibiki", property: "Kennedia Blu", location: "Ghaziabad", name: "Oenophile Evening", subtitle: "Rare Vintages", type: "Tastings", tag: "Event", origin: "In-House", abv: "Varies", rating: 5.0, tasting: "An exclusive tasting of five rare cellar vintages from the 1990s.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Gourmet Cheese", body: "Exclusive" },
  { id: 412, brandId: "johnnie-walker", property: "Kennedia Blu", location: "Ghaziabad", name: "Gin Botanicals", subtitle: "Sensory Workshop", type: "Tastings", tag: "Workshop", origin: "In-House", abv: "Varies", rating: 4.8, tasting: "Blend your own gin while tasting four distinctive botanical profiles.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Cucumber Sandwiches", body: "Interactive" }
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function ImgWithFallback({ src, alt, className }) {
  const [err, setErr] = useState(false);
  if (!src || err)
    return (
      <div className={`flex items-center justify-center bg-stone-100 dark:bg-zinc-900 ${className}`}>
        <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
      </div>
    );
  return <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setErr(true)} />;
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={9} className={s <= Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-stone-300 dark:text-zinc-700"} />
      ))}
      <span className="ml-1 text-[11px] font-bold tabular-nums text-amber-600 dark:text-amber-400">{rating}</span>
    </div>
  );
}

// ─── TYPE HERO ────────────────────────────────────────────────────────────────
function TypeHero({ meta, citySlug, propertySlug }) {
  const accent = meta.accent;
  return (
    <section id="hero" className="relative h-svh w-full overflow-hidden bg-[#0D0508]">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img src={meta.heroImage} alt={meta.heroAlt} className="h-full w-full object-cover" />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      <div className="relative z-10 flex h-full items-end pb-24 pt-[120px]">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
            >
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <Link to="/wine-homepage" className="hover:text-white transition-colors">Wines</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <Link to={`/wine-detail/${citySlug}/${propertySlug}`} className="hover:text-white transition-colors capitalize">{citySlug}</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <span className="text-white/60">{meta.typeKey}</span>
            </motion.nav>

            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-4">
              <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.45em]" style={{ color: accent.dot }}>
                {meta.tag}
              </span>
              <h1 className="font-serif text-5xl font-black italic leading-[1.1] text-white md:text-6xl lg:text-7xl">
                {meta.label.split(" ")[0]}{" "}
                <em className="not-italic" style={{ color: "#D4AF37" }}>
                  {meta.label.split(" ").slice(1).join(" ")}
                </em>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-8 max-w-lg text-sm italic leading-relaxed text-white/65 md:text-base"
            >
              {meta.description}
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.7 }} className="flex items-center gap-4">
              <div className="h-px w-10 opacity-40" style={{ background: accent.dot }} />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Kennedia Blu · Estate Collection</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 right-12 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white/30">Explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={14} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── BRAND HERO ───────────────────────────────────────────────────────────────
function BrandHero({ brand, citySlug, propertySlug }) {
  return (
    <section id="hero" className="relative h-svh w-full overflow-hidden bg-[#0D0508]">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img src={brand.heroImage} alt={brand.name} className="h-full w-full object-cover" />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 50%, transparent 100%)` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      {/* Accent line */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1" style={{ background: `linear-gradient(to bottom, transparent, ${brand.accent}, transparent)`, opacity: 0.6 }} />

      <div className="relative z-10 flex h-full items-end pb-24 pt-[120px]">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
            >
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <Link to="/wine-homepage" className="hover:text-white transition-colors">Wines</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <Link to={`/wine-detail/${citySlug}/${propertySlug}`} className="hover:text-white transition-colors capitalize">{citySlug}</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <span className="text-white/60">{brand.name}</span>
            </motion.nav>

            {/* Brand badge */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-10 opacity-50" style={{ background: brand.accent }} />
                <span className="text-[10px] font-black uppercase tracking-[0.45em]" style={{ color: brand.accent }}>
                  {brand.detail} · Est. {brand.established}
                </span>
              </div>

              <h1 className="mb-1 font-serif text-5xl font-black leading-[1.0] text-white md:text-6xl lg:text-7xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {brand.name}
              </h1>

              <div className="mt-2 h-px w-32 opacity-60" style={{ background: `linear-gradient(to right, ${brand.accent}, transparent)` }} />
              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/40">{brand.subLabel}</p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="mb-8 max-w-lg text-sm italic leading-relaxed text-white/65 md:text-base"
            >
              {brand.description}
            </motion.p>

            {/* Meta pills */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <MapPin size={11} className="text-[#D4AF37]" />
                <span className="text-[11px] font-semibold text-white/80">{brand.origin}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <Sparkles size={11} style={{ color: brand.accent }} />
                <span className="text-[11px] font-semibold text-white/80">{brand.tagline}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 right-12 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white/30">Explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={14} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ drink, index }) {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_ACCENTS[drink.type] || TYPE_ACCENTS.Wine;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.55 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.07] dark:bg-[#1A0C13] cursor-pointer"
    >
      <div className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500" style={{ background: hovered ? `linear-gradient(to bottom, ${accent.dot}, ${accent.color})` : "transparent" }} />

      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <ImgWithFallback
          src={drink.image}
          alt={drink.name}
          className={`h-full w-full transition-transform duration-700 ${hovered ? "scale-[1.06]" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest" style={{ color: accent.color, backgroundColor: accent.bg + "ee", border: `1px solid ${accent.color}30` }}>
            {drink.tag}
          </span>
        </div>

        {/* ABV badge */}
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-bold text-white/90 backdrop-blur-sm">
            {drink.abv} ABV
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-serif text-[1.2rem] leading-tight text-stone-900 dark:text-stone-100">{drink.name}</h3>
          <p className="mt-0.5 text-[11px] italic text-stone-400">{drink.subtitle}</p>
        </div>

        <p className="mt-3 line-clamp-2 text-[11px] italic leading-relaxed text-stone-400 dark:text-stone-500">"{drink.tasting}"</p>
      </div>
    </motion.div>
  );
}

// ─── TYPE ITEMS SECTION ───────────────────────────────────────────────────────
function TypeCategoryGroup({ brandName, brand, brandItems, gi, citySlug, propertySlug }) {
  const [expanded, setExpanded] = useState(false);
  const displayedItems = expanded ? brandItems : brandItems.slice(0, 10);

  return (
    <div className="mb-16">
      {/* Brand sub-header */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-stone-200 bg-white flex items-center justify-center dark:border-white/10 dark:bg-white/5">
            <Wine size={14} className="text-stone-400" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.35em] text-stone-300">Brand</p>
            <h3 className="font-serif text-lg text-stone-800 dark:text-stone-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {brand?.name || brandName}
              {brand && (
                <Link
                  to={`/wine-detail/${citySlug}/${propertySlug}/${brand.id}`}
                  className="ml-2 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: brand.accent }}
                >
                  View Brand →
                </Link>
              )}
            </h3>
          </div>
        </div>
        <div className="flex-1 h-px bg-stone-200/60 dark:bg-white/5" />
        <span className="text-[9px] font-bold text-stone-300">{brandItems.length} expression{brandItems.length !== 1 ? "s" : ""}</span>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedItems.map((d, i) => <ItemCard key={d.id} drink={d} index={gi * 10 + i} />)}
      </div>

      {brandItems.length > 10 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="group flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-transparent px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10 cursor-pointer"
          >
            {expanded ? "Show Less" : "Show More"}
            <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
}

function TypeItemsSection({ items, meta, citySlug, propertySlug }) {
  const accent = meta.accent;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.tag.toLowerCase().includes(lower) ||
        d.subtitle?.toLowerCase().includes(lower)
    );
  }, [items, searchTerm]);

  // Group by brand
  const byBrand = useMemo(() => {
    const map = {};
    filteredItems.forEach((d) => {
      const b = BRANDS.find((br) => br.id === d.brandId);
      const key = b ? b.name : "Other";
      if (!map[key]) map[key] = { brand: b, items: [] };
      map[key].items.push(d);
    });
    return Object.entries(map);
  }, [filteredItems]);

  return (
    <section id="collection" className="relative overflow-hidden bg-[#FAF8F4] py-20 dark:bg-[#0D0508]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-10 opacity-40" style={{ background: accent.dot }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: accent.color }}>
                Full Collection
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-[1.1] text-stone-900 md:text-5xl dark:text-stone-100">
              All {meta.typeKey} <em className="not-italic" style={{ color: accent.color }}>Across Every Brand</em>
            </h2>
            <p className="mt-3 max-w-xl text-sm italic text-stone-400">{filteredItems.length} expressions available at Kennedia Blu</p>
          </div>

          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-stone-200 bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-[#D4AF37] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-amber-600 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {byBrand.length === 0 && (
          <div className="py-20 text-center text-stone-400">No items found for this category.</div>
        )}

        {byBrand.map(([brandName, { brand, items: brandItems }], gi) => (
          <TypeCategoryGroup
            key={brandName}
            brandName={brandName}
            brand={brand}
            brandItems={brandItems}
            gi={gi}
            citySlug={citySlug}
            propertySlug={propertySlug}
          />
        ))}
      </div>
    </section>
  );
}

// ─── BRAND ITEMS SECTION ──────────────────────────────────────────────────────
function BrandCategoryGroup({ typeName, typeItems, gi, activeType, acc }) {
  const [expanded, setExpanded] = useState(false);
  const displayedItems = expanded ? typeItems : typeItems.slice(0, 10);

  return (
    <div className="mb-16">
      {activeType === "All" && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: acc.dot }} />
            <h3 className="font-serif text-xl text-stone-800 dark:text-stone-200">{typeName}</h3>
          </div>
          <div className="flex-1 h-px bg-stone-200/60 dark:bg-white/5" />
          <span className="text-[9px] font-bold text-stone-300">{typeItems.length} expression{typeItems.length !== 1 ? "s" : ""}</span>
        </motion.div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedItems.map((d, i) => <ItemCard key={d.id} drink={d} index={gi * 10 + i} />)}
      </div>

      {typeItems.length > 10 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="group flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-transparent px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10 cursor-pointer"
          >
            {expanded ? "Show Less" : "Show More"}
            <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
}

function BrandItemsSection({ items, brand }) {
  const [activeType, setActiveType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const types = useMemo(() => {
    const set = new Set(items.map((d) => d.type));
    return ["All", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    let base = activeType === "All" ? items : items.filter((d) => d.type === activeType);
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      base = base.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.tag.toLowerCase().includes(lower) ||
          d.subtitle?.toLowerCase().includes(lower)
      );
    }
    return base;
  }, [items, activeType, searchTerm]);

  // Group filtered by type
  const byType = useMemo(() => {
    if (activeType !== "All") return [[activeType, filtered]];
    const map = {};
    filtered.forEach((d) => {
      if (!map[d.type]) map[d.type] = [];
      map[d.type].push(d);
    });
    return Object.entries(map);
  }, [filtered, activeType]);

  return (
    <section id="collection" className="relative overflow-hidden bg-[#FAF8F4] py-20 dark:bg-[#0D0508]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-10 opacity-50" style={{ background: brand.accent }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: brand.accent }}>
                {brand.subLabel}
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-[1.1] text-stone-900 md:text-5xl dark:text-stone-100">
              {brand.name} <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">Collection</em>
            </h2>
            <p className="mt-3 max-w-xl text-sm italic text-stone-400">{filtered.length} expression{filtered.length !== 1 ? "s" : ""} available</p>
          </div>

          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-stone-200 bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-[#D4AF37] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#c9a25a] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Type filter tabs */}
        {types.length > 2 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {types.map((t) => {
              const acc = t !== "All" ? TYPE_ACCENTS[t] : null;
              const isActive = t === activeType;
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className="rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={
                    isActive
                      ? { color: acc?.color || "#8B1A2A", backgroundColor: acc?.bg || "#FDF2F4", borderColor: (acc?.color || "#8B1A2A") + "40" }
                      : { color: "#a8a29e", backgroundColor: "transparent", borderColor: "#e7e5e4" }
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {items.length === 0 && (
          <div className="py-20 text-center text-stone-400">No items found for this brand.</div>
        )}

        {byType.map(([typeName, typeItems], gi) => {
          const acc = TYPE_ACCENTS[typeName] || TYPE_ACCENTS.Wine;
          return (
            <BrandCategoryGroup
              key={typeName}
              typeName={typeName}
              typeItems={typeItems}
              gi={gi}
              activeType={activeType}
              acc={acc}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── OTHER BRANDS / TYPES STRIP ───────────────────────────────────────────────
function RelatedStrip({ currentSlug, isTypePage, citySlug, propertySlug }) {
  const navigate = useNavigate();

  if (isTypePage) {
    const others = Object.entries(TYPE_META).filter(([k]) => k !== currentSlug);
    return (
      <section className="bg-[#F0EAE2] py-14 dark:bg-[#100609]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-10 bg-[#8B1A2A]/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B1A2A]">More Collections</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {others.map(([slug, meta]) => (
              <motion.button
                key={slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/wine-detail/${citySlug}/${propertySlug}/${slug}`)}
                className="group relative overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.07] dark:bg-[#1A0C13] cursor-pointer"
              >
                <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: `linear-gradient(to bottom, ${meta.accent.dot}, ${meta.accent.color})`, opacity: 0.5 }} />
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest" style={{ color: meta.accent.color }}>{meta.tag}</p>
                <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100">{meta.label}</h4>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-stone-300 transition-colors group-hover:text-stone-500">Explore →</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const others = BRANDS.filter((b) => b.id !== currentSlug);
  return (
    <section className="bg-[#F0EAE2] py-14 dark:bg-[#100609]">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px w-10 bg-[#c9a25a]/40" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a25a]">More Brands</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {others.map((b, i) => (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/wine-detail/${citySlug}/${propertySlug}/${b.id}`)}
              className="group relative overflow-hidden rounded-[1.25rem] border border-stone-200/80 bg-white/90 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.07] dark:bg-[#1A0C13] cursor-pointer"
            >
              <div className="absolute inset-x-4 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${b.accent}, transparent)`, opacity: 0.7 }} />
              <p className="mb-0.5 text-[8px] uppercase tracking-[0.4em]" style={{ color: b.accent + "cc" }}>{b.detail}</p>
              <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{b.name}</h4>
              <div className="mx-auto my-2 h-px w-8" style={{ background: `linear-gradient(90deg, transparent, ${b.accent}, transparent)` }} />
              <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: b.accent + "cc" }}>{b.subLabel}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function WineCategoryTemplate() {
  const { citySlug, propertySlug, slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const normalizedSlug = slug?.toLowerCase() ?? "";
  const isTypePage = DRINK_TYPE_SLUGS.includes(normalizedSlug);
  const typeMeta = isTypePage ? TYPE_META[normalizedSlug] : null;
  const brand = !isTypePage ? BRANDS.find((b) => b.id === normalizedSlug) : null;

  const items = useMemo(() => {
    if (isTypePage) {
      return DRINKS_DATA.filter((d) => d.type.toLowerCase() === typeMeta.typeKey.toLowerCase());
    }
    if (brand) {
      return DRINKS_DATA.filter((d) => d.brandId === brand.id);
    }
    return [];
  }, [isTypePage, typeMeta, brand]);

  // 404 fallback
  if (!isTypePage && !brand) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0D0508]">
        <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <Wine size={48} className="text-stone-300" />
          <h2 className="font-serif text-4xl text-stone-800 dark:text-stone-200">Collection Not Found</h2>
          <p className="text-stone-400">The category or brand you are looking for is not available.</p>
          <button
            onClick={() => navigate(`/wine-detail/${citySlug}/${propertySlug}`)}
            className="flex items-center gap-2 rounded-full bg-[#8B1A2A] px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all cursor-pointer"
          >
            <ArrowLeft size={13} /> Back to Wine Estate
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAF8F4] dark:bg-[#0D0508]">
      <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} />

      <main>
        {/* Hero */}
        {isTypePage ? (
          <TypeHero meta={typeMeta} citySlug={citySlug} propertySlug={propertySlug} />
        ) : (
          <BrandHero brand={brand} citySlug={citySlug} propertySlug={propertySlug} />
        )}

        {/* Back pill */}
        <div className="bg-[#FAF8F4] dark:bg-[#0D0508]">
          <div className="mx-auto max-w-[1400px] px-6 py-5 md:px-12">
            <button
              onClick={() => navigate(`/wine-detail/${citySlug}/${propertySlug}`)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Estate
            </button>
          </div>
        </div>

        {/* Items */}
        {isTypePage ? (
          <TypeItemsSection items={items} meta={typeMeta} citySlug={citySlug} propertySlug={propertySlug} />
        ) : (
          <BrandItemsSection items={items} brand={brand} />
        )}

        {/* Related strip */}
        <RelatedStrip currentSlug={normalizedSlug} isTypePage={isTypePage} citySlug={citySlug} propertySlug={propertySlug} />
      </main>

      <div id="contact" className="bg-[#EDE7DF] dark:bg-[#0A0407]">
        <Footer />
      </div>

      <WineWhatsAppButton />
    </div>
  );
}
