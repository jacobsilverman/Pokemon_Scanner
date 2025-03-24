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
    let pokemonSets = "Base Set, Jungle, Fossil, Base Set 2, Team Rocket, Gym Heroes, Gym Challenge, Neo Genesis, Neo Discovery, Neo Revelation, Neo Destiny, Legendary Collection, Expedition Base Set, Aquapolis, Skyridge, EX Ruby & Sapphire, EX Sandstorm, EX Dragon, EX Team Magma vs Team Aqua, EX Hidden Legends, EX FireRed & LeafGreen, EX Team Rocket Returns, EX Deoxys, EX Emerald, EX Unseen Forces, EX Delta Species, EX Legend Maker, EX Holon Phantoms, EX Crystal Guardians, EX Dragon Frontiers, EX Power Keepers, Diamond & Pearl, Mysterious Treasures, Secret Wonders, Great Encounters, Majestic Dawn, Legends Awakened, Stormfront, Platinum, Rising Rivals, Supreme Victors, Arceus, HeartGold & SoulSilver, Unleashed, Undaunted, Triumphant, Black & White, Emerging Powers, Noble Victories, Next Destinies, Dark Explorers, Dragons Exalted, Dragon Vault, Boundaries Crossed, Plasma Storm, Plasma Freeze, Plasma Blast, Legendary Treasures, Kalos Starter Set, XY, Flashfire, Furious Fists, Phantom Forces, Primal Clash, Double Crisis, Roaring Skies, Ancient Origins, BREAKthrough, BREAKpoint, Generations, Fates Collide, Steam Siege, Evolutions, Sun & Moon, Guardians Rising, Burning Shadows, Shining Legends, Crimson Invasion, Ultra Prism, Forbidden Light, Celestial Storm, Dragon Majesty, Lost Thunder, Team Up, Detective Pikachu, Unbroken Bonds, Unified Minds, Hidden Fates, Cosmic Eclipse, Sword & Shield, Rebel Clash, Darkness Ablaze, Champion's Path, Vivid Voltage, Battle Styles, Chilling Reign, Evolving Skies, Celebrations, Fusion Strike, Brilliant Stars, Astral Radiance, Pokemon Go, Lost Origins, Silver Tempest, Crown Zenith, Scarlet & Violet, Paldea Evolved, Obsidian Flames, 151, Paradox Rift, Paldean Fates, Temporal Forces, Twilight Masquerade, Shrouded Fable, Stellar Crown, Surging Sparks, Prismatic Evolutions, Journey Together";
    pokemonSets = pokemonSets.split(",").reverse().join(",");

    const prompt = `From the image make an array thats size is determined by the number of pokemon cards seen in the image. Look at each card and gather these pieces of information: the name of the pokemon on the card (not the evolution in the top left), zoom in and please very carefully read the set number seen at the bottom left or right which will have two numbers and a slash in between, and based on the set number determine the set that released this card (please refer to this list ${pokemonSets} to determine the set name). You might have trouble determining the set number and if the image is hard to read please try to determine the set it comes from and research what the set number would be instead of blindly following the image. Write it in this format '{pokemon} {set #} {set}', with no other text, then add that string value to the array`

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
