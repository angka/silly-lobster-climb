import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Search, Download, Upload } from 'lucide-react';
import PatientForm, { PatientFormData } from '@/components/PatientForm';
import Layout from '@/components/Layout';
import { showSuccess, showError } from '@/utils/toast';
import PatientCategoryTabs from '@/components/PatientCategoryTabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Patient extends PatientFormData {
  id: string;
}

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'RGP' | 'Scleral lens'>('All');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedPatients = localStorage.getItem('patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients).map((p: Patient) => ({
        ...p,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
        dateOfVisit: p.dateOfVisit ? new Date(p.dateOfVisit) : undefined,
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  const handleAddPatient = (data: PatientFormData) => {
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      ...data,
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    setIsNewPatientDialogOpen(false);
    showSuccess('New patient added successfully!');
  };

  const handleEditPatient = (data: PatientFormData) => {
    if (editingPatient) {
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === editingPatient.id ? { ...p, ...data } : p
        )
      );
      setIsEditDialogOpen(false);
      setEditingPatient(null);
      showSuccess('Patient information updated successfully!');
    } else {
      showError('Error: No patient selected for editing.');
    }
  };

  const handleDeletePatient = () => {
    if (patientToDelete) {
      setPatients((prevPatients) =>
        prevPatients.filter((p) => p.id !== patientToDelete.id)
      );
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
      showSuccess('Patient deleted successfully!');
    }
  };

  const handleExportPatients = () => {
    try {
      const data = localStorage.getItem('patients');
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patients_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess('Patient data exported successfully!');
      } else {
        showError('No patient data found to export.');
      }
    } catch (error) {
      console.error('Failed to export patient data:', error);
      showError('Failed to export patient data.');
    }
  };

  const handleImportPatients = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData: Patient[] = JSON.parse(content);

        // Basic validation for imported data structure
        if (!Array.isArray(importedData) || !importedData.every(p => p.id && p.name && p.medicalRecordNumber)) {
          showError('Invalid file format. Please upload a valid patient JSON file.');
          return;
        }

        // Convert date strings back to Date objects
        const patientsWithDates = importedData.map(p => ({
          ...p,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
          dateOfVisit: p.dateOfVisit ? new Date(p.dateOfVisit) : undefined,
        }));

        setPatients(patientsWithDates);
        showSuccess('Patient data imported successfully!');
      } catch (error) {
        console.error('Failed to import patient data:', error);
        showError('Failed to import patient data. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesCategory = selectedCategory === 'All' || patient.lensCategory === selectedCategory;
    const matchesSearch = searchQuery.toLowerCase() === '' ||
                          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <Layout showLogout={true} onLogout={onLogout}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel for Tabs */}
        <div className="md:w-1/4 lg:w-1/5 p-4 bg-card rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <PatientCategoryTabs currentCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        {/* Right Panel for Patient List */}
        <div className="md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Patient List ({selectedCategory})</h1>
            <div className="flex space-x-2"> {/* Group buttons */}
              <Button onClick={handleExportPatients} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportPatients}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import Data
              </Button>
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
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search patients by name or medical record number..."
              className="pl-9 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Lens Category</TableHead> {/* New TableHead */}
                  <TableHead>Date of Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground"> {/* Adjusted colSpan */}
                      No {selectedCategory !== 'All' ? selectedCategory + ' ' : ''}patients found. {searchQuery && `for "${searchQuery}"`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        <Link to={`/patients/${patient.id}`} className="hover:underline">
                          {patient.name}
                        </Link>
                      </TableCell>
                      <TableCell>{patient.medicalRecordNumber}</TableCell>
                      <TableCell>{patient.lensCategory || 'N/A'}</TableCell> {/* New TableCell */}
                      <TableCell>{patient.dateOfVisit ? patient.dateOfVisit.toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPatient(patient);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit {patient.name}</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setPatientToDelete(patient);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete {patient.name}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              initialData={editingPatient}
              onSubmit={handleEditPatient}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingPatient(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Patient Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient
              <span className="font-bold"> {patientToDelete?.name} </span>
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DashboardPage;