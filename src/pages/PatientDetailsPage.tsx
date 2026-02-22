import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FittingSessionFormData } from '@/components/FittingSessionForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import FollowUpSessionForm, { FollowUpSessionFormData } from '@/components/FollowUpSessionForm';
import { RGPFittingSessionFormData } from '@/components/RGPFittingSessionForm';
import { supabase } from '@/integrations/supabase/client';
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

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [isSessionDeleteDialogOpen, setIsSessionDeleteDialogOpen] = useState(false);
  const [isFittingLensTypeSelectionOpen, setIsFittingLensTypeSelectionOpen] = useState(false);
  const [isFollowUpSessionDialogOpen, setIsFollowUpSessionDialogOpen] = useState(false);
  const [isFollowUpLensTypeSelectionOpen, setIsFollowUpLensTypeSelectionOpen] = useState(false);
  const [selectedFollowUpLensType, setSelectedFollowUpLensType] = useState<'ROSE_K2_XL' | 'RGP' | undefined>(undefined);
  const [editingFollowUpSession, setEditingFollowUpSession] = useState<FollowUpSessionFormData & { id: string, lensType?: 'ROSE_K2_XL' | 'RGP' } | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;

      setPatient({
        ...patientData,
        dateOfBirth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : undefined,
        dateOfVisit: patientData.date_of_visit ? new Date(patientData.date_of_visit) : undefined,
        lensCategory: patientData.lens_category,
        medicalRecordNumber: patientData.medical_record_number,
        contactNumber: patientData.contact_number,
        doctorName: patientData.doctor_name,
      });

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', id)
        .order('date', { ascending: false });

      if (sessionError) throw sessionError;

      setSessions(sessionData.map(s => ({
        id: s.id,
        patientId: s.patient_id,
        type: s.type as 'Fitting' | 'Follow-up',
        lensType: s.lens_type as 'ROSE_K2_XL' | 'RGP',
        date: new Date(s.date),
        data: s.data,
      })));
    } catch (error: any) {
      showError(error.message || 'Failed to fetch patient details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [id, user]);

  const handleStartFittingSession = () => setIsFittingLensTypeSelectionOpen(true);

  const handleSelectFittingLensType = (lensType: 'ROSE_K2_XL' | 'RGP') => {
    setIsFittingLensTypeSelectionOpen(false);
    navigate(`/patients/${id}/fitting-session?lensType=${lensType}`);
  };

  const handleStartFollowUpSession = () => {
    setEditingFollowUpSession(null);
    setSelectedFollowUpLensType(undefined);
    setIsFollowUpLensTypeSelectionOpen(true);
  };

  const handleSelectFollowUpLensType = (lensType: 'ROSE_K2_XL' | 'RGP') => {
    setSelectedFollowUpLensType(lensType);
    setIsFollowUpLensTypeSelectionOpen(false);
    setIsFollowUpSessionDialogOpen(true);
  };

  const handleSaveFollowUpSession = async (data: FollowUpSessionFormData) => {
    if (!patient || !user) return;
    try {
      const sessionPayload = {
        patient_id: patient.id,
        user_id: user.id,
        type: 'Follow-up',
        lens_type: selectedFollowUpLensType || editingFollowUpSession?.lensType,
        date: data.date.toISOString(),
        data: data,
      };

      if (editingFollowUpSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionPayload)
          .eq('id', editingFollowUpSession.id);
        if (error) throw error;
        showSuccess('Follow-up session updated successfully!');
      } else {
        const { error } = await supabase.from('sessions').insert(sessionPayload);
        if (error) throw error;
        showSuccess('New follow-up session added successfully!');
      }

      setIsFollowUpSessionDialogOpen(false);
      setEditingFollowUpSession(null);
      setSelectedFollowUpLensType(undefined);
      fetchData();
    } catch (error: any) {
      showError(error.message || 'Failed to save session');
    }
  };

  const handleViewSessionDetails = (sessionId: string, sessionType: 'Fitting' | 'Follow-up', lensType?: 'ROSE_K2_XL' | 'RGP') => {
    const path = sessionType === 'Fitting' ? 'fitting-session' : 'follow-up-session';
    navigate(`/patients/${id}/${path}?sessionId=${sessionId}${lensType ? `&lensType=${lensType}` : ''}`);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionToDelete.id);

      if (error) throw error;

      showSuccess('Session deleted successfully!');
      setIsSessionDeleteDialogOpen(false);
      setSessionToDelete(null);
      fetchData();
    } catch (error: any) {
      showError(error.message || 'Failed to delete session');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!patient) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{patient.name}</CardTitle>
                <CardDescription>Medical Record Number: {patient.medicalRecordNumber}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-muted-foreground">Hospital</p><p className="text-base">{patient.hospital || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Diagnosis</p><p className="text-base">{patient.diagnosis || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Date of Birth</p><p className="text-base">{patient.dateOfBirth ? format(patient.dateOfBirth, 'PPP') : 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Gender</p><p className="text-base">{patient.gender || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Contact Number</p><p className="text-base">{patient.contactNumber || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Doctor's Name</p><p className="text-base">{patient.doctorName || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Address</p><p className="text-base">{patient.address || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Lens Category</p><p className="text-base">{patient.lensCategory || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Last Visit</p><p className="text-base">{patient.dateOfVisit ? format(patient.dateOfVisit, 'PPP') : 'N/A'}</p></div>
                <div className="md:col-span-2"><p className="text-sm font-medium text-muted-foreground">Notes</p><p className="text-base whitespace-pre-wrap">{patient.notes || 'No notes.'}</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Past fitting and follow-up sessions for this patient.</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground">No sessions recorded for this patient yet.</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Lens Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{format(session.date, 'PPP')}</TableCell>
                            <TableCell>{session.type}</TableCell>
                            <TableCell>{session.lensType || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewSessionDetails(session.id, session.type, session.lensType)}>View Details</Button>
                                <Button variant="destructive" size="sm" onClick={() => { setSessionToDelete(session); setIsSessionDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader><CardTitle>Start New Session</CardTitle><CardDescription>Choose the type of session for this patient.</CardDescription></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button className="flex-1" onClick={handleStartFittingSession}>Start Fitting Session</Button>
                <Button className="flex-1" variant="secondary" onClick={handleStartFollowUpSession}>Start Follow-up Session</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={isSessionDeleteDialogOpen} onOpenChange={setIsSessionDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the <span className="font-bold">{sessionToDelete?.type} session from {sessionToDelete?.date ? format(sessionToDelete.date, 'PPP') : 'this date'}</span> and remove its data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isFittingLensTypeSelectionOpen} onOpenChange={setIsFittingLensTypeSelectionOpen}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Select Lens Type for Fitting</DialogTitle><DialogDescription>Choose the type of lens for this fitting session.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><Button onClick={() => handleSelectFittingLensType('ROSE_K2_XL')}>ROSE K2 XL</Button><Button variant="secondary" onClick={() => handleSelectFittingLensType('RGP')}>RGP</Button></div><DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={isFollowUpLensTypeSelectionOpen} onOpenChange={setIsFollowUpLensTypeSelectionOpen}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Select Lens Type for Follow-up</DialogTitle><DialogDescription>Choose the type of lens this follow-up session is for.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><Button onClick={() => handleSelectFollowUpLensType('ROSE_K2_XL')}>ROSE K2 XL</Button><Button variant="secondary" onClick={() => handleSelectFollowUpLensType('RGP')}>RGP</Button></div><DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={isFollowUpSessionDialogOpen} onOpenChange={setIsFollowUpSessionDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingFollowUpSession ? 'Edit Follow-up Session' : 'Start New Follow-up Session'}</DialogTitle><DialogDescription>{editingFollowUpSession ? 'Edit the details of this follow-up session.' : 'Enter the details for the new follow-up session.'}</DialogDescription></DialogHeader>
          {patient && (selectedFollowUpLensType || editingFollowUpSession) && (
            <FollowUpSessionForm
              patientName={patient.name}
              medicalRecordNumber={patient.medicalRecordNumber}
              lensType={selectedFollowUpLensType || editingFollowUpSession?.lensType}
              initialData={editingFollowUpSession || undefined}
              onSubmit={handleSaveFollowUpSession}
              onCancel={() => { setIsFollowUpSessionDialogOpen(false); setEditingFollowUpSession(null); setSelectedFollowUpLensType(undefined); }}
              previousRGPFittingSessions={[]} // This will be handled by the page if needed
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PatientDetailsPage;