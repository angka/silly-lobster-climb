import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  comments: string;
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
          <Label htmlFor={`${eye.toLowerCase()}_base_curve`}>Base Curve</Label>
          <Input id={`${eye.toLowerCase()}_base_curve`} value={data.base_curve} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_central_fit`}>Central Fit</Label>
          <Input id={`${eye.toLowerCase()}_central_fit`} value={data.central_fit} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_dia_location_movement`}>Dia/Loc/Mov</Label>
          <Textarea 
            id={`${eye.toLowerCase()}_dia_location_movement`} 
            value={data.dia_location_movement} 
            onChange={handleChange} 
            className="min-h-[40px] py-1 text-xs" 
          />
        </div>
        
        <div className="col-span-full grid grid-cols-4 gap-2">
          <div>
            <Label className="text-[9px]">Edge (Sup)</Label>
            <Input id={`${eye.toLowerCase()}_edge_lift_superior`} value={data.edge_lift_superior} onChange={handleChange} className="h-8" />
          </div>
          <div>
            <Label className="text-[9px]">Edge (Inf)</Label>
            <Input id={`${eye.toLowerCase()}_edge_lift_inferior`} value={data.edge_lift_inferior} onChange={handleChange} className="h-8" />
          </div>
          <div>
            <Label className="text-[9px]">Edge (Nas)</Label>
            <Input id={`${eye.toLowerCase()}_edge_lift_nasal`} value={data.edge_lift_nasal} onChange={handleChange} className="h-8" />
          </div>
          <div>
            <Label className="text-[9px]">Edge (Tem)</Label>
            <Input id={`${eye.toLowerCase()}_edge_lift_temporal`} value={data.edge_lift_temporal} onChange={handleChange} className="h-8" />
          </div>
        </div>

        <div>
          <Label htmlFor={`${eye.toLowerCase()}_as_oct`}>AS OCT</Label>
          <Input id={`${eye.toLowerCase()}_as_oct`} value={data.as_oct} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_terpasang`}>Terpasang</Label>
          <Input id={`${eye.toLowerCase()}_terpasang`} value={data.terpasang} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_over_refraction`}>Over Refraction</Label>
          <Input id={`${eye.toLowerCase()}_over_refraction`} value={data.over_refraction} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_vdc`}>VDC</Label>
          <Input id={`${eye.toLowerCase()}_vdc`} value={data.vdc} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_custom`}>Custom</Label>
          <Input id={`${eye.toLowerCase()}_custom`} value={data.custom} onChange={handleChange} className="h-8" />
        </div>
        <div>
          <Label htmlFor={`${eye.toLowerCase()}_rx`}>Rx</Label>
          <Input id={`${eye.toLowerCase()}_rx`} value={data.rx} onChange={handleChange} className="h-8" />
        </div>
        <div className="col-span-full">
          <Label htmlFor={`${eye.toLowerCase()}_comments`}>Comments</Label>
          <Textarea id={`${eye.toLowerCase()}_comments`} value={data.comments} onChange={handleChange} className="min-h-[40px] py-1" />
        </div>
      </div>
    </div>
  );
};

export default SingleRoseK2XLFittingProcedureForm;