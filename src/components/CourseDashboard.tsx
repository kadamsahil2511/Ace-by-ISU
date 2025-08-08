import { useState, useEffect, useRef } from 'react';
import BackButton from './BackButton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CoursePreferences {
  programming_experience: string;
  cpp_level: string;
  study_time: string;
  learning_goal: string;
  preferred_learning: string;
}

const CourseDashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const preferences: CoursePreferences = currentUser?.coursePreferences?.cpp || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial API call with user preferences
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: 'Please create a personalized C++ learning roadmap and initial guidance based on my background'
                  }
                ]
              }
            ],
            systemInstruction: {
              role: 'user',
              parts: [
                {
                  text: `Student Background:
                    - Programming Experience: ${preferences.programming_experience}
                    - C++ Knowledge Level: ${preferences.cpp_level}
                    - Available Study Time: ${preferences.study_time}
                    - Learning Goal: ${preferences.learning_goal}
                    - Preferred Learning Style: ${preferences.preferred_learning}`
                }
              ]
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
        if (data.candidates && data.candidates[0].content) {
          setMessages([
            {
              role: 'assistant',
              content: data.candidates[0].content.parts[0].text
            }
          ]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages([
          {
            role: 'assistant',
            content: 'I apologize, but I encountered an error while generating your personalized roadmap. Please try again or contact support.'
          }
        ]);
      }
      setIsLoading(false);
    };

    initializeChat();
  }, []);

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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            ...messages,
            newMessage
          ].map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          systemInstruction: {
            role: 'user',
            parts: [
              {
                text: `You're a C++ tutor. Student Background:
                  - Programming Experience: ${preferences.programming_experience}
                  - C++ Knowledge Level: ${preferences.cpp_level}
                  - Available Study Time: ${preferences.study_time}
                  - Learning Goal: ${preferences.learning_goal}
                  - Preferred Learning Style: ${preferences.preferred_learning}`
              }
            ]
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
      if (data.candidates && data.candidates[0].content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support.'
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-8">
          <h1 className="text-2xl font-bold text-white mb-6">C++ Learning Assistant</h1>
          
          {/* Chat Messages */}
          <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-300 rounded-lg p-4">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question about C++..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard; 