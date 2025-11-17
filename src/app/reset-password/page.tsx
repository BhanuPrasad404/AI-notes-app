import { Suspense } from 'react';
import ResetPasswordContent from './reset-password-content';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}