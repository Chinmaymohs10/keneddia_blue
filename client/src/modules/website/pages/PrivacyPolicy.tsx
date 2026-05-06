import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Building2, MapPin, Mail, Phone, ChevronRight } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";

const RESPONSE_BODY = {
  mainTitle: "Privacy Policy",
  effectiveDate: "2025-01-01",
  lastUpdated: "2025-04-01",
  version: "1.3",
  sections: [
    {
      title: "Information We Collect",
      description:
        "We collect personal and usage information such as your name, contact details, reservation preferences, and visit activity to provide and improve our services.",
      highlightText: "We only collect information necessary for service delivery and support.",
      active: true,
      sequence: 1,
    },
    {
      title: "How We Use Information",
      description:
        "Your information is used to process bookings, send confirmations, respond to requests, personalize your experience, and maintain service quality.",
      highlightText: "Marketing communication is sent only when consent is provided.",
      active: true,
      sequence: 2,
    },
    {
      title: "Sharing of Information",
      description:
        "We may share limited information with trusted service partners for payments, booking operations, and legal compliance. We do not sell your personal data.",
      highlightText: "All partners are required to protect your information under strict agreements.",
      active: true,
      sequence: 3,
    },
    {
      title: "Cookies and Tracking",
      description:
        "We use essential and analytics cookies to support website functionality, understand usage patterns, and improve user experience.",
      highlightText: "You can manage cookie preferences from your browser settings.",
      active: true,
      sequence: 4,
    },
    {
      title: "Data Security",
      description:
        "We apply technical and organizational safeguards such as secure servers, controlled access, and encrypted transmission to protect your data.",
      highlightText: "No online system is fully risk-free, but we continuously improve protection measures.",
      active: true,
      sequence: 5,
    },
    {
      title: "Your Rights",
      description:
        "Depending on applicable law, you may request access, correction, deletion, portability, or restriction of how your personal data is processed.",
      highlightText: "For requests, contact our privacy support team.",
      active: true,
      sequence: 6,
    },
  ],
};

