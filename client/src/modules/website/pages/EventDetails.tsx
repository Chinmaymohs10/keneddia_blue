import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  Loader2,
  Clock,
  Users,
  Globe,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Ticket,
  Shield,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getEventsUpdated } from "@/Api/Api";
import NotFound from "./not-found";

// ============================================================================
// FALLBACK CONSTANTS
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

const GLOBAL_FALLBACK_EVENT: ApiEvent = {
  id: "featured-fallback",
  title: "Exclusive Property Showcase 2026",
  locationName: "Premium Corporate Hub, Delhi NCR",
  eventDate: new Date().toISOString(),
  description: "Join us for an exclusive walkthrough of our latest luxury residential projects. This featured event offers a unique opportunity to interact with architects and claim limited-time spot booking benefits.",
  longDesc: "This is a premium showcase event designed for serious investors and homebuyers. Attendees will get first-row access to floor plans, virtual reality tours, and one-on-one consultations with our financial advisory team.",
  image: { url: FALLBACK_IMAGE },
  ctaText: "Book Your Slot",
  ctaLink: "/contact",
  typeName: "Premium Showcase",
  time: "10:00 AM - 6:00 PM"
};

interface ApiEvent {
  id: number | string;
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
  typeName?: string;
  time?: string;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [interestedCount, setInterestedCount] = useState(2847);
  const [isInterested, setIsInterested] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    const fetchSingleEvent = async () => {
      try {
        setLoading(true);
        const response = await getEventsUpdated({});
        const rawEvents: ApiEvent[] = response?.data || response || [];

        // 1. Try to find the exact match by ID
        // 2. Fallback to the first event in the list if available
        // 3. Fallback to GLOBAL_FALLBACK_EVENT if the list is empty or ID is random
        const foundEvent =
          rawEvents.find((e) => e.id.toString() === id) || 
          rawEvents[0] || 
          GLOBAL_FALLBACK_EVENT;

        if (foundEvent) {
          setEvent(foundEvent);
          setImgSrc(foundEvent.image?.url || FALLBACK_IMAGE);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        // On API Error, show the global fallback instead of a blank screen
        setEvent(GLOBAL_FALLBACK_EVENT);
        setImgSrc(FALLBACK_IMAGE);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleEvent();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  // Safety check, though fallback logic makes this unlikely
  if (!event) return <NotFound />;

  const eventDate = new Date(event.eventDate || Date.now());
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedDay = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const descriptionPreview =
    event.description?.slice(0, 150) || "Event description details.";
  const shouldShowReadMore = (event.description?.length || 0) > 150;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Events
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* LEFT COLUMN */}
            <div className="flex-1 min-w-0 space-y-6">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-muted border border-border/50">
                <img
                  src={imgSrc}
                  alt={event.title}
                  onError={() => setImgSrc(FALLBACK_IMAGE)}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                    {event.title}
                  </h1>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors shrink-0 border border-border/50 shadow-sm"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 py-3 border-y border-border/50">
                  <button
                    onClick={() => {
                      setIsInterested(!isInterested);
                      setInterestedCount((prev) =>
                        isInterested ? prev - 1 : prev + 1,
                      );
                    }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${isInterested ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-secondary"}`}
                  >
                    <Users className="w-4 h-4" />{" "}
                    {isInterested ? "Interested" : "I'm Interested"}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {interestedCount.toLocaleString()} people interested
                  </span>
                </div>
              </div>

              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> Past Event Highlights
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm"
                    >
                      <img
                        src={`https://picsum.photos/seed/${event.id}${i}/600/400`}
                        alt="past event"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold">About the Event</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {showFullDescription ? event.description : descriptionPreview}
                </p>
                {shouldShowReadMore && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    {showFullDescription ? <>Read Less <ChevronUp className="w-4 h-4" /></> : <>Read More <ChevronDown className="w-4 h-4" /></>}
                  </button>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold mb-2">You Should Know</h3>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2"><span>•</span> Arrive 30 minutes before start</li>
                        <li className="flex items-center gap-2"><span>•</span> Valid ID proof required</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold mb-2">Contactless M-Ticket</h3>
                      <p className="text-xs text-muted-foreground">Instant delivery via SMS and email. Simply show your phone at the gate.</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* STICKY SIDEBAR */}
            <aside className="lg:sticky lg:top-28 w-full lg:w-[350px] shrink-0 lg:self-start pb-10">
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#E33E33]" />
                    <div>
                      <p className="text-sm font-bold">{formattedDay}</p>
                      <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#E33E33]" />
                    <p className="text-sm font-bold">{event.time || "7:00 PM onwards"}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#E33E33]" />
                    <p className="text-sm font-bold">{event.locationName}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-baseline gap-1.5">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-3xl font-black tracking-tighter">499</span>
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">onwards</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full py-3.5 bg-[#E33E33] text-white font-black rounded-xl hover:shadow-lg transition-all active:scale-[0.98] uppercase text-xs tracking-widest">
                    Book Now
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full py-3 border border-border hover:bg-secondary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}