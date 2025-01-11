import React, { useState, useEffect, useRef } from 'react';
import BackButton from './BackButton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StudyPlan {
  title: string;
  description: string;
  topics: string[];
  estimatedTime: string;
}

const CppDashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user preferences and generate initial study plan
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser?.coursePreferences?.cpp) {
      generateInitialPlan(currentUser.coursePreferences.cpp);
    }
  }, []);

  const generateInitialPlan = async (preferences: any) => {
    setIsLoading(true);
    try {
      const systemPrompt = `
        Student Background:
        - Programming Experience: ${preferences.programming_experience}
        - C++ Knowledge Level: ${preferences.cpp_level}
        - Available Study Time: ${preferences.study_time}
        - Learning Goal: ${preferences.learning_goal}
        - Preferred Learning Style: ${preferences.preferred_learning}
      `;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: 'Based on my background, create a detailed C++ study roadmap with topics, subtopics, and estimated completion time.'
            }]
          }],
          systemInstruction: {
            role: 'user',
            parts: [{
              text: systemPrompt
            }]
          },
          generationConfig: {
            temperature: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });

      const data = await response.json();
      // Process the response and set the study plan
      setStudyPlan({
        title: 'Your Personalized C++ Learning Path',
        description: data.text,
        topics: [], // Parse topics from the response
        estimatedTime: preferences.study_time
      });

      // Add initial message from tutor
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your C++ tutor. I've created a personalized study plan based on your background. Feel free to ask any questions about C++ concepts, and I'll help you understand them better!"
      }]);
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const preferences = currentUser?.coursePreferences?.cpp;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [
            ...messages.map(msg => ({
              role: msg.role,
              parts: [{ text: msg.content }]
            })),
            {
              role: 'user',
              parts: [{ text: inputMessage }]
            }
          ],
          systemInstruction: {
            role: 'user',
            parts: [{
              text: "You're a C++ tutor who's job is to teach C++ concepts clearly and help students understand programming better."
            }]
          },
          generationConfig: {
            temperature: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Study Plan Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{studyPlan?.title}</h2>
              {isLoading && !studyPlan ? (
                <div className="text-gray-400">Generating your personalized study plan...</div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400">{studyPlan?.description}</p>
                  {/* Add more study plan details here */}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6 h-[600px] flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-300 rounded-lg p-4">
                      Typing...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask anything about C++..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CppDashboard;