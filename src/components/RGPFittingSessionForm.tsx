import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import FittingProcedurePanel from './FittingProcedurePanel';
import { SingleFittingProcedureData } from './SingleFittingProcedureForm';

export interface RGPFittingSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  diagnosis?: string;
  nextFollowUpDate?: Date;

  od_ucva: string;
  od_cc: string;
  od_bcva: string;
  od_k1_radius: string;
  od_k1_power: string;
  od_k1_angle: string;
  od_k2_radius: string;
  od_k2_power: string;
  od_k2_angle: string;
  od_tbut_schirmer: string;

  os_ucva: string;
  os_cc: string;
  os_bcva: string;
  os_k1_radius: string;
  os_k1_power: string;
  os_k1_angle: string;
  os_k2_radius: string;
  os_k2_power: string;
  os_k2_angle: string;
  os_tbut_schirmer: string;

  wfdt: string;
  stereoscopy: string;

  odProcedures: SingleFittingProcedureData[];
  osProcedures: SingleFittingProcedureData[];
}

interface RGPFittingSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  dateOfBirth?: Date;
  diagnosis?: string;
  initialData?: RGPFittingSessionFormData;
  onSubmit: (data: RGPFittingSessionFormData) => void;
  onCancel: () => void;
}

const calculateAge = (dob?: Date): number | null => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const RGPFittingSessionForm: React.FC<RGPFittingSessionFormProps> = ({
  patientName,
  medicalRecordNumber,
  dateOfBirth,
  diagnosis,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<RGPFittingSessionFormData>(
    initialData || {
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: new Date(),
      diagnosis: diagnosis,
      nextFollowUpDate: undefined,
      od_ucva: '', od_cc: '', od_bcva: '', od_k1_radius: '', od_k1_power: '', od_k1_angle: '', od_k2_radius: '', od_k2_power: '', od_k2_angle: '', od_tbut_schirmer: '',
      os_ucva: '', os_cc: '', os_bcva: '', os_k1_radius: '', os_k1_power: '', os_k1_angle: '', os_k2_radius: '', os_k2_power: '', os_k2_angle: '', os_tbut_schirmer: '',
      wfdt: '',
      stereoscopy: '',
      odProcedures: [],
      osProcedures: [],
    }
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      diagnosis: diagnosis,
      nextFollowUpDate: initialData?.nextFollowUpDate ? new Date(initialData.nextFollowUpDate) : undefined,
      ...initialData,
      odProcedures: initialData?.odProcedures || [],
      osProcedures: initialData?.osProcedures || [],
    }));
  }, [patientName, medicalRecordNumber, initialData, diagnosis]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateODProcedures = (updatedProcedures: SingleFittingProcedureData[]) => {
    setFormData(prev => ({ ...prev, odProcedures: updatedProcedures }));
  };

  const handleUpdateOSProcedures = (updatedProcedures: SingleFittingProcedureData[]) => {
    setFormData(prev => ({ ...prev, osProcedures: updatedProcedures }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const patientAge = calculateAge(dateOfBirth);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 md:p-4">
      <Card className="border-none shadow-none">
        <CardHeader className="p-2">
          <CardTitle className="text-xl md:text-3xl font-bold">RGP FITTING WORKSHEET</CardTitle>
          <div className="text-sm md:text-lg text-foreground">
            <span className="font-semibold">{patientName}</span>
            {patientAge !== null && <span className="ml-2 text-muted-foreground">({patientAge} years old)</span>}
          </div>
          <CardDescription className="text-xs md:text-base">
            MRN: {medicalRecordNumber}
            {diagnosis && <span className="ml-4">Diagnosis: {diagnosis}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-4 print-grid-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date of Session</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full h-8 justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.date} onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextFollowUpDate">Next Follow-up</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full h-8 justify-start text-left font-normal", !formData.nextFollowUpDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.nextFollowUpDate ? format(formData.nextFollowUpDate, "PPP") : <span>Schedule next visit</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.nextFollowUpDate} onSelect={(date) => setFormData(prev => ({ ...prev, nextFollowUpDate: date }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="border p-2 rounded-md">
            <h3 className="text-sm font-bold mb-2 border-b">OD (Right Eye)</h3>
            <div className="grid grid-cols-3 gap-1">
              <div><Label className="text-[10px]">UCVA</Label><Input className="h-7 text-xs" id="od_ucva" value={formData.od_ucva} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">CC</Label><Input className="h-7 text-xs" id="od_cc" value={formData.od_cc} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">BCVA</Label><Input className="h-7 text-xs" id="od_bcva" value={formData.od_bcva} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <div><Label className="text-[10px]">K1 (mm)</Label><Input className="h-7 text-xs" id="od_k1_radius" value={formData.od_k1_radius} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K1 (D)</Label><Input className="h-7 text-xs" id="od_k1_power" value={formData.od_k1_power} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K1 (Ax)</Label><Input className="h-7 text-xs" id="od_k1_angle" value={formData.od_k1_angle} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <div><Label className="text-[10px]">K2 (mm)</Label><Input className="h-7 text-xs" id="od_k2_radius" value={formData.od_k2_radius} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K2 (D)</Label><Input className="h-7 text-xs" id="od_k2_power" value={formData.od_k2_power} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K2 (Ax)</Label><Input className="h-7 text-xs" id="od_k2_angle" value={formData.od_k2_angle} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-1 mt-1">
              <div><Label className="text-[10px]">TBUT</Label><Input className="h-7 text-xs" id="od_tbut_schirmer" value={formData.od_tbut_schirmer} onChange={handleChange} /></div>
            </div>
          </div>

          <div className="border p-2 rounded-md">
            <h3 className="text-sm font-bold mb-2 border-b">OS (Left Eye)</h3>
            <div className="grid grid-cols-3 gap-1">
              <div><Label className="text-[10px]">UCVA</Label><Input className="h-7 text-xs" id="os_ucva" value={formData.os_ucva} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">CC</Label><Input className="h-7 text-xs" id="os_cc" value={formData.os_cc} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">BCVA</Label><Input className="h-7 text-xs" id="os_bcva" value={formData.os_bcva} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <div><Label className="text-[10px]">K1 (mm)</Label><Input className="h-7 text-xs" id="os_k1_radius" value={formData.os_k1_radius} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K1 (D)</Label><Input className="h-7 text-xs" id="os_k1_power" value={formData.os_k1_power} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K1 (Ax)</Label><Input className="h-7 text-xs" id="os_k1_angle" value={formData.os_k1_angle} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <div><Label className="text-[10px]">K2 (mm)</Label><Input className="h-7 text-xs" id="os_k2_radius" value={formData.os_k2_radius} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K2 (D)</Label><Input className="h-7 text-xs" id="os_k2_power" value={formData.os_k2_power} onChange={handleChange} /></div>
              <div><Label className="text-[10px]">K2 (Ax)</Label><Input className="h-7 text-xs" id="os_k2_angle" value={formData.os_k2_angle} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-1 mt-1">
              <div><Label className="text-[10px]">TBUT</Label><Input className="h-7 text-xs" id="os_tbut_schirmer" value={formData.os_tbut_schirmer} onChange={handleChange} /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardContent className="p-2 grid grid-cols-2 gap-4 print-grid-2">
          <div className="space-y-1">
            <Label htmlFor="wfdt" className="text-sm font-bold">WFDT</Label>
            <Input id="wfdt" value={formData.wfdt} onChange={handleChange} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="stereoscopy" className="text-sm font-bold">Stereo</Label>
            <Input id="stereoscopy" value={formData.stereoscopy} onChange={handleChange} className="h-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader className="p-2"><CardTitle className="text-lg">FITTING PROCEDURE</CardTitle></CardHeader>
        <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-4 print-grid-2">
          <FittingProcedurePanel eye="OD" procedures={formData.odProcedures} onUpdateProcedures={handleUpdateODProcedures} k1Radius={formData.od_k1_radius} k2Radius={formData.od_k2_radius} />
          <FittingProcedurePanel eye="OS" procedures={formData.osProcedures} onUpdateProcedures={handleUpdateOSProcedures} k1Radius={formData.os_k1_radius} k2Radius={formData.os_k2_radius} />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 mt-4 print:hidden">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save RGP Session</Button>
      </div>
    </form>
  );
};

export default RGPFittingSessionForm;