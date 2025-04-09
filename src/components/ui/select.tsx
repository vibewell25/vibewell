import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

// Context to manage select state
const SelectContext = createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

export function Select({
  children,
  value,
  onValueChange,
  defaultValue,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  
  // Use controlled or uncontrolled state
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, setOpen, value } = useContext(SelectContext);

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
        className
      )}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useContext(SelectContext);
  
  return (
    <span className={cn("truncate", !value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useContext(SelectContext);

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50" 
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-md",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function SelectItem({ children, value, className }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center py-1.5 px-3 text-sm outline-none",
        "hover:bg-gray-100",
        isSelected && "bg-gray-100 font-medium",
        className
      )}
      onClick={() => onValueChange(value)}
    >
      <span className="flex-grow">{children}</span>
      {isSelected && (
        <CheckIcon className="h-4 w-4 text-indigo-600" />
      )}
    </div>
  );
} 