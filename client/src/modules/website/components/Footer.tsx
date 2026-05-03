import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  ArrowUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { siteContent } from "@/data/siteContent";
import { useLogos } from "./LogoProvider";

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
  const { getFooterLogos } = useLogos();
  const footerLogos = getFooterLogos();

  const footerLightSrc = footerLogos.light?.src ?? siteContent.brand.footer.image.src;
  const footerLightAlt = footerLogos.light?.alt ?? siteContent.brand.footer.image.alt;
  const footerDarkSrc = footerLogos.dark?.src ?? siteContent.brand.footer.image.src;
  const footerDarkAlt = footerLogos.dark?.alt ?? siteContent.brand.footer.image.alt;

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
    <footer className="footer-shell">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" onClick={handleLinkClick} className="inline-block">
              <div className="relative">
                {/* Light Mode Logo */}
                <img
                  src={footerLightSrc}
                  alt={footerLightAlt}
                  className="block dark:hidden h-12 md:h-20 w-60 max-w-[200px] md:max-w-[250px] object-contain"
                />
                {/* Dark Mode Logo */}
                <img
                  src={footerDarkSrc}
                  alt={footerDarkAlt}
                  className="hidden dark:block h-12 md:h-20 w-60 max-w-[200px] md:max-w-[250px] object-contain"
                />
              </div>
            </Link>

            {/* Social Media Icons */}
            <div className="footer-social-row">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  onClick={handleLinkClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="footer-social-link"
                >
                  <social.icon className="w-5 h-5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="footer-heading">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className="footer-link"
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
      <div className="footer-bottom">
        <div className="container mx-auto px-6 py-4 lg:px-12">
          <div className="footer-bottom-row">
            {/* Copyright */}
            <p className="footer-meta-text">
              © {new Date().getFullYear()} {siteContent.brand.name}. All rights
              reserved.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  onClick={handleLinkClick}
                  className="footer-meta-text"
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
          className="footer-scrolltop"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2} />
        </button>
      )}
    </footer>
  );
}
