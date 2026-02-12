import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ChevronRight, MapPin, ArrowLeft, ChevronLeft, ChevronRight as ChevronRightIcon, Grid3x3, List } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import RoomCard from "@/modules/website/components/RoomCard";
import PricingBreakdown from "@/modules/website/components/PricingBreakdown";
import TrustSection from "@/modules/website/components/TrustSection";
import { getHotelById, getRoomById } from "@/data/hotelData";
import { siteContent } from "@/data/siteContent";

const ROOMS_PER_PAGE = 6;

export default function RoomSelection() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const hotel = hotelId ? getHotelById(hotelId) : null;
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4">Hotel Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The hotel you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/hotels")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Hotels
          </button>
        </div>
      </div>
    );
  }

  const selectedRoom =
    selectedRoomId && hotelId ? getRoomById(hotelId, selectedRoomId) : null;

  // Pagination logic
  const totalRooms = hotel.roomTypes.length;
  const totalPages = Math.ceil(totalRooms / ROOMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const endIndex = startIndex + ROOMS_PER_PAGE;
  const currentRooms = hotel.roomTypes.slice(startIndex, endIndex);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    // Scroll to pricing breakdown on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("pricing-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleProceedToCheckout = () => {
    alert(
      `Proceeding to checkout for ${selectedRoom?.name} at ${hotel.name}. This is a demo - checkout functionality not implemented.`
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar logo={siteContent.brand.logo_hotel} />

      {/* Breadcrumb */}
      <div className="bg-secondary/5 border-b border-border mt-20 md:mt-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 py-3">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Link
              to="/"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 md:w-4 h-3.5 md:h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
            <Link
              to="/hotels"
              className="hover:text-foreground transition-colors"
            >
              Hotels
            </Link>
            <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
            <Link
              to={`/hotels/${hotel.id}`}
              className="hover:text-foreground transition-colors truncate max-w-[100px] md:max-w-none"
            >
              {hotel.name}
            </Link>
            <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
            <span className="text-foreground font-medium">Rooms</span>
          </div>
        </div>
      </div>

      {/* Compact Header Section */}
      <section className="bg-gradient-to-br from-secondary/10 via-background to-background py-4 md:py-6 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex-1">
              <button
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 md:mb-3 group"
              >
                <ArrowLeft className="w-3.5 md:w-4 h-3.5 md:h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Hotel
              </button>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-1.5">
                Select Your Room
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" />
                <span className="text-xs md:text-sm truncate">
                  {hotel.name} • {hotel.location}
                </span>
              </div>
            </div>

            {/* Right Side - Stats & View Toggle */}
            <div className="flex items-center gap-3">
              <div className="bg-card border border-border rounded-lg px-3 md:px-4 py-2 md:py-3">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Available
                </p>
                <p className="text-xl md:text-2xl font-serif font-bold text-primary">
                  {hotel.roomTypes.filter((room) => room.available).length}
                </p>
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 md:gap-8">
          {/* Left Column - Room Listing */}
          <div className="space-y-4 md:space-y-6">
            {/* Filters/Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {totalRooms} Room{totalRooms !== 1 ? 's' : ''} Available
                </span>
              </div>
              <div className="md:hidden flex items-center gap-0.5 bg-secondary/20 border border-border rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                    }`}
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                    }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rooms Grid/List */}
            {hotel.roomTypes.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
                <p className="text-muted-foreground">
                  No rooms available at this property.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'
                      : 'space-y-4 md:space-y-6'
                  }
                >
                  {currentRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isSelected={selectedRoomId === room.id}
                      onSelect={handleRoomSelect}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${currentPage === page
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'border border-border hover:bg-secondary text-foreground'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Pricing Breakdown (Sticky) */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4" id="pricing-section">
            {selectedRoom ? (
              <>
                <PricingBreakdown
                  basePrice={selectedRoom.basePrice}
                  nights={1}
                  onProceed={handleProceedToCheckout}
                />
                <TrustSection />
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6 md:p-8 text-center"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Home className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base md:text-lg font-serif font-semibold text-foreground mb-2">
                    Select a Room
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Choose a room to see the pricing breakdown and proceed to checkout.
                  </p>
                </motion.div>
                <TrustSection />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}