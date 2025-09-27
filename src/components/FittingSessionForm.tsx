import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Ensure Textarea is imported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import FittingProcedurePanel from './FittingProcedurePanel';
import { SingleFittingProcedureData } from './SingleFittingProcedureForm';

// Define the structure for the fitting session data
export interface FittingSessionFormData {
  // Patient Info (for display, not direct input on this form)
  patientName: string;
  medicalRecordNumber: string;
  date: Date; // New field for the session date
  diagnosis?: string; // New field for diagnosis

  // OD (Right Eye)
  od_ucva: string;
  od_cc_bcva: string;
  od_k1: string;
  od_k2: string;
  od_mean_k_radius: string; // New field for Mean K Radius
  od_mean_k_power: string;  // New field for Mean K Power
  od_kmax: string;
  od_tbut_schirmer: string;
  od_pentacam: string; // Merged field
  od_orbscan: string; // Merged field

  // OS (Left Eye)
  os_ucva: string;
  os_cc_bcva: string;
  os_k1: string;
  os_k2: string;
  os_mean_k_radius: string; // New field for Mean K Radius
  os_mean_k_power: string;  // New field for Mean K Power
  os_kmax: string;
  os_tbut_schirmer: string;
  os_pentacam: string; // Merged field
  os_orbscan: string; // Merged field

  // Fitting Procedures (now arrays of objects)
  odProcedures: SingleFittingProcedureData[];
  osProcedures: SingleFittingProcedureData[];
}

interface FittingSessionFormProps {
  patientName: string;
  medicalRecordNumber: string;
  dateOfBirth?: Date;
  diagnosis?: string; // Added diagnosis prop
  initialData?: FittingSessionFormData;
  onSubmit: (data: FittingSessionFormData) => void;
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

// Interface for all trial lens recommendations
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
  diagnosis, // Destructure diagnosis
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FittingSessionFormData>(
    initialData || {
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: new Date(),
      diagnosis: diagnosis, // Initialize diagnosis
      od_ucva: '', od_cc_bcva: '', od_k1: '', od_k2: '', od_mean_k_radius: '', od_mean_k_power: '', od_kmax: '',
      od_tbut_schirmer: '', od_pentacam: '', od_orbscan: '',
      os_ucva: '', os_cc_bcva: '', os_k1: '', os_k2: '', os_mean_k_radius: '', os_mean_k_power: '', os_kmax: '',
      os_tbut_schirmer: '', os_pentacam: '', os_orbscan: '',
      odProcedures: [],
      osProcedures: [],
    }
  );

  // State to track if radius was auto-filled or manually set
  const [isOdRadiusAutoFilled, setIsOdRadiusAutoFilled] = useState(false);
  const [isOsRadiusAutoFilled, setIsOsRadiusAutoFilled] = useState(false);

