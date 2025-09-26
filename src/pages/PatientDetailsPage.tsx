import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft } from 'lucide-react';

interface Patient extends PatientFormData {
  id: string;
}

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const storedPatients = localStorage.getItem('patients');
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
  }, [id, navigate]);

  const handleSessionSelection = (sessionType: 'Fitting' | 'Follow-up') => {
    showSuccess(`Starting ${sessionType} Session for ${patient?.name || 'patient'}.`);
    // In a real application, you would navigate to a specific session form here.
    // For example: navigate(`/patients/${id}/session/${sessionType.toLowerCase()}`);
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
      <div className="max-w-4xl mx-auto p-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{patient.name}</CardTitle>
            <CardDescription>Medical Record Number: {patient.medicalRecordNumber}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p className="text-base">{patient.dateOfBirth ? patient.dateOfBirth.toLocaleDateString() : 'N/A'}</p>
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
              <p className="text-base">{patient.dateOfVisit ? patient.dateOfVisit.toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-base whitespace-pre-wrap">{patient.notes || 'No notes.'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Start New Session</CardTitle>
            <CardDescription>Choose the type of session for this patient.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" onClick={() => handleSessionSelection('Fitting')}>
              Start Fitting Session
            </Button>
            <Button className="flex-1" variant="secondary" onClick={() => handleSessionSelection('Follow-up')}>
              Start Follow-up Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientDetailsPage;