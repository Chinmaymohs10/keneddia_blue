
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HotelStickyNavProps {
  sections: { id: string; label: string }[];
}

export default function HotelStickyNav({ sections }: HotelStickyNavProps) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id || '');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
      const offset = 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Find the current active section
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section is in the upper part of the viewport
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === section.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
