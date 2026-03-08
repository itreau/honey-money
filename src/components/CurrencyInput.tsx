import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

type CurrencyInputProps = {
  value: number | string;
  onChange: (value: number) => void;
  className?: string;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className }, ref) => {
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
          value={value}
          onChange={handleChange}
          className={`pl-7 ${className ?? ""}`}
        />
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
