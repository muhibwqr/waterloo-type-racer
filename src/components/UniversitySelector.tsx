import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UNIVERSITIES, type University } from "@/utils/universities";

interface UniversitySelectorProps {
  value?: University | null;
  onValueChange: (value: University | null) => void;
  disabled?: boolean;
}

export function UniversitySelector({ value, onValueChange, disabled }: UniversitySelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? value : "Select university..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search universities..." />
          <CommandList>
            <CommandEmpty>No university found.</CommandEmpty>
            <CommandGroup>
              {UNIVERSITIES.map((university) => (
                <CommandItem
                  key={university}
                  value={university}
                  onSelect={() => {
                    onValueChange(university === value ? null : university);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === university ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {university}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

