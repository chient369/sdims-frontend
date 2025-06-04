import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!username) {
      setError('Username/Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await login(username, password, rememberMe);
      
      // Clear form data after successful submission
      setUsername('');
      setPassword('');
      
      // Redirect user
      navigate(from, { replace: true });
    } catch (error) {
      // Handle different error types
      if (error instanceof Error) {
        // Check for specific error messages from API
        if (error.message.includes('E1005')) {
          setError('Invalid username or password');
        } else if (error.message.includes('E1004')) {
          setError('Your account is locked. Please contact admin');
        } else if (error.message.includes('E1006')) {
          setError('Too many failed attempts. Please try again later');
        } else {
          setError('Login failed: ' + error.message);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-white shadow-md w-full max-w-md mx-auto">
      <img src="../../assets/icon.png" alt="Company Logo" className="h-12 mb-6" />
      
      <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900">Sign In</h2>
      
      {error && (
        <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
            Username / Email
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input mt-1 w-full px-3 py-2 border border-secondary-300 rounded-md"
            placeholder="Enter your username or email"
            disabled={loading}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full px-3 py-2 border border-secondary-300 rounded-md pr-10"
              placeholder="Enter your password"
              disabled={loading}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash className="text-secondary-500" /> : <FaEye className="text-secondary-500" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="btn btn-primary w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login; 