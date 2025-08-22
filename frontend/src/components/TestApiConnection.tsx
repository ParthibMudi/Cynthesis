import { useState, useEffect } from 'react';
import api from '../lib/api';

const TestApiConnection = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/');
        setStatus('success');
        setMessage(`Connected to backend: ${response.data}`);
      } catch (error) {
        setStatus('error');
        setMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
        console.error('API connection error:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-xl font-bold mb-2">API Connection Test</h2>
      <div className={`p-3 rounded ${
        status === 'loading' ? 'bg-gray-100' : 
        status === 'success' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <p className="font-medium">
          Status: {status === 'loading' ? 'Testing connection...' : 
                  status === 'success' ? 'Connected!' : 'Connection failed'}
        </p>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default TestApiConnection;