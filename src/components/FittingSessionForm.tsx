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
import RoseK2XLFittingProcedurePanel from './RoseK2XLFittingProcedurePanel';
import { SingleRoseK2XLFittingProcedureData } from './SingleRoseK2XLFittingProcedureForm';

export interface FittingSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  diagnosis?: string;
  nextFollowUpDate?: Date; // New field

  od_ucva: string;
  od_cc_bcva: string;
  od_k1: string;
  od_k2: string;
  od_mean_k_radius: string;
  od_mean_k_power: string;
  od_kmax: string;
  od_tbut_schirmer: string;
  od_pentacam: string;
  od_orbscan: string;

  os_ucva: string;
  os_cc_bcva: string;
  os_k1: string;
  os_k2: string;
  os_mean_k_radius: string;
  os_mean_k_power: string;
  os_kmax: string;
  os_tbut_schirmer: string;
  os_pentacam: string;
  os_orbscan: string;

  odProcedures: SingleRoseK2XLFittingProcedureData[];
  osProcedures: SingleRoseK2XLFittingProcedureData[];
}

interface FittingSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  dateOfBirth?: Date;
  diagnosis?: string;
  initialData?: FittingSessionFormData;
  onSubmit: (data: FittingSessionFormData) => void;
  onCancel: () => void;
}

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

interface TrialLensRecommendations {
  keratoconus: string;
  pmdKeratoglobus: string;
  postGraft: string;
  postLasik: string;
}

