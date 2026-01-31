import { siteContent } from "@/data/siteContent";

export const properties = [
  // Cafe 1
  {
    id: 1,
    name: "Kennedia Blu Cafe Mumbai",
    location: "Bandra, Mumbai",
    city: "Mumbai",
    type: "Cafe",
    image: siteContent.images.cafes.parisian,
    rating: "4.8",
    description: "A cozy Parisian-style cafe offering artisanal coffee and pastries.",
    amenities: ["Specialty Coffee", "Fresh Pastries", "Free WiFi", "Outdoor Seating"],
    capacity: "45 Seats",
    price: "₹450",
    tagline: "Experience artisanal coffee in an authentic Parisian atmosphere",
    headline1: "Where every cup",
    headline2: "tells a story",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    nearbyPlaces: [
      { name: "Bandstand Promenade", type: "Attraction", distance: "1.2 km", coordinates: { lat: 19.0453, lng: 72.8193 } },
      { name: "Mount Mary Church", type: "Landmark", distance: "1.5 km", coordinates: { lat: 19.0466, lng: 72.8225 } },
      { name: "Linking Road", type: "Shopping", distance: "0.5 km", coordinates: { lat: 19.0650, lng: 72.8337 } },
    ]
  },

  // Hotel 1
  {
    id: 2,
    name: "Kennedia Blu Mumbai",
    location: "Colaba, Mumbai",
    city: "Mumbai",
    type: "Hotel",
    image: siteContent.images.hotels.mumbai,
    rating: "4.9",
    description: "Experience timeless elegance in the heart of South Mumbai.",
    amenities: ["Ocean View", "Heritage Architecture", "Fine Dining", "Spa & Wellness"],
    capacity: "120 Rooms",
    price: "₹12,500",
    tagline: "Discover timeless elegance in the heart of Mumbai's heritage district",
    headline1: "Where luxury meets",
    headline2: "tradition",
    coordinates: { lat: 18.9220, lng: 72.8347 },
    nearbyPlaces: [
      { name: "Gateway of India", type: "Landmark", distance: "0.2 km", coordinates: { lat: 18.9220, lng: 72.8347 } },
      { name: "Marine Drive", type: "Attraction", distance: "2.5 km", coordinates: { lat: 18.9438, lng: 72.8234 } },
      { name: "Colaba Causeway", type: "Shopping", distance: "0.5 km", coordinates: { lat: 18.9149, lng: 72.8266 } },
    ]
  },

  // Restaurant 1
  {
    id: 3,
    name: "Kennedia Blu Restaurant Mumbai",
    location: "Marine Drive, Mumbai",
    city: "Mumbai",
    type: "Restaurant",
    image: siteContent.images.bars.rooftop,
    rating: "4.9",
    description: "Rooftop fine dining with spectacular ocean views and cocktails.",
    amenities: ["Rooftop Dining", "Craft Cocktails", "Live Music", "Ocean Views"],
    capacity: "80 Covers",
    price: "₹2,500",
    tagline: "Elevate your dining experience with breathtaking ocean views and craft cocktails",
    headline1: "Dining above",
    headline2: "the city lights",
    coordinates: { lat: 18.9415, lng: 72.8236 },
    nearbyPlaces: [
      { name: "Chowpatty Beach", type: "Attraction", distance: "1.0 km", coordinates: { lat: 18.9567, lng: 72.8159 } },
      { name: "Nariman Point", type: "Business", distance: "2.0 km", coordinates: { lat: 18.9256, lng: 72.8242 } },
    ]
  },

  // Cafe 2
  {
    id: 4,
    name: "Kennedia Blu Cafe Bengaluru",
    location: "Koramangala, Bengaluru",
    city: "Bengaluru",
    type: "Cafe",
    image: siteContent.images.cafes.minimalist,
    rating: "4.7",
    description: "Modern minimalist coffee shop with expertly crafted brews.",
    amenities: ["Craft Coffee", "Power Outlets", "Co-working Space", "Vegan Options"],
    capacity: "60 Seats",
    price: "₹400",
    tagline: "Modern minimalism meets expertly crafted coffee in the heart of Koramangala",
    headline1: "Coffee crafted for",
    headline2: "innovators",
    coordinates: { lat: 12.9345, lng: 77.6265 },
    nearbyPlaces: [
      { name: "Forum Mall", type: "Shopping", distance: "1.0 km", coordinates: { lat: 12.9348, lng: 77.6113 } },
      { name: "HSR Layout", type: "Area", distance: "3.0 km", coordinates: { lat: 12.9116, lng: 77.6389 } },
    ]
  },

  // Hotel 2
  {
    id: 5,
    name: "Kennedia Blu Bengaluru",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    type: "Hotel",
    image: siteContent.images.hotels.bengaluru,
    rating: "4.8",
    description: "Perfect for business travelers and tech professionals.",
    amenities: ["Business Center", "High-Speed WiFi", "Conference Rooms", "Rooftop Bar"],
    capacity: "150 Rooms",
    price: "₹10,800",
    tagline: "Designed for the modern business traveler with seamless connectivity",
    headline1: "Your home in the",
    headline2: "tech capital",
    coordinates: { lat: 12.9719, lng: 77.6412 },
    nearbyPlaces: [
      { name: "100 Feet Road", type: "Dining", distance: "0.2 km", coordinates: { lat: 12.9700, lng: 77.6400 } },
      { name: "Ulsoor Lake", type: "Nature", distance: "2.5 km", coordinates: { lat: 12.9830, lng: 77.6200 } },
    ]
  },

  // Restaurant 2
  {
    id: 6,
    name: "Kennedia Blu Restaurant Bengaluru",
    location: "MG Road, Bengaluru",
    city: "Bengaluru",
    type: "Restaurant",
    image: siteContent.images.bars.speakeasy,
    rating: "4.8",
    description: "Intimate speakeasy-style restaurant with jazz and gourmet plates.",
    amenities: ["Jazz Nights", "Premium Spirits", "Private Dining", "Signature Cocktails"],
    capacity: "50 Covers",
    price: "₹2,200",
    tagline: "Step into a hidden world of jazz, cocktails, and culinary excellence",
    headline1: "Where music and",
    headline2: "flavors collide",
    coordinates: { lat: 12.9754, lng: 77.6067 },
    nearbyPlaces: [
      { name: "Brigade Road", type: "Shopping", distance: "0.5 km", coordinates: { lat: 12.9698, lng: 77.6080 } },
      { name: "Cubbon Park", type: "Nature", distance: "1.5 km", coordinates: { lat: 12.9763, lng: 77.5929 } },
    ]
  },

  // Cafe 3
  {
    id: 7,
    name: "Kennedia Blu Cafe Delhi",
    location: "Khan Market, Delhi",
    city: "Delhi",
    type: "Cafe",
    image: siteContent.images.cafes.highTea,
    rating: "4.9",
    description: "Luxury high tea lounge offering premium teas and desserts.",
    amenities: ["High Tea Service", "Premium Teas", "Afternoon Tea", "Garden View"],
    capacity: "35 Seats",
    price: "₹850",
    tagline: "Indulge in the refined art of afternoon tea with garden views",
    headline1: "Elegance served",
    headline2: "by the cup",
    coordinates: { lat: 28.6004, lng: 77.2268 },
    nearbyPlaces: [
      { name: "Lodhi Gardens", type: "Nature", distance: "1.0 km", coordinates: { lat: 28.5933, lng: 77.2217 } },
      { name: "India Gate", type: "Landmark", distance: "2.5 km", coordinates: { lat: 28.6129, lng: 77.2295 } },
    ]
  },

  // Hotel 3
  {
    id: 8,
    name: "Kennedia Blu Delhi",
    location: "Connaught Place, Delhi",
    city: "Delhi",
    type: "Hotel",
    image: siteContent.images.hotels.delhi,
    rating: "5.0",
    description: "Unparalleled luxury in the capital's most prestigious location.",
    amenities: ["Presidential Suite", "Michelin Dining", "Private Butler", "Infinity Pool"],
    capacity: "200 Suites",
    price: "₹18,900",
    tagline: "Experience unparalleled luxury in India's most prestigious location",
    headline1: "The pinnacle of",
    headline2: "hospitality",
    coordinates: { lat: 28.6315, lng: 77.2167 },
    nearbyPlaces: [
      { name: "Janpath Market", type: "Shopping", distance: "0.5 km", coordinates: { lat: 28.6267, lng: 77.2192 } },
      { name: "Jantar Mantar", type: "Landmark", distance: "0.8 km", coordinates: { lat: 28.6271, lng: 77.2166 } },
      { name: "Gurudwara Bangla Sahib", type: "Religious", distance: "1.2 km", coordinates: { lat: 28.6262, lng: 77.2090 } },
    ]
  },

  // Restaurant 3
  {
    id: 9,
    name: "Kennedia Blu Restaurant Delhi",
    location: "Mehrauli, Delhi",
    city: "Delhi",
    type: "Restaurant",
    image: siteContent.images.bars.whiskey,
    rating: "5.0",
    description: "Classic whiskey lounge with rare spirits and fine dining.",
    amenities: ["Rare Whiskeys", "Wine Cellar", "Chef's Table", "Cigar Lounge"],
    capacity: "70 Covers",
    price: "₹3,500",
    tagline: "Savor rare spirits and exceptional cuisine in a refined atmosphere",
    headline1: "Sophistication in",
    headline2: "every pour",
    coordinates: { lat: 28.5244, lng: 77.1855 },
    nearbyPlaces: [
      { name: "Qutub Minar", type: "Landmark", distance: "0.5 km", coordinates: { lat: 28.5244, lng: 77.1855 } },
      { name: "Archeological Park", type: "Nature", distance: "0.3 km", coordinates: { lat: 28.5218, lng: 77.1873 } },
    ]
  },
];
