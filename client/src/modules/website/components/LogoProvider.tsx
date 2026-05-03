import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAllIconUploads } from "@/Api/utilsApi";

interface LogoMedia {
  mediaId: number;
  type: string;
  url: string;
  fileName: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface IconUpload {
  id: number;
  mediaId: number | null;
  active: boolean | null;
  description: string | null;
  showOnHeader: boolean | null;
  showOnFooter: boolean | null;
  showOnLightOrDark: boolean | null; // true = dark mode, false = light mode
  propertyId: number | null;
  propertyName: string | null;
  propertyTypeId: number | null;
  propertyTypeName: string | null;
  media: LogoMedia | null;
}

interface LogoImage {
  src: string;
  alt: string;
}

interface ResolvedLogos {
  light: LogoImage | null;
  dark: LogoImage | null;
}

interface LogoContextValue {
  getHeaderLogos: (propertyTypeName?: string | null) => ResolvedLogos;
  getFooterLogos: () => ResolvedLogos;
  loaded: boolean;
}

const LogoContext = createContext<LogoContextValue>({
  getHeaderLogos: () => ({ light: null, dark: null }),
  getFooterLogos: () => ({ light: null, dark: null }),
  loaded: false,
});

function pickLogoImage(entry: IconUpload): LogoImage {
  return {
    src: entry.media!.url,
    alt: entry.media!.alt || entry.description || "Kennedia Blu",
  };
}

function resolveLogos(candidates: IconUpload[]): ResolvedLogos {
  const lightEntry = candidates.find((e) => e.showOnLightOrDark === false);
  const darkEntry = candidates.find((e) => e.showOnLightOrDark === true);
  const anyEntry = candidates[0] ?? null;

  return {
    light: lightEntry ? pickLogoImage(lightEntry) : anyEntry ? pickLogoImage(anyEntry) : null,
    dark: darkEntry ? pickLogoImage(darkEntry) : anyEntry ? pickLogoImage(anyEntry) : null,
  };
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [icons, setIcons] = useState<IconUpload[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllIconUploads()
      .then((res: any) => {
        const data: IconUpload[] = Array.isArray(res?.data) ? res.data : [];
        setIcons(data.filter((e) => e.active === true && e.media !== null));
      })
      .catch(() => {/* silently fall back to static logos */})
      .finally(() => setLoaded(true));
  }, []);

  const getHeaderLogos = (propertyTypeName?: string | null): ResolvedLogos => {
    const headerIcons = icons.filter((e) => e.showOnHeader === true);

    if (propertyTypeName) {
      const typeLogos = headerIcons.filter(
        (e) => e.propertyTypeName?.toLowerCase() === propertyTypeName.toLowerCase()
          && e.propertyId === null
      );
      if (typeLogos.length > 0) return resolveLogos(typeLogos);
    }

    // Fall back to homepage/global logos (no propertyType, no property)
    const globalLogos = headerIcons.filter(
      (e) => e.propertyTypeId === null && e.propertyId === null
    );
    if (globalLogos.length > 0) return resolveLogos(globalLogos);

    return { light: null, dark: null };
  };

  const getFooterLogos = (): ResolvedLogos => {
    const footerIcons = icons.filter((e) => e.showOnFooter === true);
    if (footerIcons.length > 0) return resolveLogos(footerIcons);
    return { light: null, dark: null };
  };

  return (
    <LogoContext.Provider value={{ getHeaderLogos, getFooterLogos, loaded }}>
      {children}
    </LogoContext.Provider>
  );
}

export const useLogos = () => useContext(LogoContext);
