import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button'; // Import Button for delete action
import { Trash2 } from 'lucide-react'; // Import Trash2 icon

export interface SingleFittingProcedureData {
  id: string; // Added for unique identification in lists
  leading_base_curve: string; // New field
  real_base_curve: string; // New field
  lens_name: string;
  base_curve: string;
  diameter: string;
  power: string;
  over_refraction: string;
  va: string;
  overall_assessment: string;
  comments: string;
}

interface SingleFittingProcedureFormProps {
  eye: 'OD' | 'OS';
  data: SingleFittingProcedureData;
  onChange: (updatedData: SingleFittingProcedureData) => void; // Changed to pass full object
  onDelete: (id: string) => void; // Added onDelete prop
  canDelete: boolean; // Added canDelete prop
  k1Radius: string; // New prop for K1 Radius from parent
  k2Radius: string; // New prop for K2 Radius from parent
}

const SingleFittingProcedureForm: React.FC<SingleFittingProcedureFormProps> = ({ eye, data, onChange, onDelete, canDelete, k1Radius, k2Radius }) => {
  // State to track if the leading_base_curve has been manually edited
  const [hasUserEditedLeadingBaseCurve, setHasUserEditedLeadingBaseCurve] = useState(false);
  // State to track if the real_base_curve has been manually edited
  const [hasUserEditedRealBaseCurve, setHasUserEditedRealBaseCurve] = useState(false);

  // Initialize hasUserEditedLeadingBaseCurve based on initial data
  useEffect(() => {
    if (data.leading_base_curve) {
      setHasUserEditedLeadingBaseCurve(true);
    } else {
      setHasUserEditedLeadingBaseCurve(false);
    }
  }, [data.leading_base_curve]);

  // Initialize hasUserEditedRealBaseCurve based on initial data
  useEffect(() => {
    if (data.real_base_curve) {
      setHasUserEditedRealBaseCurve(true);
    } else {
      setHasUserEditedRealBaseCurve(false);
    }
  }, [data.real_base_curve]);

  // Effect to calculate leading_base_curve automatically
  useEffect(() => {
    if (!hasUserEditedLeadingBaseCurve) {
      const k1 = parseFloat(k1Radius);
      const k2 = parseFloat(k2Radius);

      if (!isNaN(k1) && !isNaN(k2)) {
        const calculatedValue = (k1 - k2).toFixed(2);
        if (data.leading_base_curve !== calculatedValue) {
          onChange({ ...data, leading_base_curve: calculatedValue });
        }
      } else if (data.leading_base_curve !== '') {
        // If K1 or K2 are not valid numbers, clear the calculated field if it's not manually edited
        onChange({ ...data, leading_base_curve: '' });
      }
    }
  }, [k1Radius, k2Radius, hasUserEditedLeadingBaseCurve, data.leading_base_curve, onChange, data]);

  // Effect to calculate real_base_curve automatically
  useEffect(() => {
    if (!hasUserEditedRealBaseCurve) {
      const leadingBC = parseFloat(data.leading_base_curve);
      const k1 = parseFloat(k1Radius);
      let calculatedRealBC: string = '';

      if (!isNaN(leadingBC) && !isNaN(k1)) {
        if (leadingBC < 0.10) {
          calculatedRealBC = k1.toFixed(2);
        } else if (leadingBC >= 0.10 && leadingBC <= 0.20) {
          calculatedRealBC = (k1 - 0.10).toFixed(2);
        } else if (leadingBC >= 0.21 && leadingBC <= 0.35) {
          calculatedRealBC = (k1 - 0.15).toFixed(2);
        } else if (leadingBC >= 0.36) {
          calculatedRealBC = (k1 - 0.20).toFixed(2);
        }
      }

      if (data.real_base_curve !== calculatedRealBC) {
        onChange({ ...data, real_base_curve: calculatedRealBC });
      }
    }
  }, [data.leading_base_curve, k1Radius, hasUserEditedRealBaseCurve, data.real_base_curve, onChange, data]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace(`${eye.toLowerCase()}_`, '') as keyof SingleFittingProcedureData;

    if (fieldName === 'leading_base_curve') {
      setHasUserEditedLeadingBaseCurve(true); // Mark as manually edited
    } else if (fieldName === 'real_base_curve') {
      setHasUserEditedRealBaseCurve(true); // Mark as manually edited
    }
    onChange({ ...data, [fieldName]: value });
  };

  const handleSelectChange = (field: keyof SingleFittingProcedureData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-3 p-4 border rounded-md bg-background">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Procedure Details</h4>
        {canDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(data.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_leading_base_curve`}>Leading Base Curve</Label>
        <Input id={`${eye.toLowerCase()}_leading_base_curve`} value={data.leading_base_curve} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_real_base_curve`}>Real Base Curve</Label>
        <Input id={`${eye.toLowerCase()}_real_base_curve`} value={data.real_base_curve} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_lens_name`}>Lens Name</Label>
        <Input id={`${eye.toLowerCase()}_lens_name`} value={data.lens_name} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_base_curve`}>Base Curve</Label>
        <Input id={`${eye.toLowerCase()}_base_curve`} value={data.base_curve} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_diameter`}>Diameter</Label>
        <Input id={`${eye.toLowerCase()}_diameter`} value={data.diameter} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_power`}>Power</Label>
        <Input id={`${eye.toLowerCase()}_power`} value={data.power} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_over_refraction`}>Over Refraction</Label>
        <Input id={`${eye.toLowerCase()}_over_refraction`} value={data.over_refraction} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_va`}>BCVA</Label>
        <Input id={`${eye.toLowerCase()}_va`} value={data.va} onChange={handleChange} />
      </div>

      <div className="mt-4">
        <Label htmlFor={`${eye.toLowerCase()}_overall_assessment`}>Overall Assessment</Label>
        <Select
          value={data.overall_assessment}
          onValueChange={(value) => handleSelectChange('overall_assessment', value)}
        >
          <SelectTrigger id={`${eye.toLowerCase()}_overall_assessment`}>
            <SelectValue placeholder="Select assessment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_comments`}>Comments</Label>
        <Textarea id={`${eye.toLowerCase()}_comments`} value={data.comments} onChange={handleChange} />
      </div>
    </div>
  );
};

export default SingleFittingProcedureForm;