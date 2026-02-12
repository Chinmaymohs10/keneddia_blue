import { useState } from "react";
import { Room } from "@/data/hotelData";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Users, Check, Maximize2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export default function RoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: RoomListProps) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const currentRooms = rooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleExpand = (id: string) => {
    setExpandedRoom(expandedRoom === id ? null : id);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {currentRooms.map((room) => {
          const isSelected = selectedRoomId === room.id;
          const isAvailable = room.isAvailable === true;

          return (
            <div
              key={room.id}
              className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                isSelected
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:shadow-md"
              }`}
              onClick={() => isAvailable && onSelectRoom(room.id)}
            >
              <div className="flex flex-col md:flex-row cursor-pointer">
                {/* Image Section */}
                <div className="w-full md:w-64 h-48 md:h-auto relative flex-shrink-0">
                  <OptimizedImage
                    {...room.image}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewGallery(room.gallery);
                    }}
                  >
                    <Maximize2 /> View Photos
                  </button>

                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3" /> Selected
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-serif font-semibold text-foreground">
                          {room.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> Max{" "}
                            {room.maxOccupancy} Guests
                          </span>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <Check className="w-3 h-3" /> Free Cancellation
                          </span>
                        </div>
                      </div>

                      {/* Mobile Price */}
                      <div className="md:hidden text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(room.basePrice)}
                        </p>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                      {room.amenities.slice(0, 6).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Description Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(room.id);
                      }}
                      className="text-primary text-xs font-medium flex items-center gap-1 hover:underline relative z-10"
                    >
                      {expandedRoom === room.id
                        ? "Hide Details"
                        : "Room Details"}
                      {expandedRoom === room.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedRoom === room.id && (
                      <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
                        <p>{room.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Action Section */}
                <div
                  className={`p-4 md:p-6 border-t md:border-t-0 md:border-l border-border md:w-60 flex flex-col justify-center items-center md:items-end text-center md:text-right ${
                    isSelected ? "bg-primary/5" : "bg-secondary/5"
                  }`}
                >
                  <div className="hidden md:block mb-4">
                    <p className="text-xs text-muted-foreground line-through">
                      ₹{(room.basePrice * 1.2).toLocaleString()}
                    </p>
                    <p className="text-2xl font-serif font-bold text-primary">
                      {formatPrice(room.basePrice)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      + taxes & fees
                    </p>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoom(room.id);
                    }}
                    disabled={!isAvailable}
                    variant={isSelected ? "default" : "secondary"}
                    className="w-full md:w-auto min-w-[140px]"
                  >
                    {isAvailable
                      ? isSelected
                        ? "Selected"
                        : "Select Room"
                      : "Unavailable"}
                  </Button>

                  {!isAvailable && (
                    <p className="text-[10px] text-red-500 mt-2 font-medium">
                      Sold Out for these dates
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-sm font-medium mx-2">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
