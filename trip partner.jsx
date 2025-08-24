import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Trip Partner Matcher — with multiple feature buttons
 * - Match Finder (main matching algorithm)
 * - Saved Trips view
 * - Following view
 * - Predictive Suggestions view
 */

// -------------------- Mock Data --------------------
const travelers = [
  { id: 1, name: "Aarav Mehta", avatar: "https://i.pravatar.cc/150?img=1", home: "Mumbai, IN", style: "Backpacker", interests: ["food", "history", "street-art", "hostels", "trains"], budgetPerDay: 45, dates: { from: "2025-11-10", to: "2025-11-24" }, destinations: ["Jaipur", "Agra", "Varanasi", "Delhi"], bio: "Slow travel + chai stops. Will shoot photos, share reels." },
  { id: 2, name: "Sara Khan", avatar: "https://i.pravatar.cc/150?img=5", home: "Delhi, IN", style: "Comfort", interests: ["museums", "cafes", "markets", "architecture", "yoga"], budgetPerDay: 80, dates: { from: "2025-11-18", to: "2025-11-30" }, destinations: ["Jaipur", "Udaipur", "Jodhpur"], bio: "Tea > coffee. Loves blue cities and sunset points." },
];

const currentUser = {
  id: 999,
  name: "You",
  home: "Bengaluru, IN",
  style: "Backpacker",
  interests: ["food", "photography", "markets", "hostels", "trains"],
  budgetPerDay: 50,
  dates: { from: "2025-11-15", to: "2025-11-25" },
  destinations: ["Jaipur", "Agra", "Udaipur"],
};

// -------------------- Helpers --------------------
function parse(d) { return new Date(d + "T00:00:00"); }
function dateOverlapRatio(a, b) {
  const start = Math.max(parse(a.from).getTime(), parse(b.from).getTime());
  const end = Math.min(parse(a.to).getTime(), parse(b.to).getTime());
  const overlap = Math.max(0, end - start);
  const len = Math.max(1, Math.min(parse(a.to) - parse(a.from), parse(b.to) - parse(b.from)));
  return overlap / len;
}
function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...a, ...b]).size || 1;
  return inter / union;
}
function budgetScore(a, b) { return Math.max(0, 1 - Math.abs(a - b) / 60); }
function destinationOverlap(a, b) {
  const inter = a.filter((d) => b.includes(d));
  return { count: inter.length, ratio: inter.length / new Set([...a, ...b]).size, common: inter };
}
function styleScore(a, b) { return a === b ? 1 : 0; }
function computeCompatibility(me, other) {
  const dateR = dateOverlapRatio(me.dates, other.dates);
  const dest = destinationOverlap(me.destinations, other.destinations);
  const interest = jaccard(me.interests, other.interests);
  const budget = budgetScore(me.budgetPerDay, other.budgetPerDay);
  const style = styleScore(me.style, other.style);
  const score = 0.3 * (dest.ratio > 0 ? 1 : 0) + 0.2 * dest.ratio + 0.2 * dateR + 0.15 * interest + 0.1 * budget + 0.05 * style;
  return { score: Math.round(score * 100), commonDestinations: dest.common };
}

// -------------------- UI --------------------
function Card({ person, comp }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="flex items-center gap-3">
        <img src={person.avatar} className="size-12 rounded-full" />
        <div>
          <h3 className="font-semibold">{person.name}</h3>
          <p className="text-xs text-gray-500">{person.home}</p>
        </div>
      </div>
      <div className="mt-2 text-sm">{person.bio}</div>
      <div className="mt-2 text-xs">Destinations: {person.destinations.join(", ")}</div>
      <div className="mt-2 text-xs">Compatibility: {comp.score}%</div>
    </div>
  );
}

export default function TripPartnerApp() {
  const [view, setView] = useState("match");
  const [savedIds, setSavedIds] = useState(new Set());
  const [followedIds, setFollowedIds] = useState(new Set());

  const enriched = useMemo(() => travelers.map((t) => ({ person: t, comp: computeCompatibility(currentUser, t) })), []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Trip Partner Finder</h1>

      {/* Navigation Buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView("match")} className={`px-3 py-2 rounded-xl border ${view==="match"?"bg-white shadow":""}`}>Match Finder</button>
        <button onClick={() => setView("saved")} className={`px-3 py-2 rounded-xl border ${view==="saved"?"bg-white shadow":""}`}>Saved Trips</button>
        <button onClick={() => setView("following")} className={`px-3 py-2 rounded-xl border ${view==="following"?"bg-white shadow":""}`}>Following</button>
        <button onClick={() => setView("suggestions")} className={`px-3 py-2 rounded-xl border ${view==="suggestions"?"bg-white shadow":""}`}>Predictive Suggestions</button>
      </div>

      {/* Views */}
      {view === "match" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {enriched.map(({ person, comp }) => (
            <Card key={person.id} person={person} comp={comp} />
          ))}
        </div>
      )}

      {view === "saved" && (
        <div className="text-sm">No saved trips yet.</div>
      )}

      {view === "following" && (
        <div className="text-sm">Not following anyone yet.</div>
      )}

      {view === "suggestions" && (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p>Add "Udaipur" to your wishlist for more matches.</p>
          <p>Shift your trip by +2 days to increase compatibility.</p>
        </div>
      )}
    </div>
  );
}