const SECTIONS = [
  {
    id: "collected",
    num: "01",
    title: "Information We Collect",
    intro: "We collect information necessary to provide you with a seamless, personalised experience. This may include:",
    items: [
      { label: "Personal Identifiers", text: "Name, email address, phone number, and billing address when you make a reservation or place an order online." },
      { label: "Transactional Data", text: "Order history, preferences, and payment details processed through our secure payment partners." },
      { label: "Usage Data", text: "Information about how you navigate our website, including IP address, browser type, pages visited, and time spent." },
      { label: "Communications", text: "Any messages, feedback, or enquiries submitted through our contact forms or email channels." },
      { label: "Loyalty & Membership", text: "If you enrol in our rewards programme, we collect information to manage your account and deliver exclusive benefits." },
    ],
    callout: "We only collect information that is relevant and necessary. We will never request sensitive data such as government identification unless legally required.",
  },
  {
    id: "usage",
    num: "02",
    title: "How We Use Your Information",
    intro: "Your information enables us to deliver, improve, and personalise our services. Specifically, we use your data to:",
    items: [
      { text: "Process reservations, orders, and payments accurately and efficiently." },
      { text: "Send booking confirmations, receipts, and relevant transactional notifications." },
      { text: "Personalise your dining experience based on prior interactions and stated preferences." },
      { text: "Respond to your enquiries and provide guest support." },
      { text: "Send marketing communications — only with your explicit consent, and always with an easy opt-out." },
      { text: "Comply with applicable legal obligations and protect against fraud." },
      { text: "Analyse anonymised usage patterns to improve our website and offerings." },
    ],
    callout: "We will never use your personal information for automated decision-making that produces significant effects on you without first obtaining your consent.",
  },
  {
    id: "sharing",
    num: "03",
    title: "Sharing of Information",
    intro: "We do not sell, rent, or trade your personal data. We may share your information in limited circumstances:",
    items: [
      { label: "Service Providers", text: "Trusted third-party vendors — payment processors, email platforms, reservation systems — who assist under strict data protection agreements." },
      { label: "Legal Compliance", text: "Where required by law, court order, or to protect the legal rights of Kennedia Blu or our guests." },
      { label: "Business Transfers", text: "In the event of a merger, acquisition, or asset sale, your data may be transferred, subject to the same privacy protections." },
    ],
    footer: "All third parties we engage with are contractually required to safeguard your data and are prohibited from using it for any other purpose.",
  },
  {
    id: "cookies",
    num: "04",
    title: "Cookies Policy",
    intro: "Our website uses cookies — small text files placed on your device — to enhance your browsing experience. We use:",
    items: [
      { label: "Essential Cookies", text: "Necessary for the website to function. These cannot be disabled." },
      { label: "Analytical Cookies", text: "Help us understand how visitors use our site, enabling us to improve functionality and content." },
      { label: "Preference Cookies", text: "Remember your settings and choices for a more personalised visit." },
      { label: "Marketing Cookies", text: "Used with your consent to deliver relevant advertisements and measure campaign performance." },
    ],
    footer: "You can manage or withdraw your cookie consent at any time through your browser settings or our cookie preferences panel.",
  },
  {
    id: "security",
    num: "05",
    title: "Data Security",
    intro: "We take data security seriously. Our technical and organisational measures include:",
    items: [
      { text: "SSL/TLS encryption for all data transmitted through our website." },
      { text: "Secure, access-controlled servers with regular security audits." },
      { text: "Restricted internal access to personal data on a need-to-know basis." },
      { text: "Regular staff training on data protection and privacy best practices." },
    ],
    footer: "In the event of a data breach that affects your rights and freedoms, we will notify you in accordance with applicable regulations.",
  },
  {
    id: "rights",
    num: "06",
    title: "Your Rights",
    intro: "Depending on your location and applicable law, you may have the following rights:",
    items: [
      { label: "Access", text: "Request a copy of the personal data we hold about you." },
      { label: "Rectification", text: "Request correction of inaccurate or incomplete information." },
      { label: "Erasure", text: "Request deletion of your data where there is no compelling reason for continued processing." },
      { label: "Restriction", text: "Request that we limit how we use your data in certain circumstances." },
      { label: "Portability", text: "Receive your data in a structured, machine-readable format." },
      { label: "Objection", text: "Object to processing based on legitimate interests or for direct marketing." },
      { label: "Withdraw Consent", text: "Where processing is based on consent, withdraw it at any time without affecting prior processing." },
    ],
    contact: true,
  },
  {
    id: "links",
    num: "07",
    title: "Third-Party Links",
    body: [
      "Our website may contain links to external platforms — including social media pages, partner venues, or review sites. These links are provided for your convenience and do not constitute our endorsement of those platforms.",
      "We have no control over the content or privacy practices of third-party websites. We encourage you to review their respective privacy policies before sharing any personal information.",
    ],
  },
  {
    id: "updates",
    num: "08",
    title: "Updates to This Policy",
    body: [
      "We may revise this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we do, the revised version will be posted on this page with an updated effective date.",
      "For material changes, we will notify you by email (if provided) or through a prominent notice on our website at least 14 days before changes take effect.",
    ],
    note: "Your continued use of our services after any update constitutes your acceptance of the revised policy.",
  },
  {
    id: "contact",
    num: "09",
    title: "Contact Information",
    contactPage: true,
  },
];

