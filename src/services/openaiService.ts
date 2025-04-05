import axios from "axios";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openaiUrl = "https://api.openai.com/v1/chat/completions";  // Example for GPT
// const API_URL = 'https://idadog-60ed3202fa90.herokuapp.com';
const API_URL = 'http://localhost:5000';


export const fetchOpenAIResponse = async (imageBase64: string) => {
    try {
      let pokemonSets = "Base Set, Jungle, Fossil, Base Set 2, Team Rocket, Gym Heroes, Gym Challenge, Neo Genesis, Neo Discovery, Neo Revelation, Neo Destiny, Legendary Collection, Expedition Base Set, Aquapolis, Skyridge, EX Ruby & Sapphire, EX Sandstorm, EX Dragon, EX Team Magma vs Team Aqua, EX Hidden Legends, EX FireRed & LeafGreen, EX Team Rocket Returns, EX Deoxys, EX Emerald, EX Unseen Forces, EX Delta Species, EX Legend Maker, EX Holon Phantoms, EX Crystal Guardians, EX Dragon Frontiers, EX Power Keepers, Diamond & Pearl, Mysterious Treasures, Secret Wonders, Great Encounters, Majestic Dawn, Legends Awakened, Stormfront, Platinum, Rising Rivals, Supreme Victors, Arceus, HeartGold & SoulSilver, Unleashed, Undaunted, Triumphant, Black & White, Emerging Powers, Noble Victories, Next Destinies, Dark Explorers, Dragons Exalted, Dragon Vault, Boundaries Crossed, Plasma Storm, Plasma Freeze, Plasma Blast, Legendary Treasures, Kalos Starter Set, XY, Flashfire, Furious Fists, Phantom Forces, Primal Clash, Double Crisis, Roaring Skies, Ancient Origins, BREAKthrough, BREAKpoint, Generations, Fates Collide, Steam Siege, Evolutions, Sun & Moon, Guardians Rising, Burning Shadows, Shining Legends, Crimson Invasion, Ultra Prism, Forbidden Light, Celestial Storm, Dragon Majesty, Lost Thunder, Team Up, Detective Pikachu, Unbroken Bonds, Unified Minds, Hidden Fates, Cosmic Eclipse, Sword & Shield, Rebel Clash, Darkness Ablaze, Champion's Path, Vivid Voltage, Battle Styles, Chilling Reign, Evolving Skies, Celebrations, Fusion Strike, Brilliant Stars, Astral Radiance, Pokemon Go, Lost Origins, Silver Tempest, Crown Zenith, Scarlet & Violet, Paldea Evolved, Obsidian Flames, 151, Paradox Rift, Paldean Fates, Temporal Forces, Twilight Masquerade, Shrouded Fable, Stellar Crown, Surging Sparks, Prismatic Evolutions, Journey Together";
      pokemonSets = pokemonSets.split(",").reverse().join(",");
      const response = await axios.post(
          openaiUrl,
          {
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: [
                    //https://www.tcgplayer.com/search/all/product?q=Umbreon ex 161/131&ListingType=Sold
                    //https://www.tcgplayer.com/search/all/product?q=Charizard 004/102 Base Set&ListingType=Sold
                    { type: "text", text: `From the image make an array thats size is determined by the number of pokemon cards seen in the image. Look at each card and gather these pieces of information: the name of the pokemon on the card (not the evolution in the top left), zoom in and please very carefully read the set number seen at the bottom left or right which will have two numbers and a slash in between, and based on the set number determine the set that released this card (please refer to this list ${pokemonSets} to determine the set name). You might have trouble determining the set number and if the image is hard to read please try to determine the set it comes from and research what the set number would be instead of blindly following the image. Write it in this format '{pokemon} {set #} {set}', with no other text, then add that string value to the array` },
                    // { type: "text", text: "From the card image; Please provide only the name of the pokemon on the card (not the evolution) in the top left, include the set number seen at the bottom left or right, and add the set that the card is from ex.prismatic evolutions. Write it in this format '{pokemon} {set #}, {set}', no other text" },
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


export async function fetchOpenAIFetch(query: string): Promise<any> {
  try {
    const response = await axios.post(`${API_URL}/pokemonlookup/openai/fetch`, { query }); // <-- Use POST with body

    const items = response.data;
    console.log("response.data: "+ items);
    return items;
  } catch (error) {
    console.error("Error fetching OpenAI call:", error);
    return [];
  }
}