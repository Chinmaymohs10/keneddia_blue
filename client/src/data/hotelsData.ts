// Centralized Hotel Data
import { siteContent } from "./siteContent";

export interface Hotel {
  id: string;
  name: string;
  city: string;
  location: string;
  price: number;
  rating: number;
  image: any;
  description: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const CITIES = ["Bangalore", "Mumbai", "Goa", "Delhi", "Hyderabad", "Chennai"];

export const HOTELS_DATA: Hotel[] = [
  {
    id: "kb-blr-mg",
    name: "Kennedia Blu - Bangalore (MG Road)",
    city: "Bangalore",
    location: "MG Road, Central Business District",
    price: 12499,
    rating: 4.8,
    image: siteContent.images.hotels.bengaluru,
    description: "Experience the vibrant heart of the city with luxury suites and panoramic views.",
    amenities: ["Spa", "Pool", "Fine Dining", "Gym"],
    coordinates: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: "kb-mum-juhu",
    name: "Kennedia Grand - Mumbai (Juhu)",
    city: "Mumbai",
    location: "Juhu Tara Road",
    price: 15999,
    rating: 4.9,
    image: siteContent.images.hotels.mumbai,
    description: "Beachfront luxury meeting urban sophistication in the entertainment capital.",
    amenities: ["Beach Access", "Rooftop Bar", "Infinity Pool"],
    coordinates: { lat: 19.1025, lng: 72.8258 }
  },
  {
    id: "kb-goa-resort",
    name: "Kennedia Resort - Goa",
    city: "Goa",
    location: "Candolim Beach Road",
    price: 18499,
    rating: 4.7,
    image: siteContent.images.hotels.mumbai, // Reusing available image if Goa specific is missing or using placeholder
    description: "A tropical paradise featuring private villas and sunset cruises.",
    amenities: ["Private Beach", "Water Sports", "Casino"],
    coordinates: { lat: 15.5181, lng: 73.7626 }
  },
  {
    id: "kb-del-suites",
    name: "Kennedia Suites - Delhi",
    city: "Delhi",
    location: "Aerocity, New Delhi",
    price: 13999,
    rating: 4.8,
    image: siteContent.images.hotels.delhi,
    description: "Colonial elegance combined with modern luxury in the capital.",
    amenities: ["Heritage Tour", "Butler Service", "High Tea"],
    coordinates: { lat: 28.5562, lng: 77.1000 }
  },
  {
    id: "kb-hyd-hitech",
    name: "Kennedia Blu - Hyderabad",
    city: "Hyderabad",
    location: "HITEC City",
    price: 11999,
    rating: 4.6,
    image: siteContent.images.hotels.hyderabad,
    description: "Business and leisure seamlessly blended in the city of pearls.",
    amenities: ["Convention Center", "Pool", "24/7 Dining"],
    coordinates: { lat: 17.4401, lng: 78.3489 }
  },
  {
    id: "kb-chn-marina",
    name: "Kennedia Blu - Chennai",
    city: "Chennai",
    location: "Marina Beach Road",
    price: 10999,
    rating: 4.5,
    image: siteContent.images.hotels.chennai,
    description: "Coastal charm with traditional hospitality.",
    amenities: ["Sea View", "Ayurvedic Spa", "Seafood Specialty"],
    coordinates: { lat: 13.0475, lng: 80.2824 }
  },
  {
    id: "kb-blr-whitefield",
    name: "Kennedia Blu - Whitefield",
    city: "Bangalore",
    location: "Whitefield Main Road",
    price: 9999,
    rating: 4.5,
    image: siteContent.images.hotels.bengaluru,
    description: "Modern comforts for the tech-savvy traveler.",
    amenities: ["Co-working Space", "Smart Rooms", "Gym"],
    coordinates: { lat: 12.9698, lng: 77.7500 }
  },
  {
    id: "kb-mum-bandra",
    name: "Kennedia Suites - Bandra",
    city: "Mumbai",
    location: "Bandra West",
    price: 14500,
    rating: 4.7,
    image: siteContent.images.hotels.mumbai,
    description: "Chic stays in the queen of suburbs.",
    amenities: ["Boutique Design", "Cafe", "Art Gallery"],
    coordinates: { lat: 19.0596, lng: 72.8295 }
  }
];
