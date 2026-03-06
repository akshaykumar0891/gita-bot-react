const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN;
const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3";

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
            // Format history for Mistral Chat format
            let prompt = `<s>[INST] ${SYSTEM_PROMPT} [/INST] </s>`;

            // Add previous conversation context
            history.forEach(msg => {
                const role = msg.sender === 'user' ? ' [INST] ' : ' ';
                const endRole = msg.sender === 'user' ? ' [/INST] ' : ' </s>';
                prompt += `${role}${msg.text}${endRole}`;
            });

            // Add the new message
            prompt += ` [INST] ${userInput} [/INST]`;

            if (!HF_TOKEN) {
                throw new Error("Hugging Face Token is missing. Please add VITE_HF_API_TOKEN to your .env file or GitHub Secrets.");
            }

            const response = await fetch(
                `https://api-inference.huggingface.co/models/${MODEL_ID}`,
                {
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
                            wait_for_model: true // Important: Wakes up the model if sleeping
                        }
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to connect to Hugging Face');
            }

            // Hugging Face returns an array with generated_text
            let reply = result[0]?.generated_text || result.generated_text;

            // Cleanup: Sometimes Mistral repeats the prompt or tags
            reply = reply.replace(/\[\/INST\]/g, '').replace(/<s>/g, '').replace(/<\/s>/g, '').trim();

            return reply;
        } catch (error) {
            console.error("Error communicating with Hugging Face:", error);
            throw error;
        }
    }
}

export const hfService = new HFService();
