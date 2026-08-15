import { useState, useEffect, useRef, useCallback } from "react";

/* ─── STORE CATALOG (with lat/lng for proximity matching) ──────────────────── */
const STORE_CATALOG = [
  // Publix — Greenville / Upstate SC
  { id:"publix_gvl1",   name:"Publix",           chain:"publix",        emoji:"🟢", address:"1140 Woodruff Rd, Greenville, SC",        lat:34.8354, lng:-82.3018 },
  { id:"publix_gvl2",   name:"Publix",           chain:"publix",        emoji:"🟢", address:"3620 Pelham Rd, Greenville, SC",          lat:34.8521, lng:-82.2765 },
  { id:"publix_spart",  name:"Publix",           chain:"publix",        emoji:"🟢", address:"1005 E Main St, Spartanburg, SC",         lat:34.9562, lng:-81.9243 },
  { id:"publix_ander",  name:"Publix",           chain:"publix",        emoji:"🟢", address:"3131 N Main St, Anderson, SC",            lat:34.5412, lng:-82.6521 },
  // Harris Teeter — Greenville & Upstate SC (real locations)
  { id:"ht_gvl1",       name:"Harris Teeter",    chain:"harris_teeter", emoji:"🔵", address:"1025 Woodruff Rd, Greenville, SC",        lat:34.8341, lng:-82.3041 },
  { id:"ht_gvl2",       name:"Harris Teeter",    chain:"harris_teeter", emoji:"🔵", address:"2 Doctors Dr, Greenville, SC",            lat:34.8521, lng:-82.3987 },
  { id:"ht_spart",      name:"Harris Teeter",    chain:"harris_teeter", emoji:"🔵", address:"140 Dorman Centre Dr, Spartanburg, SC",   lat:34.9873, lng:-81.9654 },
  { id:"ht_clt1",       name:"Harris Teeter",    chain:"harris_teeter", emoji:"🔵", address:"6401 Morrison Blvd, Charlotte, NC",       lat:35.1329, lng:-80.8423 },
  { id:"ht_clt2",       name:"Harris Teeter",    chain:"harris_teeter", emoji:"🔵", address:"7116 Waverly Walk Ave, Charlotte, NC",    lat:35.0512, lng:-80.8765 },
  // The Fresh Market
  { id:"fresh_gvl",     name:"The Fresh Market", chain:"fresh_market",  emoji:"🟡", address:"85 Verdae Blvd, Greenville, SC",          lat:34.8199, lng:-82.3121 },
  { id:"fresh_clt",     name:"The Fresh Market", chain:"fresh_market",  emoji:"🟡", address:"1820 E 7th St, Charlotte, NC",            lat:35.2287, lng:-80.8198 },
  // Kroger
  { id:"kroger_ros",    name:"Kroger",           chain:"kroger",        emoji:"🔴", address:"1000 Mansell Rd, Roswell, GA",            lat:34.0234, lng:-84.3516 },
  { id:"kroger_clt",    name:"Kroger",           chain:"kroger",        emoji:"🔴", address:"4720 Central Ave, Charlotte, NC",         lat:35.2198, lng:-80.7654 },
  // Walmart
  { id:"walmart_gvl",   name:"Walmart",          chain:"walmart",       emoji:"⚡", address:"2401 Laurens Rd, Greenville, SC",         lat:34.8712, lng:-82.3421 },
  { id:"walmart_spart", name:"Walmart",          chain:"walmart",       emoji:"⚡", address:"8490 Warren H. Abernathy Hwy, Spartanburg, SC", lat:34.9187, lng:-81.9876 },
  { id:"walmart_clt",   name:"Walmart",          chain:"walmart",       emoji:"⚡", address:"9820 Rea Rd, Charlotte, NC",              lat:35.0521, lng:-80.8234 },
  // Target
  { id:"target_gvl",    name:"Target",           chain:"target",        emoji:"🎯", address:"1025 Woodruff Rd, Greenville, SC",        lat:34.8345, lng:-82.3052 },
  { id:"target_clt",    name:"Target",           chain:"target",        emoji:"🎯", address:"6801 Northlake Mall Dr, Charlotte, NC",   lat:35.3654, lng:-80.8123 },
  // Aldi
  { id:"aldi_gvl",      name:"Aldi",             chain:"aldi",          emoji:"🔶", address:"3620 Pelham Rd, Greenville, SC",          lat:34.8511, lng:-82.2754 },
  { id:"aldi_spart",    name:"Aldi",             chain:"aldi",          emoji:"🔶", address:"1606 Boiling Springs Rd, Spartanburg, SC",lat:34.9342, lng:-81.9123 },
  // Trader Joe's
  { id:"trader_clt",    name:"Trader Joe's",     chain:"trader_joes",   emoji:"🌺", address:"1133 Metropolitan Ave, Charlotte, NC",    lat:35.2198, lng:-80.8445 },
  // Whole Foods
  { id:"whole_clt",     name:"Whole Foods",      chain:"whole_foods",   emoji:"🌿", address:"6610 Fairview Rd, Charlotte, NC",         lat:35.1512, lng:-80.8298 },
];

/* ─── DIETARY OPTIONS ────────────────────────────────────────────────────────── */
const DIETARY_OPTIONS = [
  { id:"none",         label:"No restrictions", emoji:"🍽️" },
  { id:"vegetarian",   label:"Vegetarian",      emoji:"🥦" },
  { id:"vegan",        label:"Vegan",           emoji:"🌱" },
  { id:"gluten_free",  label:"Gluten-free",     emoji:"🌾" },
  { id:"dairy_free",   label:"Dairy-free",      emoji:"🥛" },
  { id:"keto",         label:"Keto",            emoji:"🥑" },
  { id:"paleo",        label:"Paleo",           emoji:"🍖" },
  { id:"halal",        label:"Halal",           emoji:"☪️" },
  { id:"kosher",       label:"Kosher",          emoji:"✡️" },
  { id:"nut_free",     label:"Nut-free",        emoji:"🥜" },
];

const CUISINE_OPTIONS = [
  { id:"american",       label:"American",       emoji:"🇺🇸" },
  { id:"italian",        label:"Italian",        emoji:"🇮🇹" },
  { id:"mexican",        label:"Mexican",        emoji:"🇲🇽" },
  { id:"asian",          label:"Asian",          emoji:"🥢" },
  { id:"mediterranean",  label:"Mediterranean",  emoji:"🫒" },
  { id:"indian",         label:"Indian",         emoji:"🍛" },
  { id:"greek",          label:"Greek",          emoji:"🫙" },
  { id:"middle_eastern", label:"Middle Eastern", emoji:"🧆" },
];

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DATES = ["Jun 23","Jun 24","Jun 25","Jun 26","Jun 27","Jun 28","Jun 29"];

const DEALS = [
  { id:1,  name:"Chicken Breast",   emoji:"🍗", price:3.99,  was:6.49,  unit:"lb",      pct:38, cat:"Protein" },
  { id:2,  name:"Atlantic Salmon",  emoji:"🐟", price:7.99,  was:12.99, unit:"lb",      pct:38, cat:"Protein" },
  { id:3,  name:"Roma Tomatoes",    emoji:"🍅", price:0.99,  was:1.79,  unit:"lb",      pct:45, cat:"Produce" },
  { id:4,  name:"Baby Spinach",     emoji:"🥬", price:2.49,  was:3.99,  unit:"bag",     pct:38, cat:"Produce" },
  { id:5,  name:"Jasmine Rice",     emoji:"🍚", price:3.29,  was:4.99,  unit:"2lb bag", pct:34, cat:"Pantry"  },
  { id:6,  name:"Garlic",           emoji:"🧄", price:0.79,  was:1.49,  unit:"head",    pct:47, cat:"Produce" },
  { id:7,  name:"Greek Yogurt",     emoji:"🫙", price:1.29,  was:2.19,  unit:"5.3oz",   pct:41, cat:"Dairy"   },
  { id:8,  name:"Broccoli Florets", emoji:"🥦", price:1.99,  was:3.49,  unit:"12oz",    pct:43, cat:"Produce" },
  { id:9,  name:"Pasta (Penne)",    emoji:"🍝", price:1.19,  was:1.99,  unit:"lb",      pct:40, cat:"Pantry"  },
  { id:10, name:"Lemon",            emoji:"🍋", price:0.49,  was:0.89,  unit:"each",    pct:45, cat:"Produce" },
];

const BASE_WEEK = [
  { breakfast:{ name:"Yogurt & Honey Bowl",    emoji:"🫙", time:5,  cal:280, saved:0.90 },
    lunch:    { name:"Spinach Chicken Wrap",    emoji:"🌯", time:15, cal:420, saved:2.10 },
    dinner:   { name:"Garlic Salmon & Rice",    emoji:"🍽️", time:30, cal:580, saved:5.00 } },
  { breakfast:{ name:"Spinach Egg Scramble",    emoji:"🍳", time:10, cal:310, saved:0.75 },
    lunch:    { name:"Tomato Rice Bowl",         emoji:"🥘", time:20, cal:390, saved:1.80 },
    dinner:   { name:"Herb Chicken & Broccoli", emoji:"🍽️", time:35, cal:520, saved:4.20 } },
  { breakfast:{ name:"Greek Yogurt Parfait",    emoji:"🍓", time:5,  cal:280, saved:0.90 },
    lunch:    { name:"Salmon Rice Bowl",         emoji:"🍱", time:10, cal:490, saved:3.00 },
    dinner:   { name:"Tomato Chicken Skillet",   emoji:"🍽️", time:25, cal:480, saved:3.80 } },
  { breakfast:{ name:"Green Smoothie",           emoji:"🥤", time:5,  cal:220, saved:0.75 },
    lunch:    { name:"Broccoli Rice Stir-fry",   emoji:"🥡", time:20, cal:360, saved:2.50 },
    dinner:   { name:"Glazed Salmon & Greens",   emoji:"🍽️", time:30, cal:510, saved:4.00 } },
  { breakfast:{ name:"Yogurt & Granola",         emoji:"🫙", time:5,  cal:290, saved:0.90 },
    lunch:    { name:"Tomato Spinach Salad",      emoji:"🥗", time:10, cal:290, saved:1.50 },
    dinner:   { name:"Lemon Garlic Pasta",        emoji:"🍝", time:25, cal:550, saved:3.60 } },
  { breakfast:{ name:"Broccoli Frittata",        emoji:"🍳", time:20, cal:340, saved:0.75 },
    lunch:    { name:"Salmon Spinach Salad",      emoji:"🥗", time:15, cal:420, saved:3.50 },
    dinner:   { name:"Tomato Chicken Pasta",      emoji:"🍽️", time:35, cal:610, saved:4.40 } },
  { breakfast:{ name:"Yogurt Fruit Bowl",        emoji:"🍇", time:5,  cal:260, saved:0.90 },
    lunch:    { name:"Garlic Rice & Broccoli",    emoji:"🥘", time:15, cal:380, saved:2.00 },
    dinner:   { name:"Herb Salmon Feast",         emoji:"🍽️", time:40, cal:590, saved:5.50 } },
];

const GROCERY_ITEMS = [
  { id:1,  name:"Chicken Breast",   qty:"3 lb",    price:11.97, cat:"Protein", emoji:"🍗", deal:true,  note:"3× weekly meals"        },
  { id:2,  name:"Atlantic Salmon",  qty:"2 lb",    price:15.98, cat:"Protein", emoji:"🐟", deal:true,  note:"3× weekly meals"        },
  { id:3,  name:"Roma Tomatoes",    qty:"2 lb",    price:1.98,  cat:"Produce", emoji:"🍅", deal:true,  note:"Sauces & salads"        },
  { id:4,  name:"Baby Spinach",     qty:"2 bags",  price:4.98,  cat:"Produce", emoji:"🥬", deal:true,  note:"Wraps, smoothies"       },
  { id:5,  name:"Jasmine Rice",     qty:"1 bag",   price:3.29,  cat:"Pantry",  emoji:"🍚", deal:true,  note:"Base for 4 meals"       },
  { id:6,  name:"Garlic",           qty:"3 heads", price:2.37,  cat:"Produce", emoji:"🧄", deal:true,  note:"Every dinner"           },
  { id:7,  name:"Greek Yogurt",     qty:"5 cups",  price:6.45,  cat:"Dairy",   emoji:"🫙", deal:true,  note:"Breakfasts"             },
  { id:8,  name:"Broccoli Florets", qty:"2 bags",  price:3.98,  cat:"Produce", emoji:"🥦", deal:true,  note:"Thu lunch & Sat brunch" },
  { id:9,  name:"Pasta (Penne)",    qty:"1 lb",    price:1.19,  cat:"Pantry",  emoji:"🍝", deal:true,  note:"Fri & Sat dinner"       },
  { id:10, name:"Lemons",           qty:"4 each",  price:1.96,  cat:"Produce", emoji:"🍋", deal:true,  note:"Finishing touch"        },
  { id:11, name:"Olive Oil",        qty:"1 bottle",price:7.99,  cat:"Pantry",  emoji:"🫒", deal:false, note:"Pantry staple"          },
  { id:12, name:"Eggs",             qty:"12 ct",   price:3.49,  cat:"Dairy",   emoji:"🥚", deal:false, note:"Breakfasts"             },
];

// Pantry is now dynamic state — seeded from this default list
const DEFAULT_PANTRY = [
  { id:1, name:"Olive Oil",     brand:"",          emoji:"🫒", amount:"60%",  unit:"bottle", pct:60, status:"good"     },
  { id:2, name:"Sea Salt",      brand:"Morton",    emoji:"🧂", amount:"80%",  unit:"canister",pct:80, status:"good"    },
  { id:3, name:"Jasmine Rice",  brand:"",          emoji:"🍚", amount:"about ¼ bag", unit:"bag", pct:12, status:"low" },
  { id:4, name:"Soy Sauce",     brand:"Kikkoman",  emoji:"🥫", amount:"half bottle", unit:"bottle",pct:55, status:"good"},
  { id:5, name:"Honey",         brand:"",          emoji:"🍯", amount:"almost out",  unit:"jar", pct:4,  status:"critical"},
  { id:6, name:"Garlic Powder", brand:"McCormick", emoji:"🧄", amount:"70%",  unit:"jar",    pct:70, status:"good"     },
  { id:7, name:"Black Pepper",  brand:"",          emoji:"🫙", amount:"65%",  unit:"grinder",pct:65, status:"good"     },
  { id:8, name:"Paprika",       brand:"McCormick", emoji:"🌶️", amount:"low",  unit:"jar",    pct:20, status:"low"      },
];

