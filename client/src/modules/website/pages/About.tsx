import { motion } from "framer-motion";
import { Users, Award, Shield, Target, User } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";

import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { BackButton } from "@/components/ui/BackButton";

const values = [
  {
    icon: Shield,
    title: "Trust",
    description: "We build enduring relationships through transparency, reliability, and unwavering integrity in every interaction.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "Our standards are uncompromising. From the thread count in our linens to the ingredients in our kitchens, we demand the best.",
  },
  {
    icon: Target,
    title: "Excellence in Service",
    description: "Anticipating needs before they are spoken. We strive for perfection in every detail of the guest experience.",
  },
];

const leadership = [
  {
    role: "Chairman",
    name: "Placeholder Name",
    experience: "20+ years of experience in the hospitality industry, driving vision and strategic growth.",
  },
  {
    role: "Managing Director",
    name: "Placeholder Name",
    experience: "15+ years of leadership experience in premium hospitality operations and service excellence.",
  },
  {
    role: "Executive Director",
    name: "Placeholder Name",
    experience: "Extensive experience in hotel management, customer experience, and brand development.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            {...siteContent.images.about.main}
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-white mb-6"
          >
            Redefining Luxury & Trust
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 font-light leading-relaxed"
          >
            Kennedia Blu is more than a hotel chain; it is a promise of premium hospitality.
            We are dedicated to delivering world-class services where every guest feels valued,
            trusted, and truly at home.
          </motion.p>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-serif text-foreground mb-8">Our Legacy</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Founded on the principles of timeless elegance and modern comfort, Kennedia Blu has established itself
            as a trusted name in the global hospitality landscape. Our properties are sanctuaries of peace
            and luxury, thoughtfully designed to offer an escape from the ordinary. We believe that true
            luxury lies in the details—the warmth of a greeting, the comfort of a room, and the authenticity of a smile.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-foreground mb-4">Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The pillars that uphold our promise to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-lg shadow-sm border border-primary/5 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif text-foreground mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-foreground mb-4">Leadership Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Guided by visionaries with decades of expertise in premium hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gray-100 aspect-[3/4] rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
                  <User className="w-24 h-24 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <h3 className="text-xl font-serif text-foreground">{leader.name}</h3>
                <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">{leader.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed border-t border-gray-100 pt-3">
                  {leader.experience}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
