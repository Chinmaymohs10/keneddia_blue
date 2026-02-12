import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface Room {
  id: string;
  name: string;
  basePrice?: number;
  price?: number;
  [key: string]: any;
}

interface Hotel {
  name: string;
  price: string;
  [key: string]: any;
}

interface MobileBookingBarProps {
  hotel: Hotel;
  selectedRoom: Room | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  numberOfNights: number;
  onSelectRoom: () => void;
}

export default function MobileBookingBar({
  hotel,
  selectedRoom,
  checkInDate,
  checkOutDate,
  numberOfNights,
  onSelectRoom,
}: MobileBookingBarProps) {
  const formatPrice = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoomPrice = (room: Room | null): number => {
    if (!room) return 0;
    const price = room.basePrice ?? room.price ?? 0;
    return typeof price === "number" ? price : 0;
  };

  const calculateTotalPrice = (room: Room | null): number => {
    if (!room) return 0;
    const roomPrice = getRoomPrice(room);
    return roomPrice * numberOfNights;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Date & Price Info */}
          <div className="flex-1 min-w-0">
            {checkInDate && checkOutDate && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <Calendar className="w-3 h-3" />
                <span className="truncate">
                  {format(checkInDate, "dd MMM")} - {format(checkOutDate, "dd MMM")} • {numberOfNights}N
                </span>
              </div>
            )}
            
            {selectedRoom ? (
              <div>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedRoom.name}
                </p>
                <p className="font-bold text-primary text-lg">
                  {formatPrice(calculateTotalPrice(selectedRoom))}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">Starting from</p>
                <p className="font-bold text-muted-foreground/60 text-lg">
                  {hotel.price}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={onSelectRoom}
            className="font-bold uppercase tracking-wider text-xs px-6"
            variant={selectedRoom ? "default" : "secondary"}
          >
            {selectedRoom ? "Book Now" : "Select Room"}
          </Button>
        </div>
      </div>
    </div>
  );
}