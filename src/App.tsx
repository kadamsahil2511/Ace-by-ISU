import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Facebook, Twitter, Linkedin, Instagram, ChevronDown } from 'lucide-react';
import SubjectsPage from './components/SubjectsPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import CourseQuestionnaire from './components/CourseQuestionnaire';
import CourseDashboard from './components/CourseDashboard';
import CppDashboard from './components/CppDashboard';
import CodingEnvironment from './components/CodingEnvironment';
import MockViva from './components/MockViva';
import DialogflowMessenger from './components/DialogflowMessenger';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  return (
    <Router>
      <div className="min-h-screen bg-gray-950">
        <nav className="border-b border-blue-900/30 bg-gray-950/30 backdrop-blur-lg fixed w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <GraduationCap className="w-8 h-8 text-blue-500" />
                  <span className="ml-2 text-xl font-bold text-white">Ace by ISU</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <>
                    <Link to="/profile" className="text-gray-300 hover:text-white">
                      Welcome, {currentUser.name}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-white px-3 py-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2">
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cpp/questionnaire" element={<CourseQuestionnaire />} />
          <Route path="/cpp/dashboard" element={<CppDashboard />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<CodingEnvironment />} />
          <Route path="/mock-viva" element={<MockViva />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-950 border-t border-blue-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-8 h-8 text-blue-500" />
                  <span className="ml-2 text-xl font-bold text-white">Ace by ISU</span>
                </div>
                <p className="text-gray-400 mb-4">Empowering B.Tech students with AI-driven learning solutions.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-blue-500"><Facebook className="w-5 h-5" /></a>
                  <a href="#" className="text-gray-400 hover:text-blue-500"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="text-gray-400 hover:text-blue-500"><Linkedin className="w-5 h-5" /></a>
                  <a href="#" className="text-gray-400 hover:text-blue-500"><Instagram className="w-5 h-5" /></a>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Study Materials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Practice Tests</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Video Tutorials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Partners</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Cookie Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-blue-500">Accessibility</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-blue-900/30 mt-8 pt-8 text-center">
              <p className="text-gray-400">&copy; {new Date().getFullYear()} Ace by ISU. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Add DialogflowMessenger */}
        <DialogflowMessenger />
      </div>
    </Router>
  );
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Master Your B.Tech Journey
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Comprehensive study resources and personalized guidance for B.Tech students preparing for semester examinations.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div 
          onClick={() => navigate('/subjects')}
          className="bg-gray-950 p-8 rounded-xl border border-blue-900/30 hover:border-blue-600/50 transition-all cursor-pointer group"
        >
          <h3 className="text-xl font-bold text-white mb-4">Personalized Learning Guide</h3>
          <p className="text-gray-400 mb-6">Smart study plans tailored to your learning style and pace</p>
          <span className="text-blue-500 group-hover:text-blue-400 font-medium">
            Explore Now →
          </span>
        </div>

        <div 
          onClick={() => navigate('/practice')}
          className="bg-gray-950 p-8 rounded-xl border border-blue-900/30 hover:border-blue-600/50 transition-all cursor-pointer group"
        >
          <h3 className="text-xl font-bold text-white mb-4">Practice Coding with AI</h3>
          <p className="text-gray-400 mb-6">Interactive coding sessions with real-time feedback and guidance</p>
          <span className="text-blue-500 group-hover:text-blue-400 font-medium">
            Start Coding →
          </span>
        </div>

        <div 
          onClick={() => navigate('/mock-viva')}
          className="bg-gray-950 p-8 rounded-xl border border-blue-900/30 hover:border-blue-600/50 transition-all cursor-pointer group"
        >
          <h3 className="text-xl font-bold text-white mb-4">Mock Vivas with AI Companion</h3>
          <p className="text-gray-400 mb-6">Practice technical interviews with intelligent conversation partner</p>
          <span className="text-blue-500 group-hover:text-blue-400 font-medium">
            Start Practice →
          </span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="border border-blue-900/30 rounded-lg p-4 hover:border-blue-600/50 transition-all">
            <button className="flex justify-between items-center w-full text-left">
              <h3 className="text-lg font-semibold text-white">How does the AI learning companion work?</h3>
              <ChevronDown className="w-5 h-5 text-blue-500" />
            </button>
            <p className="mt-2 text-gray-400">Our AI companion adapts to your learning style, providing personalized feedback and guidance throughout your study sessions. It analyzes your performance and adjusts the difficulty level accordingly.</p>
          </div>
          <div className="border border-blue-900/30 rounded-lg p-4 hover:border-blue-600/50 transition-all">
            <button className="flex justify-between items-center w-full text-left">
              <h3 className="text-lg font-semibold text-white">What subjects are covered in the practice sessions?</h3>
              <ChevronDown className="w-5 h-5 text-blue-500" />
            </button>
            <p className="mt-2 text-gray-400">We cover all core B.Tech subjects including Data Structures, Algorithms, Database Management, Operating Systems, and more. Our content is regularly updated to match the latest curriculum.</p>
          </div>
          <div className="border border-blue-900/30 rounded-lg p-4 hover:border-blue-600/50 transition-all">
            <button className="flex justify-between items-center w-full text-left">
              <h3 className="text-lg font-semibold text-white">How can I track my progress?</h3>
              <ChevronDown className="w-5 h-5 text-blue-500" />
            </button>
            <p className="mt-2 text-gray-400">Our platform provides detailed analytics and progress tracking. You can view your performance metrics, completion rates, and improvement areas through your personalized dashboard.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;