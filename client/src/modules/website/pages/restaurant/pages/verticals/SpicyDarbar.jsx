import VerticalHero from "../../components/shared/VerticalHero";
import VerticalFoodGrid from "../../components/shared/VerticalFoodGrid";
import VerticalAbout from "../../components/shared/VerticalAbout";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";

export default function SpicyDarbar() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VerticalHero 
          title="Spicy Darbar"
          tagline="A royal feast of fiery Indian delicacies."
          image="https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=1920"
        />
        
        <VerticalAbout 
          title="Spicy Darbar"
          description="Embark on a culinary journey through the royal kitchens of India. Spicy Darbar brings you bold flavors, aromatic spices, and tandoor-grilled perfection that pays homage to rich culinary traditions."
          features={[
            "Authentic Tandoor",
            "Rich Curries (Gravies)",
            "Signature Biryanis",
            "Traditional Indian Breads"
          ]}
        />

        <VerticalFoodGrid 
          categoryId="spicy-darbar"
          title="Spicy Darbar"
        />
      </main>
      <Footer />
    </div>
  );
}
