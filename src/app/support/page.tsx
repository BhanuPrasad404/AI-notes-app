'use client';
import { Mail, MessageCircle, Clock } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We're here to help you with TaskFlow
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Support
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Send us an email and we'll get back to you as soon as possible.
          </p>

          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6 mb-6">
            <p className="text-blue-700 dark:text-blue-400 font-mono text-lg">intellispace@gmail.com</p>
          </div>

          <button
            onClick={() => window.location.href = 'mailto:gumidellibhanuprassad5648@gmail.com'}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Send Email
          </button>
        </div>

        {/* Quick Info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mt-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 font-semibold">Quick Response</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
            We typically respond within 24 hours. For urgent issues, mention "URGENT" in your email.
          </p>
        </div>

        {/* Simple FAQ */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Common Questions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">How do I create a project?</p>
              <p className="text-gray-600 dark:text-gray-400">Click the "+" button in the sidebar to create a new project.</p>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Can I share tasks?</p>
              <p className="text-gray-600 dark:text-gray-400">Yes! Use the share option on any task to collaborate with others.</p>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Where are my tasks stored?</p>
              <p className="text-gray-600 dark:text-gray-400">All your data is securely stored in the cloud and backed up regularly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}