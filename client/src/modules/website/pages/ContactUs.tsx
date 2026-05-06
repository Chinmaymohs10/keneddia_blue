import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-primary/20 font-sans">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A2357]/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000" 
            alt="Contact Us" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 text-center px-6 max-w-[1400px] mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-white mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-20 h-1 bg-primary mx-auto"
          />
        </div>
      </section>

      {/* Contact Content Section */}
      <section className="py-24 px-6 bg-[#fcfcfc]">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Left Column: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-4xl font-serif text-[#0A2357] mb-6">Get in Touch</h2>
                <p className="text-gray-600 text-lg font-light leading-relaxed">
                  We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes. 
                  Reach out to us and our dedicated team will get back to you shortly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A2357] flex items-center justify-center text-white mb-6">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-[#0A2357] mb-2">Call Us</h3>
                  <p className="text-gray-500 font-light">+44 (0) 207 123 4567</p>
                  <p className="text-gray-500 font-light">+44 (0) 207 123 4568</p>
                </div>

                <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A2357] flex items-center justify-center text-white mb-6">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-[#0A2357] mb-2">Email Us</h3>
                  <p className="text-gray-500 font-light">info@kennediablu.com</p>
                  <p className="text-gray-500 font-light">support@kennediablu.com</p>
                </div>

                <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A2357] flex items-center justify-center text-white mb-6">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-[#0A2357] mb-2">Visit Us</h3>
                  <p className="text-gray-500 font-light text-sm leading-relaxed">
                    12 The Crescent, Riverside Quarter, London, EC4R 9AA, UK
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A2357] flex items-center justify-center text-white mb-6">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-[#0A2357] mb-2">Hours</h3>
                  <p className="text-gray-500 font-light">Mon-Fri: 9am - 6pm</p>
                  <p className="text-gray-500 font-light">Sat-Sun: Closed</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-50"
            >
              <div className="mb-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send a Message</span>
                </div>
                <h3 className="text-3xl font-serif text-[#0A2357]">Inquiry Form</h3>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Subject</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-gray-700">
                    <option>General Inquiry</option>
                    <option>Hotel Reservation</option>
                    <option>Restaurant Booking</option>
                    <option>Events & Weddings</option>
                    <option>Career Opportunity</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Message</label>
                  <textarea 
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-[#0A2357] text-white font-bold hover:bg-[#0A2357]/90 hover:shadow-xl hover:shadow-[#0A2357]/20 transition-all flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5" />
                  Submit Message
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
