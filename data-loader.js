const BASE = `${window.location.origin}/Leave-of-Absence-Law-Finder/`;

export let allLaws = [];

// ------------------------------
// FEDERAL LAWS
// ------------------------------
export async function loadFederalLaws() {
  try {
    const res = await fetch(`${BASE}federal/laws.json`);
    if (!res.ok) throw new Error('Failed to load federal laws');

    const data = await res.json();

    // Accept BOTH formats:
    // 1. { "laws": [ ... ] }
    // 2. [ ... ]
    const laws = Array.isArray(data) ? data : data.laws || [];

    return laws.map(law => ({
      id: law.id,
      title: law.name,
      level: "Federal",
      state: "US",
      description: law.description,
      link: law.official_url,
      tags: law.tags || []
    }));
  } catch (e) {
    console.error("Federal law load failed:", e);
    return [];
  }
}

// ------------------------------
// STATE LAWS
// ------------------------------
export async function loadStateLaws(stateCode) {
  if (!stateCode) return [];

  try {
    const res = await fetch(`${BASE}states/${stateCode}/laws.json`);
    if (!res.ok) throw new Error(`Failed to load state laws for ${stateCode}`);

    const data = await res.json();

    // Accept BOTH formats:
    // 1. { "laws": [ ... ] }
    // 2. [ ... ]
    const laws = Array.isArray(data) ? data : data.laws || [];

    return laws.map(law => ({
      id: law.id,
      title: law.name,
      level: "State",
      state: stateCode,
      description: law.description,
      link: law.official_url,
      tags: law.tags || []
    }));
  } catch (e) {
    console.error(`State law load failed for ${stateCode}:`, e);
    return [];
  }
}
