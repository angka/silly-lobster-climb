import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SingleFittingProcedureData {
  lens_name: string;
  base_curve: string;
  diameter: string;
  power: string;
  over_refraction: string;
  va: string;
  nafl_superior: string;
  nafl_inferior: string;
  nafl_nasal: string;
  nafl_temporal: string;
  nafl_central: string;
  overall_assessment: string;
  comments: string;
}

interface SingleFittingProcedureFormProps {
  eye: 'OD' | 'OS';
  data: SingleFittingProcedureData;
  onChange: (field: keyof SingleFittingProcedureData, value: string) => void;
}

const SingleFittingProcedureForm: React.FC<SingleFittingProcedureFormProps> = ({ eye, data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Remove the eye prefix to get the actual field name
    const fieldName = id.replace(`${eye.toLowerCase()}_`, '') as keyof SingleFittingProcedureData;
    onChange(fieldName, value);
  };

  const handleSelectChange = (field: keyof SingleFittingProcedureData, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-3">
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
        <Label htmlFor={`${eye.toLowerCase()}_va`}>VA</Label>
        <Input id={`${eye.toLowerCase()}_va`} value={data.va} onChange={handleChange} />
      </div>

      <h4 className="text-md font-semibold mt-4">NAFL (Sodium Fluorescein)</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_nafl_superior`}>Superior</Label>
          <Input id={`${eye.toLowerCase()}_nafl_superior`} value={data.nafl_superior} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_nafl_inferior`}>Inferior</Label>
          <Input id={`${eye.toLowerCase()}_nafl_inferior`} value={data.nafl_inferior} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_nafl_nasal`}>Nasal</Label>
          <Input id={`${eye.toLowerCase()}_nafl_nasal`} value={data.nafl_nasal} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_nafl_temporal`}>Temporal</Label>
          <Input id={`${eye.toLowerCase()}_nafl_temporal`} value={data.nafl_temporal} onChange={handleChange} />
        </div>
        <div className="col-span-2">
          <Label htmlFor={`${eye.toLowerCase()}_nafl_central`}>Central</Label>
          <Input id={`${eye.toLowerCase()}_nafl_central`} value={data.nafl_central} onChange={handleChange} />
        </div>
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