import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { AlertTriangle, Info, Gavel, Scale, ShieldCheck, Globe } from "lucide-react";

const disclaimers = [
  {
    icon: Info,
    title: "Accuracy of Information",
    content: "While we strive to keep the information on this website accurate and up-to-date, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the information, products, or services contained on the website."
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: "Kennedia Blu shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our website or services. This includes loss of data or profit arising out of the use of this platform."
  },
  {
    icon: Gavel,
    title: "External Links",
    content: "Our website may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them."
  },
  {
    icon: Scale,
    title: "Governing Law",
    content: "The use of this website and any dispute arising out of such use is subject to the laws of the jurisdiction in which our corporate headquarters is located. Any legal action or proceeding related to this website shall be brought exclusively in a court of competent jurisdiction."
  }
];

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-primary/20 font-sans">
      <Navbar />

      {/* Hero Section - Full Width Background */}
      <section className="relative pt-40 pb-24 px-6 bg-[#fcfcfc] border-b border-gray-100 overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0A2357]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-[1400px] relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-[#0A2357] rounded-3xl flex items-center justify-center text-white mb-10 shadow-xl shadow-[#0A2357]/20"
          >
            <Gavel className="w-10 h-10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-[#0A2357] mb-8"
          >
            Legal Disclaimer
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100px" }}
            transition={{ delay: 0.3 }}
            className="h-1 bg-primary mb-10"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-3xl"
          >
            By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.
          </motion.p>
        </div>
      </section>

      {/* Main Content Section - Full Screen Width constraints removed for inner grid */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-24">
            {disclaimers.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="flex gap-10 items-start p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-[#0A2357]/20 hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#f8fafc] group-hover:bg-[#0A2357] flex items-center justify-center text-[#0A2357] group-hover:text-white transition-colors duration-500 shadow-sm">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif text-[#0A2357] mb-6">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg font-light">
                      {item.content}
                    </p>
                  </div>
                </div>
                {/* Decorative index number */}
                <div className="absolute -top-4 -right-4 text-8xl font-serif text-gray-50 opacity-[0.03] group-hover:opacity-[0.07] select-none pointer-events-none transition-opacity">
                  0{index + 1}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note within Full Width Container */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-6 text-gray-400">
              <ShieldCheck className="w-8 h-8" />
              <Globe className="w-8 h-8" />
            </div>
            <p className="text-sm text-gray-500 font-medium text-center md:text-right max-w-md italic">
              Kennedia Blu reserves the right to modify these terms at any time without prior notice. Please check this page regularly for any updates.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
