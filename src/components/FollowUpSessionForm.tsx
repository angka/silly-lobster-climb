import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export interface FollowUpSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  notes: string;
  // Add any other specific fields for follow-up sessions here
}

interface FollowUpSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  initialData?: FollowUpSessionFormData;
  onSubmit: (data: FollowUpSessionFormData) => void;
  onCancel: () => void;
}

const FollowUpSessionForm: React.FC<FollowUpSessionFormProps> = ({
  patientName,
  medicalRecordNumber,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setNotes(initialData.notes);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patientName,
      medicalRecordNumber,
      date,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="text-lg font-semibold">
        Follow-up for: <span className="font-bold">{patientName}</span> (MRN: {medicalRecordNumber})
      </div>
      <div>
        <Label htmlFor="date">Date of Session</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => setDate(selectedDate || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter follow-up notes here..."
          rows={6}
        />
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Follow-up Session</Button>
      </div>
    </form>
  );
};

export default FollowUpSessionForm;