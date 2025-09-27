import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, MinusCircle } from 'lucide-react'; // Import PlusCircle and MinusCircle
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Define the structure for the fitting session data
export interface FittingSessionFormData {
  // Patient Info (for display, not direct input on this form)
  patientName: string;
  medicalRecordNumber: string;
  date: Date; // New field for the session date

  // OD (Right Eye)
  od_ucva: string;
  od_cc_bcva: string;
  od_k1: string;
  od_k2: string;
  od_mean_k: string;
  od_kmax: string;
  od_tbut_schirmer: string;
  od_pentacam: string; // Merged field
  od_orbscan: string; // Merged field

  // OS (Left Eye)
  os_ucva: string;
  os_cc_bcva: string;
  os_k1: string;
  os_k2: string;
  os_mean_k: string;
  os_kmax: string;
  os_tbut_schirmer: string;
  os_pentacam: string; // Merged field
  os_orbscan: string; // Merged field

  // Fitting Procedure - OD (Left Column)
  fp_bc_left_base_curve: string[]; // Changed to array
  fp_bc_left_central_fit_1mm: string;
  fp_bc_left_nafl_superior: string;
  fp_bc_left_nafl_inferior: string;
  fp_bc_left_nafl_temporal: string;
  fp_bc_left_nafl_nasal: string;
  fp_bc_left_dia_location_movement: string;
  fp_bc_left_oct: string;
  fp_bc_left_terpasang: string;
  fp_bc_left_over_refraction: string;
  fp_bc_left_vdc: string;
  fp_bc_left_custom: string;
  fp_bc_left_r: string;

  // Fitting Procedure - OS (Right Column)
  fp_bc_right_base_curve: string[]; // Changed to array
  fp_bc_right_central_fit_1mm: string;
  fp_bc_right_nafl_superior: string;
  fp_bc_right_nafl_inferior: string;
  fp_bc_right_nafl_temporal: string;
  fp_bc_right_nafl_nasal: string;
  fp_bc_right_dia_location_movement: string;
  fp_bc_right_oct: string;
  fp_bc_right_terpasang: string;
  fp_bc_right_over_refraction: string;
  fp_bc_right_vdc: string;
  fp_bc_right_custom: string;
  fp_bc_right_r: string;
}

interface FittingSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  initialData?: FittingSessionFormData;
  onSubmit: (data: FittingSessionFormData) => void;
  onCancel: () => void;
}

