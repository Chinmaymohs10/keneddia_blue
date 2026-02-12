import VerticalHero from "../../components/shared/VerticalHero";
import VerticalFoodGrid from "../../components/shared/VerticalFoodGrid";
import VerticalAbout from "../../components/shared/VerticalAbout";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";

export default function LuxuryLounge() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VerticalHero 
          title="Luxury Family Lounge"
          tagline="Sophistication meets comfort in our premium family lounge."
          image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920"
        />
        
        <VerticalAbout 
          title="Family Lounge"
          description="Designed for relaxation and connection, our Luxury Family Lounge offers a refined atmosphere perfect for gathering with loved ones. Enjoy plush seating, ambient lighting, and a menu curated for sharing."
          features={[
            "Premium Seating",
            "Curated Sharing Platters",
            "Kid-Friendly Zone",
            "Private Dining Areas"
          ]}
        />

        <VerticalFoodGrid 
          categoryId="luxury-lounge"
          title="Lounge"
        />
      </main>
      <Footer />
    </div>
  );
}
