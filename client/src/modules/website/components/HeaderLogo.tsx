import { siteContent } from "@/data/siteContent";

interface HeaderLogoProps {
  logo?: {
    src: string;
    alt: string;
    priority?: boolean;
  };
  text?: string;
  bgColor?: string;
}

export default function HeaderLogo({ logo, text, bgColor = "bg-background" }: HeaderLogoProps) {
  // Fallback to main brand logo if vertical logo is not provided
  const displayLogo = logo || siteContent.brand.logo.image;
  const displayText = text || siteContent.brand.name;

  return (
    <div className={`w-full border-b border-border ${bgColor} pt-24`}>
      <div className="container mx-auto px-6 py-6 flex flex-col items-center justify-center gap-3">
        <img
          src={displayLogo.src}
          alt={displayLogo.alt}
          className="h-[60px] md:h-[80px] w-auto object-contain"
        />
        <h1 className="text-2xl md:text-3xl font-serif text-foreground text-center">
          {displayText}
        </h1>
      </div>
    </div>
  );
}
