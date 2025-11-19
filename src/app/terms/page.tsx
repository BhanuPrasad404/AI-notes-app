import {
  FileText,
  User,
  CheckCircle,
  XCircle,
  Lightbulb,
  Settings,
  AlertTriangle,
  MessageCircle,
  Shield,
  Lock,
  Mail,
  Calendar,
  Users,
  Download,
  Ban,
  Cpu,
  Server,
  Edit,
  Terminal
} from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </div>
          <div className="flex items-center justify-center text-gray-600 dark:text-gray-400 text-lg">
            <Calendar className="w-5 h-5 mr-2" />
            <p>Effective: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="space-y-10">
            {/* Agreement */}
            <section className="border-b border-gray-300 dark:border-gray-800 pb-8">
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agreement to Terms</h2>
                </div>
                <p className="text-blue-700 dark:text-blue-200">
                  By accessing or using TaskFlow, you agree to be bound by these Terms of Service and our Privacy Policy.
                  If you disagree with any part of the terms, you may not access our service.
                </p>
              </div>
            </section>

            {/* Accounts */}
            <section className="border-b border-gray-300 dark:border-gray-800 pb-8">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Accounts</h2>
              </div>

              <div className="grid gap-4">
                {[
                  { requirement: "Age Requirement", detail: "You must be at least 13 years old to use TaskFlow", icon: Shield },
                  { requirement: "Account Security", detail: "You are responsible for maintaining your account credentials and all activities under your account", icon: Lock },
                  { requirement: "Accuracy", detail: "You must provide accurate and complete registration information", icon: Edit },
                  { requirement: "One Account", detail: "Each user may maintain only one account unless explicitly authorized", icon: Users },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <item.icon className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.requirement}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="border-b border-gray-300 dark:border-gray-800 pb-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acceptable Use</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">You MAY:</h3>
                  </div>
                  <ul className="text-green-600 dark:text-green-200 space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Use for personal and business tasks
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Collaborate with team members
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Export your data anytime
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">You MAY NOT:</h3>
                  </div>
                  <ul className="text-red-600 dark:text-red-200 space-y-3">
                    <li className="flex items-start">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      Upload illegal or harmful content
                    </li>
                    <li className="flex items-start">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      Spam or harass other users
                    </li>
                    <li className="flex items-start">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      Reverse engineer the service
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="border-b border-gray-300 dark:border-gray-800 pb-8">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Intellectual Property</h2>
              </div>

              <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <Download className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Your Content</h3>
                    </div>
                    <p className="text-purple-600 dark:text-purple-200 text-sm">
                      You retain all ownership rights to your tasks, projects, notes, and any content you create.
                      We do not claim ownership of your data.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-3">
                      <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Our Service</h3>
                    </div>
                    <p className="text-purple-600 dark:text-purple-200 text-sm">
                      TaskFlow software, branding, and underlying technology are protected by copyright,
                      trademark, and other laws.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Terms */}
            <section className="border-b border-gray-300 dark:border-gray-800 pb-8">
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Terms</h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Service Availability",
                    content: "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We may perform maintenance that temporarily affects availability.",
                    icon: Server
                  },
                  {
                    title: "Modifications",
                    content: "We may update, enhance, or discontinue features with reasonable notice. Continued use after changes constitutes acceptance.",
                    icon: FileText
                  },
                  {
                    title: "Termination",
                    content: "We reserve the right to suspend or terminate accounts that violate these terms or pose security risks.",
                    icon: XCircle
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Limitations */}
            <section className="border-b border-gray-300 dark:border-gray-800 pb-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Limitations of Liability</h2>
              </div>

              <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Important Disclaimer</h3>
                </div>
                <p className="text-orange-600 dark:text-orange-200">
                  TaskFlow is provided "as is" without warranties of any kind. To the fullest extent permitted by law,
                  we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
                </p>
                <p className="text-orange-600 dark:text-orange-200 mt-3">
                  You are responsible for maintaining backups of your important data.
                </p>
              </div>
            </section>

            {/* Contact & Support */}
            <section className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact & Support</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Need help or have questions about these terms?
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-6 rounded-xl">
                  <Mail className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="font-semibold text-white mb-2">General Support</h3>
                  <p className="text-cyan-100 text-sm">bhanuprasadgummidelli@gmail.com</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl">
                  <Terminal className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="font-semibold text-white mb-2">Legal Inquiries</h3>
                  <p className="text-purple-100 text-sm">intellispace@gmail.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}