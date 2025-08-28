import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Items must be an array" });
  }

  try {
    // Load dummy shop data
    const filePath = path.join(process.cwd(), "data", "shops.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const shops = JSON.parse(raw);

    let plan = [];
    let grouped = {};

    items.forEach((item) => {
      let cheapest = null;
      let cheapestShop = null;

      shops.forEach((shop) => {
        if (shop.prices[item]) {
          const price = shop.prices[item];
          if (cheapest === null || price < cheapest) {
            cheapest = price;
            cheapestShop = shop.name;
          }
        }
      });

      if (cheapestShop) {
        plan.push({ item, shop: cheapestShop, price: cheapest });

        if (!grouped[cheapestShop]) {
          grouped[cheapestShop] = { items: [], total: 0 };
        }
        grouped[cheapestShop].items.push({ item, price: cheapest });
        grouped[cheapestShop].total += cheapest;
      } else {
        plan.push({ item, note: "Not available in any shop" });
      }
    });

    res.status(200).json({ plan, grouped });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
}
