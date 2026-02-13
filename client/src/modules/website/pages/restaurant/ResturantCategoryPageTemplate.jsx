import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import CategoryHero from "./components/shared/CategoryHero";
import CategoryMenu from "./components/shared/CategoryMenu";
import Testimonials from "./components/Testimonials";
/* Navigation for Category Page */
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/" },
  { type: "link", label: "MENU", href: "#menu" },
  { type: "link", label: "CONTACT", href: "#contact" },
];

export const CATEGORY_DATA = {
  italian: {
    title: "Authentic Italian",
    description:
      "Hand-rolled pasta and wood-fired pizzas using heritage recipes.",
    heroImage:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
    themeColor: "#ef4444",
    menu: [
      {
        category: "Antipasti (Starters)",
        categoryImage:
          "https://images.unsplash.com/photo-1572656631137-7935297eff55?q=80&w=600",
        items: [
          {
            name: "Bruschetta Trio",
            description: "Tomato, Mushroom, and Olive Tapenade.",
            price: "₹450",
            image:
              "https://images.unsplash.com/photo-1506280754576-f6fa8a873550?q=80&w=300",
          },
          {
            name: "Arancini di Riso",
            description: "Crispy risotto balls stuffed with ragu.",
            price: "₹550",
            image:
              "https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=300",
          },
        ],
      },
      {
        category: "Pasta & Zuppe",
        categoryImage:
          "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=600",
        items: [
          {
            name: "Aglio e Olio",
            description: "Garlic, olive oil, and crushed chili flakes.",
            price: "₹650",
            isSpicy: true,
            image:
              "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=300",
          },
          {
            name: "Lasagna Classica",
            description: "Layered pasta with rich meat sauce.",
            price: "₹780",
            image:
              "https://images.unsplash.com/photo-1608759265344-7c6a4e0a7a0f?q=80&w=300",
          },
        ],
      },
    ],
  },

  "luxury-lounge": {
    title: "Luxury Lounge",
    description:
      "An upscale lounge experience with signature cocktails and curated small plates.",
    heroImage:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200",
    themeColor: "#8b5cf6",
    menu: [
      {
        category: "Signature Cocktails",
        categoryImage:
          "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=600",
        items: [
          {
            name: "Royal Old Fashioned",
            description: "Premium bourbon with smoked orange zest.",
            price: "₹850",
            image:
              "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=300",
          },
          {
            name: "Velvet Martini",
            description: "Vodka infused with elderflower essence.",
            price: "₹900",
            image:
              "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?q=80&w=300",
          },
        ],
      },
      {
        category: "Gourmet Bites",
        categoryImage:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600",
        items: [
          {
            name: "Truffle Fries",
            description: "Crispy fries with truffle oil & parmesan.",
            price: "₹420",
            image:
              "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=300",
          },
        ],
      },
    ],
  },

  "spicy-darbar": {
    title: "Spicy Darbar",
    description:
      "A royal journey through Indian spices and traditional clay-oven delicacies.",
    heroImage:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200",
    themeColor: "#f59e0b",
    menu: [
      {
        category: "Kebab & Tandoor",
        categoryImage:
          "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600",
        items: [
          {
            name: "Murgh Malai Tikka",
            description: "Creamy chicken kebabs with cardamom.",
            price: "₹595",
            image:
              "https://images.unsplash.com/photo-1626132646529-5006375325d7?q=80&w=300",
          },
          {
            name: "Paneer Tikka",
            description: "Char-grilled cottage cheese with spices.",
            price: "₹520",
            image:
              "https://images.unsplash.com/photo-1604908177522-43299f49b6f7?q=80&w=300",
          },
        ],
      },
    ],
  },

  takeaway: {
    title: "Takeaway Treats",
    description: "Quick gourmet meals crafted for people on the move.",
    heroImage:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200",
    themeColor: "#10b981",
    menu: [
      {
        category: "Quick Bites",
        categoryImage:
          "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600",
        items: [
          {
            name: "Loaded Chicken Wrap",
            description: "Grilled chicken with spicy mayo.",
            price: "₹320",
            image:
              "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300",
          },
          {
            name: "Veg Club Sandwich",
            description: "Triple layered with fresh veggies.",
            price: "₹280",
            image:
              "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?q=80&w=300",
          },
        ],
      },
    ],
  },

  bakery: {
    title: "The Bakehouse",
    description:
      "Artisanal breads, handcrafted pastries, and premium desserts.",
    heroImage:
      "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?q=80&w=1200",
    themeColor: "#f472b6",
    menu: [
      {
        category: "Freshly Baked",
        categoryImage:
          "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=600",
        items: [
          {
            name: "Butter Croissant",
            description: "Flaky French classic baked daily.",
            price: "₹180",
            image:
              "https://images.unsplash.com/photo-1555507036-ab794f4ade6a?q=80&w=300",
          },
          {
            name: "Chocolate Éclair",
            description: "Filled with rich vanilla custard.",
            price: "₹220",
            image:
              "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?q=80&w=300",
          },
        ],
      },
    ],
  },
};

function ResturantCategoryPageTemplate() {
  const { propertyId, categoryType } = useParams();
  const navigate = useNavigate();

  // Scroll to top on category change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryType]);

  // Get current category data or fallback to null
  const currentCategory = CATEGORY_DATA[categoryType?.toLowerCase()];

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar navItems={RESTAURANT_NAV_ITEMS} logo={siteContent.brand.logo} />
        <div className="py-40 text-center container mx-auto px-6">
          <h2 className="text-5xl font-serif mb-6 dark:text-white">
            Category Not Found
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The culinary vertical you are looking for is currently unavailable.
          </p>
          <button
            onClick={() => navigate(`/restaurant/${propertyId}`)}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
          >
            Return to Restaurant
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
      {/* Navbar */}
      <Navbar navItems={RESTAURANT_NAV_ITEMS} logo={siteContent.brand.logo} />

      <main>
        {/* Dynamic Hero Section with Parallax and SEO breadcrumbs */}
        <CategoryHero content={currentCategory} propertyId={propertyId} />

        {/* Dynamic Menu Section */}
        <div id="menu">
          <CategoryMenu
            menu={currentCategory.menu}
            themeColor={currentCategory.themeColor}
          />
        </div>
        <div id="testimonials">
          <Testimonials/>
        </div>
        {/* Testimonials */}
      </main>

      {/* Footer */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}

export default ResturantCategoryPageTemplate;
