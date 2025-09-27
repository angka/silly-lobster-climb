import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Define the structure for RGP fitting session data
export interface RGPFittingSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  notes: string;
  // Add more RGP specific fields here later
  od_k_reading: string;
  os_k_reading: string;
  od_hvid: string;
  os_hvid: string;
  od_h_visible_iris_diameter: string;
  os_h_visible_iris_diameter: string;
  od_refraction: string;
  os_refraction: string;
  od_lens_parameters: string;
  os_lens_parameters: string;
  od_fitting_assessment: string;
  os_fitting_assessment: string;
}

interface RGPFittingSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  dateOfBirth?: Date; // Added dateOfBirth prop
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
  dateOfBirth, // Destructure dateOfBirth
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<RGPFittingSessionFormData>(
    initialData || {
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: new Date(),
      notes: '',
      od_k_reading: '',
      os_k_reading: '',
      od_hvid: '',
      os_hvid: '',
      od_h_visible_iris_diameter: '',
      os_h_visible_iris_diameter: '',
      od_refraction: '',
      os_refraction: '',
      od_lens_parameters: '',
      os_lens_parameters: '',
      od_fitting_assessment: '',
      os_fitting_assessment: '',
    }
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: initialData?.date || new Date(),
      ...initialData,
    }));
  }, [patientName, medicalRecordNumber, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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
          <CardDescription className="text-base">Medical Record Number: {medicalRecordNumber}</CardDescription>
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
                <Label htmlFor="od_k_reading">K Reading</Label>
                <Input id="od_k_reading" value={formData.od_k_reading} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_hvid">HVID</Label>
                <Input id="od_hvid" value={formData.od_hvid} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_h_visible_iris_diameter">H Visible Iris Diameter</Label>
                <Input id="od_h_visible_iris_diameter" value={formData.od_h_visible_iris_diameter} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_refraction">Refraction</Label>
                <Input id="od_refraction" value={formData.od_refraction} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_lens_parameters">Lens Parameters</Label>
                <Textarea id="od_lens_parameters" value={formData.od_lens_parameters} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_fitting_assessment">Fitting Assessment</Label>
                <Textarea id="od_fitting_assessment" value={formData.od_fitting_assessment} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* OS (Left Eye) Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">OS (Left Eye)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="os_k_reading">K Reading</Label>
                <Input id="os_k_reading" value={formData.os_k_reading} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_hvid">HVID</Label>
                <Input id="os_hvid" value={formData.os_hvid} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_h_visible_iris_diameter">H Visible Iris Diameter</Label>
                <Input id="os_h_visible_iris_diameter" value={formData.os_h_visible_iris_diameter} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_refraction">Refraction</Label>
                <Input id="os_refraction" value={formData.os_refraction} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_lens_parameters">Lens Parameters</Label>
                <Textarea id="os_lens_parameters" value={formData.os_lens_parameters} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_fitting_assessment">Fitting Assessment</Label>
                <Textarea id="os_fitting_assessment" value={formData.os_fitting_assessment} onChange={handleChange} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="notes">General Notes</Label>
        <Textarea id="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes for this RGP session..." />
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save RGP Session</Button>
      </div>
    </form>
  );
};

export default RGPFittingSessionForm;