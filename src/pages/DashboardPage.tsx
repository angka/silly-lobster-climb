import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Search, Download, Upload, Shield, Settings } from 'lucide-react';
import PatientForm, { PatientFormData } from '@/components/PatientForm';
import Layout from '@/components/Layout';
import { showSuccess, showError } from '@/utils/toast';
import PatientCategoryTabs from '@/components/PatientCategoryTabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FittingSessionFormData } from '@/components/FittingSessionForm';
import { RGPFittingSessionFormData } from '@/components/RGPFittingSessionForm';
import { FollowUpSessionFormData } from '@/components/FollowUpSessionForm';
import FollowUpCalendar from '@/components/FollowUpCalendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';

interface Patient extends PatientFormData {
  id: string;
}

interface Session {
  id: string;
  patientId: string;
  type: 'Fitting' | 'Follow-up';
  lensType?: 'ROSE_K2_XL' | 'RGP';
  date: Date;
  data: FittingSessionFormData | FollowUpSessionFormData | RGPFittingSessionFormData;
}

interface PatientBackupData {
  patient: Patient;
  sessions: Session[];
}

const parseCsvRow = (row: string): string[] => {
  const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]*))(?:,|$)/g;
  const matches = Array.from(row.matchAll(regex));
  return matches.map(match => {
    if (match[1] !== undefined) {
      return match[1].replace(/""/g, '"');
    }
    return match[2] || '';
  });
};

