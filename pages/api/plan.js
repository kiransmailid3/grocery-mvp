
import shops from "../../shops.json";


export default function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Only POST allowed" });
}


const { items } = req.body; // e.g. ["tomato","bread","milk"]


if (!items || !Array.isArray(items) || items.length === 0) {
return res.status(400).json({ error: "Please send items as a non-empty array" });
}


// Find cheapest shop per item
const plan = items.map((raw) => {
const item = String(raw).trim().toLowerCase();
let cheapestShop = null;
let cheapestPrice = Infinity;


shops.forEach((shop) => {
const price = shop.prices[item];
if (typeof price === "number" && price < cheapestPrice) {
cheapestPrice = price;
cheapestShop = shop.name;
}
});


return cheapestShop
? { item, shop: cheapestShop, price: cheapestPrice }
: { item, shop: null, price: null, note: "Not available" };
});


// Group by shop for convenience
const grouped = plan.reduce((acc, row) => {
const key = row.shop || "Unavailable";
acc[key] = acc[key] || { items: [], total: 0 };
acc[key].items.push({ item: row.item, price: row.price });
if (row.price) acc[key].total += row.price;
return acc;
}, {});


return res.status(200).json({ plan, grouped });
}
