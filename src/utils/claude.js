import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude AI utility for StagemateAI
 * This file provides functions to interact with Anthropic's Claude AI model
 */

// Initialize the Anthropic client
// You'll need to set ANTHROPIC_API_KEY in your .env.local file
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Make sure to add this to your .env.local
});

/**
 * Send a message to Claude and get a response
 * @param {string} prompt - The user's message to Claude
 * @param {string} [systemPrompt] - Optional system prompt to guide Claude's behavior
 * @param {string} [model="claude-3-opus-20240229"] - The Claude model to use
 * @returns {Promise<string>} - Claude's response text
 */
export async function askClaude(prompt, systemPrompt = "", model = "claude-3-opus-20240229") {
  try {
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt || "You are Claude, an AI assistant by Anthropic. You are helpful, harmless, and honest.",
      messages: [
        { role: "user", content: prompt }
      ],
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw new Error(`Failed to get response from Claude: ${error.message}`);
  }
}

/**
 * Stream a response from Claude
 * @param {string} prompt - The user's message to Claude
 * @param {function} onChunk - Callback function that receives each chunk of the response
 * @param {string} [systemPrompt] - Optional system prompt to guide Claude's behavior
 * @param {string} [model="claude-3-opus-20240229"] - The Claude model to use
 */
export async function streamClaude(prompt, onChunk, systemPrompt = "", model = "claude-3-opus-20240229") {
  try {
    const stream = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt || "You are Claude, an AI assistant by Anthropic. You are helpful, harmless, and honest.",
      messages: [
        { role: "user", content: prompt }
      ],
      stream: true,
    });
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.text) {
        onChunk(chunk.delta.text);
      }
    }
  } catch (error) {
    console.error("Error streaming from Claude API:", error);
    throw new Error(`Failed to stream response from Claude: ${error.message}`);
  }
}

export default {
  askClaude,
  streamClaude
};
