import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import FittingSessionForm, { FittingSessionFormData } from '@/components/FittingSessionForm';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft } from 'lucide-react';

interface Patient extends PatientFormData {
  id: string;
}

// Placeholder for FollowUpSessionFormData (not implemented yet)
interface FollowUpSessionFormData {
  notes: string;
  // Add other follow-up specific fields here if needed
}

// Define a generic session interface
interface Session {
  id: string;
  patientId: string;
  type: 'Fitting' | 'Follow-up';
  date: Date; // Date of the session
  data: FittingSessionFormData | FollowUpSessionFormData;
}

const FittingSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialFittingData, setInitialFittingData] = useState<FittingSessionFormData | undefined>(undefined);

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

        if (sessionId && storedSessions) {
          const allSessions: Session[] = JSON.parse(storedSessions).map((s: any) => ({
            ...s,
            date: new Date(s.date),
          }));
          const foundSession = allSessions.find(s => s.id === sessionId && s.patientId === id && s.type === 'Fitting');
          if (foundSession) {
            setInitialFittingData(foundSession.data as FittingSessionFormData);
          } else {
            showError('Fitting session data not found.');
            // Optionally navigate back or clear sessionId
          }
        }
      } else {
        showError('Patient not found.');
        navigate('/dashboard');
      }
    } else {
      showError('No patient data available.');
      navigate('/dashboard');
    }
  }, [id, navigate, sessionId]);

  const handleSaveFittingSession = (data: FittingSessionFormData) => {
    const newSession: Session = {
      id: sessionId || `session-${Date.now()}`, // Use existing ID if editing, otherwise generate new
      patientId: id!,
      type: 'Fitting',
      date: data.date,
      data: data,
    };

    const storedSessions = localStorage.getItem('sessions');
    let existingSessions: Session[] = storedSessions ? JSON.parse(storedSessions).map((s: any) => ({
      ...s,
      date: new Date(s.date),
    })) : [];

    if (sessionId) {
      // Update existing session
      existingSessions = existingSessions.map(s => s.id === sessionId ? newSession : s);
      showSuccess(`Fitting session for ${data.patientName} updated successfully!`);
    } else {
      // Add new session
      existingSessions = [...existingSessions, newSession];
      showSuccess(`New fitting session for ${data.patientName} added successfully!`);
    }

    localStorage.setItem('sessions', JSON.stringify(existingSessions));
    navigate(`/patients/${id}`);
  };

  const handleCancel = () => {
    navigate(`/patients/${id}`); // Navigate back to patient details
  };

  if (!patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-xl text-gray-600">Loading patient details for fitting session...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="outline" onClick={() => navigate(`/patients/${id}`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient Details
        </Button>
        <FittingSessionForm
          patientName={patient.name}
          medicalRecordNumber={patient.medicalRecordNumber}
          initialData={initialFittingData}
          onSubmit={handleSaveFittingSession}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
};

export default FittingSessionPage;