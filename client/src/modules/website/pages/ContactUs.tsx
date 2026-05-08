import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 selection:bg-primary/20 font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative min-h-[52vh] md:min-h-[60vh] pt-24 md:pt-32 pb-14 md:pb-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white dark:to-[#0A0A0A] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000" 
            alt="Contact Us" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1/4 right-1/4 w-[360px] h-[360px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[280px] h-[280px] bg-navy/30 rounded-full blur-[100px] animate-pulse" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-8xl font-serif text-white mb-5 md:mb-6 leading-[0.95] md:leading-[0.9]"
            >
              Contact <br />
              <span className="text-primary italic font-light drop-shadow-lg">Us</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10 drop-shadow-md px-2 sm:px-0"
            >
              We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes.
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-1 bg-primary mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Content Section */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-[#fcfcfc] dark:bg-[#0D0D0D] transition-colors duration-300">
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
                <h2 className="text-3xl md:text-4xl font-serif text-navy dark:text-white mb-6">Get in Touch</h2>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                  We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes. 
                  Reach out to us and our dedicated team will get back to you shortly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">+44 (0) 207 123 4567</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">+44 (0) 207 123 4568</p>
                </div>

                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">info@kennediablu.com</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">support@kennediablu.com</p>
                </div>

                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Visit Us</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
                    12 The Crescent, Riverside Quarter, London, EC4R 9AA, UK
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Hours</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Mon-Fri: 9am - 6pm</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Sat-Sun: Closed</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 transition-colors duration-300"
            >
              <div className="mb-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.14em] mb-4">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send a Message</span>
                </div>
                <h3 className="text-3xl font-serif text-navy dark:text-white">Inquiry Form</h3>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name"
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium text-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium text-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">Subject</label>
                  <select className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-100">
                    <option>General Inquiry</option>
                    <option>Hotel Reservation</option>
                    <option>Restaurant Booking</option>
                    <option>Events & Weddings</option>
                    <option>Career Opportunity</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">Message</label>
                  <textarea 
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none text-sm font-medium text-gray-700 dark:text-gray-100"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-[0.12em] hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
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
