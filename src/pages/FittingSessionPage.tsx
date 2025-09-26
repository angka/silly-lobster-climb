import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import FittingSessionForm, { FittingSessionFormData } from '@/components/FittingSessionForm';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft } from 'lucide-react';

interface Patient extends PatientFormData {
  id: string;
}

const FittingSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialFittingData, setInitialFittingData] = useState<FittingSessionFormData | undefined>(undefined);

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
        // For now, we'll just load an empty form or a placeholder.
        // In a real app, you'd load existing fitting session data if available.
        // setInitialFittingData(loadFittingSessionData(id));
      } else {
        showError('Patient not found.');
        navigate('/dashboard');
      }
    } else {
      showError('No patient data available.');
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const handleSaveFittingSession = (data: FittingSessionFormData) => {
    // In a real application, you would save this data to a backend or more structured local storage.
    // For now, we'll just show a success message and navigate back.
    console.log('Saving Fitting Session Data:', data);
    showSuccess(`Fitting session for ${data.patientName} saved successfully!`);
    navigate(`/patients/${id}`); // Navigate back to patient details
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