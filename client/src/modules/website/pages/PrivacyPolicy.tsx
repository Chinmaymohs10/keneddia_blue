import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-primary/20 font-sans">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A2357]/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2000" 
            alt="Privacy Policy" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 text-center px-6 max-w-[1400px] mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-white mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-20 h-1 bg-primary mx-auto"
          />
        </div>
      </section>

      {/* Info Header Section */}
      <section className="relative py-12 px-6 border-b border-gray-100 bg-[#fcfcfc]">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 font-medium mb-12">
            <div className="flex items-center gap-2">
              <span className="text-[#0A2357]">Effective Date:</span> January 1, 2025
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0A2357]">Last Updated:</span> April 2025
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0A2357]">Version:</span> 2.1
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl"
          >
            <p className="text-lg md:text-xl leading-relaxed mb-8">
              At <span className="font-bold text-[#0A2357]">Kennedia Blu</span>, we believe that privacy is a mark of respect. This policy outlines how we collect, use, and protect information about our guests — whether you visit us in person, browse our website, or engage with us digitally. We are committed to handling your data with the same care and discretion we bring to every cup we serve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section - Full Screen Width constraints removed for inner content */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-20">
            
            {/* 01. Information We Collect */}
            <div className="max-w-5xl">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">01.</span>
                Information We Collect
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We collect information necessary to provide you with a seamless, personalised experience. This may include:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-gray-700">
                <li><span className="font-bold">Personal Identifiers:</span> Name, email address, phone number, and billing address when you make a reservation or place an order online.</li>
                <li><span className="font-bold">Transactional Data:</span> Order history, preferences, and payment details processed through our secure payment partners.</li>
                <li><span className="font-bold">Usage Data:</span> Information about how you navigate our website, including IP address, browser type, pages visited, and time spent.</li>
                <li><span className="font-bold">Communications:</span> Any messages, feedback, or enquiries submitted through our contact forms or email channels.</li>
                <li><span className="font-bold">Loyalty & Membership:</span> If you enrol in our rewards programme, we collect information to manage your account and deliver exclusive benefits.</li>
              </ul>
              <p className="mt-8 text-gray-600 italic">
                We only collect information that is relevant and necessary. We will never request sensitive data such as government identification unless legally required.
              </p>
            </div>

            {/* 02. How We Use Your Information */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">02.</span>
                How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Your information enables us to deliver, improve, and personalise our services. Specifically, we use your data to:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-gray-700">
                <li>Process reservations, orders, and payments accurately and efficiently.</li>
                <li>Send booking confirmations, receipts, and relevant transactional notifications.</li>
                <li>Personalise your dining experience based on prior interactions and stated preferences.</li>
                <li>Respond to your enquiries and provide guest support.</li>
                <li>Send marketing communications — only with your explicit consent, and always with an easy opt-out.</li>
                <li>Comply with applicable legal obligations and protect against fraud.</li>
                <li>Analyse anonymised usage patterns to improve our website and offerings.</li>
              </ul>
              <div className="mt-8 p-6 bg-[#f8fafc] border-l-4 border-[#0A2357] rounded-r-lg">
                <p className="text-gray-700 italic">
                  We will never use your personal information for automated decision-making that produces significant effects on you without first obtaining your consent.
                </p>
              </div>
            </div>

            {/* 03. Sharing of Information */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">03.</span>
                Sharing of Information
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We do not sell, rent, or trade your personal data. We may share your information in limited circumstances:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-gray-700">
                <li><span className="font-bold">Service Providers:</span> Trusted third-party vendors (payment processors, email platforms, reservation systems) who assist under strict data protection agreements.</li>
                <li><span className="font-bold">Legal Compliance:</span> Where required by law, court order, or to protect the legal rights of Kennedia Blu or our guests.</li>
                <li><span className="font-bold">Business Transfers:</span> In the event of a merger, acquisition, or asset sale, your data may be transferred, subject to the same privacy protections.</li>
              </ul>
              <p className="mt-8 text-gray-600">
                All third parties we engage with are contractually required to safeguard your data and are prohibited from using it for any other purpose.
              </p>
            </div>

            {/* 04. Cookies Policy */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">04.</span>
                Cookies Policy
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our website uses cookies — small text files placed on your device — to enhance your browsing experience. We use:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-gray-700">
                <li><span className="font-bold">Essential Cookies:</span> Necessary for the website to function. These cannot be disabled.</li>
                <li><span className="font-bold">Analytical Cookies:</span> Help us understand how visitors use our site, enabling us to improve functionality and content.</li>
                <li><span className="font-bold">Preference Cookies:</span> Remember your settings and choices for a more personalised visit.</li>
                <li><span className="font-bold">Marketing Cookies:</span> Used with your consent to deliver relevant advertisements and measure campaign performance.</li>
              </ul>
              <p className="mt-8 text-gray-600">
                You can manage or withdraw your cookie consent at any time through your browser settings or our cookie preferences panel.
              </p>
            </div>

            {/* 05. Data Security */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">05.</span>
                Data Security
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We take data security seriously. Our technical and organisational measures include:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-gray-700">
                <li>SSL/TLS encryption for all data transmitted through our website.</li>
                <li>Secure, access-controlled servers with regular security audits.</li>
                <li>Restricted internal access to personal data on a need-to-know basis.</li>
                <li>Regular staff training on data protection and privacy best practices.</li>
              </ul>
              <p className="mt-8 text-gray-600">
                In the event of a data breach that affects your rights and freedoms, we will notify you in accordance with applicable regulations.
              </p>
            </div>

            {/* 06. Your Rights */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">06.</span>
                Your Rights
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Depending on your location and applicable law, you may have the following rights:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-gray-700">
                <li><span className="font-bold">Access:</span> Request a copy of the personal data we hold about you.</li>
                <li><span className="font-bold">Rectification:</span> Request correction of inaccurate or incomplete information.</li>
                <li><span className="font-bold">Erasure:</span> Request deletion of your data where there is no compelling reason for continued processing.</li>
                <li><span className="font-bold">Restriction:</span> Request that we limit how we use your data in certain circumstances.</li>
                <li><span className="font-bold">Portability:</span> Receive your data in a structured, machine-readable format.</li>
                <li><span className="font-bold">Objection:</span> Object to processing based on legitimate interests or for direct marketing.</li>
                <li><span className="font-bold">Withdraw Consent:</span> Where processing is based on consent, withdraw it at any time without affecting prior processing.</li>
              </ul>
              <p className="mt-8 text-gray-600">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@kennediablu.com" className="text-primary hover:underline underline-offset-4">privacy@kennediablu.com</a>. We will respond within 30 days.
              </p>
            </div>

            {/* 07. Third-Party Links */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">07.</span>
                Third-Party Links
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our website may contain links to external platforms — including social media pages, partner venues, or review sites. These links are provided for your convenience and do not constitute our endorsement of those platforms.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We have no control over the content or privacy practices of third-party websites. We encourage you to review their respective privacy policies before sharing any personal information.
              </p>
            </div>

            {/* 08. Updates to This Policy */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">08.</span>
                Updates to This Policy
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We may revise this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we do, the revised version will be posted on this page with an updated effective date.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                For material changes, we will notify you by email (if provided) or through a prominent notice on our website at least 14 days before changes take effect.
              </p>
              <div className="mt-8 p-6 bg-[#f8fafc] border border-[#0A2357]/10 rounded-lg">
                <p className="text-gray-700 italic">
                  Your continued use of our services after any update constitutes your acceptance of the revised policy.
                </p>
              </div>
            </div>

            {/* 09. Contact Information */}
            <div className="max-w-5xl border-t border-gray-100 pt-16">
              <h2 className="text-3xl font-serif text-[#0A2357] mb-8 flex items-baseline gap-4">
                <span className="text-lg font-sans text-primary/60 italic">09.</span>
                Contact Information
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please do not hesitate to reach out:
              </p>
              <div className="mt-8 p-8 border border-[#0A2357]/10 rounded-2xl bg-[#fcfcfc] shadow-sm">
                <div className="space-y-4">
                  <p><span className="font-bold text-[#0A2357]">Company:</span> Kennedia Blu — Data Privacy</p>
                  <p><span className="font-bold text-[#0A2357]">Address:</span> 12 The Crescent, Riverside Quarter, London, EC4R 9AA, United Kingdom</p>
                  <p><span className="font-bold text-[#0A2357]">Email:</span> <a href="mailto:privacy@kennediablu.com" className="text-primary hover:underline">privacy@kennediablu.com</a></p>
                  <p><span className="font-bold text-[#0A2357]">Phone:</span> <a href="tel:+442071234567" className="text-primary hover:underline">+44 (0) 207 123 4567</a></p>
                </div>
                <p className="mt-8 text-sm text-gray-500 font-medium">We aim to respond to all privacy enquiries within 5 business days.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
