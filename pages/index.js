import { useState } from "react";
const [itemsText, setItemsText] = useState("tomato, apple, bread, milk, cheese");
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState("");


const handleSubmit = async (e) => {
e.preventDefault();
setError("");
setLoading(true);
setResult(null);
try {
const items = itemsText
.split(",")
.map((s) => s.trim())
.filter(Boolean);


const res = await fetch("/api/plan", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ items }),
});


const data = await res.json();
if (!res.ok) throw new Error(data.error || "Failed");
setResult(data);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
};


return (
<div style={{ maxWidth: 780, margin: "40px auto", padding: 16, fontFamily: "system-ui, Arial" }}>
<h1>Grocery Price Planner (MVP)</h1>
<p>Enter items (comma-separated). The API picks the cheapest shop for each item.</p>


<form onSubmit={handleSubmit} style={{ marginTop: 16, marginBottom: 24 }}>
<label style={{ display: "block", marginBottom: 8 }}>Items</label>
<input
value={itemsText}
onChange={(e) => setItemsText(e.target.value)}
placeholder="tomato, apple, bread"
style={{ width: "100%", padding: 10, fontSize: 16 }}
/>
<button disabled={loading} style={{ marginTop: 12, padding: "10px 16px", fontSize: 16 }}>
{loading ? "Calculating…" : "Find Cheapest"}
</button>
</form>


{error && <div style={{ color: "crimson", marginBottom: 12 }}>Error: {error}</div>}


{result && (
<div>
<h2>Result by Item</h2>
<ul>
{result.plan.map((row, idx) => (
<li key={idx}>
<strong>{row.item}</strong>: {row.shop ? `${row.shop} — ${row.price.toFixed(2)}` : row.note}
</li>
))}
</ul>


<h2>Grouped by Shop</h2>
<ul>
{Object.entries(result.grouped).map(([shop, info]) => (
<li key={shop} style={{ marginBottom: 8 }}>
<strong>{shop}</strong>
<ul>
{info.items.map((it, i) => (
<li key={i}>{it.item}{typeof it.price === "number" ? ` — ${it.price.toFixed(2)}` : ""}</li>
))}
</ul>
{info.total > 0 && <div>Total at {shop}: {info.total.toFixed(2)}</div>}
</li>
))}
</ul>
</div>
)}


<hr style={{ margin: "24px 0" }} />
<p style={{ color: "#555" }}>
MVP notes: data comes from <code>shops.json</code>. No database yet. Add more shops/items by editing that file.
</p>
</div>
);
}
