import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import FittingProcedurePanel from './FittingProcedurePanel';
import { SingleFittingProcedureData } from './SingleFittingProcedureForm';

// Define the structure for RGP fitting session data
export interface RGPFittingSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  diagnosis?: string;

  // OD (Right Eye)
  od_ucva: string;
  od_cc_bcva: string;
  od_k1_radius: string; // New field for K1 Radius
  od_k1_power: string;  // New field for K1 Power
  od_k1_angle: string;  // New field for K1 Angle
  od_k2_radius: string; // New field for K2 Radius
  od_k2_power: string;  // New field for K2 Power
  od_k2_angle: string;  // New field for K2 Angle
  od_tbut_schirmer: string;
  od_wfdt: string;
  od_stereoscopy: string;

  // OS (Left Eye)
  os_ucva: string;
  os_cc_bcva: string;
  os_k1_radius: string; // New field for K1 Radius
  os_k1_power: string;  // New field for K1 Power
  os_k1_angle: string;  // New field for K1 Angle
  os_k2_radius: string; // New field for K2 Radius
  os_k2_power: string;  // New field for K2 Power
  os_k2_angle: string;  // New field for K2 Angle
  os_tbut_schirmer: string;
  os_wfdt: string;
  os_stereoscopy: string;

  // Fitting Procedures
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

// Helper function to calculate age
const calculateAge = (dob?: Date): number | null => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
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
      // RGP fields
      od_ucva: '', od_cc_bcva: '',
      od_k1_radius: '', od_k1_power: '', od_k1_angle: '',
      od_k2_radius: '', od_k2_power: '', od_k2_angle: '',
      od_tbut_schirmer: '', od_wfdt: '', od_stereoscopy: '',
      os_ucva: '', os_cc_bcva: '',
      os_k1_radius: '', os_k1_power: '', os_k1_angle: '',
      os_k2_radius: '', os_k2_power: '', os_k2_angle: '',
      os_tbut_schirmer: '', os_wfdt: '', os_stereoscopy: '',
      odProcedures: [],
      osProcedures: [],
    }
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: initialData?.date || new Date(),
      diagnosis: diagnosis,
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
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">RGP FITTING WORKSHEET</CardTitle>
          <div className="text-lg text-foreground">
            <span className="font-semibold">{patientName}</span>
            {patientAge !== null && <span className="ml-2 text-muted-foreground">({patientAge} years old)</span>}
          </div>
          <CardDescription className="text-base">
            Medical Record Number: {medicalRecordNumber}
            {diagnosis && <span className="ml-4">Diagnosis: {diagnosis}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="date">Date of Session</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* OD (Right Eye) Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">OD (Right Eye)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="od_ucva">UCVA</Label>
                <Input id="od_ucva" value={formData.od_ucva} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_cc_bcva">CC & BCVA</Label>
                <Input id="od_cc_bcva" value={formData.od_cc_bcva} onChange={handleChange} />
              </div>
              {/* K1 Fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="od_k1_radius">K1 (Radius)</Label>
                  <Input id="od_k1_radius" value={formData.od_k1_radius} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="od_k1_power">K1 (Power)</Label>
                  <Input id="od_k1_power" value={formData.od_k1_power} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="od_k1_angle">K1 (Angle)</Label>
                  <Input id="od_k1_angle" value={formData.od_k1_angle} onChange={handleChange} />
                </div>
              </div>
              {/* K2 Fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="od_k2_radius">K2 (Radius)</Label>
                  <Input id="od_k2_radius" value={formData.od_k2_radius} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="od_k2_power">K2 (Power)</Label>
                  <Input id="od_k2_power" value={formData.od_k2_power} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="od_k2_angle">K2 (Angle)</Label>
                  <Input id="od_k2_angle" value={formData.od_k2_angle} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="od_tbut_schirmer">TBUT/SCHIRMER</Label>
                <Input id="od_tbut_schirmer" value={formData.od_tbut_schirmer} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_wfdt">WFDT</Label>
                <Input id="od_wfdt" value={formData.od_wfdt} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_stereoscopy">Stereoscopy</Label>
                <Input id="od_stereoscopy" value={formData.od_stereoscopy} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* OS (Left Eye) Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">OS (Left Eye)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="os_ucva">UCVA</Label>
                <Input id="os_ucva" value={formData.os_ucva} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_cc_bcva">CC & BCVA</Label>
                <Input id="os_cc_bcva" value={formData.os_cc_bcva} onChange={handleChange} />
              </div>
              {/* K1 Fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="os_k1_radius">K1 (Radius)</Label>
                  <Input id="os_k1_radius" value={formData.os_k1_radius} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="os_k1_power">K1 (Power)</Label>
                  <Input id="os_k1_power" value={formData.os_k1_power} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="os_k1_angle">K1 (Angle)</Label>
                  <Input id="os_k1_angle" value={formData.os_k1_angle} onChange={handleChange} />
                </div>
              </div>
              {/* K2 Fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="os_k2_radius">K2 (Radius)</Label>
                  <Input id="os_k2_radius" value={formData.os_k2_radius} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="os_k2_power">K2 (Power)</Label>
                  <Input id="os_k2_power" value={formData.os_k2_power} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="os_k2_angle">K2 (Angle)</Label>
                  <Input id="os_k2_angle" value={formData.os_k2_angle} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="os_tbut_schirmer">TBUT/SCHIRMER</Label>
                <Input id="os_tbut_schirmer" value={formData.os_tbut_schirmer} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_wfdt">WFDT</Label>
                <Input id="os_wfdt" value={formData.os_wfdt} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_stereoscopy">Stereoscopy</Label>
                <Input id="os_stereoscopy" value={formData.os_stereoscopy} onChange={handleChange} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">FITTING PROCEDURE</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FittingProcedurePanel
            eye="OD"
            procedures={formData.odProcedures}
            onUpdateProcedures={handleUpdateODProcedures}
            k1Radius={formData.od_k1_radius}
            k2Radius={formData.od_k2_radius}
          />
          <FittingProcedurePanel
            eye="OS"
            procedures={formData.osProcedures}
            onUpdateProcedures={handleUpdateOSProcedures}
            k1Radius={formData.os_k1_radius}
            k2Radius={formData.os_k2_radius}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save RGP Session</Button>
      </div>
    </form>
  );
};

export default RGPFittingSessionForm;