  // State for all trial lens recommendations
  const [odTrialLensRecommendations, setOdTrialLensRecommendations] = useState<TrialLensRecommendations>({
    keratoconus: 'N/A',
    pmdKeratoglobus: 'N/A',
    postGraft: 'N/A',
    postLasik: 'N/A',
  });
  const [osTrialLensRecommendations, setOsTrialLensRecommendations] = useState<TrialLensRecommendations>({
    keratoconus: 'N/A',
    pmdKeratoglobus: 'N/A',
    postGraft: 'N/A',
    postLasik: 'N/A',
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: patientName,
      medicalRecordNumber: medicalRecordNumber,
      date: initialData?.date || new Date(),
      diagnosis: diagnosis, // Update diagnosis if prop changes
      ...initialData,
      odProcedures: initialData?.odProcedures || [],
      osProcedures: initialData?.osProcedures || [],
    }));
    // Reset auto-filled flags when initialData changes
    setIsOdRadiusAutoFilled(false);
    setIsOsRadiusAutoFilled(false);
  }, [patientName, medicalRecordNumber, initialData, diagnosis]);

  // Helper function to calculate ALL trial lens recommendations
  const calculateAllTrialLensRecommendations = (meanKRadius: string): TrialLensRecommendations => {
    const radius = parseFloat(meanKRadius);
    if (isNaN(radius) || radius <= 0) {
      return {
        keratoconus: 'N/A',
        pmdKeratoglobus: 'N/A',
        postGraft: 'N/A',
        postLasik: 'N/A',
      };
    }

    let keratoconusValue: string;
    if (radius === 7.4) {
      keratoconusValue = radius.toFixed(2);
    } else if (radius < 7.4) {
      const x = (7.4 - radius) / 2;
      keratoconusValue = (radius + x).toFixed(2);
    } else { // radius > 7.4
      const y = (radius - 7.4) / 2;
      keratoconusValue = (radius - y).toFixed(2);
    }

    const pmdKeratoglobusValue = (radius - 0.6).toFixed(2);
    const postGraftValue = (radius - 0.7).toFixed(2);
    const postLasikValue = (radius - 0.7).toFixed(2); // Assuming post lasik is same as post graft

    return {
      keratoconus: keratoconusValue,
      pmdKeratoglobus: pmdKeratoglobusValue,
      postGraft: postGraftValue,
      postLasik: postLasikValue,
    };
  };

  // Effect for OD Mean K calculation
  useEffect(() => {
    const power = parseFloat(formData.od_mean_k_power);
    if (!isNaN(power) && power !== 0) {
      const calculatedRadius = (337.5 / power).toFixed(2);
      setFormData(prev => {
        // Only update if radius is empty or was previously auto-filled
        if (prev.od_mean_k_radius === '' || isOdRadiusAutoFilled) {
          setIsOdRadiusAutoFilled(true);
          return { ...prev, od_mean_k_radius: calculatedRadius };
        }
        return prev; // Don't overwrite manual input
      });
    } else if (formData.od_mean_k_power === '') {
      setFormData(prev => {
        // If power is cleared, clear radius only if it was auto-filled
        if (isOdRadiusAutoFilled) {
          setIsOdRadiusAutoFilled(false);
          return { ...prev, od_mean_k_radius: '' };
        }
        return prev; // Don't clear manual input
      });
    }
  }, [formData.od_mean_k_power, isOdRadiusAutoFilled]);

  // Effect for OS Mean K calculation
  useEffect(() => {
    const power = parseFloat(formData.os_mean_k_power);
    if (!isNaN(power) && power !== 0) {
      const calculatedRadius = (337.5 / power).toFixed(2);
      setFormData(prev => {
        // Only update if radius is empty or was previously auto-filled
        if (prev.os_mean_k_radius === '' || isOsRadiusAutoFilled) {
          setIsOsRadiusAutoFilled(true);
          return { ...prev, os_mean_k_radius: calculatedRadius };
        }
        return prev; // Don't overwrite manual input
      });
    } else if (formData.os_mean_k_power === '') {
      setFormData(prev => {
        // If power is cleared, clear radius only if it was auto-filled
        if (isOsRadiusAutoFilled) {
          setIsOsRadiusAutoFilled(false);
          return { ...prev, os_mean_k_radius: '' };
        }
        return prev; // Don't clear manual input
      });
    }
  }, [formData.os_mean_k_power, isOsRadiusAutoFilled]);

  // Effect to update all trial lens recommendations when radius changes
  useEffect(() => {
    setOdTrialLensRecommendations(calculateAllTrialLensRecommendations(formData.od_mean_k_radius));
  }, [formData.od_mean_k_radius]);

  useEffect(() => {
    setOsTrialLensRecommendations(calculateAllTrialLensRecommendations(formData.os_mean_k_radius));
  }, [formData.os_mean_k_radius]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // If user manually types into a radius field, mark it as not auto-filled
    if (id === 'od_mean_k_radius') {
      setIsOdRadiusAutoFilled(false);
    } else if (id === 'os_mean_k_radius') {
      setIsOsRadiusAutoFilled(false);
    }
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
              {/* MEAN K - Radius and Power */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="od_mean_k_radius">MEAN K (Radius)</Label>
                  <Input id="od_mean_k_radius" value={formData.od_mean_k_radius} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="od_mean_k_power">MEAN K (Power)</Label>
                  <Input id="od_mean_k_power" value={formData.od_mean_k_power} onChange={handleChange} />
                </div>
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
              {/* First Trial Lens Recommendation */}
              <div>
                <Label htmlFor="od_trial_lens_recommendation">First Trial Lens Recommendation</Label>
                <Textarea
                  id="od_trial_lens_recommendation"
                  value={`Keratoconus: ${odTrialLensRecommendations.keratoconus}\nPMD/Keratoglobus: ${odTrialLensRecommendations.pmdKeratoglobus}\nPost Graft: ${odTrialLensRecommendations.postGraft}\nPost Lasik: ${odTrialLensRecommendations.postLasik}`}
                  readOnly
                  className="bg-muted min-h-[120px]"
                />
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
              {/* MEAN K - Radius and Power */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="os_mean_k_radius">MEAN K (Radius)</Label>
                  <Input id="os_mean_k_radius" value={formData.os_mean_k_radius} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="os_mean_k_power">MEAN K (Power)</Label>
                  <Input id="os_mean_k_power" value={formData.os_mean_k_power} onChange={handleChange} />
                </div>
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
              {/* First Trial Lens Recommendation */}
              <div>
                <Label htmlFor="os_trial_lens_recommendation">First Trial Lens Recommendation</Label>
                <Textarea
                  id="os_trial_lens_recommendation"
                  value={`Keratoconus: ${osTrialLensRecommendations.keratoconus}\nPMD/Keratoglobus: ${osTrialLensRecommendations.pmdKeratoglobus}\nPost Graft: ${osTrialLensRecommendations.postGraft}\nPost Lasik: ${osTrialLensRecommendations.postLasik}`}
                  readOnly
                  className="bg-muted min-h-[120px]"
                />
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
          <FittingProcedurePanel
            eye="OD"
            procedures={formData.odProcedures}
            onUpdateProcedures={handleUpdateODProcedures}
          />

          {/* Fitting Procedure - Right Column (OS) */}
          <FittingProcedurePanel
            eye="OS"
            procedures={formData.osProcedures}
            onUpdateProcedures={handleUpdateOSProcedures}
          />
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