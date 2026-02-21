import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-xl text-gray-600">Verifying your session...</p>
      </div>
    </div>
  );
};

export default Index;