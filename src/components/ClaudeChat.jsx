'use client';

import { useState } from 'react';
import { askClaude } from '../utils/claude';

export default function ClaudeChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const claudeResponse = await askClaude(prompt);
      setResponse(claudeResponse);
    } catch (error) {
      console.error('Error getting response from Claude:', error);
      setResponse('Sorry, there was an error communicating with Claude.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with Claude</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Claude something..."
            className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
          >
            {loading ? 'Thinking...' : 'Send to Claude'}
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Claude's Response:</h2>
          <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
