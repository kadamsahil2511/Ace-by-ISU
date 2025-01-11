import React, { useState, useRef, useEffect } from 'react';
import BackButton from './BackButton';
import { Send, Book, XCircle, Mic, MicOff, Volume2, VolumeX, Clock, History, Brain } from 'lucide-react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Report {
  strengths: string[];
  improvements: string[];
  overallPerformance: string;
  score: number;
}

interface InterviewSession {
  id: string;
  topic: string;
  date: string;
  duration: number;
  score: number;
  difficulty: string;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing Gemini API key. Make sure VITE_GEMINI_API_KEY is set in your environment variables.');
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

const topics = [
  'C++ Basics',
  'Object-Oriented Programming',
  'Data Structures',
  'Algorithms',
  'Memory Management',
  'STL Library',
  'Exception Handling',
  'File Handling',
  'Templates',
  'Multithreading'
];

const makeApiCall = async (prompt: string) => {
  try {
    console.log('Making API call with key:', API_KEY?.slice(0, 5) + '...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          candidateCount: 1,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', errorData);
      throw new Error(`API call failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

const MockViva = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<typeof window.webkitSpeechRecognition>();
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [timer, setTimer] = useState(0);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');

        setInputMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      // Auto-send message when stopping listening
      if (inputMessage.trim()) {
        sendMessage();
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = async (text: string) => {
    if (!isVoiceMode) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Load past sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('vivaHistory');
    if (savedSessions) {
      setPastSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (hasStarted && !isEnded) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasStarted, isEnded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const savePastSession = (score: number) => {
    const session: InterviewSession = {
      id: Date.now().toString(),
      topic: selectedTopic,
      date: new Date().toLocaleDateString(),
      duration: timer,
      score,
      difficulty
    };
    const updatedSessions = [session, ...pastSessions].slice(0, 10); // Keep last 10 sessions
    setPastSessions(updatedSessions);
    localStorage.setItem('vivaHistory', JSON.stringify(updatedSessions));
  };

  const startViva = async () => {
    if (!selectedTopic) return;
    
    setIsLoading(true);
    setHasStarted(true);
    setTimer(0);
    
    try {
      const prompt = `You are an experienced C++ technical interviewer conducting a ${difficulty} level interview. Follow these rules:
      1. Start with a brief introduction of yourself
      2. Ask your first question about ${selectedTopic}
      3. The question should be appropriate for ${difficulty} level
      4. Focus on conceptual understanding and practical applications
      5. Keep your response concise and clear
      
      Format your response as:
      [Introduction]: (your brief introduction)
      [First Question]: (your question)`;

      const message = await makeApiCall(prompt);
      setMessages([{
        role: 'assistant',
        content: message
      }]);
      if (isVoiceMode) {
        speakText(message);
      }
    } catch (error) {
      console.error('Error starting viva:', error);
      setMessages([{
        role: 'assistant',
        content: 'I apologize, but I encountered an error while starting the viva. Please try again.'
      }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = `Context: You are a C++ technical interviewer conducting a ${difficulty} level interview about ${selectedTopic}.
      Previous conversation:\n${messages.map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`).join('\n')}
      
      Candidate's latest response: ${userMessage}
      
      Rules:
      1. Maintain context of the entire conversation
      2. Evaluate the candidate's last response
      3. Provide brief, constructive feedback
      4. Ask the next question at ${difficulty} level
      5. Keep responses focused and clear
      
      Format your response as:
      [Feedback]: (brief feedback on the last answer)
      [Next Question]: (your next question)`;

      const message = await makeApiCall(prompt);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: message
      }]);
      if (isVoiceMode) {
        speakText(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
    }
    setIsLoading(false);
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const prompt = `You are a C++ technical interviewer. Analyze this ${difficulty} level interview about ${selectedTopic}.
      
      Interview conversation:
      ${messages.map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`).join('\n')}
      
      Generate a performance report in valid JSON format with this exact structure:
      {
        "strengths": ["strength1", "strength2"],
        "improvements": ["area1", "area2"],
        "overallPerformance": "detailed feedback",
        "score": 75
      }
      
