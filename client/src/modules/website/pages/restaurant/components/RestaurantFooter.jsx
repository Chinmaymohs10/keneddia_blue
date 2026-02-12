import { motion } from "framer-motion";
import { restaurantInfo, footerContent } from "@/data/restaurantData";
import { MapPin, Phone, Clock, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter
};

export default function RestaurantFooter() {
  const [email, setEmail] = useState("");
  const { address, contact, hours } = restaurantInfo;

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail("");
  };

  return (
    <footer id="contact" className="bg-foreground dark:bg-background border-t border-border/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-background dark:text-foreground mb-4">
              Kennedia Blu
            </h3>
            <p className="text-background/70 dark:text-foreground/70 leading-relaxed mb-6 max-w-md">
              {footerContent.brandDescription}
            </p>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold text-background dark:text-foreground mb-3 uppercase tracking-wide">
                Subscribe to Our Newsletter
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/10 dark:bg-foreground/10 border-background/20 dark:border-foreground/20 text-background dark:text-foreground placeholder:text-background/50 dark:placeholder:text-foreground/50"
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-semibold text-background dark:text-foreground mb-4 uppercase tracking-wide">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-background/70 dark:text-foreground/70">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  {address.street}, {address.area}<br />
                  {address.city}, {address.state}
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-background/70 dark:text-foreground/70">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  {contact.phones.map((phone, index) => (
                    <a
                      key={index}
                      href={`tel:${phone}`}
                      className="block hover:text-primary transition-colors"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              {contact.email && (
                <div className="flex items-center gap-3 text-background/70 dark:text-foreground/70">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hours Column */}
          <div>
            <h4 className="text-sm font-semibold text-background dark:text-foreground mb-4 uppercase tracking-wide">
              Opening Hours
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-background/70 dark:text-foreground/70">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-background dark:text-foreground mb-1">
                    {hours.days}
                  </p>
                  <p>{hours.time}</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4">
                <h5 className="text-sm font-semibold text-background dark:text-foreground mb-3">
                  Follow Us
                </h5>
                <div className="flex items-center gap-3">
                  {footerContent.socialLinks.map((social, index) => {
                    const Icon = SOCIAL_ICONS[social.icon];
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-background/10 dark:bg-foreground/10 flex items-center justify-center text-background/70 dark:text-foreground/70 hover:bg-primary hover:text-white transition-all"
                        aria-label={social.platform}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 dark:border-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/60 dark:text-foreground/60">
              © {new Date().getFullYear()} Kennedia Blu. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {footerContent.quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-background/60 dark:text-foreground/60 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
