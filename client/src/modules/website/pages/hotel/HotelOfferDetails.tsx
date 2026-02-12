import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Tag } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { HOTEL_OFFERS } from "@/data/hotelContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import NotFound from "@/modules/website/pages/not-found";

export default function HotelOfferDetails() {
  const { id } = useParams();
  const offer = HOTEL_OFFERS.find((o) => o.id === id);

  if (!offer) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Back Link */}
          <Link to="/hotels" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Hotels
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <OptimizedImage
                {...offer.image}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg">
                  {offer.couponCode}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                {offer.location && (
                  <div className="flex items-center gap-2 text-primary font-medium mb-3">
                    <MapPin className="w-5 h-5" />
                    {offer.location}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 leading-tight">
                  {offer.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {offer.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {offer.availableHours && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">{offer.availableHours}</span>
                  </div>
                )}
                {offer.expiresAt && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-xl">
                    <Tag className="w-5 h-5 text-primary" />
                    <span className="font-medium">Expires: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <button className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25">
                {offer.ctaText}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