      Rules:
      1. Response must be valid JSON
      2. Score should be between 0-100
      3. Consider the difficulty level (${difficulty}) when scoring
      4. Include at least 2 strengths and 2 improvements
      5. Provide detailed overall performance feedback`;

      const reportText = await makeApiCall(prompt);
      
      // Clean the response text
      const cleanedText = reportText
        .replace(/```json\n?|\n?```/g, '')  // Remove code blocks
        .replace(/[\u201C\u201D]/g, '"')    // Replace smart quotes
        .trim();
      
      const reportData = JSON.parse(cleanedText);
      
      // Validate report structure
      if (!Array.isArray(reportData.strengths) || reportData.strengths.length < 1 ||
          !Array.isArray(reportData.improvements) || reportData.improvements.length < 1 ||
          typeof reportData.overallPerformance !== 'string' || 
          typeof reportData.score !== 'number' ||
          reportData.score < 0 || reportData.score > 100) {
        throw new Error('Invalid report structure');
      }
      
      setReport(reportData);
      setIsEnded(true);
      savePastSession(reportData.score);
    } catch (error) {
      console.error('Error generating report:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but there was an error generating your performance report. Please try again.'
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        
        {!hasStarted ? (
          <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Book className="w-6 h-6 text-blue-500 mr-2" />
                <h1 className="text-2xl font-bold text-white">Select Topic for Mock Viva</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>
                <button
                  onClick={toggleVoiceMode}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isVoiceMode ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{isVoiceMode ? 'Voice Mode On' : 'Voice Mode Off'}</span>
                </button>
              </div>
            </div>

            {showHistory && (
              <div className="mb-6 bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Past Sessions</h2>
                <div className="space-y-3">
                  {pastSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                      <div>
                        <h3 className="text-white font-medium">{session.topic}</h3>
                        <p className="text-gray-400 text-sm">{session.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400">{formatTime(session.duration)}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          session.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          session.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {session.score}%
                        </span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          session.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          session.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {session.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                  {pastSessions.length === 0 && (
                    <p className="text-gray-400 text-center">No past sessions yet</p>
                  )}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">Select Difficulty</h2>
              <div className="flex space-x-4">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center space-x-2 ${
                      difficulty === level
                        ? level === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500'
                        : level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                        : 'bg-red-500/20 text-red-400 border-red-500'
                        : 'bg-gray-800 text-gray-400'
                    } border transition-all`}
                  >
                    <Brain className="w-4 h-4" />
                    <span>{level}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-4 rounded-lg border ${
                    selectedTopic === topic
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-blue-900/30 hover:border-blue-600/50 text-gray-400 hover:text-white'
                  } transition-all`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Selected Topic:</span>
                  <span className="text-white font-medium">{selectedTopic || 'None'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`px-3 py-1 rounded-lg text-sm ${
                    difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {difficulty}
                  </span>
                </div>
              </div>

              <button
                onClick={startViva}
                disabled={!selectedTopic || isLoading}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Starting...' : 'Start Mock Viva'}
              </button>
            </div>
          </div>
        ) : isEnded ? (
          <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Performance Report: {selectedTopic}</h1>
              <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm flex items-center">
                Score: {report?.score}%
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Strengths</h2>
                <ul className="list-disc list-inside space-y-2">
                  {report?.strengths.map((strength, index) => (
                    <li key={index} className="text-green-400">{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Areas for Improvement</h2>
                <ul className="list-disc list-inside space-y-2">
                  {report?.improvements.map((improvement, index) => (
                    <li key={index} className="text-yellow-400">{improvement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Overall Performance</h2>
                <p className="text-gray-400 whitespace-pre-wrap">{report?.overallPerformance}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">Mock Viva: {selectedTopic}</h1>
                <div className={`px-3 py-1 rounded text-sm ${
                  difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {difficulty}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timer)}</span>
                </div>
                <button
                  onClick={toggleVoiceMode}
                  className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                    isVoiceMode ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm">
                  In Progress
                </span>
                <button
                  onClick={generateReport}
                  disabled={isLoading || messages.length < 2}
                  className="flex items-center px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  End Viva
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="space-y-4 mb-6 h-[500px] overflow-y-auto scrollbar-hide"
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
                    {isSpeaking ? 'Speaking...' : 'Typing...'}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isVoiceMode ? "Speak your answer or type..." : "Type your answer..."}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {isVoiceMode && (
                <button
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-lg ${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockViva; 