const FittingSessionForm: React.FC<FittingSessionFormProps> = ({
  patientName,
  medicalRecordNumber,
  dateOfBirth,
  diagnosis,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FittingSessionFormData>(
    initialData || {
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: new Date(),
      diagnosis: diagnosis,
      nextFollowUpDate: undefined,
      od_ucva: '', od_cc_bcva: '', od_k1: '', od_k2: '', od_mean_k_radius: '', od_mean_k_power: '', od_kmax: '',
      od_tbut_schirmer: '', od_pentacam: '', od_orbscan: '',
      os_ucva: '', os_cc_bcva: '', os_k1: '', os_k2: '', os_mean_k_radius: '', os_mean_k_power: '', os_kmax: '',
      os_tbut_schirmer: '', os_pentacam: '', os_orbscan: '',
      odProcedures: [],
      osProcedures: [],
    }
  );

  const [isOdRadiusAutoFilled, setIsOdRadiusAutoFilled] = useState(false);
  const [isOsRadiusAutoFilled, setIsOsRadiusAutoFilled] = useState(false);

  const [odTrialLensRecommendations, setOdTrialLensRecommendations] = useState<TrialLensRecommendations>({
    keratoconus: 'N/A', pmdKeratoglobus: 'N/A', postGraft: 'N/A', postLasik: 'N/A',
  });
  const [osTrialLensRecommendations, setOsTrialLensRecommendations] = useState<TrialLensRecommendations>({
    keratoconus: 'N/A', pmdKeratoglobus: 'N/A', postGraft: 'N/A', postLasik: 'N/A',
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: initialData?.date || new Date(),
      diagnosis: diagnosis,
      nextFollowUpDate: initialData?.nextFollowUpDate ? new Date(initialData.nextFollowUpDate) : undefined,
      ...initialData,
      odProcedures: initialData?.odProcedures || [],
      osProcedures: initialData?.osProcedures || [],
    }));
    setIsOdRadiusAutoFilled(false);
    setIsOsRadiusAutoFilled(false);
  }, [patientName, medicalRecordNumber, initialData, diagnosis]);

  const calculateAllTrialLensRecommendations = (meanKRadius: string): TrialLensRecommendations => {
    const radius = parseFloat(meanKRadius);
    if (isNaN(radius) || radius <= 0) {
      return { keratoconus: 'N/A', pmdKeratoglobus: 'N/A', postGraft: 'N/A', postLasik: 'N/A' };
    }

    let keratoconusValue: string;
    if (radius === 7.4) keratoconusValue = radius.toFixed(2);
    else if (radius < 7.4) keratoconusValue = (radius + (7.4 - radius) / 2).toFixed(2);
    else keratoconusValue = (radius - (radius - 7.4) / 2).toFixed(2);

    return {
      keratoconus: keratoconusValue,
      pmdKeratoglobus: (radius - 0.6).toFixed(2),
      postGraft: (radius - 0.7).toFixed(2),
      postLasik: (radius - 0.7).toFixed(2),
    };
  };

  useEffect(() => {
    const power = parseFloat(formData.od_mean_k_power);
    if (!isNaN(power) && power !== 0) {
      const calculatedRadius = (337.5 / power).toFixed(2);
      if (formData.od_mean_k_radius === '' || isOdRadiusAutoFilled) {
        setIsOdRadiusAutoFilled(true);
        setFormData(prev => ({ ...prev, od_mean_k_radius: calculatedRadius }));
      }
    }
  }, [formData.od_mean_k_power, isOdRadiusAutoFilled]);

  useEffect(() => {
    const power = parseFloat(formData.os_mean_k_power);
    if (!isNaN(power) && power !== 0) {
      const calculatedRadius = (337.5 / power).toFixed(2);
      if (formData.os_mean_k_radius === '' || isOsRadiusAutoFilled) {
        setIsOsRadiusAutoFilled(true);
        setFormData(prev => ({ ...prev, os_mean_k_radius: calculatedRadius }));
      }
    }
  }, [formData.os_mean_k_power, isOsRadiusAutoFilled]);

  useEffect(() => {
    setOdTrialLensRecommendations(calculateAllTrialLensRecommendations(formData.od_mean_k_radius));
  }, [formData.od_mean_k_radius]);

  useEffect(() => {
    setOsTrialLensRecommendations(calculateAllTrialLensRecommendations(formData.os_mean_k_radius));
  }, [formData.os_mean_k_radius]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === 'od_mean_k_radius') setIsOdRadiusAutoFilled(false);
    else if (id === 'os_mean_k_radius') setIsOsRadiusAutoFilled(false);
  };

  const handleUpdateODProcedures = (updatedProcedures: SingleRoseK2XLFittingProcedureData[]) => {
    setFormData(prev => ({ ...prev, odProcedures: updatedProcedures }));
  };

  const handleUpdateOSProcedures = (updatedProcedures: SingleRoseK2XLFittingProcedureData[]) => {
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
          <CardTitle className="text-3xl font-bold">ROSE K2 XL FITTING WORKSHEET</CardTitle>
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
          <div>
            <Label htmlFor="date">Date of Session</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.date} onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="nextFollowUpDate">Next Follow-up Schedule</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.nextFollowUpDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.nextFollowUpDate ? format(formData.nextFollowUpDate, "PPP") : <span>Schedule next visit</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.nextFollowUpDate} onSelect={(date) => setFormData(prev => ({ ...prev, nextFollowUpDate: date }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">OD (Right Eye)</h3>
            <div className="space-y-3">
              <div><Label htmlFor="od_ucva">UCVA</Label><Input id="od_ucva" value={formData.od_ucva} onChange={handleChange} /></div>
              <div><Label htmlFor="od_cc_bcva">CC & BCVA</Label><Input id="od_cc_bcva" value={formData.od_cc_bcva} onChange={handleChange} /></div>
              <div><Label htmlFor="od_k1">K1</Label><Input id="od_k1" value={formData.od_k1} onChange={handleChange} /></div>
              <div><Label htmlFor="od_k2">K2</Label><Input id="od_k2" value={formData.od_k2} onChange={handleChange} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="od_mean_k_radius">MEAN K (Radius)</Label><Input id="od_mean_k_radius" value={formData.od_mean_k_radius} onChange={handleChange} /></div>
                <div><Label htmlFor="od_mean_k_power">MEAN K (Power)</Label><Input id="od_mean_k_power" value={formData.od_mean_k_power} onChange={handleChange} /></div>
              </div>
              <div><Label htmlFor="od_kmax">KMAX</Label><Input id="od_kmax" value={formData.od_kmax} onChange={handleChange} /></div>
              <div><Label htmlFor="od_tbut_schirmer">TBUT/SCHIRMER</Label><Input id="od_tbut_schirmer" value={formData.od_tbut_schirmer} onChange={handleChange} /></div>
              <div><Label htmlFor="od_pentacam">PENTACAM</Label><Input id="od_pentacam" value={formData.od_pentacam} onChange={handleChange} /></div>
              <div><Label htmlFor="od_orbscan">ORBSCAN</Label><Input id="od_orbscan" value={formData.od_orbscan} onChange={handleChange} /></div>
              <div>
                <Label>First Trial Lens Recommendation</Label>
                <Textarea readOnly className="bg-muted min-h-[100px] text-xs" value={`Keratoconus: ${odTrialLensRecommendations.keratoconus}\nPMD/Keratoglobus: ${odTrialLensRecommendations.pmdKeratoglobus}\nPost Graft: ${odTrialLensRecommendations.postGraft}\nPost Lasik: ${odTrialLensRecommendations.postLasik}`} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">OS (Left Eye)</h3>
            <div className="space-y-3">
              <div><Label htmlFor="os_ucva">UCVA</Label><Input id="os_ucva" value={formData.os_ucva} onChange={handleChange} /></div>
              <div><Label htmlFor="os_cc_bcva">CC & BCVA</Label><Input id="os_cc_bcva" value={formData.os_cc_bcva} onChange={handleChange} /></div>
              <div><Label htmlFor="os_k1">K1</Label><Input id="os_k1" value={formData.os_k1} onChange={handleChange} /></div>
              <div><Label htmlFor="os_k2">K2</Label><Input id="os_k2" value={formData.os_k2} onChange={handleChange} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="os_mean_k_radius">MEAN K (Radius)</Label><Input id="os_mean_k_radius" value={formData.os_mean_k_radius} onChange={handleChange} /></div>
                <div><Label htmlFor="os_mean_k_power">MEAN K (Power)</Label><Input id="os_mean_k_power" value={formData.os_mean_k_power} onChange={handleChange} /></div>
              </div>
              <div><Label htmlFor="os_kmax">KMAX</Label><Input id="os_kmax" value={formData.os_kmax} onChange={handleChange} /></div>
              <div><Label htmlFor="os_tbut_schirmer">TBUT/SCHIRMER</Label><Input id="os_tbut_schirmer" value={formData.os_tbut_schirmer} onChange={handleChange} /></div>
              <div><Label htmlFor="os_pentacam">PENTACAM</Label><Input id="os_pentacam" value={formData.os_pentacam} onChange={handleChange} /></div>
              <div><Label htmlFor="os_orbscan">ORBSCAN</Label><Input id="os_orbscan" value={formData.os_orbscan} onChange={handleChange} /></div>
              <div>
                <Label>First Trial Lens Recommendation</Label>
                <Textarea readOnly className="bg-muted min-h-[100px] text-xs" value={`Keratoconus: ${osTrialLensRecommendations.keratoconus}\nPMD/Keratoglobus: ${osTrialLensRecommendations.pmdKeratoglobus}\nPost Graft: ${osTrialLensRecommendations.postGraft}\nPost Lasik: ${osTrialLensRecommendations.postLasik}`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-2xl">FITTING PROCEDURE</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoseK2XLFittingProcedurePanel eye="OD" procedures={formData.odProcedures} onUpdateProcedures={handleUpdateODProcedures} />
          <RoseK2XLFittingProcedurePanel eye="OS" procedures={formData.osProcedures} onUpdateProcedures={handleUpdateOSProcedures} />
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