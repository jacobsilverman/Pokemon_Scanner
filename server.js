import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const VITE_EBAY_APP_ID = process.env.VITE_EBAY_PROD_APP_ID;
const VITE_EBAY_SECRET_ID = process.env.VITE_EBAY_PROD_CERT_ID;
const VITE_OPENAI_API_KEY= process.env.VITE_OPENAI_API_KEY;
console.log(VITE_EBAY_APP_ID);
console.log(VITE_EBAY_SECRET_ID);
console.log(VITE_OPENAI_API_KEY);

const VITE_EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const VITE_EBAY_FINDING_API_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const VITE_EBAY_SOLD_API_URL = "https://svcs.ebay.com/services/search/FindingService/v1";
const VITE_OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";  // Example for GPT

let token;

const getEbayOAuthToken = async () => {
  const authString = Buffer.from(`${VITE_EBAY_APP_ID}:${VITE_EBAY_SECRET_ID}`).toString("base64");

  try {
    const response = await axios.post(
      VITE_EBAY_OAUTH_URL,
      "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authString}`,
        },
      }
    );
    console.log(response.data.access_token)
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching eBay OAuth Token:", error.response ? error.response.data : error.message);
    throw new Error("Failed to fetch eBay OAuth Token");
  }
};

app.get("/api/ebay/buy", async (req, res) => {
  try {
    token = token || await getEbayOAuthToken();
    const { query, maxResults = 10 } = req.query;
    console.log("loading")

    const response = await axios.get(VITE_EBAY_FINDING_API_URL, {
      params: {
        // "category_ids":"183050",
        "q": query,
        "limit": maxResults,
        "sort": "bestMatch",
        "SECURITY-APPNAME": VITE_EBAY_APP_ID,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID':`VITE_EBAY_US`,
        'X-EBAY-C-ENDUSERCTX':`affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId></referenceId>`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching eBay buy items:", error);
    res.status(500).json({ error: error?.response?.data || "Failed to fetch data from eBay" });
  }
});

app.get("/api/ebay/sold", async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;
    console.log("loading")

    const response = await axios.get(VITE_EBAY_SOLD_API_URL, {
      params: {
        // "OPERATION-NAME": "findCompletedItems",
        // "SERVICE-VERSION": "1.13.0",
        // "SECURITY-APPNAME": `${VITE_EBAY_APP_ID}`,
        // "keywords": `${query}`,
        // "itemFilter.name": "SoldItemsOnly",
        // "itemFilter.value": "true",
        // "paginationInput.entriesPerPage": `${maxResults}`,
        "OPERATION-NAME": "findItemsByKeywords",
        "SERVICE-VERSION": "1.13.0",
        "SECURITY-APPNAME": VITE_EBAY_APP_ID, // No OAuth, just App ID
        "RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD": "",
        "keywords": query,
      },
      headers: {
        "X-EBAY-SOA-SECURITY-APPNAME": VITE_EBAY_APP_ID,
        'X-EBAY-C-MARKETPLACE-ID':`VITE_EBAY_US`,
        'X-EBAY-C-ENDUSERCTX':`affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId></referenceId>`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching eBay sold items:", error);
    res.status(500).json({ error: error?.response?.data || "Failed to fetch data from eBay" });
  }
});

app.post("/pokemonlookup/openai/fetch", async (req, res) => {
  try {
    const { query } = req.body;


    const prompt =`From the image, create an array where the size is determined by the number of Pokémon cards seen. For each card, extract the following information:

Pokémon Name: Read the name of the Pokémon on the card (not the evolution in the top left).

Set Number: Zoom in and Carefully read the set number located at the bottom left or right of the card and be very careful about what numbers are there without making a mistake. This number consists of two parts separated by a slash (e.g., "25/130" or "4/95) then some symbols, like a star, after that you ignore.

Critical Accuracy Steps:

If the set number is difficult to read or ambiguous, do not make a random guess. Instead, use contextual clues such as the card's design, symbols, or unique identifiers to determine the correct set #.

Prioritize correctness over speed: double-check both the set number before determining the final set number.

Format each entry as follows with no other text, then add that string value to the array:

{pokemon} {set #}

Example Output:

["Pikachu 58/102", "Charizard 4/102", "Mewtwo 25/130"]`;

    const response = await axios.post(VITE_OPENAI_API_URL, 
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  "url": query,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${VITE_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching open ai generated items:", error);
    res.status(500).json({ error: error?.response?.data || "Failed to fetch data from eBay" });
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
