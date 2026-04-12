import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createJoiningUs } from "@/Api/RestaurantApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const EMPTY_FORM = {
  guestName: "",
  contactNumber: "",
  emailAddress: "",
  date: "",
  time: "",
  totalGuest: "2",
};

export default function RestaurantReserveDialog({
  open,
  onOpenChange,
  property,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      Boolean(
        property?.id &&
          formData.guestName.trim() &&
          formData.contactNumber.trim() &&
          formData.emailAddress.trim() &&
          formData.date &&
          formData.time &&
          formData.totalGuest,
      ),
    [formData, property?.id],
  );

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setFormData(EMPTY_FORM);
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !property?.id) return;

    setIsSubmitting(true);
    try {
      await createJoiningUs({
        guestName: formData.guestName.trim(),
        contactNumber: formData.contactNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        date: formData.date,
        time: formData.time,
        totalGuest: Number(formData.totalGuest),
        propertyId: property.id,
        propertyName: property.propertyName,
        phoneNumber: formData.contactNumber.trim(),
        name: formData.guestName.trim(),
      });

      toast.success("Reservation request sent.");
      handleClose(false);
    } catch (error) {
      console.error("Failed to submit restaurant reservation", error);
      toast.error("Failed to send reservation request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Reserve a Table
          </DialogTitle>
          <DialogDescription>
            {property?.propertyName
              ? `Submit your dine-in request for ${property.propertyName}.`
              : "Submit your dine-in reservation request."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reserve-name">Name</Label>
              <Input
                id="reserve-name"
                value={formData.guestName}
                onChange={(e) => setField("guestName", e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserve-number">Number</Label>
              <Input
                id="reserve-number"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setField("contactNumber", e.target.value)}
                placeholder="Phone number"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reserve-email">Email</Label>
              <Input
                id="reserve-email"
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setField("emailAddress", e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserve-date">Date</Label>
              <Input
                id="reserve-date"
                type="date"
                value={formData.date}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserve-time">Time</Label>
              <Input
                id="reserve-time"
                type="time"
                value={formData.time}
                onChange={(e) => setField("time", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reserve-guests">Number of People</Label>
              <Input
                id="reserve-guests"
                type="number"
                min="1"
                value={formData.totalGuest}
                onChange={(e) => setField("totalGuest", e.target.value)}
                placeholder="2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Reserve"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
