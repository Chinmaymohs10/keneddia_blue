import { Facebook, Instagram, Youtube, Linkedin, Twitter, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { siteContent } from "@/data/siteContent";

const footerSections = [
  {
    title: "About Us",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Leadership Team", href: "/leadership" },
      { label: "Vision & Mission", href: "/vision" },
      { label: "Our Journey", href: "/journey" },
    ],
  },
  {
    title: "Businesses",
    links: [
      { label: "Hotels & Resorts", href: "/hotels" },
      { label: "Cafes & Dining", href: "/cafes" },
      { label: "Bars & Lounges", href: "/bars" },
      { label: "Events & Conferences", href: "/events" },
      { label: "Wellness & Spa", href: "/wellness" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Kennedia Blu Foundation", href: "/foundation" },
      { label: "Investors", href: "/investors" },
      { label: "Newsroom", href: "/news" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

const legalLinks = [
  { label: "Legal Disclaimer", href: "/legal" },
  { label: "Privacy Notice", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button only after scrolling past hero section (one viewport height)
      setShowScrollTop(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent navigation for now
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white text-foreground border-t border-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6 flex flex-col items-center md:items-start">
            {/* Logo */}
            {/* Logo */}
            <Link to="/" onClick={handleLinkClick} className="inline-block">
              <div className="relative">
                {/* Dark theme logo */}
                <img
                  src={siteContent.brand.logo_hotel.image.src}
                  alt={siteContent.brand.logo_hotel.image.alt || siteContent.brand.logo.text}
                  className="hidden dark:block h-12 md:h-20 w-[15rem] max-w-[200px] md:max-w-[250px] object-contain"
                />

                {/* Light theme (Red) logo */}
                <img
                  src={siteContent.brand.logo.subImage.src}
                  alt={siteContent.brand.logo.subImage.alt || siteContent.brand.logo.text}
                  className="block dark:hidden h-12 md:h-20 w-[15rem] max-w-[200px] md:max-w-[250px] object-contain"
                />
              </div>
            </Link>


            {/* Social Media Icons */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  onClick={handleLinkClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center text-[#4B5563] hover:text-[#B11226] transition-colors"
                >
                  <social.icon className="w-5 h-5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-[#1F2937] font-bold text-sm mb-6 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className="text-sm text-[#374151] hover:text-[#B11226] transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/5 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-[#4B5563]">
              © {new Date().getFullYear()} {siteContent.brand.name}. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  onClick={handleLinkClick}
                  className="text-sm text-[#4B5563] hover:text-[#B11226] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Only shows after hero section */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-card border-2 border-border rounded-full flex items-center justify-center text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-lg z-40 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2} />
        </button>
      )}
    </footer>
  );
}