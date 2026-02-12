export const HOTEL_NEWS_ITEMS = [
  {
    slug: "best-luxury-hotel-award-2025",
    image: { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop", alt: "Award Ceremony" },
    date: "Jan 10, 2026",
    title: "Kennedia Blu Wins Best Luxury Hotel Award 2025",
    description: "We are honored to be recognized as the leading luxury hotel brand for the third consecutive year, setting new standards in hospitality.",
    category: "Awards"
  },
  {
    slug: "new-michelin-star-chef",
    image: { src: "https://images.unsplash.com/photo-1577106263724-2c8e03bfe9f4?q=80&w=2070&auto=format&fit=crop", alt: "Chef Cooking" },
    date: "Dec 28, 2025",
    title: "New Michelin Star Chef Joins Our Flagship Restaurant",
    description: "Chef Elena Rossi brings her culinary mastery and innovative vision to our signature dining experience, promising an unforgettable journey for your palate.",
    category: "Culinary"
  },
  {
    slug: "sustainable-luxury-commitment",
    image: { src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1527&auto=format&fit=crop", alt: "Green Garden" },
    date: "Dec 15, 2025",
    title: "Sustainable Luxury: Our Commitment to Zero Carbon",
    description: "Launching our ambitious initiative to achieve carbon neutrality across all properties by 2030 without compromising on luxury.",
    category: "Sustainability"
  },
  {
    slug: "introducing-royal-suite",
    image: { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop", alt: "Royal Suite Interior" },
    date: "Dec 05, 2025",
    title: "Introducing The Royal Suite: A New Standard of Opulence",
    description: "Experience the pinnacle of comfort in our newly renovated Royal Suites, featuring panoramic city views and exclusive butler service.",
    category: "Rooms & Suites"
  }
];

export const HOTEL_OFFERS = [
  {
    id: "weekend-luxury-getaway",
    title: "Weekend Luxury Getaway",
    description: "Escape the city with our 2-night luxury package including breakfast and spa credit.",
    image: { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2074&auto=format&fit=crop", alt: "Luxury Pool" },
    location: "All Locations",
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Stay",
    couponCode: "WEEKEND25",
    discount: "25% OFF",
    availableHours: "Check-in: 2 PM, Check-out: 12 PM",
    ctaText: "Book Now"
  },
  {
    id: "romantic-dining-experience",
    title: "Romantic Dining Experience",
    description: "A 5-course candlelit dinner for two at our signature rooftop restaurant.",
    image: { src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop", alt: "Romantic Dinner" },
    location: "Mumbai, Delhi",
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Dining",
    couponCode: "LOVE20",
    discount: "20% OFF",
    availableHours: "7:00 PM - 11:00 PM",
    ctaText: "Reserve Table"
  },
  {
    id: "rejuvenating-spa-retreat",
    title: "Rejuvenating Spa Retreat",
    description: "Complimentary 60-minute massage when you book a suite for 3 nights or more.",
    image: { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop", alt: "Spa Massage" },
    location: "Bengaluru, Hyderabad",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Wellness",
    couponCode: "SPA100",
    discount: "FREE SPA",
    availableHours: "9:00 AM - 8:00 PM",
    ctaText: "Book Suite"
  },
  {
    id: "family-fun-package",
    title: "Family Fun Package",
    description: "Kids eat free and get complimentary access to the Kids Club. Perfect for family vacations.",
    image: { src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop", alt: "Family Pool" },
    location: "Kolkata, Chennai",
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Family",
    couponCode: "FAMILYFUN",
    discount: "KIDS FREE",
    availableHours: "All Day Access",
    ctaText: "View Rates"
  }
];
