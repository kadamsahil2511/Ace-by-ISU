import { useState, useEffect, useRef } from 'react';
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

if (!API_KEY) {
  console.error('Missing Gemini API key. Make sure VITE_GEMINI_API_KEY is set in your environment variables.');
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Helper function to make API calls with retry logic
const makeApiCall = async (payload: any, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 429 && attempt < maxRetries) {
        // Wait before retrying
        const waitTime = 2000 * attempt;
        console.log(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
};

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



  const generateInitialPlan = async (preferences: CoursePreferences) => {
    if (!API_KEY) {
      setMessages([{
        role: 'assistant',
        content: 'Error: Missing API key. Please contact support.'
      }]);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        contents: [{
          parts: [{
            text: `Create a detailed C++ study roadmap based on my background. Format the response in a clear, readable way with sections and bullet points.
            
            My Background:
            - Programming Experience: ${preferences.programming_experience}
            - C++ Knowledge Level: ${preferences.cpp_level}  
            - Available Study Time: ${preferences.study_time}
            - Learning Goal: ${preferences.learning_goal}
            - Preferred Learning Style: ${preferences.preferred_learning}
            
            Please provide a structured roadmap with topics, estimated time, and learning resources.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2048,
          candidateCount: 1
        }
      };

      const content = await makeApiCall(payload);
      
      setStudyPlan({
        title: 'Your Personalized C++ Learning Path',
        description: content,
        topics: content.split('\n').filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•')),
        estimatedTime: preferences.study_time
      });

      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your C++ tutor. I've created a personalized study plan based on your background. Feel free to ask any questions about C++ concepts, and I'll help you understand them better!"
      }]);
    } catch (error) {
      console.error('Error generating study plan:', error);
      let errorMessage = 'I apologize, but I encountered an error while generating your study plan.';
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = 'The AI service is currently busy due to high demand. Please wait a moment and try again.';
        } else if (error.message.includes('API call failed')) {
          errorMessage = 'There was a problem connecting to the AI service. Please check your connection and try again.';
        }
      }
      
      setMessages([{
        role: 'assistant',
        content: errorMessage + ' Please contact support if the issue persists.'
      }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!API_KEY) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Missing API key. Please contact support.'
      }]);
      return;
    }

    const newMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...messages.map(msg => ({
              parts: [{ text: `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}` }]
            })),
            {
              parts: [{ text: `User: ${inputMessage}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 2048,
            candidateCount: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat API Response:', data);

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      const responseContent = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseContent
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`
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