"use client";

import { useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { cn } from "@/lib/utils";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarProps {
  value?: Value;
  onChange?: (value: Value) => void;
  minDate?: Date;
  maxDate?: Date;
  selectRange?: boolean;
  className?: string;
}

export default function Calendar({
  value,
  onChange,
  minDate = new Date(),
  maxDate,
  selectRange = false,
  className,
}: CalendarProps) {
  const [internalValue, setInternalValue] = useState<Value>(
    value ?? new Date()
  );

  const handleChange = (val: Value) => {
    setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-3 shadow-sm",
        className
      )}
    >
      <ReactCalendar
        onChange={handleChange}
        value={value ?? internalValue}
        minDate={minDate}
        maxDate={maxDate}
        selectRange={selectRange}
        showNeighboringMonth
        calendarType="iso8601"
      />
    </div>
  );
}
