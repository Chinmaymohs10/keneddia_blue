import { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Calendar from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type CalendarValue = Date | null | [Date | null, Date | null];

interface FindYourStayProps {
  initialDate?: [Date | null, Date | null];
  initialGuests?: {
    adults: number;
    children: number;
    rooms: number;
  };
  onChange?: (data: {
    checkIn: Date | null;
    checkOut: Date | null;
    adults: number;
    children: number;
    rooms: number;
  }) => void;
}

export default function FindYourStay({
  initialDate,
  initialGuests,
  onChange,
}: FindYourStayProps) {
  const [date, setDate] = useState<CalendarValue>(
    initialDate || [new Date(), addDays(new Date(), 2)],
  );

  const [guests, setGuests] = useState(
    initialGuests || { adults: 2, children: 0, rooms: 1 },
  );

  const [guestOpen, setGuestOpen] = useState(false);

  const startDate = Array.isArray(date) ? date[0] : date;
  const endDate = Array.isArray(date) ? date[1] : null;

  /* ----------------------------------------
   * Emit data to parent
   * -------------------------------------- */
  const emitChange = () => {
    onChange?.({
      checkIn: startDate ?? null,
      checkOut: endDate ?? null,
      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms,
    });
  };

  useEffect(() => {
    emitChange();
  }, [startDate, endDate, guests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-3 shadow-sm mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        {/* ================= DATE PICKER ================= */}
        <div className="flex-1 grid grid-cols-2 gap-3 bg-secondary/5 rounded-lg p-3">
          {/* Check-in */}
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">
              Check-in
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {startDate ? format(startDate, "EEE, dd MMM") : "Select"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  selectRange
                  value={date}
                  minDate={new Date()}
                  onChange={(val) => setDate(val)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="flex flex-col border-l border-border/10 pl-3">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">
              Check-out
            </span>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="w-4 h-4 text-primary" />
              {endDate ? format(endDate, "EEE, dd MMM") : "Select"}
            </div>
          </div>
        </div>

        {/* ================= GUESTS ================= */}
        <div className="flex-1 bg-secondary/5 rounded-lg p-3">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold mb-1 block">
            Guests & Rooms
          </span>

          <Popover open={guestOpen} onOpenChange={setGuestOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 text-sm font-medium w-full hover:text-primary">
                <Users className="w-4 h-4 text-primary" />
                {guests.rooms} Room · {guests.adults} Adults ·{" "}
                {guests.children} Children
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-serif font-medium">Guests & Rooms</h4>

                {[
                  {
                    label: "Rooms",
                    value: guests.rooms,
                    min: 1,
                    key: "rooms",
                  },
                  {
                    label: "Adults",
                    value: guests.adults,
                    min: 1,
                    key: "adults",
                  },
                  {
                    label: "Children",
                    value: guests.children,
                    min: 0,
                    key: "children",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-8 h-8 rounded-full border flex items-center justify-center"
                        onClick={() =>
                          setGuests((p) => ({
                            ...p,
                            [item.key]: Math.max(item.min, p[item.key] - 1),
                          }))
                        }
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm font-medium">
                        {item.value}
                      </span>
                      <button
                        className="w-8 h-8 rounded-full border flex items-center justify-center"
                        onClick={() =>
                          setGuests((p) => ({
                            ...p,
                            [item.key]: p[item.key] + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <Button className="w-full" onClick={() => setGuestOpen(false)}>
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ================= CTA ================= */}
        <div>
          <Button
            className="w-full lg:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wider"
            onClick={emitChange}
            disabled={!startDate || !endDate}
          >
            Update Stay
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
