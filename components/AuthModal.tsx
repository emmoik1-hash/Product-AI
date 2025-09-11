import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CloseIcon } from './icons/CloseIcon';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (!email) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signInWithMagicLink(email);
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setMessage("Success! Please check your email for a magic link to log in.");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-neutral-800 p-8 rounded-xl shadow-lg w-full max-w-md m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close dialog">
            <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">Sign In / Sign Up</h2>
        
        {message ? (
          <div className="text-center">
            <p className="text-green-400 bg-green-900/50 p-4 rounded-md">{message}</p>
            <button onClick={onClose} className="mt-4 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md">
                Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Continue with Email
                  </label>
                  <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary"
                      required
                      disabled={loading}
                  />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-gray-500"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
          </form>
        )}
      </div>
    </div>
  );
};