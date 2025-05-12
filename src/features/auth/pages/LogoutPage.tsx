import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Spinner } from '../../../components/ui/Spinner';

/**
 * LogoutPage component that automatically logs the user out and redirects to login page
 * Used as a route component at /logout
 */
const LogoutPage: React.FC = () => {
  const { logout, state } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    console.log('LogoutPage mounted, auth state:', state.isAuthenticated);
    
    const performLogout = async () => {
      try {
        console.log('Attempting logout...');
        setIsLoggingOut(true);
        
        // Add a small delay to ensure UI feedback is visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await logout();
        console.log('Logout successful, redirecting to login');
        
        // Force a small delay before redirecting to ensure state updates are reflected
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 500);
      } catch (error) {
        console.error('Error during logout:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setIsLoggingOut(false);
        
        // Redirect to login after a delay even if there's an error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    // Only attempt logout if the user is authenticated
    if (state.isAuthenticated) {
      performLogout();
    } else {
      // If not authenticated, just redirect to login
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }

    // Cleanup function - if component unmounts before logout completes
    return () => {
      console.log('LogoutPage unmounting');
    };
  }, [logout, navigate, state.isAuthenticated]);

  if (!isLoggingOut && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Logout Error</h2>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
          <div className="mt-5">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-indigo-600">
            <Spinner size="lg" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Signing Out</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we log you out...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage; 