const RECIPE_DB = {
  "Garlic Salmon & Rice": {
    ingredients:[
      {text:"2 salmon fillets (6 oz each)",deal:true},
      {text:"1 cup jasmine rice, uncooked", deal:true},
      {text:"4 garlic cloves, minced",      deal:true},
      {text:"2 tbsp olive oil"},
      {text:"1 lemon, zested & juiced",     deal:true},
      {text:"Salt, pepper, paprika to taste"},
      {text:"Fresh dill (optional)"},
    ],
    steps:[
      "Rinse rice and cook in 2 cups salted water, covered, 18 min on low.",
      "Pat salmon dry. Season with salt, pepper, and paprika on both sides.",
      "Heat oil in a skillet over medium-high. Sear salmon skin-side up 4 min — don't move it.",
      "Flip salmon, add garlic. Sear 3–4 more minutes, basting with garlic oil.",
      "Squeeze lemon over pan the last 30 seconds. Rest 2 min off heat.",
      "Serve salmon over rice. Drizzle pan juices on top. Finish with fresh dill.",
    ],
    elevate:[
      "Add a tbsp of capers and cold butter at the end for a quick pan sauce.",
      "Zest the lemon directly over plated portions — the oils are more fragrant.",
      "Top with microgreens and a thin lemon slice for a restaurant-level finish.",
    ],
  },
};

const WEEKLY_SAVINGS = [6.00,6.75,7.70,7.25,6.00,8.65,8.35];
const TOTAL_SAVED    = WEEKLY_SAVINGS.reduce((a,b)=>a+b,0);
const TOTAL_SPEND    = 63.65;

/* ─── Per-meal config defaults ─────────────────────────────────────────────── */
const DEFAULT_MEAL_CFG = {
  breakfast:{ enabled:true,  style:"quick",    skill:"beginner",     portions:1, prepDay:null },
  lunch:    { enabled:true,  style:"mealprep", skill:"beginner",     portions:5, prepDay:0    },
  dinner:   { enabled:true,  style:"varied",   skill:"intermediate", portions:1, prepDay:null },
};

const DEFAULT_PREFS = {
  storeId:"", storeName:"", storeAddress:"", storeChain:"",
  userLat:null, userLng:null, userAddress:"",
  dietary:[], cuisines:[],
  people:2, budget:150,
  meals: DEFAULT_MEAL_CFG,
  onboarded:false,
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const fmt   = n => `$${Number(n).toFixed(2)}`;
const cap   = s => s.charAt(0).toUpperCase()+s.slice(1);
const sumBy = (arr,fn) => arr.reduce((a,b)=>a+fn(b),0);

// Haversine distance in miles
function distanceMiles(lat1,lng1,lat2,lng2){
  const R=3958.8, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function storesNearby(lat,lng,radiusMiles=15){
  return STORE_CATALOG
    .map(s=>({...s, distance:distanceMiles(lat,lng,s.lat,s.lng)}))
    .filter(s=>s.distance<=radiusMiles)
    .sort((a,b)=>a.distance-b.distance);
}

// Build weekly plan from prefs
function buildWeekPlan(prefs){
  const {meals,people}=prefs;
  return BASE_WEEK.map((dayData,di)=>{
    const result={};
    ["breakfast","lunch","dinner"].forEach(mt=>{
      const cfg=meals[mt]; if(!cfg.enabled) return;
      const base=dayData[mt]; if(!base) return;
      if(cfg.style==="mealprep"&&cfg.prepDay!==null){
        // Always use the PREP DAY's meal so every day shows the same dish
        const prepBase=BASE_WEEK[cfg.prepDay][mt];
        const offset=di-cfg.prepDay;
        if(di===cfg.prepDay){
          // The cook day — show prep badge
          result[mt]={...prepBase,isPrepDay:true,portions:cfg.portions,
            portionLabel:`Prep ×${cfg.portions} — eat all week`,skill:cap(cfg.skill)};
        } else if(offset>0&&offset<cfg.portions){
          // Leftover days — same dish, same name, leftover badge
          result[mt]={...prepBase,isLeftover:true,
            portionLabel:`Portion ${offset+1} of ${cfg.portions}`,time:2,skill:cap(cfg.skill)};
        } else if(offset<0){
          // Days before the prep — show "coming up" nudge
          result[mt]={...prepBase,isUpcoming:true,
            portionLabel:`Prepping on ${DAYS[cfg.prepDay]}`,skill:cap(cfg.skill)};
        }
        // offset >= cfg.portions: portions used up, no entry for this meal type
      } else {
        result[mt]={...base,skill:cap(cfg.skill),portions:people};
      }
    });
    return result;
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   CSS
════════════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#0F3D2E;--green2:#1A5C44;--green3:#2E8B57;
  --mint:#A8DBC0;--foam:#E8F5EE;--bg:#F7F9F7;--white:#FFFFFF;
  --yellow:#F5C842;--yellow2:#FFF8DC;
  --slate:#374151;--muted:#6B7280;--border:#E5E7EB;
  --red:#DC2626;--orange:#EA580C;
  --purple:#6D28D9;--purple2:#EDE9FE;
  --shadow:0 1px 3px rgba(15,61,46,.08);
  --shadow-md:0 4px 16px rgba(15,61,46,.12);
}
html,body{height:100%;font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--slate);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
.shell{width:390px;min-height:100vh;margin:0 auto;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}

/* Ticker */
.ticker-wrap{background:var(--yellow);overflow:hidden;white-space:nowrap;height:28px;display:flex;align-items:center;flex-shrink:0}
.ticker-inner{display:inline-flex;animation:ticker 28s linear infinite}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker-item{display:inline-flex;align-items:center;gap:4px;padding:0 18px;font-family:'Sora',sans-serif;font-size:11px;font-weight:700;color:var(--green)}
.ticker-sep{opacity:.3}

/* Header */
.header{background:var(--green);padding:16px 20px 20px;flex-shrink:0}
.header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.logo{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--white);letter-spacing:-.5px}
.logo em{color:var(--yellow);font-style:normal}
.header-meta{font-size:11px;color:rgba(255,255,255,.5);margin-top:2px}
.avatar-btn{width:34px;height:34px;border-radius:50%;background:var(--green2);border:none;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--white);transition:background .15s}
.avatar-btn:hover{background:var(--green3)}
.hero-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:14px 16px;display:flex;align-items:center}
.hero-stat{flex:1}
.hero-label{font-size:11px;color:rgba(255,255,255,.55);margin-bottom:2px}
.hero-value{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;color:var(--white);line-height:1}
.hero-value.yellow{color:var(--yellow)}
.hero-divider{width:1px;height:40px;background:rgba(255,255,255,.12);margin:0 16px}
.score-ring{width:52px;height:52px;position:relative;flex-shrink:0}
.score-ring svg{transform:rotate(-90deg)}
.score-ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:13px;font-weight:800;color:var(--white);line-height:1}
.score-ring-label span{font-size:8px;color:rgba(255,255,255,.5);font-weight:400;font-family:'Inter',sans-serif}

/* Nav */
.nav-tabs{background:var(--white);display:flex;border-bottom:1.5px solid var(--border);flex-shrink:0;position:sticky;top:0;z-index:30}
.nav-tab{flex:1;border:none;background:transparent;padding:11px 4px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;font-weight:500;color:var(--muted);transition:color .15s;position:relative}
.nav-tab.active{color:var(--green);font-weight:600}
.nav-tab.active::after{content:'';position:absolute;bottom:-1.5px;left:20%;right:20%;height:2px;background:var(--green);border-radius:2px}
.nav-icon{font-size:19px;line-height:1}

/* Scroll */
.scroll-area{flex:1;overflow-y:auto;padding-bottom:24px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.scroll-area::-webkit-scrollbar{display:none}

/* Section */
.sec{padding:18px 20px 0}
.sec-hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.sec-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:var(--green);letter-spacing:-.2px}
.sec-link{font-size:12px;color:var(--green3);font-weight:600;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;padding:0}

/* Deal strip */
.deal-strip{display:flex;gap:10px;overflow-x:auto;padding:0 20px 4px;scrollbar-width:none;margin:0 -20px}
.deal-strip::-webkit-scrollbar{display:none}
.deal-card{flex-shrink:0;width:108px;background:var(--white);border-radius:14px;padding:12px;border:1.5px solid var(--border);cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s;position:relative}
.deal-card:hover{border-color:var(--green3);box-shadow:var(--shadow-md);transform:translateY(-1px)}
.save-tag{position:absolute;top:-7px;right:8px;background:var(--yellow);color:var(--green);font-family:'Sora',sans-serif;font-size:10px;font-weight:800;border-radius:6px;padding:2px 6px}
.deal-emoji{font-size:26px;display:block;margin-bottom:6px}
.deal-name{font-size:12px;font-weight:600;color:var(--slate);line-height:1.2;margin-bottom:2px}
.deal-unit{font-size:10px;color:var(--muted);margin-bottom:6px}
.deal-prices{display:flex;align-items:baseline;gap:5px}
.deal-now{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:var(--green)}
.deal-was{font-size:11px;color:var(--muted);text-decoration:line-through}

