import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const VITE_EBAY_APP_ID = process.env.VITE_EBAY_PROD_APP_ID;
const VITE_EBAY_SECRET_ID = process.env.VITE_EBAY_PROD_CERT_ID;
console.log(VITE_EBAY_APP_ID);
console.log(VITE_EBAY_SECRET_ID);

const VITE_EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const VITE_EBAY_FINDING_API_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const VITE_EBAY_SOLD_API_URL = "https://svcs.ebay.com/services/search/FindingService/v1";

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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
