import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export default function VapiWidget() {
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [vapiInstance, setVapiInstance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get credentials from environment variables
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (!publicKey || !assistantId) {
      setError('Missing Vapi credentials. Please check environment variables.');
      return;
    }

    // Initialize Vapi with credentials
    const vapi = new Vapi(publicKey);
    setVapiInstance(vapi);

    vapi.on('call-start', () => {
      setIsListening(true);
      setIsReady(true);
      setError(null);
    });

    vapi.on('call-end', () => {
      setIsListening(false);
      setIsReady(true);
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      setError('Error connecting to Vapi service');
      setIsListening(false);
      setIsReady(true);
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const toggleCall = async () => {
    if (!vapiInstance) return;

    if (!isListening) {
      try {
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        await vapiInstance.start(assistantId);
      } catch (error) {
        console.error('Error starting call:', error);
        setError('Failed to start call');
      }
    } else {
      vapiInstance.stop();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <button
        onClick={toggleCall}
        disabled={!isReady || !!error}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50' 
            : error 
              ? 'bg-red-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        <svg 
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            fill="currentColor"
          />
          <path
            d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className={`mt-4 text-white/60 ${error ? 'text-red-400' : ''}`}>
        {error ? error : !isReady ? 'Initializing...' : isListening ? 'Listening...' : 'Ready'}
      </p>
    </div>
  );
}
