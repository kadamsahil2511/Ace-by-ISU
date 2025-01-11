import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import { Code2, Play, Eye } from 'lucide-react';

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sampleInput: string;
  sampleOutput: string;
  testCases: Array<{
    input: string;
    output: string;
  }>;
  solution: string;
}

// Use the environment variable
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

const generatePrompt = `Create a beginner-friendly C++ programming question with the following format:
{
  "title": "A clear, concise title",
  "description": "Detailed problem description with clear input/output specifications",
  "sampleInput": "Example input",
  "sampleOutput": "Example output",
  "testCases": [
    {"input": "test input 1", "output": "expected output 1"},
    {"input": "test input 2", "output": "expected output 2"}
  ],
  "solution": "Complete C++ solution code"
}
Make sure the question is easy and suitable for beginners learning C++.`;

const CodingEnvironment = () => {
  const [code, setCode] = useState<string>(
`#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`
  );
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sample questions (in a real app, these would come from an API)
  const easyQuestions: Question[] = [
    {
      id: 1,
      title: "Sum of Two Numbers",
      description: "Write a program to add two integers provided as input.\n\nInput Format:\nTwo space-separated integers a and b\n\nOutput Format:\nA single integer representing the sum of a and b",
      difficulty: "Easy",
      sampleInput: "5 3",
      sampleOutput: "8",
      testCases: [
        { input: "5 3", output: "8" },
        { input: "-1 7", output: "6" },
        { input: "0 0", output: "0" }
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`
    },
    // Add more questions here
  ];

  useEffect(() => {
    // Load a random question when component mounts
    const randomIndex = Math.floor(Math.random() * easyQuestions.length);
    setCurrentQuestion(easyQuestions[randomIndex]);
  }, []);

  const runCode = async () => {
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
              text: `You are a C++ compiler. Execute this code and return ONLY the output:

${code}

Input:
${input}

Return ONLY the program output, nothing else.`
            }]
          }],
          generationConfig: {
            temperature: 0,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        setOutput(data.candidates[0].content.parts[0].text.trim());
      }
    } catch (error) {
      setOutput('Error running code: ' + error);
    }
    setIsLoading(false);
  };

  const checkSolution = async () => {
    if (!currentQuestion) return;
    
    setIsLoading(true);
    let allTestsPassed = true;
    let testResults = '';

    try {
      for (const [index, testCase] of currentQuestion.testCases.entries()) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `You are a C++ code tester. Compare the output of this code with the expected output.

Code:
${code}

Input:
${testCase.input}

Expected Output:
${testCase.output}

Reply with EXACTLY "PASS" if the code produces the expected output, or "FAIL" if it doesn't. No other text.`
              }]
            }],
            generationConfig: {
              temperature: 0,
              topK: 1,
              topP: 1,
              maxOutputTokens: 128
            }
          })
        });

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text.trim();
        const passed = result === 'PASS';
        testResults += `Test Case ${index + 1}: ${passed ? 'PASSED ✓' : 'FAILED ✗'}\n`;
        if (!passed) allTestsPassed = false;
      }

      setOutput(testResults);

      if (allTestsPassed) {
        setTimeout(() => {
          setOutput(testResults + '\nCongratulations! All tests passed. Loading next question...');
          setTimeout(() => {
            // Get next random question
            const nextIndex = Math.floor(Math.random() * easyQuestions.length);
            setCurrentQuestion(easyQuestions[nextIndex]);
            // Reset code editor
            setCode(`#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`);
            setShowSolution(false);
            setInput('');
            setOutput('');
          }, 2000);
        }, 1000);
      }
    } catch (error) {
      setOutput('Error checking solution: ' + error);
    }
    setIsLoading(false);
  };

  const generateNewQuestion = async () => {
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
              text: generatePrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        try {
          const questionText = data.candidates[0].content.parts[0].text;
          const questionData = JSON.parse(questionText);
          setCurrentQuestion({
            id: Math.floor(Math.random() * 1000),
            title: questionData.title,
            description: questionData.description,
            difficulty: 'Easy',
            sampleInput: questionData.sampleInput,
            sampleOutput: questionData.sampleOutput,
            testCases: questionData.testCases,
            solution: questionData.solution
          });
          // Reset editor state
          setCode(`#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`);
          setShowSolution(false);
          setInput('');
          setOutput('');
        } catch (error) {
          console.error('Error parsing question:', error);
          // Fallback to sample question if parsing fails
          const randomIndex = Math.floor(Math.random() * easyQuestions.length);
          setCurrentQuestion(easyQuestions[randomIndex]);
        }
      }
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback to sample question if API call fails
      const randomIndex = Math.floor(Math.random() * easyQuestions.length);
      setCurrentQuestion(easyQuestions[randomIndex]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        
        {/* Question Section */}
        <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{currentQuestion?.title}</h2>
            <div className="flex items-center space-x-4">
              <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm">
                Easy
              </span>
              <button
                onClick={generateNewQuestion}
                className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Next Question'}
              </button>
            </div>
          </div>
          <p className="text-gray-400 whitespace-pre-wrap mb-4">{currentQuestion?.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Sample Input:</h3>
              <pre className="text-white">{currentQuestion?.sampleInput}</pre>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Sample Output:</h3>
              <pre className="text-white">{currentQuestion?.sampleOutput}</pre>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Editor Section */}
          <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Code2 className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-white">Code Editor</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
                <button
                  onClick={runCode}
                  className="flex items-center px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run Code
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 bg-gray-800 text-white font-mono p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck="false"
            />
            {showSolution && currentQuestion && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Solution:</h3>
                <pre className="bg-gray-800 p-4 rounded-lg text-white font-mono overflow-x-auto">
                  {currentQuestion.solution}
                </pre>
              </div>
            )}
          </div>

          {/* Input/Output Section */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Input</h2>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                className="w-full h-32 bg-gray-800 text-white font-mono p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck="false"
              />
            </div>

            <div className="bg-gray-900 rounded-xl border border-blue-900/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Output</h2>
              <pre className="w-full h-32 bg-gray-800 text-white font-mono p-4 rounded-lg overflow-y-auto whitespace-pre-wrap">
                {isLoading ? 'Running...' : output || 'No output yet'}
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={checkSolution}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingEnvironment;