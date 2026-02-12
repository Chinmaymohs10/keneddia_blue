import VerticalHero from "../../components/shared/VerticalHero";
import VerticalFoodGrid from "../../components/shared/VerticalFoodGrid";
import VerticalAbout from "../../components/shared/VerticalAbout";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";

export default function TakeawayTreats() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VerticalHero 
          title="Takeaway Treats"
          tagline="Restaurant quality meals, enjoyed in the comfort of your home."
          image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920"
          ctaText="Order Online"
        />
        
        <VerticalAbout 
          title="Takeaway Service"
          description="Craving Kennedia Blu's flavors at home? Our Takeaway Treats service ensures you get fresh, hot, and perfectly packaged meals ready for pick-up. Perfect for busy nights or cozy weekends."
          features={[
            "Quick Pickup",
            "Spill-proof Packaging",
            "Freshness Guaranteed",
            "Contactless Options"
          ]}
        />

        <VerticalFoodGrid 
          categoryId="takeaway"
          title="Takeaway"
        />
      </main>
      <Footer />
    </div>
  );
}