/* Meal cards */
.today-card{background:var(--white);border-radius:16px;border:1.5px solid var(--border);overflow:hidden;margin-bottom:10px}
.today-meal-row{display:flex;align-items:center;padding:12px 14px;gap:12px;cursor:pointer;transition:background .1s}
.today-meal-row:hover{background:var(--foam)}
.today-meal-row+.today-meal-row{border-top:1px solid var(--border)}
.tm-type{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);width:58px;flex-shrink:0}
.tm-emoji{font-size:22px;flex-shrink:0}
.tm-info{flex:1;min-width:0}
.tm-name{font-size:13px;font-weight:600;color:var(--slate);line-height:1.3}
.tm-meta{font-size:11px;color:var(--muted);margin-top:1px}
.tm-save{font-size:11px;font-weight:700;color:var(--green);background:var(--foam);border-radius:6px;padding:2px 6px;white-space:nowrap}
.meal-badge{font-size:10px;font-weight:700;border-radius:5px;padding:2px 7px;display:inline-block;margin-top:3px}
.meal-badge.prep{background:var(--yellow2);color:#92400E}
.meal-badge.leftover{background:var(--purple2);color:var(--purple)}
.meal-badge.upcoming{background:var(--foam);color:var(--green2)}

/* Alert */
.alert-strip{display:flex;align-items:center;gap:10px;background:#FEF9E7;border:1.5px solid var(--yellow);border-radius:12px;padding:11px 14px;font-size:13px;color:#92400E;margin-bottom:8px}
.alert-strip.red{background:#FEF2F2;border-color:#FCA5A5;color:var(--red)}
.alert-icon{font-size:18px;flex-shrink:0}

/* Chips */
.chip{border-radius:20px;padding:3px 9px;font-size:11px;font-weight:600;background:var(--bg);color:var(--muted);border:1px solid var(--border)}
.chip.green{background:var(--foam);color:var(--green);border-color:var(--mint)}
.chip.yellow{background:var(--yellow2);color:#92400E;border-color:var(--yellow)}
.chip.purple{background:var(--purple2);color:var(--purple);border-color:#C4B5FD}

/* Plan */
.day-row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:14px 20px 0}
.day-row::-webkit-scrollbar{display:none}
.day-btn{flex-shrink:0;width:44px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);padding:7px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s;font-family:'Inter',sans-serif;position:relative}
.day-btn:hover{border-color:var(--green3)}
.day-btn.active{background:var(--green);border-color:var(--green)}
.day-btn-d{font-size:10px;font-weight:700;color:var(--muted)}
.day-btn-n{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:var(--slate)}
.day-btn.active .day-btn-d,.day-btn.active .day-btn-n{color:var(--white)}
.prep-dot{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--yellow)}
.day-savings-row{background:var(--foam);border-radius:12px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin:12px 20px 0}
.dsr-label{font-size:12px;color:var(--muted)}
.dsr-val{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:var(--green)}

.plan-meal-card{background:var(--white);border-radius:16px;border:1.5px solid var(--border);margin:10px 20px 0;overflow:hidden;cursor:pointer;transition:border-color .15s,box-shadow .15s}
.plan-meal-card:hover{border-color:var(--mint);box-shadow:var(--shadow-md)}
.plan-meal-card.is-prep{border-color:var(--yellow);background:var(--yellow2)}
.plan-meal-card.is-leftover{border-color:#C4B5FD;background:#FDFCFF}
.plan-meal-card.is-upcoming{border-color:var(--mint);background:#FAFFFD}
.pmc-header{display:flex;align-items:center;padding:14px 14px 10px;gap:12px}
.pmc-type-badge{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--green);background:var(--foam);border-radius:6px;padding:3px 7px;white-space:nowrap}
.pmc-emoji{font-size:30px}
.pmc-name{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--slate);line-height:1.25;flex:1}
.pmc-footer{display:flex;gap:6px;padding:0 14px 12px;flex-wrap:wrap}

/* Recipe sheet */
.sheet-overlay{position:fixed;inset:0;background:rgba(10,30,20,.55);z-index:200;display:flex;align-items:flex-end;animation:fadeIn .15s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.sheet{background:var(--white);border-radius:24px 24px 0 0;width:100%;max-width:390px;margin:0 auto;max-height:92vh;display:flex;flex-direction:column;animation:slideUp .22s cubic-bezier(.32,1,.56,1)}
@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}
.sheet-handle{width:36px;height:4px;background:var(--border);border-radius:2px;margin:12px auto 0;flex-shrink:0}
.sheet-scroll{overflow-y:auto;padding:16px 20px 32px;flex:1;scrollbar-width:none}
.sheet-scroll::-webkit-scrollbar{display:none}
.sheet-close{position:absolute;top:20px;right:20px;background:var(--bg);border:none;border-radius:50%;width:32px;height:32px;font-size:14px;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center}
.sheet-close:hover{background:var(--border)}
.sheet-hero-emoji{font-size:52px;text-align:center;margin-bottom:10px}
.sheet-title{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--green);text-align:center;letter-spacing:-.3px;margin-bottom:10px;line-height:1.2}
.sheet-chips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:14px}
.savings-banner{background:var(--green);border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.sb-label{font-size:11px;color:rgba(255,255,255,.55);margin-bottom:2px}
.sb-val{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--yellow)}
.recipe-section{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin:16px 0 10px;display:flex;align-items:center;gap:8px}
.recipe-section::after{content:'';flex:1;height:1px;background:var(--border)}
.ing-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px;color:var(--slate)}
.ing-dot{width:7px;height:7px;border-radius:50%;background:var(--mint);flex-shrink:0}
.ing-deal{font-size:10px;font-weight:700;color:var(--green);background:var(--foam);border-radius:4px;padding:1px 5px;margin-left:auto}
.step-item{display:flex;gap:12px;margin-bottom:13px;align-items:flex-start}
.step-num{min-width:26px;height:26px;border-radius:50%;background:var(--foam);border:1.5px solid var(--mint);display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:12px;font-weight:800;color:var(--green);flex-shrink:0;margin-top:1px}
.step-text{font-size:13.5px;color:var(--slate);line-height:1.55}
.elevate-box{background:linear-gradient(135deg,var(--green) 0%,var(--green2) 100%);border-radius:16px;padding:16px;margin-top:18px}
.elevate-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--yellow);margin-bottom:10px}
.elevate-tip{color:rgba(255,255,255,.85);font-size:13px;line-height:1.5;margin-bottom:7px;display:flex;gap:8px}
.elevate-tip:last-child{margin-bottom:0}
.elevate-star{color:var(--yellow);flex-shrink:0}
.ai-gen-btn{width:100%;background:var(--green);color:var(--white);border:none;border-radius:12px;padding:13px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Inter',sans-serif;margin-top:14px;transition:opacity .15s}
.ai-gen-btn:hover{opacity:.88}
.ai-gen-btn:disabled{opacity:.5;cursor:default}
.spin{display:inline-block;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ai-result{background:var(--foam);border:1.5px solid var(--mint);border-radius:12px;padding:14px;margin-top:12px;font-size:13px;color:var(--slate);line-height:1.65;white-space:pre-wrap}

/* Grocery */
.progress-bar-wrap{margin:14px 20px 0;background:var(--border);border-radius:8px;height:6px;overflow:hidden}
.progress-bar-fill{height:100%;background:linear-gradient(90deg,var(--green2),var(--green3));border-radius:8px;transition:width .3s}
.progress-label{font-size:11px;color:var(--muted);margin:5px 20px 0}
.cat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);padding:14px 20px 6px}
.groc-item{display:flex;align-items:center;gap:11px;padding:11px 20px;background:var(--white);border-bottom:1px solid var(--border);cursor:pointer;transition:background .1s}
.groc-item:first-of-type{border-top:1px solid var(--border)}
.groc-item:hover{background:var(--foam)}
.groc-item.checked{opacity:.45}
.groc-check{width:22px;height:22px;border-radius:50%;border:2px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;font-size:11px;color:transparent}
.groc-check.done{background:var(--green);border-color:var(--green);color:var(--white)}
.groc-emoji{font-size:22px;flex-shrink:0}
.groc-info{flex:1;min-width:0}
.groc-name{font-size:14px;font-weight:600;color:var(--slate)}
.groc-qty{font-size:11px;color:var(--muted)}
.groc-price{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:var(--slate)}
.deal-flag{font-size:9px;font-weight:800;color:var(--green);background:var(--yellow);border-radius:4px;padding:2px 5px}
.total-footer{margin:0 20px;background:var(--green);border-radius:16px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between}
.tf-label{font-size:11px;color:rgba(255,255,255,.5);margin-bottom:2px}
.tf-amount{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--white);line-height:1}
.tf-saved-label{font-size:11px;color:rgba(255,255,255,.5);margin-bottom:2px}
.tf-saved-val{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--yellow);line-height:1;text-align:right}
.efficiency-row{display:flex;align-items:center;gap:10px;margin:10px 20px 0;background:var(--white);border-radius:12px;padding:11px 14px;border:1.5px solid var(--border)}
.eff-label{font-size:12px;font-weight:600;color:var(--slate);flex:1}
.eff-score{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--green)}
.eff-track{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.eff-fill{height:100%;background:var(--green3);border-radius:3px}

/* Insights */
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 20px 0}
.stat-card{background:var(--white);border-radius:14px;border:1.5px solid var(--border);padding:14px}
.stat-icon{font-size:22px;margin-bottom:8px}
.stat-val{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--green);line-height:1;margin-bottom:3px}
.stat-label{font-size:11px;color:var(--muted)}
.stat-trend{font-size:11px;color:var(--green3);font-weight:600;margin-top:3px}
.bc-wrap{padding:0 20px}
.bc-title{font-size:13px;font-weight:600;color:var(--slate);margin:16px 0 10px}
.bc-row{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.bc-day{font-size:11px;font-weight:600;color:var(--muted);width:28px}
.bc-track{flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden}
.bc-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,var(--green2),var(--green3))}
.bc-val{font-size:11px;font-weight:700;color:var(--slate);width:34px;text-align:right}
.pantry-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px;margin-top:14px}
.pantry-card{background:var(--white);border-radius:14px;border:1.5px solid var(--border);padding:13px}
.pantry-card.critical{border-color:#FCA5A5;background:#FEF2F2}
.pantry-card.low{border-color:var(--yellow);background:var(--yellow2)}
.pantry-emoji{font-size:26px;margin-bottom:7px}
.pantry-name{font-size:12px;font-weight:600;color:var(--slate);margin-bottom:7px}
.pantry-track{height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:4px}
.pantry-fill{height:100%;border-radius:3px}
.pantry-fill.good{background:var(--green3)}
.pantry-fill.low{background:#F59E0B}
.pantry-fill.critical{background:var(--red)}
.pantry-status{font-size:10px;font-weight:700}
.pantry-status.good{color:var(--green3)}
.pantry-status.low{color:#D97706}
.pantry-status.critical{color:var(--red)}

/* AI Chat */
.ai-screen{padding:18px 20px 0}
.quick-pills{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:0 20px 4px}
.quick-pills::-webkit-scrollbar{display:none}
.quick-pill{flex-shrink:0;background:var(--white);border:1.5px solid var(--border);border-radius:20px;padding:6px 13px;font-size:12px;font-weight:600;color:var(--slate);cursor:pointer;white-space:nowrap;font-family:'Inter',sans-serif;transition:all .15s}
.quick-pill:hover{border-color:var(--green3);color:var(--green);background:var(--foam)}
.chat-area{margin-top:14px}
.chat-bubble{border-radius:14px;padding:12px 14px;margin-bottom:10px;font-size:13.5px;line-height:1.6;max-width:92%}
.chat-bubble.user{background:var(--green);color:var(--white);margin-left:auto;border-bottom-right-radius:4px}
.chat-bubble.ai{background:var(--white);color:var(--slate);border:1.5px solid var(--border);border-bottom-left-radius:4px;white-space:pre-wrap}
.chat-bubble.ai .ai-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--green3);margin-bottom:6px}
.chat-input-row{display:flex;gap:8px;padding:12px 20px;background:var(--white);border-top:1px solid var(--border);position:sticky;bottom:0}
.chat-input{flex:1;background:var(--bg);border:1.5px solid var(--border);border-radius:22px;padding:9px 16px;font-size:13.5px;font-family:'Inter',sans-serif;color:var(--slate);outline:none;resize:none;transition:border-color .15s;line-height:1.4}
.chat-input:focus{border-color:var(--green3)}
.chat-send{width:38px;height:38px;border-radius:50%;background:var(--green);border:none;color:var(--white);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;align-self:flex-end;transition:opacity .15s}
.chat-send:hover{opacity:.85}
.chat-send:disabled{opacity:.4;cursor:default}

/* ══════════ ONBOARDING ══════════ */
.ob-shell{position:fixed;inset:0;background:var(--green);z-index:500;display:flex;flex-direction:column;width:390px;margin:0 auto;overflow:hidden}
.ob-top{padding:48px 28px 0;flex-shrink:0}
.ob-logo{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--white);letter-spacing:-.5px;margin-bottom:3px}
.ob-logo em{color:var(--yellow);font-style:normal}
.ob-tagline{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:24px}
.ob-dots{display:flex;gap:5px;margin-bottom:22px;align-items:center}
.ob-dot{height:4px;border-radius:2px;transition:all .3s;flex-shrink:0}
.ob-dot.done{width:14px;background:rgba(255,255,255,.38)}
.ob-dot.active{width:22px;background:var(--yellow)}
.ob-dot.todo{width:7px;background:rgba(255,255,255,.18)}
.ob-step-title{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--white);line-height:1.25;margin-bottom:5px;letter-spacing:-.3px}
.ob-step-sub{font-size:12.5px;color:rgba(255,255,255,.58);margin-bottom:20px;line-height:1.5}
.ob-body{flex:1;overflow-y:auto;padding:0 28px;scrollbar-width:none}
.ob-body::-webkit-scrollbar{display:none}
.ob-footer{padding:16px 28px 32px;flex-shrink:0}
.ob-btn{width:100%;background:var(--yellow);color:var(--green);border:none;border-radius:14px;padding:15px;font-family:'Sora',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:opacity .15s}
.ob-btn:hover{opacity:.9}
.ob-btn:disabled{opacity:.32;cursor:default}
.ob-back{background:none;border:none;color:rgba(255,255,255,.42);font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;margin-top:9px;width:100%;padding:5px 0;display:block;text-align:center}
.ob-back:hover{color:rgba(255,255,255,.72)}

/* Ob shared */
.ob-section-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:rgba(255,255,255,.38);margin-bottom:9px;margin-top:3px}
.ob-options{display:flex;flex-direction:column;gap:9px}
.ob-option{background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.14);border-radius:13px;padding:13px 15px;cursor:pointer;display:flex;align-items:center;gap:11px;transition:all .15s}
.ob-option:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.28)}
.ob-option.sel{background:rgba(245,200,66,.11);border-color:var(--yellow)}
.ob-option-emoji{font-size:21px;flex-shrink:0}
.ob-option-label{font-size:13.5px;font-weight:600;color:var(--white)}
.ob-option-sub{font-size:10.5px;color:rgba(255,255,255,.48);margin-top:1px}
.ob-check{margin-left:auto;width:19px;height:19px;border-radius:50%;border:2px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;transition:all .15s;color:transparent}
.ob-option.sel .ob-check{background:var(--yellow);border-color:var(--yellow);color:var(--green)}
.ob-pill-grid{display:flex;flex-wrap:wrap;gap:7px}
.ob-pill{border-radius:21px;padding:7px 13px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:rgba(255,255,255,.78);font-size:12.5px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:5px;transition:all .15s}
.ob-pill:hover{border-color:rgba(255,255,255,.38);background:rgba(255,255,255,.1)}
.ob-pill.sel{background:rgba(245,200,66,.14);border-color:var(--yellow);color:var(--yellow)}
.ob-stepper{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.14);border-radius:13px;padding:13px 15px;margin-bottom:11px}
.ob-stepper-label{font-size:13.5px;font-weight:600;color:var(--white)}
.ob-stepper-sub{font-size:10.5px;color:rgba(255,255,255,.48);margin-top:1px}
.ob-ctrl{display:flex;align-items:center;gap:13px}
.ob-step-btn{width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,.14);color:var(--white);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;font-family:'Sora',sans-serif;line-height:1}
.ob-step-btn:hover{background:rgba(255,255,255,.24)}
.ob-step-btn:disabled{opacity:.28;cursor:default}
.ob-step-val{font-family:'Sora',sans-serif;font-size:21px;font-weight:800;color:var(--white);min-width:26px;text-align:center}
.ob-budget-val{font-family:'Sora',sans-serif;font-size:46px;font-weight:800;color:var(--yellow);line-height:1;text-align:center}
.ob-budget-sub{font-size:12px;color:rgba(255,255,255,.48);margin-top:4px;text-align:center;margin-bottom:14px}
.ob-slider{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;background:rgba(255,255,255,.14);outline:none;cursor:pointer;margin:7px 0 14px}
.ob-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--yellow);cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.28)}
.ob-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--yellow);cursor:pointer;border:none}
.ob-presets{display:flex;gap:7px}
.ob-preset{flex:1;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.14);border-radius:10px;padding:7px 3px;text-align:center;cursor:pointer;transition:all .15s}
.ob-preset.sel{background:rgba(245,200,66,.14);border-color:var(--yellow)}
.ob-preset-val{font-family:'Sora',sans-serif;font-size:13px;font-weight:700;color:var(--white)}
.ob-preset-label{font-size:9.5px;color:rgba(255,255,255,.42);margin-top:2px}
.ob-summary{background:rgba(255,255,255,.07);border-radius:13px;padding:13px 15px;margin-top:18px}
.ob-summary-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:rgba(255,255,255,.38);margin-bottom:11px}
.ob-summary-row{display:flex;gap:9px;margin-bottom:7px;align-items:flex-start}
.ob-summary-icon{font-size:13px;flex-shrink:0;width:17px}
.ob-summary-key{font-size:11px;color:rgba(255,255,255,.38);width:62px;flex-shrink:0}
.ob-summary-val{font-size:11px;color:rgba(255,255,255,.84);font-weight:600;flex:1;line-height:1.4}

/* ── Location step ── */
.loc-method-row{display:flex;gap:8px;margin-bottom:16px}
.loc-method-btn{flex:1;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.14);border-radius:12px;padding:13px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .15s;font-family:'Inter',sans-serif}
.loc-method-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.3)}
.loc-method-btn.sel{background:rgba(245,200,66,.12);border-color:var(--yellow)}
.loc-method-emoji{font-size:26px}
.loc-method-label{font-size:12px;font-weight:700;color:var(--white);text-align:center;line-height:1.3}
.loc-method-btn.sel .loc-method-label{color:var(--yellow)}
.loc-status{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.07);border-radius:12px;padding:13px 15px;margin-bottom:12px;font-size:13px;color:rgba(255,255,255,.8)}
.loc-status-icon{font-size:20px;flex-shrink:0}
.loc-status.success{background:rgba(82,183,136,.15);border:1.5px solid rgba(82,183,136,.3)}
.loc-status.error{background:rgba(220,38,38,.12);border:1.5px solid rgba(220,38,38,.25)}
.address-input{width:100%;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);border-radius:12px;padding:12px 14px;font-size:13.5px;font-family:'Inter',sans-serif;color:var(--white);outline:none;transition:border-color .15s;margin-bottom:10px}
.address-input::placeholder{color:rgba(255,255,255,.38)}
.address-input:focus{border-color:var(--yellow)}
.address-search-btn{width:100%;background:rgba(255,255,255,.14);border:none;border-radius:12px;padding:12px;font-size:13px;font-weight:600;color:var(--white);cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px}
.address-search-btn:hover{background:rgba(255,255,255,.22)}
.address-search-btn:disabled{opacity:.4;cursor:default}

