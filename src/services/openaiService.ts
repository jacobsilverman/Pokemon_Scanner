import axios from "axios";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openaiUrl = "https://api.openai.com/v1/chat/completions"; // Example for GPT


export const fetchOpenAIResponse = async (imageBase64: string) => {
    try {
      const pokemonSets = "Base Set, Jungle, Fossil, Base Set 2, Team Rocket, Gym Heroes, Gym Challenge, Neo Genesis, Neo Discovery, Neo Revelation, Neo Destiny, Expedition Base Set, Aquapolis, Skyridge, EX Ruby & Sapphire, EX Sandstorm, EX Dragon, EX Team Magma vs Team Aqua, EX Hidden Legends, EX FireRed & LeafGreen, EX Team Rocket Returns, EX Deoxys, EX Emerald, EX Unseen Forces, EX Delta Species, EX Legend Maker, EX Holon Phantoms, EX Crystal Guardians, EX Dragon Frontiers, EX Power Keepers, Diamond & Pearl, Mysterious Treasures, Secret Wonders, Great Encounters, Majestic Dawn, Legends Awakened, Stormfront, Platinum, Rising Rivals, Supreme Victors, Arceus, HeartGold & SoulSilver, Unleashed, Undaunted, Triumphant, Black & White, Emerging Powers, Noble Victories, Next Destinies, Dark Explorers, Dragons Exalted, Boundaries Crossed, Plasma Storm, Plasma Freeze, Plasma Blast, Legendary Treasures, XY Evolutions, Flashfire, Furious Fists, Phantom Forces, Primal Clash, Roaring Skies, Ancient Origins, BREAKthrough, BREAKpoint, Fates Collide, Steam Siege, Evolutions, Sun & Moon, Guardians Rising, Burning Shadows, Crimson Invasion, Ultra Prism, Forbidden Light, Celestial Storm, Lost Thunder, Team Up, Unbroken Bonds, Unified Minds, Cosmic Eclipse, Sword & Shield, Rebel Clash, Darkness Ablaze, Vivid Voltage, Battle Styles, Chilling Reign, Evolving Skies";
      
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
                      { type: "text", text: `From the image make an array thats size is determined by the number of pokemon cards seen in the image. Look at each card and gather these pieces of information: the name of the pokemon on the card (not the evolution in the top left), include the set number seen at the bottom left or right which will have two numbers and a slash in between, and based on the set number determine the set that release this card (please refer to this list ${pokemonSets} to determine the set name). You might have trouble determining the set number and if the image is hard to read please try to determine the set it comes from and research what the set number would be instead of blindly following the image. Write it in this format '{pokemon} {set #} {set}', no other text then add that string value to the array` },
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
