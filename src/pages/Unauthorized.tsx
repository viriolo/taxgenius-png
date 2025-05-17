
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-red-50 dark:bg-red-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8 text-png-red"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      
      <p className="text-lg text-foreground/70 mb-8 max-w-md">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-png-red hover:bg-png-red/90"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
