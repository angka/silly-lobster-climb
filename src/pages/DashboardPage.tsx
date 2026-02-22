import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Search, Download, Upload, Shield, Settings, User, KeyRound, Loader2, Database } from 'lucide-react';
import PatientForm, { PatientFormData } from '@/components/PatientForm';
import Layout from '@/components/Layout';
import { showSuccess, showError } from '@/utils/toast';
import PatientCategoryTabs from '@/components/PatientCategoryTabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FollowUpCalendar from '@/components/FollowUpCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface Patient extends PatientFormData {
  id: string;
  user_id: string;
}

interface Session {
  id: string;
  patient_id: string;
  user_id: string;
  type: string;
  lens_type: string;
  date: string;
  data: any;
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
  const { user, role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'RGP' | 'Scleral lens'>('All');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputJsonRef = useRef<HTMLInputElement>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setPatients(data.map(p => ({
        ...p,
        dateOfBirth: p.date_of_birth ? new Date(p.date_of_birth) : undefined,
        dateOfVisit: p.date_of_visit ? new Date(p.date_of_visit) : undefined,
        lensCategory: p.lens_category,
        medicalRecordNumber: p.medical_record_number,
        contactNumber: p.contact_number,
        doctorName: p.doctor_name,
      })));
    } catch (error: any) {
      showError(error.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPatients();
  }, [user]);

  const handleAddPatient = async (data: PatientFormData) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('patients').insert({
        user_id: user.id,
        name: data.name,
        medical_record_number: data.medicalRecordNumber,
        hospital: data.hospital,
        diagnosis: data.diagnosis,
        date_of_birth: data.dateOfBirth?.toISOString().split('T')[0],
        gender: data.gender,
        contact_number: data.contactNumber,
        doctor_name: data.doctorName,
        address: data.address,
        lens_category: data.lensCategory,
        notes: data.notes,
        date_of_visit: data.dateOfVisit?.toISOString().split('T')[0],
      });

      if (error) throw error;
      
