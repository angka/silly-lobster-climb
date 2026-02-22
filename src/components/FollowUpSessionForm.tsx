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
  nextFollowUpDate?: Date; // New field
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
  // Ensure dates are Date objects even if passed as strings from JSON
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
        const lastOdProcedure = rgpData.odProcedures.length > 0 ? rgpData.odProcedures[rgpData.odProcedures.length - 1] : null;
        setDisplayedPreviousSessionData({
          ccBcvaOD: rgpData.od_cc_bcva,
          ccBcvaOS: rgpData.os_cc_bcva,
          overRefractionOD: lastOdProcedure?.over_refraction || 'N/A',
          bcvaOD: lastOdProcedure?.va || 'N/A',
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="text-lg font-semibold">
        Follow-up for: <span className="font-bold">{patientName}</span> (MRN: {medicalRecordNumber})
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date of Session</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => setDate(d || new Date())} initialFocus /></PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="nextFollowUpDate">Next Follow-up Schedule</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !nextFollowUpDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {nextFollowUpDate ? format(nextFollowUpDate, "PPP") : <span>Schedule next visit</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextFollowUpDate} onSelect={(d) => setNextFollowUpDate(d)} initialFocus /></PopoverContent>
          </Popover>
        </div>
      </div>

      {lensType === 'RGP' && previousRGPFittingSessions.length > 0 && (
        <div className="border p-4 rounded-md bg-secondary/20 space-y-3">
          <Label>Select Previous Fitting Session</Label>
          <Select value={selectedPreviousSessionId} onValueChange={setSelectedPreviousSessionId}>
            <SelectTrigger><SelectValue placeholder="Choose a previous RGP session" /></SelectTrigger>
            <SelectContent>{previousRGPFittingSessions.map(s => <SelectItem key={s.id} value={s.id}>{format(s.date, 'PPP')}</SelectItem>)}</SelectContent>
          </Select>
          {displayedPreviousSessionData && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><Label>Prev CC/BCVA (OD)</Label><Input value={displayedPreviousSessionData.ccBcvaOD} readOnly className="h-8" /></div>
              <div><Label>Prev CC/BCVA (OS)</Label><Input value={displayedPreviousSessionData.ccBcvaOS} readOnly className="h-8" /></div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold">OD (Right Eye)</h3>
          <div><Label>BCVA</Label><Input value={od_bcva} onChange={(e) => setOd_bcva(e.target.value)} /></div>
          <div><Label>WFDT</Label><Input value={od_wfdt} onChange={(e) => setOd_wfdt(e.target.value)} /></div>
          <div><Label>TNO Stereoskopi</Label><Input value={od_tno_stereoskopi} onChange={(e) => setOd_tno_stereoskopi(e.target.value)} /></div>
          <div><Label>Bagolini Test</Label><Input value={od_bagolini_test} onChange={(e) => setOd_bagolini_test(e.target.value)} /></div>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">OS (Left Eye)</h3>
          <div><Label>BCVA</Label><Input value={os_bcva} onChange={(e) => setOs_bcva(e.target.value)} /></div>
          <div><Label>WFDT</Label><Input value={os_wfdt} onChange={(e) => setOs_wfdt(e.target.value)} /></div>
          <div><Label>TNO Stereoskopi</Label><Input value={os_tno_stereoskopi} onChange={(e) => setOs_tno_stereoskopi(e.target.value)} /></div>
          <div><Label>Bagolini Test</Label><Input value={os_bagolini_test} onChange={(e) => setOs_bagolini_test(e.target.value)} /></div>
        </div>
      </div>

      <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Follow-up Session</Button>
      </div>
    </form>
  );
};

export default FollowUpSessionForm;