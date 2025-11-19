'use client';
import { Shield, User, FileText, Users, Bell, BarChart3, Download, Edit, Trash2, LogOut, Lock, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
   <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy Policy
            </h1>
        </div>

        <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Understanding Your Privacy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We built this task manager to help you organize your work efficiently. Your privacy is fundamental,
                    and this policy explains exactly how we handle your data.
                </p>
            </section>

            {/* Information We Collect */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    What We Collect
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Account Information</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Email, name, and profile details for your account
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Your Content</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Tasks, projects, notes, and deadlines you create
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            What We Don't Collect
                        </h3>
                        <p className="text-blue-600 dark:text-blue-200 text-sm">
                            We never access your task content unless you explicitly share it with others.
                        </p>
                    </div>
                </div>
            </section>

            {/* How We Use Data */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    How We Use Your Information
                </h2>

                <div className="grid gap-4">
                    {[
                        { icon: FileText, title: "Task Management", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/20" },
                        { icon: Users, title: "Collaboration", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/20" },
                        { icon: Bell, title: "Notifications", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/20" },
                        { icon: BarChart3, title: "App Improvement", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/20" },
                    ].map(({ icon: Icon, title, color, bg }, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {title === "Task Management" && "Store and display your tasks and projects"}
                                    {title === "Collaboration" && "Enable sharing when you work with others"}
                                    {title === "Notifications" && "Send reminders and updates about your tasks"}
                                    {title === "App Improvement" && "Understand feature usage to make the app better"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Sharing */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    Data Sharing
                </h2>

                <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4">
                        <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">Your Data Stays Private</h3>
                        <p className="text-orange-600 dark:text-orange-200 text-sm">
                            We do not sell or rent your personal information to third parties.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">When You Share</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Your tasks are only shared when you explicitly use sharing features
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Providers</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Trusted partners for hosting and email services only
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Your Rights */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    Your Rights
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Download, title: "Export Data", desc: "Download all your tasks and notes" },
                        { icon: Edit, title: "Edit Content", desc: "Modify your information anytime" },
                        { icon: Trash2, title: "Delete Content", desc: "Remove tasks or projects" },
                        { icon: LogOut, title: "Delete Account", desc: "Permanently remove your account" },
                    ].map(({ icon: Icon, title, desc }, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Data Security
                </h2>
                <div className="text-gray-700 dark:text-gray-300 space-y-3">
                    <p>We implement industry-standard security measures:</p>
                    <ul className="space-y-2 ml-4">
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                            SSL encryption for all data transfers
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                            Secure authentication system
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                            Regular security updates and monitoring
                        </li>
                    </ul>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 justify-center">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Questions about your privacy?
                </p>
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6 max-w-md mx-auto">
                    <p className="text-blue-700 dark:text-blue-400 font-semibold">intellispace@gmail.com</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">We're here to help</p>
                </div>
            </section>
        </div>
    </div>
</div>
  );
}