const DashboardPage: React.FC = () => {
  const { role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'RGP' | 'Scleral lens'>('All');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputJsonRef = useRef<HTMLInputElement>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        const parsed = JSON.parse(storedPatients);
        if (Array.isArray(parsed)) {
          setPatients(parsed.filter(p => p !== null).map((p: Patient) => ({
            ...p,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
            dateOfVisit: p.dateOfVisit ? new Date(p.dateOfVisit) : undefined,
          })));
        }
      }
    } catch (error) {
      console.error("Failed to load patients from localStorage:", error);
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
      const storedSessions = localStorage.getItem('sessions');
      if (storedSessions) {
        try {
          let existingSessions: Session[] = JSON.parse(storedSessions).map((s: any) => ({
            ...s,
            date: new Date(s.date),
          }));
          existingSessions = existingSessions.filter(s => s.patientId !== patientToDelete.id);
          localStorage.setItem('sessions', JSON.stringify(existingSessions));
        } catch (e) {
          console.error("Failed to update sessions after patient deletion:", e);
        }
      }

      setPatients((prevPatients) =>
        prevPatients.filter((p) => p.id !== patientToDelete.id)
      );
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
      showSuccess('Patient and all associated sessions deleted successfully!');
    }
  };

  const handleExportPatients = () => {
    try {
      const storedPatients = localStorage.getItem('patients');
      const storedSessions = localStorage.getItem('sessions');

      const allPatients: Patient[] = storedPatients ? JSON.parse(storedPatients).map((p: Patient) => ({
        ...p,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
        dateOfVisit: p.dateOfVisit ? new Date(p.dateOfVisit) : undefined,
      })) : [];

      const allSessions: Session[] = storedSessions ? JSON.parse(storedSessions).map((s: any) => ({
        ...s,
        date: new Date(s.date),
      })) : [];

      const backupData: PatientBackupData[] = allPatients.map(patient => ({
        patient: patient,
        sessions: allSessions.filter(session => session.patientId === patient.id),
      }));

      if (backupData.length > 0) {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patients_and_sessions_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess('All patient and session data exported to JSON successfully!');
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
      csvRows.push(headers.join(','));

      for (const patient of patients) {
        const values = [
          patient.id,
          `"${patient.name.replace(/"/g, '""')}"`,
          patient.medicalRecordNumber,
          `"${(patient.diagnosis || '').replace(/"/g, '""')}"`,
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedBackupData: PatientBackupData[] = JSON.parse(content);

        if (!Array.isArray(importedBackupData) || !importedBackupData.every(item => item.patient && item.sessions !== undefined)) {
          showError('Invalid file format.');
          return;
        }

        const allImportedPatients: Patient[] = [];
        const allImportedSessions: Session[] = [];

        importedBackupData.forEach(item => {
          const patient: Patient = {
            ...item.patient,
            dateOfBirth: item.patient.dateOfBirth ? new Date(item.patient.dateOfBirth) : undefined,
            dateOfVisit: item.patient.dateOfVisit ? new Date(item.patient.dateOfVisit) : undefined,
          };
          allImportedPatients.push(patient);

          item.sessions.forEach((session: Session) => {
            const processedSession: Session = {
              ...session,
              date: new Date(session.date),
              data: {
                ...session.data,
                date: new Date(session.data.date),
                nextFollowUpDate: session.data.nextFollowUpDate ? new Date(session.data.nextFollowUpDate) : undefined
              } as any,
            };
            allImportedSessions.push(processedSession);
          });
        });

        localStorage.setItem('patients', JSON.stringify(allImportedPatients));
        localStorage.setItem('sessions', JSON.stringify(allImportedSessions));
        setPatients(allImportedPatients);
        showSuccess('Data imported successfully!');
      } catch (error) {
        showError('Failed to import data.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 1) {
          showError('CSV file is empty.');
          return;
        }

        const headers = parseCsvRow(lines[0]).map(h => h.trim().replace(/\s/g, ''));
        const importedPatients: Patient[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvRow(lines[i]);
          if (values.length !== headers.length) continue;

          const patientData: Partial<Patient> = {};
          headers.forEach((header, index) => {
            const value = values[index].trim();
            switch (header) {
              case 'ID': patientData.id = value; break;
              case 'Name': patientData.name = value; break;
              case 'MedicalRecordNumber': patientData.medicalRecordNumber = value; break;
              case 'Diagnosis': patientData.diagnosis = value; break;
              case 'DateofBirth': patientData.dateOfBirth = value ? new Date(value) : undefined; break;
              case 'Gender': patientData.gender = value as any; break;
              case 'ContactNumber': patientData.contactNumber = value; break;
              case 'DoctorName': patientData.doctorName = value; break;
              case 'Address': patientData.address = value; break;
              case 'LensCategory': patientData.lensCategory = value as any; break;
              case 'Notes': patientData.notes = value; break;
              case 'DateofVisit': patientData.dateOfVisit = value ? new Date(value) : undefined; break;
            }
          });

          if (patientData.id && patientData.name && patientData.medicalRecordNumber) {
            importedPatients.push(patientData as Patient);
          }
        }

        setPatients(importedPatients);
        showSuccess('CSV imported successfully!');
      } catch (error) {
        showError('Failed to import CSV.');
      }
    };
    reader.readAsText(file);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesCategory = selectedCategory === 'All' || patient.lensCategory === selectedCategory;
    const matchesSearch = searchQuery.toLowerCase() === '' ||
                          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = () => {
    switch (selectedCategory) {
      case 'All': return patients.length;
      case 'RGP': return patients.filter(p => p.lensCategory === 'RGP').length;
      case 'Scleral lens': return patients.filter(p => p.lensCategory === 'Scleral lens').length;
      default: return 0;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with Categories and Calendar */}
        <div className="lg:w-1/4 space-y-6">
          {role === 'admin' && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button className="w-full" size="sm">
                    <Settings className="mr-2 h-4 w-4" /> Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <PatientCategoryTabs currentCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </Card>
          
          <FollowUpCalendar />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold">
              Patient List ({selectedCategory}) <span className="text-muted-foreground text-2xl">({getCategoryCount()})</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExportPatients} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> JSON
              </Button>
              <Button onClick={handleExportCsv} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Input type="file" accept=".json" ref={fileInputJsonRef} onChange={handleImportJson} className="hidden" />
              <Button onClick={() => fileInputJsonRef.current?.click()} variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" /> JSON
              </Button>
              <Input type="file" accept=".csv" ref={fileInputCsvRef} onChange={handleImportCsv} className="hidden" />
              <Button onClick={() => fileInputCsvRef.current?.click()} variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
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

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Lens Category</TableHead>
                  <TableHead>Date of Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No patients found.
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
                      <TableCell>{patient.diagnosis || 'N/A'}</TableCell>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-bold">{patientToDelete?.name}</span> and all their sessions.
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