import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

interface Question {
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'text';
  options?: string[];
}

const CourseQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions: Question[] = [
    {
      id: 'programming_experience',
      question: 'Do you have any prior programming experience?',
      type: 'radio',
      options: ['No experience', 'Some experience', 'Experienced programmer']
    },
    {
      id: 'cpp_level',
      question: 'How would you rate your C++ knowledge?',
      type: 'radio',
      options: ['Beginner', 'Intermediate', 'Expert']
    },
    {
      id: 'study_time',
      question: 'How many hours per week can you dedicate to learning?',
      type: 'radio',
      options: ['1-2 hours', '3-5 hours', '5+ hours']
    },
    {
      id: 'learning_goal',
      question: 'What is your primary goal for learning C++?',
      type: 'radio',
      options: [
        'Academic requirement',
        'Competitive programming',
        'Software development',
        'Game development'
      ]
    },
    {
      id: 'preferred_learning',
      question: 'What is your preferred learning style?',
      type: 'radio',
      options: [
        'Video tutorials',
        'Reading documentation',
        'Practice problems',
        'Interactive coding'
      ]
    }
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
      currentUser.coursePreferences = {
        cpp: answers
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    navigate('/cpp/dashboard');
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-gray-400">
                Question {currentStep + 1} of {questions.length}
              </h2>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-6">
              {questions[currentStep].question}
            </h1>
            <div className="space-y-4">
              {questions[currentStep].options?.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-800 hover:border-blue-500/50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name={questions[currentStep].id}
                    value={option}
                    checked={answers[questions[currentStep].id] === option}
                    onChange={(e) => handleAnswer(questions[currentStep].id, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg ${
                currentStep === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentStep === questions.length - 1) {
                  handleSubmit();
                } else {
                  setCurrentStep(prev => Math.min(questions.length - 1, prev + 1));
                }
              }}
              disabled={!answers[questions[currentStep].id]}
              className={`px-6 py-2 rounded-lg ${
                !answers[questions[currentStep].id]
                  ? 'bg-blue-600/50 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === questions.length - 1 ? 'Start Learning' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseQuestionnaire; 