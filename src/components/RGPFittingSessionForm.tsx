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

// Define the structure for RGP fitting session data, now including ROSE K2 XL fields
export interface RGPFittingSessionFormData {
  patientName: string;
  medicalRecordNumber: string;
  date: Date;
  diagnosis?: string;

  // Original RGP fields (kept for RGP specificity)
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

  // Fields cloned from ROSE K2 XL form
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

  // Fitting Procedures (from ROSE K2 XL form)
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

// Interface for all trial lens recommendations
interface TrialLensRecommendations {
  keratoconus: string;
  pmdKeratoglobus: string;
  postGraft: string;
  postLasik: string;
}

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
      // Original RGP fields
      od_k_reading: '', os_k_reading: '', od_hvid: '', os_hvid: '',
      od_h_visible_iris_diameter: '', os_h_visible_iris_diameter: '',
      od_refraction: '', os_refraction: '', od_lens_parameters: '', os_lens_parameters: '',
      od_fitting_assessment: '', os_fitting_assessment: '',
      // Cloned ROSE K2 XL fields
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
      diagnosis: diagnosis,
      ...initialData,
      odProcedures: initialData?.odProcedures || [],
      osProcedures: initialData?.osProcedures || [],
    }));
    setIsOdRadiusAutoFilled(false);
    setIsOsRadiusAutoFilled(false);
  }, [patientName, medicalRecordNumber, initialData, diagnosis]);

  // Helper function to calculate ALL trial lens recommendations (reused from ROSE K2 XL)
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
    const postLasikValue = (radius - 0.7).toFixed(2);

    return {
      keratoconus: keratoconusValue,
      pmdKeratoglobus: pmdKeratoglobusValue,
      postGraft: postGraftValue,
      postLasik: postLasikValue,
    };
  };

  // Effect for OD Mean K calculation (reused from ROSE K2 XL)
  useEffect(() => {
    const power = parseFloat(formData.od_mean_k_power);
    if (!isNaN(power) && power !== 0) {
      const calculatedRadius = (337.5 / power).toFixed(2);
      setFormData(prev => {
        if (prev.od_mean_k_radius === '' || isOdRadiusAutoFilled) {
          setIsOdRadiusAutoFilled(true);
          return { ...prev, od_mean_k_radius: calculatedRadius };
        }
        return prev;
      });
    } else if (formData.od_mean_k_power === '') {
      setFormData(prev => {
        if (isOdRadiusAutoFilled) {
          setIsOdRadiusAutoFilled(false);
          return { ...prev, od_mean_k_radius: '' };
        }
        return prev;
      });
    }
  }, [formData.od_mean_k_power, isOdRadiusAutoFilled]);

  // Effect for OS Mean K calculation (reused from ROSE K2 XL)
  useEffect(() => {
    const power = parseFloat(formData.os_mean_k_power);
    if (!isNaN(power) && power !== 0) {
      const calculatedRadius = (337.5 / power).toFixed(2);
      setFormData(prev => {
        if (prev.os_mean_k_radius === '' || isOsRadiusAutoFilled) {
          setIsOsRadiusAutoFilled(true);
          return { ...prev, os_mean_k_radius: calculatedRadius };
        }
        return prev;
      });
    } else if (formData.os_mean_k_power === '') {
      setFormData(prev => {
        if (isOsRadiusAutoFilled) {
          setIsOsRadiusAutoFilled(false);
          return { ...prev, os_mean_k_radius: '' };
        }
        return prev;
      });
    }
  }, [formData.os_mean_k_power, isOsRadiusAutoFilled]);

  // Effect to update all trial lens recommendations when radius changes (reused from ROSE K2 XL)
  useEffect(() => {
    setOdTrialLensRecommendations(calculateAllTrialLensRecommendations(formData.od_mean_k_radius));
  }, [formData.od_mean_k_radius]);

  useEffect(() => {
    setOsTrialLensRecommendations(calculateAllTrialLensRecommendations(formData.os_mean_k_radius));
  }, [formData.os_mean_k_radius]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

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
              {/* Original RGP fields */}
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

              {/* Cloned ROSE K2 XL fields */}
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
              {/* Original RGP fields */}
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

              {/* Cloned ROSE K2 XL fields */}
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
          <FittingProcedurePanel
            eye="OD"
            procedures={formData.odProcedures}
            onUpdateProcedures={handleUpdateODProcedures}
          />
          <FittingProcedurePanel
            eye="OS"
            procedures={formData.osProcedures}
            onUpdateProcedures={handleUpdateOSProcedures}
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