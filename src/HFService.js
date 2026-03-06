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
    }

    async sendMessage(userInput, history = []) {
        try {
            if (!HF_TOKEN) {
                throw new Error("Hugging Face Token is missing.");
            }

            // Fallback to manual fetch with CORS proxy
            // Note: users must click a button at https://cors-anywhere.herokuapp.com/corsdemo to unlock this
            const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
            const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

            // Format history for Mistral Chat format manually since we are using fetch
            let prompt = `<s>[INST] ${SYSTEM_PROMPT} [/INST] </s>`;

            history.forEach(msg => {
                const role = msg.sender === 'user' ? ' [INST] ' : ' ';
                const endRole = msg.sender === 'user' ? ' [/INST] ' : ' </s>';
                prompt += `${role}${msg.text}${endRole}`;
            });

            prompt += ` [INST] ${userInput} [/INST]`;

            const response = await fetch(PROXY_URL + API_URL, {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        top_p: 0.95,
                        return_full_text: false,
                    },
                    options: {
                        wait_for_model: true
                    }
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error && result.error.includes("cors-anywhere")) {
                    throw new Error('CORS Proxy locked! Please visit https://cors-anywhere.herokuapp.com/corsdemo to temporarily unlock it.');
                }
                throw new Error(result.error || 'Failed to connect to Hugging Face');
            }

            let reply = result[0]?.generated_text || result.generated_text || "Silence from the divine.";
            reply = reply.replace(/\[\/INST\]/g, '').replace(/<s>/g, '').replace(/<\/s>/g, '').trim();

            return reply;

        } catch (error) {
            console.error("Error communicating with Hugging Face:", error);
            throw error;
        }
    }
}

export const hfService = new HFService();
