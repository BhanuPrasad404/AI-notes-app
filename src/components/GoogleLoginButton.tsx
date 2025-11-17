// components/GoogleLoginButton.tsx - GUARANTEED VISIBLE
'use client';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useEffect, useState } from 'react';
interface GoogleLoginButtonProps {
  mode?: 'signin' | 'signup'; // ← ADD THIS
  className?: string;
}

export default function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: "130153725025-nsrlbcqddftnmat4tjum6v6getrvuj83.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        // Render button to a hidden container and trigger click
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'filled_blue',
          size: 'large',
          text: 'continue_with',
        });

        // Find and click the Google button
        setTimeout(() => {
          const googleBtn = tempDiv.querySelector('div[role="button"]') as HTMLElement;
          if (googleBtn) {
            // Replace our custom button with the real Google button
            const container = document.getElementById('google-btn-container');
            if (container) {
              container.innerHTML = '';
              container.appendChild(googleBtn);
            }
          }
        }, 100);
      }
    };

    document.head.appendChild(script);
  }, []);
  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);

      if (!response?.credential) {
        alert('No credential received from Google');
        return;
      }

      // Send to your backend
      const backendResponse = await fetch('https://ai-notes-backend-h185.onrender.com/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const result = await backendResponse.json();

      // FIX: Check for token directly instead of result.success
      if (result.token) {
        auth.setToken(result.token);
        router.push('/dashboard');
      } else {
        alert(result.error || result.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleButtonClick = () => {
    // Trigger Google button click
    const googleBtn = document.querySelector('div[role="button"]') as HTMLElement;
    if (googleBtn) {
      googleBtn.click();
    }
  };

  return (
    <div className="w-full">
      {/* Custom styled button that triggers Google auth */}
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-t-2 border-blue-600 border-solid rounded-full animate-spin mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Hidden container for real Google button */}
      <div id="google-btn-container" style={{ display: 'none' }} />
    </div>
  );
}