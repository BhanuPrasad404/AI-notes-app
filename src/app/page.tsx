import Link from 'next/link';

// Professional Icons (keeping your beautiful icons)
const Icons = {
  Rocket: () => (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Notes: () => (
    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Tasks: () => (
    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  AI: () => (
    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Collaboration: () => (
    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
};

export default function Home() {
  const features = [
    {
      icon: <Icons.Notes />,
      title: "Smart Notes",
      description: "Notion-like rich text editing with AI-powered organization"
    },
    {
      icon: <Icons.Tasks />,
      title: "Task Management",
      description: "Trello-like kanban boards with intelligent task tracking"
    },
    {
      icon: <Icons.AI />,
      title: "AI Superpowers",
      description: "Automated summaries, tags, and intelligent suggestions"
    },
    {
      icon: <Icons.Collaboration />,
      title: "Team Collaboration",
      description: "Share notes and tasks seamlessly with your team"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Enhanced Navigation - Fully Responsive */}
      <nav className="border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Icons.Rocket />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                IntelliSpace
              </span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link 
                href="/login" 
                className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition duration-200 hover:scale-105 px-2 py-1 sm:px-0"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section - Mobile First */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 sm:top-1/4 sm:left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 sm:bottom-1/4 sm:right-1/4 w-40 h-40 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight sm:leading-tight">
                Where Ideas
                <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mt-2">
                  Become Reality
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-6 sm:mt-8 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience the next generation of productivity. Beautiful notes, powerful tasks, and intelligent AI - all working together seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition duration-300 font-semibold text-base sm:text-lg shadow-xl sm:shadow-2xl shadow-blue-500/30 hover:shadow-2xl sm:hover:shadow-3xl hover:shadow-purple-500/40 transform hover:scale-105 text-center"
                >
                  Start Creating Now
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-4 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-xl sm:rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition duration-300 font-semibold text-base sm:text-lg hover:border-blue-300 dark:hover:border-purple-400 transform hover:scale-105 text-center"
                >
                  See Live Demo
                </Link>
              </div>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                  <Icons.Check />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                  <Icons.Check />
                  <span className="font-medium">Start in seconds</span>
                </div>
              </div>
            </div>

            {/* Enhanced Hero Visual - Responsive */}
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-600/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-xl sm:shadow-2xl">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/90 dark:bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200/50 dark:border-white/10 shadow-lg">
                    <div className="w-8 h-1.5 sm:w-10 sm:h-2 bg-blue-400 rounded-full mb-3 sm:mb-4"></div>
                    <div className="w-12 h-1.5 sm:w-16 sm:h-2 bg-gray-400 rounded-full mb-2 sm:mb-3"></div>
                    <div className="w-10 h-1.5 sm:w-12 sm:h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="bg-white/90 dark:bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200/50 dark:border-white/10 shadow-lg">
                    <div className="w-6 h-1.5 sm:w-8 sm:h-2 bg-purple-400 rounded-full mb-3 sm:mb-4"></div>
                    <div className="w-16 h-1.5 sm:w-20 sm:h-2 bg-gray-400 rounded-full mb-2 sm:mb-3"></div>
                    <div className="w-8 h-1.5 sm:w-10 sm:h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="bg-white/90 dark:bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200/50 dark:border-white/10 shadow-lg col-span-2">
                    <div className="flex space-x-1.5 sm:space-x-2 mb-3 sm:mb-4">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-400 rounded-full animate-pulse delay-700"></div>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-gray-400 rounded-full mb-2 sm:mb-3"></div>
                    <div className="w-3/4 h-1.5 sm:h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Elements - Responsive */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-xl sm:blur-2xl animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-24 h-24 sm:w-40 sm:h-40 bg-purple-500/20 rounded-full blur-xl sm:blur-2xl animate-bounce delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section - Responsive Grid */}
      <div id="features" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mt-2">
                Create Magic
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Powerful tools designed for creators, teams, and visionaries to bring their ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="
                relative overflow-hidden group
                bg-white/80 dark:bg-gray-900/60 backdrop-blur-md
                rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10
                shadow-lg sm:shadow-xl lg:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl
                transition-all duration-500 ease-out
                hover:-translate-y-2 sm:hover:-translate-y-3
                hover:border-blue-400/60 dark:hover:border-purple-400/60
              "
              >
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none" />

                {/* Icon with enhanced animation */}
                <div className="relative z-10 text-blue-500 group-hover:text-purple-400 transition duration-500 mb-4 sm:mb-6 text-3xl sm:text-4xl transform group-hover:scale-110">
                  {feature.icon}
                </div>

                {/* Enhanced Title */}
                <h3 className="relative z-10 text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-400 transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Enhanced Description */}
                <p className="relative z-10 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section - Responsive */}
      <div className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-500/5 to-purple-600/5 dark:from-blue-500/10 dark:to-purple-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Ready to Create Something
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mt-2">
              Amazing?
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Join thousands of creators and teams who are already building the future with IntelliSpace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 sm:px-10 sm:py-4 lg:px-12 lg:py-5 rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition duration-300 font-semibold text-base sm:text-lg shadow-xl sm:shadow-2xl shadow-blue-500/30 hover:shadow-2xl sm:hover:shadow-3xl hover:shadow-purple-500/40 transform hover:scale-105 text-center"
            >
              Start Creating Free
            </Link>
            <Link
              href="/login"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 sm:px-10 sm:py-4 lg:px-12 lg:py-5 rounded-xl sm:rounded-2xl hover:bg-white dark:hover:bg-black hover:border-blue-300 dark:hover:border-purple-400 transition duration-300 font-semibold text-base sm:text-lg transform hover:scale-105 text-center"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Footer - Responsive */}
      <footer className="border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-lg py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Icons.Rocket />
              </div>
              <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">IntelliSpace</span>
            </div>
            <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <a href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition duration-200 font-medium">Privacy</a>
              <a href="/terms" className="hover:text-gray-900 dark:hover:text-white transition duration-200 font-medium">Terms</a>
              <a href="/support" className="hover:text-gray-900 dark:hover:text-white transition duration-200 font-medium">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-8">
            <p className="font-medium text-xs sm:text-sm">&copy; 2025 IntelliSpace. Built for creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}