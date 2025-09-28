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

// Helper function to parse a single CSV row, handling quoted fields
const parseCsvRow = (row: string): string[] => {
  const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]*))(?:,|$)/g;
  const matches = Array.from(row.matchAll(regex));
  return matches.map(match => {
    if (match[1] !== undefined) {
      return match[1].replace(/""/g, '"'); // Quoted field, unescape "" to "
    }
    return match[2] || ''; // Unquoted field or empty
  });
};

const DashboardPage: React.FC = () => { // Removed DashboardPageProps and onLogout
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'RGP' | 'Scleral lens'>('All');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputJsonRef = useRef<HTMLInputElement>(null); // For JSON import
  const fileInputCsvRef = useRef<HTMLInputElement>(null); // For CSV import

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
        showSuccess('Patient data exported to JSON successfully!');
      } else {
        showError('No patient data found to export.');
      }
    } catch (error) {
      console.error('Failed to export patient data:', error);
      showError('Failed to export patient data.');
    }
  };

  const handleExportCsv = () => {
    try {
      if (patients.length === 0) {
        showError('No patient data found to export to CSV.');
        return;
      }

      const headers = [
        'ID', 'Name', 'Medical Record Number', 'Diagnosis', 'Date of Birth', 'Gender',
        'Contact Number', 'Doctor Name', 'Address', 'Lens Category', 'Notes', 'Date of Visit'
      ];

      const csvRows = [];
      csvRows.push(headers.join(',')); // Add headers

      for (const patient of patients) {
        const values = [
          patient.id,
          `"${patient.name.replace(/"/g, '""')}"`, // Escape double quotes
          patient.medicalRecordNumber,
          `"${(patient.diagnosis || '').replace(/"/g, '""')}"`, // New: Diagnosis
          patient.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : '',
          patient.gender || '',
          patient.contactNumber || '',
          `"${patient.doctorName.replace(/"/g, '""')}"`,
          `"${patient.address.replace(/"/g, '""')}"`,
          patient.lensCategory || '',
          `"${(patient.notes || '').replace(/"/g, '""')}"`,
          patient.dateOfVisit ? patient.dateOfVisit.toISOString().split('T')[0] : '',
        ];
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients_backup_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Patient data exported to CSV successfully!');
    } catch (error) {
      console.error('Failed to export patient data to CSV:', error);
      showError('Failed to export patient data to CSV.');
    }
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== ''); // Split by newline and filter empty lines

        if (lines.length < 1) {
          showError('CSV file is empty or invalid.');
          return;
        }

        const headers = parseCsvRow(lines[0]).map(h => h.trim().replace(/\s/g, '')); // Parse header row and normalize
        const importedPatients: Patient[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvRow(lines[i]);
          if (values.length !== headers.length) {
            console.warn(`Skipping row ${i + 1} due to header/value mismatch.`);
            continue; // Skip malformed rows
          }

          const patientData: Partial<Patient> = {};
          headers.forEach((header, index) => {
            const value = values[index].trim();

            // Map CSV headers to PatientFormData keys
            switch (header) {
              case 'ID': patientData.id = value; break;
              case 'Name': patientData.name = value; break;
              case 'MedicalRecordNumber': patientData.medicalRecordNumber = value; break;
              case 'Diagnosis': patientData.diagnosis = value; break; // New: Diagnosis
              case 'DateofBirth': patientData.dateOfBirth = value ? new Date(value) : undefined; break;
              case 'Gender': patientData.gender = value as PatientFormData['gender']; break;
              case 'ContactNumber': patientData.contactNumber = value; break;
              case 'DoctorName': patientData.doctorName = value; break;
              case 'Address': patientData.address = value; break;
              case 'LensCategory': patientData.lensCategory = value as PatientFormData['lensCategory']; break;
              case 'Notes': patientData.notes = value; break;
              case 'DateofVisit': patientData.dateOfVisit = value ? new Date(value) : undefined; break;
              default:
                // Ignore unknown headers
                break;
            }
          });

          // Basic validation for required fields
          if (patientData.id && patientData.name && patientData.medicalRecordNumber) {
            importedPatients.push(patientData as Patient);
          } else {
            console.warn(`Skipping patient due to missing required fields in row ${i + 1}: ${JSON.stringify(patientData)}`);
          }
        }

        if (importedPatients.length === 0 && lines.length > 1) {
          showError('No valid patient data found in the CSV file after parsing.');
          return;
        }

        setPatients(importedPatients);
        showSuccess('Patient data imported from CSV successfully!');
      } catch (error) {
        console.error('Failed to import patient data from CSV:', error);
        showError('Failed to import patient data from CSV. Please ensure it is a valid CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesCategory = selectedCategory === 'All' || patient.lensCategory === selectedCategory;
    const matchesSearch = searchQuery.toLowerCase() === '' ||
                          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())); // Search by diagnosis

    return matchesCategory && matchesSearch;
  });

  // Calculate total patients for each category
  const totalAllPatients = patients.length;
  const totalRGPPatients = patients.filter(p => p.lensCategory === 'RGP').length;
  const totalScleralLensPatients = patients.filter(p => p.lensCategory === 'Scleral lens').length;

  const getCategoryCount = () => {
    switch (selectedCategory) {
      case 'All':
        return totalAllPatients;
      case 'RGP':
        return totalRGPPatients;
      case 'Scleral lens':
        return totalScleralLensPatients;
      default:
        return 0;
    }
  };

  return (
    <Layout> {/* Removed showLogout and onLogout props */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel for Tabs */}
        <div className="md:w-1/4 lg:w-1/5 p-4 bg-card rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <PatientCategoryTabs currentCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        {/* Right Panel for Patient List */}
        <div className="md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              Patient List ({selectedCategory}) <span className="text-muted-foreground text-2xl">({getCategoryCount()})</span>
            </h1>
            <div className="flex space-x-2"> {/* Group buttons */}
              <Button onClick={handleExportPatients} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </Button>
              <Button onClick={handleExportCsv} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Input
                type="file"
                accept=".json"
                ref={fileInputJsonRef}
                onChange={handleImportJson}
                className="hidden"
              />
              <Button onClick={() => fileInputJsonRef.current?.click()} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import JSON
              </Button>
              <Input
                type="file"
                accept=".csv"
                ref={fileInputCsvRef}
                onChange={handleImportCsv}
                className="hidden"
              />
              <Button onClick={() => fileInputCsvRef.current?.click()} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import CSV
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
              placeholder="Search patients by name, MRN, or diagnosis..."
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
                  <TableHead>Diagnosis</TableHead> {/* New column */}
                  <TableHead>Lens Category</TableHead>
                  <TableHead>Date of Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
                      <TableCell>{patient.diagnosis || 'N/A'}</TableCell> {/* Display diagnosis */}
                      <TableCell>{patient.lensCategory || 'N/A'}</TableCell>
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