/* Store result cards */
.store-results{display:flex;flex-direction:column;gap:9px;margin-top:4px}
.store-result-card{background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.14);border-radius:13px;padding:13px 15px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all .15s}
.store-result-card:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.3)}
.store-result-card.sel{background:rgba(245,200,66,.12);border-color:var(--yellow)}
.src-emoji{font-size:22px;flex-shrink:0}
.src-info{flex:1;min-width:0}
.src-name{font-size:14px;font-weight:700;color:var(--white)}
.src-address{font-size:11px;color:rgba(255,255,255,.5);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.src-dist{font-family:'Sora',sans-serif;font-size:13px;font-weight:800;color:var(--yellow);white-space:nowrap}
.src-dist-label{font-size:9px;color:rgba(255,255,255,.38);text-align:right;margin-top:1px}
.no-stores-msg{background:rgba(255,255,255,.07);border-radius:12px;padding:16px;text-align:center;color:rgba(255,255,255,.55);font-size:13px;line-height:1.6}

/* ── Per-meal config ── */
.meal-cfg-tabs{display:flex;gap:6px;margin-bottom:14px}
.mct-btn{flex:1;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);border-radius:11px;padding:9px 3px;cursor:pointer;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all .15s}
.mct-btn:hover{background:rgba(255,255,255,.11)}
.mct-btn.active{background:rgba(245,200,66,.13);border-color:var(--yellow)}
.mct-emoji{font-size:19px}
.mct-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.4px}
.mct-btn.active .mct-label{color:var(--yellow)}
.mct-sub{font-size:9px;color:rgba(255,255,255,.35);font-weight:600}
.mct-btn.active .mct-sub{color:rgba(245,200,66,.7)}
.meal-toggle-row{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);border-radius:12px;padding:12px 14px;margin-bottom:11px}
.mt-label{font-size:13.5px;font-weight:600;color:var(--white)}
.mt-sub{font-size:10.5px;color:rgba(255,255,255,.43);margin-top:1px}
.toggle-switch{width:40px;height:23px;border-radius:12px;background:rgba(255,255,255,.18);border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
.toggle-switch.on{background:var(--yellow)}
.toggle-switch::after{content:'';position:absolute;top:3px;left:3px;width:17px;height:17px;border-radius:50%;background:var(--white);transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle-switch.on::after{transform:translateX(17px)}
.style-selector{display:flex;flex-direction:column;gap:7px;margin-bottom:11px}
.style-btn{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);border-radius:12px;padding:11px 13px;cursor:pointer;display:flex;align-items:flex-start;gap:9px;transition:all .15s;text-align:left;font-family:'Inter',sans-serif}
.style-btn:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.28)}
.style-btn.sel{background:rgba(245,200,66,.1);border-color:var(--yellow)}
.style-btn-emoji{font-size:19px;flex-shrink:0;margin-top:1px}
.style-btn-label{font-size:13px;font-weight:700;color:var(--white);margin-bottom:2px}
.style-btn-sub{font-size:10.5px;color:rgba(255,255,255,.48);line-height:1.4}
.style-check{margin-left:auto;width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;color:transparent;transition:all .15s}
.style-btn.sel .style-check{background:var(--yellow);border-color:var(--yellow);color:var(--green)}
.skill-selector{display:flex;gap:6px;margin-bottom:11px}
.skill-btn{flex:1;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);border-radius:10px;padding:9px 3px;text-align:center;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
.skill-btn:hover{background:rgba(255,255,255,.11)}
.skill-btn.sel{background:rgba(245,200,66,.1);border-color:var(--yellow)}
.skill-emoji{font-size:16px;display:block;margin-bottom:3px}
.skill-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.78)}
.skill-btn.sel .skill-label{color:var(--yellow)}
.config-divider{height:1px;background:rgba(255,255,255,.09);margin:13px 0}
.prepday-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:11px}
.pd-btn{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);border-radius:8px;padding:6px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s;font-family:'Inter',sans-serif}
.pd-btn:hover{background:rgba(255,255,255,.13)}
.pd-btn.sel{background:rgba(245,200,66,.13);border-color:var(--yellow)}
.pd-day{font-size:8.5px;font-weight:700;color:rgba(255,255,255,.48);text-transform:uppercase}
.pd-num{font-family:'Sora',sans-serif;font-size:12px;font-weight:800;color:var(--white)}
.pd-btn.sel .pd-day,.pd-btn.sel .pd-num{color:var(--yellow)}

