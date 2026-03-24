import { GoogleGenAI, Type } from "@google/genai";
import { Tone } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

/**
 * Safely parses JSON from a string that might contain extra text or markdown.
 */
function safeJsonParse<T>(text: string, defaultValue: T): T {
  try {
    // 1. Try direct parse
    return JSON.parse(text.trim());
  } catch (e) {
    console.warn("Direct JSON parse failed, attempting extraction:", e);
    // 2. Try to extract JSON from markdown backticks or extra text
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.error("JSON extraction also failed:", innerError);
      }
    }
    return defaultValue;
  }
}

export async function generateReplies(message: string, tone: Tone): Promise<string[]> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert chat assistant for a platform called ChatFaker AI. 
  Your goal is to generate 3 different, highly engaging, and contextually relevant replies to a given chat message.
  The tone of the replies should be: ${tone}.
  
  Tones:
  - funny: Hilarious, witty, and lighthearted.
  - savage: Bold, direct, and slightly "toxic" but in a fun way.
  - smart: Intellectual, well-thought-out, and impressive.
  - sad: Empathetic, emotional, and supportive.
  - friendly: Kind, warm, and approachable.
  - professional: Formal, polite, and business-like.
  - rizz: Flirty, smooth, confident, and romantic.
  
  Return the replies as a JSON array of strings. Do not include any other text.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `The message to reply to is: "${message}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    const text = response.text;
    if (text) {
      return safeJsonParse(text, ["Error generating replies", "Try again", "Something went wrong"]);
    }
    return ["Error generating replies", "Try again", "Something went wrong"];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["AI is currently offline", "Please try again later", "Error occurred"];
  }
}

export async function analyzeScreenshot(base64Image: string): Promise<{ message: string; suggestedTone: Tone }> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert at analyzing chat screenshots. 
  Extract the last message received in the chat and suggest an appropriate tone for a reply.
  Return a JSON object with "message" (string) and "suggestedTone" (one of: funny, savage, smart, sad, friendly, professional, rizz).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: base64Image.split(",")[1] || base64Image } },
          { text: "Extract the last message and suggest a tone." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            suggestedTone: { type: Type.STRING, enum: ['funny', 'savage', 'smart', 'sad', 'friendly', 'professional', 'rizz'] }
          },
          required: ['message', 'suggestedTone']
        }
      },
    });

    const text = response.text;
    if (text) {
      return safeJsonParse(text, { message: "Could not read message", suggestedTone: "friendly" as Tone });
    }
    return { message: "Could not read message", suggestedTone: "friendly" };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { message: "Error analyzing image", suggestedTone: "friendly" };
  }
}

export async function generateChatStory(scenario: string, tone: string): Promise<{ contactName: string; messages: { text: string; sender: 'me' | 'them' }[] }> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert creative writer specializing in realistic chat conversations.
  Generate a full chat conversation based on the user's scenario and tone.
  
  Scenario: ${scenario}
  Tone: ${tone}
  
  Rules:
  1. Generate a realistic contact name.
  2. Generate 5-10 messages.
  3. Alternate between 'me' and 'them' naturally.
  4. The conversation must strictly follow the requested tone.
  5. Return a JSON object with:
     - contactName: string
     - messages: array of objects with { text: string, sender: 'me' | 'them', reactions?: string[] }
  
  Note: Include reactions (👍, ❤️, 😂, 😮, 😢, 🙏) only if they add to the realism or humor of the conversation.
  
  Do not include any other text.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a chat story for: ${scenario}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING },
            messages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  sender: { type: Type.STRING, enum: ['me', 'them'] },
                  reactions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['text', 'sender']
              }
            }
          },
          required: ['contactName', 'messages']
        }
      },
    });

    const text = response.text;
    if (text) {
      return safeJsonParse(text, { contactName: "Unknown", messages: [] });
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Story Error:", error);
    throw error;
  }
}

export async function generateWritingAssistantContent(
  mode: 'texting' | 'study',
  type: string,
  input: string,
  options: {
    tone?: string;
    recipient?: string;
    subject?: string;
    isKidFriendly?: boolean;
    context?: string;
  }
): Promise<string[]> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert AI Writing Assistant for ChatFaker AI.
  Your goal is to generate 3 high-quality, engaging, and contextually accurate versions of the requested content.
  
  Mode: ${mode}
  Type: ${type}
  Kid Friendly: ${options.isKidFriendly ? 'YES (Use simple English, short sentences, easy explanations)' : 'NO'}
  
  Additional Context:
  - Tone: ${options.tone || 'N/A'}
  - Recipient: ${options.recipient || 'N/A'}
  - Subject: ${options.subject || 'N/A'}
  - Chat Context: ${options.context || 'N/A'}
  
  Rules:
  1. If mode is 'texting', generate short, conversational, and realistic chat messages.
  2. If type is 'rizz', be flirty, smooth, and confident.
  3. If mode is 'study', follow the correct structure for emails, letters, notes, or notices.
  4. For 'email', include a clear subject line and formal/friendly greeting/closing.
  5. For 'letter', include sender/receiver placeholders and formal structure.
  6. For 'notice', include Title, Date, Content, and Signature placeholders.
  7. Return the 3 versions as a JSON array of strings. Do not include any other text.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate content for: ${input}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    const text = response.text;
    if (text) {
      return safeJsonParse(text, ["Error generating content", "Please try again", "Something went wrong"]);
    }
    return ["Error generating content", "Please try again", "Something went wrong"];
  } catch (error) {
    console.error("Gemini Writing Assistant Error:", error);
    return ["AI is currently offline", "Please try again later", "Error occurred"];
  }
}
