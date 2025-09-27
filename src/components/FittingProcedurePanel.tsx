import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SingleFittingProcedureForm, { SingleFittingProcedureData } from './SingleFittingProcedureForm';

interface FittingProcedurePanelProps {
  eye: 'OD' | 'OS';
  procedures: SingleFittingProcedureData[];
  onUpdateProcedures: (updatedProcedures: SingleFittingProcedureData[]) => void;
}

const FittingProcedurePanel: React.FC<FittingProcedurePanelProps> = ({
  eye,
  procedures,
  onUpdateProcedures,
}) => {
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (procedures.length > 0 && !activeTab) {
      setActiveTab(procedures[0].id);
    } else if (procedures.length > 0 && !procedures.some(p => p.id === activeTab)) {
      // If active tab was deleted, switch to the first available tab
      setActiveTab(procedures[0].id);
    } else if (procedures.length === 0) {
      setActiveTab('');
    }
  }, [procedures, activeTab]);

  const generateNewProcedure = (): SingleFittingProcedureData => ({
    id: `${eye.toLowerCase()}-proc-${Date.now()}`,
    base_curve: '',
    central_fit_1mm: '',
    nafl_superior: '',
    nafl_inferior: '',
    nafl_temporal: '',
    nafl_nasal: '',
    dia_location_movement: '',
    oct: '',
    terpasang: '',
    over_refraction: '',
    vdc: '',
    custom: '',
    r: '',
  });

  const handleAddProcedure = () => {
    const newProcedure = generateNewProcedure();
    const updatedProcedures = [...procedures, newProcedure];
    onUpdateProcedures(updatedProcedures);
    setActiveTab(newProcedure.id); // Switch to the new tab
  };

  const handleUpdateProcedure = (updatedData: SingleFittingProcedureData) => {
    const updatedProcedures = procedures.map((p) =>
      p.id === updatedData.id ? updatedData : p
    );
    onUpdateProcedures(updatedProcedures);
  };

  const handleDeleteProcedure = (idToDelete: string) => {
    const updatedProcedures = procedures.filter((p) => p.id !== idToDelete);
    onUpdateProcedures(updatedProcedures);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{eye} Fitting Procedures</h3>
        <Button type="button" onClick={handleAddProcedure} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Base Curve
        </Button>
      </div>
      {procedures.length === 0 ? (
        <p className="text-muted-foreground text-sm">No fitting procedures added for {eye} yet. Click "Add Base Curve" to start.</p>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-auto p-1 gap-1">
            {procedures.map((proc) => (
              <TabsTrigger key={proc.id} value={proc.id} className="justify-start">
                {proc.base_curve || `New ${eye} BC`}
              </TabsTrigger>
            ))}
          </TabsList>
          {procedures.map((proc) => (
            <TabsContent key={proc.id} value={proc.id} className="mt-4">
              <SingleFittingProcedureForm
                eye={eye}
                data={proc}
                onChange={handleUpdateProcedure}
                onDelete={handleDeleteProcedure}
                canDelete={procedures.length > 1} // Allow deleting if more than one procedure exists
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default FittingProcedurePanel;