import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RGPFittingSessionFormData } from './RGPFittingSessionForm';

interface PreviousSession {
  id: string;
  patientId: string;
  type: 'Fitting' | 'Follow-up';
  lensType?: 'ROSE_K2_XL' | 'RGP';
  date: Date;
  data: RGPFittingSessionFormData;
}

export interface FollowUpSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  notes: string;
  lensType?: 'ROSE_K2_XL' | 'RGP';
  nextFollowUpDate?: Date;
  od_bcva: string;
  od_wfdt: string;
  od_tno_stereoskopi: string;
  od_bagolini_test: string;
  os_bcva: string;
  os_wfdt: string;
  os_tno_stereoskopi: string;
  os_bagolini_test: string;
}

interface FollowUpSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  lensType?: 'ROSE_K2_XL' | 'RGP';
  initialData?: FollowUpSessionFormData;
  onSubmit: (data: FollowUpSessionFormData) => void;
  onCancel: () => void;
  previousRGPFittingSessions?: PreviousSession[];
}

const FollowUpSessionForm: React.FC<FollowUpSessionFormProps> = ({
  patientName,
  medicalRecordNumber,
  lensType,
  initialData,
  onSubmit,
  onCancel,
  previousRGPFittingSessions = [],
}) => {
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>(
    initialData?.nextFollowUpDate ? new Date(initialData.nextFollowUpDate) : undefined
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [od_bcva, setOd_bcva] = useState(initialData?.od_bcva || '');
  const [od_wfdt, setOd_wfdt] = useState(initialData?.od_wfdt || '');
  const [od_tno_stereoskopi, setOd_tno_stereoskopi] = useState(initialData?.od_tno_stereoskopi || '');
  const [od_bagolini_test, setOd_bagolini_test] = useState(initialData?.od_bagolini_test || '');
  const [os_bcva, setOs_bcva] = useState(initialData?.os_bcva || '');
  const [os_wfdt, setOs_wfdt] = useState(initialData?.os_wfdt || '');
  const [os_tno_stereoskopi, setOs_tno_stereoskopi] = useState(initialData?.os_tno_stereoskopi || '');
  const [os_bagolini_test, setOs_bagolini_test] = useState(initialData?.os_bagolini_test || '');

  const [selectedPreviousSessionId, setSelectedPreviousSessionId] = useState<string>('');
  const [displayedPreviousSessionData, setDisplayedPreviousSessionData] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.date));
      setNextFollowUpDate(initialData.nextFollowUpDate ? new Date(initialData.nextFollowUpDate) : undefined);
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

  useEffect(() => {
    if (selectedPreviousSessionId && previousRGPFittingSessions.length > 0) {
      const selectedSession = previousRGPFittingSessions.find(s => s.id === selectedPreviousSessionId);
      if (selectedSession) {
        const rgpData = selectedSession.data;
        setDisplayedPreviousSessionData({
          ccBcvaOD: rgpData.od_cc_bcva,
          ccBcvaOS: rgpData.os_cc_bcva,
        });
      }
    }
  }, [selectedPreviousSessionId, previousRGPFittingSessions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patientName, medicalRecordNumber, date, notes, lensType, nextFollowUpDate,
      od_bcva, od_wfdt, od_tno_stereoskopi, od_bagolini_test,
      os_bcva, os_wfdt, os_tno_stereoskopi, os_bagolini_test,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 md:p-4">
      <div className="text-lg md:text-2xl font-bold border-b pb-2">
        FOLLOW-UP SESSION: <span className="text-primary">{patientName}</span>
        <div className="text-xs md:text-sm text-muted-foreground font-normal mt-1">
          MRN: {medicalRecordNumber} | Lens: {lensType || 'N/A'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-grid-2">
        <div className="space-y-1">
          <Label htmlFor="date" className="text-[10px]">Date of Session</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full h-8 justify-start text-left font-normal text-xs", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-3 w-3" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => setDate(d || new Date())} initialFocus /></PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label htmlFor="nextFollowUpDate" className="text-[10px]">Next Follow-up Schedule</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full h-8 justify-start text-left font-normal text-xs", !nextFollowUpDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-3 w-3" />
                {nextFollowUpDate ? format(nextFollowUpDate, "PPP") : <span>Schedule next visit</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextFollowUpDate} onSelect={(d) => setNextFollowUpDate(d)} initialFocus /></PopoverContent>
          </Popover>
        </div>
      </div>

      {lensType === 'RGP' && previousRGPFittingSessions.length > 0 && (
        <div className="border p-2 rounded-md bg-secondary/10 space-y-2 print:hidden">
          <Label className="text-[10px]">Select Previous Fitting Session</Label>
          <Select value={selectedPreviousSessionId} onValueChange={setSelectedPreviousSessionId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choose a previous RGP session" /></SelectTrigger>
            <SelectContent>{previousRGPFittingSessions.map(s => <SelectItem key={s.id} value={s.id}>{format(s.date, 'PPP')}</SelectItem>)}</SelectContent>
          </Select>
          {displayedPreviousSessionData && (
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><Label className="text-[9px]">Prev CC/BCVA (OD)</Label><Input value={displayedPreviousSessionData.ccBcvaOD} readOnly className="h-7 text-xs" /></div>
              <div><Label className="text-[9px]">Prev CC/BCVA (OS)</Label><Input value={displayedPreviousSessionData.ccBcvaOS} readOnly className="h-7 text-xs" /></div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-grid-2">
        <div className="space-y-2 border p-2 rounded-md">
          <h3 className="font-bold text-sm border-b pb-1 mb-2">OD (Right Eye)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px]">BCVA</Label><Input className="h-7 text-xs" value={od_bcva} onChange={(e) => setOd_bcva(e.target.value)} /></div>
            <div><Label className="text-[10px]">WFDT</Label><Input className="h-7 text-xs" value={od_wfdt} onChange={(e) => setOd_wfdt(e.target.value)} /></div>
            <div><Label className="text-[10px]">TNO Stereo</Label><Input className="h-7 text-xs" value={od_tno_stereoskopi} onChange={(e) => setOd_tno_stereoskopi(e.target.value)} /></div>
            <div><Label className="text-[10px]">Bagolini</Label><Input className="h-7 text-xs" value={od_bagolini_test} onChange={(e) => setOd_bagolini_test(e.target.value)} /></div>
          </div>
        </div>
        <div className="space-y-2 border p-2 rounded-md">
          <h3 className="font-bold text-sm border-b pb-1 mb-2">OS (Left Eye)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px]">BCVA</Label><Input className="h-7 text-xs" value={os_bcva} onChange={(e) => setOs_bcva(e.target.value)} /></div>
            <div><Label className="text-[10px]">WFDT</Label><Input className="h-7 text-xs" value={os_wfdt} onChange={(e) => setOs_wfdt(e.target.value)} /></div>
            <div><Label className="text-[10px]">TNO Stereo</Label><Input className="h-7 text-xs" value={os_tno_stereoskopi} onChange={(e) => setOs_tno_stereoskopi(e.target.value)} /></div>
            <div><Label className="text-[10px]">Bagolini</Label><Input className="h-7 text-xs" value={os_bagolini_test} onChange={(e) => setOs_bagolini_test(e.target.value)} /></div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Clinical Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="text-xs min-h-[60px]" />
      </div>

      <div className="flex justify-end space-x-2 mt-6 print:hidden">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Follow-up Session</Button>
      </div>
    </form>
  );
};

export default FollowUpSessionForm;