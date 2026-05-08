import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCafeSectionsByProperty } from "@/Api/CafeApi";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import CafeBanner from "./cafepage/CafeBanner";
import CafeSubCategories from "./cafepage/CafeSubCategories";
import AboutCafePage from "./cafepage/AboutCafePage";
import CafepageEvents from "./cafepage/CafepageEvents";
import CafeSignatureDrinks from "./cafepage/CafeSignatureDrinks";
import CafeTestimonials from "./cafepage/CafeTestimonials";
import CafeGalleryPage from "./cafepage/CafeGalleryPage";
import CafeReservationForm from "./cafepage/CafeReservationForm";
import { siteContent } from "@/data/siteContent";
import { GetAllPropertyDetails, getGalleryByPropertyId } from "@/Api/Api";
import { useSsrData } from "@/ssr/SsrDataContext";

const CAFE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
  { type: "link", label: "RESERVATION", key: "reservation", href: "#reservation" },
];

export default function CafePage() {
  const { propertySlug, propertyId: paramPropertyId } = useParams();
  const { propertyDetail } = useSsrData();

  const resolvedPropertyId = useMemo(() => {
    const slugTail = propertySlug?.split("-").pop() || "";
    return Number(paramPropertyId || slugTail) || null;
  }, [paramPropertyId, propertySlug]);

  const ssrCafeDetail =
    propertyDetail?.propertyType === "cafe" &&
    propertyDetail?.propertyId === resolvedPropertyId
      ? propertyDetail.pageData
      : null;

  const [storyData, setStoryData] = useState(ssrCafeDetail?.storyData || null);
  const [propertyData, setPropertyData] = useState(ssrCafeDetail?.propertyData || null);
  const [galleryData, setGalleryData] = useState(ssrCafeDetail?.galleryData || []);
  const [loading, setLoading] = useState(!ssrCafeDetail);

  // SSR-seeded section data
  const ssrMenuItems = ssrCafeDetail?.menuItems || null;
  const ssrAboutSections = ssrCafeDetail?.aboutSections || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!resolvedPropertyId) return;
    if (!ssrCafeDetail) {
      fetchStory();
      fetchData();
    }
  }, [resolvedPropertyId]);

  const fetchStory = async () => {
    try {
      const res = await getCafeSectionsByProperty(resolvedPropertyId);
      const data = res?.data?.data || res?.data;
      if (Array.isArray(data) && data.length > 0) {
        setStoryData(data[0]);
      } else if (data && !Array.isArray(data)) {
        setStoryData(data);
      }
    } catch (error) {
      console.error("Failed to fetch cafe story", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setPropertyData(null);
      setGalleryData([]);

      const response = await GetAllPropertyDetails();
      const rawData = response?.data || response;

      const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
        (item) => {
          const parent = item.propertyResponseDTO;
          const listings = item.propertyListingResponseDTOS || [];

          return listings.length === 0
            ? [{ parent, listing: null }]
            : listings.map((listing) => ({ parent, listing }));
        },
      );

      const matched = flattened.find(
        (item) => Number(item.parent.id) === resolvedPropertyId,
      );

      if (!matched) {
        setLoading(false);
        return;
      }

      const { parent, listing } = matched;
      const combinedProperty = {
        ...parent,
        ...listing,
        id: parent.id,
        propertyId: parent.id,
        name: listing?.propertyName?.trim() || parent.propertyName,
        description: listing?.mainHeading || "",
        location: listing?.fullAddress || parent.address,
        city: listing?.city || parent.locationName,
        media:
          listing?.media?.length > 0 ? listing.media : parent.media || [],
        coordinates:
          parent.latitude && parent.longitude
            ? {
              lat: Number(parent.latitude),
              lng: Number(parent.longitude),
            }
            : null,
      };

      const galleryRes = await getGalleryByPropertyId(parent.id);
      const rawGallery =
        galleryRes?.data?.content || galleryRes?.data || galleryRes || [];
      const filteredGallery = (
        Array.isArray(rawGallery) ? rawGallery : []
      ).filter(
        (item) =>
          item?.isActive &&
          item?.media?.url &&
          !item?.vertical &&
          String(item?.categoryName || "").toLowerCase() !== "3d",
      );

      setPropertyData(combinedProperty);
      setGalleryData(filteredGallery);
    } catch (err) {
      console.error("Cafe Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        navItems={CAFE_NAV_ITEMS}
        logo={siteContent.brand.logo_cafe}
        propertyTypeName="Cafe"
        propertyId={resolvedPropertyId}
        showQuickBook={true}
        quickBookOptions={[{ label: "Reserve Cafe", href: "#reservation" }]}
      />

      <main>
        {/* SSR: structured cafe property data for crawlers */}
        <div className="sr-only" aria-hidden="true">
          {propertyData && (
            <div>
              <h1>{propertyData.propertyName || propertyData.name}</h1>
              <p>{propertyData.city || propertyData.locationName}</p>
              {(propertyData.fullAddress || propertyData.address) && (
                <p>{propertyData.fullAddress || propertyData.address}</p>
              )}
              {(propertyData.mainHeading || propertyData.description) && (
                <p>{propertyData.mainHeading || propertyData.description}</p>
              )}
              {(propertyData.media || []).slice(0, 4).map((m, i) => (
                m?.url && <img key={i} src={m.url} alt={m.alt || propertyData.propertyName || ""} />
              ))}
            </div>
          )}
          {galleryData.slice(0, 8).map((g, i) => (
            g?.media?.url && <img key={`g-${i}`} src={g.media.url} alt={g.media.alt || propertyData?.propertyName || ""} />
          ))}
          {storyData && (
            <div>
              {storyData.heading && <h2>{storyData.heading}</h2>}
              {storyData.description && <p>{storyData.description}</p>}
              {storyData.subSections?.map((s, i) => (
                <div key={i}>
                  {s.title && <h3>{s.title}</h3>}
                  {s.description && <p>{s.description}</p>}
                  {s.media?.url && <img src={s.media.url} alt={s.title || ""} />}
                </div>
              ))}
            </div>
          )}
          {(ssrMenuItems || []).length > 0 && (
            <ul>
              {ssrMenuItems.map((item) => (
                <li key={item.id}>
                  <h4>{item.itemName || item.name}</h4>
                  {item.description && <p>{item.description}</p>}
                  {item.price && <span>₹{item.price}</span>}
                  {item.image?.url && <img src={item.image.url} alt={item.itemName || ""} />}
                </li>
              ))}
            </ul>
          )}
          {(ssrAboutSections || []).length > 0 && (
            <div>
              {ssrAboutSections.map((a) => (
                <div key={a.id}>
                  {a.heading && <h2>{a.heading}</h2>}
                  {a.description && <p>{a.description}</p>}
                  {a.media?.url && <img src={a.media.url} alt={a.heading || ""} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="home" className="relative z-20 shadow-sm">
          <CafeBanner
            propertyData={propertyData}
            galleryData={galleryData}
            loading={loading}
          />
        </div>

        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#F8F8F6] to-[#F7F7F5]" />
        </div>

        <div id="menu" className="relative z-10 shadow-sm">
          <CafeSubCategories initialData={storyData} />
          <div className="dark:hidden">
            <div className="h-px bg-[#E3E3DF]" />
            <div className="h-4 bg-linear-to-b from-[#F7F7F5] to-[#EFEFEB]" />
          </div>
          <CafeSignatureDrinks
            propertyId={resolvedPropertyId}
            propertyType={propertyData?.propertyType}
            verticalId={storyData?.id}
          />
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#EFEFEB] to-[#F5F5F3]" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="about" className="relative z-[9] shadow-sm">
          <AboutCafePage propertyId={resolvedPropertyId} />
        </div>

        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-[#ECECE8]" />
        </div>
        <div id="events" className="relative z-[8] shadow-sm">
          <CafepageEvents />
        </div>

        <div className="dark:hidden">
          <div className="h-0 bg-linear-to-b from-[#ECECE8] to-[#F7F7F5]" />
          <div className="h-px bg-[#E5E5E2]" />
        </div>
        <div className="relative z-[7] shadow-sm">
          <CafeTestimonials propertyId={resolvedPropertyId} />
        </div>

        <div className="dark:hidden">
          <div className="h-px bg-[#E5E5E2]" />
          <div className="h-0 bg-linear-to-b from-[#F7F7F5] to-[#F8F8F6]" />
        </div>
        <div id="gallery" className="relative z-[6] shadow-sm">
          <CafeGalleryPage propertyId={resolvedPropertyId} />
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F8F8F6] to-[#EFEFEB]" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="reservation" className="relative z-[5] shadow-sm">
          <CafeReservationForm propertyId={resolvedPropertyId} />
        </div>
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
