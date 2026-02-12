import VerticalHero from "../../components/shared/VerticalHero";
import VerticalFoodGrid from "../../components/shared/VerticalFoodGrid";
import VerticalAbout from "../../components/shared/VerticalAbout";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";

export default function Italian() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VerticalHero 
          title="Italian Excellence"
          tagline="Authentic flavors from the heart of Italy, crafted with passion."
          image="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=1920"
        />
        
        <VerticalAbout 
          title="Italian Kitchen"
          description="Experience the warmth of traditional Italian dining in a modern setting. Our chefs use imported ingredients and time-honored recipes to bring you the true taste of Italy, from hand-tossed pizzas to artisanal pastas."
          features={[
            "Wood-fired Pizzas",
            "Handmade Pasta Selection",
            "Authentic Tiramisu",
            "Fine Italian Wines"
          ]}
        />

        <VerticalFoodGrid 
          categoryId="italian" // Ensure this matches data/restaurantData.ts category ID
          title="Italian"
        />
      </main>
      <Footer />
    </div>
  );
}
