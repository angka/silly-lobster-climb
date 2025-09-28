import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Import Input for new fields

export interface FollowUpSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  notes: string;
  // New fields for OD
  od_bcva: string;
  od_wfdt: string;
  od_tno_stereoskopi: string;
  od_bagolini_test: string;
  // New fields for OS
  os_bcva: string;
  os_wfdt: string;
  os_tno_stereoskopi: string;
  os_bagolini_test: string;
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
  // State for new OD fields
  const [od_bcva, setOd_bcva] = useState(initialData?.od_bcva || '');
  const [od_wfdt, setOd_wfdt] = useState(initialData?.od_wfdt || '');
  const [od_tno_stereoskopi, setOd_tno_stereoskopi] = useState(initialData?.od_tno_stereoskopi || '');
  const [od_bagolini_test, setOd_bagolini_test] = useState(initialData?.od_bagolini_test || '');
  // State for new OS fields
  const [os_bcva, setOs_bcva] = useState(initialData?.os_bcva || '');
  const [os_wfdt, setOs_wfdt] = useState(initialData?.os_wfdt || '');
  const [os_tno_stereoskopi, setOs_tno_stereoskopi] = useState(initialData?.os_tno_stereoskopi || '');
  const [os_bagolini_test, setOs_bagolini_test] = useState(initialData?.os_bagolini_test || '');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setNotes(initialData.notes);
      setOd_bcva(initialData.od_bcva);
      setOd_wfdt(initialData.od_wfdt);
      setOd_tno_stereoskopi(initialData.od_tno_stereoskopi);
      setOd_bagolini_test(initialData.od_bagolini_test);
      setOs_bcva(initialData.os_bcva);
      setOs_wfdt(initialData.os_wfdt);
      setOs_tno_stereoskopi(initialData.os_tno_stereoskopi);
      setOs_bagolini_test(initialData.os_bagolini_test);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patientName,
      medicalRecordNumber,
      date,
      notes,
      od_bcva,
      od_wfdt,
      od_tno_stereoskopi,
      od_bagolini_test,
      os_bcva,
      os_wfdt,
      os_tno_stereoskopi,
      os_bagolini_test,
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

      {/* OD (Right Eye) Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">OD (Right Eye)</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="od_bcva">BCVA</Label>
              <Input id="od_bcva" value={od_bcva} onChange={(e) => setOd_bcva(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="od_wfdt">WFDT</Label>
              <Input id="od_wfdt" value={od_wfdt} onChange={(e) => setOd_wfdt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="od_tno_stereoskopi">TNO Stereoskopi</Label>
              <Input id="od_tno_stereoskopi" value={od_tno_stereoskopi} onChange={(e) => setOd_tno_stereoskopi(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="od_bagolini_test">Bagolini Test</Label>
              <Input id="od_bagolini_test" value={od_bagolini_test} onChange={(e) => setOd_bagolini_test(e.target.value)} />
            </div>
          </div>
        </div>

        {/* OS (Left Eye) Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">OS (Left Eye)</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="os_bcva">BCVA</Label>
              <Input id="os_bcva" value={os_bcva} onChange={(e) => setOs_bcva(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="os_wfdt">WFDT</Label>
              <Input id="os_wfdt" value={os_wfdt} onChange={(e) => setOs_wfdt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="os_tno_stereoskopi">TNO Stereoskopi</Label>
              <Input id="os_tno_stereoskopi" value={os_tno_stereoskopi} onChange={(e) => setOs_tno_stereoskopi(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="os_bagolini_test">Bagolini Test</Label>
              <Input id="os_bagolini_test" value={os_bagolini_test} onChange={(e) => setOs_bagolini_test(e.target.value)} />
            </div>
          </div>
        </div>
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