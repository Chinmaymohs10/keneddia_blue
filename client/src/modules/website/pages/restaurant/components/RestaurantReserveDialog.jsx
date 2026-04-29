import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createJoiningUs } from "@/Api/RestaurantApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateReserveDialogForm } from "@/lib/validation/reservationValidation";
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
  const [errors, setErrors] = useState({});

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setFormData(EMPTY_FORM);
      setErrors({});
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!property?.id) return;
    const errs = validateReserveDialogForm(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

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
      <DialogContent className="w-[calc(100%-1rem)] max-w-[560px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl sm:text-2xl">
            Reserve a Table
          </DialogTitle>
          <DialogDescription className="text-sm">
            {property?.propertyName
              ? `Submit your dine-in request for ${property.propertyName}.`
              : "Submit your dine-in reservation request."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Required fields note */}
          <p className="text-[11px] text-muted-foreground">
            Fields marked <span className="text-red-500 font-semibold">*</span> are required.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reserve-name">
                Name <span className="text-red-500">*</span>
                <span className="ml-1 text-[10px] text-muted-foreground font-normal">(letters only)</span>
              </Label>
              <Input
                id="reserve-name"
                value={formData.guestName}
                onChange={(e) => setField("guestName", e.target.value)}
                placeholder="Full Name"
                className={errors.guestName ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {errors.guestName && <p className="text-xs text-red-500">{errors.guestName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reserve-number">
                Phone Number <span className="text-red-500">*</span>
                <span className="ml-1 text-[10px] text-muted-foreground font-normal">(10 digits)</span>
              </Label>
              <Input
                id="reserve-number"
                type="tel"
                maxLength={10}
                value={formData.contactNumber}
                onChange={(e) => setField("contactNumber", e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile number"
                className={errors.contactNumber ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {errors.contactNumber && <p className="text-xs text-red-500">{errors.contactNumber}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="reserve-email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reserve-email"
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setField("emailAddress", e.target.value)}
                placeholder="name@example.com"
                className={errors.emailAddress ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {errors.emailAddress && <p className="text-xs text-red-500">{errors.emailAddress}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reserve-date">
                Date <span className="text-red-500">*</span>
                <span className="ml-1 text-[10px] text-muted-foreground font-normal">(today or future)</span>
              </Label>
              <Input
                id="reserve-date"
                type="date"
                value={formData.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setField("date", e.target.value)}
                className={errors.date ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reserve-time">
                Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reserve-time"
                type="time"
                value={formData.time}
                onChange={(e) => setField("time", e.target.value)}
                className={errors.time ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="reserve-guests">
                Number of Guests <span className="text-red-500">*</span>
                <span className="ml-1 text-[10px] text-muted-foreground font-normal">(min 1)</span>
              </Label>
              <Input
                id="reserve-guests"
                type="number"
                min="1"
                max="500"
                value={formData.totalGuest}
                onChange={(e) => setField("totalGuest", e.target.value)}
                placeholder="2"
                className={errors.totalGuest ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {errors.totalGuest && <p className="text-xs text-red-500">{errors.totalGuest}</p>}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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
