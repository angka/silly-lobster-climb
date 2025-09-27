import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-xl text-gray-600">Redirecting you to the appropriate page.</p>
      </div>
    </div>
  );
};

export default Index;