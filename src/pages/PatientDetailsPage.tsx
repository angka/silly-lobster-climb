import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FittingSessionFormData } from '@/components/FittingSessionForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import FollowUpSessionForm, { FollowUpSessionFormData } from '@/components/FollowUpSessionForm'; // Import new form

interface Patient extends PatientFormData {
  id: string;
}

// Define a generic session interface
interface Session {
  id: string;
  patientId: string;
  type: 'Fitting' | 'Follow-up';
  lensType?: 'ROSE_K2_XL' | 'RGP'; // Add lensType to session
  date: Date;
  data: FittingSessionFormData | FollowUpSessionFormData | any; // 'any' for RGP until its form is fully defined
}

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [isSessionDeleteDialogOpen, setIsSessionDeleteDialogOpen] = useState(false);
  const [isFittingLensTypeSelectionOpen, setIsFittingLensTypeSelectionOpen] = useState(false); // Renamed for clarity
  const [isFollowUpSessionDialogOpen, setIsFollowUpSessionDialogOpen] = useState(false);
  const [isFollowUpLensTypeSelectionOpen, setIsFollowUpLensTypeSelectionOpen] = useState(false); // New state for follow-up lens type selection
  const [selectedFollowUpLensType, setSelectedFollowUpLensType] = useState<'ROSE_K2_XL' | 'RGP' | undefined>(undefined); // New state to store selected lens type for follow-up
  const [editingFollowUpSession, setEditingFollowUpSession] = useState<FollowUpSessionFormData & { id: string, lensType?: 'ROSE_K2_XL' | 'RGP' } | null>(null); // State for editing follow-up

  useEffect(() => {
    const storedPatients = localStorage.getItem('patients');
    const storedSessions = localStorage.getItem('sessions');

    if (storedPatients) {
      const patients: Patient[] = JSON.parse(storedPatients).map((p: Patient) => ({
        ...p,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
        dateOfVisit: p.dateOfVisit ? new Date(p.dateOfVisit) : undefined,
      }));
      const foundPatient = patients.find(p => p.id === id);
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        showError('Patient not found.');
        navigate('/dashboard');
      }
    } else {
      showError('No patient data available.');
      navigate('/dashboard');
    }

    if (storedSessions) {
      const allSessions: Session[] = JSON.parse(storedSessions).map((s: any) => ({
        ...s,
        date: new Date(s.date),
      }));
      const patientSessions = allSessions.filter(s => s.patientId === id);
      setSessions(patientSessions.sort((a, b) => b.date.getTime() - a.date.getTime()));
    }
  }, [id, navigate]);

  const handleStartFittingSession = () => {
    setIsFittingLensTypeSelectionOpen(true);
  };

  const handleSelectFittingLensType = (lensType: 'ROSE_K2_XL' | 'RGP') => {
    setIsFittingLensTypeSelectionOpen(false);
    if (!patient) {
      showError('Patient data not loaded.');
      return;
    }
    navigate(`/patients/${id}/fitting-session?lensType=${lensType}`);
  };

  const handleStartFollowUpSession = () => {
    setEditingFollowUpSession(null); // Clear any previous editing data
    setSelectedFollowUpLensType(undefined); // Clear previous lens type selection
    setIsFollowUpLensTypeSelectionOpen(true); // Open lens type selection dialog
  };

  const handleSelectFollowUpLensType = (lensType: 'ROSE_K2_XL' | 'RGP') => {
    setSelectedFollowUpLensType(lensType);
    setIsFollowUpLensTypeSelectionOpen(false); // Close lens type selection
    setIsFollowUpSessionDialogOpen(true); // Open follow-up form dialog
  };

  const handleSaveFollowUpSession = (data: FollowUpSessionFormData) => {
    if (!patient) {
      showError('Patient data not loaded.');
      return;
    }

    const newSession: Session = {
      id: editingFollowUpSession?.id || `followup-${Date.now()}`,
      patientId: patient.id,
      type: 'Follow-up',
      lensType: selectedFollowUpLensType || editingFollowUpSession?.lensType, // Save the selected lens type
      date: data.date,
      data: data,
    };

    const storedSessions = localStorage.getItem('sessions');
    let existingSessions: Session[] = storedSessions ? JSON.parse(storedSessions).map((s: any) => ({
      ...s,
      date: new Date(s.date),
    })) : [];

    if (editingFollowUpSession) {
      existingSessions = existingSessions.map(s => s.id === editingFollowUpSession.id ? newSession : s);
      showSuccess(`Follow-up session for ${patient.name} updated successfully!`);
    } else {
      existingSessions = [...existingSessions, newSession];
      showSuccess(`New follow-up session for ${patient.name} added successfully!`);
    }

    localStorage.setItem('sessions', JSON.stringify(existingSessions));
    setSessions(existingSessions.filter(s => s.patientId === patient.id).sort((a, b) => b.date.getTime() - a.date.getTime()));
    setIsFollowUpSessionDialogOpen(false);
    setEditingFollowUpSession(null);
    setSelectedFollowUpLensType(undefined); // Clear selected lens type after saving
  };

  const handleViewSessionDetails = (sessionId: string, sessionType: 'Fitting' | 'Follow-up', lensType?: 'ROSE_K2_XL' | 'RGP') => {
    if (sessionType === 'Fitting') {
      navigate(`/patients/${patient?.id}/fitting-session?sessionId=${sessionId}${lensType ? `&lensType=${lensType}` : ''}`);
    } else if (sessionType === 'Follow-up') {
      navigate(`/patients/${patient?.id}/follow-up-session?sessionId=${sessionId}${lensType ? `&lensType=${lensType}` : ''}`);
    }
  };

  const handleDeleteSession = () => {
    if (sessionToDelete) {
      const storedSessions = localStorage.getItem('sessions');
      let existingSessions: Session[] = storedSessions ? JSON.parse(storedSessions).map((s: any) => ({
        ...s,
        date: new Date(s.date),
      })) : [];

      const updatedSessions = existingSessions.filter(s => s.id !== sessionToDelete.id);
      localStorage.setItem('sessions', JSON.stringify(updatedSessions));
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
      setIsSessionDeleteDialogOpen(false);
      setSessionToDelete(null);
      showSuccess(`Session from ${format(sessionToDelete.date, 'PPP')} deleted successfully!`);
    }
  };

  if (!patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-xl text-gray-600">Loading patient details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Patient Details and Session History */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{patient.name}</CardTitle>
                <CardDescription>Medical Record Number: {patient.medicalRecordNumber}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                  <p className="text-base">{patient.diagnosis || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-base">{patient.dateOfBirth ? format(patient.dateOfBirth, 'PPP') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="text-base">{patient.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p className="text-base">{patient.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doctor's Name</p>
                  <p className="text-base">{patient.doctorName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-base">{patient.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lens Category</p>
                  <p className="text-base">{patient.lensCategory || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
                  <p className="text-base">{patient.dateOfVisit ? format(patient.dateOfVisit, 'PPP') : 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-base whitespace-pre-wrap">{patient.notes || 'No notes.'}</p>
                </div>
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewSessionDetails(session.id, session.type, session.lensType)}
                                >
                                  View Details
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSessionToDelete(session);
                                    setIsSessionDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete session from {format(session.date, 'PPP')}</span>
                                </Button>
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

          {/* Right Column: Start New Session */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Start New Session</CardTitle>
                <CardDescription>Choose the type of session for this patient.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button className="flex-1" onClick={handleStartFittingSession}>
                  Start Fitting Session
                </Button>
                <Button className="flex-1" variant="secondary" onClick={handleStartFollowUpSession}>
                  Start Follow-up Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Session Alert Dialog */}
      <AlertDialog open={isSessionDeleteDialogOpen} onOpenChange={setIsSessionDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              <span className="font-bold">{sessionToDelete?.type} session from {sessionToDelete?.date ? format(sessionToDelete.date, 'PPP') : 'this date'}</span>
              and remove its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fitting Lens Type Selection Dialog */}
      <Dialog open={isFittingLensTypeSelectionOpen} onOpenChange={setIsFittingLensTypeSelectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Lens Type for Fitting</DialogTitle>
            <DialogDescription>
              Choose the type of lens for this fitting session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => handleSelectFittingLensType('ROSE_K2_XL')}>
              ROSE K2 XL
            </Button>
            <Button variant="secondary" onClick={() => handleSelectFittingLensType('RGP')}>
              RGP
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Lens Type Selection Dialog (NEW) */}
      <Dialog open={isFollowUpLensTypeSelectionOpen} onOpenChange={setIsFollowUpLensTypeSelectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Lens Type for Follow-up</DialogTitle>
            <DialogDescription>
              Choose the type of lens this follow-up session is for.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => handleSelectFollowUpLensType('ROSE_K2_XL')}>
              ROSE K2 XL
            </Button>
            <Button variant="secondary" onClick={() => handleSelectFollowUpLensType('RGP')}>
              RGP
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Session Dialog */}
      <Dialog open={isFollowUpSessionDialogOpen} onOpenChange={setIsFollowUpSessionDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFollowUpSession ? 'Edit Follow-up Session' : 'Start New Follow-up Session'}</DialogTitle>
            <DialogDescription>
              {editingFollowUpSession ? 'Edit the details of this follow-up session.' : 'Enter the details for the new follow-up session.'}
            </DialogDescription>
          </DialogHeader>
          {patient && (selectedFollowUpLensType || editingFollowUpSession) && (
            <FollowUpSessionForm
              patientName={patient.name}
              medicalRecordNumber={patient.medicalRecordNumber}
              lensType={selectedFollowUpLensType || editingFollowUpSession?.lensType} // Pass selected lens type
              initialData={editingFollowUpSession || undefined}
              onSubmit={handleSaveFollowUpSession}
              onCancel={() => {
                setIsFollowUpSessionDialogOpen(false);
                setEditingFollowUpSession(null);
                setSelectedFollowUpLensType(undefined); // Clear selected lens type on cancel
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PatientDetailsPage;