export default function PrivacyPolicy() {
  const responseSections =
    RESPONSE_BODY.sections.length > 0
      ? RESPONSE_BODY.sections
          .filter((section) => section.active)
          .sort((a, b) => a.sequence - b.sequence)
          .map((section, index) => ({
            id: `response-${index + 1}`,
            num: String(index + 1).padStart(2, "0"),
            title: section.title,
            intro: "",
            items: [{ text: section.description }],
            callout: section.highlightText || "",
          }))
      : SECTIONS;

  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      // Reset to first section if at the top
      if (window.scrollY < 400) {
        setActiveIdx(0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.findIndex(ref => ref === entry.target);
          if (index !== -1) {
            setActiveIdx(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (i: number) => {
    const target = sectionRefs.current[i];
    if (target) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Navbar />

      {/* Hero Header - Enhanced with Visible Image */}
      <section className="relative min-h-[60vh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white dark:to-[#0A0A0A] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2000" 
            alt="Data Security" 
            className="w-full h-full object-cover"
          />
          {/* Animated Glow Elements */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-navy/30 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
           
            
            <h1 className="text-5xl md:text-8xl font-serif text-white mb-6 leading-[0.9]">
              Privacy <br />
              <span className="text-primary italic font-light drop-shadow-lg">Matters</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-md"
            >
              How we protect, manage, and value your data at Kennedia Blu. 
              Our commitment to transparency starts here.
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-1 bg-primary mx-auto mb-10"
            />
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/50 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Effective: Jan 1, 2025
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Updated: April 2025
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Version: 2.1
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Sidebar Navigation - Sticky */}
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Table of Contents</p>
                {responseSections.map((sec, i) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(i)}
                    className={`group flex items-center gap-4 w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      activeIdx === i 
                        ? "bg-primary/5 text-primary shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${activeIdx === i ? "text-primary" : "text-gray-300 dark:text-gray-700"}`}>
                      {sec.num}
                    </span>
                    <span className="text-sm font-medium flex-1 truncate">{sec.title}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeIdx === i ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                  </button>
                ))}
              </div>
            </aside>

            {/* Content Sections */}
            <main className="lg:w-3/4 space-y-24 pb-32">
              {responseSections.map((sec, i) => (
                <div
                  key={sec.id}
                  ref={(el) => (sectionRefs.current[i] = el)}
                  className="scroll-mt-32"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-3xl md:text-4xl font-serif text-primary/20 dark:text-primary/10">
                        {sec.num}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-serif text-navy dark:text-white">{sec.title}</h2>
                    </div>

                    {sec.body && sec.body.map((para, pIdx) => (
                      <p key={pIdx} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-light">
                        {para}
                      </p>
                    ))}

                    {sec.items && (
                      <div className="grid grid-cols-1 gap-4 my-8">
                        {sec.items.map((item, itemIdx) => (
                          <div 
                            key={itemIdx}
                            className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {sec.callout && (
                      <div className="p-6 rounded-2xl bg-primary/5 border-l-4 border-primary mt-8">
                        <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">
                          {sec.callout}
                        </p>
                      </div>
                    )}

                    {sec.note && (
                      <div className="p-6 rounded-2xl bg-navy/5 dark:bg-white/5 border border-navy/10 dark:border-white/10 mt-8">
                        <p className="text-gray-600 dark:text-gray-400 italic text-sm leading-relaxed">
                          {sec.note}
                        </p>
                      </div>
                    )}

                    {sec.footer && (
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-6 font-light italic">
                        {sec.footer}
                      </p>
                    )}

                    {sec.contact && (
                      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/10">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          To exercise any of these rights, please contact our data team at {" "}
                          <a href="mailto:privacy@kennediablu.com" className="text-primary font-medium hover:underline">
                            privacy@kennediablu.com
                          </a>.
                        </p>
                      </div>
                    )}

                    {sec.contactPage && (
                      <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-white/5 shadow-xl dark:shadow-none border border-gray-100 dark:border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Company</p>
                              <p className="text-sm text-navy dark:text-white font-medium">Kennedia Blu — Data Privacy</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                              <p className="text-sm text-navy dark:text-white font-medium leading-relaxed">12 The Crescent, Riverside Quarter, London, UK</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Mail size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                              <a href="mailto:privacy@kennediablu.com" className="text-sm text-primary font-medium hover:underline">privacy@kennediablu.com</a>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Phone size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                              <a href="tel:+442071234567" className="text-sm text-navy dark:text-white font-medium hover:underline">+44 (0) 207 123 4567</a>
                            </div>
                          </div>
                        </div>
                        <p className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-[11px] text-gray-400 text-center">
                          We aim to respond to all privacy-related inquiries within 5 business days.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
