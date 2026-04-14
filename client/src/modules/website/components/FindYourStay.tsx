import { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, Users, Loader2 } from "lucide-react";
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
  const fallbackDate: [Date | null, Date | null] = [
    new Date(),
    addDays(new Date(), 2),
  ];
  const [date, setDate] = useState<CalendarValue>(
    initialDate || fallbackDate,
  );

  const [guests, setGuests] = useState(
    initialGuests || { adults: 2, children: 0, rooms: 1 },
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const startDate = Array.isArray(date) ? date[0] : date;
  const endDate = Array.isArray(date) ? date[1] : null;

  useEffect(() => {
    setDate(initialDate || fallbackDate);
  }, [initialDate]);

  useEffect(() => {
    setGuests(initialGuests || { adults: 2, children: 0, rooms: 1 });
  }, [initialGuests]);

  const emitChange = () => {
    onChange?.({
      checkIn: startDate ?? null,
      checkOut: endDate ?? null,
      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms,
    });
  };

  const handleUpdateStay = async () => {
    if (!startDate || !endDate || isApplying) return;

    setIsApplying(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    emitChange();
    setIsApplying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="stay-search-panel"
    >
      <div className="stay-search-row">
        {/* ================= DATE PICKER ================= */}
        <div className="stay-search-group flex-1 grid grid-cols-2 gap-3">
          {/* Check-in */}
          <div className="flex flex-col">
            <span className="stay-search-label">
              Check-in
            </span>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="stay-search-trigger">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {startDate ? format(startDate, "EEE, dd MMM") : "Select"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  selectRange
                  value={date}
                  minDate={new Date()}
                  onChange={(val) => {
                    setDate(val);
                    if (Array.isArray(val) && val[0] && val[1]) {
                      setCalendarOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="flex flex-col border-l border-border/10 pl-3">
            <span className="stay-search-label">
              Check-out
            </span>
            <button
              className="stay-search-trigger"
              onClick={() => setCalendarOpen(true)}
            >
              <CalendarIcon className="w-4 h-4 text-primary" />
              {endDate ? format(endDate, "EEE, dd MMM") : "Select"}
            </button>
          </div>
        </div>

        {/* ================= GUESTS ================= */}
        <div className="stay-search-group flex-1">
          <span className="stay-search-label block">
            Guests & Rooms
          </span>

          <Popover open={guestOpen} onOpenChange={setGuestOpen}>
            <PopoverTrigger asChild>
              <button className="stay-search-trigger w-full">
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
                        className="stay-stepper-btn"
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
                        className="stay-stepper-btn"
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
            className="stay-search-cta"
            onClick={handleUpdateStay}
            disabled={!startDate || !endDate || isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Stay"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
