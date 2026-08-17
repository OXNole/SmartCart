// SmartCart — Live deals fetcher
// Uses Claude with web_search to find real current deals for the user's store
// Netlify function: /.netlify/functions/deals

const FALLBACK_DEALS = [
  { id:1,  name:"Chicken Breast",   emoji:"🍗", price:3.99,  was:6.49,  unit:"lb",      pct:38, cat:"Protein", bogo:false },
  { id:2,  name:"Atlantic Salmon",  emoji:"🐟", price:7.99,  was:12.99, unit:"lb",      pct:38, cat:"Protein", bogo:false },
  { id:3,  name:"Roma Tomatoes",    emoji:"🍅", price:0.99,  was:1.79,  unit:"lb",      pct:45, cat:"Produce", bogo:false },
  { id:4,  name:"Baby Spinach",     emoji:"🥬", price:2.49,  was:3.99,  unit:"bag",     pct:38, cat:"Produce", bogo:false },
  { id:5,  name:"Jasmine Rice",     emoji:"🍚", price:3.29,  was:4.99,  unit:"2lb bag", pct:34, cat:"Pantry",  bogo:false },
  { id:6,  name:"Garlic",           emoji:"🧄", price:0.79,  was:1.49,  unit:"head",    pct:47, cat:"Produce", bogo:false },
  { id:7,  name:"Greek Yogurt",     emoji:"🫙", price:1.29,  was:2.19,  unit:"5.3oz",   pct:41, cat:"Dairy",   bogo:false },
  { id:8,  name:"Broccoli Florets", emoji:"🥦", price:1.99,  was:3.49,  unit:"12oz",    pct:43, cat:"Produce", bogo:false },
  { id:9,  name:"Pasta (Penne)",    emoji:"🍝", price:1.19,  was:1.99,  unit:"lb",      pct:40, cat:"Pantry",  bogo:false },
  { id:10, name:"Lemon",            emoji:"🍋", price:0.49,  was:0.89,  unit:"each",    pct:45, cat:"Produce", bogo:false },
];

// Map item names to emojis for display
function guessEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("chicken"))                       return "🍗";
  if (n.includes("salmon") || n.includes("fish"))  return "🐟";
  if (n.includes("shrimp"))                        return "🍤";
  if (n.includes("beef") || n.includes("steak"))   return "🥩";
  if (n.includes("pork"))                          return "🥩";
  if (n.includes("tomato"))                        return "🍅";
  if (n.includes("spinach") || n.includes("kale")) return "🥬";
  if (n.includes("broccoli"))                      return "🥦";
  if (n.includes("lettuce") || n.includes("salad"))return "🥗";
  if (n.includes("pepper"))                        return "🫑";
  if (n.includes("onion"))                         return "🧅";
  if (n.includes("garlic"))                        return "🧄";
  if (n.includes("lemon") || n.includes("lime"))   return "🍋";
  if (n.includes("strawberr"))                     return "🍓";
  if (n.includes("blueberr"))                      return "🫐";
  if (n.includes("apple"))                         return "🍎";
  if (n.includes("banana"))                        return "🍌";
  if (n.includes("avocado"))                       return "🥑";
  if (n.includes("rice"))                          return "🍚";
  if (n.includes("pasta") || n.includes("penne") || n.includes("spaghetti")) return "🍝";
  if (n.includes("bread"))                         return "🍞";
  if (n.includes("egg"))                           return "🥚";
  if (n.includes("milk"))                          return "🥛";
  if (n.includes("yogurt"))                        return "🫙";
  if (n.includes("cheese"))                        return "🧀";
  if (n.includes("butter"))                        return "🧈";
  if (n.includes("oil") || n.includes("olive"))    return "🫒";
  if (n.includes("juice"))                         return "🧃";
  if (n.includes("water"))                         return "💧";
  if (n.includes("cereal") || n.includes("granola"))return "🥣";
  if (n.includes("coffee"))                        return "☕";
  if (n.includes("tea"))                           return "🍵";
  if (n.includes("cookie") || n.includes("cracker"))return "🍪";
  if (n.includes("ice cream"))                     return "🍦";
  return "🛒";
}

