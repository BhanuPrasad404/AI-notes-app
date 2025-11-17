// app/signup/page.tsx - FIXED VERSION
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import Toast from '@/components/Toast';
import GoogleLoginButton from '@/components/GoogleLoginButton';

// Modern Icons
const Icons = {
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  AI: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

// Custom SVG Showcase for Signup
const AppShowcaseSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-auto max-w-md">
    {/* Background */}
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Main App Window */}
    <rect x="20" y="20" width="360" height="260" rx="12" fill="url(#grad1)" stroke="#4B5563" strokeWidth="1" />

    {/* Header Bar */}
    <rect x="30" y="30" width="340" height="8" rx="4" fill="#374151" />
    <rect x="30" y="45" width="200" height="6" rx="3" fill="#6B7280" />

    {/* Sidebar */}
    <rect x="30" y="65" width="80" height="200" rx="6" fill="#1F2937" />
    <circle cx="50" cy="85" r="4" fill="#3B82F6" />
    <rect x="60" y="83" width="40" height="2" rx="1" fill="#4B5563" />
    <circle cx="50" cy="100" r="4" fill="#8B5CF6" />
    <rect x="60" y="98" width="35" height="2" rx="1" fill="#4B5563" />
    <circle cx="50" cy="115" r="4" fill="#10B981" />
    <rect x="60" y="113" width="45" height="2" rx="1" fill="#4B5563" />

    {/* Main Content Area */}
    <rect x="125" y="65" width="235" height="200" rx="6" fill="#111827" />

    {/* Task Cards */}
    <rect x="140" y="80" width="205" height="40" rx="6" fill="#1E40AF" fillOpacity="0.3" stroke="#3B82F6" strokeWidth="1" />
    <rect x="150" y="90" width="120" height="4" rx="2" fill="#3B82F6" />
    <rect x="150" y="100" width="80" height="3" rx="1.5" fill="#6B7280" />
    <circle cx="320" cy="95" r="3" fill="#10B981" />

    <rect x="140" y="130" width="205" height="40" rx="6" fill="#7C3AED" fillOpacity="0.3" stroke="#8B5CF6" strokeWidth="1" />
    <rect x="150" y="140" width="140" height="4" rx="2" fill="#8B5CF6" />
    <rect x="150" y="150" width="100" height="3" rx="1.5" fill="#6B7280" />
    <circle cx="320" cy="145" r="3" fill="#F59E0B" />

    <rect x="140" y="180" width="205" height="40" rx="6" fill="#059669" fillOpacity="0.3" stroke="#10B981" strokeWidth="1" />
    <rect x="150" y="190" width="100" height="4" rx="2" fill="#10B981" />
    <rect x="150" y="200" width="60" height="3" rx="1.5" fill="#6B7280" />
    <circle cx="320" cy="195" r="3" fill="#EF4444" />

    {/* AI Processing Animation */}
    <circle cx="350" cy="240" r="8" fill="#8B5CF6" opacity="0.8">
      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
    </circle>

    {/* Floating Elements */}
    <circle cx="50" cy="250" r="15" fill="#3B82F6" fillOpacity="0.2" filter="url(#glow)">
      <animate attributeName="cy" values="250;240;250" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="380" cy="50" r="12" fill="#8B5CF6" fillOpacity="0.2" filter="url(#glow)">
      <animate attributeName="cx" values="380;370;380" dur="4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Clear any existing Google sessions on page load
  useEffect(() => {
    // This helps prevent Google One Tap issues
    if (typeof window !== 'undefined') {
      // Clear any stored Google state
      localStorage.removeItem('google_auth_state');
      sessionStorage.removeItem('google_auth_state');
    }
  }, []);

  // Password strength checker
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, color: 'gray' };

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const colors = ['red', 'orange', 'yellow', 'green', 'green'];
    return { strength, color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.signup(name.trim(), email, password);

      if (data.error) {
        setError(data.error);
      } else {
        auth.setToken(data.token);
        setSuccess('Account created! Welcome to IntelliSpace!');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful Google login
  const handleGoogleSuccess = () => {
    setSuccess('Google login successful! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  // Handle Google login error
  const handleGoogleError = (error: string) => {
    setError(error);
  };

  const benefits = [
    "AI-powered note organization",
    "Smart task management",
    "Real-time collaboration",
    "Advanced analytics",
    "Unlimited projects",
    "Priority support"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

      <div className="w-full max-w-6xl bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - App Showcase */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-blue-800/20 p-8 lg:p-12 backdrop-blur-sm">
            <div className="h-full flex flex-col justify-center items-center text-center">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icons.AI />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">IntelliSpace</span>
              </div>

              {/* Hero Text */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Start Your
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Productivity Journey
                </span>
              </h1>

              {/* App Showcase */}
              <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                <AppShowcaseSVG />
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-md">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-left">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icons.Check />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="h-full flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Join IntelliSpace
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create your account and unlock AI-powered productivity
                  </p>
                </div>

                {/* Google Login - Moved to TOP for better visibility */}
                <div className="mb-6">
                  <GoogleLoginButton />
                </div>

                {/* Divider */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with email</span>
                    </div>
                  </div>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
                      placeholder="Create a strong password"
                      disabled={loading}
                    />

                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {/* Strength Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Password strength</span>
                          <span className={`text-sm font-medium ${passwordStrength.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            passwordStrength.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                              passwordStrength.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-green-600 dark:text-green-400'
                            }`}>
                            {passwordStrength.strength === 0 ? 'Very Weak' :
                              passwordStrength.strength === 1 ? 'Weak' :
                                passwordStrength.strength === 2 ? 'Fair' :
                                  passwordStrength.strength === 3 ? 'Good' : 'Strong'}
                          </span>
                        </div>

                        {/* Strength Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.color === 'red' ? 'bg-red-500' :
                              passwordStrength.color === 'orange' ? 'bg-orange-500' :
                                passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                  'bg-green-500'
                              }`}
                            style={{
                              width: `${(passwordStrength.strength / 4) * 100}%`,
                              minWidth: passwordStrength.strength > 0 ? '8%' : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-200">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-200">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || passwordStrength.strength < 3}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/25 dark:shadow-blue-500/40 hover:shadow-blue-500/40 dark:hover:shadow-blue-500/50 transform hover:scale-105 transition-transform duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        Creating your workspace...
                      </div>
                    ) : (
                      'Create Your Workspace'
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-200 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}