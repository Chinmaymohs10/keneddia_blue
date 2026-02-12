import placeholderImg from "@assets/placeholder.svg";
import brandLogo from "@assets/logo/kb-logo1.png";
import brandLogo_main from "@assets/logo/kb-logo-main.png";
import brandLogo_red from "@assets/logo/kb-logo-red.jpg";
import brandLogo_black from "@assets/logo/kb-logo-black2.png";
import brandLogoHotel from "@assets/logo/kb-logo1.jpg";
import brandLogoCafe from "@assets/logo/kb-logo3.jpg";
import brandLogoBar from "@assets/logo/kb-logo4.jpg";
import heroExterior from "@assets/generated_images/luxury_hotel_exterior_at_twilight.png";
import heroLobby from "@assets/generated_images/luxury_hotel_lobby_interior.png";
import heroLounge from "@assets/generated_images/exclusive_rooftop_lounge_at_night.png";
import aboutMain from "@assets/generated_images/architectural_detail_of_hotel.png";
import aboutLeader from "@assets/generated_images/luxury_hotel_awards_trophy.png";

// Hotel Images (Mapping generic luxury to cities)
import hotelMumbai from "@assets/generated_images/opulent_hotel_lobby_in_dubai.png"; // Generic Opulence
import hotelBengaluru from "@assets/generated_images/modern_hotel_suite_in_tokyo.png"; // Generic Modern Suite
import hotelDelhi from "@assets/generated_images/luxury_hotel_exterior_at_twilight.png"; // Reuse Hero
import hotelKolkata from "@assets/generated_images/chic_hotel_room_in_paris.png"; // Generic Chic Room
import hotelHyderabad from "@assets/generated_images/rooftop_pool_in_singapore.png"; // Generic Pool
import hotelChennai from "@assets/generated_images/luxury_hotel_room_interior_in_london.png";
import barSpeakeasy from "@assets/generated_images/speakeasy_jazz_bar.png";
import barRooftop from "@assets/generated_images/rooftop_cocktail_bar.png";
import barWhiskey from "@assets/generated_images/classic_whiskey_lounge.png";
import barBeach from "@assets/generated_images/beachside_sunset_bar.png";
import barLounge from "@assets/generated_images/exclusive_rooftop_lounge_at_night.png";
import barJazz from "@assets/generated_images/moody_luxury_bar_interior.png";

// Cafes
import cafeParisian from "@assets/generated_images/parisian_style_cafe_interior.png";
import cafeMinimalist from "@assets/generated_images/modern_minimalist_coffee_shop.png";
import cafeBakery from "@assets/generated_images/artisan_bakery_cafe.png";
import cafeHighTea from "@assets/generated_images/luxury_high_tea_lounge.png";
import cafeGarden from "@assets/generated_images/garden_terrace_cafe.png";
import cafeLibrary from "@assets/generated_images/cozy_library_cafe.png";

// Global Presence & Business
import mapImage from "@assets/generated_images/world_map_with_golden_pins.png";
import cafeUpscale from "@assets/generated_images/upscale_cafe_interior.png";

