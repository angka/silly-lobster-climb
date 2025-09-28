import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import FollowUpSessionForm, { FollowUpSessionFormData } from '@/components/FollowUpSessionForm';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Patient extends PatientFormData {
  id: string;
}

interface Session {
  id: string;
  patientId: string;
  type: 'Fitting' | 'Follow-up';
  lensType?: 'ROSE_K2_XL' | 'RGP';
  date: Date;
  data: FollowUpSessionFormData; // Specifically for FollowUpSessionFormData
}

const FollowUpSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const lensType = searchParams.get('lensType') as 'ROSE_K2_XL' | 'RGP' | null; // Get lensType from URL

  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialFollowUpData, setInitialFollowUpData] = useState<FollowUpSessionFormData | undefined>(undefined);

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
          const foundSession = allSessions.find(s => s.id === sessionId && s.patientId === id && s.type === 'Follow-up');
          if (foundSession) {
            setInitialFollowUpData(foundSession.data as FollowUpSessionFormData);
          } else {
            showError('Follow-up session data not found.');
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

  const handleSaveFollowUpSession = (data: FollowUpSessionFormData) => {
    if (!patient) {
      showError('Patient data not loaded.');
      return;
    }

    const newSession: Session = {
      id: sessionId || `followup-${Date.now()}`,
      patientId: id!,
      type: 'Follow-up',
      lensType: lensType || data.lensType, // Ensure lensType is saved
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
      showSuccess(`Follow-up session for ${patient.name} updated successfully!`);
    } else {
      existingSessions = [...existingSessions, newSession];
      showSuccess(`New follow-up session for ${patient.name} added successfully!`);
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
          <p className="text-xl text-gray-600">Loading patient details for follow-up session...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient Details
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Session
          </Button>
        </div>
        <FollowUpSessionForm
          patientName={patient.name}
          medicalRecordNumber={patient.medicalRecordNumber}
          lensType={lensType || initialFollowUpData?.lensType} // Pass lensType to the form
          initialData={initialFollowUpData}
          onSubmit={handleSaveFollowUpSession}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
};

export default FollowUpSessionPage;