      showSuccess('New patient added successfully!');
      setIsNewPatientDialogOpen(false);
      fetchPatients();
    } catch (error: any) {
      showError(error.message || 'Failed to add patient');
    }
  };

  const handleEditPatient = async (data: PatientFormData) => {
    if (!editingPatient) return;
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          name: data.name,
          medical_record_number: data.medicalRecordNumber,
          hospital: data.hospital,
          diagnosis: data.diagnosis,
          date_of_birth: data.dateOfBirth?.toISOString().split('T')[0],
          gender: data.gender,
          contact_number: data.contactNumber,
          doctor_name: data.doctorName,
          address: data.address,
          lens_category: data.lensCategory,
          notes: data.notes,
          date_of_visit: data.dateOfVisit?.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPatient.id);

      if (error) throw error;

      showSuccess('Patient information updated successfully!');
      setIsEditDialogOpen(false);
      setEditingPatient(null);
      fetchPatients();
    } catch (error: any) {
      showError(error.message || 'Failed to update patient');
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientToDelete.id);

      if (error) throw error;

      showSuccess('Patient deleted successfully!');
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (error: any) {
      showError(error.message || 'Failed to delete patient');
    }
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*');
      if (patientsError) throw patientsError;

      const { data: sessionsData, error: sessionsError } = await supabase.from('sessions').select('*');
      if (sessionsError) throw sessionsError;

      const backup = {
        patients: patientsData,
        sessions: sessionsData,
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emr_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Full database backup exported successfully!');
    } catch (error: any) {
      showError('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportAllData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (!content.patients || !Array.isArray(content.patients)) {
          throw new Error('Invalid backup file format');
        }

        // 1. Import Patients
        // We'll map old IDs to new IDs to maintain session relationships
        const idMap: Record<string, string> = {};
        
        for (const p of content.patients) {
          const { id: oldId, created_at, updated_at, ...patientData } = p;
          const { data: newPatient, error: pError } = await supabase
            .from('patients')
            .insert({ ...patientData, user_id: user.id })
            .select()
            .single();
          
          if (pError) throw pError;
          idMap[oldId] = newPatient.id;
        }

        // 2. Import Sessions
        if (content.sessions && Array.isArray(content.sessions)) {
          const sessionsToInsert = content.sessions
            .filter((s: any) => idMap[s.patient_id]) // Only sessions for patients we just imported
            .map((s: any) => {
              const { id, created_at, ...sessionData } = s;
              return {
                ...sessionData,
                user_id: user.id,
                patient_id: idMap[s.patient_id]
              };
            });

          if (sessionsToInsert.length > 0) {
            const { error: sError } = await supabase.from('sessions').insert(sessionsToInsert);
            if (sError) throw sError;
          }
        }

        showSuccess('Database restored successfully!');
        fetchPatients();
      } catch (error: any) {
        showError('Import failed: ' + error.message);
      } finally {
        setIsImporting(false);
        if (fileInputJsonRef.current) fileInputJsonRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExportCsv = () => {
    if (patients.length === 0) {
      showError('No patient data to export.');
      return;
    }

    const headers = ['Name', 'MRN', 'Hospital', 'Diagnosis', 'DOB', 'Gender', 'Phone', 'Doctor', 'Address', 'Category', 'Notes', 'VisitDate'];
    const rows = patients.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.medicalRecordNumber,
      `"${(p.hospital || '').replace(/"/g, '""')}"`,
      `"${(p.diagnosis || '').replace(/"/g, '""')}"`,
      p.dateOfBirth ? p.dateOfBirth.toISOString().split('T')[0] : '',
      p.gender || '',
      p.contactNumber || '',
      `"${p.doctorName.replace(/"/g, '""')}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      p.lensCategory || '',
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      p.dateOfVisit ? p.dateOfVisit.toISOString().split('T')[0] : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Patients exported to CSV.');
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV is empty or invalid');

        const patientsToInsert = lines.slice(1).map(line => {
          const values = parseCsvRow(line);
          return {
            user_id: user.id,
            name: values[0],
            medical_record_number: values[1],
            hospital: values[2],
            diagnosis: values[3],
            date_of_birth: values[4] || null,
            gender: values[5],
            contact_number: values[6],
            doctor_name: values[7],
            address: values[8],
            lens_category: values[9],
            notes: values[10],
            date_of_visit: values[11] || null
          };
        });

        const { error } = await supabase.from('patients').insert(patientsToInsert);
        if (error) throw error;

        showSuccess(`${patientsToInsert.length} patients imported from CSV.`);
        fetchPatients();
      } catch (error: any) {
        showError('CSV Import failed: ' + error.message);
      } finally {
        setIsImporting(false);
        if (fileInputCsvRef.current) fileInputCsvRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesCategory = selectedCategory === 'All' || patient.lensCategory === selectedCategory;
    const matchesSearch = searchQuery.toLowerCase() === '' ||
                          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (patient.hospital && patient.hospital.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
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

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Data Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleExportAllData} disabled={isExporting}>
                  {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />} JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputJsonRef.current?.click()} disabled={isImporting}>
                  {isImporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />} JSON
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCsv}>
                  <Download className="h-3 w-3 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputCsvRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> CSV
                </Button>
              </div>
              <input type="file" ref={fileInputJsonRef} onChange={handleImportAllData} accept=".json" className="hidden" />
              <input type="file" ref={fileInputCsvRef} onChange={handleImportCsv} accept=".csv" className="hidden" />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> My Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button variant="outline" className="w-full" size="sm">
                  <KeyRound className="mr-2 h-4 w-4" /> Change Password
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <PatientCategoryTabs currentCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </Card>
          
          <FollowUpCalendar />
        </div>

        <div className="lg:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold">
              Patient List ({selectedCategory}) <span className="text-muted-foreground text-2xl">({filteredPatients.length})</span>
            </h1>
            <div className="flex flex-wrap gap-2">
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
              placeholder="Search patients by name, MRN, hospital, or diagnosis..."
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
                  <TableHead>Hospital</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Lens Category</TableHead>
                  <TableHead>Date of Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
                      <TableCell>{patient.hospital || 'N/A'}</TableCell>
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