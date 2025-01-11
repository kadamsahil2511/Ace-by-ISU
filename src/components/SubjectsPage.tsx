import React from 'react';
import { Code2, Clock } from 'lucide-react';
import BackButton from './BackButton';
import { useNavigate } from 'react-router-dom';

const SubjectsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <h1 className="text-4xl font-bold text-white mb-8">Available Subjects</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* C++ Card - Active */}
          <div className="bg-gray-900 rounded-xl border border-blue-600/50 p-6 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Code2 className="w-8 h-8 text-blue-500" />
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm">
                Active
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">C++ Programming</h3>
            <p className="text-gray-400 mb-4">
              Master C++ fundamentals, data structures, and algorithms with interactive lessons and practice problems.
            </p>
            <button 
              onClick={() => navigate('/cpp/questionnaire')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning
            </button>
          </div>

          {/* CSF Card - Coming Soon */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 opacity-75">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-gray-500" />
              <span className="bg-gray-700/30 text-gray-400 px-3 py-1 rounded-full text-sm">
                Coming Soon
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Computer System Fundamentals</h3>
            <p className="text-gray-400 mb-4">
              Learn about computer architecture, operating systems, and system design principles.
            </p>
            <button className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
              Coming Soon
            </button>
          </div>

          {/* Python Card - Coming Soon */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 opacity-75">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-gray-500" />
              <span className="bg-gray-700/30 text-gray-400 px-3 py-1 rounded-full text-sm">
                Coming Soon
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Python Programming</h3>
            <p className="text-gray-400 mb-4">
              Learn Python programming with hands-on projects and real-world applications.
            </p>
            <button className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage; 