function guessCategory(name) {
  const n = name.toLowerCase();
  if (["chicken","salmon","beef","pork","shrimp","turkey","tuna","tilapia"].some(w=>n.includes(w))) return "Protein";
  if (["tomato","spinach","broccoli","lettuce","kale","pepper","onion","garlic","carrot","celery","zucchini","cucumber","mushroom","avocado","lemon","lime","apple","banana","berry","fruit","vegetable","produce"].some(w=>n.includes(w))) return "Produce";
  if (["milk","yogurt","cheese","butter","cream","egg"].some(w=>n.includes(w))) return "Dairy";
  if (["bread","rice","pasta","cereal","flour","oat","cracker","chip"].some(w=>n.includes(w))) return "Pantry";
  if (["juice","soda","water","coffee","tea","drink"].some(w=>n.includes(w))) return "Beverages";
  if (["frozen","ice cream"].some(w=>n.includes(w))) return "Frozen";
  return "Pantry";
}

exports.handler = async function(event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ deals: FALLBACK_DEALS, source: "fallback", reason: "No API key" })
    };
  }

  let storeName, storeAddress, storeCity;
  try {
    const body = JSON.parse(event.body);
    storeName    = body.storeName    || "Publix";
    storeAddress = body.storeAddress || "";
    // Extract city from address for more targeted search
    const parts  = storeAddress.split(",");
    storeCity    = parts.length >= 2 ? parts[parts.length - 2].trim() : "Greenville, SC";
  } catch {
    storeName = "Publix"; storeCity = "Greenville, SC";
  }

  // Get current date for the search query
  const now       = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year      = now.getFullYear();
  const weekStr   = `${monthName} ${year}`;

  const searchPrompt = `Search for the current weekly ad deals at ${storeName} in ${storeCity} for ${weekStr}.

Look at sources like:
- ${storeName.toLowerCase().replace(/ /g,"")}.com weekly ad
- weeklyads.us
- southernsavers.com
- krazy coupon lady
- flipp.com
- grocery circulars or deal aggregator sites

Find 8-15 specific items currently on sale or BOGO. For each deal extract:
- The exact product name
- The sale price (if available)
- The regular/was price (if available)  
- The unit (lb, oz, each, package, etc.)
- Whether it is BOGO (buy one get one)
- The discount percentage if shown

Respond ONLY with a valid JSON array, no other text, no markdown, no explanation. Use this exact format:
[
  {
    "name": "Boneless Chicken Breast",
    "price": 1.99,
    "was": 4.99,
    "unit": "lb",
    "pct": 60,
    "bogo": false,
    "cat": "Protein"
  }
]

If you cannot find a specific price, make your best estimate based on typical grocery prices. Always return valid JSON with at least 8 items. Categories must be one of: Protein, Produce, Dairy, Pantry, Beverages, Frozen, Deli, Bakery.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 5
          }
        ],
        messages: [
          { role: "user", content: searchPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.content) {
      throw new Error(data.error?.message || "Anthropic API error");
    }

    // Extract the text content from the response (may be mixed with tool_use blocks)
    const textContent = data.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("");

    if (!textContent.trim()) {
      throw new Error("No text in response");
    }

    // Parse JSON from the response — strip any markdown fences if present
    const cleaned = textContent
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Find the JSON array in the response
    const arrayStart = cleaned.indexOf("[");
    const arrayEnd   = cleaned.lastIndexOf("]");
    if (arrayStart === -1 || arrayEnd === -1) {
      throw new Error("No JSON array found in response");
    }

    const rawDeals = JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));

    // Normalize and validate each deal
    const deals = rawDeals
      .filter(d => d.name && typeof d.name === "string")
      .map((d, i) => ({
        id:    i + 1,
        name:  d.name.trim(),
        emoji: guessEmoji(d.name),
        price: typeof d.price === "number" ? Math.round(d.price * 100) / 100 : 0,
        was:   typeof d.was   === "number" ? Math.round(d.was   * 100) / 100 : null,
        unit:  d.unit  || "each",
        pct:   typeof d.pct   === "number" ? Math.round(d.pct)  : (d.bogo ? 50 : 0),
        bogo:  !!d.bogo,
        cat:   d.cat   || guessCategory(d.name),
      }))
      .filter(d => d.price > 0 || d.bogo); // must have a price or be BOGO

    if (deals.length < 3) {
      throw new Error(`Only ${deals.length} valid deals parsed`);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // Cache for 6 hours — deals don't change minute to minute
        "Cache-Control": "public, max-age=21600"
      },
      body: JSON.stringify({
        deals,
        source: "live",
        store:  storeName,
        city:   storeCity,
        fetched: new Date().toISOString()
      })
    };

  } catch (err) {
    console.error("Deals fetch error:", err.message);
    // Always return fallback so the app never breaks
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        deals: FALLBACK_DEALS,
        source: "fallback",
        reason: err.message
      })
    };
  }
};
