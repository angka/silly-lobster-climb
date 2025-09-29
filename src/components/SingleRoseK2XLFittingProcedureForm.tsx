import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface SingleRoseK2XLFittingProcedureData {
  id: string;
  base_curve: string;
  central_fit: string;
  edge_lift_superior: string;
  edge_lift_inferior: string;
  edge_lift_nasal: string;
  edge_lift_temporal: string;
  dia_location_movement: string;
  as_oct: string;
  terpasang: string;
  over_refraction: string;
  vdc: string;
  custom: string;
  rx: string;
  comments: string; // Keeping comments for general notes
}

interface SingleRoseK2XLFittingProcedureFormProps {
  eye: 'OD' | 'OS';
  data: SingleRoseK2XLFittingProcedureData;
  onChange: (updatedData: SingleRoseK2XLFittingProcedureData) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

const SingleRoseK2XLFittingProcedureForm: React.FC<SingleRoseK2XLFittingProcedureFormProps> = ({
  eye,
  data,
  onChange,
  onDelete,
  canDelete,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace(`${eye.toLowerCase()}_`, '') as keyof SingleRoseK2XLFittingProcedureData;
    onChange({ ...data, [fieldName]: value });
  };

  const handleSelectChange = (field: keyof SingleRoseK2XLFittingProcedureData, value: string) => {
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
        <Label htmlFor={`${eye.toLowerCase()}_base_curve`}>Base Curve</Label>
        <Input id={`${eye.toLowerCase()}_base_curve`} value={data.base_curve} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_central_fit`}>Central Fit</Label>
        <Input id={`${eye.toLowerCase()}_central_fit`} value={data.central_fit} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_edge_lift_superior`}>Edge Lift (Superior)</Label>
          <Input id={`${eye.toLowerCase()}_edge_lift_superior`} value={data.edge_lift_superior} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_edge_lift_inferior`}>Edge Lift (Inferior)</Label>
          <Input id={`${eye.toLowerCase()}_edge_lift_inferior`} value={data.edge_lift_inferior} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_edge_lift_nasal`}>Edge Lift (Nasal)</Label>
          <Input id={`${eye.toLowerCase()}_edge_lift_nasal`} value={data.edge_lift_nasal} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_edge_lift_temporal`}>Edge Lift (Temporal)</Label>
          <Input id={`${eye.toLowerCase()}_edge_lift_temporal`} value={data.edge_lift_temporal} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_dia_location_movement`}>Dia/Location/Movement</Label>
        <Input id={`${eye.toLowerCase()}_dia_location_movement`} value={data.dia_location_movement} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_as_oct`}>AS OCT</Label>
        <Input id={`${eye.toLowerCase()}_as_oct`} value={data.as_oct} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_terpasang`}>Terpasang</Label>
        <Input id={`${eye.toLowerCase()}_terpasang`} value={data.terpasang} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_over_refraction`}>Over Refraction</Label>
        <Input id={`${eye.toLowerCase()}_over_refraction`} value={data.over_refraction} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_vdc`}>VDC</Label>
        <Input id={`${eye.toLowerCase()}_vdc`} value={data.vdc} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_custom`}>Custom</Label>
        <Input id={`${eye.toLowerCase()}_custom`} value={data.custom} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_rx`}>Rx</Label>
        <Input id={`${eye.toLowerCase()}_rx`} value={data.rx} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_comments`}>Comments</Label>
        <Textarea id={`${eye.toLowerCase()}_comments`} value={data.comments} onChange={handleChange} placeholder="Any additional comments..." />
      </div>
    </div>
  );
};

export default SingleRoseK2XLFittingProcedureForm;