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

interface CoursePreferences {
  programming_experience: string;
  cpp_level: string;
  study_time: string;
  learning_goal: string;
  preferred_learning: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

const scrollbarHideStyles = `
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const CppDashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser?.coursePreferences?.cpp) {
      generateInitialPlan(currentUser.coursePreferences.cpp);
    }
  }, []);

  const formatResponse = (text: string) => {
    // Remove any JSON formatting if present
    try {
      const parsed = JSON.parse(text);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    } catch {
      // If it's not JSON, return the text as is
      return text;
    }
  };

  const generateInitialPlan = async (preferences: CoursePreferences) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: 'Based on my background, create a detailed C++ study roadmap with topics, subtopics, and estimated completion time. Format the response in a clear, readable way.'
            }]
          }],
          systemInstruction: {
            role: 'user',
            parts: [{
              text: `You're a C++ tutor who's job is to design course and teach as per the background sent by the user. 
              Provide responses in clear text format, not JSON.
              Student Background:
              - Programming Experience: ${preferences.programming_experience}
              - C++ Knowledge Level: ${preferences.cpp_level}
              - Available Study Time: ${preferences.study_time}
              - Learning Goal: ${preferences.learning_goal}
              - Preferred Learning Style: ${preferences.preferred_learning}`
            }]
          },
          generationConfig: {
            temperature: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain"
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        const content = formatResponse(data.candidates[0].content.parts[0].text);
        setStudyPlan({
          title: 'Your Personalized C++ Learning Path',
          description: content,
          topics: content.split('\n').filter(line => line.trim().startsWith('-')),
          estimatedTime: preferences.study_time
        });

        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your C++ tutor. I've created a personalized study plan based on your background. Feel free to ask any questions about C++ concepts, and I'll help you understand them better!"
        }]);
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      setMessages([{
        role: 'assistant',
        content: 'I apologize, but I encountered an error while generating your study plan. Please try again or contact support.'
      }]);
    }
    setIsLoading(false);
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

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
              text: `You're a C++ tutor who's job is to design course and teach as per the background sent by the user.
              Format your responses in clear text, not JSON.
              Use proper formatting with line breaks and bullet points where appropriate.`
            }]
          },
          generationConfig: {
            temperature: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain"
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        const formattedContent = formatResponse(data.candidates[0].content.parts[0].text);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: formattedContent
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support.'
      }]);
    }
    setIsLoading(false);
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
            <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6 h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4">{studyPlan?.title}</h2>
              {isLoading && !studyPlan ? (
                <div className="text-gray-400">Generating your personalized study plan...</div>
              ) : (
                <div className="space-y-4 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="text-gray-400 whitespace-pre-wrap">{studyPlan?.description}</div>
                  {studyPlan?.topics && studyPlan.topics.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Key Topics:</h3>
                      <ul className="list-disc list-inside text-gray-400">
                        {studyPlan.topics.map((topic, index) => (
                          <li key={index}>{topic.replace('-', '').trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6 h-[600px] flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                      <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
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