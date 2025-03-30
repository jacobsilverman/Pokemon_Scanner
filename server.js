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
    // let pokemonSets = "Base Set, Jungle, Fossil, Base Set 2, Team Rocket, Gym Heroes, Gym Challenge, Neo Genesis, Neo Discovery, Neo Revelation, Neo Destiny, Legendary Collection, Expedition Base Set, Aquapolis, Skyridge, EX Ruby & Sapphire, EX Sandstorm, EX Dragon, EX Team Magma vs Team Aqua, EX Hidden Legends, EX FireRed & LeafGreen, EX Team Rocket Returns, EX Deoxys, EX Emerald, EX Unseen Forces, EX Delta Species, EX Legend Maker, EX Holon Phantoms, EX Crystal Guardians, EX Dragon Frontiers, EX Power Keepers, Diamond & Pearl, Mysterious Treasures, Secret Wonders, Great Encounters, Majestic Dawn, Legends Awakened, Stormfront, Platinum, Rising Rivals, Supreme Victors, Arceus, HeartGold & SoulSilver, Unleashed, Undaunted, Triumphant, Black & White, Emerging Powers, Noble Victories, Next Destinies, Dark Explorers, Dragons Exalted, Dragon Vault, Boundaries Crossed, Plasma Storm, Plasma Freeze, Plasma Blast, Legendary Treasures, Kalos Starter Set, XY, Flashfire, Furious Fists, Phantom Forces, Primal Clash, Double Crisis, Roaring Skies, Ancient Origins, BREAKthrough, BREAKpoint, Generations, Fates Collide, Steam Siege, Evolutions, Sun & Moon, Guardians Rising, Burning Shadows, Shining Legends, Crimson Invasion, Ultra Prism, Forbidden Light, Celestial Storm, Dragon Majesty, Lost Thunder, Team Up, Detective Pikachu, Unbroken Bonds, Unified Minds, Hidden Fates, Cosmic Eclipse, Sword & Shield, Rebel Clash, Darkness Ablaze, Champion's Path, Vivid Voltage, Battle Styles, Chilling Reign, Evolving Skies, Celebrations, Fusion Strike, Brilliant Stars, Astral Radiance, Pokemon Go, Lost Origins, Silver Tempest, Crown Zenith, Scarlet & Violet, Paldea Evolved, Obsidian Flames, 151, Paradox Rift, Paldean Fates, Temporal Forces, Twilight Masquerade, Shrouded Fable, Stellar Crown, Surging Sparks, Prismatic Evolutions, Journey Together";

    // const prompt = `From the image make an array thats size is determined by the number of pokemon cards seen in the image. Look at each card and gather these pieces of information: the name of the pokemon on the card (not the evolution in the top left), zoom in and please very carefully read the set number seen at the bottom left or right which will have two numbers and a slash in between, and based on the set number determine the set that released this card (please refer to this list ${pokemonSets} to determine the set name). You might have trouble determining the set number and if the image is hard to read please try to determine the set it comes from and research what the set number would be instead of blindly following the image. Write it in this format '{pokemon} {set #} {set}', with no other text, then add that string value to the array`


    const pokemonSets = [
      "Base Set: 102",
      "Jungle: 64",
      "Fossil: 62",
      "Base Set 2: 130",
      "Team Rocket: 82",
      "Gym Heroes: 132",
      "Gym Challenge: 132",
      "Neo Genesis: 111",
      "Neo Discovery: 75",
      "Neo Revelation: 64",
      "Neo Destiny: 105",
      "Legendary Collection: 110",
      "Expedition Base Set: 165",
      "Aquapolis: 147",
      "Skyridge: 144",
      "EX Ruby & Sapphire: 109",
      "EX Sandstorm: 100",
      "EX Dragon: 97",
      "EX Team Magma vs Team Aqua: 95",
      "EX Hidden Legends: 101",
      "EX FireRed & LeafGreen: 112",
      "EX Team Rocket Returns: 109",
      "EX Deoxys: 107",
      "EX Emerald: 106",
      "EX Unseen Forces: 115",
      "EX Delta Species: 113",
      "EX Legend Maker: 92",
      "EX Holon Phantoms: 110",
      "EX Crystal Guardians: 100",
      "EX Dragon Frontiers: 101",
      "EX Power Keepers: 108",
      "Diamond & Pearl: 130",
      "Mysterious Treasures: 123",
      "Secret Wonders: 132",
      "Great Encounters: 106",
      "Majestic Dawn: 100",
      "Legends Awakened: 146",
      "Stormfront: 100",
      "Platinum: 127",
      "Rising Rivals: 111",
      "Supreme Victors: 147",
      "Arceus: 99",
      "HeartGold & SoulSilver: 123",
      "Unleashed: 95",
      "Undaunted: 90",
      "Triumphant: 102",
      "Call of Legends: 95",
      "Black & White: 114",
      "Emerging Powers: 98",
      "Noble Victories: 101",
      "Next Destinies: 99",
      "Dark Explorers: 108",
      "Dragons Exalted: 124",
      "Dragon Vault: 20",
      "Boundaries Crossed: 149",
      "Plasma Storm: 135",
      "Plasma Freeze: 116",
      "Plasma Blast: 101",
      "Legendary Treasures: 113",
      "Kalos Starter Set: 39",
      "XY: 146",
      "Flashfire: 106",
      "Furious Fists: 111",
      "Phantom Forces: 119",
      "Primal Clash: 160",
      "Double Crisis: 34",
      "Roaring Skies: 108",
      "Ancient Origins: 98",
      "BREAKthrough: 162",
      "BREAKpoint: 122",
      "Generations: 83",
      "Fates Collide: 124",
      "Steam Siege: 114",
      "Evolutions: 108",
      "Sun & Moon: 149",
      "Guardians Rising: 145",
      "Burning Shadows: 147",
      "Shining Legends: 73",
      "Crimson Invasion: 111",
      "Ultra Prism: 156",
      "Forbidden Light: 131",
      "Celestial Storm: 168",
      "Dragon Majesty: 70",
      "Lost Thunder: 214",
      "Team Up: 181",
      "Detective Pikachu: 18",
      "Unbroken Bonds: 214",
      "Unified Minds: 236",
      "Hidden Fates: 68",
      "Cosmic Eclipse: 236",
      "Sword & Shield: 202",
      "Rebel Clash: 192",
      "Darkness Ablaze: 189",
      "Champion's Path: 73",
      "Vivid Voltage: 185",
      "Shining Fates: 72",
      "Battle Styles: 163",
      "Chilling Reign: 198",
      "Evolving Skies: 203",
      "Celebrations: 25",
      "Fusion Strike: 264",
      "Brilliant Stars: 172",
      "Astral Radiance: 189",
      "Pokémon Go: 78",
      "Lost Origin: 196",
      "Silver Tempest: 195",
      "Crown Zenith: 159",
      "Scarlet & Violet: 198",
      "Paldea Evolved: 193",
      "Obsidian Flames: 197",
      "151: 165",
      "Paradox Rift: 182",
      "Paldean Fates: 91",
      "Temporal Forces: 162",
      "Twilight Masquerade: 167",
      "Shrouded Fable: 64",
      "Stellar Crown: 142",
      "Surging Sparks: 191",
      "Prismatic Evolutions: 131",
      "Journey Together: 159"
    ];
    

    const prompt =`From the image, create an array where the size is determined by the number of Pokémon cards seen. For each card, extract the following information:

Pokémon Name: Read the name of the Pokémon on the card (not the evolution in the top left).

Set Number: Zoom in and Carefully read the set number located at the bottom left or right of the card and be very careful about what numbers are there without making a mistake. This number consists of two parts separated by a slash (e.g., "25/130" or "4/95) then some symbols, like a star, after that you ignore.

Set Name: Determine the Pokémon set name this card belongs to by using the provided list, which is in the format "set name: the set number", you can you the set number to figure out the set name:

${pokemonSets}

Critical Accuracy Steps:

If the set number is difficult to read or ambiguous, do not make a random guess. Instead, use contextual clues such as the card's design, symbols, or unique identifiers to determine the correct set. If you read the set # as 181 or 183 then it is actually 131 prismatic evolutions.

Cross-reference the set number against known set numbering conventions for accuracy. If necessary, research the correct set by matching the Pokémon, numbering style, and design elements to the correct release. Some of the later releases are not known to your ai so you need to use the sets i provided to determine the results.

Prioritize correctness over speed: double-check both the set number and set name before determining the final set.

Format each entry as follows with no other text, then add that string value to the array:

{pokemon} {set #} {set}

Example Output:

["Pikachu 58/102 Base Set", "Charizard 4/102 Base Set", "Mewtwo 25/130 Legendary Collection"]`;

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
