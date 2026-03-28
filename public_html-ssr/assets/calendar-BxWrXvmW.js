import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { k as cn } from "../entry-server.js";
import ReactCalendar from "react-calendar";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
function Calendar({
  value,
  onChange,
  minDate = /* @__PURE__ */ new Date(),
  maxDate,
  selectRange = false,
  className
}) {
  const [internalValue, setInternalValue] = useState(
    value ?? /* @__PURE__ */ new Date()
  );
  const handleChange = (val) => {
    setInternalValue(val);
    onChange?.(val);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "rounded-xl border bg-background p-3 shadow-sm",
        className
      ),
      children: /* @__PURE__ */ jsx(
        ReactCalendar,
        {
          onChange: handleChange,
          value: value ?? internalValue,
          minDate,
          maxDate,
          selectRange,
          showNeighboringMonth: true,
          calendarType: "iso8601"
        }
      )
    }
  );
}
export {
  Calendar as C,
  Popover as P,
  PopoverTrigger as a,
  PopoverContent as b
};
