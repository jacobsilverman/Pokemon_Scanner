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
                      { type: "text", text: "From the card image; Please provide only the name of the pokemon on the card (not the evolution) in the top left, include the set number seen at the bottom left or right (careful reading 3 vs 8), and add the set that the card is from ex.prismatic evolutions. Write it in this format '{pokemon} {set #}, {set}', no other text" },
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
