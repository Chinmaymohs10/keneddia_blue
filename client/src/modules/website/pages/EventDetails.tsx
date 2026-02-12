import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, Calendar, MapPin, Share2, Loader2, Clock, 
  Users, Globe, IndianRupee, ChevronDown, ChevronUp,
  Ticket, Shield, Info
} from "lucide-react";
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleInterested = () => {
    setIsInterested(!isInterested);
    setInterestedCount(prev => isInterested ? prev - 1 : prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  // Format the date for the UI
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedDay = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const descriptionPreview = event.description?.slice(0, 150) || "";
  const shouldShowReadMore = event.description?.length > 150;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="pt-16 pb-6 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 max-w-[1280px]">
          {/* Back Navigation */}
          <Link 
            to="/events" 
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 lg:gap-5">
            {/* Left Column - Scrollable Content */}
            <div className="space-y-4 min-w-0">
              {/* Hero Image Gallery */}
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-secondary/20">
                <OptimizedImage
                  src={event.image.url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Meta */}
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight min-w-0 break-words">
                    {event.title}
                  </h1>
                  <button
                    onClick={handleShare}
                    className="flex-shrink-0 p-2 rounded-full hover:bg-secondary transition-colors"
                    aria-label="Share event"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Category Tags */}
                {event.typeName && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs font-medium">
                      {event.typeName}
                    </span>
                  </div>
                )}

                {/* Social Proof */}
                <div className="flex items-center gap-3 py-2 border-y border-border/50">
                  <button
                    onClick={handleInterested}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors text-xs ${
                      isInterested
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span className="font-medium">
                      {isInterested ? "Interested" : "I'm Interested"}
                    </span>
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {interestedCount.toLocaleString()} people interested
                  </span>
                </div>
              </div>

              {/* About the Event */}
              <section>
                <h2 className="text-base font-bold text-foreground mb-2">
                  About the Event
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {showFullDescription ? event.description : descriptionPreview}
                    {!showFullDescription && shouldShowReadMore && "..."}
                  </p>
                  {shouldShowReadMore && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="inline-flex items-center gap-1 text-primary font-medium mt-1.5 hover:underline text-xs"
                    >
                      {showFullDescription ? (
                        <>
                          Read Less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Long Description */}
                {event.longDesc && (
                  <div className="mt-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                      {event.longDesc}
                    </p>
                  </div>
                )}
              </section>

              {/* You Should Know */}
              <section className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1.5">
                      You Should Know
                    </h3>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-600">•</span>
                        <span>Arrive 30 minutes before event starts</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-600">•</span>
                        <span>Valid ID proof required at venue</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-600">•</span>
                        <span>Outside food and beverages not allowed</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-600">•</span>
                        <span>First-come-first-serve seating</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* M-Ticket Info */}
              <section className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Ticket className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1.5">
                      Contactless M-Ticket
                    </h3>
                    <p className="text-[11px] text-muted-foreground mb-1.5">
                      Get tickets instantly via SMS and email. Show M-ticket QR code at venue for entry.
                    </p>
                    <button className="text-[11px] text-green-600 font-medium hover:underline">
                      Learn More →
                    </button>
                  </div>
                </div>
              </section>

              {/* Terms & Conditions */}
              <section className="border border-border/50 rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-foreground text-xs">
                        Terms & Conditions
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-3 pb-3 space-y-1.5 text-[11px] text-muted-foreground">
                    <p>• Tickets once booked cannot be exchanged or refunded</p>
                    <p>• An internet handling fee per ticket may be levied</p>
                    <p>• The organizer reserves the right to deny entry</p>
                    <p>• Security procedures remain the right of venue management</p>
                    <p>• Venue rules apply including prohibition of recording devices</p>
                  </div>
                </details>
              </section>
            </div>

            {/* Right Column - Sticky Booking Card */}
            <div className="lg:sticky lg:top-20 lg:self-start w-full lg:w-[320px]">
              <div className="bg-card border border-border/50 rounded-lg p-3.5 shadow-lg space-y-3">
                {/* Event Details */}
                <div className="space-y-2.5">
                  {/* Date */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {formattedDay}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {event.time || "7:00 PM onwards"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Duration: 2-3 hours (approx)
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {event.locationName}
                      </p>
                      <button className="text-[11px] text-primary hover:underline">
                        View on map →
                      </button>
                    </div>
                  </div>

                  {/* Age Limit */}
                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        All Ages
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Family friendly event
                      </p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        English, Hindi
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/50" />

                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <IndianRupee className="w-3 h-3 text-foreground" />
                    <span className="text-xl font-bold text-foreground">
                      499
                    </span>
                    <span className="text-xs text-muted-foreground">
                      onwards
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    *Excluding convenience fees
                  </p>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Tickets Available
                  </span>
                </div>

                {/* Primary CTA */}
                <button 
                  className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                  onClick={() => {
                    // Handle booking logic
                    console.log("Book Now clicked");
                  }}
                >
                  Book Now
                </button>

                {/* Quick Actions */}
                <button 
                  onClick={handleShare}
                  className="w-full py-2 border border-border hover:bg-secondary rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
              </div>

              {/* Additional Info Card */}
              <div className="mt-2.5 p-2.5 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-[10px] text-muted-foreground text-center">
                  By proceeding, you agree to our{" "}
                  <button className="text-primary hover:underline">
                    Terms & Conditions
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}