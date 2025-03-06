import axios from "axios";

export interface EbaySoldItem {
    title: string;
    price: string;
    currency: string;
    location: string;
    endTime: string;
    viewItemURL: string;
  }

export async function searchRecentlyBuyProducts(query: string = "charizard", maxResults: number = 50): Promise<EbaySoldItem[]> {
  try {
    const response = await axios.get(`http://localhost:5000/api/ebay/buy`, {
      params: { query, maxResults },
    });

    const items = response.data.itemSummaries || [];
    console.log(items);
    return items;
  } catch (error) {
    console.error("Error fetching eBay sold items:", error);
    return [];
  }
}

export async function searchRecentlySoldProducts(query: string = "charizard", maxResults: number = 10): Promise<EbaySoldItem[]> {
  try {
    const response = await axios.get(`http://localhost:5000/api/ebay/sold`, {
      params: { query, maxResults },
    });

    const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    console.log(items);
    return items;
  } catch (error) {
    console.error("Error fetching eBay sold items:", error);
    return [];
  }
}