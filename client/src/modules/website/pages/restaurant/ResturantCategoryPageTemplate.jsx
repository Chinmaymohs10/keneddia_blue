import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import CategoryHero from "./components/shared/CategoryHero";
import CategoryMenu from "./components/shared/CategoryMenu";
import Testimonials from "./components/Testimonials";
import ResturantSubCategories from "./resturantpage/ResturantSubCategories";
import beverage from "@/assets/resturant_images/beverage.jpg";
import drink1 from "@/assets/resturant_images/drink1.jpg";
import drink2 from "@/assets/resturant_images/drink2.jpg";
import drink3 from "@/assets/resturant_images/drink3.jpg";
import food1 from "@/assets/resturant_images/food1.jpg";
import italian1 from "@/assets/resturant_images/italian1.jpg";
import item1 from "@/assets/resturant_images/item1.jpg";
import item2 from "@/assets/resturant_images/item2.jpg";

/* Navigation for Category Page */
const resturant_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/" },
  { type: "link", label: "MENU", href: "#menu" },
  { type: "link", label: "CONTACT", href: "#contact" },
];

export const CATEGORY_DATA = {
  italian: {
    title: "Authentic Italian",
    description:
      "Hand-rolled pasta and wood-fired pizzas using heritage recipes.",
    heroImage: italian1,
    themeColor: "#ef4444",
    menu: [
      {
        category: "Antipasti (Starters)",
        categoryImage: food1,
        items: [
          {
            name: "Bruschetta Trio",
            description: "Tomato, Mushroom, and Olive Tapenade.",
            price: "₹450",
            image: item1,
          },
          {
            name: "Arancini di Riso",
            description: "Crispy risotto balls stuffed with ragu.",
            price: "₹550",
            image: item2,
          },
        ],
      },
      {
        category: "Pasta & Zuppe",
        categoryImage: italian1,
        items: [
          {
            name: "Aglio e Olio",
            description: "Garlic, olive oil, and crushed chili flakes.",
            price: "₹650",
            isSpicy: true,
            image: food1,
          },
          {
            name: "Lasagna Classica",
            description: "Layered pasta with rich meat sauce.",
            price: "₹780",
            image: item2,
          },
        ],
      },
    ],
  },

  "luxury-lounge": {
    title: "Luxury Lounge",
    description:
      "An upscale lounge experience with signature cocktails and curated small plates.",
    heroImage: drink3,
    themeColor: "#8b5cf6",
    menu: [
      {
        category: "Signature Cocktails",
        categoryImage: beverage,
        items: [
          {
            name: "Royal Old Fashioned",
            description: "Premium bourbon with smoked orange zest.",
            price: "₹850",
            image: drink1,
          },
          {
            name: "Velvet Martini",
            description: "Vodka infused with elderflower essence.",
            price: "₹900",
            image: drink2,
          },
        ],
      },
      {
        category: "Gourmet Bites",
        categoryImage: food1,
        items: [
          {
            name: "Truffle Fries",
            description: "Crispy fries with truffle oil & parmesan.",
            price: "₹420",
            image: item1,
          },
        ],
      },
    ],
  },

  "spicy-darbar": {
    title: "Spicy Darbar",
    description:
      "A royal journey through Indian spices and traditional clay-oven delicacies.",
    heroImage: food1,
    themeColor: "#f59e0b",
    menu: [
      {
        category: "Kebab & Tandoor",
        categoryImage: item2,
        items: [
          {
            name: "Murgh Malai Tikka",
            description: "Creamy chicken kebabs with cardamom.",
            price: "₹595",
            image: item1,
          },
          {
            name: "Paneer Tikka",
            description: "Char-grilled cottage cheese with spices.",
            price: "₹520",
            image: italian1,
          },
        ],
      },
    ],
  },

  takeaway: {
    title: "Takeaway Treats",
    description: "Quick gourmet meals crafted for people on the move.",
    heroImage: item1,
    themeColor: "#10b981",
    menu: [
      {
        category: "Quick Bites",
        categoryImage: item2,
        items: [
          {
            name: "Loaded Chicken Wrap",
            description: "Grilled chicken with spicy mayo.",
            price: "₹320",
            image: food1,
          },
          {
            name: "Veg Club Sandwich",
            description: "Triple layered with fresh veggies.",
            price: "₹280",
            image: italian1,
          },
        ],
      },
    ],
  },

  bakery: {
    title: "The Bakehouse",
    description:
      "Artisanal breads, handcrafted pastries, and premium desserts.",
    heroImage: item2,
    themeColor: "#f472b6",
    menu: [
      {
        category: "Freshly Baked",
        categoryImage: item1,
        items: [
          {
            name: "Butter Croissant",
            description: "Flaky French classic baked daily.",
            price: "₹180",
            image: food1,
          },
          {
            name: "Chocolate Éclair",
            description: "Filled with rich vanilla custard.",
            price: "₹220",
            image: beverage,
          },
        ],
      },
    ],
  },
};

function ResturantCategoryPageTemplate() {
  const { propertyId, categoryType } = useParams();
  console.log(categoryType);
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
        <Navbar navItems={resturant_NAV_ITEMS} logo={siteContent.brand.logo} />
        <div className="py-40 text-center container mx-auto px-6">
          <h2 className="text-5xl font-serif mb-6 dark:text-white">
            Category Not Found
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The culinary vertical you are looking for is currently unavailable.
          </p>
          <button
            onClick={() => navigate(`/resturant/${propertyId}`)}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
          >
            Return to resturant
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
      {/* Navbar */}
      <Navbar navItems={resturant_NAV_ITEMS} logo={siteContent.brand.logo} />

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
        <div id="categories">
          <ResturantSubCategories propertyId={propertyId} />
        </div>
        {/* ResturantSubCategories */}
        <div id="testimonials">
          <Testimonials />
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
