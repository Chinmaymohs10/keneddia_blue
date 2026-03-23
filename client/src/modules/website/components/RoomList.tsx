import { useState } from "react";
import { Room } from "@/data/hotelData";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Expand,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  policyHighlightText?: string;
}

export default function RoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  policyHighlightText = "Free Cancellation",
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

  const toggleRoomSelection = (roomId: string) => {
    onSelectRoom(selectedRoomId === roomId ? null : roomId);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRoomSize = (room: Room) => {
    if (!room.roomSize) return null;

    const unitMap: Record<string, string> = {
      SQ_FT: "sq ft",
      SQ_M: "sq m",
    };

    return `${room.roomSize} ${unitMap[room.roomSizeUnit || ""] || room.roomSizeUnit || ""}`.trim();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {currentRooms.map((room) => {
          const isSelected = selectedRoomId === room.id;
          const isAvailable = room.isAvailable === true;
          const highlightedAmenity = room.highlightedAmenities?.[0];
          const roomSizeText = formatRoomSize(room);

          return (
            <div
              key={room.id}
              className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                isSelected
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:shadow-md"
              }`}
              onClick={() => isAvailable && toggleRoomSelection(room.id)}
            >
              <div className="flex flex-col md:flex-row cursor-pointer">
                <div className="w-full md:w-[280px] h-56 md:h-auto relative flex-shrink-0">
                  <OptimizedImage
                    {...room.image}
                    className="w-full h-full object-cover"
                  />

                  {/* <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    <span className="inline-flex items-center gap-1">
                      <Expand className="h-3.5 w-3.5" />
                      View Photos
                    </span>
                  </div> */}

                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3" /> Selected
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-between md:border-r border-border">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-serif font-semibold text-foreground">
                          {room.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {roomSizeText && (
                            <span className="flex items-center gap-1">
                              <Expand className="h-3.5 w-3.5" />
                              {roomSizeText}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Max {room.maxOccupancy} Guests
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

                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-green-600">
                      <Check className="h-4 w-4" />
                      <span>{policyHighlightText}</span>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-700">
                        {room.type || "Room Only"}
                      </span>
                      {highlightedAmenity && (
                        <span className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                          {highlightedAmenity}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                      {room.amenities.slice(0, 6).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <div className="h-1 w-1 rounded-full bg-red-500" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>

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
                  className={`p-4 md:p-6 border-t md:border-t-0 border-border md:w-[240px] flex flex-col justify-center items-center md:items-end text-center md:text-right ${
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
                    <p className="text-xs font-medium text-green-600">
                      Per Night
                    </p>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRoomSelection(room.id);
                    }}
                    disabled={!isAvailable}
                    variant={isSelected ? "default" : "secondary"}
                    className="w-full md:w-auto min-w-[140px]"
                  >
                    {isAvailable
                      ? isSelected
                        ? "Selected"
                        : "Book Now"
                      : "Unavailable"}
                  </Button>

                  {!isAvailable && (
                    <p className="text-[10px] text-red-500 mt-2 font-medium">
                      Not Available
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
