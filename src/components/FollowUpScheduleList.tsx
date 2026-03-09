import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

interface FollowUpScheduleListProps {
  schedules: Date[];
  onChange: (schedules: Date[]) => void;
}

const FollowUpScheduleList: React.FC<FollowUpScheduleListProps> = ({ schedules, onChange }) => {
  const addSchedule = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    onChange([...schedules, nextWeek]);
  };

  const removeSchedule = (index: number) => {
    onChange(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, date: Date | undefined) => {
    if (!date) return;
    const newSchedules = [...schedules];
    newSchedules[index] = date;
    onChange(newSchedules);
  };

  return (
    <div className="space-y-2 border p-3 rounded-md bg-muted/10">
      <div className="flex items-center justify-between mb-1">
        <Label className="text-sm font-bold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" /> Follow-up Schedules
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addSchedule} className="h-7 px-2">
          <Plus className="h-3 w-3 mr-1" /> Add Schedule
        </Button>
      </div>
      {schedules.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">No follow-up dates scheduled yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {schedules.map((date, index) => (
            <div key={index} className="flex items-center gap-2 bg-background p-1 rounded border">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className={cn(
                      "flex-1 h-8 justify-start text-left font-normal text-xs px-2",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">{date ? format(date, "PPP") : "Pick a date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => updateSchedule(index, d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeSchedule(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUpScheduleList;