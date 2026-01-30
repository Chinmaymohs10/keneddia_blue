import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Share2, Loader2 } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getEventsUpdated } from "@/Api/Api";
import NotFound from "./not-found";

// Define the interface based on your API response
interface ApiEvent {
  id: number;
  title: string;
  locationName: string;
  eventDate: string;
  description: string;
  longDesc: string | null;
  image: {
    url: string;
  };
  ctaText: string;
  ctaLink: string | null;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSingleEvent = async () => {
      try {
        setLoading(true);
        // Fetch all events to find the specific one by ID
        const response = await getEventsUpdated({});
        const rawEvents: ApiEvent[] = response?.data || response || [];
        
        // Find the event matching the ID from params
        const foundEvent = rawEvents.find((e) => e.id.toString() === id);
        setEvent(foundEvent || null);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSingleEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  // Format the date for the UI
  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Support navigation back to home or events list */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content */}
            <div className="flex-1 order-2 lg:order-1">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide uppercase mb-6">
                Upcoming Event
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6 leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-lg mb-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.locationName}</span>
                </div>
              </div>

              {/* Description & Long Description Section */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <p className="text-xl leading-relaxed text-foreground/90 font-medium mb-6">
                  {event.description}
                </p>
                
                {/* Dynamically render longDesc if available */}
                {event.longDesc && (
                  <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                    {event.longDesc}
                  </div>
                )}
                
                {!event.longDesc && (
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Join us for an unforgettable experience at {event.locationName}. 
                    This event promises to be a highlight of the season. 
                    Don't miss out on this unique opportunity!
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                {/* <a 
                  href={event.ctaLink || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg text-center min-w-[160px]"
                >
                  {event.ctaText || "Book Now"}
                </a> */}
                <button className="px-8 py-3 border border-border text-foreground font-bold rounded-lg hover:bg-secondary transition-all flex items-center justify-center gap-2 min-w-[160px]">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:w-1/2 order-1 lg:order-2">
              <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <OptimizedImage
                  src={event.image.url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-secondary/10 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}