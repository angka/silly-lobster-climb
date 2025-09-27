import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MinusCircle } from 'lucide-react';

// Define the structure for a single OD or OS fitting procedure
export interface SingleFittingProcedureData {
  id: string; // Unique ID for this specific procedure
  base_curve: string;
  central_fit_1mm: string;
  nafl_superior: string;
  nafl_inferior: string;
  nafl_temporal: string;
  nafl_nasal: string;
  dia_location_movement: string;
  oct: string;
  terpasang: string;
  over_refraction: string;
  vdc: string;
  custom: string;
  r: string;
}

interface SingleFittingProcedureFormProps {
  eye: 'OD' | 'OS';
  data: SingleFittingProcedureData;
  onChange: (updatedData: SingleFittingProcedureData) => void;
  onDelete?: (id: string) => void;
  canDelete: boolean;
}

const SingleFittingProcedureForm: React.FC<SingleFittingProcedureFormProps> = ({
  eye,
  data,
  onChange,
  onDelete,
  canDelete,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    onChange({ ...data, [id]: value });
  };

  return (
    <div className="space-y-3 p-4 border rounded-md bg-muted/20">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold">Base Curve: {data.base_curve || 'New'}</h4>
        {canDelete && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(data.id)}
          >
            <MinusCircle className="h-4 w-4 mr-2" /> Remove
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_base_curve`}>BASE CURVE</Label>
        <Input
          id="base_curve"
          value={data.base_curve}
          onChange={handleChange}
          placeholder="e.g., 6.9 / 7.0"
        />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_central_fit_1mm`}>CENTRAL FIT</Label>
        <Input id="central_fit_1mm" value={data.central_fit_1mm} onChange={handleChange} />
      </div>
      <h4 className="font-medium mt-4">EDGE LIFT (NaFL)</h4>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_nafl_superior`}>Superior</Label>
        <Input id="nafl_superior" value={data.nafl_superior} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_nafl_inferior`}>Inferal</Label>
        <Input id="nafl_inferior" value={data.nafl_inferior} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_nafl_temporal`}>Temporal</Label>
        <Input id="nafl_temporal" value={data.nafl_temporal} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_nafl_nasal`}>Nasal</Label>
        <Input id="nafl_nasal" value={data.nafl_nasal} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_dia_location_movement`}>DIA/LOCATION/MOVEMENT</Label>
        <Textarea id="dia_location_movement" value={data.dia_location_movement} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_oct`}>OCT</Label>
        <Input id="oct" value={data.oct} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_terpasang`}>TERPASANG</Label>
        <Input id="terpasang" value={data.terpasang} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_over_refraction`}>OVER REFRACTION</Label>
        <Input id="over_refraction" value={data.over_refraction} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_vdc`}>VDC</Label>
        <Input id="vdc" value={data.vdc} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_custom`}>CUSTOM</Label>
        <Input id="custom" value={data.custom} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor={`${eye.toLowerCase()}_r`}>R/</Label>
        <Input id="r" value={data.r} onChange={handleChange} />
      </div>
    </div>
  );
};

export default SingleFittingProcedureForm;