const FittingSessionForm: React.FC<FittingSessionFormProps> = ({
  patientName,
  medicalRecordNumber,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FittingSessionFormData>(
    initialData || {
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: new Date(),
      od_ucva: '', od_cc_bcva: '', od_k1: '', od_k2: '', od_mean_k: '', od_kmax: '',
      od_tbut_schirmer: '', od_pentacam: '', od_orbscan: '',
      os_ucva: '', os_cc_bcva: '', os_k1: '', os_k2: '', os_mean_k: '', os_kmax: '',
      os_tbut_schirmer: '', os_pentacam: '', os_orbscan: '',
      fp_bc_left_base_curve: [''], // Initialize as array with one empty string
      fp_bc_left_central_fit_1mm: '',
      fp_bc_left_nafl_superior: '', fp_bc_left_nafl_inferior: '', fp_bc_left_nafl_temporal: '', fp_bc_left_nafl_nasal: '',
      fp_bc_left_dia_location_movement: '',
      fp_bc_left_oct: '',
      fp_bc_left_terpasang: '',
      fp_bc_left_over_refraction: '',
      fp_bc_left_vdc: '',
      fp_bc_left_custom: '',
      fp_bc_left_r: '',
      fp_bc_right_base_curve: [''], // Initialize as array with one empty string
      fp_bc_right_central_fit_1mm: '', fp_bc_right_nafl_superior: '', fp_bc_right_nafl_inferior: '',
      fp_bc_right_nafl_temporal: '', fp_bc_right_nafl_nasal: '',
      fp_bc_right_dia_location_movement: '', fp_bc_right_oct: '',
      fp_bc_right_terpasang: '', fp_bc_right_over_refraction: '',
      fp_bc_right_vdc: '', fp_bc_right_custom: '', fp_bc_right_r: '',
    }
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: initialData?.date || new Date(),
      ...initialData,
      // Ensure base curve fields are arrays, converting if necessary
      fp_bc_left_base_curve: Array.isArray(initialData?.fp_bc_left_base_curve)
        ? initialData.fp_bc_left_base_curve
        : (initialData?.fp_bc_left_base_curve ? [initialData.fp_bc_left_base_curve] : ['']),
      fp_bc_right_base_curve: Array.isArray(initialData?.fp_bc_right_base_curve)
        ? initialData.fp_bc_right_base_curve
        : (initialData?.fp_bc_right_base_curve ? [initialData.fp_bc_right_base_curve] : ['']),
    }));
  }, [patientName, medicalRecordNumber, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBaseCurveChange = (eye: 'left' | 'right', index: number, value: string) => {
    setFormData((prev) => {
      const key = `fp_bc_${eye}_base_curve` as keyof FittingSessionFormData;
      const updatedBaseCurves = [...(prev[key] as string[])];
      updatedBaseCurves[index] = value;
      return { ...prev, [key]: updatedBaseCurves };
    });
  };

  const handleAddBaseCurve = (eye: 'left' | 'right') => {
    setFormData((prev) => {
      const key = `fp_bc_${eye}_base_curve` as keyof FittingSessionFormData;
      const updatedBaseCurves = [...(prev[key] as string[]), ''];
      return { ...prev, [key]: updatedBaseCurves };
    });
  };

  const handleRemoveBaseCurve = (eye: 'left' | 'right', index: number) => {
    setFormData((prev) => {
      const key = `fp_bc_${eye}_base_curve` as keyof FittingSessionFormData;
      const updatedBaseCurves = (prev[key] as string[]).filter((_, i) => i !== index);
      // Ensure there's always at least one input field
      return { ...prev, [key]: updatedBaseCurves.length > 0 ? updatedBaseCurves : [''] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ROSE K2 XL FITTING WORKSHEET</CardTitle>
          <p className="text-sm text-muted-foreground">Patient: {patientName} (MRN: {medicalRecordNumber})</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Session */}
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
              <div>
                <Label htmlFor="od_k1">K1</Label>
                <Input id="od_k1" value={formData.od_k1} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_k2">K2</Label>
                <Input id="od_k2" value={formData.od_k2} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_mean_k">MEAN K</Label>
                <Input id="od_mean_k" value={formData.od_mean_k} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_kmax">KMAX</Label>
                <Input id="od_kmax" value={formData.od_kmax} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_tbut_schirmer">TBUT/SCHIRMER</Label>
                <Input id="od_tbut_schirmer" value={formData.od_tbut_schirmer} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="od_pentacam">PENTACAM (Elevation map / CCT)</Label>
                <Input id="od_pentacam" value={formData.od_pentacam} onChange={handleChange} placeholder="e.g., Elevation: X, CCT: Y" />
              </div>
              <div>
                <Label htmlFor="od_orbscan">ORBSCAN (Elevation map / CCT)</Label>
                <Input id="od_orbscan" value={formData.od_orbscan} onChange={handleChange} placeholder="e.g., Elevation: X, CCT: Y" />
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
              <div>
                <Label htmlFor="os_k1">K1</Label>
                <Input id="os_k1" value={formData.os_k1} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_k2">K2</Label>
                <Input id="os_k2" value={formData.os_k2} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_mean_k">MEAN K</Label>
                <Input id="os_mean_k" value={formData.os_mean_k} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_kmax">KMAX</Label>
                <Input id="os_kmax" value={formData.os_kmax} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_tbut_schirmer">TBUT/SCHIRMER</Label>
                <Input id="os_tbut_schirmer" value={formData.os_tbut_schirmer} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="os_pentacam">PENTACAM (Elevation map / CCT)</Label>
                <Input id="os_pentacam" value={formData.os_pentacam} onChange={handleChange} placeholder="e.g., Elevation: X, CCT: Y" />
              </div>
              <div>
                <Label htmlFor="os_orbscan">ORBSCAN (Elevation map / CCT)</Label>
                <Input id="os_orbscan" value={formData.os_orbscan} onChange={handleChange} placeholder="e.g., Elevation: X, CCT: Y" />
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
          {/* Fitting Procedure - Left Column (OD) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">OD</h3>
            <div className="space-y-3">
              <div>
                <Label>BASE CURVE</Label>
                {formData.fp_bc_left_base_curve.map((bc, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      id={`fp_bc_left_base_curve_${index}`}
                      value={bc}
                      onChange={(e) => handleBaseCurveChange('left', index, e.target.value)}
                      placeholder="e.g., 6.9 / 7.0"
                    />
                    {formData.fp_bc_left_base_curve.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveBaseCurve('left', index)}
                      >
                        <MinusCircle className="h-4 w-4" />
                        <span className="sr-only">Remove Base Curve</span>
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddBaseCurve('left')} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add another Base Curve
                </Button>
              </div>
              <div>
                <Label htmlFor="fp_bc_left_central_fit_1mm">CENTRAL FIT</Label>
                <Input id="fp_bc_left_central_fit_1mm" value={formData.fp_bc_left_central_fit_1mm} onChange={handleChange} />
              </div>
              <h4 className="font-medium mt-4">EDGE LIFT (NaFL)</h4>
              <div>
                <Label htmlFor="fp_bc_left_nafl_superior">Superior</Label>
                <Input id="fp_bc_left_nafl_superior" value={formData.fp_bc_left_nafl_superior} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_nafl_inferior">Inferior</Label>
                <Input id="fp_bc_left_nafl_inferior" value={formData.fp_bc_left_nafl_inferior} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_nafl_temporal">Temporal</Label>
                <Input id="fp_bc_left_nafl_temporal" value={formData.fp_bc_left_nafl_temporal} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_nafl_nasal">Nasal</Label>
                <Input id="fp_bc_left_nafl_nasal" value={formData.fp_bc_left_nafl_nasal} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_dia_location_movement">DIA/LOCATION/MOVEMENT</Label>
                <Textarea id="fp_bc_left_dia_location_movement" value={formData.fp_bc_left_dia_location_movement} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_oct">OCT</Label>
                <Input id="fp_bc_left_oct" value={formData.fp_bc_left_oct} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_terpasang">TERPASANG</Label>
                <Input id="fp_bc_left_terpasang" value={formData.fp_bc_left_terpasang} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_over_refraction">OVER REFRACTION</Label>
                <Input id="fp_bc_left_over_refraction" value={formData.fp_bc_left_over_refraction} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_vdc">VDC</Label>
                <Input id="fp_bc_left_vdc" value={formData.fp_bc_left_vdc} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_custom">CUSTOM</Label>
                <Input id="fp_bc_left_custom" value={formData.fp_bc_left_custom} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_left_r">R/</Label>
                <Input id="fp_bc_left_r" value={formData.fp_bc_left_r} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Fitting Procedure - Right Column (OS) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">OS</h3>
            <div className="space-y-3">
              <div>
                <Label>BASE CURVE</Label>
                {formData.fp_bc_right_base_curve.map((bc, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      id={`fp_bc_right_base_curve_${index}`}
                      value={bc}
                      onChange={(e) => handleBaseCurveChange('right', index, e.target.value)}
                      placeholder="e.g., 6.9 / 7.0"
                    />
                    {formData.fp_bc_right_base_curve.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveBaseCurve('right', index)}
                      >
                        <MinusCircle className="h-4 w-4" />
                        <span className="sr-only">Remove Base Curve</span>
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddBaseCurve('right')} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add another Base Curve
                </Button>
              </div>
              <div>
                <Label htmlFor="fp_bc_right_central_fit_1mm">CENTRAL FIT</Label>
                <Input id="fp_bc_right_central_fit_1mm" value={formData.fp_bc_right_central_fit_1mm} onChange={handleChange} />
              </div>
              <h4 className="font-medium mt-4">EDGE LIFT (NaFL)</h4>
              <div>
                <Label htmlFor="fp_bc_right_nafl_superior">Superior</Label>
                <Input id="fp_bc_right_nafl_superior" value={formData.fp_bc_right_nafl_superior} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_nafl_inferior">Inferior</Label>
                <Input id="fp_bc_right_nafl_inferior" value={formData.fp_bc_right_nafl_inferior} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_nafl_temporal">Temporal</Label>
                <Input id="fp_bc_right_nafl_temporal" value={formData.fp_bc_right_nafl_temporal} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_nafl_nasal">Nasal</Label>
                <Input id="fp_bc_right_nafl_nasal" value={formData.fp_bc_right_nafl_nasal} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_dia_location_movement">DIA/LOCATION/MOVEMENT</Label>
                <Textarea id="fp_bc_right_dia_location_movement" value={formData.fp_bc_right_dia_location_movement} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_oct">OCT</Label>
                <Input id="fp_bc_right_oct" value={formData.fp_bc_right_oct} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_terpasang">TERPASANG</Label>
                <Input id="fp_bc_right_terpasang" value={formData.fp_bc_right_terpasang} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_over_refraction">OVER REFRACTION</Label>
                <Input id="fp_bc_right_over_refraction" value={formData.fp_bc_right_over_refraction} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_vdc">VDC</Label>
                <Input id="fp_bc_right_vdc" value={formData.fp_bc_right_vdc} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_custom">CUSTOM</Label>
                <Input id="fp_bc_right_custom" value={formData.fp_bc_right_custom} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="fp_bc_right_r">R/</Label>
                <Input id="fp_bc_right_r" value={formData.fp_bc_right_r} onChange={handleChange} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Fitting Session</Button>
      </div>
    </form>
  );
};

export default FittingSessionForm;