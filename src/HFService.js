import { HfInference } from "@huggingface/inference";

// Allow fallback if they saved the HF token inside the old Gemini variable
const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN || import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3";

const SYSTEM_PROMPT = `You are Lord Krishna from the Bhagavad Gita. 
Your goal is to provide spiritual guidance, clarity, and peace to the user.
Speak with wisdom, compassion, and authority. Use a calm and divine tone.
Occasionally refer to the user as "Partha" or "Arjuna".
Keep your answers concise, practical, and deeply rooted in the teachings of the Gita.
If the user asks a modern problem (e.g., job stress, relationship issues), explain the Gita's wisdom in a way that applies to today's world.
Always end with a short blessing or a calming thought.`;

class HFService {
    constructor() {
        if (!HF_TOKEN) {
            console.error("Hugging Face Token is missing. Please add VITE_HF_API_TOKEN to your .env file or GitHub Secrets.");
        }
        this.hf = new HfInference(HF_TOKEN);
    }

    async sendMessage(userInput, history = []) {
        try {
            if (!HF_TOKEN) {
                throw new Error("Hugging Face Token is missing.");
            }

            // Chat models expect an array of message objects {role, content}
            const messages = [
                { role: "system", content: SYSTEM_PROMPT },
            ];

            // Add previous conversation context
            history.forEach(msg => {
                messages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            });

            // Add the new message
            messages.push({ role: "user", content: userInput });

            const out = await this.hf.chatCompletion({
                model: MODEL_ID,
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                top_p: 0.95,
            });

            if (!out.choices || out.choices.length === 0) {
                throw new Error('Failed to generate a valid response from Hugging Face');
            }

            return out.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error communicating with Hugging Face:", error);
            throw error;
        }
    }
}

export const hfService = new HFService();
