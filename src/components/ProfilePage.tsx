import React from 'react';
import BackButton from './BackButton';

const ProfilePage = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  // Dummy data for the student profile
  const studentData = {
    name: currentUser?.name || 'Guest',
    email: currentUser?.email || '',
    college: currentUser?.college || 'Not specified',
    studentId: 'STU2024001',
    semester: '6th Semester',
    branch: 'Computer Science',
    progress: {
      cpp: 65,
      python: 0,
      csf: 0
    },
    achievements: [
      'Completed C++ Basics Module',
      'Solved 50+ Practice Problems',
      'Weekly Coding Streak: 3 weeks'
    ],
    recentActivities: [
      { date: '2024-01-15', activity: 'Completed Arrays in C++' },
      { date: '2024-01-14', activity: 'Solved 5 Practice Problems' },
      { date: '2024-01-12', activity: 'Started Pointers Module' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-8">
          {/* Profile Header */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {studentData.name.charAt(0)}
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-white">{studentData.name}</h1>
              <p className="text-gray-400">{studentData.email}</p>
              <p className="text-gray-400">{studentData.college}</p>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Academic Information</h2>
              <div className="space-y-2">
                <p className="text-gray-400">Student ID: <span className="text-white">{studentData.studentId}</span></p>
                <p className="text-gray-400">Semester: <span className="text-white">{studentData.semester}</span></p>
                <p className="text-gray-400">Branch: <span className="text-white">{studentData.branch}</span></p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Course Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">C++ Programming</span>
                    <span className="text-white">{studentData.progress.cpp}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: `${studentData.progress.cpp}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Python</span>
                    <span className="text-white">{studentData.progress.python}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: `${studentData.progress.python}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">CSF</span>
                    <span className="text-white">{studentData.progress.csf}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: `${studentData.progress.csf}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements and Recent Activities */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
              <ul className="space-y-2">
                {studentData.achievements.map((achievement, index) => (
                  <li key={index} className="text-gray-400 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {studentData.recentActivities.map((activity, index) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <p className="text-sm text-gray-500">{activity.date}</p>
                    <p className="text-gray-400">{activity.activity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 