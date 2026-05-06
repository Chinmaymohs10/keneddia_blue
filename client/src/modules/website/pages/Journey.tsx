import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { Compass, MapPin, Star, History, Heart, Users, Cake } from "lucide-react";

const milestones = [
  {
    year: "2015",
    title: "The Vision",
    description: "Kennedia Blu was founded with a simple yet ambitious vision: to redefine premium hospitality through personalized service and timeless design.",
    icon: Compass,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000"
  },
  {
    year: "2018",
    title: "First Landmark",
    description: "Opening of our flagship property, setting a new benchmark for luxury and comfort in the heart of the city.",
    icon: MapPin,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000"
  },
  {
    year: "2021",
    title: "Expansion",
    description: "Successful expansion into new regions, bringing our unique brand of hospitality to more guests across the globe.",
    icon: Star,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1000"
  }
];

const celebrations = [
  {
    title: "Unforgettable Weddings",
    description: "From intimate ceremonies to grand galas, we've had the honor of hosting thousands of couples as they begin their journey together.",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000"
  },
  {
    title: "Family Reunions",
    description: "Creating a home away from home where families gather from across the world to reconnect and create lasting memories.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000"
  },
  {
    title: "Milestone Celebrations",
    description: "Birthdays, anniversaries, and achievements – we believe every milestone deserves the Kennedia Blu touch of excellence.",
    icon: Cake,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000"
  }
];

export default function Journey() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      {/* Hero Section - Full Width */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src="https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=2000"
            alt="Our Journey"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-6 max-w-[1400px] mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif text-white mb-6"
          >
            Our Journey
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-24 h-1 bg-primary mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto"
          >
            A legacy built on excellence, trust, and the art of hosting.
          </motion.p>
        </div>
      </section>

      {/* Corporate Legacy Section - Full Screen Width */}
      <section className="py-32 px-6 bg-white">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif text-[#0A2357] mb-6">Foundations of Excellence</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">Tracing our steps from the first cornerstone to becoming a global icon of hospitality.</p>
          </div>

          <div className="space-y-32">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}
              >
                <div className="flex-1 w-full">
                  <div className="relative group overflow-hidden rounded-3xl aspect-video shadow-2xl">
                    <img
                      src={milestone.image}
                      alt={milestone.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-[#0A2357] font-bold tracking-widest text-sm">
                      {milestone.year}
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8">
                    <milestone.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-serif text-[#0A2357] mb-6">{milestone.title}</h3>
                  <p className="text-gray-600 text-xl leading-relaxed font-light">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Celebrations Section - New Full Screen Width Section */}
      <section className="py-32 px-6 bg-[#fcfcfc] border-y border-gray-100">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif text-[#0A2357] mb-6">A Home for Your Stories</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">Beyond buildings and services, we are curators of life's most precious celebrations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {celebrations.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group flex flex-col h-full"
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-8 shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2357]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white text-sm italic font-light">Celebrating love, laughter, and legacy with the Kennedia Blu family.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-primary">
                  <item.icon className="w-6 h-6" />
                  <div className="h-[1px] flex-1 bg-primary/20" />
                </div>
                <h3 className="text-2xl font-serif text-[#0A2357] mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section - Full Width Background */}
      {/* <section className="py-24 bg-[#0A2357] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto max-w-[1400px] relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-serif mb-2">10+</div>
              <div className="text-white/60 uppercase tracking-widest text-xs">Years of Legacy</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-serif mb-2">25k+</div>
              <div className="text-white/60 uppercase tracking-widest text-xs">Events Hosted</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-serif mb-2">1M+</div>
              <div className="text-white/60 uppercase tracking-widest text-xs">Happy Guests</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-serif mb-2">15</div>
              <div className="text-white/60 uppercase tracking-widest text-xs">Global Awards</div>
            </div>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
}
