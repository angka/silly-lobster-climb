import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import PatientForm, { PatientFormData } from '@/components/PatientForm';
import Layout from '@/components/Layout';
import { showSuccess } from '@/utils/toast';

interface Patient extends PatientFormData {
  id: string;
}

const DashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);

  useEffect(() => {
    // Load patients from localStorage on component mount
    const storedPatients = localStorage.getItem('patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients).map((p: Patient) => ({
        ...p,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
      })));
    }
  }, []);

  useEffect(() => {
    // Save patients to localStorage whenever the patients state changes
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  const handleAddPatient = (data: PatientFormData) => {
    const newPatient: Patient = {
      id: `patient-${Date.now()}`, // Simple unique ID
      ...data,
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    setIsNewPatientDialogOpen(false);
    showSuccess('New patient added successfully!');
  };

  return (
    <Layout showLogout={true}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient List</h1>
        <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto"> {/* Added max-h and overflow-y-auto */}
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm onSubmit={handleAddPatient} onCancel={() => setIsNewPatientDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No patients added yet. Click "Add New Patient" to get started!</p>
        ) : (
          patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link to={`/patients/${patient.id}`} className="hover:underline">
                    {patient.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>DOB: {patient.dateOfBirth ? patient.dateOfBirth.toLocaleDateString() : 'N/A'}</p>
                <p>Gender: {patient.gender}</p>
                <p>Contact: {patient.contactNumber || 'N/A'}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;