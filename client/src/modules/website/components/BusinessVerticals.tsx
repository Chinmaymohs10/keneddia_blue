import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2,
  Coffee,
  Wine,
  Music,
  Briefcase,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getKennediaGroup } from "@/Api/Api";

const IconMap: Record<string, any> = {
  HOTEL: Building2,
  CAFE: Coffee,
  BAR: Wine,
  EVENT: Briefcase,
  MUSIC: Music,
  RESTAURANT: UtensilsCrossed,
  Hotel: Building2,
  Restaurant: UtensilsCrossed,
  Cafe: Coffee,
  Bar: Wine,
  Event: Briefcase,
  Music: Music,
};

const truncateDescription = (text: string, maxWords: number = 6): string => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

const isValidDivision = (div: any): boolean => {
  return !!(div.title?.trim() && (div.icon?.trim() || div.icons?.url));
};

export default function BusinessVerticals() {
  const [isMobile, setIsMobile] = useState(false);
  const [groupData, setGroupData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getKennediaGroup();
        const validData = res?.divisions ? res : res?.data;

        if (validData && Array.isArray(validData.divisions)) {
          const cleaned = {
            ...validData,
            divisions: validData.divisions.filter(isValidDivision).slice(0, 5),
          };
          setGroupData(cleaned);
        } else {
          setGroupData(null);
        }
      } catch (error) {
        console.error("Kennedia Group fetch failed:", error);
        setGroupData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (loading) return null;
  if (!groupData) return null;

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
          <MobileTimeline
            verticals={groupData.divisions}
            logoIcon={groupData.icon}
            logoText={groupData.logoText}
            logoSubText={groupData.logoSubText}
          />
        ) : (
          <DesktopTree
            divisions={groupData.divisions}
            logoText={groupData.logoText}
            logoSubText={groupData.logoSubText}
            logoIcon={groupData.icon}
          />
        )}
      </div>
    </section>
  );
}

function DesktopTree({ divisions, logoText, logoSubText, logoIcon }: any) {
  const safeDivisions = Array.isArray(divisions) ? [...divisions] : [];
  const sortedDivisions = safeDivisions
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 5);

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[500px] flex flex-col items-center justify-center py-10">
      {/* Center Logo */}
      <div className="relative z-20 mb-16">
        <div className="bg-card shadow-xl border border-primary/20 flex items-center justify-center relative z-20 px-6 py-4 rounded-xl">
          {logoIcon?.url ? (
            <img
              src={logoIcon.url}
              alt={logoIcon.alt || logoText || "Group Logo"}
              className="max-h-20 w-auto object-contain"
            />
          ) : (
            <div className="text-center px-2">
              <h2 className="text-2xl font-serif font-bold text-foreground leading-none">
                {logoText}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-primary mt-1 font-bold">
                {logoSubText}
              </p>
            </div>
          )}
        </div>

        {/* Connector line from logo to horizontal bar */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 h-16 w-[1px] bg-primary/20" />
      </div>

      {/* Horizontal connector bar */}
      <div className="relative w-4/5 h-[1px] bg-primary/20 mb-8" />

      {/* Branch nodes */}
      <div className="flex justify-between items-start w-full px-4 relative -mt-8">
        {sortedDivisions.map((v: any, i: number) => (
          <BranchNode key={v.id} item={v} index={i} />
        ))}
      </div>
    </div>
  );
}

function BranchNode({ item, index }: any) {
  const hasLink = !!item.ctaLink?.trim();
  const iconImageUrl = item.icons?.url;

  const cardContent = iconImageUrl ? (
    <div className="mb-3 flex items-center justify-center">
      <img
        src={iconImageUrl}
        alt={item.title}
        className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition"
      />
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center text-center group relative flex-1"
    >
      {/* Vertical connector from bar to card */}
      <div className="h-8 w-[1px] bg-primary/20 mb-4" />

      {hasLink ? (
        <Link to={item.ctaLink}>{cardContent}</Link>
      ) : (
        <div className="cursor-default">{cardContent}</div>
      )}

      <h3
        className={`text-sm font-bold ${hasLink ? "group-hover:text-primary transition-colors" : ""}`}
      >
        {item.title}
      </h3>
      <p className="text-xs text-muted-foreground/70 max-w-[120px] line-clamp-2">
        {truncateDescription(item.description, 6)}
      </p>

      {hasLink && (
        <span className="text-[10px] text-primary/60 mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Visit <ArrowRight className="w-2.5 h-2.5" />
        </span>
      )}
    </motion.div>
  );
}

function MobileTimeline({ verticals, logoIcon, logoText, logoSubText }: any) {
  const safeVerticals = Array.isArray(verticals) ? verticals.slice(0, 5) : [];

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Logo at top of mobile timeline */}
      <div className="bg-card shadow-xl border border-primary/20 px-4 py-3 rounded-xl flex items-center justify-center">
        {logoIcon?.url ? (
          <img
            src={logoIcon.url}
            alt={logoIcon.alt || logoText || "Group Logo"}
            className="max-h-12 w-auto object-contain"
          />
        ) : (
          <div className="text-center px-2">
            <h2 className="text-2xl font-serif font-bold text-foreground leading-none">
              {logoText}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-primary mt-1 font-bold">
              {logoSubText}
            </p>
          </div>
        )}
      </div>

      {/* Dashed vertical connector */}
      <div className="w-[1px] h-6 border-l border-dashed border-primary/30" />

      {/* Division cards */}
      <div className="relative pl-6 border-l border-dashed border-primary/20 space-y-8 w-full">
        {safeVerticals.map((v: any) => {
          const Icon = IconMap[v.icon] || Building2;
          const hasLink = !!v.ctaLink?.trim();
          const iconImageUrl = v.icons?.url;

          const cardContent = (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                {iconImageUrl && (
                  <img
                    src={iconImageUrl}
                    alt={v.title}
                    className="h-6 w-auto object-contain opacity-90"
                  />
                )}
              </div>
              <h3 className="text-base font-bold">{v.title}</h3>
              {hasLink && (
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              )}
            </div>
          );

          return hasLink ? (
            <Link
              key={v.id}
              to={v.ctaLink}
              className="block bg-card p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all"
            >
              {cardContent}
            </Link>
          ) : (
            <div
              key={v.id}
              className="block bg-card p-4 rounded-xl border border-border"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
