// Allow fallback for older variables just in case
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_HF_API_TOKEN || import.meta.env.VITE_GEMINI_API_KEY;

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
            console.error("Hugging Face Token is missing. Please add VITE_HF_TOKEN to your .env file or GitHub Secrets.");
        }
    }

    async sendMessage(userInput, history = []) {
        try {
            if (!HF_TOKEN) {
                throw new Error("Hugging Face Token is missing.");
            }

            // Based on user request to use the specific model path exactly
            const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

            // Format history using the Mistral [INST] tags as requested for base inputs
            let prompt = `<s>[INST] ${SYSTEM_PROMPT} [/INST] </s>`;

            history.forEach(msg => {
                const role = msg.sender === 'user' ? ' [INST] ' : ' ';
                const endRole = msg.sender === 'user' ? ' [/INST] ' : ' </s>';
                prompt += `${role}${msg.text}${endRole}`;
            });

            prompt += ` [INST] ${userInput} [/INST]`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
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

            // Specific check for Rate Limiting
            if (response.status === 429) {
                throw new Error("RATE_LIMIT");
            }

            // Security Check/Fallback: Avoid `Unexpected token N` json parsing error
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to connect to Hugging Face');
            }

            // If we are here, it's safe to parse JSON
            const result = await response.json();

            let reply = result[0]?.generated_text || result.generated_text;

            if (!reply) {
                throw new Error("Silence from the divine.");
            }

            // Clean up left-over Mistral tags just in case return_full_text overrides
            reply = reply.replace(/\[\/INST\]/g, '').replace(/<s>/g, '').replace(/<\/s>/g, '').trim();

            return reply;

        } catch (error) {
            console.error("Error communicating with Hugging Face:", error);
            throw error;
        }
    }
}

export const hfService = new HFService();
