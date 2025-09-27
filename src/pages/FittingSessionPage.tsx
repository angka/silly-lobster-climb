import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import FittingSessionForm, { FittingSessionFormData } from '@/components/FittingSessionForm';
import RGPFittingSessionForm, { RGPFittingSessionFormData } from '@/components/RGPFittingSessionForm'; // Import RGP form
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft, Printer } from 'lucide-react'; // Import Printer icon
import { Button } from '@/components/ui/button';

interface Patient extends PatientFormData {
  id: string;
}

interface FollowUpSessionFormData {
  notes: string;
  // Add other follow-up specific fields here if needed
}

// Define a generic session interface
interface Session {
  id: string;
  patientId: string;
  type: 'Fitting' | 'Follow-up';
  lensType?: 'ROSE_K2_XL' | 'RGP'; // Add lensType to session
  date: Date; // Date of the session
  data: FittingSessionFormData | RGPFittingSessionFormData | FollowUpSessionFormData;
}

const FittingSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const lensType = searchParams.get('lensType') as 'ROSE_K2_XL' | 'RGP' | null; // Get lensType from URL

  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialFittingData, setInitialFittingData] = useState<FittingSessionFormData | RGPFittingSessionFormData | undefined>(undefined);

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
            setInitialFittingData(foundSession.data as FittingSessionFormData | RGPFittingSessionFormData);
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
  }, [id, navigate, sessionId, lensType]); // Add lensType to dependencies

  const handleSaveFittingSession = (data: FittingSessionFormData | RGPFittingSessionFormData) => {
    if (!lensType) {
      showError('Lens type not specified for this session.');
      return;
    }

    const newSession: Session = {
      id: sessionId || `session-${Date.now()}`,
      patientId: id!,
      type: 'Fitting',
      lensType: lensType, // Save the selected lens type
      date: data.date,
      data: data,
    };

    const storedSessions = localStorage.getItem('sessions');
    let existingSessions: Session[] = storedSessions ? JSON.parse(storedSessions).map((s: any) => ({
      ...s,
      date: new Date(s.date),
    })) : [];

    if (sessionId) {
      existingSessions = existingSessions.map(s => s.id === sessionId ? newSession : s);
      showSuccess(`Fitting session for ${data.patientName} updated successfully!`);
    } else {
      existingSessions = [...existingSessions, newSession];
      showSuccess(`New fitting session for ${data.patientName} added successfully!`);
    }

    localStorage.setItem('sessions', JSON.stringify(existingSessions));
    navigate(`/patients/${id}`);
  };

  const handleCancel = () => {
    navigate(`/patients/${id}`);
  };

  const handlePrint = () => {
    window.print();
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

  if (!lensType && !sessionId) {
    // If no lensType is specified and not editing an existing session, redirect to patient details
    // to force selection or prevent direct access.
    showError('Please select a lens type to start a new fitting session.');
    navigate(`/patients/${id}`);
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 print:hidden"> {/* Hide buttons on print */}
          <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient Details
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Session
          </Button>
        </div>
        {lensType === 'ROSE_K2_XL' ? (
          <FittingSessionForm
            patientName={patient.name}
            medicalRecordNumber={patient.medicalRecordNumber}
            dateOfBirth={patient.dateOfBirth}
            diagnosis={patient.diagnosis} // Pass diagnosis
            initialData={initialFittingData as FittingSessionFormData}
            onSubmit={handleSaveFittingSession}
            onCancel={handleCancel}
          />
        ) : lensType === 'RGP' ? (
          <RGPFittingSessionForm
            patientName={patient.name}
            medicalRecordNumber={patient.medicalRecordNumber}
            dateOfBirth={patient.dateOfBirth}
            diagnosis={patient.diagnosis} // Pass diagnosis
            initialData={initialFittingData as RGPFittingSessionFormData}
            onSubmit={handleSaveFittingSession}
            onCancel={handleCancel}
          />
        ) : (
          <p className="text-xl text-gray-600">Invalid lens type selected or session type not recognized.</p>
        )}
      </div>
    </Layout>
  );
};

export default FittingSessionPage;