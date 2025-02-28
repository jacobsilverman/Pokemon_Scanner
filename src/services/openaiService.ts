import axios from "axios";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openaiUrl = "https://api.openai.com/v1/chat/completions"; // Example for GPT

export const fetchOpenAIResponse = async (prompt: string) => {
    try {
        const response = await axios.post(
            openaiUrl,
            {
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
    }
};
