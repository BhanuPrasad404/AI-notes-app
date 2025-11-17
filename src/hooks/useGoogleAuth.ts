// hooks/useGoogleAuth.ts - PROFESSIONAL IMPLEMENTATION
'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { auth } from '@/lib/auth';

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleAuthConfig {
    onSuccess: (token: string, user: any) => void;
    onError: (error: string) => void;
    autoInit?: boolean;
}

export const useGoogleAuth = (config: GoogleAuthConfig) => {
    const router = useRouter();
    const isInitialized = useRef(false);
    const { onSuccess, onError, autoInit = true } = config;

    // Load Google Identity Services SDK
    const loadGIS = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (window.google?.accounts?.id) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Identity Services'));

            document.head.appendChild(script);
        });
    }, []);

    // Initialize Google One Tap and Automatic Sign-in
    const initializeGoogleAuth = useCallback(async () => {
        try {
            await loadGIS();

            if (!window.google?.accounts?.id) {
                throw new Error('Google Identity Services not available');
            }

            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: async (response: any) => {
                    try {
                        // Handle the credential response
                        const credential = response.credential;

                        // Send to your backend for verification
                        const backendResponse = await fetch('/api/auth/google', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ credential }),
                        });

                        const result = await backendResponse.json();

                        if (result.success && result.token) {
                            auth.setToken(result.token);
                            onSuccess(result.token, result.user);
                        } else {
                            onError(result.error || 'Authentication failed');
                        }
                    } catch (error) {
                        onError('Authentication error');
                    }
                },
                auto_select: true, // Automatically sign in returning users
                cancel_on_tap_outside: true, // Professional behavior
                context: 'signin', // or 'signup' based on your page
                use_fedcm_for_prompt: true, // Use modern FedCM when available
                itp_support: true, // Intelligent Tracking Prevention support
            });

            isInitialized.current = true;

            // Show One Tap prompt for new users
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // One Tap not shown - user might be in private mode or has dismissed it
                    console.log('One Tap not displayed');
                }
            });

            // Check if user is already signed in (automatic sign-in)
            window.google.accounts.id.storeCredential((credential: any) => {
                if (credential) {
                    console.log('Automatic sign-in detected');
                }
            });

        } catch (error) {
            console.error('Google Auth initialization failed:', error);
            onError('Failed to initialize Google Sign-In');
        }
    }, [loadGIS, onSuccess, onError]);

    // Render Google Sign-In button programmatically
    const renderSignInButton = useCallback((container: HTMLElement, options: any = {}) => {
        if (!window.google?.accounts?.id || !isInitialized.current) return;

        window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: container.clientWidth,
            ...options,
        });
    }, []);

    // Sign out from Google
    const signOut = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
            window.google.accounts.id.cancel();
        }
    }, []);

    // Revoke Google access
    const revokeAccess = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.revoke((response: any) => {
                console.log('Google access revoked:', response);
            });
        }
    }, []);

    // Initialize on mount if autoInit is true
    useEffect(() => {
        if (autoInit && !isInitialized.current) {
            initializeGoogleAuth();
        }
    }, [autoInit, initializeGoogleAuth]);

    return {
        initializeGoogleAuth,
        renderSignInButton,
        signOut,
        revokeAccess,
        isInitialized: isInitialized.current,
    };
};