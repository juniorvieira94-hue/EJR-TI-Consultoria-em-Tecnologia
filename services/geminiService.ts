
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatInstance: Chat | null = null;

const apiKey = process.env.API_KEY;

export const getChatInstance = (): Chat => {
  if (!apiKey) {
    console.error("API Key is missing. Please set process.env.API_KEY");
  }

  if (!chatInstance) {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    chatInstance = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatInstance;
};

export const resetChat = () => {
    chatInstance = null;
    return getChatInstance();
};