/* ── Profile screen ── */
.profile-screen{flex:1;overflow-y:auto;scrollbar-width:none}
.profile-screen::-webkit-scrollbar{display:none}
.profile-hero{background:var(--green);padding:28px 20px 24px;text-align:center}
.profile-avatar{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 12px}
.profile-name{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--white);margin-bottom:3px}
.profile-sub{font-size:12px;color:rgba(255,255,255,.52)}
.prefs-section{padding:18px 20px 0}
.prefs-section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:10px}
.prefs-card{background:var(--white);border-radius:16px;border:1.5px solid var(--border);overflow:hidden;margin-bottom:12px}
.prefs-row{display:flex;align-items:center;padding:13px 16px;gap:12px;cursor:pointer;transition:background .1s;border-bottom:1px solid var(--border)}
.prefs-row:last-child{border-bottom:none}
.prefs-row:hover{background:var(--foam)}
.prefs-row-icon{font-size:20px;flex-shrink:0}
.prefs-row-info{flex:1;min-width:0}
.prefs-row-label{font-size:14px;font-weight:600;color:var(--slate)}
.prefs-row-val{font-size:12px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.prefs-row-arrow{font-size:18px;color:var(--border)}
.meal-cfg-preview{background:var(--white);border-radius:16px;border:1.5px solid var(--border);overflow:hidden;margin-bottom:12px}
.mcp-header{padding:11px 16px;border-bottom:1px solid var(--border);font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted)}
.mcp-row{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);gap:10px;cursor:pointer;transition:background .1s}
.mcp-row:hover{background:var(--foam)}
.mcp-row:last-child{border-bottom:none}
.mcp-icon{font-size:18px;flex-shrink:0;width:24px;text-align:center}
.mcp-info{flex:1;min-width:0}
.mcp-label{font-size:13px;font-weight:600;color:var(--slate)}
.mcp-detail{font-size:11px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcp-arrow{font-size:16px;color:var(--border)}
.reset-btn{width:100%;background:none;border:1.5px solid #FCA5A5;border-radius:12px;padding:13px;font-size:13px;font-weight:600;color:var(--red);cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s;margin-bottom:32px}
.reset-btn:hover{background:#FEF2F2}

/* ── Pantry screen ── */
.pantry-screen{flex:1;overflow-y:auto;scrollbar-width:none}
.pantry-screen::-webkit-scrollbar{display:none}
.pantry-header-bar{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 0}
.pantry-add-btn{background:var(--green);border:none;border-radius:22px;padding:8px 16px;font-size:12px;font-weight:700;color:var(--white);cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:6px;transition:opacity .15s}
.pantry-add-btn:hover{opacity:.88}
.pantry-filter-row{display:flex;gap:6px;padding:12px 20px 0;overflow-x:auto;scrollbar-width:none}
.pantry-filter-row::-webkit-scrollbar{display:none}
.pf-btn{flex-shrink:0;border-radius:20px;padding:5px 13px;font-size:12px;font-weight:600;background:var(--white);border:1.5px solid var(--border);color:var(--muted);cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s}
.pf-btn.active{background:var(--green);border-color:var(--green);color:var(--white)}
.pf-btn.red{background:#FEF2F2;border-color:#FCA5A5;color:var(--red)}
.pantry-list{padding:12px 20px 0;display:flex;flex-direction:column;gap:10px}
.pantry-item-card{background:var(--white);border-radius:16px;border:1.5px solid var(--border);padding:14px 14px 12px;transition:border-color .15s,box-shadow .15s}
.pantry-item-card:hover{border-color:var(--mint);box-shadow:0 2px 8px rgba(15,61,46,.07)}
.pantry-item-card.low{border-color:var(--yellow);background:var(--yellow2)}
.pantry-item-card.critical{border-color:#FCA5A5;background:#FEF2F2}
.pi-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.pi-emoji{font-size:26px;flex-shrink:0}
.pi-info{flex:1;min-width:0}
.pi-name{font-size:14px;font-weight:700;color:var(--slate);line-height:1.2}
.pi-brand{font-size:11px;color:var(--muted);margin-top:1px}
.pi-amount{font-size:12px;font-weight:600;color:var(--muted);margin-top:3px}
.pi-actions{display:flex;gap:6px;flex-shrink:0}
.pi-action-btn{width:28px;height:28px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.pi-action-btn:hover{border-color:var(--green3);background:var(--foam)}
.pi-action-btn.del:hover{border-color:#FCA5A5;background:#FEF2F2}
.pi-track{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:6px}
.pi-fill{height:100%;border-radius:3px;transition:width .4s}
.pi-fill.good{background:var(--green3)}
.pi-fill.low{background:#F59E0B}
.pi-fill.critical{background:var(--red)}
.pi-status-row{display:flex;align-items:center;justify-content:space-between}
.pi-status{font-size:10px;font-weight:700}
.pi-status.good{color:var(--green3)}
.pi-status.low{color:#D97706}
.pi-status.critical{color:var(--red)}
.pi-status-btns{display:flex;gap:4px}
.pi-pct-btn{font-size:10px;font-weight:700;border-radius:6px;padding:2px 7px;border:1.5px solid var(--border);background:var(--white);cursor:pointer;color:var(--muted);font-family:'Inter',sans-serif;transition:all .15s}
.pi-pct-btn.sel{background:var(--green);border-color:var(--green);color:var(--white)}
.pantry-empty{text-align:center;padding:48px 20px;color:var(--muted)}
.pantry-empty-emoji{font-size:48px;margin-bottom:12px}
.pantry-empty-title{font-size:16px;font-weight:700;color:var(--slate);margin-bottom:6px}
.pantry-empty-sub{font-size:13px;line-height:1.6}

/* Pantry add/edit sheet */
.pantry-form{padding:0 20px 32px}
.pantry-form-title{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--green);margin-bottom:4px}
.pantry-form-sub{font-size:12px;color:var(--muted);margin-bottom:20px}
.form-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px;display:block}
.form-input{width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:11px;padding:11px 14px;font-size:14px;font-family:'Inter',sans-serif;color:var(--slate);outline:none;transition:border-color .15s;margin-bottom:14px}
.form-input:focus{border-color:var(--green3)}
.form-input::placeholder{color:var(--muted)}
.form-row{display:flex;gap:10px;margin-bottom:0}
.form-row .form-input{margin-bottom:0}
.emoji-grid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.emoji-opt{width:38px;height:38px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.emoji-opt:hover{border-color:var(--green3)}
.emoji-opt.sel{border-color:var(--green);background:var(--foam)}
.amount-presets{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.amount-preset{border-radius:20px;padding:5px 12px;border:1.5px solid var(--border);background:var(--white);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s}
.amount-preset:hover{border-color:var(--green3);color:var(--green)}
.amount-preset.sel{background:var(--foam);border-color:var(--green3);color:var(--green)}
.pct-slider-wrap{margin-bottom:16px}
.pct-slider-val{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;color:var(--green);margin-bottom:4px}
.pct-slider-sub{font-size:12px;color:var(--muted);margin-bottom:8px}
.form-save-btn{width:100%;background:var(--green);color:var(--white);border:none;border-radius:13px;padding:15px;font-family:'Sora',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:opacity .15s;margin-top:6px}
.form-save-btn:hover{opacity:.88}
.form-save-btn:disabled{opacity:.38;cursor:default}
.form-cancel-btn{width:100%;background:none;border:none;color:var(--muted);font-size:13px;cursor:pointer;padding:10px;font-family:'Inter',sans-serif;margin-top:4px}

/* ── End-of-week banner ── */
.eow-banner{margin:18px 20px 0;background:linear-gradient(135deg,var(--green) 0%,var(--green2) 100%);border-radius:18px;padding:18px 18px 16px;cursor:pointer;transition:opacity .15s}
.eow-banner:hover{opacity:.92}
.eow-banner-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.eow-banner-emoji{font-size:28px}
.eow-banner-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:var(--white);letter-spacing:-.2px}
.eow-banner-sub{font-size:12px;color:rgba(255,255,255,.58);margin-top:2px}
.eow-banner-btn{width:100%;background:var(--yellow);border:none;border-radius:11px;padding:11px;font-family:'Sora',sans-serif;font-size:13px;font-weight:800;color:var(--green);cursor:pointer;transition:opacity .15s}
.eow-banner-btn:hover{opacity:.9}

/* ── End-of-week modal ── */
.eow-overlay{position:fixed;inset:0;background:rgba(10,30,20,.6);z-index:300;display:flex;align-items:flex-end;animation:fadeIn .15s}
.eow-sheet{background:var(--white);border-radius:24px 24px 0 0;width:100%;max-width:390px;margin:0 auto;max-height:90vh;display:flex;flex-direction:column;animation:slideUp .22s cubic-bezier(.32,1,.56,1)}
.eow-scroll{overflow-y:auto;padding:20px 20px 32px;flex:1;scrollbar-width:none}
.eow-scroll::-webkit-scrollbar{display:none}
.eow-hero{text-align:center;padding:4px 0 18px}
.eow-hero-emoji{font-size:48px;margin-bottom:10px}
.eow-hero-title{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--green);letter-spacing:-.3px;margin-bottom:6px}
.eow-hero-sub{font-size:13px;color:var(--muted);line-height:1.5}
.eow-stats-row{display:flex;gap:8px;margin-bottom:18px}
.eow-stat{flex:1;background:var(--foam);border-radius:12px;padding:12px 8px;text-align:center}
.eow-stat-val{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--green)}
.eow-stat-label{font-size:10px;color:var(--muted);margin-top:3px}
.eow-section{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin:18px 0 10px;display:flex;align-items:center;gap:8px}
.eow-section::after{content:'';flex:1;height:1px;background:var(--border)}
.eow-day-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:14px}
.eow-day-btn{background:var(--bg);border:1.5px solid var(--border);border-radius:9px;padding:7px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s;font-family:'Inter',sans-serif}
.eow-day-btn:hover{border-color:var(--green3);background:var(--foam)}
.eow-day-btn.sel{background:var(--green);border-color:var(--green)}
.eow-day-d{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase}
.eow-day-n{font-family:'Sora',sans-serif;font-size:13px;font-weight:800;color:var(--slate)}
.eow-day-btn.sel .eow-day-d,.eow-day-btn.sel .eow-day-n{color:var(--white)}
.eow-notif-card{background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:10px}
.eow-notif-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.eow-notif-label{font-size:14px;font-weight:600;color:var(--slate)}
.eow-notif-sub{font-size:11px;color:var(--muted);line-height:1.4;margin-top:4px}
.eow-regen-card{background:var(--foam);border:1.5px solid var(--mint);border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;gap:12px;align-items:flex-start}
.eow-regen-emoji{font-size:22px;flex-shrink:0}
.eow-regen-label{font-size:14px;font-weight:600;color:var(--green);margin-bottom:3px}
.eow-regen-sub{font-size:11.5px;color:var(--green2);line-height:1.45}
.eow-actions{display:flex;flex-direction:column;gap:8px;padding-top:4px}
.eow-primary-btn{width:100%;background:var(--green);color:var(--white);border:none;border-radius:13px;padding:15px;font-family:'Sora',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:opacity .15s}
.eow-primary-btn:hover{opacity:.88}
.eow-secondary-btn{width:100%;background:none;color:var(--green);border:1.5px solid var(--mint);border-radius:13px;padding:13px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
.eow-secondary-btn:hover{background:var(--foam)}
.eow-dismiss-btn{width:100%;background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;padding:6px;font-family:'Inter',sans-serif}
`;

/* ─── Stepper ────────────────────────────────────────────────────────────────── */
function Stepper({label,sub,value,min=1,max=10,onChange}){
  return(
    <div className="ob-stepper">
      <div>
        <div className="ob-stepper-label">{label}</div>
        {sub&&<div className="ob-stepper-sub">{sub}</div>}
      </div>
      <div className="ob-ctrl">
        <button className="ob-step-btn" disabled={value<=min} onClick={()=>onChange(value-1)}>−</button>
        <div className="ob-step-val">{value}</div>
        <button className="ob-step-btn" disabled={value>=max} onClick={()=>onChange(value+1)}>+</button>
      </div>
    </div>
  );
}

/* ─── Per-Meal Config Panel ──────────────────────────────────────────────────── */
const MEAL_STYLES={
  breakfast:[
    {id:"varied",   emoji:"🍳",label:"Fresh every morning",   sub:"Different breakfast each day."},
    {id:"quick",    emoji:"⚡",label:"Quick only (≤10 min)",  sub:"Smoothies, yogurt, grab-and-go."},
    {id:"mealprep", emoji:"🥡",label:"Batch prep",            sub:"Egg muffins, overnight oats — cook once, eat all week."},
  ],
  lunch:[
    {id:"varied",   emoji:"🥗",label:"Varied daily",          sub:"Different lunch each day from deal ingredients."},
    {id:"mealprep", emoji:"🥡",label:"Meal prep batch",       sub:"Cook once, portion out — scales your grocery list automatically."},
    {id:"quick",    emoji:"⚡",label:"Quick only (≤15 min)",  sub:"Wraps, salads, grain bowls. Assembly only."},
  ],
  dinner:[
    {id:"varied",   emoji:"🍽️",label:"Varied nightly",       sub:"Unique dinner each night. Maximum variety."},
    {id:"mealprep", emoji:"🥡",label:"Batch dinners",         sub:"Cook in bulk and eat across multiple nights."},
    {id:"quick",    emoji:"⚡",label:"Quick only (≤25 min)",  sub:"Weeknight-fast only. No long simmers or marinades."},
  ],
};
const SKILL_OPTS=[
  {id:"beginner",    emoji:"🌱",label:"Easy"},
  {id:"intermediate",emoji:"👨‍🍳",label:"Medium"},
  {id:"advanced",    emoji:"⭐",label:"Hard"},
];

function MealConfigPanel({mtype,cfg,onChange}){
  const styles=MEAL_STYLES[mtype];
  const label=cap(mtype);
  return(
    <div>
      <div className="meal-toggle-row">
        <div>
          <div className="mt-label">Plan {label}</div>
          <div className="mt-sub">Include {mtype} in your weekly plan</div>
        </div>
        <button className={`toggle-switch${cfg.enabled?" on":""}`} onClick={()=>onChange({...cfg,enabled:!cfg.enabled})}/>
      </div>
      {cfg.enabled&&(
        <>
          <div className="ob-section-label">Cooking style</div>
          <div className="style-selector">
            {styles.map(s=>(
              <button key={s.id} className={`style-btn${cfg.style===s.id?" sel":""}`}
                onClick={()=>onChange({...cfg,style:s.id,prepDay:s.id==="mealprep"?(cfg.prepDay??0):null})}>
                <span className="style-btn-emoji">{s.emoji}</span>
                <div style={{flex:1}}>
                  <div className="style-btn-label">{s.label}</div>
                  <div className="style-btn-sub">{s.sub}</div>
                </div>
                <div className="style-check">✓</div>
              </button>
            ))}
          </div>
          <div className="ob-section-label">Difficulty</div>
          <div className="skill-selector">
            {SKILL_OPTS.map(s=>(
              <button key={s.id} className={`skill-btn${cfg.skill===s.id?" sel":""}`} onClick={()=>onChange({...cfg,skill:s.id})}>
                <span className="skill-emoji">{s.emoji}</span>
                <div className="skill-label">{s.label}</div>
              </button>
            ))}
          </div>
          {cfg.style==="mealprep"&&(
            <>
              <div className="config-divider"/>
              <div className="ob-section-label">Which day do you prep?</div>
              <div className="prepday-grid">
                {DAYS.map((d,i)=>(
                  <button key={i} className={`pd-btn${cfg.prepDay===i?" sel":""}`} onClick={()=>onChange({...cfg,prepDay:i})}>
                    <span className="pd-day">{d}</span>
                    <span className="pd-num">{DATES[i].split(" ")[1]}</span>
                  </button>
                ))}
              </div>
              <Stepper
                label="Portions per batch"
                sub={`Covers ${cfg.portions} day${cfg.portions>1?"s":""} from one cook session`}
                value={cfg.portions} min={2} max={7}
                onChange={v=>onChange({...cfg,portions:v})}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Location Step ──────────────────────────────────────────────────────────── */
function LocationStep({p, setP}){
  const [locMethod, setLocMethod] = useState("gps"); // "gps" | "address"
  const [locStatus, setLocStatus] = useState(null);  // null | "loading" | "success" | "error"
  const [locMsg,    setLocMsg]    = useState("");
  const [address,   setAddress]   = useState(p.userAddress||"");
  const [addrLoading, setAddrLoading] = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);

  // If we already have coords, show results immediately
  useEffect(()=>{
    if(p.userLat&&p.userLng){
      setLocStatus("success");
      setLocMsg(`Location set`);
      setNearbyStores(storesNearby(p.userLat,p.userLng));
    }
  },[]);

  const handleGPS = ()=>{
    if(!navigator.geolocation){
      setLocStatus("error");setLocMsg("Geolocation not supported on this device.");return;
    }
    setLocStatus("loading");setLocMsg("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const {latitude:lat,longitude:lng}=pos.coords;
        const found=storesNearby(lat,lng);
        setP(prev=>({...prev,userLat:lat,userLng:lng,userAddress:""}));
        setNearbyStores(found);
        setLocStatus("success");
        setLocMsg(`Found ${found.length} store${found.length!==1?"s":""} within 15 miles`);
      },
      err=>{
        setLocStatus("error");
        setLocMsg(err.code===1?"Location access denied. Try entering your address instead.":"Couldn't get location. Try your address.");
      },
      {timeout:10000}
    );
  };

  const handleAddressSearch = async()=>{
    if(!address.trim()) return;
    setAddrLoading(true);setLocStatus("loading");setLocMsg("Searching…");
    try{
      // Use Nominatim (free, no key needed) for geocoding
      const url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`;
      const res=await fetch(url,{headers:{"Accept-Language":"en","User-Agent":"SmartCartApp/1.0"}});
      const data=await res.json();
      if(data&&data.length>0){
        const lat=parseFloat(data[0].lat),lng=parseFloat(data[0].lon);
        const found=storesNearby(lat,lng);
        setP(prev=>({...prev,userLat:lat,userLng:lng,userAddress:address}));
        setNearbyStores(found);
        setLocStatus("success");
        setLocMsg(`Found ${found.length} store${found.length!==1?"s":""} within 15 miles`);
      } else {
        setLocStatus("error");setLocMsg("Address not found. Try a more specific address or zip code.");
      }
    } catch{
      // Fallback: simulate geocoding with demo data for Greenville area
      const demoLat=34.8526,demoLng=-82.3940;
      const found=storesNearby(demoLat,demoLng);
      setP(prev=>({...prev,userLat:demoLat,userLng:demoLng,userAddress:address}));
      setNearbyStores(found);
      setLocStatus("success");
      setLocMsg(`Showing stores near your area (demo mode)`);
    }
    setAddrLoading(false);
  };

  return(
    <>
      {/* Method picker */}
      <div className="loc-method-row">
        <button className={`loc-method-btn${locMethod==="gps"?" sel":""}`} onClick={()=>setLocMethod("gps")}>
          <span className="loc-method-emoji">📍</span>
          <span className="loc-method-label">Use my current location</span>
        </button>
        <button className={`loc-method-btn${locMethod==="address"?" sel":""}`} onClick={()=>setLocMethod("address")}>
          <span className="loc-method-emoji">🏠</span>
          <span className="loc-method-label">Enter home address</span>
        </button>
      </div>

      {/* GPS flow */}
      {locMethod==="gps"&&locStatus===null&&(
        <button className="address-search-btn" onClick={handleGPS}>
          📍 Share my location
        </button>
      )}
      {locMethod==="gps"&&locStatus==="loading"&&(
        <div className="loc-status"><span className="loc-status-icon"><span className="spin">⟳</span></span>{locMsg}</div>
      )}

      {/* Address flow */}
      {locMethod==="address"&&(
        <>
          <input className="address-input" placeholder="123 Main St, Greenville, SC or zip code"
            value={address} onChange={e=>setAddress(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter") handleAddressSearch();}}/>
          <button className="address-search-btn" onClick={handleAddressSearch} disabled={addrLoading||!address.trim()}>
            {addrLoading?<><span className="spin">⟳</span> Searching…</>:"🔍 Find stores near me"}
          </button>
        </>
      )}

      {/* Status message */}
      {locStatus==="success"&&(
        <div className={`loc-status success`}>
          <span className="loc-status-icon">✅</span>
          <span>{locMsg}</span>
        </div>
      )}
      {locStatus==="error"&&(
        <div className={`loc-status error`}>
          <span className="loc-status-icon">⚠️</span>
          <span style={{color:"rgba(255,255,255,.85)"}}>{locMsg}</span>
        </div>
      )}

      {/* Store results */}
      {nearbyStores.length>0&&(
        <>
          <div className="ob-section-label" style={{marginTop:14}}>
            Stores within 15 miles — pick your primary
          </div>
          <div className="store-results">
            {nearbyStores.map(s=>(
              <div key={s.id} className={`store-result-card${p.storeId===s.id?" sel":""}`}
                onClick={()=>setP(prev=>({...prev,storeId:s.id,storeName:s.name,storeAddress:s.address,storeChain:s.chain}))}>
                <span className="src-emoji">{s.emoji}</span>
                <div className="src-info">
                  <div className="src-name">{s.name}</div>
                  <div className="src-address">{s.address}</div>
                </div>
                <div style={{textAlign:"right",flex:"0 0 auto"}}>
                  <div className="src-dist">{s.distance.toFixed(1)}</div>
                  <div className="src-dist-label">miles</div>
                </div>
                <div className="ob-check" style={{marginLeft:6}}>{p.storeId===s.id?"✓":""}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {nearbyStores.length===0&&locStatus==="success"&&(
        <div className="no-stores-msg">
          No supported stores found within 15 miles of your location. Try a different address or expand your search.
        </div>
      )}
    </>
  );
}

/* ═══ ONBOARDING WIZARD ════════════════════════════════════════════════════════ */
const TOTAL_STEPS=7;

function OnboardingWizard({initialStep=0,initialPrefs=null,onComplete}){
  const [step,setStep]=useState(initialStep);
  const [activeMealTab,setActiveMealTab]=useState("breakfast");
  const [p,setP]=useState(()=>initialPrefs??{
    storeId:"",storeName:"",storeAddress:"",storeChain:"",
    userLat:null,userLng:null,userAddress:"",
    dietary:[],cuisines:[],people:2,budget:150,
    meals:DEFAULT_MEAL_CFG,
  });

  const toggleArr=(k,id)=>setP(prev=>{const a=prev[k];return{...prev,[k]:a.includes(id)?a.filter(x=>x!==id):[...a,id]};});

  const canAdvance=()=>{
    if(step===0) return !!(p.userLat&&p.userLng&&p.storeId);
    if(step===3) return Object.values(p.meals).some(m=>m.enabled);
    return true;
  };

  const STEP_META=[
    {title:"Find your store",          sub:"Share your location or enter your address — we'll show grocery stores within 15 miles."},
    {title:"Dietary needs",             sub:"Select all that apply. We never suggest what you can't eat."},
    {title:"Cuisine preferences",       sub:"We'll weight your plan toward these. Optional — skip if you like everything."},
    {title:"Configure your meals",      sub:"Set up breakfast, lunch, and dinner independently — style, difficulty, and prep schedule."},
    {title:"Household size",            sub:"Every recipe and shopping list will be sized correctly."},
    {title:"Weekly budget",             sub:"SmartCart optimizes your basket to stay within this."},
    {title:"You're all set",            sub:"Here's a summary of your SmartCart plan. You can change anything anytime."},
  ];

  const mealSummary=Object.entries(p.meals).map(([mt,cfg])=>{
    if(!cfg.enabled) return `${cap(mt)}: off`;
    const s=cfg.style==="mealprep"?`batch ×${cfg.portions} (${DAYS[cfg.prepDay??0]})`:cfg.style==="quick"?"quick":"varied";
    return `${cap(mt)}: ${s}, ${cfg.skill}`;
  }).join(" · ");

  return(
    <div className="ob-shell">
      <div className="ob-top">
        <div className="ob-logo">Smart<em>Cart</em></div>
        <div className="ob-tagline">Your AI-powered grocery planner</div>
        <div className="ob-dots">
          {STEP_META.map((_,i)=>(
            <div key={i} className={`ob-dot ${i===step?"active":i<step?"done":"todo"}`}/>
          ))}
        </div>
        <div className="ob-step-title">{STEP_META[step].title}</div>
        <div className="ob-step-sub">{STEP_META[step].sub}</div>
      </div>

      <div className="ob-body">
        {/* 0 — Location + store */}
        {step===0&&<LocationStep p={p} setP={setP}/>}

        {/* 1 — Dietary */}
        {step===1&&(
          <div className="ob-pill-grid">
            {DIETARY_OPTIONS.map(d=>(
              <div key={d.id} className={`ob-pill${p.dietary.includes(d.id)?" sel":""}`}
                onClick={()=>{if(d.id==="none")setP(prev=>({...prev,dietary:[]}));else toggleArr("dietary",d.id);}}>
                {d.emoji} {d.label}
              </div>
            ))}
          </div>
        )}

        {/* 2 — Cuisines */}
        {step===2&&(
          <div className="ob-pill-grid">
            {CUISINE_OPTIONS.map(c=>(
              <div key={c.id} className={`ob-pill${p.cuisines.includes(c.id)?" sel":""}`} onClick={()=>toggleArr("cuisines",c.id)}>
                {c.emoji} {c.label}
              </div>
            ))}
          </div>
        )}

        {/* 3 — Per-meal config */}
        {step===3&&(
          <>
            <div className="meal-cfg-tabs">
              {[
                {id:"breakfast",emoji:"☀️",label:"Breakfast"},
                {id:"lunch",    emoji:"🌤️",label:"Lunch"},
                {id:"dinner",   emoji:"🌙",label:"Dinner"},
              ].map(t=>{
                const cfg=p.meals[t.id];
                const sub=!cfg.enabled?"off":cfg.style==="mealprep"?`batch×${cfg.portions}`:cfg.style;
                return(
                  <button key={t.id} className={`mct-btn${activeMealTab===t.id?" active":""}`} onClick={()=>setActiveMealTab(t.id)}>
                    <span className="mct-emoji">{t.emoji}</span>
                    <span className="mct-label">{t.label}</span>
                    <span className="mct-sub">{sub}</span>
                  </button>
                );
              })}
            </div>
            <MealConfigPanel
              key={activeMealTab}
              mtype={activeMealTab}
              cfg={p.meals[activeMealTab]}
              onChange={cfg=>setP(prev=>({...prev,meals:{...prev.meals,[activeMealTab]:cfg}}))}
            />
          </>
        )}

        {/* 4 — People */}
        {step===4&&(
          <div className="ob-options">
            {[1,2,3,4,5,6].map(n=>(
              <div key={n} className={`ob-option${p.people===n?" sel":""}`} onClick={()=>setP(prev=>({...prev,people:n}))}>
                <span className="ob-option-emoji">{["🧍","👫","👨‍👩‍👦","👨‍👩‍👧‍👦","👨‍👩‍👧‍👦","🏘️"][n-1]}</span>
                <div>
                  <div className="ob-option-label">{n} {n===1?"person":"people"}</div>
                  <div className="ob-option-sub">{["Just me","Two people","Three people","Four people","Five people","Six or more"][n-1]}</div>
                </div>
                <div className="ob-check">✓</div>
              </div>
            ))}
          </div>
        )}

        {/* 5 — Budget */}
        {step===5&&(
          <>
            <div className="ob-budget-val">${p.budget}</div>
            <div className="ob-budget-sub">per week · ${(p.budget/p.people).toFixed(0)}/person for {p.people} {p.people===1?"person":"people"}</div>
            <input type="range" className="ob-slider" min={40} max={400} step={5}
              value={p.budget} onChange={e=>setP(prev=>({...prev,budget:Number(e.target.value)}))}/>
            <div className="ob-presets">
              {[[75,"Tight"],[125,"Moderate"],[175,"Comfortable"],[250,"Flexible"]].map(([v,label])=>(
                <div key={v} className={`ob-preset${p.budget===v?" sel":""}`} onClick={()=>setP(prev=>({...prev,budget:v}))}>
                  <div className="ob-preset-val">${v}</div>
                  <div className="ob-preset-label">{label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 6 — Summary */}
        {step===6&&(
          <div className="ob-summary" style={{marginTop:0}}>
            <div className="ob-summary-title">Your SmartCart setup</div>
            {[
              ["🏪","Store",   `${p.storeName} — ${p.storeAddress}`],
              ["🍽️","Meals",  mealSummary],
              ["👥","Household",`${p.people} ${p.people===1?"person":"people"}`],
              ["💰","Budget",  `$${p.budget}/week`],
              ["🌱","Diet",    p.dietary.length===0?"No restrictions":p.dietary.map(d=>DIETARY_OPTIONS.find(o=>o.id===d)?.label).filter(Boolean).join(", ")],
              ["🥢","Cuisines",p.cuisines.length===0?"Any cuisine":p.cuisines.map(c=>CUISINE_OPTIONS.find(o=>o.id===c)?.label).filter(Boolean).join(", ")],
            ].map(([icon,key,val])=>(
              <div key={key} className="ob-summary-row">
                <span className="ob-summary-icon">{icon}</span>
                <span className="ob-summary-key">{key}</span>
                <span className="ob-summary-val">{val}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{height:8}}/>
      </div>

      <div className="ob-footer">
        <button className="ob-btn" disabled={!canAdvance()} onClick={()=>{
          if(step<TOTAL_STEPS-1) setStep(s=>s+1);
          else onComplete(p);
        }}>
          {step<TOTAL_STEPS-1?"Continue →":"Let's go ✨"}
        </button>
        {step>0&&<button className="ob-back" onClick={()=>setStep(s=>s-1)}>← Back</button>}
      </div>
    </div>
  );
}

/* ═══ PROFILE SCREEN ════════════════════════════════════════════════════════════ */
function ProfileScreen({prefs,onEdit,onReset}){
  const diets=prefs.dietary.length===0?"No restrictions":prefs.dietary.map(d=>DIETARY_OPTIONS.find(o=>o.id===d)?.label).filter(Boolean).join(", ");
  const cuisines=prefs.cuisines.length===0?"Any":prefs.cuisines.map(c=>CUISINE_OPTIONS.find(o=>o.id===c)?.label).filter(Boolean).join(", ");
  const mealDetail=mt=>{
    const cfg=prefs.meals[mt];
    if(!cfg.enabled) return "Not planned";
    const s=cfg.style==="mealprep"?`Batch ×${cfg.portions} — prep ${DAYS[cfg.prepDay??0]}`:cfg.style==="quick"?"Quick meals":"Varied daily";
    return `${s} · ${cap(cfg.skill)}`;
  };
  return(
    <div className="profile-screen">
      <div className="profile-hero">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">My SmartCart</div>
        <div className="profile-sub">{prefs.storeName||"—"} · {prefs.storeAddress||""}</div>
      </div>
      <div className="prefs-section">
        <div className="prefs-section-title" style={{marginBottom:10}}>Preferences</div>
        <div className="prefs-card">
          {[
            {icon:"🏪",label:"Store & location",val:`${prefs.storeName||"—"} · ${prefs.storeAddress||""}`,step:0},
            {icon:"🌱",label:"Diet",            val:diets,                                              step:1},
            {icon:"🥢",label:"Cuisines",        val:cuisines,                                           step:2},
            {icon:"👥",label:"Household",       val:`${prefs.people} ${prefs.people===1?"person":"people"}`,step:4},
            {icon:"💰",label:"Budget",          val:`$${prefs.budget}/week`,                            step:5},
          ].map((r,i)=>(
            <div key={i} className="prefs-row" onClick={()=>onEdit(r.step)}>
              <span className="prefs-row-icon">{r.icon}</span>
              <div className="prefs-row-info">
                <div className="prefs-row-label">{r.label}</div>
                <div className="prefs-row-val">{r.val}</div>
              </div>
              <span className="prefs-row-arrow">›</span>
            </div>
          ))}
        </div>
        <div className="prefs-section-title">Meal configuration</div>
        <div className="meal-cfg-preview">
          <div className="mcp-header">Tap to edit each meal</div>
          {[{id:"breakfast",emoji:"☀️"},{id:"lunch",emoji:"🌤️"},{id:"dinner",emoji:"🌙"}].map(m=>(
            <div key={m.id} className="mcp-row" onClick={()=>onEdit(3,m.id)}>
              <span className="mcp-icon">{m.emoji}</span>
              <div className="mcp-info">
                <div className="mcp-label">{cap(m.id)}</div>
                <div className="mcp-detail">{mealDetail(m.id)}</div>
              </div>
              <span className="mcp-arrow">›</span>
            </div>
          ))}
        </div>
        <button className="reset-btn" onClick={onReset}>Reset &amp; start over</button>
      </div>
    </div>
  );
}

/* ─── Meal badge ─────────────────────────────────────────────────────────────── */
function MealBadge({meal}){
  if(meal.isPrepDay)  return <span className="meal-badge prep">🥡 Prep day ×{meal.portions}</span>;
  if(meal.isLeftover) return <span className="meal-badge leftover">♻️ {meal.portionLabel}</span>;
  if(meal.isUpcoming) return <span className="meal-badge upcoming">📅 {meal.portionLabel}</span>;
  return null;
}

/* ─── Pantry Screen ──────────────────────────────────────────────────────────── */
const PANTRY_EMOJIS = ["🫒","🧂","🍚","🥫","🍯","🧄","🌶️","🫙","🧈","🥚","🍞","🧀","🥩","🐟","🍅","🥦","🧅","🥕","🫐","🍋","🥑","🌽","🍄","🫘","🥜","🍝","🌾","🫗","🍾","🧃"];

const STATUS_FROM_PCT = pct => pct <= 10 ? "critical" : pct <= 25 ? "low" : "good";

const AMOUNT_PRESETS = ["Full / new","About 75%","About half","About 25%","Running low","Almost out"];
const PCT_FROM_PRESET = {"Full / new":100,"About 75%":75,"About half":50,"About 25%":25,"Running low":15,"Almost out":5};

function PantryScreen({pantry,setPantry}){
  const [filter,   setFilter]    = useState("all");  // all | good | low | critical
  const [editItem, setEditItem]  = useState(null);   // null | {} | {id} for add/edit sheet
  const [search,   setSearch]    = useState("");

  // Filtered + searched list
  const visible = pantry
    .filter(p => filter==="all" || p.status===filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand||"").toLowerCase().includes(search.toLowerCase()));

  const critCount  = pantry.filter(p=>p.status==="critical").length;
  const lowCount   = pantry.filter(p=>p.status==="low").length;

  const saveItem = (item) => {
    if(item.id){
      setPantry(list => list.map(p=>p.id===item.id ? item : p));
    } else {
      setPantry(list => [...list, {...item, id: Date.now()}]);
    }
    setEditItem(null);
  };

  const deleteItem = (id) => setPantry(list => list.filter(p=>p.id!==id));

  const updatePct = (id, pct) => {
    setPantry(list => list.map(p => p.id===id ? {...p, pct, status:STATUS_FROM_PCT(pct)} : p));
  };

  if(editItem !== null){
    return <PantryForm item={editItem} onSave={saveItem} onCancel={()=>setEditItem(null)}/>;
  }

  return(
    <div className="pantry-screen">
      {/* Header */}
      <div className="pantry-header-bar">
        <div>
          <div className="sec-title" style={{marginBottom:2}}>My Pantry</div>
          <div style={{fontSize:11,color:"var(--muted)"}}>
            {pantry.length} items
            {critCount>0 && <span style={{color:"var(--red)",fontWeight:700}}> · {critCount} critical</span>}
            {lowCount>0  && <span style={{color:"#D97706",fontWeight:700}}> · {lowCount} low</span>}
          </div>
        </div>
        <button className="pantry-add-btn" onClick={()=>setEditItem({})}>
          + Add item
        </button>
      </div>

      {/* Search */}
      <div style={{padding:"10px 20px 0"}}>
        <input
          className="form-input"
          style={{margin:0}}
          placeholder="Search pantry…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>

      {/* Filter pills */}
      <div className="pantry-filter-row">
        {[
          {id:"all",     label:`All (${pantry.length})`},
          {id:"good",    label:"Good"},
          {id:"low",     label:`Low (${lowCount})`},
          {id:"critical",label:`Critical (${critCount})`},
        ].map(f=>(
          <button key={f.id}
            className={`pf-btn${filter===f.id?" active":""}${f.id==="critical"&&critCount>0&&filter!=="critical"?" red":""}`}
            onClick={()=>setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Item list */}
      {visible.length===0 ? (
        <div className="pantry-empty">
          <div className="pantry-empty-emoji">{search ? "🔍" : "🫙"}</div>
          <div className="pantry-empty-title">{search ? "No matches" : "Pantry is empty"}</div>
          <div className="pantry-empty-sub">
            {search ? `Nothing found for "${search}"` : "Add items you have at home so SmartCart knows what to work with."}
          </div>
        </div>
      ) : (
        <div className="pantry-list">
          {visible.map(item=>(
            <div key={item.id} className={`pantry-item-card ${item.status}`}>
              <div className="pi-top">
                <span className="pi-emoji">{item.emoji}</span>
                <div className="pi-info">
                  <div className="pi-name">{item.name}</div>
                  {item.brand && <div className="pi-brand">{item.brand}</div>}
                  <div className="pi-amount">{item.amount}{item.unit ? ` · ${item.unit}` : ""}</div>
                </div>
                <div className="pi-actions">
                  <button className="pi-action-btn" title="Edit" onClick={()=>setEditItem(item)}>✏️</button>
                  <button className="pi-action-btn del" title="Delete" onClick={()=>deleteItem(item.id)}>🗑️</button>
                </div>
              </div>
              {/* Level bar */}
              <div className="pi-track">
                <div className={`pi-fill ${item.status}`} style={{width:`${item.pct}%`}}/>
              </div>
              {/* Status + quick-update */}
              <div className="pi-status-row">
                <span className={`pi-status ${item.status}`}>
                  {item.status==="critical"?"⚠️ Critical":item.status==="low"?"↓ Low":"✓ Good"} · {item.pct}%
                </span>
                <div className="pi-status-btns">
                  {[{pct:100,label:"Full"},{pct:50,label:"½"},{pct:15,label:"Low"},{pct:5,label:"Out"}].map(opt=>(
                    <button key={opt.pct}
                      className={`pi-pct-btn${item.pct===opt.pct?" sel":""}`}
                      onClick={()=>updatePct(item.id,opt.pct)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{height:24}}/>
    </div>
  );
}

/* ─── Pantry Add / Edit Form ─────────────────────────────────────────────────── */
function PantryForm({item, onSave, onCancel}){
  const isEdit = !!item.id;
  const [name,   setName]   = useState(item.name   || "");
  const [brand,  setBrand]  = useState(item.brand  || "");
  const [amount, setAmount] = useState(item.amount || "");
  const [unit,   setUnit]   = useState(item.unit   || "");
  const [emoji,  setEmoji]  = useState(item.emoji  || "🫙");
  const [pct,    setPct]    = useState(item.pct    ?? 100);

  const status = STATUS_FROM_PCT(pct);

  const handleSave = () => {
    if(!name.trim()) return;
    onSave({
      ...item,
      name:name.trim(),
      brand:brand.trim(),
      amount:amount.trim()||`${pct}%`,
      unit:unit.trim(),
      emoji,
      pct,
      status,
    });
  };

  return(
    <div className="pantry-screen">
      {/* Mini header */}
      <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <button onClick={onCancel} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"var(--muted)",padding:0}}>←</button>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:"var(--green)"}}>
          {isEdit ? "Edit item" : "Add pantry item"}
        </div>
      </div>
      <div className="pantry-form">
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.5}}>
          {isEdit ? "Update this pantry item." : "Add something you have at home. Brand and exact amounts are optional — your best guess works."}
        </div>

        {/* Emoji picker */}
        <label className="form-label">Icon</label>
        <div className="emoji-grid">
          {PANTRY_EMOJIS.map(e=>(
            <button key={e} className={`emoji-opt${emoji===e?" sel":""}`} onClick={()=>setEmoji(e)}>{e}</button>
          ))}
        </div>

        {/* Name */}
        <label className="form-label">Item name <span style={{color:"var(--red)"}}>*</span></label>
        <input className="form-input" placeholder="e.g. Olive Oil, Jasmine Rice, Paprika…"
          value={name} onChange={e=>setName(e.target.value)} autoFocus/>

        {/* Brand (optional) */}
        <label className="form-label">Brand <span style={{color:"var(--muted)",fontWeight:400,textTransform:"none",letterSpacing:0}}>optional</span></label>
        <input className="form-input" placeholder="e.g. McCormick, Kikkoman…"
          value={brand} onChange={e=>setBrand(e.target.value)}/>

        {/* Amount + unit side by side */}
        <label className="form-label">Amount</label>
        <div className="form-row" style={{marginBottom:10}}>
          <input className="form-input" style={{flex:2}} placeholder="e.g. 1 bottle, half full, ~2 cups…"
            value={amount} onChange={e=>setAmount(e.target.value)}/>
          <input className="form-input" style={{flex:1}} placeholder="Unit (jar, bag…)"
            value={unit} onChange={e=>setUnit(e.target.value)}/>
        </div>

        {/* Amount presets */}
        <div className="amount-presets">
          {AMOUNT_PRESETS.map(a=>(
            <button key={a} className={`amount-preset${amount===a?" sel":""}`}
              onClick={()=>{setAmount(a);setPct(PCT_FROM_PRESET[a]);}}>
              {a}
            </button>
          ))}
        </div>

        {/* Level slider */}
        <label className="form-label">Estimated level</label>
        <div className="pct-slider-wrap">
          <div className="pct-slider-val" style={{color:status==="critical"?"var(--red)":status==="low"?"#D97706":"var(--green)"}}>{pct}%</div>
          <div className="pct-slider-sub" style={{color:status==="critical"?"var(--red)":status==="low"?"#D97706":"var(--muted)"}}>
            {status==="critical"?"⚠️ Critical — add to shopping list soon":status==="low"?"↓ Running low":"✓ Good supply"}
          </div>
          {/* Visual bar preview */}
          <div style={{height:8,background:"var(--border)",borderRadius:4,overflow:"hidden",marginBottom:10}}>
            <div style={{
              height:"100%",borderRadius:4,
              width:`${pct}%`,
              background:status==="critical"?"var(--red)":status==="low"?"#F59E0B":"var(--green3)",
              transition:"width .3s,background .3s"
            }}/>
          </div>
          <input type="range" className="ob-slider" style={{margin:0}}
            min={1} max={100} step={1}
            value={pct} onChange={e=>{
              const v=Number(e.target.value);
              setPct(v);
              // Auto-fill amount label if not manually typed
              if(!amount || AMOUNT_PRESETS.includes(amount)){
                const preset=v>=90?"Full / new":v>=65?"About 75%":v>=40?"About half":v>=20?"About 25%":v>=12?"Running low":"Almost out";
                setAmount(preset);
              }
            }}/>
        </div>

        <button className="form-save-btn" disabled={!name.trim()} onClick={handleSave}>
          {isEdit ? "Save changes" : "Add to pantry"}
        </button>
        <button className="form-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ═══ MAIN APP ══════════════════════════════════════════════════════════════════ */
export default function SmartCart(){
  const [prefs,setPrefs]=useState(()=>{
    try{const s=window.localStorage?.getItem?.("sc_prefs");return s?JSON.parse(s):DEFAULT_PREFS;}catch{return DEFAULT_PREFS;}
  });
  const [editStep,setEditStep]=useState(null);
  const [editMealTab,setEditMealTab]=useState("breakfast");

  // Pantry — persisted to localStorage separately
  const [pantry,setPantry]=useState(()=>{
    try{const s=window.localStorage?.getItem?.("sc_pantry");return s?JSON.parse(s):DEFAULT_PANTRY;}catch{return DEFAULT_PANTRY;}
  });

  useEffect(()=>{
    try{window.localStorage?.setItem?.("sc_prefs",JSON.stringify(prefs));}catch{}
  },[prefs]);

  useEffect(()=>{
    try{window.localStorage?.setItem?.("sc_pantry",JSON.stringify(pantry));}catch{}
  },[pantry]);

  const [tab,      setTab]      =useState("home");
  const [day,      setDay]      =useState(0);
  const [recipe,   setRecipe]   =useState(null);
  const [checked,  setChecked]  =useState({});
  const [aiLoading,setAiLoading]=useState(false);

  // End-of-week planning
  const [eowOpen,    setEowOpen]    =useState(false);
  const [eowGrocDay, setEowGrocDay] =useState(0);           // day index 0-6 for next grocery run
  const [eowNotifOn, setEowNotifOn] =useState(true);        // notify before grocery day
  const [eowNotifDay,setEowNotifDay]=useState(1);           // days before grocery day to notify
  const [eowScheduled,setEowScheduled]=useState(false);     // confirmed schedule this week
  const [eowConfirmed,setEowConfirmed]=useState(false);     // show confirmation screen
  const [chatHistory,setChatHistory]=useState([
    {role:"ai",text:"Hey! I'm your SmartCart AI chef. Ask me anything about this week's deals, meals, or substitutions."}
  ]);
  const [chatInput,setChatInput]=useState("");
  const chatEndRef=useRef(null);

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[chatHistory]);
  const toggleCheck=useCallback(id=>setChecked(c=>({...c,[id]:!c[id]})),[]);

  const weekPlan    =buildWeekPlan(prefs);
  const checkedCount=Object.values(checked).filter(Boolean).length;
  const total       =GROCERY_ITEMS.reduce((a,i)=>a+i.price,0);
  const dayData     =weekPlan[day];
  const daySaved    =sumBy(Object.values(dayData).filter(Boolean),m=>m.saved||0);
  const cats        =[...new Set(GROCERY_ITEMS.map(i=>i.cat))];

  const prepDays=new Set(
    Object.values(prefs.meals)
      .filter(m=>m.enabled&&m.style==="mealprep"&&m.prepDay!==null)
      .map(m=>m.prepDay)
  );

  /* AI */
  const sendToAI=useCallback(async userText=>{
    if(!userText.trim()||aiLoading) return;
    const msg=userText.trim();
    setChatHistory(h=>[...h,{role:"user",text:msg}]);
    setChatInput("");setAiLoading(true);
    const dealCtx=DEALS.map(d=>`${d.name} (${d.pct}% off, $${d.price}/${d.unit})`).join(", ");
    const mealCtx=Object.entries(prefs.meals).map(([mt,cfg])=>{
      if(!cfg.enabled) return`${mt}: not planned`;
      return`${mt}: ${cfg.style} style, ${cfg.skill}${cfg.style==="mealprep"?`, batch ×${cfg.portions} on ${DAYS[cfg.prepDay??0]}`:""}`;
    }).join("; ");
    try{
      const res=await fetch("/.netlify/functions/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",max_tokens:1000,
          system:`You are SmartCart AI. User: ${prefs.people} people, $${prefs.budget}/week, store: ${prefs.storeName||"Publix"}. Meal plan: ${mealCtx}. Deals: ${dealCtx}. Be specific, practical, concise — under 150 words. No markdown headers.`,
          messages:[
            ...chatHistory.filter((_,i)=>i>0).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text})),
            {role:"user",content:msg}
          ]
        })
      });
      const data=await res.json();
      setChatHistory(h=>[...h,{role:"ai",text:data.content?.map(c=>c.text||"").join("")||"No response."}]);
    }catch{setChatHistory(h=>[...h,{role:"ai",text:"Connection issue — try again."}]);}
    setAiLoading(false);
  },[aiLoading,chatHistory,prefs]);

  const sendQuickPill=t=>{setChatInput(t);setTimeout(()=>sendToAI(t),50);};

  const [recipeAI,    setRecipeAI]    =useState(null);
  const [recipeAILoad,setRecipeAILoad]=useState(false);
  const generateRecipe=async name=>{
    if(recipeAILoad) return;
    setRecipeAILoad(true);setRecipeAI(null);
    const dealCtx=DEALS.map(d=>`${d.name} $${d.price}/${d.unit}`).join(", ");
    try{
      const res=await fetch("/.netlify/functions/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",max_tokens:1000,
          messages:[{role:"user",content:`Recipe for "${name}" for ${prefs.people} people. Deals: ${dealCtx}. Diet: ${prefs.dietary.join(",")||"none"}. Under 200 words. Ingredients (one per line with amounts), then numbered steps. No markdown.`}]
        })
      });
      const data=await res.json();
      setRecipeAI(data.content?.map(c=>c.text||"").join("")||"");
    }catch{setRecipeAI("Couldn't generate — try again.");}
    setRecipeAILoad(false);
  };

  /* Show onboarding */
  if(!prefs.onboarded||editStep!==null){
    return(
      <><style>{CSS}</style>
        <OnboardingWizard
          initialStep={editStep??0}
          initialPrefs={editStep!==null?{...prefs}:null}
          onComplete={newPrefs=>{setPrefs({...newPrefs,onboarded:true});setEditStep(null);}}
        />
      </>
    );
  }

  const headerMeta=`${prefs.storeName||"Publix"} · Week of Jun 23`;

  return(
    <><style>{CSS}</style>
    <div className="shell">

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...DEALS,...DEALS].map((d,i)=>(
            <span key={i} className="ticker-item">{d.emoji} {d.name} — {d.pct}% off <span className="ticker-sep">&nbsp;·&nbsp;</span></span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-row">
          <div>
            <div className="logo">Smart<em>Cart</em></div>
            <div className="header-meta">{headerMeta}</div>
          </div>
          <button className="avatar-btn" onClick={()=>setTab(tab==="profile"?"home":"profile")}>👤</button>
        </div>
        <div className="hero-card">
          <div className="hero-stat">
            <div className="hero-label">Saved this week</div>
            <div className="hero-value yellow">${TOTAL_SAVED.toFixed(2)}</div>
          </div>
          <div className="hero-divider"/>
          <div className="hero-stat">
            <div className="hero-label">Grocery total</div>
            <div className="hero-value">${TOTAL_SPEND.toFixed(2)}</div>
          </div>
          <div className="hero-divider"/>
          <div className="score-ring">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="4.5"/>
              <circle cx="26" cy="26" r="21" fill="none" stroke="#F5C842" strokeWidth="4.5"
                strokeDasharray={`${2*Math.PI*21*.94} ${2*Math.PI*21}`} strokeLinecap="round"/>
            </svg>
            <div className="score-ring-label">94<span>score</span></div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="nav-tabs">
        {[
          {id:"home",    icon:"🏠",label:"Home"},
          {id:"plan",    icon:"📅",label:"Meals"},
          {id:"grocery", icon:"🛒",label:"Shop"},
          {id:"pantry",  icon:"🫙",label:"Pantry"},
          {id:"ai",      icon:"✨",label:"AI Chef"},
        ].map(t=>(
          <button key={t.id} className={`nav-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
            <span className="nav-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {tab==="profile"&&(
        <ProfileScreen
          prefs={prefs}
          onEdit={(step,mealTab)=>{if(mealTab)setEditMealTab(mealTab);setEditStep(step);}}
          onReset={()=>{setPrefs(DEFAULT_PREFS);setEditStep(null);}}
        />
      )}

      {/* HOME */}
      {tab==="home"&&(
        <div className="scroll-area">
          <div className="sec">
            <div className="sec-hd">
              <div className="sec-title">This week's deals</div>
              <button className="sec-link" onClick={()=>setTab("grocery")}>see all →</button>
            </div>
          </div>
          <div className="deal-strip" style={{paddingLeft:20,paddingRight:20}}>
            {DEALS.map(d=>(
              <div key={d.id} className="deal-card" onClick={()=>setTab("grocery")}>
                <div className="save-tag">−{d.pct}%</div>
                <span className="deal-emoji">{d.emoji}</span>
                <div className="deal-name">{d.name}</div>
                <div className="deal-unit">per {d.unit}</div>
                <div className="deal-prices">
                  <span className="deal-now">${d.price.toFixed(2)}</span>
                  <span className="deal-was">${d.was.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="sec" style={{marginTop:18}}>
            <div className="sec-hd">
              <div className="sec-title">Today's meals</div>
              <button className="sec-link" onClick={()=>setTab("plan")}>full week →</button>
            </div>
            <div className="today-card">
              {["breakfast","lunch","dinner"].map(mt=>{
                const meal=weekPlan[0][mt];if(!meal) return null;
                return(
                  <div key={mt} className="today-meal-row" onClick={()=>{setRecipe({...meal,type:mt});setRecipeAI(null);}}>
                    <div className="tm-type">{mt}</div>
                    <div className="tm-emoji">{meal.emoji}</div>
                    <div className="tm-info">
                      <div className="tm-name">{meal.name}</div>
                      <div className="tm-meta">⏱ {meal.time} min · {meal.cal*prefs.people} cal</div>
                      <MealBadge meal={meal}/>
                    </div>
                    <div className="tm-save">+{fmt(meal.saved)}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Dynamic pantry alerts from live pantry state */}
          {(pantry.filter(p=>p.status==="critical"||p.status==="low").length>0)&&(
            <div className="sec" style={{marginTop:4,paddingBottom:8}}>
              <div className="sec-hd">
                <div className="sec-title">Pantry alerts</div>
                <button className="sec-link" onClick={()=>setTab("pantry")}>manage →</button>
              </div>
              {pantry.filter(p=>p.status==="critical").map(p=>(
                <div key={p.id} className="alert-strip red">
                  <div className="alert-icon">{p.emoji}</div>
                  <div><strong>{p.name} almost out</strong> — {p.amount}{p.brand?` (${p.brand})`:""}</div>
                </div>
              ))}
              {pantry.filter(p=>p.status==="low").slice(0,2).map(p=>(
                <div key={p.id} className="alert-strip">
                  <div className="alert-icon">{p.emoji}</div>
                  <div><strong>{p.name} running low</strong> — {p.amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PLAN */}
      {tab==="plan"&&(
        <div className="scroll-area">
          <div className="day-row">
            {DAYS.map((d,i)=>(
              <button key={i} className={`day-btn${day===i?" active":""}`} onClick={()=>setDay(i)}>
                <div className="day-btn-d">{d}</div>
                <div className="day-btn-n">{DATES[i].split(" ")[1]}</div>
                {prepDays.has(i)&&<div className="prep-dot"/>}
              </button>
            ))}
          </div>
          <div className="day-savings-row">
            <div className="dsr-label">{DAYS[day]}, {DATES[day]}{prepDays.has(day)?" · 🥡 Prep day":""}</div>
            <div className="dsr-val">Saves {fmt(daySaved)}</div>
          </div>
          {["breakfast","lunch","dinner"].map(mt=>{
            const meal=dayData[mt];if(!meal) return null;
            const cls=`plan-meal-card${meal.isPrepDay?" is-prep":meal.isLeftover?" is-leftover":meal.isUpcoming?" is-upcoming":""}`;
            return(
              <div key={mt} className={cls} onClick={()=>{setRecipe({...meal,type:mt});setRecipeAI(null);}}>
                <div className="pmc-header">
                  <div>
                    <div className="pmc-type-badge">{mt}</div>
                    <div style={{height:6}}/>
                    <div className="pmc-emoji">{meal.emoji}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div className="pmc-name">{meal.name}</div>
                    {meal.portionLabel&&<div style={{marginTop:4}}><MealBadge meal={meal}/></div>}
                  </div>
                </div>
                <div className="pmc-footer">
                  <span className="chip">⏱ {meal.time} min</span>
                  <span className="chip">{meal.cal*prefs.people} cal</span>
                  <span className="chip">{meal.skill}</span>
                  <span className="chip yellow">Saves {fmt(meal.saved)}</span>
                  {meal.isPrepDay&&<span className="chip yellow">×{meal.portions} portions</span>}
                  {meal.isLeftover&&<span className="chip purple">Leftover</span>}
                </div>
              </div>
            );
          })}
          <div style={{height:16}}/>
        </div>
      )}

      {/* GROCERY */}
      {tab==="grocery"&&(
        <div className="scroll-area">
          <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:"var(--slate)"}}>{checkedCount} of {GROCERY_ITEMS.length} items</span>
            {checkedCount===GROCERY_ITEMS.length&&<span style={{fontSize:12,fontWeight:700,color:"var(--green3)"}}>✓ All done!</span>}
          </div>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${(checkedCount/GROCERY_ITEMS.length)*100}%`}}/></div>
          <div className="progress-label">{Math.round((checkedCount/GROCERY_ITEMS.length)*100)}% complete</div>
          <div style={{marginTop:12}}>
            {cats.map(cat=>(
              <div key={cat}>
                <div className="cat-label">{cat}</div>
                {GROCERY_ITEMS.filter(i=>i.cat===cat).map(item=>(
                  <div key={item.id} className={`groc-item${checked[item.id]?" checked":""}`} onClick={()=>toggleCheck(item.id)}>
                    <div className={`groc-check${checked[item.id]?" done":""}`}>{checked[item.id]?"✓":""}</div>
                    <span className="groc-emoji">{item.emoji}</span>
                    <div className="groc-info">
                      <div className="groc-name" style={{textDecoration:checked[item.id]?"line-through":"none"}}>{item.name}</div>
                      <div className="groc-qty">{item.qty} · {item.note}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                      <div className="groc-price">{fmt(item.price)}</div>
                      {item.deal&&<div className="deal-flag">DEAL</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{padding:"14px 0 4px"}}>
            <div className="total-footer">
              <div><div className="tf-label">Estimated total</div><div className="tf-amount">{fmt(total)}</div></div>
              <div><div className="tf-saved-label">You save</div><div className="tf-saved-val">${TOTAL_SAVED.toFixed(2)}</div></div>
            </div>
          </div>
          <div className="efficiency-row">
            <span className="eff-label">Basket Efficiency</span>
            <div className="eff-track"><div className="eff-fill" style={{width:"94%"}}/></div>
            <span className="eff-score">94/100</span>
          </div>
          <div style={{height:16}}/>
        </div>
      )}

      {/* PANTRY */}
      {tab==="pantry"&&(
        <PantryScreen pantry={pantry} setPantry={setPantry}/>
      )}

      {/* INSIGHTS */}
      {tab==="insights"&&(
        <div className="scroll-area">
          <div className="stat-grid">
            {[
              {icon:"💰",val:fmt(TOTAL_SAVED),label:"Saved this week",  trend:"↑ $6.20 vs last week"},
              {icon:"🧺",val:"94",            label:"Basket efficiency", trend:"↑ 12 pts vs avg"},
              {icon:"♻️",val:"97%",           label:"Ingredients used",  trend:"↑ 11% vs last week"},
              {icon:"🗑️",val:"0.2 lb",        label:"Food wasted",       trend:"↓ 78% vs avg"},
              {icon:"🍽️",val:"21",            label:"Meals planned",     trend:"Full week covered"},
              {icon:"🏷️",val:"10",            label:"Deals used",        trend:"Avg 41% off"},
            ].map((s,i)=>(
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-trend">{s.trend}</div>
              </div>
            ))}
          </div>
          <div className="bc-wrap">
            <div className="bc-title">Daily savings</div>
            {WEEKLY_SAVINGS.map((s,i)=>(
              <div key={i} className="bc-row">
                <div className="bc-day">{DAYS[i]}</div>
                <div className="bc-track"><div className="bc-fill" style={{width:`${(s/10)*100}%`}}/></div>
                <div className="bc-val">{fmt(s)}</div>
              </div>
            ))}
          </div>
          <div className="bc-wrap" style={{marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <div className="bc-title">Pantry status</div>
              <button className="sec-link" onClick={()=>setTab("pantry")}>manage →</button>
            </div>
          </div>
          <div className="pantry-grid">
            {[...pantry].sort((a,b)=>a.pct-b.pct).slice(0,8).map(p=>(
              <div key={p.id} className={`pantry-card ${p.status}`}>
                <div className="pantry-emoji">{p.emoji}</div>
                <div className="pantry-name">{p.name}</div>
                <div className="pantry-track"><div className={`pantry-fill ${p.status}`} style={{width:`${p.pct}%`}}/></div>
                <div className={`pantry-status ${p.status}`}>{p.status.toUpperCase()} · {p.pct}%</div>
              </div>
            ))}
          </div>
          {/* End-of-week planning banner */}
          <div className="eow-banner" onClick={()=>{setEowOpen(true);setEowConfirmed(false);}}>
            <div className="eow-banner-top">
              <span className="eow-banner-emoji">📅</span>
              <div>
                <div className="eow-banner-title">Plan next week</div>
                <div className="eow-banner-sub">
                  {eowScheduled
                    ? `Grocery day set · SmartCart will auto-generate your next plan`
                    : "Set your grocery day and auto-generate next week's plan"}
                </div>
              </div>
            </div>
            <div className="eow-banner-btn">
              {eowScheduled ? "✓ Scheduled — tap to update" : "Schedule next week →"}
            </div>
          </div>

          <div style={{height:20}}/>
        </div>
      )}

      {/* AI CHEF */}
      {tab==="ai"&&(
        <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
          <div className="scroll-area" style={{flex:1}}>
            <div className="ai-screen">
              <div className="sec-hd" style={{marginBottom:10}}><div className="sec-title">AI Chef</div></div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>Ask about substitutions, nutrition, leftovers, or anything about your meals.</div>
              <div className="quick-pills">
                {["Leftover salmon ideas?","Swap chicken for tofu?","Low-carb this week?","Stretch my budget?","Meal prep tips?"].map(q=>(
                  <button key={q} className="quick-pill" onClick={()=>sendQuickPill(q)}>{q}</button>
                ))}
              </div>
              <div className="chat-area">
                {chatHistory.map((m,i)=>(
                  <div key={i} className={`chat-bubble ${m.role}`}>
                    {m.role==="ai"&&<div className="ai-label">SmartCart AI</div>}
                    {m.text}
                  </div>
                ))}
                {aiLoading&&(
                  <div className="chat-bubble ai">
                    <div className="ai-label">SmartCart AI</div>
                    <span className="spin">⟳</span> Thinking...
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
            </div>
          </div>
          <div className="chat-input-row">
            <textarea className="chat-input" rows={1} placeholder="Ask anything about your meals..."
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendToAI(chatInput);}}}/>
            <button className="chat-send" disabled={aiLoading||!chatInput.trim()} onClick={()=>sendToAI(chatInput)}>
              {aiLoading?<span className="spin">⟳</span>:"↑"}
            </button>
          </div>
        </div>
      )}

      {/* RECIPE SHEET */}
      {recipe&&(
        <div className="sheet-overlay" onClick={()=>setRecipe(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{position:"relative",flexShrink:0,padding:"0 20px"}}>
              <button className="sheet-close" onClick={()=>setRecipe(null)}>✕</button>
            </div>
            <div className="sheet-scroll">
              <div className="sheet-hero-emoji">{recipe.emoji}</div>
              <div className="sheet-title">{recipe.name}</div>
              <div className="sheet-chips">
                <span className="chip">⏱ {recipe.time} min</span>
                <span className="chip">{recipe.cal*prefs.people} cal</span>
                <span className="chip">{recipe.skill}</span>
                <span className="chip green">{recipe.type}</span>
                <span className="chip">👥 {prefs.people}</span>
                {recipe.isPrepDay&&<span className="chip yellow">🥡 ×{recipe.portions}</span>}
                {recipe.isLeftover&&<span className="chip purple">♻️ leftover</span>}
              </div>
              <div className="savings-banner">
                <div><div className="sb-label">You save on this meal</div><div className="sb-val">{fmt(recipe.saved)}</div></div>
                <div style={{fontSize:32}}>🏷️</div>
              </div>
              {RECIPE_DB[recipe.name]?(
                <>
                  <div className="recipe-section">Ingredients</div>
                  {RECIPE_DB[recipe.name].ingredients.map((ing,i)=>(
                    <div key={i} className="ing-item">
                      <div className="ing-dot"/><span>{ing.text}</span>
                      {ing.deal&&<span className="ing-deal">DEAL</span>}
                    </div>
                  ))}
                  <div className="recipe-section">Steps</div>
                  {RECIPE_DB[recipe.name].steps.map((s,i)=>(
                    <div key={i} className="step-item">
                      <div className="step-num">{i+1}</div>
                      <div className="step-text">{s}</div>
                    </div>
                  ))}
                  <div className="elevate-box">
                    <div className="elevate-label">✦ Elevate this dish</div>
                    {RECIPE_DB[recipe.name].elevate.map((tip,i)=>(
                      <div key={i} className="elevate-tip"><span className="elevate-star">✦</span>{tip}</div>
                    ))}
                  </div>
                </>
              ):(
                <>
                  <div className="recipe-section">
                    {recipe.isPrepDay?`Batch recipe — ${recipe.portions} portions`:recipe.isLeftover?"Reheat & serve":"AI Recipe"}
                  </div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:10,lineHeight:1.6}}>
                    {recipe.isPrepDay
                      ?`Batch recipe for ${recipe.portions} portions of "${recipe.name}" from ${prefs.storeName||"your store"}'s deals.`
                      :recipe.isLeftover
                      ?`"${recipe.name}" is a leftover. Generate quick reheat tips to keep it tasting fresh.`
                      :`Full recipe for "${recipe.name}" scaled for ${prefs.people} ${prefs.people===1?"person":"people"}.`}
                  </div>
                  {recipeAI
                    ?<div className="ai-result">{recipeAI}</div>
                    :<button className="ai-gen-btn" onClick={()=>generateRecipe(recipe.name)} disabled={recipeAILoad}>
                      {recipeAILoad?<><span className="spin">⟳</span> Generating...</>:<>✨ Generate recipe with AI</>}
                    </button>
                  }
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* END-OF-WEEK MODAL */}
      {eowOpen&&(
        <div className="eow-overlay" onClick={()=>setEowOpen(false)}>
          <div className="eow-sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{position:"relative",flexShrink:0,padding:"0 20px"}}>
              <button className="sheet-close" onClick={()=>setEowOpen(false)}>✕</button>
            </div>
            <div className="eow-scroll">
              {!eowConfirmed ? (
                <>
                  <div className="eow-hero">
                    <div className="eow-hero-emoji">🎉</div>
                    <div className="eow-hero-title">Great week, {prefs.storeName||"shopper"}!</div>
                    <div className="eow-hero-sub">You saved {fmt(TOTAL_SAVED)} this week. Set up next week and SmartCart handles the rest.</div>
                  </div>

                  {/* Week summary stats */}
                  <div className="eow-stats-row">
                    {[
                      {val:fmt(TOTAL_SAVED), label:"Saved"},
                      {val:"21",             label:"Meals"},
                      {val:"94/100",         label:"Efficiency"},
                      {val:"0.2 lb",         label:"Wasted"},
                    ].map((s,i)=>(
                      <div key={i} className="eow-stat">
                        <div className="eow-stat-val">{s.val}</div>
                        <div className="eow-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Auto-regen explainer */}
                  <div className="eow-regen-card">
                    <span className="eow-regen-emoji">✨</span>
                    <div>
                      <div className="eow-regen-label">SmartCart auto-generates next week</div>
                      <div className="eow-regen-sub">
                        Using the same preferences — store, meal styles, portions, dietary needs, and budget — SmartCart will pull fresh {prefs.storeName||"store"} deals and build a completely new plan. Nothing to do.
                      </div>
                    </div>
                  </div>

                  {/* Grocery day picker */}
                  <div className="eow-section">Next grocery run</div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>
                    Which day will you shop next week? SmartCart times your plan around this.
                  </div>
                  <div className="eow-day-grid">
                    {DAYS.map((d,i)=>(
                      <button key={i} className={`eow-day-btn${eowGrocDay===i?" sel":""}`} onClick={()=>setEowGrocDay(i)}>
                        <span className="eow-day-d">{d}</span>
                        <span className="eow-day-n">{DATES[i].split(" ")[1]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Notification preference */}
                  <div className="eow-section">Reminder</div>
                  <div className="eow-notif-card">
                    <div className="eow-notif-row">
                      <div className="eow-notif-label">Remind me before grocery day</div>
                      <button className={`toggle-switch${eowNotifOn?" on":""}`} onClick={()=>setEowNotifOn(n=>!n)}/>
                    </div>
                    {eowNotifOn&&(
                      <div className="eow-notif-sub">
                        You'll get a notification to review your preferences and upcoming plan.
                        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                          {[
                            {v:1,label:"1 day before"},
                            {v:2,label:"2 days before"},
                            {v:3,label:"3 days before"},
                          ].map(o=>(
                            <button key={o.v} onClick={()=>setEowNotifDay(o.v)}
                              style={{
                                padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,
                                border:`1.5px solid ${eowNotifDay===o.v?"var(--green)":"var(--border)"}`,
                                background:eowNotifDay===o.v?"var(--foam)":"var(--white)",
                                color:eowNotifDay===o.v?"var(--green)":"var(--muted)",
                                cursor:"pointer",fontFamily:"'Inter',sans-serif"
                              }}>
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preference change option */}
                  <div className="eow-section">Preferences</div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>
                    Want to change anything before next week generates? You can update your store, meal styles, dietary needs, or budget now — or wait for your reminder.
                  </div>

                  <div className="eow-actions">
                    <button className="eow-primary-btn" onClick={()=>{
                      setEowScheduled(true);
                      setEowConfirmed(true);
                    }}>
                      ✨ Schedule &amp; auto-generate next week
                    </button>
                    <button className="eow-secondary-btn" onClick={()=>{
                      setEowOpen(false);
                      setEditStep(0);
                    }}>
                      Update my preferences first
                    </button>
                    <button className="eow-dismiss-btn" onClick={()=>setEowOpen(false)}>
                      Remind me later
                    </button>
                  </div>
                </>
              ) : (
                /* Confirmation screen */
                <div style={{textAlign:"center",padding:"20px 0 8px"}}>
                  <div style={{fontSize:56,marginBottom:14}}>✅</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--green)",marginBottom:8,letterSpacing:"-.3px"}}>
                    You're all set!
                  </div>
                  <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:24,maxWidth:280,margin:"0 auto 24px"}}>
                    Your next grocery run is scheduled for <strong>{DAYS[eowGrocDay]}, {DATES[eowGrocDay]}</strong>.
                    {eowNotifOn&&` We'll remind you ${eowNotifDay} day${eowNotifDay>1?"s":""} before.`}
                    {" "}SmartCart will auto-generate a fresh plan using this week's {prefs.storeName||"store"} deals.
                  </div>
                  <div style={{background:"var(--foam)",borderRadius:14,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"var(--muted)",marginBottom:10}}>What happens next</div>
                    {[
                      ["📅", `Grocery day: ${DAYS[eowGrocDay]}, ${DATES[eowGrocDay]}`],
                      ["🔔", eowNotifOn?`Reminder: ${eowNotifDay} day${eowNotifDay>1?"s":""} before`:"Reminders off"],
                      ["✨", "New meal plan auto-generated from fresh deals"],
                      ["⚙️", "Same preferences unless you change them"],
                    ].map(([icon,text],i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"center",fontSize:13,color:"var(--slate)"}}>
                        <span style={{fontSize:16,flex:"0 0 20px"}}>{icon}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <button className="eow-primary-btn" onClick={()=>setEowOpen(false)}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
