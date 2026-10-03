import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const relativeRanges = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: yesterday };
      }
    },
    {
      label: 'Last 7 Days',
      getValue: () => {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        return { from, to: new Date() };
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const from = new Date();
        from.setDate(from.getDate() - 30);
        return { from, to: new Date() };
      }
    },
    {
      label: 'Last 90 Days',
      getValue: () => {
        const from = new Date();
        from.setDate(from.getDate() - 90);
        return { from, to: new Date() };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0);
        return { from, to };
      }
    },
    {
      label: 'This Quarter',
      getValue: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const from = new Date(now.getFullYear(), quarter * 3, 1);
        return { from, to: now };
      }
    },
    {
      label: 'Last Quarter',
      getValue: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const from = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        const to = new Date(now.getFullYear(), quarter * 3, 0);
        return { from, to };
      }
    },
    {
      label: 'This Year',
      getValue: () => {
        const now = new Date();
        return { from: new Date(now.getFullYear(), 0, 1), to: now };
      }
    },
    {
      label: 'Last Year',
      getValue: () => {
        const now = new Date();
        const from = new Date(now.getFullYear() - 1, 0, 1);
        const to = new Date(now.getFullYear() - 1, 11, 31);
        return { from, to };
      }
    }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from && value.to ? (
            `${format(value.from, 'MMM dd, yyyy')} - ${format(value.to, 'MMM dd, yyyy')}`
          ) : (
            'Select date range'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[calc(100%-2rem)] md:max-w-none" align="start">
        <div className="flex flex-col md:flex-row">
          <div className="border-b md:border-b-0 md:border-r p-4 space-y-2">
            <p className="text-sm font-medium mb-2">Quick Ranges</p>
            {relativeRanges.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange(range.getValue());
                  setIsOpen(false);
                }}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="p-4">
            <Calendar
              mode="range"
              selected={{ from: value.from, to: value.to }}
              onSelect={(range: any) => {
                if (range?.from && range?.to) {
                  onChange({ from: range.from, to: range.to });
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
              className="hidden md:block"
            />
            <Calendar
              mode="range"
              selected={{ from: value.from, to: value.to }}
              onSelect={(range: any) => {
                if (range?.from && range?.to) {
                  onChange({ from: range.from, to: range.to });
                  setIsOpen(false);
                }
              }}
              numberOfMonths={1}
              className="md:hidden"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
