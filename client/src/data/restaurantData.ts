// Restaurant Data - Kennedia Blu Restaurant Homepage
// Centralized data source for all restaurant content

export interface RestaurantInfo {
  name: string;
  tagline: string;
  cuisines: string[];
  description: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
  };
  contact: {
    phones: string[];
    email?: string;
  };
  hours: {
    days: string;
    time: string;
  };
  specialOffer?: {
    title: string;
    description: string;
    timing: string;
    price: string;
  };
}

export interface CuisineCategory {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface RestaurantStat {
  label: string;
  value: string;
  suffix?: string;
}

export interface BanquetService {
  title: string;
  description: string;
  icon?: string;
}

export interface Event {
  title: string;
  guest?: string;
  time: string;
  description: string;
  date?: string;
}

export interface DishCategory {
  id: string;
  name: string;
}

export interface Dish {
  name: string;
  category: string;
  description?: string;
  price?: string;
  image?: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  location?: string;
}

// Restaurant Information
export const restaurantInfo: RestaurantInfo = {
  name: "Kennedia Blu",
  tagline: "Where Flavors Meet Elegance",
  cuisines: ["Chinese", "Japanese", "Indian Tandoor"],
  description: "Experience the finest BYOB dining in Ghaziabad. Kennedia Blu brings together authentic flavors from across Asia with a touch of modern elegance. Our chefs craft each dish with passion, using the freshest ingredients to create memorable culinary experiences.",
  address: {
    street: "Noor Nagar",
    area: "Raj Nagar Extension",
    city: "Ghaziabad",
    state: "Uttar Pradesh"
  },
  contact: {
    phones: ["+91-9211308384", "+91-9211308385"],
    email: "reservations@kennediablu.com"
  },
  hours: {
    days: "Monday – Sunday",
    time: "10:00 AM – 10:00 PM"
  },
  specialOffer: {
    title: "Unlimited Buffet",
    description: "Unlimited Veg/Non-Veg Buffet",
    timing: "1:00 PM – 3:00 PM",
    price: "₹499"
  }
};

// Cuisine Categories
export const cuisineCategories: CuisineCategory[] = [
  {
    id: "italian",
    title: "Italian",
    description: "Authentic Italian flavors with a modern twist",
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800"
  },
  {
    id: "luxury-lounge",
    title: "Luxury Family Lounge",
    description: "Premium dining experience for the whole family",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800"
  },
  {
    id: "spicy-darbar",
    title: "Spicy Darbar",
    description: "Fiery Indian delicacies that tantalize your taste buds",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=800"
  },
  {
    id: "takeaway",
    title: "Takeaway Treats",
    description: "Delicious meals to enjoy at home",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800"
  }
];

// Restaurant Statistics
export const restaurantStats: RestaurantStat[] = [
  {
    label: "Years of Experience",
    value: "3",
    suffix: "+"
  },
  {
    label: "Menus / Dishes",
    value: "100",
    suffix: "+"
  },
  {
    label: "Staffs",
    value: "30",
    suffix: "+"
  },
  {
    label: "Happy Customers",
    value: "3000",
    suffix: "+"
  }
];

// Banquets & Catering Services
export const banquetServices: BanquetService[] = [
  {
    title: "Birthday Party",
    description: "Private celebrations with curated menus and ambiance. Make your special day unforgettable with our personalized service."
  },
  {
    title: "Business Meetings",
    description: "Elegant BYOB space for professional gatherings. Impress your clients in our sophisticated setting."
  },
  {
    title: "Wedding Party",
    description: "Luxury intimate wedding celebrations. Create magical moments with our exquisite catering and ambiance."
  }
];

// Events Schedule
export const eventsSchedule: Event[] = [
  {
    title: "Grand Opening",
    guest: "Dr. Jay Prakash",
    time: "6:00 PM – 10:00 PM",
    description: "Join us for the grand opening of Kennedia Blu, Ghaziabad. Experience an evening of culinary excellence.",
    date: "15th June"
  },
  {
    title: "DJ Night",
    time: "8:00 PM – 9:00 PM",
    description: "Bollywood music & vibrant night vibes. Dance the night away with our live DJ."
  }
];

// Dish Categories
export const dishCategories: DishCategory[] = [
  { id: "spicy-darbar", name: "Spicy Darbar" },
  { id: "chinese", name: "Chinese" },
  { id: "drinks", name: "Drinks" },
  { id: "desserts", name: "Desserts" }
];

// Signature Dishes
export const signatureDishes: Dish[] = [
  {
    name: "Rolls & Wraps",
    category: "spicy-darbar",
    description: "Perfectly spiced wraps with tender fillings"
  },
  {
    name: "Tandoori",
    category: "spicy-darbar",
    description: "Authentic tandoor-grilled delicacies"
  },
  {
    name: "Dum Biryanis",
    category: "spicy-darbar",
    description: "Aromatic rice layered with succulent meat"
  },
  {
    name: "Grilled Potatoes",
    category: "spicy-darbar",
    description: "Crispy on the outside, soft on the inside"
  },
  {
    name: "Hakka Noodles",
    category: "chinese",
    description: "Stir-fried noodles with fresh vegetables"
  },
  {
    name: "Manchurian",
    category: "chinese",
    description: "Crispy vegetable balls in tangy sauce"
  },
  {
    name: "Fried Rice",
    category: "chinese",
    description: "Wok-tossed rice with authentic flavors"
  },
  {
    name: "Spring Rolls",
    category: "chinese",
    description: "Crispy rolls with savory filling"
  },
  {
    name: "Signature Mocktails",
    category: "drinks",
    description: "Refreshing non-alcoholic beverages"
  },
  {
    name: "Fresh Juices",
    category: "drinks",
    description: "Seasonal fruit juices"
  },
  {
    name: "Lassi",
    category: "drinks",
    description: "Traditional yogurt-based drink"
  },
  {
    name: "Gulab Jamun",
    category: "desserts",
    description: "Soft milk dumplings in sugar syrup"
  },
  {
    name: "Rasmalai",
    category: "desserts",
    description: "Cottage cheese patties in sweet milk"
  },
  {
    name: "Ice Cream",
    category: "desserts",
    description: "Assorted premium flavors"
  }
];

// Customer Testimonials
export const testimonials: Testimonial[] = [
  {
    name: "Neha",
    text: "Chinese menu is surprisingly good! The Hakka noodles were perfectly cooked and the Manchurian was delicious.",
    rating: 5
  },
  {
    name: "Ananya R",
    text: "Perfectly grilled kebabs and rich flavors. The tandoori platter is a must-try. Excellent service too!",
    rating: 5
  },
  {
    name: "Rohan",
    text: "Juicy tandoori platter, great with drinks. The BYOB concept is brilliant. Will definitely come back!",
    rating: 5
  }
];

// Footer Content
export const footerContent = {
  brandDescription: "Kennedia Blu brings together the finest flavors from across Asia in an elegant BYOB setting. Experience culinary excellence in the heart of Ghaziabad.",
  quickLinks: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Menu", href: "#menu" },
    { label: "Contact", href: "#contact" }
  ],
  socialLinks: [
    { platform: "Facebook", url: "#", icon: "facebook" },
    { platform: "Instagram", url: "#", icon: "instagram" },
    { platform: "Twitter", url: "#", icon: "twitter" }
  ]
};
