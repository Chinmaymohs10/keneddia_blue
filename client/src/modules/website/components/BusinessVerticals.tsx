import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Coffee, Wine, Music, Briefcase, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getKennediaGroup } from "@/Api/Api";

// 1. Static Fallback Data (limited to 5)
const STATIC_DATA = {
  mainTitle: "Kennedia Group",
  subTitle: "A diverse ecosystem of luxury hospitality brands.",
  logoText: "KB",
  logoSubText: "Group",
  divisions: [
    { id: 1, title: "Hotels & Resorts", icon: "HOTEL", description: "Luxury stays globally", displayOrder: 1 },
    { id: 2, title: "Cafes & Dining", icon: "CAFE", description: "Artisan culinary delights", displayOrder: 2 },
    { id: 3, title: "Bars & Lounges", icon: "BAR", description: "Signature cocktails", displayOrder: 3 },
  ],
};

const IconMap: Record<string, any> = {
  HOTEL: Building2,
  CAFE: Coffee,
  BAR: Wine,
  EVENT: Briefcase,
  MUSIC: Music,
};

// Helper function to truncate description to max words for 2-line display
const truncateDescription = (text: string, maxWords: number = 6): string => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export default function BusinessVerticals() {
  const [isMobile, setIsMobile] = useState(false);
  // 2. Initialize with Static Data to prevent "undefined" errors
  const [groupData, setGroupData] = useState(STATIC_DATA);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchData = async () => {
      try {
        const res = await getKennediaGroup();
        // Check if response has the expected structure
        const validData = res?.divisions ? res : res?.data; 
        if (validData && Array.isArray(validData.divisions)) {
          // Limit to first 5 divisions
          const limitedData = {
            ...validData,
            divisions: validData.divisions.slice(0, 5)
          };
          setGroupData(limitedData);
        }
      } catch (error) {
        console.warn("API failed, staying with static fallback", error);
      }
    };

    fetchData();
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="py-2 bg-gradient-to-b from-background to-secondary/10 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            {groupData.mainTitle}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {groupData.subTitle}
          </p>
        </div>

        {isMobile ? (
          <MobileTimeline verticals={groupData.divisions} />
        ) : (
          <DesktopTree 
            divisions={groupData.divisions} 
            logoText={groupData.logoText} 
            logoSubText={groupData.logoSubText} 
          />
        )}
      </div>
    </section>
  );
}

function DesktopTree({ divisions, logoText, logoSubText }: any) {
  // 3. Safety Check: If API fails and returns null/obj, fallback to empty array
  const safeDivisions = Array.isArray(divisions) ? [...divisions] : [];
  
  // Sort by displayOrder and limit to first 5 divisions max
  const sortedDivisions = safeDivisions
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 5); // HARD LIMIT: Only show first 5 divisions

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[500px] flex flex-col items-center justify-center py-10">
      <div className="relative z-20 mb-16">
        <div className="w-32 h-32 rounded-full bg-card shadow-xl border-4 border-primary/20 flex items-center justify-center relative z-20">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-foreground leading-none">{logoText}</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary mt-1 font-bold">{logoSubText}</p>
          </div>
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 h-16 w-[1px] bg-primary/20" />
      </div>

      <div className="relative w-4/5 h-[1px] bg-primary/20 mb-8" />

      <div className="flex justify-between items-start w-full px-4 relative -mt-8">
        {sortedDivisions.map((v: any, i: number) => (
          <BranchNode key={v.id} item={v} index={i} />
        ))}
      </div>
    </div>
  );
}

function BranchNode({ item, index }: any) {
  const Icon = IconMap[item.icon] || Building2;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center text-center group relative flex-1"
    >
      <div className="h-8 w-[1px] bg-primary/20 mb-4" />
      <Link to={`/#`}>
        <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 shadow-lg flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-all">
          <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
        </div>
      </Link>
      <h3 className="text-sm font-bold">{item.title}</h3>
      <p className="text-xs text-muted-foreground/70 max-w-[120px] line-clamp-2">
        {truncateDescription(item.description, 6)}
      </p>
    </motion.div>
  );
}

function MobileTimeline({ verticals }: any) {
  // Limit to first 5 on mobile as well
  const safeVerticals = Array.isArray(verticals) ? verticals.slice(0, 5) : [];
  
  return (
    <div className="relative pl-6 border-l border-dashed border-primary/20 space-y-8 py-4">
      {safeVerticals.map((v: any) => {
        const Icon = IconMap[v.icon] || Building2;
        return (
          <Link key={v.id} to={`/division/${v.id}`} className="block bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary"><Icon className="w-4 h-4" /></div>
              <h3 className="text-base font-bold">{v.title}</h3>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}