export const siteContent = {
  brand: {
    name: "Kennedia Blu",
    tagline: "Redefining luxury hospitality with a commitment to excellence, comfort, and authentic experiences.",
    logo: {
      text: "Kennedia Blu",
      image: {
        src: brandLogo_black,
        alt: "Kennedia Blu - Hotel | Restaurant | Cafe",
        priority: true
      },
      subImage: {                     // 👈 ADD THIS
        src: brandLogo_red,
        alt: "Kennedia Blu Accent Logo",
        priority: false
      },
      fallbackText: "KENNEDIA BLU"
    },
    logo_hotel: {
      text: "Kennedia Blu Hotels",
      image: { src: brandLogoHotel, alt: "Kennedia Blu Hotels Logo", priority: false },
      fallbackText: "KENNEDIA BLU HOTELS"
    },
    logo_cafe: {
      text: "Kennedia Blu Cafes",
      image: { src: brandLogoCafe, alt: "Kennedia Blu Cafe Logo", priority: false },
      fallbackText: "KENNEDIA BLU CAFES"
    },
    logo_bar: {
      text: "Kennedia Blu Bars",
      image: { src: brandLogoBar, alt: "Kennedia Blu Bar Logo", priority: false },
      fallbackText: "KENNEDIA BLU BARS"
    }
  },
  images: {
    globalPlaceholder: placeholderImg,
    hero: {
      slide1: { src: heroExterior, alt: "Luxury Hotel Exterior at Twilight", priority: true },
      slide2: { src: heroLobby, alt: "Grand Hotel Lobby", priority: true },
      slide3: { src: heroLounge, alt: "Rooftop Lounge at Night", priority: true },
    },
    about: {
      main: { src: aboutMain, alt: "Architectural Detail of Hotel", priority: false },
      leadership: { src: aboutLeader, alt: "Luxury Hotel Awards Trophy", priority: false },
    },
    hotels: {
      mumbai: { src: hotelMumbai, alt: "Kennedia Blu Mumbai Lobby", priority: false },
      bengaluru: { src: hotelBengaluru, alt: "Kennedia Blu Bengaluru Suite", priority: false },
      delhi: { src: hotelDelhi, alt: "Kennedia Blu Delhi Exterior", priority: false },
      kolkata: { src: hotelKolkata, alt: "Kennedia Blu Kolkata Room", priority: false },
      hyderabad: { src: hotelHyderabad, alt: "Kennedia Blu Hyderabad Pool", priority: false },
      chennai: { src: hotelChennai, alt: "Kennedia Blu Chennai Room", priority: false },
    },
    bars: {
      speakeasy: { src: barSpeakeasy, alt: "Jazz Speakeasy Bar", priority: false },
      rooftop: { src: barRooftop, alt: "Rooftop Cocktail Bar", priority: false },
      whiskey: { src: barWhiskey, alt: "Classic Whiskey Lounge", priority: false },
      beach: { src: barBeach, alt: "Beachside Sunset Bar", priority: false },
      lounge: { src: barLounge, alt: "Exclusive VIP Lounge", priority: false },
      jazz: { src: barJazz, alt: "Moody Jazz Bar", priority: false },
    },
    cafes: {
      parisian: { src: cafeParisian, alt: "Parisian Style Cafe", priority: false },
      minimalist: { src: cafeMinimalist, alt: "Modern Minimalist Coffee Shop", priority: false },
      bakery: { src: cafeBakery, alt: "Artisan Bakery", priority: false },
      highTea: { src: cafeHighTea, alt: "Luxury High Tea Lounge", priority: false },
      garden: { src: cafeGarden, alt: "Garden Terrace Cafe", priority: false },
      library: { src: cafeLibrary, alt: "Cozy Library Cafe", priority: false },
    },
    events: {
      jazz: { src: barSpeakeasy, alt: "Jazz Music Event", priority: false },
      gala: { src: heroLobby, alt: "Gala Event at Lobby", priority: false },
      highTea: { src: cafeHighTea, alt: "High Tea Event", priority: false },
      wedding: { src: heroLobby, alt: "Luxury Wedding", priority: false },
    },
    globalPresence: {
      map: { src: mapImage, alt: "India Presence Map", priority: false },
    },
    businessVerticals: {
      hotel: { src: aboutMain, alt: "Hotel Vertical", priority: false },
      cafe: { src: cafeUpscale, alt: "Cafe Vertical", priority: false },
      bar: { src: barJazz, alt: "Bar Vertical", priority: false },
    }
  },
  text: {
    hero: {
      slides: [
        {
          title: "A Legacy of Global Hospitality & Timeless Luxury",
          subtitle: "Kennedia Blu Group",
        },
        {
          title: "Where Luxury Meets Experience",
          subtitle: "Kennedia Blu Group",
        },
        {
          title: "Built on Passion and Purpose",
          subtitle: "Kennedia Blu Group",
        }
      ]
    },
    about: {
      sectionTitle: "About Kennedia Blu",
      discoverTitle: "Discover Kennedia Blu",
      carousel: [
        {
          title: "Trusted Hospitality Brand",
          description: "Kennedia Blu is built on trust and excellence, delivering premium hospitality experiences that exceed customer expectations.",
          image: { src: aboutMain, alt: "Leadership Excellence", priority: false }
        },
        {
          title: "Commitment to Quality",
          description: "We focus on top-class service standards, attention to detail, and customer satisfaction across every touchpoint.",
          image: { src: heroLobby, alt: "Quality Service", priority: false }
        },
        {
          title: "Leadership Excellence",
          description: "Led by industry veterans with decades of experience in hospitality, driving innovation and consistent service quality.",
          image: { src: aboutLeader, alt: "Industry Veterans", priority: false }
        }
      ]
    },
    // New Sections Data
    dailyOffers: {
      title: "Exclusive Daily Offers",
      offers: [
        {
          title: "Winter Alpine Retreat",
          description:
            "Warm up this winter with our exclusive alpine getaway package. Enjoy complimentary hot cocoa evenings, fireplace lounge access, and a curated winter activity pass.",
          couponCode: "WINTER2025",
          ctaText: "Explore Winter Stay",
          link: "#",
          image: { src: heroExterior, alt: "Winter Alpine Retreat", priority: false },
          location: "Manali",
          expiresAt: "2025-01-31T23:59:59", // ISO 8601 format - Expires Jan 31, 2025
          availableHours: "Valid 24/7"
        },
        {
          title: "Luxury Spa Weekend",
          description:
            "Indulge in a rejuvenating spa experience with our exclusive weekend package. Includes full-body massage, aromatherapy, and access to our premium wellness facilities.",
          couponCode: "SPA2025",
          ctaText: "Book Spa Package",
          link: "#",
          image: { src: heroLobby, alt: "Luxury Spa Weekend", priority: false },
          location: "Bengaluru",
          expiresAt: "2025-02-15T18:00:00", // Expires Feb 15, 2025 at 6 PM
          availableHours: "Mon-Fri: 9 AM - 6 PM"
        },
        {
          title: "Rooftop Dining Experience",
          description:
            "Savor exquisite cuisine under the stars with our special rooftop dining offer. Includes a 5-course meal, premium wine pairing, and live music entertainment.",
          couponCode: "DINE2025",
          ctaText: "Reserve Table",
          link: "#",
          image: { src: heroLounge, alt: "Rooftop Dining", priority: false },
          location: "Mumbai",
          expiresAt: "2025-01-20T23:59:59", // Expires Jan 20, 2025
          availableHours: "Dinner only: 7 PM - 11 PM"
        },
        {
          title: "Morning Coffee Delight",
          description:
            "Start your day right with our special breakfast and coffee combo.",
          couponCode: "COFFEE2025",
          ctaText: "Claim Offer",
          link: "#",
          image: { src: heroExterior, alt: "Coffee Offer", priority: false },
          location: "Delhi",
          expiresAt: "2025-01-13T12:00:00", // Expires tomorrow at noon (urgent!)
          availableHours: "7 AM - 11 AM only"
        },
        {
          title: "Luxury Spa Weekend",
          description:
            "Indulge in a rejuvenating spa experience with our exclusive weekend package. Includes full-body massage, aromatherapy, and access to our premium wellness facilities.",
          couponCode: "SPA2025",
          ctaText: "Book Spa Package",
          link: "#",
          image: { src: heroLobby, alt: "Luxury Spa Weekend", priority: false },
          location: "Udaipur",
          // No expiresAt - offer always available
          availableHours: "Daily: 10 AM - 8 PM"
        },
        {
          title: "Rooftop Dining Experience",
          description:
            "Savor exquisite cuisine under the stars with our special rooftop dining offer. Includes a 5-course meal, premium wine pairing, and live music entertainment.",
          couponCode: "DINE2025",
          ctaText: "Reserve Table",
          link: "#",
          image: { src: heroLounge, alt: "Rooftop Dining", priority: false },
          location: "Delhi",
          expiresAt: "2025-03-01T23:59:59", // Expires March 1, 2025
          // No availableHours - available anytime
        }
      ]
    },
    // In siteContent.ts

    events: {
      title: "Upcoming Events",
      items: [
        {
          title: "Jazz Night Under the Stars",
          date: "Dec 25, 2025",
          image: { src: barSpeakeasy, alt: "Jazz Night", priority: false },
          description: "An evening of smooth jazz and signature cocktails at our rooftop lounge.",
          slug: "jazz-night-under-stars", // ✅ Unique slug
          location: "Mumbai"
        },
        {
          title: "New Year's Eve Gala",
          date: "Dec 31, 2025",
          image: { src: heroLobby, alt: "NYE Gala", priority: false },
          description: "Ring in the new year with a grand celebration featuring live music and gourmet dining.",
          slug: "new-years-eve-gala", // ✅ Unique slug
          location: "Goa"
        },
        {
          title: "Culinary Masterclass",
          date: "Jan 15, 2026",
          image: { src: cafeParisian, alt: "Culinary Class", priority: false },
          description: "Learn the secrets of fine dining from our executive chefs.",
          slug: "culinary-masterclass", // ✅ Unique slug
          location: "Paris"
        }
      ]
    },

    news: {
      title: "News & Press",
      items: [
        {
          title: "Kennedia Blu Wins Excellence Award",
          date: "Nov 15, 2025",
          image: { src: aboutLeader, alt: "Award Ceremony", priority: false },
          description: "Recognized for outstanding hospitality and service excellence in the annual Hotel Awards.",
          slug: "excellence-award-2025" // ✅ Unique slug
        },
        {
          title: "Expansion Plans for 2026",
          date: "Oct 20, 2025",
          image: { src: mapImage, alt: "Expansion Map", priority: false },
          description: "Announcing new locations in key cities across the country as we grow our footprint.",
          slug: "expansion-plans-2026" // ✅ Unique slug
        },
        {
          title: "Sustainability Initiative Launch",
          date: "Sep 05, 2025",
          image: { src: cafeGarden, alt: "Green Initiative", priority: false },
          description: "Commitment to eco-friendly practices and reducing our carbon footprint.",
          slug: "sustainability-initiative" // ✅ Unique slug
        },
        {
          title: "Kennedia Blu Wins Excellence Award",
          date: "Nov 15, 2025",
          image: { src: aboutLeader, alt: "Award Ceremony", priority: false },
          description: "Recognized for outstanding hospitality and service excellence in the annual Hotel Awards.",
          slug: "excellence-award-2025" // ✅ Unique slug
        },
        {
          title: "Expansion Plans for 2026",
          date: "Oct 20, 2025",
          image: { src: mapImage, alt: "Expansion Map", priority: false },
          description: "Announcing new locations in key cities across the country as we grow our footprint.",
          slug: "expansion-plans-2026" // ✅ Unique slug
        },
        {
          title: "Sustainability Initiative Launch",
          date: "Sep 05, 2025",
          image: { src: cafeGarden, alt: "Green Initiative", priority: false },
          description: "Commitment to eco-friendly practices and reducing our carbon footprint.",
          slug: "sustainability-initiative" // ✅ Unique slug
        }
      ]
    },
    ourStory: {
      headline: "A Journey of Excellence",
      summary: "From humble beginnings to a renowned hospitality brand, the story of Kennedia Blu is one of passion, dedication, and a relentless pursuit of perfection. Discover how we are redefining luxury.",
      image: { src: aboutMain, alt: "Our Story", priority: false },
      images: [
        { src: aboutMain, alt: "Leadership Team", priority: false },
        { src: heroLobby, alt: "Management Excellence", priority: false },
        { src: aboutLeader, alt: "Award-Winning Service", priority: false }
      ],
      ctaText: "Explore Our Story",
      link: "#"
    },
    experienceShowcase: {
      title: "Moments of Excellence",
      rating: "5.0",
      reviewCount: "2,500+",
      items: [
        {
          type: "image", // Add type field
          title: "Exquisite Dining",
          description: "A culinary journey that delights the senses with every bite.",
          author: "James Cameron, Food Critic",
          image: { src: cafeUpscale, alt: "Dining Experience", priority: false }
        },
        {
          type: "video", // Video type
          title: "Serene Wellness",
          description: "Rejuvenate your mind and body in our world-class spa facilities.",
          author: "Elena Fisher, Travel Blogger",
          videoUrl: "https://example.com/wellness-video.mp4", // Add video URL
          thumbnail: { src: heroLobby, alt: "Spa & Wellness", priority: false } // Thumbnail for video
        },
        {
          type: "image",
          title: "Luxury Stay",
          description: "Unmatched comfort and elegance in every room and suite.",
          author: "Michael Ross, Business Traveler",
          image: { src: hotelMumbai, alt: "Luxury Room", priority: false }
        },
        {
          type: "video",
          title: "Vibrant Socials",
          description: "The perfect setting for connecting with friends and colleagues.",
          author: "Sarah Jenning, Event Planner",
          videoUrl: "https://example.com/social-video.mp4",
          thumbnail: { src: barLounge, alt: "Social Gathering", priority: false }
        }
      ]
    },
    recognitions: [
      {
        title: "Gold List 2024",
        source: "Condé Nast Traveler",
        score: "98/100"
      },
      {
        title: "5-Star Rating",
        source: "Forbes Travel Guide",
        score: "5.0"
      },
      {
        title: "Luxury Keys",
        source: "Michelin Guide",
        score: "3 Keys"
      }
    ]
  }
};
