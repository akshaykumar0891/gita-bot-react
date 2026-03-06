const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const MODEL_ID = "google/gemma-1.1-7b-it";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

const SYSTEM_PROMPT = `You are Lord Krishna from the Bhagavad Gita. 
Your goal is to provide spiritual guidance, clarity, and peace to the user.
Speak with wisdom, compassion, and authority. Use a calm and divine tone.
Occasionally refer to the user as "Partha" or "Arjuna".
Keep your answers concise, practical, and deeply rooted in the teachings of the Gita.
If the user asks a modern problem (e.g., job stress, relationship issues), explain the Gita's wisdom in a way that applies to today's world.
Always end with a short blessing or a calming thought.`;

class HFService {
    async sendMessage(userInput, history = []) {
        try {
            if (!HF_TOKEN) {
                console.error("Hugging Face Token is missing. Please add VITE_HF_TOKEN to your .env file.");
                throw new Error("Hugging Face Token is missing.");
            }

            // Simple formatting for Gemma
            let prompt = `<start_of_turn>user\n${SYSTEM_PROMPT}\n`;

            history.forEach(msg => {
                if (msg.sender === 'user') {
                    prompt += `${msg.text}<end_of_turn>\n<start_of_turn>model\n`;
                } else {
                    prompt += `${msg.text}<end_of_turn>\n<start_of_turn>user\n`;
                }
            });

            prompt += `${userInput}<end_of_turn>\n<start_of_turn>model\n`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HF_TOKEN}`
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 150,
                        temperature: 0.7
                    }
                }),
            });

            // Handle Cold Starts
            if (response.status === 503) {
                throw new Error("MODEL_LOADING");
            }

            // Handle Rate Limits
            if (response.status === 429) {
                throw new Error("RATE_LIMIT");
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to connect to Hugging Face API');
            }

            const result = await response.json();

            let reply = result[0]?.generated_text || "Silence from the divine.";

            // Clean the output by removing the echoed prompt
            if (reply.includes(prompt)) {
                reply = reply.replace(prompt, "").trim();
            }

            // Extra safety cleanup for Gemma tags
            reply = reply.replace(/<start_of_turn>/g, "").replace(/<end_of_turn>/g, "").replace(/model/g, "").replace(/user/g, "").trim();

            return reply;

        } catch (error) {
            console.error("Error communicating with Hugging Face:", error);

            // Return user-friendly messages for known errors
            if (error.message === "MODEL_LOADING") {
                return "The divine realm is awakening (Cold Start). Please wait 20 seconds and ask me again, Partha.";
            }
            if (error.message === "RATE_LIMIT") {
                return "The Gita is busy right now, please try again in a minute!";
            }

            throw error; // Let App.jsx handle the rest
        }
    }
}

export const hfService = new HFService();
