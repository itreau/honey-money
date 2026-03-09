import { Input, InputProps } from "@/components/ui/input";
import { forwardRef } from "react";

type CurrencyInputProps = Omit<InputProps, "onChange" | "value"> & {
  value: number | string;
  onChange: (value: number) => void;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/[^\d.]/g, "");
      onChange(Number(raw));
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          $
        </span>

        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          className={`pl-7 ${className ?? ""}`}
          {...props}
        />
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
