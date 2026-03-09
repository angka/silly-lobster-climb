import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface SingleFittingProcedureData {
  id: string;
  leading_base_curve: string;
  real_base_curve: string;
  lens_name: string;
  base_curve: string;
  diameter: string;
  power: string;
  dynamic_fit: string;
  static_fit: string;
  over_refraction: string;
  va: string;
  overall_assessment: string;
  comments: string;
}

interface SingleFittingProcedureFormProps {
  eye: 'OD' | 'OS';
  data: SingleFittingProcedureData;
  onChange: (updatedData: SingleFittingProcedureData) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  k1Radius: string;
  k2Radius: string;
}

const SingleFittingProcedureForm: React.FC<SingleFittingProcedureFormProps> = ({ eye, data, onChange, onDelete, canDelete, k1Radius, k2Radius }) => {
  const [hasUserEditedLeadingBaseCurve, setHasUserEditedLeadingBaseCurve] = useState(false);
  const [hasUserEditedRealBaseCurve, setHasUserEditedRealBaseCurve] = useState(false);

  useEffect(() => {
    if (data.leading_base_curve) setHasUserEditedLeadingBaseCurve(true);
    else setHasUserEditedLeadingBaseCurve(false);
  }, [data.leading_base_curve]);

  useEffect(() => {
    if (data.real_base_curve) setHasUserEditedRealBaseCurve(true);
    else setHasUserEditedRealBaseCurve(false);
  }, [data.real_base_curve]);

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
        onChange({ ...data, leading_base_curve: '' });
      }
    }
  }, [k1Radius, k2Radius, hasUserEditedLeadingBaseCurve, data.leading_base_curve, onChange, data]);

  useEffect(() => {
    if (!hasUserEditedRealBaseCurve) {
      const leadingBC = parseFloat(data.leading_base_curve);
      const k1 = parseFloat(k1Radius);
      let calculatedRealBC: string = '';
      if (!isNaN(leadingBC) && !isNaN(k1)) {
        if (leadingBC < 0.10) calculatedRealBC = k1.toFixed(2);
        else if (leadingBC >= 0.10 && leadingBC <= 0.20) calculatedRealBC = (k1 - 0.10).toFixed(2);
        else if (leadingBC >= 0.21 && leadingBC <= 0.35) calculatedRealBC = (k1 - 0.15).toFixed(2);
        else if (leadingBC >= 0.36) calculatedRealBC = (k1 - 0.20).toFixed(2);
      }
      if (data.real_base_curve !== calculatedRealBC) {
        onChange({ ...data, real_base_curve: calculatedRealBC });
      }
    }
  }, [data.leading_base_curve, k1Radius, hasUserEditedRealBaseCurve, data.real_base_curve, onChange, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace(`${eye.toLowerCase()}_`, '') as keyof SingleFittingProcedureData;
    if (fieldName === 'leading_base_curve') setHasUserEditedLeadingBaseCurve(true);
    else if (fieldName === 'real_base_curve') setHasUserEditedRealBaseCurve(true);
    onChange({ ...data, [fieldName]: value });
  };

  const handleSelectChange = (field: keyof SingleFittingProcedureData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-2 p-2 md:p-4 border rounded-md bg-background">
      <div className="flex justify-between items-center mb-2 print:mb-1">
        <h4 className="text-sm font-bold">Procedure: {data.base_curve || 'New'}</h4>
        {canDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(data.id)} className="h-7 px-2 text-xs print:hidden">
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 procedure-grid">
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_leading_base_curve`}>Leading BC</Label>
          <Input id={`${eye.toLowerCase()}_leading_base_curve`} value={data.leading_base_curve} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_real_base_curve`}>Real BC</Label>
          <Input id={`${eye.toLowerCase()}_real_base_curve`} value={data.real_base_curve} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_lens_name`}>Lens Name</Label>
          <Input id={`${eye.toLowerCase()}_lens_name`} value={data.lens_name} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_base_curve`}>Base Curve</Label>
          <Input id={`${eye.toLowerCase()}_base_curve`} value={data.base_curve} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_diameter`}>Diameter</Label>
          <Input id={`${eye.toLowerCase()}_diameter`} value={data.diameter} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_power`}>Power</Label>
          <Input id={`${eye.toLowerCase()}_power`} value={data.power} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_dynamic_fit`}>Dynamic Fit</Label>
          <Input id={`${eye.toLowerCase()}_dynamic_fit`} value={data.dynamic_fit} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_static_fit`}>Static Fit</Label>
          <Input id={`${eye.toLowerCase()}_static_fit`} value={data.static_fit} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_over_refraction`}>Over Refraction</Label>
          <Input id={`${eye.toLowerCase()}_over_refraction`} value={data.over_refraction} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_va`}>BCVA</Label>
          <Input id={`${eye.toLowerCase()}_va`} value={data.va} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_overall_assessment`}>Assessment</Label>
          <Select value={data.overall_assessment} onValueChange={(value) => handleSelectChange('overall_assessment', value)}>
            <SelectTrigger id={`${eye.toLowerCase()}_overall_assessment`} className="h-8">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-full">
          <Label htmlFor={`${eye.toLowerCase()}_comments`}>Comments</Label>
          <Textarea id={`${eye.toLowerCase()}_comments`} value={data.comments} onChange={handleChange} className="min-h-[40px] py-1" />
        </div>
      </div>
    </div>
  );
};

export default SingleFittingProcedureForm;