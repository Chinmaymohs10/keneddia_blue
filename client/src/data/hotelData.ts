import { siteContent } from "./siteContent";
import { ImageAsset } from "@/types/media";

export interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string[];
  image: ImageAsset;
  available: boolean;
  size: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  image: ImageAsset; // Used as thumbnail for video
  tag?: string;
  mediaType?: 'image' | 'video' | 'reel';
  videoSrc?: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  image: ImageAsset;
  price: string;
  rating: string;
  reviews: number;
  description: string;
  amenities: string[];
  features: string[];
  rooms: number;
  checkIn: string;
  checkOut: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyPlaces?: {
    name: string;
    type: string;
    distance: string;
    coordinates: { lat: number; lng: number };
  }[];
  roomTypes: Room[];
  dining?: {
    name: string;
    cuisine: string;
    timings: string;
    image?: ImageAsset;
  }[];
  events?: Event[];
  policies?: {
    checkInAge: number;
    pets: boolean;
    cancellation: string;
    extraBed: boolean;
  };
}

export const allHotels: Hotel[] = [
  {
    id: "mumbai",
    name: "Kennedia Blu Mumbai",
    location: "Colaba, Mumbai",
    city: "Mumbai",
    image: siteContent.images.hotels.mumbai,
    price: "₹35,000",
    rating: "4.9",
    reviews: 1240,
    description:
      "A historic landmark transformed into a sanctuary of modern luxury, overlooking the Gateway of India. Experience the convergence of heritage and contemporary elegance.",
    amenities: ["Free WiFi", "Spa", "Restaurant", "Bar", "Gym", "Room Service"],
    features: ["Heritage Wing", "Sea View Suites", "Butlers on call"],
    rooms: 156,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 18.921984,
      lng: 72.833855,
    },
    nearbyPlaces: [
      { name: "Gateway of India", type: "Landmark", distance: "0.2 km", coordinates: { lat: 18.9220, lng: 72.8347 } },
      { name: "Marine Drive", type: "Attraction", distance: "2.5 km", coordinates: { lat: 18.9438, lng: 72.8234 } },
      { name: "Colaba Causeway", type: "Shopping", distance: "0.5 km", coordinates: { lat: 18.9149, lng: 72.8266 } },
    ],
    dining: [
      {
        name: "The Golden Peacock",
        cuisine: "North Indian & Mughlai",
        timings: "12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM",
        image: siteContent.images.bars.rooftop
      },
      {
        name: "Ocean View Deck",
        cuisine: "Continental & Seafood",
        timings: "24 Hours",
        image: siteContent.images.bars.rooftop
      }
    ],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "Flexible until 24 hours before check-in",
      extraBed: true
    },
    events: [
      {
        id: "evt-mumbai-1",
        title: "Live Jazz Night",
        date: "Fri, 24 Oct",
        time: "8:00 PM",
        image: siteContent.images.events.jazz,
        tag: "Music"
      },
      {
        id: "evt-mumbai-2",
        title: "Sunday Brunch",
        date: "Sun, 26 Oct",
        time: "11:00 AM",
        image: siteContent.images.cafes.garden,
        tag: "Dining"
      },
      {
        id: "evt-mumbai-3",
        title: "Art & Wine Mixer",
        date: "Sat, 01 Nov",
        time: "6:30 PM",
        image: siteContent.images.bars.lounge,
        tag: "Social"
      }
    ],
    roomTypes: [
      {
        id: "mumbai-deluxe",
        name: "Deluxe Room",
        description:
          "Elegantly appointed room with city views, featuring modern amenities and classic decor. Perfect for business and leisure travelers.",
        basePrice: 12000,
        maxOccupancy: 2,
        size: "350 sq ft",
        amenities: [
          "King Size Bed",
          "City View",
          "Work Desk",
          "Mini Bar",
          "Smart TV",
          "Coffee Maker",
        ],
        image: siteContent.images.hotels.mumbai,
        available: true,
      },
      {
        id: "mumbai-executive",
        name: "Executive Suite",
        description:
          "Spacious suite with separate living area and stunning sea views. Includes access to executive lounge and complimentary breakfast.",
        basePrice: 25000,
        maxOccupancy: 3,
        size: "650 sq ft",
        amenities: [
          "Sea View",
          "Living Room",
          "Executive Lounge Access",
          "Butler Service",
          "Jacuzzi",
          "Premium Minibar",
        ],
        image: siteContent.images.hotels.mumbai,
        available: true,
      },
      {
        id: "mumbai-presidential",
        name: "Presidential Suite",
        description:
          "The pinnacle of luxury with panoramic views of the Arabian Sea and Gateway of India. Features private terrace, dining room, and dedicated butler service.",
        basePrice: 75000,
        maxOccupancy: 4,
        size: "1500 sq ft",
        amenities: [
          "Panoramic Sea View",
          "Private Terrace",
          "Dining Room",
          "Master Bedroom",
          "24/7 Butler",
          "Private Bar",
        ],
        image: siteContent.images.hotels.mumbai,
        available: true,
      },
    ],
  },
  {
    id: "bengaluru",
    name: "Kennedia Blu Bengaluru",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    image: siteContent.images.hotels.bengaluru,
    price: "₹18,000",
    rating: "4.8",
    reviews: 892,
    description:
      "Minimalist perfection in the heart of Bengaluru's most exclusive tech and lifestyle district. A haven for digital nomads and business leaders.",
    amenities: [
      "Free WiFi",
      "Traditional Tea Room",
      "Michelin Restaurant",
      "Zen Garden",
    ],
    dining: [
      {
        name: "Zen Garden Cafe",
        cuisine: "Pan-Asian & Teas",
        timings: "10:00 AM - 10:00 PM",
      },
      {
        name: "Sky Brew",
        cuisine: "Finger Food & Craft Beer",
        timings: "4:00 PM - 1:00 AM",
      }
    ],
    policies: {
      checkInAge: 18,
      pets: true,
      cancellation: "Non-refundable for promotional rates",
      extraBed: false
    },
    events: [
      {
        id: "evt-blr-1",
        title: "Craft Beer Tasting",
        date: "Sat, 26 Oct",
        time: "7:00 PM",
        image: siteContent.images.bars.lounge,
        tag: "Brewery"
      },
      {
        id: "evt-blr-2",
        title: "Startup Founders Mixer",
        date: "Wed, 30 Oct",
        time: "6:30 PM",
        image: siteContent.images.cafes.garden,
        tag: "Networking"
      }
    ],

    features: ["Co-working Lounge", "Rooftop Microbrewery", "Smart Rooms"],
    rooms: 98,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 12.971891,
      lng: 77.641154,
    },
    nearbyPlaces: [
      { name: "100 Feet Road", type: "Dining", distance: "0.2 km", coordinates: { lat: 12.9700, lng: 77.6400 } },
      { name: "Ulsoor Lake", type: "Nature", distance: "2.5 km", coordinates: { lat: 12.9830, lng: 77.6200 } },
    ],
    roomTypes: [
      {
        id: "bengaluru-deluxe",
        name: "Deluxe Room",
        description:
          "Contemporary design meets functionality with smart room controls and high-speed connectivity. Ideal for tech-savvy travelers.",
        basePrice: 8500,
        maxOccupancy: 2,
        size: "320 sq ft",
        amenities: [
          "Smart Controls",
          "High-Speed WiFi",
          "Ergonomic Workspace",
          "Rain Shower",
          "Bluetooth Speaker",
          "USB Charging Ports",
        ],
        image: siteContent.images.hotels.bengaluru,
        available: true,
      },
      {
        id: "bengaluru-executive",
        name: "Executive Suite",
        description:
          "Spacious suite with dedicated workspace and access to co-working lounge. Features zen-inspired design and garden views.",
        basePrice: 18000,
        maxOccupancy: 2,
        size: "550 sq ft",
        amenities: [
          "Garden View",
          "Co-working Access",
          "Meeting Room Credits",
          "Tea Ceremony Set",
          "Premium Workspace",
          "Meditation Corner",
        ],
        image: siteContent.images.hotels.bengaluru,
        available: true,
      },
      {
        id: "bengaluru-penthouse",
        name: "Penthouse Suite",
        description:
          "Ultra-modern penthouse with private rooftop access and microbrewery privileges. The ultimate retreat for discerning guests.",
        basePrice: 45000,
        maxOccupancy: 4,
        size: "1200 sq ft",
        amenities: [
          "Private Rooftop",
          "Brewery Access",
          "Smart Home System",
          "Private Chef Option",
          "Infinity Tub",
          "Skyline Views",
        ],
        image: siteContent.images.hotels.bengaluru,
        available: true,
      },
    ],
  },
  {
    id: "delhi",
    name: "Kennedia Blu Delhi",
    location: "Connaught Place, Delhi",
    city: "Delhi",
    image: siteContent.images.hotels.delhi,
    price: "₹25,000",
    rating: "5.0",
    reviews: 2156,
    description:
      "Opulence redefined with unparalleled views of the capital's heritage. The preferred address for diplomats and discerning travelers.",
    amenities: [
      "Infinity Pool",
      "Spa",
      "5 Restaurants",
      "Butler Service",
      "Helipad",
    ],
    features: ["Presidential Suite", "Cigar Lounge", "Art Gallery"],
    rooms: 342,
    checkIn: "2:00 PM",
    checkOut: "12:00 PM",
    coordinates: {
      lat: 28.631451,
      lng: 77.216667,
    },
    nearbyPlaces: [
      { name: "Janpath Market", type: "Shopping", distance: "0.5 km", coordinates: { lat: 28.6267, lng: 77.2192 } },
      { name: "Jantar Mantar", type: "Landmark", distance: "0.8 km", coordinates: { lat: 28.6271, lng: 77.2166 } },
      { name: "Gurudwara Bangla Sahib", type: "Religious", distance: "1.2 km", coordinates: { lat: 28.6262, lng: 77.2090 } },
    ],
    dining: [
      {
        name: "The Royal Durbbar",
        cuisine: "Awadhi",
        timings: "7:00 PM - 11:30 PM",
      },
      {
        name: "24/7 Pavilion",
        cuisine: "Multi-Cuisine",
        timings: "24 Hours",
      }
    ],
    policies: {
      checkInAge: 21,
      pets: false,
      cancellation: "Free cancellation up to 48 hours",
      extraBed: true
    },
    events: [
      {
        id: "evt-del-1",
        title: "Classical Music Evening",
        date: "Fri, 25 Oct",
        time: "8:00 PM",
        image: siteContent.images.events.jazz,
        tag: "Culture"
      },
      {
        id: "evt-del-2",
        title: "Royal Awadhi Food Festival",
        date: "Sun, 27 Oct",
        time: "1:00 PM",
        image: siteContent.images.bars.rooftop,
        tag: "Dining"
      }
    ],

    roomTypes: [
      {
        id: "delhi-deluxe",
        name: "Deluxe Room",
        description:
          "Luxuriously appointed room with views of historic Delhi. Features premium bedding and marble bathroom.",
        basePrice: 15000,
        maxOccupancy: 2,
        size: "400 sq ft",
        amenities: [
          "Heritage View",
          "Marble Bathroom",
          "Premium Bedding",
          "Nespresso Machine",
          "Smart TV",
          "Work Station",
        ],
        image: siteContent.images.hotels.delhi,
        available: true,
      },
      {
        id: "delhi-executive",
        name: "Executive Suite",
        description:
          "Elegant suite with separate living area and access to all five restaurants. Includes complimentary spa treatment.",
        basePrice: 35000,
        maxOccupancy: 3,
        size: "750 sq ft",
        amenities: [
          "City View",
          "Living Area",
          "Spa Credit",
          "Butler Service",
          "Wine Cellar Access",
          "Dining Privileges",
        ],
        image: siteContent.images.hotels.delhi,
        available: true,
      },
      {
        id: "delhi-presidential",
        name: "Presidential Suite",
        description:
          "The crown jewel of Delhi hospitality. Features private art gallery, cigar lounge access, and helipad privileges for arriving in style.",
        basePrice: 125000,
        maxOccupancy: 6,
        size: "2500 sq ft",
        amenities: [
          "Private Art Gallery",
          "Cigar Lounge",
          "Helipad Access",
          "Private Dining Room",
          "Master Suite",
          "Concierge Team",
        ],
        image: siteContent.images.hotels.delhi,
        available: true,
      },
      {
        id: "delhi-family",
        name: "Family Suite",
        description:
          "Spacious family accommodation with connecting rooms and kid-friendly amenities. Perfect for memorable family stays.",
        basePrice: 42000,
        maxOccupancy: 5,
        size: "900 sq ft",
        amenities: [
          "Connecting Rooms",
          "Kids Play Area",
          "Family Dining",
          "Baby Cot Available",
          "Game Console",
          "Kitchenette",
        ],
        image: siteContent.images.hotels.delhi,
        available: true,
      },
    ],
  },
  {
    id: "kolkata",
    name: "Kennedia Blu Kolkata",
    location: "Park Street, Kolkata",
    city: "Kolkata",
    image: siteContent.images.hotels.kolkata,
    price: "₹20,000",
    rating: "4.9",
    reviews: 1567,
    description:
      "Classic colonial elegance meets contemporary comfort in the City of Joy. A tribute to the artistic and intellectual spirit of Bengal.",
    amenities: [
      "Michelin Star Restaurant",
      "Wine Cellar",
      "Art Gallery",
      "Concierge",
    ],
    features: ["Literary Club", "Afternoon Tea", "Jazz Bar"],
    rooms: 124,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 22.553523,
      lng: 88.349934,
    },
    dining: [
      {
        name: "Bengal Brasserie",
        cuisine: "Bengali & French Fusion",
        timings: "12:30 PM - 3:30 PM, 7:30 PM - 11:30 PM",
      }
    ],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "Flexible",
      extraBed: true
    },
    events: [
      {
        id: "evt-kol-1",
        title: "Jazz & Poetry Night",
        date: "Sat, 26 Oct",
        time: "7:30 PM",
        image: siteContent.images.bars.lounge,
        tag: "Music"
      },
      {
        id: "evt-kol-2",
        title: "Literary Club Meetup",
        date: "Thu, 31 Oct",
        time: "6:00 PM",
        image: siteContent.images.cafes.garden,
        tag: "Literature"
      }
    ],

    roomTypes: [
      {
        id: "kolkata-deluxe",
        name: "Deluxe Room",
        description:
          "Colonial charm with modern comforts. Features period furniture and views of historic Park Street.",
        basePrice: 9500,
        maxOccupancy: 2,
        size: "340 sq ft",
        amenities: [
          "Park Street View",
          "Period Furniture",
          "Tea Service",
          "Library Access",
          "Vintage Decor",
          "Premium Toiletries",
        ],
        image: siteContent.images.hotels.kolkata,
        available: true,
      },
      {
        id: "kolkata-heritage",
        name: "Heritage Suite",
        description:
          "Step back in time with authentic colonial architecture and curated art pieces. Includes literary club membership.",
        basePrice: 22000,
        maxOccupancy: 2,
        size: "600 sq ft",
        amenities: [
          "Literary Club Access",
          "Art Collection",
          "Afternoon Tea",
          "Wine Cellar Tours",
          "Antique Furnishings",
          "Private Balcony",
        ],
        image: siteContent.images.hotels.kolkata,
        available: true,
      },
      {
        id: "kolkata-royal",
        name: "Royal Suite",
        description:
          "The epitome of Bengali aristocracy. Features private art gallery, jazz bar access, and Michelin dining privileges.",
        basePrice: 55000,
        maxOccupancy: 4,
        size: "1300 sq ft",
        amenities: [
          "Private Art Gallery",
          "Jazz Bar Access",
          "Michelin Dining",
          "Grand Piano",
          "Butler Service",
          "Heritage Tours",
        ],
        image: siteContent.images.hotels.kolkata,
        available: true,
      },
    ],
  },
  {
    id: "hyderabad",
    name: "Kennedia Blu Hyderabad",
    location: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    image: siteContent.images.hotels.hyderabad,
    price: "₹22,000",
    rating: "4.8",
    reviews: 1023,
    description:
      "An urban oasis featuring our signature infinity pool and lush sky gardens. The jewel of the Nizams, reimagined for the modern era.",
    amenities: [
      "Rooftop Pool",
      "Sky Gardens",
      "3 Restaurants",
      "Spa",
      "Business Center",
    ],
    features: ["Convention Hall", "Helipad Access", "Royal Suites"],
    rooms: 287,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 17.412348,
      lng: 78.448522,
    },
    dining: [
      {
        name: "Nizam's Table",
        cuisine: "Hyderabadi",
        timings: "12:00 PM - 4:00 PM, 7:00 PM - 12:00 AM",
      }
    ],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "24 hours notice",
      extraBed: true
    },
    roomTypes: [
      {
        id: "hyderabad-deluxe",
        name: "Deluxe Room",
        description:
          "Modern luxury with sky garden views. Features contemporary design inspired by Nizami architecture.",
        basePrice: 11000,
        maxOccupancy: 2,
        size: "360 sq ft",
        amenities: [
          "Sky Garden View",
          "Pool Access",
          "Modern Design",
          "Rain Shower",
          "Smart Controls",
          "Mini Bar",
        ],
        image: siteContent.images.hotels.hyderabad,
        available: true,
      },
      {
        id: "hyderabad-pool",
        name: "Pool View Suite",
        description:
          "Direct views of the iconic infinity pool with private balcony. Includes spa credits and dining privileges.",
        basePrice: 24000,
        maxOccupancy: 3,
        size: "700 sq ft",
        amenities: [
          "Infinity Pool View",
          "Private Balcony",
          "Spa Credits",
          "Restaurant Access",
          "Luxury Bathroom",
          "Living Area",
        ],
        image: siteContent.images.hotels.hyderabad,
        available: true,
      },
      {
        id: "hyderabad-royal",
        name: "Royal Suite",
        description:
          "Nizami opulence meets modern luxury. Features private sky garden access, helipad privileges, and convention hall for private events.",
        basePrice: 65000,
        maxOccupancy: 4,
        size: "1400 sq ft",
        amenities: [
          "Private Sky Garden",
          "Helipad Access",
          "Convention Privileges",
          "Royal Decor",
          "Butler Service",
          "Private Dining",
        ],
        image: siteContent.images.hotels.hyderabad,
        available: true,
      },
    ],
  },
  {
    id: "chennai",
    name: "Kennedia Blu Chennai",
    location: "ECR, Chennai",
    city: "Chennai",
    image: siteContent.images.hotels.chennai,
    price: "₹19,000",
    rating: "4.9",
    reviews: 934,
    description:
      "Waterfront luxury with commanding views of the Bay of Bengal. Where the rhythm of the waves meets the soul of hospitality.",
    amenities: ["Harbour Views", "Fine Dining", "Pool", "Gym", "Yacht Charter"],
    features: ["Private Beach", "Ayurvedic Spa", "Seafood Specialty"],
    rooms: 198,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 12.909821,
      lng: 80.249693,
    },
    dining: [
      {
        name: "Bay Catch",
        cuisine: "Seafood",
        timings: "11:00 AM - 11:00 PM",
      }
    ],
    policies: {
      checkInAge: 18,
      pets: true,
      cancellation: "Flexible",
      extraBed: true
    },
    roomTypes: [
      {
        id: "chennai-deluxe",
        name: "Deluxe Room",
        description:
          "Coastal elegance with partial ocean views. Features beach-inspired decor and modern amenities.",
        basePrice: 10000,
        maxOccupancy: 2,
        size: "350 sq ft",
        amenities: [
          "Partial Ocean View",
          "Beach Access",
          "Coastal Decor",
          "Premium Bedding",
          "Coffee Maker",
          "Smart TV",
        ],
        image: siteContent.images.hotels.chennai,
        available: true,
      },
      {
        id: "chennai-ocean",
        name: "Ocean View Suite",
        description:
          "Panoramic views of the Bay of Bengal with private balcony. Includes Ayurvedic spa treatment and seafood dining experience.",
        basePrice: 23000,
        maxOccupancy: 3,
        size: "680 sq ft",
        amenities: [
          "Ocean View",
          "Private Balcony",
          "Spa Treatment",
          "Seafood Dining",
          "Beach Cabana",
          "Living Room",
        ],
        image: siteContent.images.hotels.chennai,
        available: true,
      },
      {
        id: "chennai-beach",
        name: "Beach Villa",
        description:
          "Exclusive beachfront villa with direct beach access and private yacht charter privileges. The ultimate coastal retreat.",
        basePrice: 58000,
        maxOccupancy: 5,
        size: "1600 sq ft",
        amenities: [
          "Direct Beach Access",
          "Yacht Charter",
          "Private Pool",
          "Outdoor Shower",
          "Butler Service",
          "Beachfront Dining",
        ],
        image: siteContent.images.hotels.chennai,
        available: true,
      },
    ],
  },
];

export const getHotelById = (id: string): Hotel | undefined => {
  return allHotels.find((hotel) => hotel.id === id);
};

export const getRoomById = (hotelId: string, roomId: string): Room | undefined => {
  const hotel = getHotelById(hotelId);
  return hotel?.roomTypes.find((room) => room.id === roomId);
};
