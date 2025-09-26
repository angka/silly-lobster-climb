import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import PatientForm, { PatientFormData } from '@/components/PatientForm';
import Layout from '@/components/Layout';
import { showSuccess } from '@/utils/toast';
import PatientCategoryTabs from '@/components/PatientCategoryTabs'; // Import the new component

interface Patient extends PatientFormData {
  id: string;
}

const DashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'RGP' | 'Scleral lens'>('All'); // New state for category

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

  const filteredPatients = patients.filter(patient => {
    if (selectedCategory === 'All') {
      return true;
    }
    return patient.lensCategory === selectedCategory;
  });

  return (
    <Layout showLogout={true}>
      <div className="flex flex-col md:flex-row gap-6"> {/* Flex container for sidebar and main content */}
        {/* Left Panel for Tabs */}
        <div className="md:w-1/4 lg:w-1/5 p-4 bg-card rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <PatientCategoryTabs currentCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        {/* Right Panel for Patient List */}
        <div className="md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Patient List ({selectedCategory})</h1>
            <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                </DialogHeader>
                <PatientForm onSubmit={handleAddPatient} onCancel={() => setIsNewPatientDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">No {selectedCategory !== 'All' ? selectedCategory + ' ' : ''}patients added yet. Click "Add New Patient" to get started!</p>
            ) : (
              filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <Link to={`/patients/${patient.id}`} className="hover:underline">
                        {patient.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                        <p>Category: {patient.lensCategory || 'N/A'}</p> {/* Display category */}
                        <p>DOB: {patient.dateOfBirth ? patient.dateOfBirth.toLocaleDateString() : 'N/A'}</p>
                        <p>Gender: {patient.gender}</p>
                        <p>Contact: {patient.contactNumber || 'N/A'}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;