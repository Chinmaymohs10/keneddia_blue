import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { AlertTriangle, Info, Gavel, Scale, ShieldCheck, Globe, CheckCircle2, FileText, ExternalLink } from "lucide-react";

const disclaimers = [
  {
    icon: Info,
    title: "Accuracy of Information",
    content: "While we strive to keep the information on this website accurate and up-to-date, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the information, products, or services contained on the website. Any reliance you place on such information is therefore strictly at your own risk.",
    tags: ["Reliability", "Accuracy"]
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: "Kennedia Blu shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our website or services. This includes, without limitation, loss of data or profit arising out of the use or performance of this platform, even if we have been advised of the possibility of such damages.",
    tags: ["Liability", "Protection"]
  },
  {
    icon: Gavel,
    title: "External Links",
    content: "Our website may contain links to third-party websites. These links are provided for your convenience and to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s) or for any loss or damage that may arise from your use of them.",
    tags: ["Third-Party", "Links"]
  },
  {
    icon: Scale,
    title: "Governing Law",
    content: "The use of this website and any dispute arising out of such use is subject to the laws of the jurisdiction in which our corporate headquarters is located. Any legal action or proceeding related to this website shall be brought exclusively in a court of competent jurisdiction within that territory.",
    tags: ["Legal", "Jurisdiction"]
  }
];

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#1a1a1a] dark:text-gray-100 selection:bg-primary/20 font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Section - Immersive Design */}
      <section className="relative min-h-[70vh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2357]/60 via-[#0A2357]/40 to-white dark:to-[#0A0A0A] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2000" 
            alt="Legal Authority" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto max-w-[1400px] px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-10 shadow-2xl shadow-primary/30 mx-auto relative z-10"
          >
            <Gavel className="w-10 h-10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-md"
          >
            Legal <br />
            <span className="text-primary italic font-light">Disclaimer</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "120px" }}
            transition={{ delay: 0.3 }}
            className="h-1.5 bg-primary mb-12 mx-auto rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-4xl mx-auto drop-shadow-lg"
          >
            Essential information regarding the terms of use, liabilities, and legal boundaries of the Kennedia Blu digital platform.
          </motion.p>
        </div>
      </section>

      {/* Intro Statement Section */}
      <section className="py-24 px-6 relative z-10 -mt-10">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-[#111] p-12 rounded-[3rem] shadow-2xl dark:shadow-none border border-gray-100 dark:border-white/5 text-center"
          >
            <div className="flex justify-center gap-4 mb-8">
              <CheckCircle2 className="text-primary w-8 h-8" />
              <FileText className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif text-[#0A2357] dark:text-white mb-6">Agreement to Terms</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              By accessing and using this website, you acknowledge that you have read, understood, and agreed to be bound by the terms and provisions outlined in this Legal Disclaimer. If you do not agree to these terms, please refrain from using our services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {disclaimers.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start p-10 rounded-[3rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/20 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white dark:bg-white/10 group-hover:bg-primary flex items-center justify-center text-primary group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100 dark:border-white/10">
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-3xl font-serif text-[#0A2357] dark:text-white mb-6 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-light">
                      {item.content}
                    </p>
                  </div>
                </div>
                {/* Subtle Decorative Number */}
                <div className="absolute top-10 right-10 text-9xl font-serif text-gray-200 dark:text-white/5 opacity-10 group-hover:opacity-20 select-none pointer-events-none transition-opacity duration-500">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action / Final Note */}
          {/* <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-16 rounded-[4rem] bg-[#0A2357] dark:bg-primary/10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl">
                <h3 className="text-4xl font-serif mb-6">Need Legal Clarification?</h3>
                <p className="text-white/70 text-lg font-light leading-relaxed">
                  If you have any questions regarding this disclaimer or our terms of service, please do not hesitate to contact our legal department. We are here to ensure complete transparency.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 whitespace-nowrap"
              >
                Contact Legal <ExternalLink size={18} />
              </motion.button>
            </div>
          </motion.div> */}

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-12 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-6 text-gray-300 dark:text-gray-700">
              <ShieldCheck className="w-10 h-10" />
              <Globe className="w-10 h-10" />
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest mb-2">Last Modified</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 font-medium italic">
                Kennedia Blu reserves the right to modify these terms at any time. <br className="hidden md:block" />
                Updated: April 15, 2025.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
