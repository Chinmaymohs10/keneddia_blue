import { motion } from "framer-motion";
import { Star, User, Quote } from "lucide-react";
import { siteContent } from "@/data/siteContent";
import { BackButton } from "@/components/ui/BackButton";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeaderLogo from "@/modules/website/components/HeaderLogo";

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Aarav Patel",
    role: "Business Traveler",
    text: "Kennedia Blu in Mumbai is an absolute masterpiece. The service is intuitive, and the attention to detail is unmatched. Truly a home away from home.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "Lifestyle Blogger",
    text: "I was blown away by the high tea experience in New Delhi. The ambiance, the pastries, everything was world-class. Highly recommended!",
    rating: 5,
  },
  {
    id: 3,
    name: "Rajesh & Meera",
    role: "Couple",
    text: "We celebrated our anniversary at the Bengaluru property. The team went above and beyond to make it special. The rooftop lounge is a must-visit.",
    rating: 5,
  },
];

// Placeholder video data (using YouTube embeds)
const videos = [
  {
    id: "v1",
    title: "Customer Experience: The Kennedia Blu Difference",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Rick Roll placeholder - commonly used for demo, replacing with generic if needed
  },
  {
    id: "v2",
    title: "Inside Our Kitchens: A Culinary Journey",
    embedUrl: "https://www.youtube.com/embed/lxRwEPvL-mQ", // Generic nature/relaxing placeholder
  },
];

export default function Reviews() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <div className="pt-32 pb-12 px-6 bg-secondary/20 border-b border-primary/5 mb-12">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-foreground mb-4"
          >
            Reviews & Accolades
          </motion.h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our guests and see why Kennedia Blu is the preferred choice for premium hospitality.
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <section className="container mx-auto px-6 mb-20">
        <h2 className="text-2xl font-serif text-center mb-12">Guest Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-lg shadow-sm border border-border relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
              <div className="flex text-primary mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6 leading-relaxed">"{review.text}"</p>
              <div>
                <h4 className="font-bold text-foreground">{review.name}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <HeaderLogo
        logo={siteContent.brand.logo.image}
        text={siteContent.brand.logo.text}
        bgColor="bg-background"
      />

      <main className="py-12 mb-20">
        <div className="container mx-auto px-6 lg:px-12 mb-8">
          <BackButton />
        </div>

        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* The original instruction had a partial h2 tag here, assuming it was meant to be part of the video section's h2 */}
          </div>
        </div>
      </main>

      {/* Video Section */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif text-center mb-16">Experience Kennedia Blu</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {videos.map((video, index) => (
              <div key={video.id} className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative group">
                  <iframe
                    width="100%"
                    height="100%"
                    src={video.embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <h3 className="text-xl font-serif">{video.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
