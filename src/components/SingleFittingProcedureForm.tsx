import React from 'react';
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
}

const SingleFittingProcedureForm: React.FC<SingleFittingProcedureFormProps> = ({ eye, data, onChange, onDelete, canDelete }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Remove the eye prefix to get the actual field name
    const fieldName = id.replace(`${eye.toLowerCase()}_`, '') as keyof SingleFittingProcedureData;
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
        <Label htmlFor={`${eye.toLowerCase()}_va`}>VA</Label>
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