import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Star, CheckCircle2, Wifi, Loader2, Phone, Mail } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { GetAllPropertyListing, getPropertyListingMedia } from "@/Api/Api";
import NotFound from "./not-found";

interface ApiProperty {
  id: number;
  propertyName: string;
  propertyType: string;
  city: string;
  mainHeading: string;
  subTitle: string;
  fullAddress: string;
  tagline: string;
  rating: number | null;
  capacity: number | null;
  price: number;
  amenities: string[];
  media: any[];
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<ApiProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        // 1. Fetch all to find the specific one (or use a GetById API if available)
        const res = await GetAllPropertyListing();
        const allProps = res.data || res;
        
        const found = allProps.find((p: any) => p.id.toString() === id);

        if (found) {
          // 2. Fetch Media for this specific property
          const mediaRes = await getPropertyListingMedia(found.id);
          setProperty({
            ...found,
            media: mediaRes.data || mediaRes || []
          });
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) return <NotFound />;

  const mainImage = property.media?.[0]?.url || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Dynamic Hero Section */}
          <div className="relative h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden mb-12 shadow-2xl">
            <OptimizedImage
              src={mainImage}
              alt={property.propertyName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
                  {property.propertyType}
                </span>
                {property.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold">{property.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif mb-4">{property.propertyName}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg">{property.fullAddress}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-serif mb-6">{property.mainHeading}</h2>
              <p className="text-xl text-primary italic mb-4">{property.subTitle}</p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                {property.tagline}. Located in the heart of {property.city}, this {property.propertyType} offers unmatched excellence and service.
              </p>

              <h3 className="text-2xl font-serif mb-6">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl border border-border">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="flex items-baseline justify-between mb-8">
                  <span className="text-muted-foreground">Starting from</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary block">₹{property.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">per {property.propertyType === 'Hotel' ? 'night' : 'person'}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-3 border-b border-border/50">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{property.capacity || "Flexible"} Guests</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border/50">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{property.city}</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all mb-4">
                  {property.propertyType === 'Hotel' ? 'Book Room' : 'Reserve Table'}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-secondary transition-all">
                        <Phone size={18}/> Call
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-secondary transition-all">
                        <Mail size={18}/> Email
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}