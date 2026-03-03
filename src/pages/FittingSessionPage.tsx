import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import FittingSessionForm, { FittingSessionFormData } from '@/components/FittingSessionForm';
import RGPFittingSessionForm, { RGPFittingSessionFormData } from '@/components/RGPFittingSessionForm';
import { showSuccess, showError } from '@/utils/toast';
import { PatientFormData } from '@/components/PatientForm';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface Patient extends PatientFormData {
  id: string;
}

const FittingSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const lensType = searchParams.get('lensType') as 'ROSE_K2_XL' | 'RGP' | null;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialFittingData, setInitialFittingData] = useState<FittingSessionFormData | RGPFittingSessionFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
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

        if (sessionId) {
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (sessionError) throw sessionError;
          setInitialFittingData(sessionData.data);
        }
      } catch (error: any) {
        showError(error.message || 'Failed to fetch data');
        navigate(`/patients/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, sessionId, user]);

  const handleSaveFittingSession = async (data: FittingSessionFormData | RGPFittingSessionFormData) => {
    if (!lensType || !user || !id) {
      showError('Missing required information to save session.');
      return;
    }

    try {
      // Defensive check: ensure date is a Date object
      const sessionDate = data.date instanceof Date ? data.date : new Date(data.date);
      
      // Also ensure nextFollowUpDate is handled if it exists
      if (data.nextFollowUpDate && !(data.nextFollowUpDate instanceof Date)) {
        data.nextFollowUpDate = new Date(data.nextFollowUpDate);
      }

      const sessionPayload = {
        patient_id: id,
        user_id: user.id,
        type: 'Fitting',
        lens_type: lensType,
        date: sessionDate.toISOString(),
        data: data,
      };

      if (sessionId) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionPayload)
          .eq('id', sessionId);
        if (error) throw error;
        showSuccess('Fitting session updated successfully!');
      } else {
        const { error } = await supabase.from('sessions').insert(sessionPayload);
        if (error) throw error;
        showSuccess('New fitting session added successfully!');
      }

      navigate(`/patients/${id}`);
    } catch (error: any) {
      showError(error.message || 'Failed to save fitting session');
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
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient Details
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Session
          </Button>
        </div>
        {lensType === 'ROSE_K2_XL' ? (
          <FittingSessionForm
            patientName={patient.name}
            medicalRecordNumber={patient.medicalRecordNumber}
            dateOfBirth={patient.dateOfBirth}
            diagnosis={patient.diagnosis}
            initialData={initialFittingData as FittingSessionFormData}
            onSubmit={handleSaveFittingSession}
            onCancel={() => navigate(`/patients/${id}`)}
          />
        ) : lensType === 'RGP' ? (
          <RGPFittingSessionForm
            patientName={patient.name}
            medicalRecordNumber={patient.medicalRecordNumber}
            dateOfBirth={patient.dateOfBirth}
            diagnosis={patient.diagnosis}
            initialData={initialFittingData as RGPFittingSessionFormData}
            onSubmit={handleSaveFittingSession}
            onCancel={() => navigate(`/patients/${id}`)}
          />
        ) : (
          <p className="text-xl text-gray-600">Invalid lens type selected.</p>
        )}
      </div>
    </Layout>
  );
};

export default FittingSessionPage;