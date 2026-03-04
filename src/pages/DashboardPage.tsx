import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Search, Download, Upload, Shield, Settings, User, KeyRound, Loader2, Database, CheckSquare, X } from 'lucide-react';
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
  profiles?: {
    email: string;
  };
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
  const [availableOwners, setAvailableOwners] = useState<{ id: string; email: string }[]>([]);
  
  // Bulk selection state
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [isBulkReassignOpen, setIsBulkReassignOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkNewOwnerId, setBulkNewOwnerId] = useState('');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const fileInputJsonRef = useRef<HTMLInputElement>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*, profiles(email)')
        .order('name');

      if (error) throw error;
      
      setPatients(data.map((p: any) => ({
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

  const fetchProfiles = async () => {
    if (role !== 'admin') return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');
      
      if (error) throw error;
      setAvailableOwners(data || []);
    } catch (error: any) {
      console.error("Error fetching profiles for owner selection:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatients();
      if (role === 'admin') fetchProfiles();
    }
  }, [user, role]);

  const handleAddPatient = async (data: PatientFormData) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('patients').insert({
        user_id: data.user_id || user.id,
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
          user_id: data.user_id || editingPatient.user_id,
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

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedPatientIds.length === filteredPatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(filteredPatients.map(p => p.id));
    }
  };

  const handleToggleSelectPatient = (id: string) => {
    setSelectedPatientIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedPatientIds.length === 0) return;
    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .in('id', selectedPatientIds);

      if (error) throw error;

      showSuccess(`${selectedPatientIds.length} patients deleted successfully!`);
      setSelectedPatientIds([]);
      setIsBulkDeleteOpen(false);
      fetchPatients();
    } catch (error: any) {
      showError(error.message || 'Failed to delete patients');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkReassign = async () => {
    if (selectedPatientIds.length === 0 || !bulkNewOwnerId) return;
    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ user_id: bulkNewOwnerId, updated_at: new Date().toISOString() })
        .in('id', selectedPatientIds);

      if (error) throw error;

      showSuccess(`${selectedPatientIds.length} patients reassigned successfully!`);
      setSelectedPatientIds([]);
      setIsBulkReassignOpen(false);
      setBulkNewOwnerId('');
      fetchPatients();
    } catch (error: any) {
      showError(error.message || 'Failed to reassign patients');
    } finally {
      setIsBulkActionLoading(false);
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

        const idMap: Record<string, string> = {};
        
        for (const p of content.patients) {
          const { id: oldId, created_at, updated_at, ...patientData } = p;
          const finalPatientData = {
            ...patientData,
            user_id: patientData.user_id || user.id
          };

          const { data: newPatient, error: pError } = await supabase
            .from('patients')
            .insert(finalPatientData)
            .select()
            .single();
          
          if (pError) throw pError;
          idMap[oldId] = newPatient.id;
        }

        if (content.sessions && Array.isArray(content.sessions)) {
          const sessionsToInsert = content.sessions
            .filter((s: any) => idMap[s.patient_id])
            .map((s: any) => {
              const { id, created_at, ...sessionData } = s;
              return {
                ...sessionData,
                user_id: sessionData.user_id || user.id,
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

    const headers = ['Name', 'MRN', 'Hospital', 'Diagnosis', 'DOB', 'Gender', 'Phone', 'Doctor', 'Address', 'Category', 'Notes', 'VisitDate', 'CreatedByEmail'];
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
      p.dateOfVisit ? p.dateOfVisit.toISOString().split('T')[0] : '',
      `"${(p.profiles?.email || 'Unknown').replace(/"/g, '""')}"`
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
                  <PatientForm 
                    onSubmit={handleAddPatient} 
                    onCancel={() => setIsNewPatientDialogOpen(false)} 
                    isAdmin={role === 'admin'}
                    availableOwners={availableOwners}
                  />
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

          {/* Bulk Actions Bar */}
          {role === 'admin' && selectedPatientIds.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">
                  {selectedPatientIds.length} patient{selectedPatientIds.length > 1 ? 's' : ''} selected
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedPatientIds([])}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => setIsBulkReassignOpen(true)}
                >
                  <User className="h-4 w-4 mr-1" /> Reassign
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-8"
                  onClick={() => setIsBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {role === 'admin' && (
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedPatientIds.length === filteredPatients.length && filteredPatients.length > 0}
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>Name</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Lens Category</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={role === 'admin' ? 8 : 7} className="h-24 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={role === 'admin' ? 8 : 7} className="h-24 text-center text-muted-foreground">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className={selectedPatientIds.includes(patient.id) ? "bg-primary/5" : ""}>
                      {role === 'admin' && (
                        <TableCell>
                          <Checkbox 
                            checked={selectedPatientIds.includes(patient.id)}
                            onCheckedChange={() => handleToggleSelectPatient(patient.id)}
                            aria-label={`Select ${patient.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <Link to={`/patients/${patient.id}`} className="hover:underline">
                          {patient.name}
                        </Link>
                      </TableCell>
                      <TableCell>{patient.medicalRecordNumber}</TableCell>
                      <TableCell>{patient.hospital || 'N/A'}</TableCell>
                      <TableCell>{patient.diagnosis || 'N/A'}</TableCell>
                      <TableCell>{patient.lensCategory || 'N/A'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {patient.profiles?.email || 'Unknown'}
                      </TableCell>
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

      {/* Bulk Reassign Dialog */}
      <Dialog open={isBulkReassignOpen} onOpenChange={setIsBulkReassignOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Reassign Ownership</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              You are reassigning <span className="font-bold text-foreground">{selectedPatientIds.length}</span> patient records to a new owner.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulk-owner">New Owner</Label>
              <Select value={bulkNewOwnerId} onValueChange={setBulkNewOwnerId}>
                <SelectTrigger id="bulk-owner">
                  <SelectValue placeholder="Select new owner" />
                </SelectTrigger>
                <SelectContent>
                  {availableOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkReassignOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkReassign} 
              disabled={!bulkNewOwnerId || isBulkActionLoading}
            >
              {isBulkActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reassign All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-bold text-foreground">{selectedPatientIds.length}</span> selected patient records and all their associated sessions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isBulkActionLoading}
            >
              {isBulkActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              isAdmin={role === 'admin'}
              availableOwners={availableOwners}
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