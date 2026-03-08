import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, Clock, MapPin, Tag, Share2, 
  ShieldCheck, Info, Ticket, ChevronUp, 
  ChevronDown, Image as ImageIcon, Loader2,
  IndianRupee
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// ============================================================================
// FALLBACK DATA (Used if ID 10, 12, 13 etc. is not found)
// ============================================================================
const FALLBACK_OFFER = {
  id: "fallback",
  title: "Exclusive Property Premium Offer",
  description: "Experience luxury living with our signature premium benefits. This exclusive offer includes a special cashback and priority site visits for all new registrations.",
  location: "Premium Locations Only",
  couponCode: "PREMIUM2026",
  expiresAt: "2026-12-31",
  availableHours: "9:00 AM - 9:00 PM",
  discountValue: "50,000",
  ctaText: "Claim Premium Offer",
  image: {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
  }
};

export default function OfferDetails() {
  const { id } = useParams<{ id: string }>();
  const { offers } = siteContent.text.dailyOffers;
  
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState("");

  // Helper to slugify
  const slugify = (text: string) => 
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // ============================================================================
  // ID MATCHING & FALLBACK LOGIC
  // ============================================================================
  const offer = offers.find((o) => 
    o.id?.toString() === id || slugify(o.title) === id
  ) || FALLBACK_OFFER;

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImg(offer.image?.url || FALLBACK_OFFER.image.url);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [id, offer]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: offer.description,
          url: window.location.href,
        });
      } catch (err) { console.log("Shared cancelled"); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Offer link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Increased padding-top (pt-28) to prevent breadcrumbs from hiding under Navbar */}
      <main className="pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-[1280px]">
          {/* Back Navigation */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          {/* FIXED STICKY LAYOUT: 
              1. Parent must be 'flex items-start'. 
              2. 'items-start' ensures the sidebar doesn't stretch to the full height of the left content.
          */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            
            {/* LEFT COLUMN: Main Offer Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Hero Banner Section */}
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-muted border border-border/50">
                <img
                  src={currentImg}
                  alt={offer.title}
                  onError={() => setCurrentImg(FALLBACK_OFFER.image.url)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#E33E33] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg">
                    {offer.couponCode}
                  </span>
                </div>
              </div>

              {/* Title & Share Area */}
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight text-foreground">
                    {offer.title}
                  </h1>
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-secondary/50 hover:bg-secondary transition-all shrink-0 border border-border/50 shadow-sm"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[#E33E33] text-sm font-bold">
                  <MapPin className="w-4 h-4" />
                  {offer.location}
                </div>
              </div>

              {/* Property Gallery Grid */}
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#E33E33]" /> Property Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm">
                      <img 
                        src={`https://picsum.photos/seed/prop-${offer.id || 'rand'}-${i}/600/400`} 
                        alt="Property view" 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Offer Description Section */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold">Offer Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {offer.description}
                </p>
              </section>

              {/* Info Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold mb-2 text-foreground">Claiming Terms</h3>
                      <ul className="space-y-1.5 text-[11px] text-muted-foreground list-none">
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span> Valid for first site visit only
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span> Code must be shown at reception
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold mb-2 text-foreground">Verified Offer</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        This claim has been verified by property management. Benefits are credited within 24 hours of successful verification.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Expandable Terms */}
              <section className="border border-border/50 rounded-xl overflow-hidden bg-secondary/5">
                <button 
                  onClick={() => setShowFullTerms(!showFullTerms)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/10 transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Terms & Conditions</span>
                  {showFullTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showFullTerms && (
                  <div className="p-4 pt-0 text-[11px] text-muted-foreground space-y-2">
                    <p>• Offer cannot be exchanged for cash or transferred.</p>
                    <p>• Management reserves the right to modify terms at any time.</p>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT SIDEBAR: STICKY & FIXED 
                - lg:sticky: Required for stickiness.
                - lg:top-28: Increased offset to clear Navbar height.
                - lg:self-start: Ensures the sidebar doesn't expand vertically, allowing it to move.
            */}
            <aside className="lg:sticky lg:top-28 w-full lg:w-[350px] shrink-0 lg:self-start pb-10">
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Meta Details List */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-[#E33E33] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Coupon Code</p>
                      <p className="text-sm font-black text-[#E33E33] bg-[#E33E33]/5 px-2 py-0.5 rounded border border-[#E33E33]/20 mt-1 inline-block">
                        {offer.couponCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#E33E33] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Availability</p>
                      <p className="text-sm font-bold text-foreground">{offer.availableHours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-[#E33E33] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Expires On</p>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(offer.expiresAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                   <p className="text-[10px] uppercase text-muted-foreground font-black mb-1.5">Claim Benefit</p>
                   <div className="flex items-baseline gap-1.5 text-[#E33E33]">
                    <IndianRupee className="w-4 h-4 shrink-0" />
                    <span className="text-3xl font-black tracking-tighter">
                      {offer.discountValue || "Varies"}
                    </span>
                    <span className="text-xs font-bold uppercase opacity-80">Benefit</span>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full py-4 bg-[#E33E33] text-white font-black rounded-xl hover:shadow-lg transition-all active:scale-[0.98] uppercase text-xs tracking-widest">
                    {offer.ctaText || "Claim Offer"}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full py-3 border border-border hover:bg-secondary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share with Friends
                  </button>
                </div>
              </div>

              {/* Bottom Agreement Text */}
              <div className="mt-4 p-4 bg-secondary/10 rounded-xl border border-border/50 flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="text-[9px] text-muted-foreground leading-normal">
                  By clicking Claim, you authorize us to contact you regarding property offers.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}