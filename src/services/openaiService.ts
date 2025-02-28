import axios from "axios";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openaiUrl = "https://api.openai.com/v1/chat/completions"; // Example for GPT


export const fetchOpenAIResponse = async (imageBase64: string) => {
    try {
        const response = await axios.post(
            openaiUrl,
            {
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: "make a list of all the pokemon cards that are in the image provided. Please only name the pokemon and include the set number seen at the bottom right" },
                      {
                        type: "image_url",
                        image_url: {
                          "url": imageBase64,
                        },
                      },
                    ],
                  },
                ],
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
